import React from "react";
import { View, Text } from "@tarojs/components";
import constants from "../data/constants.json";

const Header = ({
  yangSetting,
  toggleYangSetting,
  disabled,
  isDarkMode,
  toggleDarkMode,
}) => {
  return (
    <View className="w-full flex flex-col gap-1 pt-2 pb-1 mb-1 px-1 group relative">
      {/* 顶部中央装饰点 */}
      <View className="absolute top-0 left-1/2 -translate-x-1/2 opacity-20">
        <View className="flex flex-row gap-1.5">
          <View className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500"></View>
          <View className="w-4 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></View>
          <View className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500"></View>
        </View>
      </View>

      {/* 标题与按钮区域 */}
      <View className="flex flex-row justify-between items-end mt-4">
        <View className="flex flex-col">
          {/* 副标题：text-xs */}
          <Text className="text-xs uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-400 font-bold ml-0.5 mb-0.5">
            {constants.header.subtitle}
          </Text>
          <View className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter flex flex-row items-center gap-2 leading-none">
            {constants.header.title}
            <View className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]"></View>
          </View>
        </View>

        <View className="flex flex-row items-center gap-2">
          {/*
             阴阳设定按钮：
             高度 h-9 -> h-10
             字体 text-[11px] -> text-xs (同步 subtitle)
          */}
          <View
            onClick={disabled ? undefined : toggleYangSetting}
            className={`
              relative h-10 px-4 rounded-xl border transition-all duration-300 flex flex-row items-center gap-2 overflow-hidden
              ${
                disabled
                  ? "opacity-40 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm active:scale-95"
              }
            `}
          >
            <View
              className={`w-2 h-2 rounded-full shadow-sm transition-colors duration-500 ${yangSetting === "heads" ? "bg-indigo-500 shadow-indigo-200" : "bg-orange-500 shadow-orange-200"}`}
            ></View>
            <Text className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap tracking-wide">
              {yangSetting === "heads"
                ? constants.header.yangHeads
                : constants.header.yangTails}
            </Text>
          </View>

          {/*
             暗色模式切换按钮：
             尺寸 w-9 h-9 -> w-10 h-10
             图标 text-lg -> text-xl (配合大按钮视觉)
          */}
          <View
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-yellow-400 border border-transparent dark:border-slate-700 transition-all active:scale-90 shadow-sm"
          >
            <Text className="text-xl leading-none">
              {isDarkMode
                ? constants.header.themeDark
                : constants.header.themeLight}
            </Text>
          </View>
        </View>
      </View>

      {/* 底部装饰线 */}
      <View className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mt-2 opacity-50"></View>
    </View>
  );
};

export default Header;
