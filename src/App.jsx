import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { getHexagramDetailByName } from './data/hexagramDict';
import { saveHistoryToLocal } from './utils/storage';
import { getShareRecord } from './utils/apiService';

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
  const [question, setQuestion] = useState('');
  const [isQuestionLocked, setIsQuestionLocked] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [refreshCalendar, setRefreshCalendar] = useState(0);
  const [aiResponse, setAiResponse] = useState('');
  const [selectedMode, setSelectedMode] = useState('full');
  const [yangSetting, setYangSetting] = useState('heads');
  const [isSharedMode, setIsSharedMode] = useState(false);

  // 【新增】在 App 层专门维护当前操作的真实记录 ID
  const [activeRecordId, setActiveRecordId] = useState(null);
  const isLoadingHistory = useRef(false);

  const captureRef = useRef(null);
  const { isDarkMode, toggleDarkMode } = useTheme();

  const {
    status, setStatus, history, setHistory, finalGuaInfo, setFinalGuaInfo,
    isAutoSequence, setIsAutoSequence, currentRecordId, setCurrentRecordId,
    coinRefs, executeRestart, startRound, stopRound, handleCoinFinish
  } = useDivination(question, yangSetting, selectedMode, useCallback((id, nextHistory, finalInfo) => {
    if (isLoadingHistory.current) return;
    // 起新卦完成后，保存真实的 ID
    setActiveRecordId(id);
    saveHistoryToLocal({ id, question, history: nextHistory, finalGuaInfo: finalInfo, aiResponse: '' });
    setRefreshCalendar(v => v + 1);
  }, [question]));

  const { currentDetail, zhiDetail } = useMemo(() => {
    if (!finalGuaInfo) return { currentDetail: null, zhiDetail: null };
    return {
      currentDetail: getHexagramDetailByName(finalGuaInfo.benGua.name),
      zhiDetail: finalGuaInfo.zhiGua ? getHexagramDetailByName(finalGuaInfo.zhiGua.name) : null
    };
  }, [finalGuaInfo]);

  const handleToggleYangSetting = useCallback(() => {
    if (status === 'idle' || status === 'finished') {
      setYangSetting(s => s === 'heads' ? 'tails' : 'heads');
    }
  }, [status]);

  const loadPastRecord = useCallback((record, fromShare = false) => {
    isLoadingHistory.current = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    executeRestart(false);

    setQuestion(record.question);
    setIsQuestionLocked(true);
    setHistory(record.history);
    setFinalGuaInfo(record.finalGuaInfo);
    setAiResponse(record.aiResponse || '');

    // 【关键】强制锁定我们在操作的历史 ID
    setActiveRecordId(record.id);
    setCurrentRecordId(record.id); // 顺便同步给 hook

    setStatus('finished');
    setIsSharedMode(fromShare);

    setTimeout(() => {
      isLoadingHistory.current = false;
    }, 100);
  }, [executeRestart, setHistory, setFinalGuaInfo, setCurrentRecordId, setStatus]);

  useEffect(() => {
    const checkShareLink = async () => {
      const params = new URLSearchParams(window.location.search);
      const shareId = params.get('share');
      if (!shareId) return;
      const record = await getShareRecord(shareId);
      if (record) {
        loadPastRecord(record, true);
      }
    };
    checkShareLink();
  }, [loadPastRecord]);

  const handleSaveAfterAI = useCallback((finalAiText) => {
    setAiResponse(finalAiText);
    // 【关键】使用 App 层保护的 activeRecordId，而不是可能被污染的 currentRecordId
    if (!activeRecordId) return;
    saveHistoryToLocal({ id: activeRecordId, question, history, finalGuaInfo, aiResponse: finalAiText });
    setRefreshCalendar(v => v + 1);
  }, [activeRecordId, question, history, finalGuaInfo]);

  const handleQuestionSubmit = useCallback((q) => {
    setQuestion(q);
    setIsQuestionLocked(true);
  }, []);

  const handleQuestionRestart = useCallback(() => {
    setIsSharedMode(false);
    setActiveRecordId(null); // 清理 ID
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
  }, [status, isQuestionLocked, executeRestart]);

  const handleConfirmClose = useCallback(() => setShowConfirm(false), []);

  const handleConfirmAction = useCallback(() => {
    setActiveRecordId(null); // 清理 ID
    executeRestart(true);
    setQuestion('');
    setIsQuestionLocked(false);
    setAiResponse('');
    setShowConfirm(false);
  }, [executeRestart]);

  const handleSwitchMode = useCallback((m) => {
    setSelectedMode(m);
    executeRestart(false);
  }, [executeRestart]);

  const handleMainAction = useCallback(() => {
    if (status === 'idle') {
      if (selectedMode === 'full') setIsAutoSequence(true);
      startRound();
    } else if (status === 'spinning' && selectedMode === 'manual') {
      stopRound();
    }
  }, [status, selectedMode, setIsAutoSequence, startRound, stopRound]);

  return (
    <div
      className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 pt-4 pb-10"
      style={{ transform: 'translateZ(0)', WebkitOverflowScrolling: 'touch' }}
    >
      <div ref={captureRef} className="w-full max-w-md px-4 flex flex-col items-center gap-4 mx-auto relative">
        <Header
          yangSetting={yangSetting}
          toggleYangSetting={handleToggleYangSetting}
          disabled={status !== 'idle' || isAutoSequence || history.length > 0}
          isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}
        />

        <HistoryCalendar refreshTrigger={refreshCalendar} onSelectRecord={loadPastRecord} />

        <QuestionStage
          question={question} setQuestion={setQuestion} isLocked={isQuestionLocked}
          onQuestionSubmit={handleQuestionSubmit}
          onRestart={handleQuestionRestart}
        />

        <ConfirmModal
          isOpen={showConfirm}
          onClose={handleConfirmClose}
          onConfirm={handleConfirmAction}
        />

        {isQuestionLocked && (
          <div
            className="w-full flex flex-col gap-6 animate-fadeIn"
            style={{ willChange: 'transform, opacity' }}
          >
            <DivinationStage
              status={status} selectedMode={selectedMode} isAutoSequence={isAutoSequence} historyCount={history.length}
              coinRefs={coinRefs.current}
              onSwitchMode={handleSwitchMode}
              onMainAction={handleMainAction}
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
                  isSharedMode={isSharedMode}
                />
                <ToolBox
                  finalGuaInfo={finalGuaInfo}
                  question={question}
                  targetRef={captureRef}
                  history={history}
                  aiResponse={aiResponse}
                  isSharedMode={isSharedMode}
                  onSaveRecord={handleSaveAfterAI}
                />
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