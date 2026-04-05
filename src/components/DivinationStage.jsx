import React from 'react';
import SingleCoin from './SingleCoin';
import constants from '../data/constants.json';

// 优化 1: 使用 React.memo 包裹内部组件，防止不必要的重绘
const ModeTabs = React.memo(({ selectedMode, onSwitchMode, disabled }) => {
  const { modes } = constants.divinationStage;

  return (
    <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 w-full">
      {['manual', 'semi', 'full'].map((id) => (
        <button
          key={id}
          disabled={disabled}
          onClick={() => onSwitchMode(id)}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${selectedMode === id
            ? 'bg-slate-700 dark:bg-indigo-600 text-white shadow-md'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {modes[id]}
        </button>
      ))}
    </div>
  );
});

// 优化 1: 使用 React.memo 包裹
const ControlPanel = React.memo(({ status, selectedMode, isAutoSequence, historyCount, onMainAction }) => {
  const { controls } = constants.divinationStage;

  const config = {
    idle: {
      text: controls.idle[selectedMode],
      color: 'bg-green-500 active:bg-green-600 dark:bg-emerald-600 dark:active:bg-emerald-700'
    },
    spinning: {
      text: selectedMode === 'manual' ? controls.spinning.manual : controls.spinning.auto,
      color: 'bg-red-500 active:bg-red-600 dark:bg-rose-700 dark:active:bg-rose-800'
    },
    stopping: { text: controls.stopping, color: 'bg-gray-400 dark:bg-slate-700' },
    finished: { text: controls.finished, color: 'bg-slate-100 dark:bg-slate-800 !text-slate-400' }
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
        // 优化：移除 transition-all，改为具体的 scale 变换
        className={`w-full py-3 rounded-xl text-lg font-bold text-white shadow-lg active:scale-[0.98] transition-transform ${current.color} ${isDisabled && status !== 'finished' ? 'opacity-80 cursor-not-allowed' : ''
          }`}
      >
        {btnText}
      </button>
    </div>
  );
});

const DivinationStage = ({ status, selectedMode, isAutoSequence, historyCount, coinRefs, onSwitchMode, onMainAction, onStopComplete }) => {
  const isLocked = status !== 'idle' || isAutoSequence || historyCount > 0;

  return (
    // 优化 2: 移除 backdrop-blur 和 transition-all duration-500
    // 这种大容器在滑动时带高斯模糊会非常卡
    <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-6 flex flex-col gap-6">

      <ModeTabs selectedMode={selectedMode} onSwitchMode={onSwitchMode} disabled={isLocked} />

      <div className="w-full py-4 flex justify-center gap-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
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