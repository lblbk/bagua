import React from 'react';

const ControlPanel = ({ 
  status, 
  selectedMode, 
  isAutoSequence, 
  historyCount, 
  onMainAction, 
  onRestart 
}) => {
  
  if (status === 'finished') {
    return (
      <div className="w-full h-14">
        <button 
          onClick={onRestart}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-colors"
        >
          ↺ 重新开始
        </button>
      </div>
    );
  }

  const isDisabled = status === 'stopping' || (selectedMode === 'full' && isAutoSequence);

  return (
    <div className="w-full h-14">
      <button 
        onClick={onMainAction}
        disabled={isDisabled}
        className={`
          w-full py-3 rounded-xl text-lg font-bold text-white shadow-lg transition-all active:scale-[0.98]
          /* 禁用状态适配 */
          ${isDisabled ? 'bg-gray-400 dark:bg-slate-700 cursor-not-allowed opacity-80' : ''}
          /* 空闲状态适配 (绿色 -> 稍微调暗的深绿色以适应暗黑) */
          ${status === 'idle' && !isAutoSequence ? 'bg-green-500 hover:bg-green-600 dark:bg-emerald-600 dark:hover:bg-emerald-700' : ''}
          /* 转动状态适配 (红色 -> 稍微调暗的深红色以适应暗黑) */
          ${status === 'spinning' && !isAutoSequence ? 'bg-red-500 hover:bg-red-600 dark:bg-rose-700 dark:hover:bg-rose-800' : ''}
        `}
      >
        {isAutoSequence ? (
           `自动排盘中... (第 ${historyCount + 1}/6 爻)`
        ) : (
           <>
             {status === 'idle' && (
                selectedMode === 'manual' ? '开始转动' : 
                selectedMode === 'semi' ? '掷一次' : 
                '开始排盘 (自动六次)'
             )}
             {status === 'spinning' && (
                selectedMode === 'manual' ? '点击停止' : 
                '转动中...'
             )}
             {status === 'stopping' && '正在减速...'}
           </>
        )}
      </button>
    </div>
  );
};

export default ControlPanel;