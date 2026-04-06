import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom'; // 引入 createPortal
import { getHistoryLogs, deleteHistoryRecord, clearAllHistory, cleanupOldHistory } from '../utils/storage';
import constants from '../data/constants.json';

const { historyCalendar } = constants;

// --- 新增：美化版的清空确认弹窗组件 ---
const ClearConfirmModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return createPortal(
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
            {/* 遮罩层：使用纯透明度而非 backdrop-blur 避免掉帧 */}
            <div className="absolute inset-0 bg-slate-900/70" onClick={onClose}></div>
            <div className="relative w-full max-w-[280px] bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl p-8 border border-red-200 dark:border-red-900/30">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6 mx-auto text-4xl">
                    🗑️
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 text-center mb-4">清空全部记录？</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-8 leading-relaxed">
                    此操作将<span className="text-red-500 font-bold">永久删除</span>所有历史记录，无法恢复。
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        className="w-full py-4 rounded-2xl text-sm font-bold text-white bg-red-500 shadow-lg shadow-red-500/30 active:scale-95 transition-transform duration-100"
                    >
                        确定清空
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        取消清空
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

const HistoryCalendar = ({ onSelectRecord, refreshTrigger }) => {
    const [logs, setLogs] = useState({});
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [isExpanded, setIsExpanded] = useState(false);

    // 新增：控制自定义确认弹窗的状态
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    useEffect(() => {
        const cleanData = cleanupOldHistory();
        setLogs(cleanData);
    }, []);

    const refreshData = useCallback(() => {
        const currentLogs = getHistoryLogs();
        setLogs(currentLogs);
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshTrigger, refreshData]);

    const handleDeleteOne = useCallback((e, id) => {
        e.preventDefault();
        e.stopPropagation();
        deleteHistoryRecord(id);
        refreshData();
    }, [refreshData]);

    // 修改：点击清空按钮时只负责打开弹窗
    const handleClearClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsClearModalOpen(true);
    }, []);

    // 新增：在弹窗中点击确认执行真正的清空逻辑
    const handleConfirmClear = useCallback(() => {
        clearAllHistory();
        refreshData();
        setIsClearModalOpen(false);
    }, [refreshData]);

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
        <>
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

                    {/* 清空按钮绑定新的 handleClearClick */}
                    {isExpanded && Object.keys(logs).length > 0 && (
                        <button
                            onClick={handleClearClick}
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
                                        <button
                                            onClick={(e) => handleDeleteOne(e, rec.id)}
                                            className="absolute right-0 top-0 bottom-0 w-14 bg-red-500 text-white flex items-center justify-center translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-20 active:bg-red-600"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>

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

            {/* 在最外层渲染清空确认模态框 */}
            <ClearConfirmModal
                isOpen={isClearModalOpen}
                onClose={() => setIsClearModalOpen(false)}
                onConfirm={handleConfirmClear}
            />
        </>
    );
};

export default React.memo(HistoryCalendar);