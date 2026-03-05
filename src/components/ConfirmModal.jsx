import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 1. 背景遮罩：毛玻璃 + 半透明黑 */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      ></div>

      {/* 2. 弹窗主体 */}
      <div className="relative w-full max-w-[280px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 p-6 animate-scaleUp">
        
        {/* 图标或警示标识 */}
        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
          <span className="text-2xl">↺</span>
        </div>

        {/* 标题与内容 */}
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center mb-2">
          {title || "确认重置？"}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-6 leading-relaxed">
          {message || "当前占卜记录和结果将会被清空，确定要再起一卦吗？"}
        </p>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            取消
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;