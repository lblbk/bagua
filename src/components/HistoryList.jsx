// components/HistoryList.jsx
import React, { useState } from 'react';
import constants from '../data/constants.json';

// 引入常量处理爻名
const getYaoName = (id) => {
  const { yaoNames, defaultYaoSuffix } = constants.historyList;
  return yaoNames[id - 1] || `${id}${defaultYaoSuffix}`;
};

// 辅助函数：根据当前颜色类名，映射出深色模式下的推荐色
const getDarkModeColor = (colorClass) => {
  if (!colorClass) return '';
  return colorClass
    .replace('text-gray-800', 'text-gray-800 dark:text-gray-200')
    .replace('text-blue-600', 'text-blue-600 dark:text-blue-400')
    .replace('text-red-600', 'text-red-600 dark:text-red-400')
    .replace('text-gray-400', 'text-gray-400 dark:text-gray-500');
};

const HistoryList = ({ history, isAutoSequence }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { historyList } = constants;

  return (
    <div className="w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 p-6 transition-all duration-500 overflow-hidden">
      {/* 标题栏 */}
      <div
        className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-slate-700 pb-2 cursor-pointer group transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {/* 标题放大至 text-lg，颜色加深以匹配全局标题风格 */}
          <h2 className="text-slate-700 dark:text-slate-300 font-black text-lg tracking-widest group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {historyList.title} <span className="text-sm font-bold text-gray-400">({history.length}/6)</span>
          </h2>
          <span className={`text-gray-400 dark:text-gray-500 text-xs transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
            ▼
          </span>
        </div>
        {isAutoSequence && history.length < 6 && (
          <span className="text-xs text-orange-500 font-bold animate-pulse flex items-center gap-1">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            {historyList.autoRunning}
          </span>
        )}
      </div>

      {/* 列表主体 */}
      <div className={`
        flex flex-col gap-2 transition-all duration-500 ease-in-out origin-top
        ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}
      `}>
        {history.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 text-sm italic border-2 border-dashed border-gray-100 dark:border-slate-700 rounded-xl">
            <p>{historyList.emptyText}</p>
          </div>
        ) : (
          history.map((record, index) => (
            <div
              key={record.id}
              className={`
                grid grid-cols-[40px_1fr_40px_20px_45px] items-center px-3 py-3 rounded-lg border transition-all gap-2
                ${index === 0 && history.length < 6
                  ? 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-800'
                  : 'bg-white border-transparent dark:bg-slate-700/30 dark:border-slate-600/30 text-gray-400 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700'}
              `}
            >
              {/* 爻名 */}
              <div className={`font-mono text-xs ${index === 0 && history.length < 6 ? 'text-indigo-500 font-bold dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {getYaoName(record.id)}
              </div>

              {/* 硬币结果 */}
              <div className="text-xs text-center tracking-widest opacity-60 dark:text-gray-400">
                {record.result}
              </div>

              {/* 卦画本体：使用 getDarkModeColor 确保深色模式下颜色鲜明 */}
              <div className={`flex items-center justify-center h-4 w-full ${getDarkModeColor(record.guaColor)}`}>
                <div className="w-full h-full flex items-center justify-center opacity-90">
                  {record.guaType === 'yang' ? (
                    <div className="w-full h-[3px] bg-current rounded-full"></div>
                  ) : (
                    <div className="w-full h-[3px] flex justify-between">
                      <div className="w-[40%] bg-current rounded-full"></div>
                      <div className="w-[40%] bg-current rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* 动爻标记：深色模式加深对比度 */}
              <div className="text-xs font-bold text-center text-indigo-500 dark:text-indigo-400">
                {record.guaMark || ''}
              </div>

              {/* 卦名：使用 getDarkModeColor */}
              <div className={`text-xs font-bold text-right ${index === 0 && history.length < 6 ? getDarkModeColor(record.guaName) : 'text-gray-400 dark:text-gray-500'}`}>
                {record.guaName}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(HistoryList);