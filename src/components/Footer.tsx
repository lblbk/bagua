import React, { useMemo } from "react";
import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import constants from "../data/constants.json";

const Footer = () => {
  const commitHash = "dev";
  const currentYear = new Date().getFullYear();

  // 获取版本号逻辑
  const version = useMemo(() => {
    if (process.env.TARO_ENV === "weapp") {
      try {
        const accountInfo = Taro.getAccountInfoSync();
        if (accountInfo.miniProgram && accountInfo.miniProgram.version) {
          return accountInfo.miniProgram.version;
        }
      } catch (e) {
        // 生产环境若无版本号则降级
      }
    }
    // @ts-ignore
    return typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "1.0.0";
  }, []);

  return (
    // 去掉 mt-6，依赖首页的 gap 间距
    <View className="w-full py-6 text-center opacity-80">
      <View className="flex flex-col items-center gap-2">
        {/* 标题：字号提升至 text-xs，并加深颜色 */}
        <Text className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-bold">
          {constants.footer.title}
        </Text>

        {/* 免责声明：字号提升至 text-xs */}
        <Text className="text-xs text-gray-400 dark:text-gray-500">
          {constants.footer.disclaimer}
        </Text>

        {/* 版本信息 */}
        <Text className="text-xs text-gray-400 dark:text-gray-500">
          {constants.footer.copyrightPrefix} {currentYear} | v{version} (
          {commitHash})
        </Text>

        {/* 装饰线 */}
        <View className="w-10 h-px bg-gray-300 dark:bg-gray-700 mt-2"></View>
      </View>
    </View>
  );
};

export default Footer;
