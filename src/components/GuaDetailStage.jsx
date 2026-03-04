import React, { useState } from 'react';

const GuaDetailStage = ({ detail, zhiDetail, history }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeGua, setActiveGua] = useState('ben');

  const currentDetail = activeGua === 'ben' ? detail : zhiDetail;
  
  // 匹配变爻的逻辑：将 history 反转为 [初爻, ...上爻] 以匹配爻辞顺序
  const sortedHistory = [...history].reverse(); 
  const isLineMoving = (index) => {
    if (activeGua !== 'ben') return false; // 只有本卦展示变动
    return !!sortedHistory[index]?.guaMark;
  };

  if (!detail) return null;

  return (
    <div className="w-full bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 p-6 mt-6 transition-all duration-500 overflow-hidden">
      
      {/* 标题栏：箭头紧跟在文字后 */}
      <div 
        className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 cursor-pointer hover:opacity-70 transition-opacity"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest whitespace-nowrap">
          卦辞详解
        </h3>
        <span className={`text-gray-300 text-[10px] transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
          ▼
        </span>
      </div>

      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        
        {/* Tab 切换 */}
        {zhiDetail && (
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            <button 
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeGua === 'ben' ? 'bg-white shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => setActiveGua('ben')}
            >本卦</button>
            <button 
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeGua === 'zhi' ? 'bg-white shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => setActiveGua('zhi')}
            >变卦</button>
          </div>
        )}

        <div className="space-y-6 text-gray-700">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-indigo-400 pl-3">
            {currentDetail.title}
          </h2>

          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">卦象</h4>
            <p className="text-lg font-mono bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">{currentDetail.image}</p>
          </section>

          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">卦辞</h4>
            <p className="text-sm leading-relaxed text-gray-600 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">{currentDetail.guaCi}</p>
          </section>

          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">象曰</h4>
            <p className="text-sm leading-relaxed text-gray-600 italic pl-3 border-l-2 border-indigo-200">{currentDetail.xiangYue}</p>
          </section>

          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">爻辞</h4>
            <div className="grid gap-2">
              {currentDetail.yaoCi.map((item, i) => {
                const isMoving = isLineMoving(i);
                return (
                  <div key={i} className={`
                    text-xs leading-relaxed p-3 rounded-lg border transition-all duration-300
                    ${isMoving 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 border-indigo-700 scale-[1.02]' 
                      : 'bg-indigo-50/30 border-indigo-50 text-gray-600'}
                  `}>
                    <span className={`font-bold mr-2 ${isMoving ? 'text-white' : 'text-indigo-700'}`}>
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