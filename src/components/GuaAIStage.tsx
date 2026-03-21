import React, { useState } from "react";
import { View, Text } from "@tarojs/components";
import constants from "../data/constants.json";
// 确保路径正确
import {
  fetchAIInterpretation,
  generateDivinationPrompt,
} from "../utils/aiService";

// --- SimpleMarkdown 和 QuoteFooter 组件保持不变 ---
// ... (此处省略，使用你原来的代码)
const SimpleMarkdown = ({ text }: { text: string }) => {
  if (!text) return null;

  // 1. 行内样式处理：处理 **加粗** 和 特殊标题样式
  const renderInline = (lineText: string) => {
    // 正则匹配 **内容**
    const parts = lineText.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const content = part.slice(2, -2);
        // 如果加粗内容包含冒号，渲染为带边框的区块标题
        if (content.includes("：") || content.includes(":")) {
          return (
            <Text
              key={index}
              className="block mt-4 mb-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm border-l-2 border-indigo-500 pl-2 tracking-wide"
            >
              {content}
            </Text>
          );
        }
        // 普通加粗
        return (
          <Text
            key={index}
            className="text-indigo-600 dark:text-indigo-300 font-bold"
          >
            {content}
          </Text>
        );
      }
      // 普通文本
      return <Text key={index}>{part}</Text>;
    });
  };

  // 2. 块级处理：逐行扫描
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentListItems: string[] = [];

  // 辅助函数：将收集到的列表项压入 elements
  const pushList = (key: number) => {
    if (currentListItems.length > 0) {
      elements.push(
        <View key={`list-${key}`} className="flex flex-col gap-2 my-2">
          {currentListItems.map((item, i) => (
            <View key={i} className="flex flex-row gap-2 text-xs items-start">
              <Text className="text-indigo-400 mt-1 flex-shrink-0 text-[10px]">
                ●
              </Text>
              <View className="flex-1 leading-relaxed text-slate-600 dark:text-slate-300">
                {renderInline(item)}
              </View>
            </View>
          ))}
        </View>,
      );
      currentListItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // 判断是否为无序列表行 (支持 - 或 *)
    const listMatch = trimmedLine.match(/^[-*]\s+(.*)/);

    if (listMatch) {
      // 如果是列表行，先存进临时数组
      currentListItems.push(listMatch[1]);
    } else {
      // 如果不是列表行，先结算之前累积的列表
      pushList(index);

      if (trimmedLine) {
        // 普通段落
        elements.push(
          <View
            key={`p-${index}`}
            className="leading-relaxed text-xs text-slate-600 dark:text-slate-300 break-words mb-2"
          >
            {renderInline(trimmedLine)}
          </View>,
        );
      }
    }
  });

  // 最后结算一次（防止文本以列表结尾）
  pushList(lines.length);

  return <View className="flex flex-col">{elements}</View>;
};
const QuoteFooter = () => {
  const { guaAI: t } = constants;
  return (
    <View className="mt-8 pt-4 border-t border-indigo-100/30 dark:border-slate-800 flex flex-col items-center gap-2 animate-fadeIn">
      <View className="flex flex-row gap-1.5 mb-1">
        {[1, 0.6, 0.3].map((opacity, i) => (
          <View
            key={i}
            className="w-0.5 h-0.5 bg-indigo-400 rounded-full"
            style={{ opacity }}
          />
        ))}
      </View>
      <Text className="text-xs text-slate-400 dark:text-slate-500 tracking-[0.2em] font-medium italic">
        {t.footerQuote}
      </Text>
      <Text className="text-xs text-slate-300 dark:text-slate-600 tracking-tighter">
        {t.footerSource}
      </Text>
    </View>
  );
};

// ... 其他 import 保持不变 ...

const GuaAIStage = ({
  detail,
  zhiDetail,
  history,
  finalGuaInfo,
  question,
}: any) => {
  const [interp, setInterp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  const { guaAI: t } = constants;

  const handleInterpret = async () => {
    if (loading) return;
    setHasStarted(true);
    setLoading(true);
    setError(null);
    setInterp("");

    const MIN_LOADING_TIME = 1000;
    const startTime = Date.now();

    try {
      const prompt = generateDivinationPrompt({
        question,
        finalGuaInfo,
        benDetail: detail,
        zhiDetail,
        history,
      });

      await fetchAIInterpretation(
        prompt,
        (chunk: string) => setInterp((prev) => prev + chunk),
        (err: string) => setError(err || t.errorDefault),
      );
    } catch (err) {
      setError(t.errorService);
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = MIN_LOADING_TIME - elapsedTime;
      setTimeout(
        () => {
          setLoading(false);
        },
        Math.max(0, remainingTime),
      );
    }
  };

  const renderContent = () => {
    // 情况 A: 显示结果 (一旦有了 AI 返回的内容)
    if (interp) {
      return (
        <View className="relative animate-fadeIn">
          <View
            className={`p-5 rounded-2xl border transition-colors duration-500 bg-gradient-to-b from-indigo-50/20 to-transparent dark:from-indigo-950/10 ${loading ? "border-indigo-200 animate-pulse" : "border-indigo-100 dark:border-slate-800"}`}
          >
            <View className="prose prose-sm max-w-none prose-indigo">
              <SimpleMarkdown text={interp} />
              {loading && (
                <View className="inline-block w-1 h-3 ml-1 bg-indigo-500/50 animate-bounce align-middle"></View>
              )}
            </View>
          </View>
          {loading && (
            <View className="flex flex-row justify-center items-center gap-2 mt-4 text-[10px] text-indigo-400 italic">
              <Text className="animate-spin">⚙</Text>
              <Text>{t.loadingTip}</Text>
            </View>
          )}
          {!loading && <QuoteFooter />}
        </View>
      );
    }

    // 情况 B: 初始状态 或 刚刚点击后的 800ms 等待期
    // 这两者共享 ✨ 和 introQuote，确保位置不动
    if (!interp && (loading || !hasStarted)) {
      return (
        <View className="py-8 flex flex-col items-center justify-center animate-fadeIn">
          {/* 上半部分保持不动 */}
          <View className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4 text-2xl">
            ✨
          </View>
          <View className="mb-6 px-6 text-center">
            <Text className="text-xs text-slate-400 dark:text-slate-500 italic leading-relaxed">
              {t.introQuote}
            </Text>
          </View>

          {/* 下半部分：按钮与加载圆点的切换 */}
          <View className="h-12 flex items-center justify-center">
            {!hasStarted ? (
              // 初始按钮
              <View
                onClick={handleInterpret}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all text-sm flex items-center justify-center"
              >
                <Text className="text-base">{t.btnText}</Text>
              </View>
            ) : (
              // 点击后的加载动画：三色圆点 (红、蓝、黄)
              <View className="flex flex-row gap-3 items-center py-4">
                <View
                  className="w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0s" }}
                />
                <View
                  className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                <View
                  className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                />
              </View>
            )}
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-3xl shadow-xl border border-white/50 dark:border-slate-800 p-6 overflow-hidden transition-all duration-500">
      {/* 标题栏 */}
      <View
        className="flex flex-row items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-slate-800"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <View className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
        <Text className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest flex-1">
          {t.title}
        </Text>
        <Text
          className={`text-gray-300 text-[10px] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
        >
          ▼
        </Text>
      </View>

      <View
        className={`transition-all duration-500 ${isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        {renderContent()}

        {error && (
          <View className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-500/10 text-center animate-fadeIn">
            <Text className="font-bold">⚠️ 解析出错</Text>
            <Text className="block mt-1 text-slate-500">{error}</Text>
            {/* 错误时显示一个重试文字提示 */}
            <Text
              onClick={() => {
                setHasStarted(false);
                setError(null);
              }}
              className="mt-2 text-indigo-500 underline block"
            >
              点击重试
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default GuaAIStage;
