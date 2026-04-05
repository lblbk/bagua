import React from 'react';
import ReactDOM from 'react-dom'; // 导入 ReactDOM 用于使用 Portal
import constants from '../data/constants.json';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { common, confirmModal } = constants;

  // 如果不显示，直接返回 null
  if (!isOpen) return null;

  // 处理点击确认逻辑：执行确认动作并关闭弹窗
  const handleConfirmClick = (e) => {
    e.stopPropagation();
    onConfirm?.();
    // 注意：如果父组件的 onConfirm 逻辑里已经包含了 executeRestart(true) 且关闭了 Modal，
    // 这里就不一定非要再调用 onClose，但为了保险通常保留。
    onClose?.();
  };

  // 弹窗的具体内容
  const modalContent = (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* 1. 背景遮罩：will-change 优化动画性能 */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
        style={{ willChange: 'opacity' }}
        onClick={onClose}
      ></div>

      {/* 2. 弹窗主体：will-change 优化缩放动画性能 */}
      <div
        className="relative w-full max-w-[280px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 p-6 animate-scaleUp"
        style={{ willChange: 'transform, opacity' }}
        onClick={(e) => e.stopPropagation()} // 防止点击弹窗主体触发遮罩层的 onClose
      >
        {/* 图标或警示标识 */}
        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
          <span className="text-2xl text-indigo-500 dark:text-indigo-400">↺</span>
        </div>

        {/* 标题与内容 */}
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center mb-2">
          {title || confirmModal.defaultTitle}
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mb-6 leading-relaxed px-2">
          {message || confirmModal.defaultMessage}
        </p>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            {common.cancel}
          </button>
          <button
            onClick={handleConfirmClick}
            className="flex-1 py-3 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
          >
            {common.confirm}
          </button>
        </div>
      </div>
    </div>
  );

  // 使用 Portal 将 modalContent 挂载到 document.body 下
  return ReactDOM.createPortal(modalContent, document.body);
};

// 使用 React.memo 包裹，只有 Props 改变时才重新渲染
export default React.memo(ConfirmModal);