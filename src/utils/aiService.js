import aiConfig from '../data/aiConfig.json';

/**
 * 构建精细化的占卜 Prompt
 */
export const generateDivinationPrompt = ({
    question, finalGuaInfo, benDetail, zhiDetail, history,
    previousRecord, prevBenDetail, prevZhiDetail, currentTimeContext
}) => {

    // 1. 解析本次变爻
    const sortedHistory = [...history].reverse();
    const movingLines = sortedHistory
        .map((line, index) => (line.guaMark ? { index: index + 1, line } : null))
        .filter(Boolean);

    const movingLinesDetail = movingLines.map(m => {
        const benYao = benDetail?.yaoCi[m.index - 1];
        const zhiYao = zhiDetail?.yaoCi[m.index - 1];
        return `第${m.index}爻变：
    - 本卦爻辞：${benYao?.label} ${benYao?.content}
    - 之卦爻辞：${zhiYao?.label} ${zhiYao?.content}`;
    }).join('\n');

    // ================= 历史卦象详细拼接 =================
    let previousGuaSection = "";
    let relationInstruction = "请结合当前节气时令，对本次卦象进行综合分析并给出建议。";

    if (previousRecord && previousRecord.finalGuaInfo) {
        const prevBenName = previousRecord.finalGuaInfo.benGua?.name || "未知";
        const prevZhiName = previousRecord.finalGuaInfo.zhiGua?.name || "无";

        // 解析历史变爻序号与爻辞
        const prevSortedHistory = [...previousRecord.history].reverse();
        const prevMovingLines = prevSortedHistory
            .map((line, index) => (line.guaMark ? { index: index + 1, line } : null))
            .filter(Boolean);

        let prevMovingText = "此卦为静卦，无变爻。";
        if (prevMovingLines.length > 0) {
            prevMovingText = prevMovingLines.map(m => {
                const pBenYao = prevBenDetail?.yaoCi[m.index - 1];
                return `第${m.index}爻变 (${pBenYao?.label || ''}：${pBenYao?.content || '未知'})`;
            }).join('\n    ');
        }

        previousGuaSection = `
## 历史占卜
- 【本卦】：${prevBenName}
  - 卦辞：${prevBenDetail?.guaCi || "无"}
  - 象曰：${prevBenDetail?.xiangYue || "无"}
- 【之卦】：${prevZhiName}
  - 卦辞：${prevZhiDetail?.guaCi || "无"}
  - 象曰：${prevZhiDetail?.xiangYue || "无"}
- 【变爻】：
    ${prevMovingText}
`;
        // 动态调整分析指令
        relationInstruction = "由于用户对同一问题有过历史占卜，请结合当前的“起卦时间（时令旺衰）”与“上次占卜”的结果。对比新旧卦象的演变轨迹（如境遇是否好转、阻力是否增加、核心矛盾是否转移），进行多维度的综合推演，并给出针对性建议。";
    }

    // ================= 最终 Prompt 组装 =================
    return `
# 金钱摇卦

## 所求为何
- ${question || "未明确具体问题，请进行综合运势分析"}

## 卜卦详情

1. 起卦时间
- 时辰与农历：${currentTimeContext || "未知"}

2. 本次卦象信息
- 【本卦】：${finalGuaInfo.benGua.commonName} (${finalGuaInfo.benGua.name})
  - 卦辞：${benDetail?.guaCi || "无"}
  - 象曰：${benDetail?.xiangYue || "无"}
- 【之卦】：${finalGuaInfo.zhiGua ? `${finalGuaInfo.zhiGua.commonName} (${finalGuaInfo.zhiGua.name})` : "无变卦 (静卦)"}
  ${finalGuaInfo.zhiGua ? `- 之卦卦辞：${zhiDetail?.guaCi || "无"}` : ""}
  ${finalGuaInfo.zhiGua ? `- 之卦象曰：${zhiDetail?.xiangYue || "无"}` : ""}

3. 本次爻位变动分析
${movingLines.length > 0 ? movingLinesDetail : "此卦为静卦，无变爻，请重点分析本卦卦辞与象曰。"}
${previousGuaSection}

## 要求 (严格执行)
1. **语言风格**：直白易懂，沉稳理性有逻辑，充满理解和共情，像导师一样分析利弊提供方法论。
2. **分析策略**：${relationInstruction} （可适当运用阴阳五行或节气的自然哲学解释）
3. **结构化输出**：必须严格按照以下 Markdown 格式，且标题后必须带中文冒号“：”。
4. **字数限制**：总字数严控在 500-600 字之间，言简意赅。

## 回复模板 (请按此结构回复)

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