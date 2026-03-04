import React, { useState } from 'react';

// components/GuaResultStage.jsx

const YaoLine = ({ type, isMoving, mark, isZhiGua }) => {
  const color = type === 'yang' ? 'bg-red-500' : 'bg-blue-600';
  
  return (
    // 高度从 h-8 降为 h-6，减小整体间距
    <div className="relative w-full h-6 flex items-center group overflow-visible">
      {/* 爻实体：高度 h-3.5，圆角 rounded-md */}
      <div className={`
        relative w-full h-3.5 rounded-md transition-all duration-500 ease-out
        group-hover:scale-[1.08] group-hover:shadow-[0_0_15px_rgba(0,0,0,0.3)]
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
      
      {/* 变爻标识：位置固定，随父级膨胀效果 */}
      {isMoving && !isZhiGua && (
        <span className={`
          absolute right-[-24px] text-lg font-black animate-pulse
          transition-transform duration-500 group-hover:scale-150
          ${type === 'yang' ? 'text-red-500' : 'text-blue-600'}
        `}>
          {mark}
        </span>
      )}
    </div>
  );
};

// HexagramVisualizer 宽度调整为 w-36
const HexagramVisualizer = ({ history, isZhiGua = false, info }) => {
  if (!info) return null;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm font-bold text-gray-800 tracking-[0.2em] w-full text-left">
        {info.commonName.split(' ')[0]}
        <span className="text-[10px] text-gray-400 ml-2 font-normal">{isZhiGua ? "之卦" : "本卦"}</span>
      </div>
      {/* w-36 保证了在小屏上也绝对不会溢出 */}
      <div className="flex flex-col gap-1 w-36 p-4 pr-8 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        {history.map((record) => {
          let isMoving = !!record.guaMark;
          let type = record.guaType;
          if (isZhiGua && isMoving) type = type === 'yang' ? 'yin' : 'yang';
          return <YaoLine key={record.id} type={type} isMoving={isMoving} mark={record.guaMark} isZhiGua={isZhiGua} />;
        })}
      </div>
    </div>
  );
};

const GuaResultStage = ({ history, finalGuaInfo }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  if (!finalGuaInfo) return null;

  return (
    <div className="w-full bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 p-4 mt-6 transition-all duration-500 overflow-hidden">
      {/* 标题栏 */}
      <div 
        className="flex items-center gap-2 mb-2 pb-2 cursor-pointer hover:opacity-70 transition-opacity"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest">卦象展示</h3>
        <span className={`text-gray-300 text-[10px] transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>▼</span>
      </div>
      
      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1200px] opacity-100 mt-2' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        
        {/* 关键修改：使用 flex-wrap 让卦象在窄屏自动换行，且调整了间距 */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full">
          
          <HexagramVisualizer history={history} info={finalGuaInfo.benGua} isZhiGua={false} />
          
          {finalGuaInfo.zhiGua && (
            <>
              {/* 箭头在宽屏水平显示，窄屏转为上下方向 */}
              <div className="text-gray-300 text-2xl opacity-50 rotate-90 md:rotate-0">➔</div>
              <HexagramVisualizer history={history} info={finalGuaInfo.zhiGua} isZhiGua={true} />
            </>
          )}
        </div>

        {/* 文字说明 */}
        <div className="mt-6 text-center pb-2 border-t border-gray-100 pt-4 px-2">
          <p className="text-sm text-gray-600 font-medium">
            {finalGuaInfo.zhiGua 
              ? <>由 <span className="text-indigo-600 font-bold">{finalGuaInfo.benGua.name}</span> 卦 变 <span className="text-indigo-600 font-bold">{finalGuaInfo.zhiGua.name}</span> 卦</>
              : <>得 <span className="text-indigo-600 font-bold">{finalGuaInfo.benGua.name}</span> 卦，无变爻</>
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuaResultStage;