// QuestionStage.jsx
import React from 'react';
import constants from '../data/constants.json';

const QuestionStage = ({ question, setQuestion, onQuestionSubmit, isLocked, onRestart }) => {
  const { questionStage } = constants;

  const handleSubmit = () => {
    if (question.trim().length > 0) {
      onQuestionSubmit(question);
    }
  };

  // 保留 Emoji 对应关系
  const ruleEmojis = ['🙏', '💭', '⚖️'];

  return (
    <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 dark:border-slate-800 p-6 transition-all duration-500 overflow-hidden">

      {/* 1. 标题部分 */}
      <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
        <h3 className="text-slate-700 dark:text-slate-300 font-black text-lg tracking-widest">
          {questionStage.title}
        </h3>
      </div>

      {isLocked ? (
        /* 2. 锁定状态 */
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
            className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border border-indigo-200/50 dark:border-indigo-800/50 rounded-xl transition-all active:scale-95"
          >
            <span className="text-lg">↺</span> {questionStage.restartBtn}
          </button>
        </div>
      ) : (
        /* 3. 初始输入状态 */
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* 快速建议 */}
          <div className="flex flex-wrap gap-2">
            {questionStage.quickSuggestions.map(item => (
              <button
                key={item}
                onClick={() => setQuestion(item)}
                className="text-[11px] px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              >
                {item}
              </button>
            ))}
          </div>

          {/* 输入框 */}
          <textarea
            className="w-full h-18 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-all resize-none text-sm placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner"
            placeholder={questionStage.placeholder}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
            disabled={question.trim().length === 0}
            className={`
              w-full py-3 rounded-xl font-bold transition-all transform active:scale-95 text-sm
              ${question.trim().length === 0
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-lg shadow-indigo-500/20'}
            `}
          >
            {questionStage.submitBtn}
          </button>

          {/* 占卜过程说明 - 保持原样 */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-800/30">
            <h4 className="text-[12px] font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
              <span>✨</span> {questionStage.processTitle}
            </h4>
            <p className="text-[11px] text-indigo-900/70 dark:text-indigo-200/70 leading-relaxed italic">
              {questionStage.processDesc}
            </p>
          </div>

          {/* 占卜原则部分 - 已改成和占卜过程一样的设计，且三项横排 */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-slate-100/50 dark:border-slate-800/30">
            <h4 className="text-[12px] font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <span>📜</span> {questionStage.rulesTitle}
            </h4>

            {/* 使用 grid 布局实现等宽横排 */}
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

export default QuestionStage;