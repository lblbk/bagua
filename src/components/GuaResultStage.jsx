import React, { useState, useMemo } from 'react';
import constants from '../data/constants.json';

// 优化 1: 将 YaoLine 抽离并使用 React.memo，避免不必要的重绘
const YaoLine = React.memo(({ type, isMoving, mark, isZhiGua }) => {
  const color = type === 'yang' ? 'bg-red-500' : 'bg-blue-600';

  return (
    <div className="relative w-full h-7 flex items-center overflow-visible">
      {/* 优化 2: 移除 group-hover 和 transition-all，显著提升滚动性能 */}
      <div className={`
        relative w-full h-3.5 rounded-md
        ${type === 'yang' ? color : 'flex justify-between w-full'}
      `}>
        {type === 'yin' ? (
          <>
            <div className={`w-[45%] h-full rounded-md ${color}`}></div>
            <div className={`w-[45%] h-full rounded-md ${color}`}></div>
          </>
        ) : (
          <div className={`w-full h-full rounded-md ${color}`}></div>
        )}
      </div>

      {/* 变爻标识：移除 animate-pulse，减少持续的 GPU 占用 */}
      {isMoving && !isZhiGua && (
        <span className={`
          absolute right-[-24px] text-lg font-black
          ${type === 'yang' ? 'text-red-500' : 'text-blue-600'}
        `}>
          {mark}
        </span>
      )}
    </div>
  );
});

const HexagramVisualizer = React.memo(({ history, isZhiGua = false, info }) => {
  const { guaResultStage } = constants;
  if (!info) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-[0.2em] w-full text-left">
        {info.commonName.split(' ')[0]}
        <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-2 font-normal">
          {isZhiGua ? guaResultStage.zhiGuaLabel : guaResultStage.benGuaLabel}
        </span>
      </div>
      {/* 优化 3: 这里的阴影 shadow-sm 足够，避免复杂的 transition */}
      <div className="flex flex-col gap-1 w-32 p-4 pr-8 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
        {history.map((record) => {
          let isMoving = !!record.guaMark;
          let type = record.guaType;
          if (isZhiGua && isMoving) type = type === 'yang' ? 'yin' : 'yang';
          return <YaoLine key={record.id} type={type} isMoving={isMoving} mark={record.guaMark} isZhiGua={isZhiGua} />;
        })}
      </div>
    </div>
  );
});

const GuaResultStage = ({ history, finalGuaInfo }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { guaResultStage } = constants;

  if (!finalGuaInfo) return null;

  return (
    // 优化 4: 移除 backdrop-blur，改用高不透明度的纯色
    <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 overflow-hidden">

      <div
        className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-700 pb-2 cursor-pointer active:opacity-60"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-slate-700 dark:text-slate-300 font-black text-lg tracking-widest flex-1">
          {guaResultStage.title}
        </h3>
        <span className={`text-gray-400 text-xs transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </div>

      {/* 优化 5: 移除 max-height 动画，改用 display: none (hidden) */}
      <div className={isExpanded ? 'block' : 'hidden'}>
        <div className="flex flex-wrap items-center justify-center gap-4 w-full py-2">
          <HexagramVisualizer history={history} info={finalGuaInfo.benGua} isZhiGua={false} />
          {finalGuaInfo.zhiGua && (
            <>
              <div className="text-gray-300 dark:text-gray-600 text-2xl rotate-90 md:rotate-0">➔</div>
              <HexagramVisualizer history={history} info={finalGuaInfo.zhiGua} isZhiGua={true} />
            </>
          )}
        </div>

        <div className="mt-6 text-center pb-2 border-t border-gray-100 dark:border-slate-700 pt-4 px-2">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
            {finalGuaInfo.zhiGua
              ? <>
                {guaResultStage.changeFrom} <span className="text-indigo-600 dark:text-indigo-400 font-bold">{finalGuaInfo.benGua.name}</span> {guaResultStage.changeTo} <span className="text-indigo-600 dark:text-indigo-400 font-bold">{finalGuaInfo.zhiGua.name}</span> {guaResultStage.changeEnd}
              </>
              : <>
                {guaResultStage.noChangeStart} <span className="text-indigo-600 dark:text-indigo-400 font-bold">{finalGuaInfo.benGua.name}</span> {guaResultStage.noChangeEnd}
              </>
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(GuaResultStage);