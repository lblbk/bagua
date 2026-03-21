import React from "react";
import { View, Text } from "@tarojs/components";
import constants from "../data/constants.json";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  const { confirmModal: t } = constants;

  if (!isOpen) return null;

  return (
    // 使用 fixed 全屏覆盖，确保在最上层
    <View className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* 1. 背景遮罩：增加不透明度，确保看清弹窗 */}
      <View
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        catchMove // 阻止底层滑动
      ></View>

      {/* 2. 弹窗主体：宽度改为 rpx 适配，移除 max-w-px */}
      <View className="relative w-[600rpx] bg-white dark:bg-slate-900 rounded-[40rpx] shadow-2xl border border-white/20 dark:border-slate-800 p-8 animate-scaleUp flex flex-col items-center">
        {/* 图标：稍微放大一点 */}
        <View className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
          <Text className="text-3xl">↺</Text>
        </View>

        {/* 标题：字号加大到 text-xl */}
        <View className="text-xl font-bold text-slate-800 dark:text-slate-100 text-center mb-3">
          {title || t.defaultTitle}
        </View>

        {/* 内容：字号加大到 text-base，行高加大 */}
        <View className="text-base text-slate-500 dark:text-slate-400 text-center mb-8 leading-relaxed px-2">
          {message || t.defaultMessage}
        </View>

        {/* 操作按钮：高度增加到 h-12 (48px) 以符合手机点击规范 */}
        <View className="flex flex-row gap-4 w-full">
          <View
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl text-base font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-all flex justify-center items-center"
          >
            {t.cancelBtn}
          </View>
          <View
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 h-12 rounded-2xl text-base font-bold text-white bg-indigo-600 active:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex justify-center items-center"
          >
            {t.confirmBtn}
          </View>
        </View>
      </View>
    </View>
  );
};

export default ConfirmModal;
