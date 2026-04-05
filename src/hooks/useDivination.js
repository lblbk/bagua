import React, { useState, useRef, useCallback } from 'react';
import { calculateYao, calculateFinalHexagram } from '../utils/divination';
import { saveHistoryToLocal } from '../utils/storage';

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
    const coinRefs = useRef([React.createRef(), React.createRef(), React.createRef()]);

    const executeRestart = useCallback((clearHistory = true) => {
        clearTimeout(timerRef.current);
        setStatus('idle');
        setIsAutoSequence(false);
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

        // 【修复 2】因为数组里是 Ref 对象，所以是 ref.current?.startSpin
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
        // 【修复 3】同理，ref.current?.stopSpin
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

            setHistory(prev => {
                const next = [newRecord, ...prev];
                if (next.length >= 6) {
                    setStatus('finished');
                    setIsAutoSequence(false);
                    const finalInfo = calculateFinalHexagram(next);
                    setFinalGuaInfo(finalInfo);

                    const recordId = Date.now();
                    setCurrentRecordId(recordId);
                    onFinishAll(recordId, next, finalInfo);
                } else {
                    setStatus('idle');
                    if (selectedMode === 'full' && isAutoSequence) {
                        timerRef.current = setTimeout(startRound, 2000);
                    }
                }
                return next;
            });
        }
    }, [yangSetting, selectedMode, isAutoSequence, startRound, onFinishAll]);

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