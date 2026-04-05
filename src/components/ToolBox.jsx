import React, { useState, useCallback, useMemo } from 'react';
import { toPng } from 'html-to-image';
import constants from '../data/constants.json';

// 1. 将工具函数移出组件，避免重复创建
const formatTemplate = (template, data) => {
  return template.replace(/{(\w+)}/g, (match, key) => data[key] || "");
};

const getTimestampStrings = () => {
  const now = new Date();
  const dateStr = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
  const timeStr = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0') + String(now.getSeconds()).padStart(2, '0');
  return { dateStr, timeStr };
};

const ToolBox = ({ finalGuaInfo, question, targetRef }) => {
  const { toolBox } = constants;
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // 2. 使用 useCallback 缓存函数，配合 React.memo 防止子组件/自身无效重绘
  const saveAsImage = useCallback(async () => {
    const node = targetRef.current;
    if (!node || isGenerating) return;

    // 收起键盘，防止 H5 截图位移
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setIsGenerating(true);
    node.classList.add('is-printing');

    try {
      const isDark = document.documentElement.classList.contains('dark');
      // 给 DOM 留出渲染 class 改变的时间
      await new Promise(resolve => setTimeout(resolve, 200));

      const width = node.offsetWidth;
      const height = node.scrollHeight;
      const scale = Math.min(window.devicePixelRatio || 2, 2); // 限制最大倍率为2，平衡清晰度与性能

      const options = {
        width,
        height,
        canvasWidth: width * scale,
        canvasHeight: height * scale,
        pixelRatio: scale,
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        cacheBust: true,
        style: {
          margin: '0', padding: '0', transform: 'none',
        }
      };

      // iOS 预热处理
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) await toPng(node, options);

      const dataUrl = await toPng(node, options);
      const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile) {
        setPreviewImage(dataUrl);
      } else {
        const { dateStr, timeStr } = getTimestampStrings();
        const benName = finalGuaInfo.benGua.name;
        const zhiName = finalGuaInfo.zhiGua ? `${toolBox.changeGua}${finalGuaInfo.zhiGua.name}` : toolBox.staticGua;

        const link = document.createElement('a');
        link.download = `${toolBox.filenamePrefix}_${benName}${zhiName}_${dateStr}_${timeStr}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error("保存失败:", err);
      // 在 H5 环境，alert 可能会阻塞 UI，生产环境建议换成 Toast 组件
      alert(toolBox.saveError);
    } finally {
      node.classList.remove('is-printing');
      setIsGenerating(false);
    }
  }, [finalGuaInfo, isGenerating, targetRef, toolBox]);

  const copyToClipboard = useCallback((customText, msg) => {
    const text = customText || formatTemplate(toolBox.copyTemplate, {
      question: question || '综合运势',
      benGua: finalGuaInfo.benGua.commonName
    });

    // 现代 API 优先
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        alert(msg || toolBox.copySuccess);
      });
    } else {
      // 降级处理
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(msg || toolBox.copySuccess);
    }
  }, [finalGuaInfo, question, toolBox]);

  const handleShare = useCallback(async () => {
    const text = formatTemplate(toolBox.shareTemplate, {
      question: question || '综合运势',
      benGua: finalGuaInfo.benGua.commonName,
      zhiGua: finalGuaInfo.zhiGua ? ` ${toolBox.changeGua} ` + finalGuaInfo.zhiGua.commonName : ''
    });

    if (navigator.share) {
      try {
        await navigator.share({ title: toolBox.title, text, url: window.location.href });
      } catch (err) { /* 用户取消不处理 */ }
    } else {
      copyToClipboard(text, toolBox.shareSuccess);
    }
  }, [finalGuaInfo, question, toolBox, copyToClipboard]);

  return (
    <>
      {/* 3. 优化点：移除 transition-all，改为具体的属性以提升滑动性能 */}
      <div className="toolbox-container w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 dark:border-slate-800 p-4 transition-opacity duration-300">

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
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-transform group"
          >
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              {isGenerating ? <span className="animate-spin text-base">⌛</span> : <span>🖼️</span>}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{toolBox.saveImage}</span>
          </button>

          {/* 快捷分享 */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-transform group"
          >
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform text-emerald-600">
              🔗
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{toolBox.share}</span>
          </button>

          {/* 复制文字 */}
          <button
            onClick={() => copyToClipboard(null, toolBox.copySuccess)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-transform group"
          >
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform text-amber-600">
              📋
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{toolBox.copy}</span>
          </button>
        </div>
      </div>

      {/* 预览图 Modal 优化：添加 GPU 加速属性 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
          style={{ willChange: 'opacity' }}
        >
          <div className="bg-white/20 text-white text-sm px-6 py-2 rounded-full mb-6 flex items-center gap-2 shadow-lg">
            {toolBox.previewHint}
          </div>

          <div className="relative w-full max-w-md max-h-[70vh] overflow-y-auto rounded-xl shadow-2xl border border-white/10"
            style={{ WebkitOverflowScrolling: 'touch' }}>
            <img
              src={previewImage}
              alt="Result"
              className="w-full h-auto block rounded-xl pointer-events-auto"
            />
          </div>

          <button
            onClick={() => setPreviewImage(null)}
            className="mt-8 w-12 h-12 bg-white/20 active:bg-white/40 text-white rounded-full flex items-center justify-center text-2xl transition-colors backdrop-blur-lg"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
};

export default React.memo(ToolBox);