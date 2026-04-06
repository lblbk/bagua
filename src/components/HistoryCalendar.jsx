import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getHistoryLogs, deleteHistoryRecord, clearAllHistory, cleanupOldHistory } from '../utils/storage';
import constants from '../data/constants.json';

const HistoryCalendar = ({ onSelectRecord, refreshTrigger }) => {
    const [logs, setLogs] = useState({});
    // 性能优化：初始值只计算一次
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [isExpanded, setIsExpanded] = useState(false);

    const { historyCalendar } = constants;

    useEffect(() => {
        // 启动时清理一周前的旧数据并获取最新数据
        const cleanData = cleanupOldHistory();
        setLogs(cleanData);
    }, []);

    // 性能优化：使用 useCallback 稳定函数引用
    const refreshData = useCallback(() => {
        const currentLogs = getHistoryLogs();
        setLogs(currentLogs);
    }, []);

    // 监听外部刷新（比如起卦完成后）
    useEffect(() => {
        refreshData();
    }, [refreshTrigger, refreshData]);

    // 修改：处理单条删除（移除确认框）
    const handleDeleteOne = useCallback((e, id) => {
        e.preventDefault();
        e.stopPropagation();
        deleteHistoryRecord(id);
        refreshData();
    }, [refreshData]);

    // 处理清空全部（保留确认框）
    const handleClearAll = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm("确定要清空所有历史记录吗？")) {
            clearAllHistory();
            refreshData();
        }
    }, [refreshData]);

    // 生成周历逻辑（保持 useMemo）
    const currentWeekDays = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const day = now.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        const monday = new Date(now);
        monday.setDate(now.getDate() + diffToMonday);
        const weekLabels = ["一", "二", "三", "四", "五", "六", "日"];

        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const key = d.toISOString().split('T')[0];
            return {
                key,
                label: key === todayStr ? "今" : weekLabels[i],
                isToday: key === todayStr,
                hasData: !!(logs[key] && logs[key].length > 0)
            };
        });
    }, [logs]);

    return (
        <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 dark:border-slate-800 p-6 transition-all duration-500 overflow-hidden">

            {/* 标题栏 */}
            <div
                className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-3 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                <h3 className="text-slate-700 dark:text-slate-300 font-black text-lg tracking-widest flex-1">
                    {historyCalendar.title}
                </h3>

                {/* 清空按钮 - 只有全部清空才需要确认 */}
                {isExpanded && Object.keys(logs).length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-lg text-[10px] font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-all active:scale-95 shadow-sm mr-2 z-30"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        清空
                    </button>
                )}

                <span className={`text-gray-300 text-[10px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </div>

            {isExpanded && (
                <div className="flex flex-col gap-5 animate-fadeIn">
                    {/* 周历选项卡 */}
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        {currentWeekDays.map((day) => (
                            <button
                                key={day.key}
                                onClick={() => setSelectedDate(day.key)}
                                className={`relative flex flex-col items-center justify-center py-2 rounded-lg transition-all flex-1 ${selectedDate === day.key ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}
                            >
                                <span className={`text-[10px] ${day.isToday && selectedDate !== day.key ? 'text-indigo-500 font-bold' : ''}`}>{day.label}</span>
                                {day.hasData && (
                                    <div className={`absolute bottom-1 w-1 h-1 rounded-full ${selectedDate === day.key ? 'bg-indigo-500' : 'bg-indigo-300 dark:bg-indigo-700'}`} />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* 记录列表内容 */}
                    <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                        {logs[selectedDate] && logs[selectedDate].length > 0 ? (
                            logs[selectedDate].map((rec) => (
                                <div
                                    key={rec.id || rec.timestamp}
                                    className="relative group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 dark:border-slate-800"
                                >
                                    {/* 【底层】垃圾桶按钮：单条删除已取消确认框 */}
                                    <button
                                        onClick={(e) => handleDeleteOne(e, rec.id)}
                                        className="absolute right-0 top-0 bottom-0 w-14 bg-red-500 text-white flex items-center justify-center translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-20 active:bg-red-600"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {/* 【内容层】 */}
                                    <div
                                        onClick={() => { onSelectRecord(rec); setIsExpanded(false); }}
                                        className="relative p-4 flex items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-800/90 cursor-pointer z-10 transition-all duration-300"
                                    >
                                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                                                {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">
                                                {rec.question || "未设问"}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 transition-transform duration-300 group-hover:-translate-x-12">
                                            {rec.aiResponse ? (
                                                <span className="shrink-0 text-[9px] px-1.5 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-md font-bold">
                                                    ✦ 已解
                                                </span>
                                            ) : (
                                                <span className="shrink-0 text-[9px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-md font-bold">
                                                    待解
                                                </span>
                                            )}
                                            <span className="shrink-0 text-sm font-black text-indigo-600 dark:text-indigo-400">
                                                {rec.finalGuaInfo?.benGua?.name}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 右侧淡出遮罩 */}
                                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-slate-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[15]" />
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center flex flex-col items-center opacity-40">
                                <span className="text-2xl mb-2">⏳</span>
                                <p className="text-[11px] text-slate-400 tracking-widest">{historyCalendar.empty}</p>
                            </div>
                        )}
                    </div>

                    <div className="text-center">
                        <p className="text-[10px] text-slate-300 dark:text-slate-600 italic">
                            {historyCalendar.todayLimit}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(HistoryCalendar);