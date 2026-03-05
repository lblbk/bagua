import aiConfig from '../data/aiConfig.json';

/**
 * 构建精细化的占卜 Prompt
 */
export const generateDivinationPrompt = ({ question, finalGuaInfo, benDetail, zhiDetail, history }) => {
  // 1. 获取变爻索引 (history 是 [上爻...初爻]，需反转匹配明细中的 [初...上])
  const sortedHistory = [...history].reverse();
  const movingLines = sortedHistory
    .map((line, index) => (line.guaMark ? { index: index + 1, line } : null))
    .filter(Boolean);

  // 2. 构建变爻描述
  const movingLinesDetail = movingLines.map(m => {
    const benYao = benDetail?.yaoCi[m.index - 1];
    const zhiYao = zhiDetail?.yaoCi[m.index - 1];
    return `第${m.index}爻变动：
    - 本卦爻辞：${benYao?.label} ${benYao?.content}
    - 之卦对应：${zhiYao?.label} ${zhiYao?.content}`;
  }).join('\n');

  // 3. 组合最终 Prompt
  return `
# 易经六爻解卦请求

## 占卜上下文

1. 所求为何
${question || "未明确具体问题，请进行综合运势分析"}

2. 卦象基本信息
- 【本卦】：${finalGuaInfo.benGua.commonName} (${finalGuaInfo.benGua.name})
  - 卦辞：${benDetail?.guaCi || "无"}
  - 象曰：${benDetail?.xiangYue || "无"}
- 【之卦】：${finalGuaInfo.zhiGua ? `${finalGuaInfo.zhiGua.commonName} (${finalGuaInfo.zhiGua.name})` : "无变卦 (静卦)"}
  ${finalGuaInfo.zhiGua ? `- 之卦卦辞：${zhiDetail?.guaCi || "无"}` : ""}

3. 爻位变动分析
${movingLines.length > 0 ? movingLinesDetail : "此卦为静卦，无变爻，请重点分析本卦卦辞与象曰。"}

## 要求 (严格执行)
1. **语言风格**：直白易懂，沉稳理性有逻辑，充满理解和共情，像导师一样分析利弊提供方法论。
2. **结构化输出**：必须严格按照以下 Markdown 格式，且标题后必须带中文冒号“：”。
3. **字数限制**：总字数严控在 300-350 字之间，言简意赅。

## 3. 回复模板 (请按此结构回复)

**卦意：**
(此处请用一段话直接阐述该卦对用户问题的核心启示)

**吉凶：**
(此处给出明确的趋势结论，指出是顺风顺水、还是需守成待机)

**箴言：**
- 第一条建议 (针对现状的直接动作)
- 第二条建议 (心态或防范点)
- 第三条建议 (未来的观察点)
  `.trim();
};

export const fetchAIInterpretation = async (prompt, onChunk, onError) => {
  const { provider, modelKey } = aiConfig.defaultConfig;
  const config = aiConfig.providers[provider];
  const modelId = config.models[modelKey];
  const baseUrl = config.baseUrl;

  // --- 核心：自动判断当前环境 ---
  // 检查当前域名是否属于 Cloudflare (pages.dev 或你的自定义域名)
  const isCloudflare = 
    window.location.hostname.endsWith("pages.dev") || 
    window.location.hostname.endsWith("lblbk.top") ||
    window.location.hostname === "localhost"; // 本地开发时建议先用 Cloudflare 逻辑测试，或者根据需要调整

  // 1. 根据环境决定请求的 URL
  // Cloudflare 使用相对路径代理，GitHub Pages 使用完整的 API 地址
  const targetUrl = isCloudflare ? "/api/chat" : `${baseUrl}/chat/completions`;

  // 2. 根据环境准备 Headers
  const headers = { "Content-Type": "application/json" };
  if (!isCloudflare) {
    // 只有在 GitHub Pages 或非 Cloudflare 环境下，才在前端注入 API Key
    // 这样能保证 Cloudflare 环境下 API Key 依然是隐藏安全的
    const apiKey = import.meta.env[config.apiKeyEnv];
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  // 3. 根据环境准备 Body (适配你之前写的 chat.js 的参数名)
  const requestBody = isCloudflare 
    ? JSON.stringify({ prompt, modelId, baseUrl }) // 对应云函数的接收格式
    : JSON.stringify({                              // 对应火山引擎标准格式
        model: modelId,
        messages: [
          { role: "system", content: "你是一位精通易经六爻占卜的学者。请用庄重专业的语气，分段落给出详细的人生指引。" },
          { role: "user", content: prompt }
        ],
        stream: true
      });

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: headers,
      body: requestBody
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`请求失败: ${response.status} ${errorMsg}`);
    }

    // --- 后续流式处理逻辑保持不变 ---
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.replace('data: ', '').trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const data = JSON.parse(jsonStr);
            const content = data.choices[0]?.delta?.content;
            if (content) onChunk(content);
          } catch (e) { /* 解析错误 */ }
        }
      }
    }
  } catch (err) {
    onError(err.message);
  }
};