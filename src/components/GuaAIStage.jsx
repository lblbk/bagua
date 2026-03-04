import React, { useState } from 'react';
import { fetchAIInterpretation } from '../utils/aiService';

const GuaAIStage = ({ detail, history, finalGuaInfo }) => {
  const [interpretation, setInterpretation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // 增加折叠状态
  const [isExpanded, setIsExpanded] = useState(true);

  const handleInterpret = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);
    setInterpretation("");

    const prompt = `
      请为以下卦象进行占卜解析：
      本卦：${finalGuaInfo.benGua.commonName}
      之卦：${finalGuaInfo.zhiGua ? finalGuaInfo.zhiGua.commonName : "无变卦"}
      卦辞：${detail.guaCi}
      爻辞：${JSON.stringify(detail.yaoCi)}
      请给出详细的人生指引与建议。
    `;

    await fetchAIInterpretation(
      prompt, 
      (chunk) => setInterpretation((prev) => prev + chunk),
      (err) => setError(err)
    );
    
    setLoading(false);
  };

  return (
    <div className="w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 dark:border-gray-700 p-6 mt-6 transition-all duration-500 overflow-hidden">
      
      {/* 标题栏：与其它模块样式保持高度一致 */}
      <div 
        className="flex items-center gap-2 mb-2 pb-2 cursor-pointer hover:opacity-70 transition-opacity"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest">
          AI 解卦
        </h3>
        <span className={`text-gray-300 dark:text-gray-600 text-[10px] transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
          ▼
        </span>
      </div>

      {/* 内容区域：受 isExpanded 控制 */}
      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        {!interpretation && !loading && (
          <button 
            onClick={handleInterpret} 
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-lg font-bold transition-all shadow-md"
          >
            开始深度解析
          </button>
        )}

        {(loading || interpretation) && (
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-indigo-50/50 dark:bg-gray-900/50 p-4 rounded-lg border border-indigo-100 dark:border-gray-700 transition-colors">
            {interpretation}
            {loading && <span className="animate-pulse text-indigo-500 dark:text-indigo-400 font-bold">|</span>}
          </div>
        )}
        
        {error && <div className="text-sm text-red-500 dark:text-red-400 text-center mt-2">{error}</div>}
      </div>
    </div>
  );
};

export default GuaAIStage;