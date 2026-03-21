import React, { useState } from "react";
import { View, Text } from "@tarojs/components";
import constants from "../data/constants.json";

interface GuaDetailStageProps {
  detail: any;
  zhiDetail: any;
  history: any[];
}

const GuaDetailStage: React.FC<GuaDetailStageProps> = ({
  detail,
  zhiDetail,
  history,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeGua, setActiveGua] = useState("ben");
  const { guaDetail: t } = constants;

  const currentDetail = activeGua === "ben" ? detail : zhiDetail;

  // 爻辞是从初爻开始的，所以需要倒序 history 来匹配
  const sortedHistory = [...history].reverse();
  const isLineMoving = (index: number) => {
    // 变卦（之卦）没有动爻
    if (activeGua !== "ben") return false;
    // 检查本卦对应的爻是否有动爻标记
    return !!sortedHistory[index]?.guaMark;
  };

  if (!detail) return null;

  return (
    <View className="w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 p-6 transition-all duration-500 overflow-hidden">
      <View
        className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-slate-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Text className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest whitespace-nowrap">
          {t.title}
        </Text>
        <Text
          className={`text-gray-300 dark:text-gray-600 text-[10px] transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
        >
          ▼
        </Text>
      </View>

      <View
        className={`transition-all duration-500 ease-in-out ${isExpanded ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
      >
        {zhiDetail && (
          <View className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-slate-900 rounded-lg">
            <View
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all text-center ${activeGua === "ben" ? "bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"}`}
              onClick={() => setActiveGua("ben")}
            >
              {t.benGuaTab}
            </View>
            <View
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all text-center ${activeGua === "zhi" ? "bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"}`}
              onClick={() => setActiveGua("zhi")}
            >
              {t.zhiGuaTab}
            </View>
          </View>
        )}

        <View className="space-y-6 text-gray-700 dark:text-gray-300">
          <View className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-l-4 border-indigo-400 dark:border-indigo-600 pl-3">
            {currentDetail.title}
          </View>

          <View>
            <Text className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">
              {t.sections.image}
            </Text>
            <Text className="text-lg font-mono bg-indigo-50/50 dark:bg-slate-900 p-3 rounded-lg border border-indigo-100 dark:border-slate-700 block">
              {currentDetail.image}
            </Text>
          </View>

          <View>
            <Text className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">
              {t.sections.guaCi}
            </Text>
            <Text className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg shadow-sm block">
              {currentDetail.guaCi}
            </Text>
          </View>

          <View>
            <Text className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">
              {t.sections.xiangYue}
            </Text>
            <Text className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 italic pl-3 border-l-2 border-indigo-200 dark:border-indigo-800 block">
              {currentDetail.xiangYue}
            </Text>
          </View>

          <View>
            <Text className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 block">
              {t.sections.yaoCi}
            </Text>
            <View className="grid gap-2">
              {currentDetail.yaoCi.map((item: any, i: number) => {
                const isMoving = isLineMoving(i);
                return (
                  <View
                    key={i}
                    className={`
                    text-xs leading-relaxed p-3 rounded-lg border transition-all duration-300
                    ${
                      isMoving
                        ? "bg-indigo-600 dark:bg-indigo-900 text-white shadow-lg shadow-indigo-200 dark:shadow-none border-indigo-700 dark:border-indigo-800 scale-[1.02]"
                        : "bg-indigo-50/30 dark:bg-slate-900 border-indigo-50 dark:border-slate-700 text-gray-600 dark:text-gray-400"
                    }
                  `}
                  >
                    <Text
                      className={`font-bold mr-2 ${isMoving ? "text-white" : "text-indigo-700 dark:text-indigo-400"}`}
                    >
                      {item.label}
                    </Text>
                    <Text className={isMoving ? "text-indigo-50" : ""}>
                      {item.content}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default GuaDetailStage;
