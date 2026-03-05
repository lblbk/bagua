import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { fetchAIInterpretation, generateDivinationPrompt } from '../utils/aiService';

/**
 * 1. Markdown 渲染配置 - 增强字号与间距
 */
const mdComponents = {
  // 针对加粗文字的渲染：如果是标题类加粗（带冒号），显示为大号块状标题
  strong: ({ children }) => {
    const text = children?.toString() || "";
    return text.includes('：') ? (
      <span className="block mt-8 mb-4 text-indigo-600 dark:text-indigo-400 font-bold text-base sm:text-lg border-l-4 border-indigo-500 pl-3 tracking-wide">
        {children}
      </span>
    ) : (
      <strong className="text-indigo-600 dark:text-indigo-300 font-bold">
        {children}
      </strong>
    );
  },
  // 列表项：增大字号，增加间距
  li: ({ children }) => (
    <li className="mb-4 last:mb-0 flex gap-3 text-sm sm:text-base">
      <span className="text-indigo-400 mt-1.5 flex-shrink-0 text-xs">●</span>
      <span className="flex-1 leading-relaxed text-slate-700 dark:text-slate-200">
        {children}
      </span>
    </li>
  ),
  // 段落：增大字号，使用更宽松的行高
  p: ({ children }) => (
    <p className="mb-5 leading-loose text-sm sm:text-base text-slate-700 dark:text-slate-200 last:mb-0">
      {children}
    </p>
  )
};

/**
 * 2. 底部装饰名言组件
 */
const QuoteFooter = () => (
  <div className="mt-12 pt-6 border-t border-indigo-100/50 dark:border-slate-800 flex flex-col items-center gap-3 animate-fadeIn">
    <div className="flex gap-2 mb-1">
      {[1, 0.6, 0.3].map((o, i) => (
        <div key={i} className="w-1 h-1 bg-indigo-400 rounded-full" style={{ opacity: o }} />
      ))}
    </div>
    <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 tracking-[0.3em] font-medium italic">
      「 变动不居，周流六虚，唯变所适 」
    </p>
    <p className="text-[9px] sm:text-[10px] text-slate-300 dark:text-slate-600 scale-90 tracking-wider">
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

    // 生成 Prompt
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
        (chunk) => setInterp(prev => prev + chunk), // 流式更新
        (err) => setError(err || "解析失败，请检查网络。")
      );
    } catch (err) {
      setError("AI 服务暂时不可用，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-slate-800 p-6 md:p-8 mt-8 overflow-hidden transition-all duration-500">
      {/* 头部标题栏 */}
      <div 
        className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100 dark:border-slate-800 cursor-pointer group" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
        <h3 className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-[0.2em] flex-1">
          易数推演
        </h3>
        <span className={`text-gray-300 text-xs transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </div>

      <div className={`transition-all duration-700 ease-in-out ${isExpanded ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {!interp && !loading ? (
          /* 初始状态：洞见天机按钮 */
          <div className="py-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6 text-3xl shadow-inner">
              ✨
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-8 italic px-6 leading-relaxed max-w-sm">
              “大衍之数五十，其用四十有九”<br/>
              天机正在演算，为您窥探卦中玄机...
            </p>
            <button 
              onClick={handleInterpret} 
              className="group relative px-10 py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white rounded-2xl font-bold shadow-[0_10px_20px_rgba(99,102,241,0.3)] active:scale-95 transition-all hover:shadow-[0_15px_25px_rgba(99,102,241,0.4)] overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2 text-base">
                洞见天机 <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
              <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 -translate-x-full" />
            </button>
          </div>
        ) : (
          /* 结果展示状态 */
          <div className="relative">
            <div className={`p-6 md:p-10 rounded-[2rem] border transition-colors duration-500 bg-gradient-to-b from-indigo-50/30 to-white/50 dark:from-indigo-950/10 dark:to-transparent ${loading ? 'border-indigo-200 animate-pulse' : 'border-indigo-100 dark:border-slate-800'}`}>
              
              {/* Markdown 内容主容器：提升字号核心位置 */}
              <article className="prose prose-indigo max-w-none">
                <ReactMarkdown components={mdComponents}>
                  {interp}
                </ReactMarkdown>
                
                {/* 模拟打字机光标 */}
                {loading && (
                  <span className="inline-block w-2 h-5 ml-1 bg-indigo-500/60 animate-pulse align-middle rounded-sm" />
                )}
              </article>

            </div>

            {/* 加载中的状态提示 */}
            {loading && (
              <div className="flex justify-center items-center gap-3 mt-6 text-sm text-indigo-400 italic animate-fadeIn">
                <span className="animate-spin text-base">⌛</span>
                AI 正在参悟阴阳转化之理...
              </div>
            )}

            {/* 完成后的装饰 */}
            {interp && !loading && <QuoteFooter />}
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mt-6 p-5 bg-red-50 dark:bg-red-900/10 text-red-500 text-sm rounded-2xl border border-red-100 dark:border-red-900/20 text-center flex items-center justify-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuaAIStage;