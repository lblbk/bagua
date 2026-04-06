import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createShareRecord } from '../utils/apiService';
import constants from '../data/constants.json';

const { toolBox, common } = constants;

// --- 1. Toast 组件 ---
const GlobalToast = ({ message, type = 'success' }) => {
  const isWarning = type === 'warning';
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none p-6 text-center">
      {/* 移除 backdrop-blur-xl 和 animate-toastBounce，改为不透明背景以提升性能 */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-6 py-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center gap-3 pointer-events-auto max-w-[90%] transition-opacity">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-lg shadow-lg ${isWarning ? 'bg-amber-500 shadow-amber-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
          {isWarning ? '!' : '✓'}
        </div>
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{message}</span>
      </div>
    </div>,
    document.body
  );
};

const LoadingIcon = () => (
  // 加载动画保留，因为它是点击后触发，不会在初次加载时引起掉帧
  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
);

// --- 2. 分享引导弹窗 (生成链接后的弹窗) ---
const ShareModal = ({ isOpen, onClose, onCopy, shareUrl }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* 移除背景模糊和进场动画 */}
      <div className="absolute inset-0 bg-slate-900/70" onClick={onClose}></div>
      <div className="relative w-full max-w-[280px] bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl p-6 border border-white dark:border-slate-800">
        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4 mx-auto text-3xl">🔗</div>
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 text-center mb-2">{toolBox.share}</h3>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mb-6 break-all px-4 leading-relaxed line-clamp-2">{shareUrl}</p>
        <div className="flex flex-col gap-2">
          <button onClick={() => onCopy(shareUrl)} className="w-full py-4 rounded-2xl text-sm font-bold text-white bg-indigo-600 shadow-xl shadow-indigo-500/40 active:scale-95 transition-transform duration-100">
            {toolBox.shareLink}
          </button>
          <button onClick={onClose} className="w-full py-3 rounded-2xl text-xs font-bold text-slate-400">{common.cancel}</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// --- 3. 未解卦分享确认弹窗 ---
const ShareConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      {/* 移除背景模糊和进场动画 */}
      <div className="absolute inset-0 bg-slate-900/80" onClick={onClose}></div>
      <div className="relative w-full max-w-[280px] bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl p-8 border border-amber-200 dark:border-amber-900/30">
        {/* 移除了 animate-bounce 这个极耗性能的无限循环动画 */}
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-6 mx-auto text-4xl">⚠️</div>
        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 text-center mb-4">结束此卦？</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-8 leading-relaxed">
          确定您与此卦<span className="text-amber-500 font-bold">“缘分已尽”</span>？
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full py-4 rounded-2xl text-sm font-bold text-white bg-amber-500 shadow-lg shadow-amber-500/30 active:scale-95 transition-transform duration-100"
          >
            继续分享
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-600"
          >
            返回解卦
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// --- 4. ToolBox 主组件 ---
const ToolBox = ({ finalGuaInfo, question, targetRef, history, aiResponse, isSharedMode, onSaveRecord }) => {
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const [isSharing, setIsSharing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (toast.msg) {
      const timer = setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const syncCopy = (text) => {
    const input = document.createElement('input');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.focus();
    input.setSelectionRange(0, 9999);
    const ok = document.execCommand('copy');
    document.body.removeChild(input);
    return ok;
  };

  const formatTemplate = (template) => {
    return template
      .replace('{question}', question || '无')
      .replace('{benGua}', finalGuaInfo.benGua.commonName)
      .replace('{zhiGua}', finalGuaInfo.zhiGua ? `${finalGuaInfo.zhiGua.commonName}` : '');
  };

  const executeShare = async (finalAiResponse) => {
    setIsSharing(true);
    try {
      const shareData = { question, history, finalGuaInfo, aiResponse: finalAiResponse || '' };
      const hashId = await createShareRecord(shareData);
      if (hashId) {
        setShareUrl(`${window.location.origin}/?share=${hashId}`);
        setIsModalOpen(true);
        if (finalAiResponse === toolBox.fateEndText && onSaveRecord) {
          onSaveRecord(toolBox.fateEndText);
        }
      }
    } catch (err) {
      showToast('❌ 生成失败');
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareClick = () => {
    if (isSharedMode) return showToast("预览模式下无法再次分享", "warning");
    if (isSharing) return;

    if (!aiResponse || aiResponse.trim() === "") {
      setIsConfirmOpen(true);
    } else {
      executeShare(aiResponse);
    }
  };

  const handleConfirmShare = () => {
    setIsConfirmOpen(false);
    executeShare(toolBox.fateEndText);
  };

  const handleSaveImageClick = () => {
    if (isSharedMode) return showToast("预览模式下无法保存图片", "warning");
    showToast("保存图片功能即将上线", "warning");
  };

  const handleCopyClick = () => {
    if (isSharedMode) return showToast("预览模式下无法复制文字", "warning");
    const content = formatTemplate(toolBox.copyTemplate);
    if (syncCopy(content)) showToast(toolBox.copySuccess);
  };

  return (
    <div className="w-full relative">
      {/* 移除了 transition-all，防止父级重绘时造成渲染压力 */}
      <div className={`w-full bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-xl border border-slate-100 dark:border-slate-700/50 ${isSharedMode ? 'opacity-60' : ''}`}>

        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2 select-none">
          <h3 className="text-slate-700 dark:text-slate-300 font-black text-lg tracking-widest flex-1">
            {toolBox.title}
          </h3>
          {isSharedMode && (
            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 text-[9px] rounded-lg font-bold uppercase">
              Preview
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button onClick={handleSaveImageClick} className="flex flex-col items-center gap-2 outline-none">
            {/* 所有的 transition-all 替换成了 transition-transform，只应用在主动点击时的放缩 */}
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-2xl active:scale-95 transition-transform duration-100">
              🖼️
            </div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">{toolBox.saveImage}</span>
          </button>

          <button onClick={handleShareClick} className="flex flex-col items-center gap-2 outline-none">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-2xl active:scale-95 transition-transform duration-100 text-emerald-500">
              {isSharing ? <LoadingIcon /> : "🔗"}
            </div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">{toolBox.share}</span>
          </button>

          <button onClick={handleCopyClick} className="flex flex-col items-center gap-2 outline-none">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-2xl active:scale-95 transition-transform duration-100">📋</div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">{toolBox.copy}</span>
          </button>
        </div>
      </div>

      <ShareConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmShare}
      />

      <ShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCopy={(url) => {
          if (syncCopy(url)) { showToast(toolBox.shareLinkCopied); setIsModalOpen(false); }
        }}
        shareUrl={shareUrl}
      />

      {toast.msg && <GlobalToast message={toast.msg} type={toast.type} />}
    </div>
  );
};

export default React.memo(ToolBox);