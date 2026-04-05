import React from 'react';
import constants from '../data/constants.json';

const Header = ({ yangSetting, toggleYangSetting, disabled, isDarkMode, toggleDarkMode }) => {
  const { header } = constants;

  return (
    // 关键修改：将 mb-8 缩小为 mb-2，pb-4 缩小为 pb-1
    <div className="w-full flex flex-col gap-1 pt-4 pb-1 mb-2 px-1 group relative">

      {/* 顶部中央装饰点 */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-20">
        <div className="flex gap-1.5">
          <div className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500"></div>
          <div className="w-4 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
          <div className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500"></div>
        </div>
      </div>

      {/* 标题与按钮区域 */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.4em] text-indigo-500 dark:text-indigo-400 font-bold ml-0.5 mb-1 opacity-80">
            {header.subtitle}
          </span>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter flex items-center gap-2">
            {header.title}
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* 阴阳设定 */}
          <button
            onClick={toggleYangSetting}
            disabled={disabled}
            className={`
              relative h-9 px-4 rounded-xl border transition-all duration-300 flex items-center gap-2 overflow-hidden
              ${disabled
                ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500 active:scale-95'}
            `}
          >
            <div className={`w-2 h-2 rounded-full shadow-sm transition-colors duration-500 ${yangSetting === 'heads' ? 'bg-indigo-500 shadow-indigo-200' : 'bg-orange-500 shadow-orange-200'}`}></div>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap tracking-wide">
              {yangSetting === 'heads' ? header.yangHeads : header.yangTails}
            </span>
          </button>

          {/* 暗色模式切换 */}
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-yellow-400 border border-transparent dark:border-slate-700 transition-all active:scale-90"
            aria-label={header.themeToggle}
          >
            <span className="text-lg">{isDarkMode ? '🌙' : '☀️'}</span>
          </button>
        </div>
      </div>

      {/* 底部装饰线：mt-3 确保它紧贴标题 */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mt-3 opacity-50"></div>
    </div>
  );
};

export default React.memo(Header);