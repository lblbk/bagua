import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { fetchAIInterpretation, generateDivinationPrompt } from '../utils/aiService';

// 1. Markdown 渲染配置
const mdComponents = {
  strong: ({ children }) => children.toString().includes('：') 
    ? <span className="block mt-4 mb-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm border-l-2 border-indigo-500 pl-2">{children}</span>
    : <strong className="text-indigo-600 dark:text-indigo-300 font-bold">{children}</strong>,
  li: ({ children }) => <li className="mb-2 last:mb-0 flex gap-2"><span className="text-indigo-400 mt-1">•</span><span className="flex-1">{children}</span></li>,
  p: ({ children }) => <p className="mb-3 leading-relaxed last:mb-0">{children}</p>
};

// 2. 底部装饰名言组件
const QuoteFooter = () => (
  <div className="mt-8 pt-4 border-t border-indigo-100/30 dark:border-slate-800 flex flex-col items-center gap-2 animate-fadeIn">
    <div className="flex gap-1 mb-1">
      {[1, 0.5, 0.2].map((o, i) => <div key={i} className="w-0.5 h-0.5 bg-indigo-300 rounded-full" style={{ opacity: o }} />)}
    </div>
    <p className="text-[10px] text-slate-400 dark:text-slate-500 tracking-[0.3em] font-medium italic">「 变动不居，周流六虚，唯变所适 」</p>
    <p className="text-[8px] text-slate-300 dark:text-slate-600 scale-90 tracking-tighter">— 《易·系辞》</p>
  </div>
);

const GuaAIStage = ({ detail, zhiDetail, history, finalGuaInfo, question }) => {
  const [interp, setInterp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleInterpret = async () => {
    if (loading) return;
    setLoading(true); setError(null); setInterp("");
    const prompt = generateDivinationPrompt({ question, finalGuaInfo, benDetail: detail, zhiDetail, history });
    try {
      await fetchAIInterpretation(prompt, (c) => setInterp(v => v + c), () => setError("解析失败，请检查网络。"));
    } catch { setError("AI 服务不可用。"); } finally { setLoading(false); }
  };

  return (
    <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-3xl shadow-xl border border-white/50 dark:border-slate-800 p-6 mt-6 overflow-hidden transition-all duration-500">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-slate-800 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest flex-1">易数推演</h3>
        <span className={`text-gray-300 text-[10px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </div>

      <div className={`transition-all duration-500 ${isExpanded ? 'max-h-[5000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        {!interp && !loading ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4 text-2xl">✨</div>
            <p className="text-xs text-slate-400 mb-6 italic px-4 leading-relaxed">“大衍之数五十，其用四十有九”<br/>天机正在演算，为您窥探卦中玄机...</p>
            <button onClick={handleInterpret} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 text-sm">洞见天机</button>
          </div>
        ) : (
          <div className="relative">
            <div className={`p-6 rounded-2xl border bg-gradient-to-b from-indigo-50/20 to-transparent dark:from-indigo-950/10 ${loading ? 'border-indigo-200 animate-pulse' : 'border-indigo-100 dark:border-slate-800'}`}>
              <article className="prose prose-sm max-w-none text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                <ReactMarkdown components={mdComponents}>{interp}</ReactMarkdown>
                {loading && <span className="inline-block w-1.5 h-3.5 ml-1 bg-indigo-500/50 animate-bounce align-middle" />}
              </article>
            </div>
            {loading && <div className="flex justify-center gap-2 mt-4 text-[10px] text-indigo-400 italic"><span>⚙</span>AI 正在参悟阴阳转化之理...</div>}
            {interp && !loading && <QuoteFooter />}
          </div>
        )}
        {error && <div className="mt-4 p-4 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100 text-center">⚠️ {error}</div>}
      </div>
    </div>
  );
};

export default GuaAIStage;