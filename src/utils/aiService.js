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

## 1. 所求为何
${question || "未明确具体问题，请进行综合运势分析"}

## 2. 卦象基本信息
- 【本卦】：${finalGuaInfo.benGua.commonName} (${finalGuaInfo.benGua.name})
  - 卦辞：${benDetail?.guaCi || "无"}
  - 象曰：${benDetail?.xiangYue || "无"}
- 【之卦】：${finalGuaInfo.zhiGua ? `${finalGuaInfo.zhiGua.commonName} (${finalGuaInfo.zhiGua.name})` : "无变卦 (静卦)"}
  ${finalGuaInfo.zhiGua ? `- 之卦卦辞：${zhiDetail?.guaCi || "无"}` : ""}

## 3. 爻位变动分析
${movingLines.length > 0 ? movingLinesDetail : "此卦为静卦，无变爻，请重点分析本卦卦辞与象曰。"}

## 要求 (严格执行)
1. **禁止**废话、**禁止**客套、**禁止**重复问题。
2. 总字数控制在 **200字以内**。
3. 必须使用 Markdown 格式，结构如下：
   - 核心卦意 (一句话)
   - 吉凶判断 (简短结论)
   - 关键建议 (2-3个要点)
  `.trim();
};

export const fetchAIInterpretation = async (prompt, onChunk, onError) => {
  // 1. 获取当前使用的提供商和模型 key
  const { provider, modelKey } = aiConfig.defaultConfig;
  const config = aiConfig.providers[provider];
  
  // 2. 动态获取 apiKey
  const apiKey = import.meta.env[config.apiKeyEnv];
  // 3. 动态获取模型 ID
  const modelId = config.models[modelKey];

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
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
        stream: true
      })
    });

    // ... 后续流式处理逻辑保持不变 ...
    if (!response.ok) throw new Error("API 请求失败");

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