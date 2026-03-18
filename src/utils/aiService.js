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

// utils/aiService.js
import Taro from '@tarojs/taro';

export const fetchAIInterpretation = async (prompt, onChunk, onError) => {
  const apiKey = process.env.TAROT_API_KEY;

  // 1. 检查 Key 是否拿到
  if (!apiKey || apiKey === "undefined") {
    onError("未检测到 API Key。请在 .env 中配置并重启 npm run dev");
    return;
  }

  // 2. 模拟 Promise，因为 Taro.request.enableChunked 是异步回调
  return new Promise((resolve, reject) => {
    const requestTask = Taro.request({
      url: 'https://api.deepseek.com/chat/completions', // 确认你的 baseUrl
      method: 'POST',
      header: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      data: {
        model: "deepseek-chat", // 确认你的模型名
        messages: [
          { role: "system", content: "你是一位精通易经的学者。" },
          { role: "user", content: prompt }
        ],
        stream: true
      },
      enableChunked: true,
      success: (res) => {
        if (res.statusCode !== 200) {
          onError(`接口返回错误: ${res.statusCode}`);
          reject();
        } else {
          resolve();
        }
      },
      fail: (err) => {
        onError(`网络请求失败: ${err.errMsg}`);
        reject(err);
      }
    });

    // 监听数据
    requestTask.onChunkReceived((res) => {
      const chunkStr = arrayBufferToString(res.data);
      const lines = chunkStr.split('\n');
      for (const line of lines) {
        if (line.trim().startsWith('data: ')) {
          const jsonStr = line.replace('data: ', '').trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const data = JSON.parse(jsonStr);
            const content = data.choices[0]?.delta?.content;
            if (content) onChunk(content);
          } catch (e) { }
        }
      }
    });
  });
};

// 比较稳健的解码函数
function arrayBufferToString(buffer) {
  try {
    // 尝试使用微信环境下的原生解码
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('utf-8').decode(buffer);
    }
    // 备选方案
    return decodeURIComponent(escape(String.fromCharCode.apply(null, new Uint8Array(buffer))));
  } catch (e) {
    return "";
  }
}