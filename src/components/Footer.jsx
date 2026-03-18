// import React from 'react';

const Footer = () => {
  // const commitHash = import.meta.env.VITE_COMMIT_SHA?.slice(0, 7) || "dev";
  const commitHash = "dev";
  const currentYear = new Date().getFullYear();
  const version =
    typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "1.0.0";

  return (
    // 将 py-8 改为 py-4, 将 mt-10 改为 mt-6
    <footer className="w-full py-4 mt-6 text-center opacity-60">
      {/* 将 gap-2 缩小为 gap-1.5，让内部排版更紧凑 */}
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold">
          易经 · 六爻占卜
        </p>

        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          仅供娱乐，切莫当真
        </p>

        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          © {currentYear} | v{version} ({commitHash})
        </p>

        {/* 装饰线 */}
        <div className="w-8 h-px bg-gray-300 dark:bg-gray-700 mt-1"></div>
      </div>
    </footer>
  );
};

export default Footer;
