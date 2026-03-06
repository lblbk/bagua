import React, { useState } from 'react';
import { toPng } from 'html-to-image';

const ToolBox = ({ finalGuaInfo, question, targetRef }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  // 新增状态：存储生成的图片 Base64 数据，用于在弹窗中展示
  const [previewImage, setPreviewImage] = useState(null); 

  const saveAsImage = async () => {
    const node = targetRef.current;
    if (!node || isGenerating) return;

    // 【新增】1. 强制当前点击的按钮失去焦点，消除 :focus 和 :active 状态
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setIsGenerating(true);
    node.classList.add('is-printing');

    try {
      const isDark = document.documentElement.classList.contains('dark');
      
      // 【修改】2. 将等待时间从 50ms 延长到 300ms
      // 这极其重要！确保按钮的 :hover 状态和阴影动画完全消退后再截图
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

      // iOS 预热渲染
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (isIOS) await toPng(node, options);

      // 生成 Base64 图片
      const dataUrl = await toPng(node, options);

      // 【核心逻辑分支】判断是否是移动端
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        // 移动端：打开弹窗，让用户长按保存
        setPreviewImage(dataUrl);
      } else {
        // PC端：直接触发下载
        const link = document.createElement('a');
        const now = new Date();
        const dateStr = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
        const timeStr = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0') + String(now.getSeconds()).padStart(2, '0');
        const benName = finalGuaInfo.benGua.name;
        const zhiName = finalGuaInfo.zhiGua ? `之${finalGuaInfo.zhiGua.name}` : '静卦';
        link.download = `问卦_${benName}${zhiName}_${dateStr}_${timeStr}.png`;
        link.href = dataUrl;
        link.click();
      }
      
    } catch (err) {
      console.error("保存失败:", err);
      alert("保存失败，请尝试重新生成");
    } finally {
      node.classList.remove('is-printing');
      setIsGenerating(false);
    }
  };

  // --- 核心功能：分享 ---
  const handleShare = async () => {
    const text = `我在“问卦”中为【${question || '综合运势'}】求得一卦：\n【${finalGuaInfo.benGua.commonName}】${finalGuaInfo.zhiGua ? ' 变 ' + finalGuaInfo.zhiGua.commonName : ''}\n—— 易数推演，唯变所适。`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: '占卜结果', text, url: window.location.href });
      } catch (err) { /* 用户取消 */ }
    } else {
      copyToClipboard(text, "分享内容已复制");
    }
  };

  // --- 核心功能：复制 ---
  const copyToClipboard = (customText, msg) => {
    const text = customText || `问卜：${question}\n结果：${finalGuaInfo.benGua.commonName}\n—— 易数推演。`;
    navigator.clipboard.writeText(text);
    alert(msg || "结果已复制到剪贴板");
  };

  return (
    <>
      <div className="toolbox-container w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-2xl shadow-lg border border-white/50 dark:border-slate-800 p-4 mt-2 transition-all duration-500">
        
        {/* 标题栏：修改为与 HistoryList 等一致的左对齐样式 */}
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-slate-800 px-1">
          <h3 className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest">
            留影
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
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">保存图像</span>
          </button>

          {/* 快捷分享 */}
          <button 
            onClick={handleShare}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform text-emerald-600">
              🔗
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">快捷分享</span>
          </button>

          {/* 复制文字 */}
          <button 
            onClick={() => { navigator.clipboard.writeText(`问卜：${question}\n结果：${finalGuaInfo.benGua.commonName}`); alert("文字已复制"); }}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform text-amber-600">
              📋
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">复制文字</span>
          </button>
        </div>
      </div>
      {/* 【新增】：全屏图片预览弹窗 */}
      {previewImage && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          
          {/* 提示文案 */}
          <div className="bg-white/20 text-white text-sm px-6 py-2 rounded-full mb-6 flex items-center gap-2 shadow-lg">
            <span>👇</span> 长按下方图片即可保存或分享
          </div>

          {/* 核心：生成的图片 (允许在小屏幕上下滑动查看长图) */}
          <div className="relative w-full max-w-md max-h-[70vh] overflow-y-auto rounded-xl shadow-2xl webkit-overflow-scrolling-touch border border-white/10">
             {/* 这是一张真实的 img 标签，手机浏览器原生支持对它长按 */}
            <img 
              src={previewImage} 
              alt="占卜结果" 
              className="w-full h-auto block rounded-xl pointer-events-auto select-auto" 
            />
          </div>

          {/* 关闭按钮 */}
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

export default ToolBox;