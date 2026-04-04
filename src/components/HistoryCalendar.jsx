import React, { useState, useEffect, useMemo } from 'react';
import { getHistoryLogs } from '../utils/storage';
import constants from '../data/constants.json';

const HistoryPanel = ({ onSelectRecord, refreshTrigger }) => {
    const [logs, setLogs] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isExpanded, setIsExpanded] = useState(false); // 默认折叠

    const { historyPanel } = constants;

    useEffect(() => {
        setLogs(getHistoryLogs());
    }, [refreshTrigger]);

    // 生成最近 7 天的列表
    const lastSevenDays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            return {
                key,
                label: i === 0 ? "今日" : i === 1 ? "昨日" : `${d.getMonth() + 1}/${d.getDate()}`,
                hasData: !!(logs[key] && logs[key].length > 0)
            };
        });
    }, [logs]);

    return (
        <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 dark:border-slate-800 p-6 transition-all duration-500 overflow-hidden">

            {/* 标题栏 - 风格统一 */}
            <div
                className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                <h3 className="text-slate-700 dark:text-slate-300 font-black text-lg tracking-widest flex-1">
                    {historyPanel.title}
                </h3>
                <span className={`text-gray-300 text-[10px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </div>

            {isExpanded && (
                <div className="flex flex-col gap-5 animate-fadeIn">
                    {/* 七日快速切换选项卡 */}
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        {lastSevenDays.map((day) => (
                            <button
                                key={day.key}
                                onClick={() => setSelectedDate(day.key)}
                                className={`
                  relative flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all flex-1
                  ${selectedDate === day.key
                                        ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400 font-bold'
                                        : 'text-slate-400 dark:text-slate-500'}
                `}
                            >
                                <span className="text-[10px] scale-90">{day.label}</span>
                                {day.hasData && (
                                    <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-indigo-500" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* 记录列表内容 */}
                    <div className="flex flex-col gap-3">
                        {logs[selectedDate] && logs[selectedDate].length > 0 ? (
                            logs[selectedDate].map((rec, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => { onSelectRecord(rec); setIsExpanded(false); }}
                                    className="group relative p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/40 dark:to-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/50 active:scale-[0.98] transition-all cursor-pointer hover:border-indigo-300"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                                            {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {rec.aiResponse && (
                                            <span className="text-[9px] px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-md font-bold">
                                                ✦ 已解
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate flex-1">
                                            {rec.question || "未设问"}
                                        </p>
                                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                            {rec.finalGuaInfo.benGua.name}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center flex flex-col items-center opacity-40">
                                <span className="text-2xl mb-2">⏳</span>
                                <p className="text-[11px] text-slate-400 tracking-widest">{historyPanel.empty}</p>
                            </div>
                        )}
                    </div>

                    {/* 底部提示词 */}
                    <div className="text-center">
                        <p className="text-[10px] text-slate-300 dark:text-slate-600 italic">
                            {historyPanel.todayLimit}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryPanel;