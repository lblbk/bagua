import React, { useState } from "react";
import { View, Text } from "@tarojs/components";
import constants from "../data/constants.json";

// 这是一个纯粹的视觉组件，只负责画出爻线本身
const LineVisual = ({ type, color }: any) => (
  <View
    className={`
      relative w-full h-full rounded-md
      ${type === "yang" ? color : "flex justify-between w-full"}
    `}
  >
    {type === "yin" ? (
      <>
        <View className={`w-[45%] h-full rounded-md ${color}`}></View>
        <View className={`w-[45%] h-full rounded-md ${color}`}></View>
      </>
    ) : (
      <View className={`w-full h-full rounded-md ${color}`}></View>
    )}
  </View>
);

const YaoLine = ({ type, isMoving, mark, isZhiGua }: any) => {
  const color = type === "yang" ? "bg-red-500" : "bg-blue-600";

  // --- 变卦 (ZhiGua) 渲染路径 ---
  if (isZhiGua) {
    return (
      <View className="w-full h-7 flex justify-center items-center">
        {/* 修改点 1：将变卦的爻线宽度从 w-20 增加到 w-24，以匹配变长后的本卦 */}
        <View className="w-24 h-3">
          <LineVisual type={type} color={color} />
        </View>
      </View>
    );
  }

  // --- 本卦 (BenGua) 渲染路径 ---
  const shouldShowMark = isMoving;

  return (
    <View className="w-full h-7 flex flex-row items-center">
      <View className="flex-1 h-3">
        <LineVisual type={type} color={color} />
      </View>

      {/* 修改点 2：缩小标记容器，从 w-6 ml-1 变为 w-4 ml-1 */}
      <View className="w-4 flex items-center justify-center ml-1">
        {shouldShowMark && (
          // 修改点 3：缩小标记的字体大小，从 text-lg font-black 变为 text-base font-bold
          <Text
            className={`text-base font-bold animate-pulse ${
              type === "yang" ? "text-red-500" : "text-blue-600"
            }`}
          >
            {mark}
          </Text>
        )}
      </View>
    </View>
  );
};

const HexagramVisualizer = ({ history, isZhiGua = false, info }: any) => {
  if (!info) return null;
  const t = constants.guaResult;

  return (
    <View className="flex flex-col items-center gap-2">
      <View className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-[0.2em] w-full text-left">
        {info.commonName.split(" ")[0]}
        <Text className="text-xs text-gray-400 dark:text-gray-500 ml-2 font-normal">
          {isZhiGua ? t.zhiGuaLabel : t.benGuaLabel}
        </Text>
      </View>

      <View className="flex flex-col gap-1 w-32 px-2 py-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
        {history.map((record: any) => {
          let isMoving = !!record.guaMark;
          let type = record.guaType;
          if (isZhiGua && isMoving) type = type === "yang" ? "yin" : "yang";
          return (
            <YaoLine
              key={record.id}
              type={type}
              isMoving={isMoving}
              mark={record.guaMark}
              isZhiGua={isZhiGua}
            />
          );
        })}
      </View>
    </View>
  );
};

// GuaResultStage 组件保持不变
const GuaResultStage = ({ history, finalGuaInfo }: any) => {
  // ... (此部分代码无需任何修改)
  const [isExpanded, setIsExpanded] = useState(true);
  const t = constants.guaResult;

  if (!finalGuaInfo) return null;

  const renderDescription = () => {
    if (finalGuaInfo.zhiGua) {
      const parts = t.withChangeYao.split(/\{benName\}|\{zhiName\}/);
      return (
        <Text>
          {parts[0]}
          <Text className="text-indigo-600 dark:text-indigo-400 font-bold">
            {finalGuaInfo.benGua.name}
          </Text>
          {parts[1]}
          <Text className="text-rose-600 dark:text-rose-400 font-bold">
            {finalGuaInfo.zhiGua.name}
          </Text>
          {parts[2]}
        </Text>
      );
    } else {
      const parts = t.noChangeYao.split(/\{name\}/);
      return (
        <Text>
          {parts[0]}
          <Text className="text-indigo-600 dark:text-indigo-400 font-bold">
            {finalGuaInfo.benGua.name}
          </Text>
          {parts[1]}
        </Text>
      );
    }
  };

  return (
    <View className="w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 p-4 transition-all duration-500 overflow-hidden">
      <View
        className="flex items-center gap-2 mb-2 pb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Text className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest">
          {t.title}
        </Text>
        <Text
          className={`text-gray-300 dark:text-gray-600 text-[10px] transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
        >
          ▼
        </Text>
      </View>

      <View
        className={`transition-all duration-500 ease-in-out ${isExpanded ? "opacity-100 mt-2" : "max-h-0 opacity-0 overflow-hidden"}`}
      >
        <View className="flex flex-row items-center justify-center gap-4 w-full">
          <HexagramVisualizer
            history={history}
            info={finalGuaInfo.benGua}
            isZhiGua={false}
          />
          {finalGuaInfo.zhiGua && (
            <>
              <View className="text-gray-300 dark:text-gray-600 text-xl font-bold">
                →
              </View>
              <HexagramVisualizer
                history={history}
                info={finalGuaInfo.zhiGua}
                isZhiGua={true}
              />
            </>
          )}
        </View>

        <View className="mt-6 text-center border-t border-gray-100 dark:border-slate-700 pt-4">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {renderDescription()}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default GuaResultStage;
