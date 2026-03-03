import React from 'react';

const HistoryList = ({ history, isAutoSequence }) => {
  return (
    <div className="w-full bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg border border-white/50 flex-1 min-h-[350px] flex flex-col mb-10">
      
      {/* 标题栏 */}
      <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2 px-2">
        <h2 className="text-gray-400 font-bold text-xs uppercase tracking-widest">
          排盘记录 ({history.length}/6)
        </h2>
        {isAutoSequence && (
          <span className="text-xs text-orange-500 font-bold animate-pulse">
            ● 自动运行中
          </span>
        )}
      </div>
      
      {/* 列表区域 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 text-sm italic gap-2">
            <p>等待起卦...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((record, index) => (
              <div 
                key={record.id} 
                className={`
                  flex items-center px-4 py-3 rounded-xl border transition-all
                  ${index === 0 
                    ? 'history-item-new bg-indigo-50 border-indigo-100 shadow-sm' 
                    : 'bg-white border-transparent text-gray-400 hover:bg-slate-50'}
                `}
              >
                {/* 1. 序号 */}
                <div className={`text-xs font-mono w-10 shrink-0 ${index === 0 ? 'text-indigo-400' : 'text-gray-300'}`}>
                  {getYaoName(record.id)}
                </div>

                {/* 2. 硬币结果 (辅助信息) */}
                <div className="w-16 text-xs text-center tracking-widest opacity-60 shrink-0">
                  {record.result}
                </div>

                {/* 3. 核心：CSS 绘制卦爻 (完美对齐) */}
                <div className={`flex-1 flex items-center justify-center h-8 gap-3 ${record.guaColor}`}>
                  
                  {/* 卦画本体容器 */}
                  <div className="w-24 h-4 flex items-center justify-center relative">
                    {record.guaType === 'yang' ? (
                      // 阳爻：一根长条
                      <div className="w-full h-full rounded-sm bg-current opacity-80 shadow-sm"></div>
                    ) : (
                      // 阴爻：两根短条，中间空开
                      <div className="w-full h-full flex justify-between">
                        <div className="w-[42%] h-full rounded-sm bg-current opacity-80 shadow-sm"></div>
                        <div className="w-[42%] h-full rounded-sm bg-current opacity-80 shadow-sm"></div>
                      </div>
                    )}
                  </div>

                  {/* 变爻标记 (x / o) */}
                  <div className="w-4 flex justify-center items-center">
                    {record.guaMark && (
                      <span className="font-bold text-sm transform scale-125">
                        {record.guaMark}
                      </span>
                    )}
                  </div>

                </div>

                {/* 4. 卦名 */}
                <div className={`text-sm font-bold w-12 text-right shrink-0 ${index === 0 ? record.guaColor : 'text-gray-300'}`}>
                  {record.guaName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部完成提示 */}
      <div className="mt-2 h-4 text-center">
        {history.length >= 6 && (
          <p className="text-indigo-500 text-[10px] font-medium tracking-widest">
            ✨ 六爻已成 ✨
          </p>
        )}
      </div>
    </div>
  );
};

// 辅助函数
function getYaoName(id) {
  const names = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
  return names[id - 1] || `${id}爻`;
}

export default HistoryList;