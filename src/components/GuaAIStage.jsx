import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { fetchAIInterpretation, generateDivinationPrompt } from '../utils/aiService';
// 引入常量
import constants from '../data/constants.json';

const { guaAIStage } = constants;

/**
 * 1. Markdown 渲染配置
 */
const mdComponents = {
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
  li: ({ children }) => (
    <li className="mb-2 last:mb-0 flex gap-2 text-xs">
      <span className="text-indigo-400 mt-1 flex-shrink-0 text-[10px]">●</span>
      <span className="flex-1 leading-relaxed text-slate-600 dark:text-slate-300">
        {children}
      </span>
    </li>
  ),
  p: ({ children }) => (
    <p className="mb-3 leading-relaxed text-xs text-slate-600 dark:text-slate-300 last:mb-0">
      {children}
    </p>
  )
};

/**
 * 2. 底部装饰名言组件
 */
const QuoteFooter = () => (
  <div className="mt-8 pt-4 border-t border-indigo-100/30 dark:border-slate-800 flex flex-col items-center gap-2 animate-fadeIn">
    <div className="flex gap-1.5 mb-1">
      {[1, 0.6, 0.3].map((o, i) => (
        <div key={i} className="w-0.5 h-0.5 bg-indigo-400 rounded-full" style={{ opacity: o }} />
      ))}
    </div>
    <p className="text-[10px] text-slate-400 dark:text-slate-500 tracking-[0.2em] font-medium italic">
      {guaAIStage.footer.quote}
    </p>
    <p className="text-[8px] text-slate-300 dark:text-slate-600 scale-90 tracking-tighter">
      {guaAIStage.footer.source}
    </p>
  </div>
);

const GuaAIStage = ({ detail, zhiDetail, history, finalGuaInfo, question, savedResponse, onSaveRecord }) => {
  const [interp, setInterp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const timerRef = useRef(null);

  // 【关键修改 1】：监听 savedResponse
  // 当从日历选择历史记录时，App.jsx 会改变 savedResponse
  useEffect(() => {
    // 如果有已保存的 AI 回复，直接显示，停止 loading
    if (savedResponse) {
      setInterp(savedResponse);
      setLoading(false);
      setError(null);
    } else {
      // 如果没有（说明是新卦或者还没解卦的历史记录），清空内容，显示解卦按钮
      setInterp("");
      setLoading(false);
    }
  }, [savedResponse]); // 必须依赖 savedResponse

  // 清理定时器
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

    let accumulatedText = "";
    let bufferText = "";

    timerRef.current = setInterval(() => {
      if (bufferText.length > 0) {
        accumulatedText += bufferText;
        bufferText = "";
        setInterp(accumulatedText);
      }
    }, 60);

    try {
      await fetchAIInterpretation(
        prompt,
        (chunk) => {
          bufferText += chunk;
        },
        (err) => {
          setError(err || guaAIStage.errors.parseFailed);
          setLoading(false);
        }
      );
    } catch (err) {
      setError(guaAIStage.errors.serviceUnavailable);
      setLoading(false);
    } finally {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // 确保最后的 buffer 刷入
      const finalText = accumulatedText + bufferText;
      if (finalText) {
        setInterp(finalText);
        // 【关键修改 2】：解卦完成后回调 App.jsx 进行保存/更新
        onSaveRecord(finalText);
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-3xl shadow-xl border border-white/50 dark:border-slate-800 p-6 overflow-hidden transition-all duration-500">

      {/* 头部标题 */}
      <div
        className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
        <h3 className="text-slate-700 dark:text-slate-300 font-black text-lg tracking-widest flex-1">
          {guaAIStage.title}
        </h3>
        <span className={`text-gray-300 text-[10px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </div>

      <div className={`transition-all duration-500 ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>

        {/* 逻辑判定：如果没有内容且不在加载，显示按钮；否则显示内容 */}
        {(!interp && !loading) ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4 text-2xl">
              ✨
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 italic px-6 leading-relaxed">
              {guaAIStage.initial.quote}
            </p>
            <button
              onClick={handleInterpret}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all text-sm"
            >
              {guaAIStage.initial.button}
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className={`p-5 rounded-2xl border transition-colors duration-500 bg-gradient-to-b from-indigo-50/20 to-transparent dark:from-indigo-950/10 ${loading ? 'border-indigo-200 animate-pulse' : 'border-indigo-100 dark:border-slate-800'}`}>
              <article className="prose prose-sm max-w-none prose-indigo">
                <ReactMarkdown components={mdComponents}>
                  {interp}
                </ReactMarkdown>
                {loading && <span className="inline-block w-1 h-3 ml-1 bg-indigo-500/50 animate-bounce" />}
              </article>
            </div>

            {loading && (
              <div className="flex justify-center items-center gap-2 mt-4 text-[10px] text-indigo-400 italic">
                <span className="animate-spin text-sm">⚙</span> {guaAIStage.loading}
              </div>
            )}

            {/* 只有在非加载状态且有内容时显示底部 */}
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