import React, { useState } from 'react';
import { toPng } from 'html-to-image';

const ToolBox = ({ finalGuaInfo, question, targetRef }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const saveAsImage = async () => {
    const node = targetRef.current;
    if (!node || isGenerating) return;

    // 1. 开启“截图保护模式”
    setIsGenerating(true);
    node.classList.add('is-printing');

    try {
      const isDark = document.documentElement.classList.contains('dark');
      const rect = node.getBoundingClientRect();

      // 给浏览器一点点时间渲染 classList 的变化 (约 1 帧的时间)
      await new Promise(resolve => setTimeout(resolve, 50));

      const options = {
        width: rect.width,
        height: rect.height,
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        pixelRatio: 3, // 高清 3 倍
        cacheBust: true,
        // 注意：这里不再使用 filter 过滤，保留工具箱
        style: {
          margin: '0',
          padding: '0',
          left: '0',
          top: '0',
          transform: 'none',
        }
      };

      const dataUrl = await toPng(node, options);

      const link = document.createElement('a');
      const now = new Date();
      const dateStr = now.getFullYear() + 
                      String(now.getMonth() + 1).padStart(2, '0') + 
                      String(now.getDate()).padStart(2, '0');
      const timeStr = String(now.getHours()).padStart(2, '0') + 
                      String(now.getMinutes()).padStart(2, '0') + 
                      String(now.getSeconds()).padStart(2, '0');
      const benName = finalGuaInfo.benGua.name;
      const zhiName = finalGuaInfo.zhiGua ? `之${finalGuaInfo.zhiGua.name}` : '静卦';
      link.download = `问卦_${benName}${zhiName}_${dateStr}_${timeStr}.png`;
      link.href = dataUrl;
      link.click();
      
    } catch (err) {
      console.error("保存失败:", err);
      alert("保存失败，请尝试手动截图");
    } finally {
      // 2. 截图完成，恢复原样
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
  );
};

export default ToolBox;