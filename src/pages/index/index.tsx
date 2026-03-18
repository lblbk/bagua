import React, { useState, useRef, useEffect, useMemo } from "react";
import Taro from "@tarojs/taro";
import { View } from "@tarojs/components";

// 注意：Taro (Webpack) 默认不支持 ?raw 导入。
// 建议：将 hexagrams.md 的内容作为一个字符串导出到 hexagrams.ts 中，例如：
// export const hexagramsMd = `...你的 markdown 内容...`;
import hexagramsMd from "../../data/hexagrams.md?raw";
import { parseHexagramMarkdown } from "../../utils/ParserMarkdown";
import { calculateYao, calculateFinalHexagram } from "../../utils/divination";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
// import QuestionStage from "../../components/QuestionStage";
// import DivinationStage from "../../components/DivinationStage";
// import HistoryList from "../../components/HistoryList";
// import GuaResultStage from "../../components/GuaResultStage";
// import GuaDetailStage from "../../components/GuaDetailStage";
// import GuaAIStage from "../../components/GuaAIStage";
// import ToolBox from "../../components/ToolBox";
// import ConfirmModal from "../../components/ConfirmModal";

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

  useEffect(() => {
    setHexagramDetails(parseHexagramMarkdown(hexagramsMd));
    // 替换 localStorage 为 Taro API
    const theme = Taro.getStorageSync("theme");
    const isDark = theme === "dark";
    setIsDarkMode(isDark);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // const { currentDetail, zhiDetail } = useMemo(() => {
  //   if (!finalGuaInfo) return { currentDetail: null, zhiDetail: null };
  //   const findD = (name: string) =>
  //     hexagramDetails.find((d) => d.title.includes(name));
  //   return {
  //     currentDetail: findD(finalGuaInfo.benGua.name),
  //     zhiDetail: finalGuaInfo.zhiGua ? findD(finalGuaInfo.zhiGua.name) : null,
  //   };
  // }, [finalGuaInfo, hexagramDetails]);

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

  return (
    /* 小程序暗黑模式：通过在外层包裹一个带 'dark' 类的 View 来触发 Tailwind 的 dark: 前缀 */
    <View className={`${isDarkMode ? "dark" : ""}`}>
      {/* 替换 div 为 View，保留所有 Tailwind 类 */}
      <View className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-500 pt-6 pb-10">
        <View
          ref={captureRef}
          data-capture-area="true"
          className="w-full max-w-md px-4 flex flex-col items-center gap-6 mx-auto relative"
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

          {/*<QuestionStage
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
          />*/}

          {/*<ConfirmModal
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={() => executeRestart(true)}
          />*/}

          {/*{isQuestionLocked && (
            <View className="w-full flex flex-col gap-6 animate-fadeIn">
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
                    targetRef={captureRef}
                  />
                </>
              )}
            </View>
          )}*/}
          <Footer />
        </View>
      </View>
    </View>
  );
}
