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
3. **字数限制**：总字数严控在 500-550 字之间，言简意赅。

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
    const workerUrl = aiConfig.workerUrl;

    try {
        const response = await fetch(workerUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                prompt: prompt,
                baseUrl: baseUrl,
                apiKeyEnv: config.apiKeyEnv,
                modelId: modelId 
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`请求失败: ${response.status} ${errorText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        
        // --- 核心改进：残余字符串缓冲区 ---
        let remainder = ""; 

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // 将新收到的碎片与上次剩下的碎片拼接
            const chunk = remainder + decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            // 最后一行可能是不完整的，存入 remainder 等下次处理
            remainder = lines.pop(); 

            for (let line of lines) {
                line = line.trim();
                if (!line || line === 'data: [DONE]') continue;

                if (line.startsWith('data: ')) {
                    const dataStr = line.replace('data: ', '').trim();
                    try {
                        const data = JSON.parse(dataStr);
                        // 兼容不同平台的返回结构 (choices[0].delta.content)
                        const content = data.choices[0]?.delta?.content || "";
                        if (content) onChunk(content);
                    } catch (e) {
                        // 如果还是解析失败，说明这一行数据有问题，记录但不中断
                        console.warn("解析单行 JSON 失败，已跳过:", line);
                    }
                }
            }
        }
    } catch (err) {
        console.error("fetchAIInterpretation 错误:", err);
        onError(err.message);
    }
};