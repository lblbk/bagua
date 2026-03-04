import React from 'react';

const Footer = () => {
  const commitHash = import.meta.env.VITE_COMMIT_SHA || 'dev';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 mt-10 text-center opacity-60">
      <div className="flex flex-col items-center gap-2">
        {/* 品牌或标语 */}
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
          易经 · 六爻占卜
        </p>
        
        {/* 版权信息 */}
        <p className="text-[10px] text-gray-400">
          © {currentYear} | v{__APP_VERSION__} ({commitHash})
        </p>
        
        {/* 装饰线 */}
        <div className="w-8 h-px bg-gray-300 mt-2"></div>
      </div>
    </footer>
  );
};

export default Footer;