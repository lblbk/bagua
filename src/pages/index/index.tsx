import React, { useState, useRef, useEffect, useMemo } from "react";
import Taro, { useDidShow, useShareAppMessage } from "@tarojs/taro";
import { View } from "@tarojs/components";

import constants from "../../data/constants.json";
import { hexagramsMd } from "../../data/hexagrams";
import { parseHexagramMarkdown } from "../../utils/ParserMarkdown";
import { calculateYao, calculateFinalHexagram } from "../../utils/divination";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import QuestionStage from "../../components/QuestionStage";
import ConfirmModal from "../../components/ConfirmModal";
import DivinationStage from "../../components/DivinationStage";
import HistoryList from "../../components/HistoryList";
import GuaResultStage from "../../components/GuaResultStage";
import GuaDetailStage from "../../components/GuaDetailStage";
import GuaAIStage from "../../components/GuaAIStage";
import ToolBox from "../../components/ToolBox";

// --- TypeScript 接口定义 ---
interface HistoryRecord {
  id: number;
  result: string;
  guaName: string;
  guaType: string;
  guaMark: string;
  guaColor: string;
}

// 根据你的实际情况完善这些类型
type StatusType = "idle" | "spinning" | "stopping" | "finished";
type ModeType = "full" | "semi" | "manual";

export default function Index() {
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [isQuestionLocked, setIsQuestionLocked] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<ModeType>("full");
  const [status, setStatus] = useState<StatusType>("idle");
  const [isAutoSequence, setIsAutoSequence] = useState<boolean>(false);
  const [yangSetting, setYangSetting] = useState<"heads" | "tails">("heads");
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [finalGuaInfo, setFinalGuaInfo] = useState<any>(null);
  const [hexagramDetails, setHexagramDetails] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // 硬币组件的引用（你需要确保你的硬币组件在 Taro 中也暴露了这些方法）
  const coinRefs = useRef<any[]>([
    React.createRef(),
    React.createRef(),
    React.createRef(),
  ]);
  const activeRoundId = useRef<number>(0);
  const currentRoundResults = useRef<(string | null)[]>([null, null, null]);
  const completedCount = useRef<number>(0);
  const roundCounter = useRef<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const captureRef = useRef<any>(null);

  // 1. 同步微信原生 UI 颜色的函数
  const syncNativeTheme = (isDark: boolean) => {
    Taro.setNavigationBarColor({
      frontColor: isDark ? "#ffffff" : "#000000",
      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
      animation: { duration: 300, timingFunc: "easeInOut" },
    });
    Taro.setBackgroundColor({
      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
    });
  };

  // 2. 初始化与监听系统主题
  useEffect(() => {
    setHexagramDetails(parseHexagramMarkdown(hexagramsMd));

    const appBaseInfo = Taro.getAppBaseInfo();
    const initialDark = appBaseInfo.theme === "dark";
    setIsDarkMode(initialDark);
    syncNativeTheme(initialDark);

    // 监听系统主题变化
    const themeListener = (res: Taro.onThemeChange.CallbackResult) => {
      const isDark = res.theme === "dark";
      setIsDarkMode(isDark);
      syncNativeTheme(isDark);
    };

    Taro.onThemeChange(themeListener);

    return () => {
      Taro.offThemeChange(themeListener);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const { currentDetail, zhiDetail } = useMemo(() => {
    if (!finalGuaInfo) return { currentDetail: null, zhiDetail: null };
    const findD = (name: string) =>
      hexagramDetails.find((d) => d.title.includes(name));
    return {
      currentDetail: findD(finalGuaInfo.benGua.name),
      zhiDetail: finalGuaInfo.zhiGua ? findD(finalGuaInfo.zhiGua.name) : null,
    };
  }, [finalGuaInfo, hexagramDetails]);

  // 重构暗黑模式：小程序没有 document，需要通过外层 View 的 className 来控制
  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    Taro.setStorageSync("theme", next ? "dark" : "light");
  };

  const executeRestart = (clearAll = true) => {
    setHistory([]);
    setFinalGuaInfo(null);
    roundCounter.current = 1;
    setStatus("idle");
    setIsAutoSequence(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (clearAll) {
      setQuestion("");
      setIsQuestionLocked(false);
      setShowConfirm(false);
    }
  };

  const startRound = () => {
    if (history.length >= 6) return;
    setStatus("spinning");
    completedCount.current = 0;
    activeRoundId.current = Date.now();
    coinRefs.current.forEach((ref) =>
      ref.current?.startSpin(activeRoundId.current),
    );
    const d: Record<ModeType, number> = {
      manual: 8000,
      semi: 2000 + Math.random() * 1000,
      full: 1200,
    };
    timerRef.current = setTimeout(
      () => stopRound(selectedMode !== "manual"),
      d[selectedMode],
    );
  };

  const stopRound = (quick = false) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("stopping");
    coinRefs.current.forEach((ref) => ref.current?.stopSpin(quick));
  };

  const processRoundEnd = () => {
    const info = calculateYao(currentRoundResults.current, yangSetting);
    const newRecord: HistoryRecord = {
      id: roundCounter.current++,
      result: currentRoundResults.current.join(" "),
      guaName: info.name,
      guaType: info.type,
      guaMark: info.mark,
      guaColor: info.color,
    };

    setHistory((prev) => {
      const next = [newRecord, ...prev];
      if (next.length >= 6) {
        setStatus("finished");
        setIsAutoSequence(false);
        setFinalGuaInfo(calculateFinalHexagram(next));
      } else {
        setStatus("idle");
        if (selectedMode === "full" && isAutoSequence) {
          timerRef.current = setTimeout(startRound, 2000);
        }
      }
      return next;
    });
  };

  const handleCoinFinish = (idx: number, res: string, rid: number) => {
    if (rid !== activeRoundId.current) return;
    currentRoundResults.current[idx] = res;
    if (++completedCount.current === 3) processRoundEnd();
  };

  useShareAppMessage((res) => {
    const { toolBox: t } = constants;
    const guaName = finalGuaInfo?.benGua?.name || "";

    // 1. 防御性检查：如果 constants 还没加载好或者字段缺失，返回默认标题
    if (!t || !t.shareData) {
      return {
        title: t.copyHeader,
        path: "/pages/index/index",
      };
    }

    // 2. 如果已经占卜完成，显示带卦名的标题；否则显示默认标题
    const shareTitle = guaName
      ? t.shareData.title.replace("{guaName}", guaName)
      : t.shareData.defaultTitle;

    return {
      title: shareTitle,
      path: t.shareData.path,
      // imageUrl: '/assets/share-cover.png' // 可选：分享时的封面图
    };
  });

  return (
    /* 核心：动态绑定 dark 类名，满足 weapp-tailwindcss 的 class 模式 */
    <View className={isDarkMode ? "dark" : ""}>
      <View className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-500 pt-2 pb-10">
        <View
          ref={captureRef}
          className="w-full max-w-md px-4 flex flex-col items-center gap-4 mx-auto relative"
        >
          <Header
            yangSetting={yangSetting}
            toggleYangSetting={() =>
              (status === "idle" || status === "finished") &&
              setYangSetting((s) => (s === "heads" ? "tails" : "heads"))
            }
            disabled={status !== "idle" || isAutoSequence || history.length > 0}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />

          <QuestionStage
            question={question}
            setQuestion={setQuestion}
            isLocked={isQuestionLocked}
            onQuestionSubmit={(q: string) => {
              setQuestion(q);
              setIsQuestionLocked(true);
            }}
            onRestart={() =>
              isQuestionLocked ? setShowConfirm(true) : executeRestart(true)
            }
            isDarkMode={isDarkMode}
          />

          <ConfirmModal
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={() => executeRestart(true)}
          />

          {isQuestionLocked && (
            <View className="w-full flex flex-col gap-4 animate-fadeIn">
              <DivinationStage
                status={status}
                selectedMode={selectedMode}
                isAutoSequence={isAutoSequence}
                historyCount={history.length}
                coinRefs={coinRefs.current}
                onSwitchMode={(m: ModeType) => {
                  setSelectedMode(m);
                  executeRestart(false);
                }}
                onMainAction={() => {
                  if (status === "idle") {
                    if (selectedMode === "full") setIsAutoSequence(true);
                    startRound();
                  } else if (status === "spinning" && selectedMode === "manual")
                    stopRound();
                }}
                onStopComplete={handleCoinFinish}
              />
              <HistoryList history={history} isAutoSequence={isAutoSequence} />
              {finalGuaInfo && (
                <>
                  <GuaResultStage
                    history={history}
                    finalGuaInfo={finalGuaInfo}
                  />
                  <GuaDetailStage
                    detail={currentDetail}
                    zhiDetail={zhiDetail}
                    history={history}
                  />
                  <GuaAIStage
                    detail={currentDetail}
                    zhiDetail={zhiDetail}
                    history={history}
                    finalGuaInfo={finalGuaInfo}
                    question={question}
                  />
                  <ToolBox
                    finalGuaInfo={finalGuaInfo}
                    question={question}
                    detail={currentDetail} // 这里传入本卦详情
                    zhiDetail={zhiDetail} // 这里传入变卦详情
                    history={history} // 这里传入历史排盘记录
                  />
                </>
              )}
            </View>
          )}
          <Footer />
        </View>
      </View>
    </View>
  );
}
