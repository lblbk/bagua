import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { fetchAIInterpretation, generateDivinationPrompt } from '../utils/aiService';
import constants from '../data/constants.json';

const { guaAIStage } = constants;

/**
 * 1. 静态 Markdown 渲染配置 - 移出组件防止重复创建
 */
const mdComponents = {
  strong: ({ children }) => {
    const text = children?.toString() || "";
    // 判断是否为标题型加粗
    const isTitle = text.includes('：') || text.includes(':');
    return isTitle ? (
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
 * 2. 底部装饰名言组件 - 静态组件
 */
const QuoteFooter = React.memo(() => (
  <div className="mt-8 pt-4 border-t border-indigo-100/30 dark:border-slate-800 flex flex-col items-center gap-2 animate-fadeIn">
    <div className="flex gap-1.5 mb-1">
      {[1, 0.6, 0.3].map((o, i) => (
        <div key={i} className="w-0.5 h-0.5 bg-indigo-400 rounded-full" style={{ opacity: o }} />
      ))}
    </div>
    <p className="text-[10px] text-slate-400 dark:text-slate-500 tracking-[0.2em] font-medium italic text-center">
      {guaAIStage.footer.quote}
    </p>
    <p className="text-[8px] text-slate-300 dark:text-slate-600 scale-90 tracking-tighter">
      {guaAIStage.footer.source}
    </p>
  </div>
));

const GuaAIStage = ({ detail, zhiDetail, history, finalGuaInfo, question, savedResponse, onSaveRecord }) => {
  const [interp, setInterp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // 使用 Ref 维护流式数据，避免 React 渲染频率过高
  const streamRef = useRef({
    accumulated: "",
    buffer: "",
    timer: null
  });

  // 1. 响应外部记录切换
  useEffect(() => {
    if (savedResponse) {
      setInterp(savedResponse);
      setLoading(false);
      setError(null);
    } else {
      setInterp("");
      setLoading(false);
      setError(null);
    }
  }, [savedResponse]);

  // 2. 组件卸载清理
  useEffect(() => {
    return () => {
      if (streamRef.current.timer) clearInterval(streamRef.current.timer);
    };
  }, []);

  // 3. 执行 AI 解卦逻辑
  const handleInterpret = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);
    setInterp("");
    streamRef.current.accumulated = "";
    streamRef.current.buffer = "";

    const prompt = generateDivinationPrompt({ question, finalGuaInfo, benDetail: detail, zhiDetail, history });

    // 开启节流定时器：每 80ms 更新一次 UI，显著提升 H5 滑动性能
    streamRef.current.timer = setInterval(() => {
      if (streamRef.current.buffer.length > 0) {
        streamRef.current.accumulated += streamRef.current.buffer;
        streamRef.current.buffer = "";
        setInterp(streamRef.current.accumulated);
      }
    }, 80);

    try {
      await fetchAIInterpretation(
        prompt,
        (chunk) => {
          streamRef.current.buffer += chunk;
        },
        (err) => {
          setError(err || guaAIStage.errors.parseFailed);
          setLoading(false);
        }
      );
    } catch (err) {
      setError(guaAIStage.errors.serviceUnavailable);
    } finally {
      // 停止定时器并同步最终内容
      if (streamRef.current.timer) {
        clearInterval(streamRef.current.timer);
        streamRef.current.timer = null;
      }

      const finalText = streamRef.current.accumulated + streamRef.current.buffer;
      setInterp(finalText);
      setLoading(false);

      if (finalText) {
        onSaveRecord(finalText);
      }
    }
  }, [detail, zhiDetail, history, finalGuaInfo, question, onSaveRecord, loading]);

  return (
    <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-3xl shadow-xl border border-white/50 dark:border-slate-800 p-6 overflow-hidden transition-all duration-500">

      {/* 头部标题区 */}
      <div
        className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2 cursor-pointer group select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`w-2 h-2 bg-indigo-500 rounded-full ${loading ? 'animate-pulse' : ''}`} />
        <h3 className="text-slate-700 dark:text-slate-300 font-black text-lg tracking-widest flex-1">
          {guaAIStage.title}
        </h3>
        <span className={`text-gray-300 text-[10px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </div>

      {/* 内容展示区 - will-change 优化性能 */}
      <div
        className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
        style={{ willChange: 'max-height, opacity' }}
      >
        {!interp && !loading ? (
          /* 初始状态：显示按钮 */
          <div className="py-10 text-center flex flex-col items-center animate-fadeIn">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4 text-2xl shadow-inner">
              ✨
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 italic px-6 leading-relaxed">
              {guaAIStage.initial.quote}
            </p>
            <button
              onClick={handleInterpret}
              className="px-10 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 transition-all text-sm"
            >
              {guaAIStage.initial.button}
            </button>
          </div>
        ) : (
          /* 显示 AI 解读内容 */
          <div className="relative">
            <div className={`p-5 rounded-2xl border transition-all duration-500 bg-gradient-to-b from-indigo-50/20 to-transparent dark:from-indigo-950/10 ${loading ? 'border-indigo-200' : 'border-indigo-100 dark:border-slate-800 shadow-sm'}`}>
              <article className="prose prose-sm max-w-none prose-indigo">
                <ReactMarkdown components={mdComponents}>
                  {interp}
                </ReactMarkdown>
                {loading && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500/50 animate-pulse vertical-middle" />
                )}
              </article>
            </div>

            {loading && (
              <div className="flex justify-center items-center gap-2 mt-4 text-[10px] text-indigo-400 font-medium animate-fadeIn">
                <span className="animate-spin text-sm">⚙</span> {guaAIStage.loading}
              </div>
            )}

            {interp && !loading && <QuoteFooter />}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-[10px] rounded-xl border border-red-100 dark:border-red-900/30 text-center animate-shake">
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
};

// 使用 React.memo 配合 useCallback 达到最佳性能
export default React.memo(GuaAIStage);