import React, { useState, useRef, useCallback, useEffect } from 'react';
import { calculateYao, calculateFinalHexagram } from '../utils/divination';

export function useDivination(question, yangSetting, selectedMode, onFinishAll) {
    const [status, setStatus] = useState('idle'); // idle, spinning, stopping, finished
    const [history, setHistory] = useState([]);
    const [finalGuaInfo, setFinalGuaInfo] = useState(null);
    const [isAutoSequence, setIsAutoSequence] = useState(false);
    const [currentRecordId, setCurrentRecordId] = useState(null);

    const activeRoundId = useRef(0);
    const currentRoundResults = useRef([null, null, null]);
    const completedCount = useRef(0);
    const roundCounter = useRef(1);
    const timerRef = useRef(null);

    // 【关键恢复】：保留你的正确写法，这是硬币能够绑定实例并旋转的核心！
    const coinRefs = useRef([React.createRef(), React.createRef(), React.createRef()]);

    // 新增：用于记录已经处理过的历史记录长度，防止重复触发保存
    const processedLengthRef = useRef(0);

    // 新增：缓存外部传入的 onFinishAll 方法
    const onFinishAllRef = useRef(onFinishAll);
    useEffect(() => {
        onFinishAllRef.current = onFinishAll;
    }, [onFinishAll]);

    const executeRestart = useCallback((clearHistory = true) => {
        clearTimeout(timerRef.current);
        setStatus('idle');
        setIsAutoSequence(false);
        processedLengthRef.current = 0; // 重置已处理的历史长度记录
        if (clearHistory) {
            setHistory([]);
            setFinalGuaInfo(null);
            setCurrentRecordId(null);
            roundCounter.current = 1;
        }
    }, []);

    const startRound = useCallback(() => {
        if (history.length >= 6) return;
        setStatus('spinning');
        completedCount.current = 0;
        activeRoundId.current = Date.now();

        coinRefs.current.forEach(ref => {
            if (ref.current) {
                ref.current.startSpin(activeRoundId.current);
            }
        });

        const durations = { manual: 8000, semi: 2500, full: 1200 };
        timerRef.current = setTimeout(() => {
            if (selectedMode !== 'manual') stopRound(selectedMode !== 'manual');
        }, durations[selectedMode]);
    }, [history.length, selectedMode]);

    const stopRound = useCallback((quick = false) => {
        clearTimeout(timerRef.current);
        setStatus('stopping');
        coinRefs.current.forEach(ref => {
            if (ref.current) {
                ref.current.stopSpin(quick);
            }
        });
    }, []);

    const handleCoinFinish = useCallback((idx, res, rid) => {
        if (rid !== activeRoundId.current) return;
        currentRoundResults.current[idx] = res;

        if (++completedCount.current === 3) {
            const info = calculateYao(currentRoundResults.current, yangSetting);
            const newRecord = {
                id: roundCounter.current++,
                result: currentRoundResults.current.join(' '),
                guaName: info.name,
                guaType: info.type,
                guaMark: info.mark,
                guaColor: info.color
            };

            // 【彻底解决双重保存 Bug】：状态更新函数内绝不执行带有副作用的操作
            // React 18 严格模式会把这个函数执行两次，但由于只做纯数组拼接，所以是安全的
            setHistory(prev => [newRecord, ...prev]);
        }
    }, [yangSetting]);

    // 【核心调度逻辑】：监听 history 的变化，决定下一步该干嘛
    useEffect(() => {
        // 如果数组长度没有真正变化（防止无关重绘触发），或者是空的，直接跳过
        if (history.length === processedLengthRef.current || history.length === 0) return;

        // 标记这个长度已经被处理过了
        processedLengthRef.current = history.length;

        if (history.length === 6) {
            // 六爻已满，计算终卦并保存
            setStatus('finished');
            setIsAutoSequence(false);
            const finalInfo = calculateFinalHexagram(history);
            setFinalGuaInfo(finalInfo);

            const recordId = Date.now();
            setCurrentRecordId(recordId);

            // 触发存 LocalStorage（彻底杜绝一瞬间存两遍的问题）
            if (onFinishAllRef.current) {
                onFinishAllRef.current(recordId, history, finalInfo);
            }
        } else if (history.length < 6) {
            // 未满六爻，进入空闲或自动触发下一轮
            setStatus('idle');
            if (selectedMode === 'full' && isAutoSequence) {
                timerRef.current = setTimeout(startRound, 2000);
            }
        }
    }, [history, selectedMode, isAutoSequence, startRound]);

    return {
        status, setStatus,
        history, setHistory,
        finalGuaInfo, setFinalGuaInfo,
        isAutoSequence, setIsAutoSequence,
        currentRecordId, setCurrentRecordId,
        coinRefs,
        executeRestart,
        startRound,
        stopRound,
        handleCoinFinish
    };
}