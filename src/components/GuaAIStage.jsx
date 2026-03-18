import React, { useState, useRef, useEffect } from 'react';
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

  // 核心优化 1：引入 ref 防止组件卸载导致定时器内存泄漏
  const timerRef = useRef(null);

  // 核心优化 2：组件卸载时强制清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleInterpret = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setInterp("");

    const prompt = generateDivinationPrompt({ question, finalGuaInfo, benDetail: detail, zhiDetail, history });

    // --- 核心优化区：缓存池与节流渲染 ---
    let accumulatedText = ""; // 记录已经渲染到页面的完整文本
    let bufferText = "";      // 暂存刚刚收到但还没渲染的碎片文本

    // 设定一个 60ms 的节流定时器 (约等于 16fps，肉眼看起来非常丝滑且不卡顿)
    timerRef.current = setInterval(() => {
      if (bufferText.length > 0) {
        accumulatedText += bufferText;
        bufferText = ""; // 清空暂存区
        setInterp(accumulatedText); // 统一触发 React 渲染
      }
    }, 60);

    try {
      await fetchAIInterpretation(
        prompt, 
        (chunk) => {
          // 收到数据时，绝对不直接触发 setState，而是塞进缓存池
          bufferText += chunk;
        },
        (err) => setError(err || "解析失败")
      );
    } catch (err) {
      setError("AI 服务暂时不可用");
    } finally {
      // 无论成功还是失败，结束时必须清理定时器
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // 把最后剩下的一点尾巴渲染出来
      if (bufferText.length > 0) {
        accumulatedText += bufferText;
        setInterp(accumulatedText);
      }
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
          推演
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
              “大衍之数五十，其用四十有九”
            </p>
            <button 
              onClick={handleInterpret} 
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all text-sm group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2 text-base">
                洞见天机
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
                
                {/* 模拟打字机光标闪烁 */}
                {loading && (
                  <span className="inline-block w-1 h-3 ml-1 bg-indigo-500/50 animate-bounce align-middle" />
                )}
              </article>
            </div>

            {loading && (
              <div className="flex justify-center items-center gap-2 mt-4 text-[10px] text-indigo-400 italic">
                <span className="animate-spin text-sm">⚙</span>
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