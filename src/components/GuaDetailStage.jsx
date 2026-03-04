import React, { useState } from 'react';

const GuaDetailStage = ({ detail }) => {
  // 需求：默认展开，支持折叠
  const [isExpanded, setIsExpanded] = useState(true);
  
  if (!detail) return null;

  return (
    <div className="w-full bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 p-6 mt-6 transition-all duration-500 overflow-hidden">
      
      {/* 标题栏：与上方模块保持完全一致的样式 */}
      <div 
        className="flex items-center gap-2 mb-2 pb-2 cursor-pointer hover:opacity-70 transition-opacity"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest">卦辞</h3>
        <span className={`text-gray-300 text-[10px] transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
          ▼
        </span>
      </div>

      {/* 内容区域 */}
      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-indigo-400 pl-3">
          {detail.title}
        </h2>
        
        <div className="space-y-6 text-gray-700">
          {/* 卦象 */}
          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">卦象</h4>
            <p className="text-xl font-mono tracking-[0.5em] bg-gray-50 p-3 rounded-lg border border-gray-100">{detail.image}</p>
          </section>

          {/* 卦辞 */}
          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">卦辞</h4>
            <p className="text-sm leading-relaxed text-gray-600 bg-white p-3 rounded-lg border border-gray-50">{detail.guaCi}</p>
          </section>

          {/* 象曰 */}
          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">象曰</h4>
            <p className="text-sm leading-relaxed text-gray-600 italic pl-3 border-l-2 border-indigo-200">{detail.xiangYue}</p>
          </section>

          {/* 爻辞 */}
          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">爻辞</h4>
            <div className="grid gap-2">
              {detail.yaoCi.map((line, i) => (
                <div key={i} className="text-xs leading-relaxed bg-indigo-50/30 p-3 rounded-lg border border-indigo-50 hover:bg-indigo-50 transition-colors">
                  {line}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GuaDetailStage;