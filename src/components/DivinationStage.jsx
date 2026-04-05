import React from 'react';
import SingleCoin from './SingleCoin';
import constants from '../data/constants.json';

// 1. 模式组件
const ModeTabs = ({ selectedMode, onSwitchMode, disabled }) => {
  const { modes } = constants.divinationStage;

  return (
    <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 w-full">
      {['manual', 'semi', 'full'].map((id) => (
        <button
          key={id}
          disabled={disabled}
          onClick={() => onSwitchMode(id)}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${selectedMode === id ? 'bg-slate-700 dark:bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {/* 直接利用对象的键映射文案 */}
          {modes[id]}
        </button>
      ))}
    </div>
  );
};

// 2. 控制面板组件
const ControlPanel = ({ status, selectedMode, isAutoSequence, historyCount, onMainAction }) => {
  const { controls } = constants.divinationStage;

  // 核心：使用对象映射消除逻辑嵌套，引用常量
  const config = {
    idle: {
      text: controls.idle[selectedMode],
      color: 'bg-green-500 hover:bg-green-600 dark:bg-emerald-600 dark:hover:bg-emerald-700'
    },
    spinning: {
      text: selectedMode === 'manual' ? controls.spinning.manual : controls.spinning.auto,
      color: 'bg-red-500 hover:bg-red-600 dark:bg-rose-700 dark:hover:bg-rose-800'
    },
    stopping: { text: controls.stopping, color: 'bg-gray-400 dark:bg-slate-700' },
    finished: { text: controls.finished, color: 'bg-slate-100 dark:bg-slate-800 !text-slate-400 cursor-not-allowed' }
  };

  const current = config[status];
  const isDisabled = status === 'finished' || status === 'stopping' || (selectedMode === 'full' && isAutoSequence);
  const btnText = isAutoSequence && status !== 'finished'
    ? `${controls.autoSpinningPrefix} (${historyCount + 1}/6)`
    : current.text;

  return (
    <div className="w-full h-14">
      <button
        disabled={isDisabled}
        onClick={onMainAction}
        className={`w-full py-3 rounded-xl text-lg font-bold text-white shadow-lg transition-all active:scale-95 ${current.color} ${isDisabled && status !== 'finished' ? 'opacity-80 cursor-not-allowed' : ''
          }`}
      >
        {btnText}
      </button>
    </div>
  );
};

// 3. 主舞台组件
const DivinationStage = ({ status, selectedMode, isAutoSequence, historyCount, coinRefs, onSwitchMode, onMainAction, onStopComplete }) => {
  const isLocked = status !== 'idle' || isAutoSequence || historyCount > 0;

  return (
    <div className="w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 p-6 flex flex-col gap-6 transition-all duration-500">
      <ModeTabs selectedMode={selectedMode} onSwitchMode={onSwitchMode} disabled={isLocked} />

      <div className="w-full py-4 flex justify-center gap-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
        {[0, 1, 2].map(i => (
          <SingleCoin key={i} index={i} ref={coinRefs[i]} onStopComplete={onStopComplete} />
        ))}
      </div>

      <ControlPanel
        status={status}
        selectedMode={selectedMode}
        isAutoSequence={isAutoSequence}
        historyCount={historyCount}
        onMainAction={onMainAction}
      />
    </div>
  );
};

export default React.memo(DivinationStage);