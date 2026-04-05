import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import hexagramsMd from './data/hexagrams.md?raw';
import { parseHexagramMarkdown } from './utils/ParserMarkdown';
import { saveHistoryToLocal } from './utils/storage';

// Hooks
import { useTheme } from './hooks/useTheme';
import { useDivination } from './hooks/useDivination';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import QuestionStage from './components/QuestionStage';
import HistoryCalendar from './components/HistoryCalendar';
import DivinationStage from './components/DivinationStage';
import HistoryList from './components/HistoryList';
import GuaResultStage from './components/GuaResultStage';
import GuaDetailStage from './components/GuaDetailStage';
import GuaAIStage from './components/GuaAIStage';
import ToolBox from './components/ToolBox';
import ConfirmModal from './components/ConfirmModal';

function App() {
  // 1. UI 状态
  const [question, setQuestion] = useState('');
  const [isQuestionLocked, setIsQuestionLocked] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [refreshCalendar, setRefreshCalendar] = useState(0);
  const [aiResponse, setAiResponse] = useState('');
  const [selectedMode, setSelectedMode] = useState('full');
  const [yangSetting, setYangSetting] = useState('heads');
  const [hexagramDetails, setHexagramDetails] = useState([]);

  const captureRef = useRef(null);
  const { isDarkMode, toggleDarkMode } = useTheme();

  // 2. 核心起卦逻辑 Hook
  const {
    status, setStatus, history, setHistory, finalGuaInfo, setFinalGuaInfo,
    isAutoSequence, setIsAutoSequence, currentRecordId, setCurrentRecordId,
    coinRefs, executeRestart, startRound, stopRound, handleCoinFinish
  } = useDivination(question, yangSetting, selectedMode, (id, nextHistory, finalInfo) => {
    // 起卦完成后保存
    saveHistoryToLocal({ id, question, history: nextHistory, finalGuaInfo: finalInfo, aiResponse: '' });
    setRefreshCalendar(v => v + 1);
  });

  // 3. 数据初始化
  useEffect(() => {
    setHexagramDetails(parseHexagramMarkdown(hexagramsMd));
  }, []);

  // 4. 计算当前卦象详情
  const { currentDetail, zhiDetail } = useMemo(() => {
    if (!finalGuaInfo) return { currentDetail: null, zhiDetail: null };
    const findD = (name) => hexagramDetails.find(d => d.title.includes(name));
    return {
      currentDetail: findD(finalGuaInfo.benGua.name),
      zhiDetail: finalGuaInfo.zhiGua ? findD(finalGuaInfo.zhiGua.name) : null
    };
  }, [finalGuaInfo, hexagramDetails]);

  // 5. 业务处理函数
  const loadPastRecord = (record) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    executeRestart(true);
    setQuestion(record.question);
    setIsQuestionLocked(true);
    setHistory(record.history);
    setFinalGuaInfo(record.finalGuaInfo);
    setAiResponse(record.aiResponse || '');
    setCurrentRecordId(record.id);
    setStatus('finished');
  };

  const handleSaveAfterAI = (finalAiText) => {
    setAiResponse(finalAiText);
    if (!currentRecordId) return;
    saveHistoryToLocal({ id: currentRecordId, question, history, finalGuaInfo, aiResponse: finalAiText });
    setRefreshCalendar(v => v + 1);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-500 pt-4 pb-10">
      <div ref={captureRef} className="w-full max-w-md px-4 flex flex-col items-center gap-4 mx-auto relative">
        <Header
          yangSetting={yangSetting}
          toggleYangSetting={() => (status === 'idle' || status === 'finished') && setYangSetting(s => s === 'heads' ? 'tails' : 'heads')}
          disabled={status !== 'idle' || isAutoSequence || history.length > 0}
          isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}
        />

        <HistoryCalendar refreshTrigger={refreshCalendar} onSelectRecord={loadPastRecord} />

        <QuestionStage
          question={question} setQuestion={setQuestion} isLocked={isQuestionLocked}
          onQuestionSubmit={(q) => { setQuestion(q); setIsQuestionLocked(true); }}
          onRestart={() => {
            if (status === 'finished') {
              executeRestart(true);
              setQuestion('');
              setIsQuestionLocked(false);
              setAiResponse('');
            } else if (isQuestionLocked) {
              setShowConfirm(true);
            } else {
              executeRestart(true);
            }
          }}
        />

        <ConfirmModal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={() => {
            executeRestart(true);
            setQuestion('');
            setIsQuestionLocked(false);
            setAiResponse('');
            setShowConfirm(false);
          }}
        />

        {isQuestionLocked && (
          <div className="w-full flex flex-col gap-6 animate-fadeIn">
            <DivinationStage
              status={status} selectedMode={selectedMode} isAutoSequence={isAutoSequence} historyCount={history.length}
              coinRefs={coinRefs.current}
              onSwitchMode={(m) => { setSelectedMode(m); executeRestart(false); }}
              onMainAction={() => {
                if (status === 'idle') {
                  if (selectedMode === 'full') setIsAutoSequence(true);
                  startRound();
                } else if (status === 'spinning' && selectedMode === 'manual') {
                  stopRound();
                }
              }}
              onStopComplete={handleCoinFinish}
            />

            <HistoryList history={history} isAutoSequence={isAutoSequence} />

            {finalGuaInfo && (
              <>
                <GuaResultStage history={history} finalGuaInfo={finalGuaInfo} />
                <GuaDetailStage detail={currentDetail} zhiDetail={zhiDetail} history={history} />
                <GuaAIStage
                  detail={currentDetail} zhiDetail={zhiDetail} history={history}
                  finalGuaInfo={finalGuaInfo} question={question}
                  savedResponse={aiResponse} onSaveRecord={handleSaveAfterAI}
                />
                <ToolBox finalGuaInfo={finalGuaInfo} question={question} targetRef={captureRef} />
              </>
            )}
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
}

export default App;