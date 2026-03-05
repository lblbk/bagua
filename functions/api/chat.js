// /functions/api/chat.js
export async function onRequestPost(context) {
  try {
    // 1. 获取前端传过来的参数
    const request = context.request;
    const { prompt, modelId, baseUrl } = await request.json();

    // 2. 从 Cloudflare 环境变量中安全获取 API Key
    // 注意：这里不要明文写 Key，我们在 Cloudflare 后台配置
    const apiKey = context.env.VITE_VOLCENGINE_API_KEY; 
    // console.log(`Debug Key: Prefix=${apiKey?.substring(0, 8)}, Length=${apiKey?.length}`);

    // 3. 由云函数向火山引擎发起真实请求 (服务器到服务器，没有跨域限制！)
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "system", content: "你是一位精通易经六爻占卜的学者。请用庄重专业的语气，分段落给出详细的人生指引。" },
          { role: "user", content: prompt }
        ],
        stream: true // 开启流式输出
      })
    });

    // 4. 将火山引擎的流式响应直接透传回前端
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}