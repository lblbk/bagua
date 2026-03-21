import React, { useState } from "react";
import { View, Text } from "@tarojs/components";
import constants from "../data/constants.json";

const HistoryList = ({ history, isAutoSequence }: any) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { historyList: t } = constants;

  const getYaoName = (id: number) => {
    return t.yaoNames[id - 1] || `${id}爻`;
  };

  return (
    <View className="w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 p-4 transition-all duration-500 overflow-hidden">
      {/* 标题栏 */}
      <View
        className="flex justify-between items-center mb-2 border-b border-gray-100 dark:border-slate-700 pb-2 px-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <View className="flex items-center gap-2">
          <View className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest">
            {t.title} ({history.length}/6)
          </View>
          <View
            className={`text-gray-300 dark:text-gray-500 text-[10px] transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
          >
            ▼
          </View>
        </View>
        {isAutoSequence && history.length < 6 && (
          <Text className="text-xs text-orange-500 font-bold animate-pulse">
            {t.autoRunning}
          </Text>
        )}
      </View>

      {/* 列表主体 */}
      <View
        className={`
        flex flex-col gap-2 transition-all duration-500 ease-in-out origin-top
        ${isExpanded ? "h-auto opacity-100 mt-2" : "h-0 opacity-0 mt-0 overflow-hidden"}
      `}
      >
        {history.length === 0 ? (
          <View className="h-32 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 text-sm italic">
            <View>{t.emptyTip}</View>
          </View>
        ) : (
          history.map((record: any, index: number) => (
            <View
              key={record.id}
              className={`
                grid grid-cols-[50px_1fr_40px_20px_50px] items-center px-3 py-3 rounded-lg border transition-all gap-2
                ${
                  index === 0 && history.length < 6
                    ? "bg-indigo-50 border-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-800"
                    : "bg-white border-transparent dark:bg-slate-700/30 dark:border-slate-600/30"
                }
              `}
            >
              {/* 爻名 */}
              <View
                className={`font-mono text-xs ${index === 0 && history.length < 6 ? "text-indigo-400 dark:text-indigo-300" : "text-gray-300 dark:text-gray-500"}`}
              >
                {getYaoName(record.id)}
              </View>

              {/* 硬币结果 */}
              <View className="text-xs text-center tracking-widest opacity-60 dark:text-gray-400">
                {record.result}
              </View>

              {/* 卦画本体：直接使用 record.guaColor 配合行内样式渲染 */}
              <View
                className={`flex items-center justify-center h-4 w-full ${record.guaColor}`}
              >
                <View className="w-full h-full flex items-center justify-center opacity-90">
                  {record.guaType === "yang" ? (
                    <View className="w-full h-[3px] bg-current rounded-full"></View>
                  ) : (
                    <View className="w-full h-[3px] flex justify-between">
                      <View className="w-[40%] bg-current rounded-full"></View>
                      <View className="w-[40%] bg-current rounded-full"></View>
                    </View>
                  )}
                </View>
              </View>

              {/* 动爻标记 */}
              <View className="text-xs font-bold text-center text-gray-500 dark:text-gray-200">
                {record.guaMark || ""}
              </View>

              {/* 卦名 */}
              <View
                className={`text-xs font-bold text-right truncate ${index === 0 && history.length < 6 ? "text-indigo-600 dark:text-indigo-300" : "text-gray-400 dark:text-gray-500"}`}
              >
                {record.guaName}
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

export default HistoryList;
