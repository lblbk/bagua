const Header = ({ yangSetting, toggleYangSetting, disabled, isDarkMode, toggleDarkMode }) => {
  return (
    <div className="w-full flex justify-between items-center mb-6 px-1">
      {/* 标题增加了对 dark mode 的文字颜色适配 */}
      <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-100 tracking-wider">
        三币占卜
      </h1>
      
      <div className="flex items-center gap-3">
        {/* 阴阳设定按钮 */}
        <button
          onClick={toggleYangSetting}
          disabled={disabled}
          className={`
            text-xs font-medium px-3 py-1.5 rounded-full border transition-all flex items-center gap-2
            ${disabled 
              ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-slate-700 text-gray-400' 
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 active:scale-95'}
          `}
        >
          <span className={`w-2 h-2 rounded-full ${yangSetting === 'heads' ? 'bg-indigo-400' : 'bg-orange-400'}`}></span>
          {yangSetting === 'heads' ? '字=阳' : '花=阳'}
        </button>

        {/* 主题切换按钮：增加了旋转动画 */}
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-yellow-300 transition-all duration-500 hover:rotate-180"
          aria-label="切换主题"
        >
          {isDarkMode ? '🌙' : '☀️'}
        </button>
      </div>
    </div>
  );
};

export default Header;