import React, { useState } from 'react';
import { toPng } from 'html-to-image';
// 1. 引入常量
import constants from '../data/constants.json';

const ToolBox = ({ finalGuaInfo, question, targetRef }) => {
  const { toolBox } = constants;
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // 辅助函数：替换模板字符串中的变量
  const formatTemplate = (template, data) => {
    return template.replace(/{(\w+)}/g, (match, key) => data[key] || "");
  };

  const saveAsImage = async () => {
    const node = targetRef.current;
    if (!node || isGenerating) return;

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setIsGenerating(true);
    node.classList.add('is-printing');

    try {
      const isDark = document.documentElement.classList.contains('dark');
      await new Promise(resolve => setTimeout(resolve, 300));

      const width = Math.round(node.offsetWidth);
      const height = Math.round(node.scrollHeight);
      const dpr = window.devicePixelRatio || 2;
      const scale = Math.min(dpr, 2);

      const options = {
        width: width,
        height: height,
        canvasWidth: width * scale,
        canvasHeight: height * scale,
        pixelRatio: scale,
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        cacheBust: true,
        style: {
          margin: '0', padding: '0', left: '0', top: '0', transform: 'none',
          width: `${width}px`, height: `${height}px`,
        }
      };

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (isIOS) await toPng(node, options);

      const dataUrl = await toPng(node, options);
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        setPreviewImage(dataUrl);
      } else {
        const link = document.createElement('a');
        const now = new Date();
        const dateStr = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
        const timeStr = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0') + String(now.getSeconds()).padStart(2, '0');
        const benName = finalGuaInfo.benGua.name;
        const zhiName = finalGuaInfo.zhiGua ? `${toolBox.changeGua}${finalGuaInfo.zhiGua.name}` : toolBox.staticGua;

        // 使用配置的文件名前缀
        link.download = `${toolBox.filenamePrefix}_${benName}${zhiName}_${dateStr}_${timeStr}.png`;
        link.href = dataUrl;
        link.click();
      }

    } catch (err) {
      console.error("保存失败:", err);
      alert(toolBox.saveError);
    } finally {
      node.classList.remove('is-printing');
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    const text = formatTemplate(toolBox.shareTemplate, {
      question: question || '综合运势',
      benGua: finalGuaInfo.benGua.commonName,
      zhiGua: finalGuaInfo.zhiGua ? ` ${toolBox.changeGua} ` + finalGuaInfo.zhiGua.commonName : ''
    });

    if (navigator.share) {
      try {
        await navigator.share({ title: toolBox.title, text, url: window.location.href });
      } catch (err) { /* 用户取消 */ }
    } else {
      copyToClipboard(text, toolBox.shareSuccess);
    }
  };

  const copyToClipboard = (customText, msg) => {
    const text = customText || formatTemplate(toolBox.copyTemplate, {
      question: question || '综合运势',
      benGua: finalGuaInfo.benGua.commonName
    });
    navigator.clipboard.writeText(text);
    alert(msg || toolBox.copySuccess);
  };

  return (
    <>
      <div className="toolbox-container w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 dark:border-slate-800 p-4 transition-all duration-500">

        {/* 标题栏：放大到 text-lg */}
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-slate-800 px-1">
          <h3 className="text-slate-700 dark:text-slate-300 font-black text-lg tracking-widest">
            {toolBox.title}
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* 保存图片 */}
          <button
            onClick={saveAsImage}
            disabled={isGenerating}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <span className={isGenerating ? "print-icon-force hidden" : ""}>🖼️</span>
              {isGenerating && <span className="print-loading-hide text-base">⌛</span>}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{toolBox.saveImage}</span>
          </button>

          {/* 快捷分享 */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform text-emerald-600">
              🔗
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{toolBox.share}</span>
          </button>

          {/* 复制文字 */}
          <button
            onClick={() => copyToClipboard(null, toolBox.copySuccess)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform text-amber-600">
              📋
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{toolBox.copy}</span>
          </button>
        </div>
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white/20 text-white text-sm px-6 py-2 rounded-full mb-6 flex items-center gap-2 shadow-lg">
            {toolBox.previewHint}
          </div>

          <div className="relative w-full max-w-md max-h-[70vh] overflow-y-auto rounded-xl shadow-2xl webkit-overflow-scrolling-touch border border-white/10">
            <img
              src={previewImage}
              alt="Result"
              className="w-full h-auto block rounded-xl pointer-events-auto select-auto"
            />
          </div>

          <button
            onClick={() => setPreviewImage(null)}
            className="mt-8 w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center text-2xl transition-colors backdrop-blur-lg"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
};

export default React.memo(ToolBox);