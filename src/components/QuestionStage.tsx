import React from "react";
import { View, Textarea } from "@tarojs/components";
import constants from "../data/constants.json";

interface QuestionStageProps {
  question: string;
  setQuestion: (q: string) => void;
  onQuestionSubmit: (q: string) => void;
  isLocked: boolean;
  onRestart: () => void;
  isDarkMode: boolean;
}

const QuestionStage: React.FC<QuestionStageProps> = ({
  question,
  setQuestion,
  onQuestionSubmit,
  isLocked,
  onRestart,
  isDarkMode,
}) => {
  const { questionStage: t } = constants;

  const handleSubmit = () => {
    if (question.trim().length > 0) {
      onQuestionSubmit(question);
    }
  };

  const cardBgClass = isDarkMode
    ? "bg-slate-900/90 border-slate-800"
    : "bg-white/90 border-white/50";
  const textareaBgClass = isDarkMode
    ? "bg-slate-800 text-slate-200 border-slate-700"
    : "bg-white text-slate-800 border-slate-200";

  return (
    <View
      className={`w-full backdrop-blur rounded-2xl shadow-lg border p-6 transition-all duration-500 overflow-hidden ${cardBgClass}`}
    >
      {/* 1. 标题部分 */}
      <View
        className={`flex items-center gap-2 mb-4 border-b pb-2 ${isDarkMode ? "border-slate-800" : "border-gray-100"}`}
      >
        <View className="text-gray-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">
          {t.sectionTitle}
        </View>
      </View>

      {isLocked ? (
        /* 2. 锁定状态 */
        <View className="flex flex-col gap-4 animate-slideUp">
          <View
            className={`p-4 rounded-xl border ${isDarkMode ? "bg-indigo-900/20 border-indigo-900/30" : "bg-indigo-50 border-indigo-100"}`}
          >
            {/*<View className="text-gray-400 dark:text-slate-500 text-xs block mb-1 uppercase tracking-tighter">
              {t.askedTitle}
            </View>*/}
            <View
              className={`text-base font-medium ${isDarkMode ? "text-indigo-300" : "text-indigo-700"}`}
            >
              {question}
            </View>
          </View>

          <View
            onClick={onRestart}
            className={`w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all active:scale-95 border ${
              isDarkMode
                ? "text-indigo-400 bg-indigo-900/10 border-indigo-800/50"
                : "text-indigo-600 bg-indigo-50/50 border-indigo-200/50"
            }`}
          >
            <View className="text-lg">↺</View> {t.restartBtn}
          </View>
        </View>
      ) : (
        /* 3. 初始输入状态 */
        <View className="flex flex-col gap-6 animate-fadeIn">
          {/* 修改 1: Suggestions 字体从 text-[10px] 提升至 text-xs (12px) 或 text-sm (14px) */}
          <View className="flex flex-wrap gap-2">
            {t.suggestions.map((item) => (
              <View
                key={item}
                onClick={() => setQuestion(item)}
                className={`text-sm px-4 py-2 rounded-full border transition-all ${
                  isDarkMode
                    ? "border-slate-700 text-slate-400 bg-slate-800"
                    : "border-slate-100 text-slate-500 bg-slate-50"
                }`}
              >
                {item}
              </View>
            ))}
          </View>

          {/* 修改 2: Textarea 高度从 h-28 减小到 h-20 (约 80px) */}
          <Textarea
            className={`w-full block box-border h-20 p-4 rounded-xl border outline-none transition-all text-sm shadow-inner ${textareaBgClass}`}
            placeholder={t.placeholder}
            placeholderClass={isDarkMode ? "text-slate-600" : "text-slate-300"}
            value={question}
            onInput={(e) => setQuestion(e.detail.value)}
            fixed={false}
            disableDefaultPadding
          />

          <View
            onClick={handleSubmit}
            className={`
              w-full py-3 rounded-xl font-bold transition-all transform active:scale-95 flex items-center justify-center
              ${
                question.trim().length === 0
                  ? isDarkMode
                    ? "bg-slate-800 text-slate-600"
                    : "bg-slate-100 text-slate-300"
                  : "bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
              }
            `}
          >
            {t.submitBtn}
          </View>

          {/* 修改 3: 占卜说明字体增加 */}
          <View className="space-y-2">
            <View className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
              {t.processTitle}
            </View>
            <View
              className={`text-sm leading-relaxed italic opacity-80 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
            >
              {t.processDesc}
            </View>
          </View>

          {/* 修改 4: 占卜原则字体增加 */}
          <View
            className={`pt-4 border-t space-y-4 ${isDarkMode ? "border-slate-800" : "border-gray-100"}`}
          >
            <View className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest text-center">
              {t.ruleTitle}
            </View>
            <View className="flex justify-around items-center">
              {t.rules.map((rule) => (
                <View key={rule} className="flex flex-col items-center gap-1">
                  <View className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></View>
                  <View className="text-xs font-medium tracking-tighter text-gray-400 dark:text-slate-500">
                    {rule}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default QuestionStage;
