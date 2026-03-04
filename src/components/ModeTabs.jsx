import React from 'react';

const MODES = [
  { id: 'manual', label: '手动' },
  { id: 'semi', label: '半自动' },
  { id: 'full', label: '全自动' }
];

const ModeTabs = ({ selectedMode, onSwitchMode, disabled }) => {
  return (
    // 增加 dark:bg-slate-800, dark:border-slate-700
    <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 w-full transition-colors">
      {MODES.map(mode => (
        <button
          key={mode.id}
          onClick={() => onSwitchMode(mode.id)}
          disabled={disabled}
          className={`
            flex-1 py-2 text-sm font-bold rounded-lg transition-all
            /* 激活状态样式 */
            ${selectedMode === mode.id 
              ? 'bg-slate-700 dark:bg-indigo-600 text-white shadow-md' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}
            /* 禁用状态样式 */
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
};

export default ModeTabs;