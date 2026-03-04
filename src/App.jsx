import React, { useState, useRef, useEffect } from 'react';
import hexagramsMd from './data/hexagrams.md?raw'; // Vite 加载 raw 文本
import { parseHexagramMarkdown } from './utils/ParserMarkdown';
import { calculateYao, calculateFinalHexagram } from './utils/divination'; 

// 引入拆分后的组件
import Header from './components/Header';
import Footer from './components/Footer';
import ModeTabs from './components/ModeTabs';
import CoinStage from './components/CoinStage';
import ControlPanel from './components/ControlPanel';
import HistoryList from './components/HistoryList';
import GuaResultStage from './components/GuaResultStage';
import GuaDetailStage from './components/GuaDetailStage';
import GuaAIStage from './components/GuaAIStage';

function App() {
  const [selectedMode, setSelectedMode] = useState('full');
  const [status, setStatus] = useState('idle');
  const [isAutoSequence, setIsAutoSequence] = useState(false);
  const [yangSetting, setYangSetting] = useState('heads');
  const [history, setHistory] = useState([]);
  const [finalGuaInfo, setFinalGuaInfo] = useState(null);
  const [hexagramDetails, setHexagramDetails] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const coinRefs = useRef([React.createRef(), React.createRef(), React.createRef()]);
  const activeRoundId = useRef(0);
  const currentRoundResults = useRef([null, null, null]); 
  const completedCount = useRef(0);
  const roundCounter = useRef(1);
  const timerRef = useRef(null);

  // --- 事件处理 ---
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleYangSetting = () => {
    if (status !== 'idle' && status !== 'finished') return;
    setYangSetting(prev => prev === 'heads' ? 'tails' : 'heads');
  };

  const switchMode = (mode) => {
    if (isAutoSequence || status === 'spinning' || status === 'stopping') return; 
    setSelectedMode(mode);
    handleRestart();
  };

  const startRound = () => {
    if (history.length >= 6) return;

    setStatus('spinning');
    currentRoundResults.current = [null, null, null];
    completedCount.current = 0;

    const newRoundId = Date.now();
    activeRoundId.current = newRoundId;

    coinRefs.current.forEach(ref => ref.current?.startSpin(newRoundId));

    // 根据模式设置定时器
    let duration = 0;
    if (selectedMode === 'manual') duration = 8000;
    else if (selectedMode === 'semi') duration = 2000 + Math.random() * 1000;
    else if (selectedMode === 'full') duration = 1200;

    // 手动模式超时停止，其他模式自动停止
    const shouldStopAutomatically = selectedMode !== 'manual';
    
    timerRef.current = setTimeout(() => {
        stopRound(shouldStopAutomatically); // manual 模式下这个是超时保护
    }, duration);
  };

  const stopRound = (isQuick = false) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus('stopping');
    coinRefs.current.forEach(ref => ref.current?.stopSpin(isQuick));
  };

  const handleCoinFinish = (index, result, roundId) => {
    if (roundId !== activeRoundId.current) return;

    currentRoundResults.current[index] = result;
    completedCount.current += 1;

    if (completedCount.current === 3) {
      processRoundEnd();
    }
  };

  const processRoundEnd = () => {
    const rawResults = currentRoundResults.current;
    
    // 1. 调用工具函数计算每一爻
    const yaoInfo = calculateYao(rawResults, yangSetting);

    const newRecord = { 
      id: roundCounter.current, 
      result: rawResults.join(' '),
      guaName: yaoInfo.name,
      guaType: yaoInfo.type, 
      guaMark: yaoInfo.mark, 
      guaColor: yaoInfo.color
    };
    
    roundCounter.current += 1;

    setHistory(prev => {
      const newHistory = [newRecord, ...prev]; 
      
      if (newHistory.length >= 6) {
        setStatus('finished');
        setIsAutoSequence(false); 
        
        // 2. 调用工具函数计算最终卦象
        const finalInfo = calculateFinalHexagram(newHistory);
        setFinalGuaInfo(finalInfo);

      } else {
        setStatus('idle');
        if (selectedMode === 'full' && isAutoSequence) {
          timerRef.current = setTimeout(() => startRound(), 2000); 
        }
      }
      return newHistory;
    });
  };

  const handleMainAction = () => {
    if (isAutoSequence && status !== 'finished') return;

    if (status === 'idle') {
      if (selectedMode === 'full') setIsAutoSequence(true); 
      startRound();
    } else if (status === 'spinning' && selectedMode === 'manual') {
      stopRound();
    }
  };

  const handleRestart = () => {
    setHistory([]);
    setFinalGuaInfo(null); // 重置最终卦象信息
    roundCounter.current = 1;
    setStatus('idle');
    setIsAutoSequence(false);
    activeRoundId.current = 0; 
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => {
    // 1. 初始化数据：解析 Markdown (高性能任务)
    const parsedData = parseHexagramMarkdown(hexagramsMd);
    setHexagramDetails(parsedData);

    // 2. 初始化主题：读取本地存储
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // 3. 清理工作：组件销毁时确保定时器被清除
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const currentDetail = finalGuaInfo 
    ? hexagramDetails.find(d => d.title.includes(finalGuaInfo.benGua.name))
    : null;

  const zhiDetail = finalGuaInfo?.zhiGua
    ? hexagramDetails.find(d => d.title.includes(finalGuaInfo.zhiGua.name))
    : null;

  // --- 渲染 ---
  const isInteracting = status !== 'idle' && status !== 'finished';

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
      <div className="w-full max-w-md px-4 flex flex-col items-center gap-6 mx-auto mt-6 relative pb-10">
      
        <Header 
          yangSetting={yangSetting} 
          toggleYangSetting={toggleYangSetting} 
          disabled={isInteracting || isAutoSequence} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode}
        />

        <ModeTabs 
          selectedMode={selectedMode} 
          onSwitchMode={switchMode} 
          disabled={isInteracting || isAutoSequence} 
        />

        <CoinStage 
          coinRefs={coinRefs.current} 
          onStopComplete={handleCoinFinish} 
        />

        <ControlPanel 
          status={status}
          selectedMode={selectedMode}
          isAutoSequence={isAutoSequence}
          historyCount={history.length}
          onMainAction={handleMainAction}
          onRestart={handleRestart}
        />

        <HistoryList 
          history={history} 
          isAutoSequence={isAutoSequence} 
        />

        {finalGuaInfo && (
            <>
              <GuaResultStage history={history} finalGuaInfo={finalGuaInfo} />
              <GuaDetailStage detail={currentDetail} zhiDetail={zhiDetail} history={history} />
              <GuaAIStage detail={currentDetail} history={history} finalGuaInfo={finalGuaInfo} />
            </>
        )}

        <Footer />
      </div>
    </div>
  );
}

export default App;