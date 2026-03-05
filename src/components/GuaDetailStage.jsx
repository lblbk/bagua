import React, { useState } from 'react';

const GuaDetailStage = ({ detail, zhiDetail, history }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeGua, setActiveGua] = useState('ben');

  const currentDetail = activeGua === 'ben' ? detail : zhiDetail;
  
  const sortedHistory = [...history].reverse(); 
  const isLineMoving = (index) => {
    if (activeGua !== 'ben') return false;
    return !!sortedHistory[index]?.guaMark;
  };

  if (!detail) return null;

  return (
    // 1. 背景适配: dark:bg-slate-800/90, 边框适配: dark:border-slate-700/50
    <div className="w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 p-6 mt-6 transition-all duration-500 overflow-hidden">
      
      <div 
        className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-slate-700 cursor-pointer hover:opacity-70 transition-opacity"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest whitespace-nowrap">
          卦辞详解
        </h3>
        <span className={`text-gray-300 dark:text-gray-600 text-[10px] transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
          ▼
        </span>
      </div>

      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        
        {/* 2. Tab切换适配: dark:bg-slate-900 */}
        {zhiDetail && (
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-slate-900 rounded-lg">
            <button 
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeGua === 'ben' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
              onClick={() => setActiveGua('ben')}
            >本卦</button>
            <button 
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeGua === 'zhi' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
              onClick={() => setActiveGua('zhi')}
            >之卦</button>
          </div>
        )}

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-l-4 border-indigo-400 dark:border-indigo-600 pl-3">
            {currentDetail.title}
          </h2>

          <section>
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">卦象</h4>
            <p className="text-lg font-mono bg-indigo-50/50 dark:bg-slate-900 p-3 rounded-lg border border-indigo-100 dark:border-slate-700">{currentDetail.image}</p>
          </section>

          <section>
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">卦辞</h4>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg shadow-sm">{currentDetail.guaCi}</p>
          </section>

          <section>
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">象曰</h4>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 italic pl-3 border-l-2 border-indigo-200 dark:border-indigo-800">{currentDetail.xiangYue}</p>
          </section>

          <section>
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">爻辞</h4>
            <div className="grid gap-2">
              {currentDetail.yaoCi.map((item, i) => {
                const isMoving = isLineMoving(i);
                return (
                  <div key={i} className={`
                    text-xs leading-relaxed p-3 rounded-lg border transition-all duration-300
                    ${isMoving 
                      ? 'bg-indigo-600 dark:bg-indigo-900 text-white shadow-lg shadow-indigo-200 dark:shadow-none border-indigo-700 dark:border-indigo-800 scale-[1.02]' 
                      : 'bg-indigo-50/30 dark:bg-slate-900 border-indigo-50 dark:border-slate-700 text-gray-600 dark:text-gray-400'}
                  `}>
                    <span className={`font-bold mr-2 ${isMoving ? 'text-white' : 'text-indigo-700 dark:text-indigo-400'}`}>
                      {item.label}
                    </span>
                    <span className={isMoving ? 'text-indigo-50' : ''}>{item.content}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GuaDetailStage;