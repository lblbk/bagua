// src/index.ts

// 定义环境变量的类型
export interface Env {
  [key: string]: string; // 如果你坚持用动态传入 env 键名，取消注释这行
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "X-Content-Type-Options": "nosniff",
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 1. 处理 CORS 预检请求
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 2. 限制请求方法 (建议增加)
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    try {
      const { prompt, modelId, baseUrl, apiKeyEnv } = await request.json<any>();

      // 安全校验：只允许发给阿里和火山
      const allowedDomains = ["dashscope.aliyuncs.com", "ark.cn-beijing.volces.com"];
      if (!allowedDomains.some(d => baseUrl.includes(d))) {
        return new Response("Forbidden URL", { status: 403, headers: corsHeaders });
      }

      // 注意：从客户端接收 apiKeyEnv 存在安全风险，建议后续改为后端根据 baseUrl 自动判断使用哪个 Key
      // 这里暂时保留你原有的逻辑
      const apiKey = (env as any)[apiKeyEnv]; 
      
      if (!apiKey) {
        return new Response("API Key not found in environment", { status: 500, headers: corsHeaders });
      }

      // 构建请求体
      const requestPayload: any = {
        model: modelId,
        messages: [
          { role: "system", content: "你是一位精通易经的学者。请按照要求给出结果。" },
          { role: "user", content: prompt }
        ],
        stream: true,
        temperature: 0.6
      };

      // 火山引擎特化处理
      if (baseUrl.includes("volces.com")) {
        requestPayload.thinking = { type: "disabled" };
      }

      // 发起请求
      const aiResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      // 透传大模型的流式响应
      return new Response(aiResponse.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache",
          "X-Accel-Buffering": "no",
        },
      });

    } catch (err: any) {
      return new Response(err.message, { status: 500, headers: corsHeaders });
    }
  }
};