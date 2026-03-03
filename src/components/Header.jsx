import React from 'react';

const Header = ({ yangSetting, toggleYangSetting, disabled }) => {
  return (
    <div className="w-full flex justify-between items-center mb-2 px-1">
      <h1 className="text-2xl font-bold text-slate-700 tracking-wider">三币占卜</h1>
      
      <button
        onClick={toggleYangSetting}
        disabled={disabled}
        className={`
          text-xs font-medium px-3 py-1.5 rounded-full border transition-all flex items-center gap-2
          ${disabled 
            ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400' 
            : 'hover:bg-slate-100 border-slate-300 text-slate-600 active:scale-95'}
        `}
        title="点击切换阴阳设定"
      >
        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
        {yangSetting === 'heads' ? '设定：字=阳' : '设定：花=阳'}
      </button>
    </div>
  );
};

export default Header;