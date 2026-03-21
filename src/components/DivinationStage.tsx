import React from "react";
import { View } from "@tarojs/components";
import SingleCoin from "./SingleCoin";
import constants from "../data/constants.json";

// --- TypeScript 定义 ---
type ModeType = "manual" | "semi" | "full";
type StatusType = "idle" | "spinning" | "stopping" | "finished";

interface ModeTabsProps {
  selectedMode: ModeType;
  onSwitchMode: (mode: ModeType) => void;
  disabled: boolean;
}

interface ControlPanelProps {
  status: StatusType;
  selectedMode: ModeType;
  isAutoSequence: boolean;
  historyCount: number;
  onMainAction: () => void;
}

interface DivinationStageProps extends ControlPanelProps {
  coinRefs: any[];
  onSwitchMode: (mode: ModeType) => void;
  onStopComplete: (idx: number, res: string, rid: number) => void;
}

// 1. 模式组件
const ModeTabs: React.FC<ModeTabsProps> = ({
  selectedMode,
  onSwitchMode,
  disabled,
}) => {
  const modes: ModeType[] = ["manual", "semi", "full"];
  const { divination: t } = constants;

  return (
    <View className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 w-full">
      {modes.map((id) => (
        <View
          key={id}
          onClick={() => !disabled && onSwitchMode(id)}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all text-center flex items-center justify-center ${
            selectedMode === id
              ? "bg-slate-700 dark:bg-indigo-600 text-white shadow-md"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
          } ${disabled ? "opacity-50" : ""}`}
        >
          {t.modes[id]}
        </View>
      ))}
    </View>
  );
};

// 2. 控制面板组件
const ControlPanel: React.FC<ControlPanelProps> = ({
  status,
  selectedMode,
  isAutoSequence,
  historyCount,
  onMainAction,
}) => {
  const { divination: t } = constants;

  // 映射逻辑
  const config = {
    idle: {
      text: t.control.idle[selectedMode],
      color:
        "bg-green-500 active:bg-green-600 dark:bg-emerald-600 dark:active:bg-emerald-700",
    },
    spinning: {
      text:
        selectedMode === "manual"
          ? t.control.spinning.manual
          : t.control.spinning.auto,
      color:
        "bg-red-500 active:bg-red-600 dark:bg-rose-700 dark:active:bg-rose-800",
    },
    stopping: {
      text: t.control.stopping,
      color: "bg-gray-400 dark:bg-slate-700",
    },
    finished: {
      text: t.control.finished,
      color: "bg-slate-100 dark:bg-slate-800 !text-slate-400",
    },
  };

  const current = config[status];
  const isDisabled =
    status === "finished" ||
    status === "stopping" ||
    (selectedMode === "full" && isAutoSequence);

  // 处理自动排盘文本
  const btnText =
    isAutoSequence && status !== "finished"
      ? `${t.control.autoSequencePrefix} (${historyCount + 1}/6)`
      : current.text;

  return (
    <View className="w-full h-14">
      <View
        onClick={() => !isDisabled && onMainAction()}
        className={`w-full py-3 rounded-xl text-lg font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center ${current.color} ${
          isDisabled && status !== "finished" ? "opacity-80" : ""
        }`}
      >
        {btnText}
      </View>
    </View>
  );
};

// 3. 主舞台组件
const DivinationStage: React.FC<DivinationStageProps> = ({
  status,
  selectedMode,
  isAutoSequence,
  historyCount,
  coinRefs,
  onSwitchMode,
  onMainAction,
  onStopComplete,
}) => {
  const isLocked = status !== "idle" || isAutoSequence || historyCount > 0;

  return (
    <View className="w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 p-6 flex flex-col transition-all duration-500">
      <ModeTabs
        selectedMode={selectedMode}
        onSwitchMode={onSwitchMode}
        disabled={isLocked}
      />

      <View className="w-full py-8 flex flex-row flex-nowrap justify-center items-center gap-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
        {[0, 1, 2].map((i) => (
          // 直接渲染 SingleCoin，去掉外面的 View 包裹层
          <SingleCoin
            key={i} // 把 key 直接给 SingleCoin
            index={i}
            ref={coinRefs[i]}
            onStopComplete={onStopComplete}
          />
        ))}
      </View>

      <ControlPanel
        status={status}
        selectedMode={selectedMode}
        isAutoSequence={isAutoSequence}
        historyCount={historyCount}
        onMainAction={onMainAction}
      />
    </View>
  );
};

export default DivinationStage;
