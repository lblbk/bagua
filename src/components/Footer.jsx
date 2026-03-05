import React from 'react';

const Footer = () => {
  // 确保 vite.config.js 中配置了 DefinePlugin，否则会报错
  const commitHash = import.meta.env.VITE_COMMIT_SHA?.slice(0, 7) || 'dev';
  const currentYear = new Date().getFullYear();
  // 全局变量建议使用 window 对象访问，或者通过 vite.config.js 的 define 定义
  const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0';

  return (
    <footer className="w-full py-8 mt-10 text-center opacity-60">
      <div className="flex flex-col items-center gap-2">
        {/* 品牌标语：深色模式下文字稍微亮一点 */}
        <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold">
          易经 · 六爻占卜
        </p>

        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          仅供娱乐，切莫当真
        </p>
        
        {/* 版权信息 */}
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          © {currentYear} | v{version} ({commitHash})
        </p>
        
        {/* 装饰线：深色模式下线条变暗 */}
        <div className="w-8 h-px bg-gray-300 dark:bg-gray-700 mt-2"></div>
      </div>
    </footer>
  );
};

export default Footer;