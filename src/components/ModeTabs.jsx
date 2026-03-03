import React from 'react';

const MODES = [
  { id: 'manual', label: '手动' },
  { id: 'semi', label: '半自动' },
  { id: 'full', label: '全自动' }
];

const ModeTabs = ({ selectedMode, onSwitchMode, disabled }) => {
  return (
    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-full">
      {MODES.map(mode => (
        <button
          key={mode.id}
          onClick={() => onSwitchMode(mode.id)}
          disabled={disabled}
          className={`
            flex-1 py-2 text-sm font-bold rounded-lg transition-all
            ${selectedMode === mode.id 
              ? 'bg-slate-700 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50'}
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