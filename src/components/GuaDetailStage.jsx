import React, { useState, useMemo } from 'react';
import constants from '../data/constants.json';

const GuaDetailStage = ({ detail, zhiDetail, history }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeGua, setActiveGua] = useState('ben');
  const { guaDetailStage } = constants;

  // 优化 1: 使用 useMemo 预处理数据，避免渲染时重复执行 [...history].reverse()
  const movingLines = useMemo(() => {
    return [...history].reverse().map(item => !!item?.guaMark);
  }, [history]);

  const currentDetail = activeGua === 'ben' ? detail : zhiDetail;

  if (!detail) return null;

  return (
    // 优化 2: 移除 transition-all 和在大容器上的 backdrop-blur（如果卡顿严重）
    <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700/50 p-6 overflow-hidden">

      {/* 标题栏：仅针对 transform 开启过渡 */}
      <div
        className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-700 pb-2 cursor-pointer active:opacity-70"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-slate-700 dark:text-slate-300 font-black text-lg tracking-widest flex-1">
          {guaDetailStage.title}
        </h3>
        <span className={`text-gray-400 text-xs transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </div>

      {/* 优化 3: 废弃 max-h-[3000px]。直接控制 display 或 opacity */}
      <div className={isExpanded ? "block opacity-100" : "hidden"}>

        {/* Tab切换：只在有之卦时显示 */}
        {zhiDetail && (
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-slate-900 rounded-lg">
            <button
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeGua === 'ben' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
              onClick={() => setActiveGua('ben')}
            >
              {guaDetailStage.benGuaTab}
            </button>
            <button
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeGua === 'zhi' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
              onClick={() => setActiveGua('zhi')}
            >
              {guaDetailStage.zhiGuaTab}
            </button>
          </div>
        )}

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-l-4 border-indigo-400 dark:border-indigo-600 pl-3">
            {currentDetail.title}
          </h2>

          <section>
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
              {guaDetailStage.sections.guaXiang}
            </h4>
            <div className="text-lg font-mono bg-indigo-50/50 dark:bg-slate-900/50 p-3 rounded-lg border border-indigo-100/50 dark:border-slate-700">
              {currentDetail.image}
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
              {guaDetailStage.sections.guaCi}
            </h4>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 p-3 bg-gray-50/50 dark:bg-slate-900/30 border border-gray-100 dark:border-slate-700 rounded-lg">
              {currentDetail.guaCi}
            </p>
          </section>

          <section>
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
              {guaDetailStage.sections.xiangYue}
            </h4>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 italic pl-3 border-l-2 border-indigo-200 dark:border-indigo-800">
              {currentDetail.xiangYue}
            </p>
          </section>

          <section>
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
              {guaDetailStage.sections.yaoCi}
            </h4>
            <div className="grid gap-2">
              {currentDetail.yaoCi.map((item, i) => {
                // 优化 4: 只有在本卦 Tab 下才高亮变爻，且使用预计算好的结果
                const isMoving = activeGua === 'ben' && movingLines[i];
                return (
                  <div key={i} className={`
                    text-xs leading-relaxed p-3 rounded-lg border transition-shadow
                    ${isMoving
                      ? 'bg-indigo-600 dark:bg-indigo-900 text-white shadow-md border-indigo-700 dark:border-indigo-800'
                      : 'bg-indigo-50/30 dark:bg-slate-900 border-indigo-50 dark:border-slate-700 text-gray-600 dark:text-gray-400'}
                  `}>
                    <span className={`font-bold mr-2 ${isMoving ? 'text-white' : 'text-indigo-700 dark:text-indigo-400'}`}>
                      {item.label}
                    </span>
                    <span className={isMoving ? 'opacity-90' : ''}>{item.content}</span>
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

// 使用 React.memo 避免 App 更新时重新渲染详情
export default React.memo(GuaDetailStage);