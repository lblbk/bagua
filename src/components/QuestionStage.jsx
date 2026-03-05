import React, { useState } from 'react';

const QuestionStage = ({ onQuestionSubmit, isLocked }) => {
  const [question, setQuestion] = useState('');

  // 快捷输入选项
  const quickSuggestions = ["今日运势", "今日财运", "事业发展", "感情缘分", "健康平安"];

  const handleSubmit = () => {
    if (question.trim().length > 0) {
      onQuestionSubmit(question);
    }
  };

  return (
    <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 dark:border-slate-800 p-6 transition-all duration-500 overflow-hidden">
      
      {/* 标题部分 */}
      <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
        <h3 className="text-gray-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">
          占卜为何
        </h3>
      </div>
      
      {isLocked ? (
        /* 锁定后的状态 */
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl animate-slideUp border border-indigo-100 dark:border-indigo-900/30">
          <span className="text-gray-400 dark:text-slate-500 text-[10px] block mb-1 uppercase tracking-tighter">所问之事：</span>
          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            {question}
          </p>
        </div>
      ) : (
        /* 初始输入状态 */
        <div className="flex flex-col gap-6 animate-fadeIn">
          
          {/* 快捷输入按钮 */}
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map(item => (
              <button
                key={item}
                onClick={() => setQuestion(item)}
                className="text-[10px] px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              >
                {item}
              </button>
            ))}
          </div>

          {/* 文本输入框 */}
          <textarea 
            className="w-full h-28 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-all resize-none text-sm placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner"
            placeholder="心中默念所问之事，在此输入..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          {/* 提交按钮 */}
          <button 
            onClick={handleSubmit}
            disabled={question.trim().length === 0}
            className={`
              w-full py-3 rounded-xl font-bold transition-all transform active:scale-95
              ${question.trim().length === 0 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed' 
                : 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-lg shadow-indigo-500/20'}
            `}
          >
            开启占卜
          </button>

          {/* 新增：占卜过程说明 */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">占卜过程</h4>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed italic opacity-80">
              心中默念所求之事，摇动三枚钱币并掷出，待其落下判定阴阳。
              如此往复六次以成六爻，方可窥见事物发展之吉凶演化。
            </p>
          </div>

          {/* 修改：占卜原则部分 */}
          <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-3">
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest text-center">占卜原则</h4>
            <div className="flex justify-around items-center">
              {["不诚不占", "无疑不占", "不义不占"].map(rule => (
                <div key={rule} className="flex flex-col items-center gap-1">
                  <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                  <span className="text-[10px] font-medium tracking-tighter text-gray-400 dark:text-slate-500">
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