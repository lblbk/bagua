import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { fetchAIInterpretation, generateDivinationPrompt } from '../utils/aiService';

/**
 * 1. Markdown 渲染配置 - 调整为精致的小字号
 */
const mdComponents = {
  // 针对标题类加粗（带冒号）：由 text-lg 降为 text-sm
  strong: ({ children }) => {
    const text = children?.toString() || "";
    return text.includes('：') || text.includes(':') ? (
      <span className="block mt-5 mb-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm border-l-2 border-indigo-500 pl-2 tracking-wide">
        {children}
      </span>
    ) : (
      <strong className="text-indigo-600 dark:text-indigo-300 font-bold">
        {children}
      </strong>
    );
  },
  // 列表项：由 text-base 降为 text-xs
  li: ({ children }) => (
    <li className="mb-2 last:mb-0 flex gap-2 text-xs">
      <span className="text-indigo-400 mt-1 flex-shrink-0 text-[10px]">●</span>
      <span className="flex-1 leading-relaxed text-slate-600 dark:text-slate-300">
        {children}
      </span>
    </li>
  ),
  // 段落：由 text-base 降为 text-xs
  p: ({ children }) => (
    <p className="mb-3 leading-relaxed text-xs text-slate-600 dark:text-slate-300 last:mb-0">
      {children}
    </p>
  )
};

/**
 * 2. 底部装饰名言组件 - 保持微缩比例
 */
const QuoteFooter = () => (
  <div className="mt-8 pt-4 border-t border-indigo-100/30 dark:border-slate-800 flex flex-col items-center gap-2 animate-fadeIn">
    <div className="flex gap-1.5 mb-1">
      {[1, 0.6, 0.3].map((o, i) => (
        <div key={i} className="w-0.5 h-0.5 bg-indigo-400 rounded-full" style={{ opacity: o }} />
      ))}
    </div>
    <p className="text-[10px] text-slate-400 dark:text-slate-500 tracking-[0.2em] font-medium italic">
      「 变动不居，周流六虚，唯变所适 」
    </p>
    <p className="text-[8px] text-slate-300 dark:text-slate-600 scale-90 tracking-tighter">
      — 《易·系辞》
    </p>
  </div>
);

const GuaAIStage = ({ detail, zhiDetail, history, finalGuaInfo, question }) => {
  const [interp, setInterp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleInterpret = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setInterp("");

    const prompt = generateDivinationPrompt({ question, finalGuaInfo, benDetail: detail, zhiDetail, history });

    try {
      await fetchAIInterpretation(
        prompt, 
        (chunk) => setInterp(prev => prev + chunk),
        (err) => setError(err || "解析失败")
      );
    } catch (err) {
      setError("AI 服务暂时不可用");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-3xl shadow-xl border border-white/50 dark:border-slate-800 p-6 mt-6 overflow-hidden transition-all duration-500">
      {/* 头部标题栏 */}
      <div 
        className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-slate-800 cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
        <h3 className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest flex-1">
          易数推演
        </h3>
        <span className={`text-gray-300 text-[10px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </div>

      <div className={`transition-all duration-500 ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {!interp && !loading ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4 text-2xl">
              ✨
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 italic px-6 leading-relaxed">
              “大衍之数五十，其用四十有九”<br/>
              天机正在演算，为您窥探卦中玄机...
            </p>
            <button 
              onClick={handleInterpret} 
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all text-sm"
            >
              <span className="relative z-10 flex items-center gap-2 text-base">
                洞见天机 <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
              <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 -translate-x-full" />
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* 内容主容器：背景色变淡，去掉过重的阴影 */}
            <div className={`p-5 rounded-2xl border transition-colors duration-500 bg-gradient-to-b from-indigo-50/20 to-transparent dark:from-indigo-950/10 ${loading ? 'border-indigo-200 animate-pulse' : 'border-indigo-100 dark:border-slate-800'}`}>
              
              <article className="prose prose-sm max-w-none prose-indigo">
                <ReactMarkdown components={mdComponents}>
                  {interp}
                </ReactMarkdown>
                
                {loading && (
                  <span className="inline-block w-1 h-3 ml-1 bg-indigo-500/50 animate-bounce align-middle" />
                )}
              </article>
            </div>

            {loading && (
              <div className="flex justify-center items-center gap-2 mt-4 text-[10px] text-indigo-400 italic">
                <span className="animate-spin">⚙</span>
                正在为您解读卦象...
              </div>
            )}

            {interp && !loading && <QuoteFooter />}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-500 text-[10px] rounded-xl border border-red-100 text-center">
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuaAIStage;