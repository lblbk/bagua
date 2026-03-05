import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown'; // 引入 Markdown 渲染组件
import { fetchAIInterpretation, generateDivinationPrompt } from '../utils/aiService';

const GuaAIStage = ({ detail, zhiDetail, history, finalGuaInfo, question }) => {
  const [interpretation, setInterpretation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleInterpret = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setInterpretation("");

    const prompt = generateDivinationPrompt({
      question,
      finalGuaInfo,
      benDetail: detail,
      zhiDetail,
      history
    });

    try {
      await fetchAIInterpretation(
        prompt, 
        (chunk) => setInterpretation((prev) => prev + chunk),
        (err) => {
          console.error(err);
          setError("解析失败，请检查网络或配置。");
        }
      );
    } catch (e) {
      setError("AI 服务不可用。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 dark:border-slate-800 p-6 mt-6 transition-all duration-500 overflow-hidden">
      {/* 标题栏 */}
      <div 
        className="flex items-center gap-2 mb-2 pb-2 cursor-pointer hover:opacity-70 transition-opacity"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest">AI 深度解卦</h3>
        <span className={`text-gray-300 text-[10px] transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>▼</span>
      </div>

      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100 mt-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        {!interpretation && !loading ? (
          <div className="text-center py-6">
            <p className="text-xs text-slate-400 mb-6 italic">结合周易古籍与 AI 逻辑，为您提供针对性的行事建议</p>
            <button 
              onClick={handleInterpret} 
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 transform active:scale-[0.98]"
            >
              开启大师级解析
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Markdown 渲染容器 */}
            <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300 
              prose-headings:text-indigo-700 dark:prose-headings:text-indigo-400 
              prose-strong:text-indigo-600 dark:prose-strong:text-indigo-300
              prose-li:marker:text-indigo-400
              bg-indigo-50/30 dark:bg-slate-800/50 p-6 rounded-xl border border-indigo-100/50 dark:border-slate-700 shadow-inner">
              
              <ReactMarkdown>{interpretation}</ReactMarkdown>
              
              {loading && <span className="inline-block w-2 h-4 ml-1 bg-indigo-500 animate-pulse align-middle"></span>}
            </div>

            {loading && (
              <p className="text-[10px] text-indigo-400 mt-4 animate-pulse font-medium text-center tracking-widest">
                AI 正在推演乾坤，请稍候...
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-500 text-xs rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuaAIStage;