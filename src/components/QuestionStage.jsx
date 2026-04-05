import React from 'react';
import constants from '../data/constants.json';

const QuestionStage = ({ question, setQuestion, onQuestionSubmit, isLocked, onRestart }) => {
  const { questionStage } = constants;

  const handleSubmit = React.useCallback(() => {
    if (question.trim().length > 0) {
      onQuestionSubmit(question);
    }
  }, [question, onQuestionSubmit]);

  const ruleEmojis = ['🙏', '💭', '⚖️'];

  return (
    /* 优化点 1: 移除 transition-all，改为 transition-transform/opacity 或只针对必要属性 */
    /* 优化点 2: 增加 will-change: transform 提升渲染层级 */
    <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 dark:border-slate-800 p-6 transition-opacity duration-300 overflow-hidden"
      style={{ willChange: 'transform' }}>

      <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
        <h3 className="text-slate-700 dark:text-slate-300 font-black text-lg tracking-widest">
          {questionStage.title}
        </h3>
      </div>

      {isLocked ? (
        <div className="flex flex-col gap-4 animate-slideUp">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
            <span className="text-gray-400 dark:text-slate-500 text-[10px] block mb-1 uppercase tracking-tighter">
              {questionStage.lockedLabel}
            </span>
            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              {question}
            </p>
          </div>

          <button
            onClick={onRestart}
            className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border border-indigo-200/50 dark:border-indigo-800/50 rounded-xl active:scale-95 transition-transform"
          >
            <span className="text-lg">↺</span> {questionStage.restartBtn}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="flex flex-wrap gap-2">
            {questionStage.quickSuggestions.map(item => (
              <button
                key={item}
                onClick={() => setQuestion(item)}
                className="text-[11px] px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 active:scale-95 transition-transform"
              >
                {item}
              </button>
            ))}
          </div>

          <textarea
            /* 优化点 3: 移除输入框在滑动时的过重阴影，仅在 Focus 时启用 */
            className="w-full h-18 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors resize-none text-sm placeholder:text-slate-300 dark:placeholder:text-slate-600"
            placeholder={questionStage.placeholder}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <button
            onClick={handleSubmit}
            disabled={question.trim().length === 0}
            className={`
              w-full py-3 rounded-xl font-bold transform active:scale-95 text-sm transition-all
              ${question.trim().length === 0
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-500/20'}
            `}
          >
            {questionStage.submitBtn}
          </button>

          {/* 渐变部分保持布局，优化绘图性能 */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-800/30">
            <h4 className="text-[12px] font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
              <span>✨</span> {questionStage.processTitle}
            </h4>
            <p className="text-[11px] text-indigo-900/70 dark:text-indigo-200/70 leading-relaxed italic">
              {questionStage.processDesc}
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-slate-100/50 dark:border-slate-800/30">
            <h4 className="text-[12px] font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <span>📜</span> {questionStage.rulesTitle}
            </h4>

            <div className="grid grid-cols-3 gap-1">
              {questionStage.rules.map((rule, idx) => (
                <div
                  key={rule}
                  className="flex flex-col items-center justify-center gap-1.5 border-r last:border-none border-slate-200/50 dark:border-slate-700/50"
                >
                  <span className="text-base leading-none">
                    {ruleEmojis[idx]}
                  </span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold tracking-tighter whitespace-nowrap">
                    {rule}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(QuestionStage);