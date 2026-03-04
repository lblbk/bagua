// utils/aiservice.js

export const fetchAIInterpretation = async (prompt, onChunk, onError) => {
  try {
    const response = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_DASHSCOPE_API_KEY}`
      },
      body: JSON.stringify({
        model: "qwen3.5-plus",
        messages: [
          { role: "system", content: "你是一位精通易经六爻占卜的学者。请用庄重专业的语气，分段落给出详细的人生指引。" },
          { role: "user", content: prompt }
        ],
        stream: true
      })
    });

    if (!response.ok) throw new Error("网络请求失败");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.replace('data: ', '');
          if (jsonStr.trim() === '[DONE]') continue;
          
          try {
            const data = JSON.parse(jsonStr);
            const content = data.choices[0].delta.content;
            if (content) onChunk(content);
          } catch (e) {
            console.error("解析流式数据出错", e);
          }
        }
      }
    }
  } catch (err) {
    onError(err.message);
  }
};