// src/index.ts

import { KVNamespace } from '@cloudflare/workers-types';

// 1. 更新 Env 类型定义
export interface Env {
  // 你的 AI API Keys，保持动态索引签名
  [key: string]: string | undefined;
  // 明确地为 KV Namespace 添加类型，这样 TypeScript 才能识别它
  SHARE_KV: KVNamespace;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // 允许 GET 请求
  "Access-Control-Allow-Headers": "Content-Type",
  "X-Content-Type-Options": "nosniff",
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 处理 CORS 预检请求
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 2. 引入 URL 路径路由
    const url = new URL(request.url);
    const pathname = url.pathname;

    try {
      // 根据路径分发到不同的处理函数
      if (pathname === '/ai' && request.method === 'POST') {
        return handleAiRequest(request, env);
      }
      if (pathname === '/share' && request.method === 'POST') {
        return handleCreateShare(request, env);
      }
      if (pathname.startsWith('/share/') && request.method === 'GET') {
        return handleGetShare(pathname, env);
      }

      // 如果没有匹配的路由，返回 404
      return new Response("Not Found", { status: 404, headers: corsHeaders });

    } catch (err: any) {
      return new Response(err.message, { status: 500, headers: corsHeaders });
    }
  }
};

/**
 * 处理 AI 代理请求 (你原有的逻辑)
 */
async function handleAiRequest(request: Request, env: Env): Promise<Response> {
  const { prompt, modelId, baseUrl, apiKeyEnv } = await request.json<any>();

  const allowedDomains = ["dashscope.aliyuncs.com", "ark.cn-beijing.volces.com"];
  if (!allowedDomains.some(d => baseUrl.includes(d))) {
    return new Response("Forbidden URL", { status: 403, headers: corsHeaders });
  }

  const apiKey = env[apiKeyEnv];
  if (!apiKey) {
    return new Response(`API Key for env var '${apiKeyEnv}' not found`, { status: 500, headers: corsHeaders });
  }

  const requestPayload: any = {
    model: modelId,
    messages: [
      { role: "system", content: "你是一位精通易经的学者。请按照要求给出结果。" },
      { role: "user", content: prompt }
    ],
    stream: true,
    temperature: 0.6
  };

  if (baseUrl.includes("volces.com")) {
    requestPayload.thinking = { type: "disabled" };
  }

  const aiResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestPayload),
  });

  return new Response(aiResponse.body, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}

/**
 * 处理创建分享记录的请求 (POST /share)
 */
async function handleCreateShare(request: Request, env: Env): Promise<Response> {
  // 从请求体中获取前端发来的卜卦数据
  const shareData = await request.json();

  // 验证数据 (可选，但推荐)
  if (!shareData || typeof shareData.question === 'undefined' || !shareData.finalGuaInfo) {
    return new Response("Invalid share data provided", { status: 400, headers: corsHeaders });
  }

  // 生成一个简短、唯一的 ID
  const hashId = crypto.randomUUID().replaceAll('-', '').slice(0, 8);

  // 将数据存入 KV。Key 是 hashId，Value 是卜卦数据的 JSON 字符串
  // 设置一个过期时间，例如 30 天，防止数据无限期存储
  const expirationTtl = 30 * 24 * 60 * 60; // 30 天的秒数
  await env.SHARE_KV.put(hashId, JSON.stringify(shareData), { expirationTtl });

  // 返回成功响应和生成的 hashId
  const responseBody = JSON.stringify({ success: true, hashId: hashId });
  return new Response(responseBody, {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}

/**
 * 处理获取分享记录的请求 (GET /share/:id)
 */
async function handleGetShare(pathname: string, env: Env): Promise<Response> {
  // 从路径中提取 ID，例如从 "/share/abcdef12" 中提取 "abcdef12"
  const hashId = pathname.split('/').pop();

  if (!hashId) {
    return new Response("Share ID is missing", { status: 400, headers: corsHeaders });
  }

  // 从 KV 中根据 ID 查询数据
  const shareDataString = await env.SHARE_KV.get(hashId);

  // 如果找不到数据，返回 404
  if (shareDataString === null) {
    return new Response("Share record not found or expired", { status: 404, headers: corsHeaders });
  }

  // 如果找到了，直接将存储的 JSON 字符串返回给前端
  return new Response(shareDataString, {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}