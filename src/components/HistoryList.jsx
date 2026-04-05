import React, { useState } from 'react';
import constants from '../data/constants.json';

// 1. 将静态逻辑移出组件，避免重复创建
const { historyList } = constants;
const getYaoName = (id) => historyList.yaoNames[id - 1] || `${id}${historyList.defaultYaoSuffix}`;

// 2. 抽离爻画组件，减少主组件渲染压力
const YaoGraphic = React.memo(({ type, color }) => (
  <div className={`flex w-full items-center justify-center gap-1.5 h-1 ${color} opacity-90`}>
    {type === 'yang' ? (
      <div className="w-full h-full bg-current rounded-full" />
    ) : (
      <>
        <div className="w-[42%] h-full bg-current rounded-full" />
        <div className="w-[42%] h-full bg-current rounded-full" />
      </>
    )}
  </div>
));

const HistoryList = ({ history, isAutoSequence }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isPending = history.length < 6;

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
      {/* 标题栏 */}
      <div
        className="flex justify-between items-center mb-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-slate-700 dark:text-slate-300 font-bold tracking-tight">
            {historyList.title} <span className="text-xs text-slate-400">({history.length}/6)</span>
          </h2>
          <span className={`text-[10px] text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
        </div>
        {isAutoSequence && isPending && (
          <div className="text-[10px] text-orange-500 font-medium animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
            {historyList.autoRunning}
          </div>
        )}
      </div>

      {/* 列表主体 - 移除高度动画以提升性能 */}
      {isExpanded && (
        <div className="flex flex-col gap-2 transition-opacity animate-fadeIn">
          {history.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-slate-50 dark:border-slate-800 rounded-xl text-slate-300 text-xs italic">
              {historyList.emptyText}
            </div>
          ) : (
            history.map((record, index) => {
              const isActive = index === 0 && isPending;
              return (
                <div
                  key={record.id}
                  className={`grid grid-cols-[45px_1fr_45px_20px_45px] items-center px-3 py-3 rounded-xl border transition-colors ${isActive
                    ? 'bg-indigo-50/50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/50'
                    : 'bg-slate-50/30 border-transparent dark:bg-slate-800/30'
                    }`}
                >
                  <span className={`text-[10px] font-mono ${isActive ? 'text-indigo-500 font-bold' : 'text-slate-400'}`}>
                    {getYaoName(record.id)}
                  </span>

                  <span className="text-[10px] text-center text-slate-400 font-mono tracking-tighter">
                    {record.result}
                  </span>

                  <div className="px-1">
                    <YaoGraphic type={record.guaType} color={record.guaColor} />
                  </div>

                  <span className="text-[10px] font-bold text-center text-indigo-500">
                    {record.guaMark}
                  </span>

                  <span className={`text-xs font-bold text-right ${isActive ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
                    {record.guaName}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(HistoryList);