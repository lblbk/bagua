import React from 'react';
import constants from '../data/constants.json';

const Header = ({ yangSetting, toggleYangSetting, disabled, isDarkMode, toggleDarkMode }) => {
  const { header } = constants;

  return (
    // 优化 1: 移除 group，减少样式计算层级
    <div className="w-full flex flex-col gap-1 pt-4 pb-1 mb-2 px-1 relative">

      {/* 顶部中央装饰点：保持静态，移除不必要的复杂布局 */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
        <div className="flex gap-1.5">
          <div className="w-1 h-1 rounded-full bg-slate-400"></div>
          <div className="w-4 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
          <div className="w-1 h-1 rounded-full bg-slate-400"></div>
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
            {/* 优化 2: 移除 animate-pulse 和自定义 shadow，改用静态圆点 */}
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm"></span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* 阴阳设定按钮 */}
          <button
            onClick={toggleYangSetting}
            disabled={disabled}
            className={`
              relative h-9 px-4 rounded-xl border flex items-center gap-2 overflow-hidden
              active:scale-95 
              /* 优化 3: 将 transition-all 细化为具体属性 */
              transition-[background-color,border-color,opacity] duration-300
              ${disabled
                ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'}
            `}
          >
            {/* 内部圆点：仅对颜色进行过渡 */}
            <div className={`
              w-2.5 h-2.5 rounded-full transition-colors duration-500
              ${yangSetting === 'heads' ? 'bg-indigo-500' : 'bg-orange-500'}
            `}></div>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap tracking-wide">
              {yangSetting === 'heads' ? header.yangHeads : header.yangTails}
            </span>
          </button>

          {/* 暗色模式切换 */}
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-yellow-400 border border-transparent dark:border-slate-700 active:scale-90 transition-transform"
            aria-label={header.themeToggle}
          >
            <span className="text-lg leading-none">{isDarkMode ? '🌙' : '☀️'}</span>
          </button>
        </div>
      </div>

      {/* 底部装饰线：使用 will-change-transform 优化渲染（可选） */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mt-3 opacity-50"></div>
    </div>
  );
};

// 使用 React.memo 确保只有 props 变化时才重新渲染
export default React.memo(Header);