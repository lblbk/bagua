import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom'; // 必须引入
import { toPng } from 'html-to-image';
import { createShareRecord } from '../utils/api';

// --- 独立的 Toast 组件，通过 Portal 渲染到 Body ---
const GlobalToast = ({ message, isLoading }) => {
  return createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none'
    }}>
      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        pointerEvents: 'auto',
        border: '1px solid rgba(255,255,255,0.1)',
        minWidth: '200px',
        animation: 'toastIn 0.3s ease-out'
      }}>
        {isLoading && (
          <div style={{
            width: '24px',
            height: '24px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
        )}
        <span style={{ fontSize: '15px', fontWeight: 'bold', textAlign: 'center' }}>{message}</span>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>,
    document.body // 强制传送到 body 根节点
  );
};

const ToolBox = ({ finalGuaInfo, question, targetRef, history, aiResponse }) => {
  const [toast, setToast] = useState({ show: false, msg: '', loading: false });
  const [previewImage, setPreviewImage] = useState(null);

  // 控制 Toast 消失
  useEffect(() => {
    if (toast.show && !toast.loading) {
      const timer = setTimeout(() => setToast({ show: false, msg: '', loading: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  };

  const handleShare = useCallback(async () => {
    // 1. 立即弹出正在处理
    setToast({ show: true, msg: '正在生成专属分享链接...', loading: true });

    try {
      const shareData = { question, history, finalGuaInfo, aiResponse: aiResponse || '' };
      const hashId = await createShareRecord(shareData);

      if (!hashId) throw new Error("服务器返回空");

      const shareUrl = `${window.location.origin}/?share=${hashId}`;

      // 2. 核心修改：不再强行调用 navigator.share (因为它在异步中必崩)
      // 改为自动复制链接
      await copyToClipboard(shareUrl);

      // 3. 成功后更新 Toast 状态
      setToast({ show: true, msg: '✅ 分享链接已复制到剪贴板，快去粘贴给好友吧！', loading: false });

    } catch (err) {
      console.error("分享出错:", err);
      setToast({ show: true, msg: '❌ 分享失败，请重试', loading: false });
    }
  }, [question, history, finalGuaInfo, aiResponse]);

  const handleSaveImage = async () => {
    setToast({ show: true, msg: '正在生成长图...', loading: true });
    try {
      const dataUrl = await toPng(targetRef.current, { cacheBust: true, pixelRatio: 2 });
      setPreviewImage(dataUrl);
      setToast({ show: false, msg: '', loading: false });
    } catch (e) {
      setToast({ show: true, msg: '❌ 生成图片失败', loading: false });
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xl mt-6 border border-slate-100 dark:border-slate-700">
      <div className="grid grid-cols-3 gap-4">
        <button onClick={handleSaveImage} className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-2xl">🖼️</div>
          <span className="text-xs font-bold text-slate-500">保存图片</span>
        </button>

        <button onClick={handleShare} className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-2xl">🔗</div>
          <span className="text-xs font-bold text-slate-500">一键分享</span>
        </button>

        <button onClick={() => {
          copyToClipboard(`卦象：${finalGuaInfo.benGua.commonName}`).then(() =>
            setToast({ show: true, msg: '✅ 卦辞已复制', loading: false })
          );
        }} className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-2xl">📋</div>
          <span className="text-xs font-bold text-slate-500">复制文字</span>
        </button>
      </div>

      {/* --- 全局提示：Portal 渲染 --- */}
      {toast.show && <GlobalToast message={toast.msg} isLoading={toast.loading} />}

      {/* 图片预览 Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[99999] bg-black/95 p-4 flex flex-col items-center justify-center">
          <img src={previewImage} className="max-w-full max-h-[80vh] rounded-xl shadow-2xl" />
          <button onClick={() => setPreviewImage(null)} className="mt-8 bg-white text-black px-10 py-3 rounded-full font-bold">关闭预览</button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ToolBox);