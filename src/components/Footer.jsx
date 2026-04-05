import React from 'react';
// 1. 引入常量文件
import constants from '../data/constants.json';

const Footer = () => {
  const { footer } = constants;

  const commitHash = import.meta.env.VITE_COMMIT_SHA?.slice(0, 7) || 'dev';
  const currentYear = new Date().getFullYear();
  const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0';

  // 格式化版权信息
  const copyrightText = footer.copyright
    .replace('{year}', currentYear)
    .replace('{version}', version)
    .replace('{hash}', commitHash);

  return (
    <footer className="w-full py-4 text-center opacity-60">
      <div className="flex flex-col items-center gap-2">

        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 font-black">
          {footer.title}
        </p>

        {/* 2. 免责声明：增加一个小装饰点 */}
        <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
          {footer.disclaimer}
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
        </p>

        {/* 3. 版本信息 */}
        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
          {copyrightText}
        </p>

        {/* 底部装饰线 */}
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent mt-1"></div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);