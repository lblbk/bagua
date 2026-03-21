import React from "react";
import Taro from "@tarojs/taro";
import { View, Text, Button } from "@tarojs/components";
import constants from "../data/constants.json";

interface ToolBoxProps {
  finalGuaInfo: any;
  question: string;
  detail: any; // 对应 Index 中的 currentDetail
  zhiDetail: any; // 对应 Index 中的 zhiDetail
  history: any[];
}

const ToolBox: React.FC<ToolBoxProps> = ({
  finalGuaInfo,
  question,
  detail,
  zhiDetail,
  history,
}) => {
  const { toolBox: t } = constants;

  // 1. 详尽复制功能
  const handleCopy = () => {
    // 检查本卦详情是否存在，避免 undefined
    if (!detail) {
      Taro.showToast({ title: "暂无卦象数据", icon: "none" });
      return;
    }

    let text = `${t.copyHeader}\n`;
    text += `${t.copyQuestion}${question || "心中默想"}\n\n`;

    // --- 本卦部分 ---
    // 直接从 detail 对象获取解析后的文本
    text += `【${t.copyBenGua}】${detail.title}\n`;
    text += `卦象：${detail.image || "无"}\n`;
    text += `卦辞：${detail.guaCi || "无"}\n\n`;

    // --- 动爻及爻辞部分 ---
    const movingYaos = history
      .filter((record) => !!record.guaMark)
      .reverse() // 卦是从初爻向上排，但 history 可能是反的，这里确保顺序逻辑正确
      .map((record) => {
        // detail.yaoCi 是数组，0对应初爻，5对应上爻
        // record.id 是 1-6
        const yaoIndex = record.id - 1;
        const yaoDetail = detail.yaoCi[yaoIndex];
        if (yaoDetail) {
          return `- [${record.guaMark}] ${yaoDetail.label}：${yaoDetail.content}`;
        }
        return null;
      })
      .filter(Boolean);

    if (movingYaos.length > 0) {
      text += `${t.copyMovingYao}\n${movingYaos.join("\n")}\n\n`;
    }

    // --- 变卦部分 ---
    if (zhiDetail) {
      text += `【${t.copyZhiGua}】${zhiDetail.title}\n`;
      text += `卦象：${zhiDetail.image || "无"}\n`;
      text += `卦辞：${zhiDetail.guaCi || "无"}\n`;
    }

    text += t.copyFooter;

    Taro.setClipboardData({
      data: text,
      success: () => {
        // Taro 会自动弹出系统提示，这里不需要重复 showToast
      },
    });
  };

  // 2. 留影功能
  const handleSnapshot = () => {
    Taro.showToast({ title: t.notDeveloped, icon: "none" });
  };

  return (
    <View className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 dark:border-slate-800 p-6 mb-10 transition-all duration-500">
      <View className="flex flex-row items-center gap-2 mb-6 pb-2 border-b border-gray-100 dark:border-slate-800">
        <View className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
        <Text className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest flex-1">
          {t.title}
        </Text>
      </View>

      <View className="flex flex-row justify-around items-center">
        {/* 复制 */}
        <View
          onClick={handleCopy}
          className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
        >
          <View className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-xl border border-indigo-100/50 dark:border-indigo-800/30">
            📋
          </View>
          <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-widest">
            {t.btns.copy}
          </Text>
        </View>

        {/* 分享 */}
        <Button
          openType="share"
          className="m-0 p-0 bg-transparent border-none leading-normal flex flex-col items-center gap-2 active:scale-95 transition-transform after:border-none"
        >
          <View className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-xl border border-emerald-100/50 dark:border-emerald-800/30">
            🧧
          </View>
          <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-widest">
            {t.btns.share}
          </Text>
        </Button>

        {/* 留影 */}
        <View
          onClick={handleSnapshot}
          className="flex flex-col items-center gap-2 active:scale-95 transition-transform opacity-40"
        >
          <View className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-xl border border-slate-100 dark:border-slate-700">
            📸
          </View>
          <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-widest">
            {t.btns.snapshot}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ToolBox;
