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
1. **语言风格**：直白易懂，拒绝玄学堆砌，像老友对话一样给予建议。
2. **结构化输出**：必须严格按照以下 Markdown 格式，且标题后必须带中文冒号“：”。
3. **字数限制**：总字数严控在 200-250 字之间，言简意赅。

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

  try {
    // 【修改点】1：前端直接请求同一域名下的代理接口，不带域名就是同源，永不跨域！
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // 【修改点】2：把需要的参数传给后端，注意前端不再传递 apiKey
      body: JSON.stringify({
        prompt: prompt,
        modelId: modelId,
        baseUrl: baseUrl
      })
    });

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