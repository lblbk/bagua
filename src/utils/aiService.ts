import Taro from "@tarojs/taro";
import aiConfig from "../data/aiConfig.json";

class SafeUTF8Decoder {
  private buffer: Uint8Array = new Uint8Array(0);

  decode(chunk: ArrayBuffer): string {
    const newBytes = new Uint8Array(chunk);
    // 合并上次残留的字节和新字节
    const bytes = new Uint8Array(this.buffer.length + newBytes.length);
    bytes.set(this.buffer);
    bytes.set(newBytes, this.buffer.length);

    let out = "";
    let i = 0;
    const len = bytes.length;

    while (i < len) {
      const c = bytes[i];
      let bytesNeeded = 0;

      // 判断当前字符占用几个字节 (UTF-8 编码规则)
      if (c < 0x80) {
        bytesNeeded = 1;
      } else if ((c & 0xe0) === 0xc0) {
        bytesNeeded = 2;
      } else if ((c & 0xf0) === 0xe0) {
        bytesNeeded = 3; // 中文通常是 3 个字节
      } else if ((c & 0xf8) === 0xf0) {
        bytesNeeded = 4; // Emoji 通常是 4 个字节
      } else {
        // 非法字节，跳过
        i++;
        continue;
      }

      // 如果当前剩余字节不够拼出一个完整的字符，停止解析，将剩余字节留到下一次
      if (i + bytesNeeded > len) {
        break;
      }

      // 提取完整的字符
      if (bytesNeeded === 1) {
        out += String.fromCharCode(c);
      } else if (bytesNeeded === 2) {
        out += String.fromCharCode(((c & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
      } else if (bytesNeeded === 3) {
        out += String.fromCharCode(
          ((c & 0x0f) << 12) |
            ((bytes[i + 1] & 0x3f) << 6) |
            (bytes[i + 2] & 0x3f),
        );
      } else if (bytesNeeded === 4) {
        const u =
          (((c & 0x07) << 18) |
            ((bytes[i + 1] & 0x3f) << 12) |
            ((bytes[i + 2] & 0x3f) << 6) |
            (bytes[i + 3] & 0x3f)) -
          0x10000;
        out += String.fromCharCode(0xd800 | (u >> 10), 0xdc00 | (u & 0x3ff));
      }
      i += bytesNeeded;
    }

    // 保存截断的残余字节，等待下一个数据包拼接
    this.buffer = bytes.slice(i);
    return out;
  }
}

/**
 * 构建精细化的占卜 Prompt
 */
export const generateDivinationPrompt = ({
  question,
  finalGuaInfo,
  benDetail,
  zhiDetail,
  history,
}) => {
  // 1. 获取变爻索引 (history 是 [上爻...初爻]，需反转匹配明细中的 [初...上])
  const sortedHistory = [...history].reverse();
  const movingLines = sortedHistory
    .map((line, index) => (line.guaMark ? { index: index + 1, line } : null))
    .filter(Boolean);

  // 2. 构建变爻描述
  const movingLinesDetail = movingLines
    .map((m) => {
      const benYao = benDetail?.yaoCi[m.index - 1];
      const zhiYao = zhiDetail?.yaoCi[m.index - 1];
      return `第${m.index}爻变动：
    - 本卦爻辞：${benYao?.label} ${benYao?.content}
    - 之卦对应：${zhiYao?.label} ${zhiYao?.content}`;
    })
    .join("\n");

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
3. **字数限制**：总字数严控在 400-450 字之间，言简意赅，且最后不要回复总字数！

## 3. 回复模板 (请按此结构回复)

** 卦意：**
(此处请用一段话直接阐述该卦对用户问题的核心启示)

** 吉凶：**
(此处给出明确的趋势结论，指出是顺风顺水、还是需守成待机)

** 箴言：**
- 第一条建议 (针对现状的直接动作)
- 第二条建议 (心态或防范点)
- 第三条建议 (未来的观察点)
  `.trim();
};

export const fetchAIInterpretation = async (
  prompt: string,
  onChunk: (c: string) => void,
  onError: (e: string) => void,
) => {
  const { provider, modelKey } = aiConfig.defaultConfig;
  const config = aiConfig.providers[provider];
  const modelId = config.models[modelKey];
  const baseUrl = config.baseUrl;
  const workerUrl = aiConfig.workerUrl;

  // 1. 放弃系统的 TextDecoder，直接使用手写的安全解码器
  const decoder = new SafeUTF8Decoder();
  let remainder = "";

  const requestTask = Taro.request({
    url: workerUrl,
    method: "POST",
    header: {
      "Content-Type": "application/json",
    },
    data: {
      prompt: prompt,
      baseUrl: baseUrl,
      apiKeyEnv: config.apiKeyEnv,
      modelId: modelId,
    },
    enableChunked: true,
    success: (res) => {
      if (res.statusCode !== 200) {
        onError(`服务器错误: ${res.statusCode}`);
      }
    },
    fail: (err) => {
      onError(err.errMsg || "网络请求失败");
    },
  });

  // 2. 监听流式数据
  // @ts-ignore 因为 Taro 的类型定义可能不包含 onChunkReceived
  requestTask.onChunkReceived((res) => {
    try {
      // 通过我们手写的类，安全解码二进制流，不再抛出环境异常！
      const chunkStr = decoder.decode(res.data);

      const fullText = remainder + chunkStr;
      const lines = fullText.split("\n");

      remainder = lines.pop() || "";

      for (let line of lines) {
        line = line.trim();
        if (!line || line === "data: [DONE]") continue;

        if (line.startsWith("data: ")) {
          const dataStr = line.replace("data: ", "").trim();
          try {
            const data = JSON.parse(dataStr);
            const content = data.choices?.[0]?.delta?.content || "";
            if (content) onChunk(content);
          } catch (e) {
            remainder = line + "\n" + remainder;
          }
        }
      }
    } catch (err) {
      console.error("解析数据块失败", err);
    }
  });
};
