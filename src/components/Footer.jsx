import React from 'react';
import constants from '../data/constants.json';

// --- 优化点 1: 将所有静态逻辑移出组件外部 ---
// 这些变量只会在 JS 文件首次加载时计算一次，
// 而不是每次 App 状态更新（如硬币转动时）都重新计算。

const { footer } = constants;

// 获取版本、哈希和年份
const commitHash = import.meta.env.VITE_COMMIT_SHA?.slice(0, 7) || 'dev';
const currentYear = new Date().getFullYear();
const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0';

// 预先格式化版权信息字符串
const formattedCopyright = footer.copyright
  .replace('{year}', currentYear)
  .replace('{version}', version)
  .replace('{hash}', commitHash);

const Footer = () => {
  // --- 优化点 2: 组件体现在变得极其“薄” ---
  // 它只负责返回 JSX，没有任何逻辑计算

  return (
    <footer className="w-full py-8 text-center opacity-40 select-none">
      <div className="flex flex-col items-center gap-2.5 px-6">

        {/* 标题：增加 tracking 优化小字阅读感 */}
        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 font-bold">
          {footer.title}
        </p>

        {/* 免责声明：使用 shrink-0 确保装饰点不被挤压 */}
        <p className="text-[10px] text-gray-400 dark:text-gray-600 flex items-center justify-center gap-2 leading-relaxed max-w-[240px]">
          <span className="shrink-0 w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-800"></span>
          <span className="text-center">{footer.disclaimer}</span>
          <span className="shrink-0 w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-800"></span>
        </p>

        {/* 版本信息：使用更小的字体，降低视觉权重 */}
        <p className="text-[9px] text-gray-300 dark:text-gray-700 font-medium tracking-wider">
          {formattedCopyright}
        </p>

        {/* 底部装饰线：微调宽度 */}
        <div className="w-6 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent mt-1"></div>
      </div>
    </footer>
  );
};

// 确保 React.memo 被保留
export default React.memo(Footer);