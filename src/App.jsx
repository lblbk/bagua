import React, { useState, useRef, useEffect, useMemo } from 'react';
import hexagramsMd from './data/hexagrams.md?raw';
import { parseHexagramMarkdown } from './utils/ParserMarkdown';
import { calculateYao, calculateFinalHexagram } from './utils/divination';
import { saveHistoryToLocal } from './utils/storage';

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
  const [showConfirm, setShowConfirm] = useState(false);
  const [isQuestionLocked, setIsQuestionLocked] = useState(false);
  const [question, setQuestion] = useState('');
  const [refreshCalendar, setRefreshCalendar] = useState(0);
  const [aiResponse, setAiResponse] = useState('');
  const [selectedMode, setSelectedMode] = useState('full');
  const [status, setStatus] = useState('idle');
  const [isAutoSequence, setIsAutoSequence] = useState(false);
  const [yangSetting, setYangSetting] = useState('heads');
  const [history, setHistory] = useState([]);
  const [finalGuaInfo, setFinalGuaInfo] = useState(null);
  const [hexagramDetails, setHexagramDetails] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState(null);

  const coinRefs = useRef([React.createRef(), React.createRef(), React.createRef()]);
  const activeRoundId = useRef(0);
  const currentRoundResults = useRef([null, null, null]);
  const completedCount = useRef(0);
  const roundCounter = useRef(1);
  const timerRef = useRef(null);
  const captureRef = useRef(null);

  useEffect(() => {
    const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        // 如果用户手动设过，按手动
        const isDark = savedTheme === 'dark';
        setIsDarkMode(isDark);
        document.documentElement.classList.toggle('dark', isDark);
      } else {
        // 否则跟随系统
        const systemDark = themeMedia.matches;
        setIsDarkMode(systemDark);
        document.documentElement.classList.toggle('dark', systemDark);
      }
    };

    applyTheme();

    // 监听系统主题变化
    const listener = (e) => {
      if (!localStorage.getItem('theme')) { // 只有没手动设置时才跟随变化
        setIsDarkMode(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };

    themeMedia.addEventListener('change', listener);
    return () => themeMedia.removeEventListener('change', listener);
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  const loadPastRecord = (record) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    executeRestart(false);
    setQuestion(record.question);
    setIsQuestionLocked(true);
    setHistory(record.history);
    setFinalGuaInfo(record.finalGuaInfo);
    setAiResponse(record.aiResponse || ''); // 恢复保存的 AI 内容
    setCurrentRecordId(record.id);
    setStatus('finished');
  };

  const handleSaveAfterAI = (finalAiText) => {
    setAiResponse(finalAiText);
    if (!currentRecordId) return;

    saveHistoryToLocal({
      id: currentRecordId,
      question,
      history,
      finalGuaInfo,
      aiResponse: finalAiText
    });
    setRefreshCalendar(v => v + 1);
  };

  useEffect(() => {
    setHexagramDetails(parseHexagramMarkdown(hexagramsMd));
    const isDark = localStorage.getItem('theme') === 'dark';
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
    return () => clearTimeout(timerRef.current);
  }, []);

  const { currentDetail, zhiDetail } = useMemo(() => {
    if (!finalGuaInfo) return { currentDetail: null, zhiDetail: null };
    const findD = (name) => hexagramDetails.find(d => d.title.includes(name));
    return { currentDetail: findD(finalGuaInfo.benGua.name), zhiDetail: finalGuaInfo.zhiGua ? findD(finalGuaInfo.zhiGua.name) : null };
  }, [finalGuaInfo, hexagramDetails]);

  const executeRestart = (clearAll = true) => {
    setHistory([]);
    setFinalGuaInfo(null);
    setAiResponse(''); // 清空 AI 解读内容
    setCurrentRecordId(null);
    roundCounter.current = 1;
    setStatus('idle');
    setIsAutoSequence(false);
    clearTimeout(timerRef.current);
    if (clearAll) {
      setQuestion('');
      setIsQuestionLocked(false);
      setShowConfirm(false);
    }
  };

  const startRound = () => {
    if (history.length >= 6) return;
    setStatus('spinning');
    completedCount.current = 0;
    activeRoundId.current = Date.now();
    coinRefs.current.forEach(ref => ref.current?.startSpin(activeRoundId.current));
    const d = { manual: 8000, semi: 2000 + Math.random() * 1000, full: 1200 };
    timerRef.current = setTimeout(() => stopRound(selectedMode !== 'manual'), d[selectedMode]);
  };

  const stopRound = (quick = false) => {
    clearTimeout(timerRef.current);
    setStatus('stopping');
    coinRefs.current.forEach(ref => ref.current?.stopSpin(quick));
  };

  const processRoundEnd = () => {
    const info = calculateYao(currentRoundResults.current, yangSetting);
    // 关键修复：显式映射属性名，确保与 HistoryList 等组件兼容
    const newRecord = {
      id: roundCounter.current++,
      result: currentRoundResults.current.join(' '),
      guaName: info.name,
      guaType: info.type,
      guaMark: info.mark,
      guaColor: info.color
    };

    setHistory(prev => {
      const next = [newRecord, ...prev];
      if (next.length >= 6) {
        setStatus('finished');
        setIsAutoSequence(false);
        const finalInfo = calculateFinalHexagram(next);
        setFinalGuaInfo(finalInfo);

        const recordId = Date.now();
        setCurrentRecordId(recordId);
        saveHistoryToLocal({
          id: recordId,
          question: question,
          history: next,
          finalGuaInfo: finalInfo,
          aiResponse: ''
        });
        setRefreshCalendar(v => v + 1);
      } else {
        setStatus('idle');
        if (selectedMode === 'full' && isAutoSequence) timerRef.current = setTimeout(startRound, 2000);
      }
      return next;
    });
  };

  const handleCoinFinish = (idx, res, rid) => {
    if (rid !== activeRoundId.current) return;
    currentRoundResults.current[idx] = res;
    if (++completedCount.current === 3) processRoundEnd();
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-500 pt-4 pb-10">
      <div ref={captureRef} data-capture-area="true" className="w-full max-w-md px-4 flex flex-col items-center gap-4 mx-auto relative">
        <Header
          yangSetting={yangSetting}
          toggleYangSetting={() => (status === 'idle' || status === 'finished') && setYangSetting(s => s === 'heads' ? 'tails' : 'heads')}
          disabled={status !== 'idle' || isAutoSequence || history.length > 0}
          isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}
        />

        <HistoryCalendar
          refreshTrigger={refreshCalendar}
          onSelectRecord={loadPastRecord}
        />

        <QuestionStage
          question={question} setQuestion={setQuestion} isLocked={isQuestionLocked}
          onQuestionSubmit={(q) => { setQuestion(q); setIsQuestionLocked(true); }}
          onRestart={() => {
            // 逻辑：如果已经出结果了（finished状态），直接重置，不弹窗
            if (status === 'finished') {
              executeRestart(true);
            }
            // 如果问题已锁定但还没摇完（正在起卦中），为了防止误触，弹出确认框
            else if (isQuestionLocked) {
              setShowConfirm(true);
            }
            // 其他情况（如初始状态）直接重置
            else {
              executeRestart(true);
            }
          }}
        />

        <ConfirmModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={() => executeRestart(true)} />

        {isQuestionLocked && (
          <div className="w-full flex flex-col gap-6 animate-fadeIn">
            <DivinationStage
              status={status} selectedMode={selectedMode} isAutoSequence={isAutoSequence} historyCount={history.length}
              coinRefs={coinRefs.current} onSwitchMode={(m) => { setSelectedMode(m); executeRestart(false); }}
              onMainAction={() => {
                if (status === 'idle') { if (selectedMode === 'full') setIsAutoSequence(true); startRound(); }
                else if (status === 'spinning' && selectedMode === 'manual') stopRound();
              }}
              onStopComplete={handleCoinFinish}
            />
            <HistoryList history={history} isAutoSequence={isAutoSequence} />
            {finalGuaInfo && (
              <>
                <GuaResultStage history={history} finalGuaInfo={finalGuaInfo} />
                <GuaDetailStage detail={currentDetail} zhiDetail={zhiDetail} history={history} />
                <GuaAIStage
                  detail={currentDetail}
                  zhiDetail={zhiDetail}
                  history={history}
                  finalGuaInfo={finalGuaInfo}
                  question={question}
                  savedResponse={aiResponse}
                  onSaveRecord={handleSaveAfterAI}
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