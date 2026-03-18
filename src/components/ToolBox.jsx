// components/ToolBox.jsx
import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro'; // 只引入 Taro

const ToolBox = ({ snapshotId }) => {

  const saveAsImage = () => {
    // 1. 正常的加载提示
    Taro.showLoading({ title: '生成中...', mask: true });

    // 2. 在 Skyline 下，直接调用查询，不要加 .in(scope)
    // 直接使用全局 Taro 对象的 createSelectorQuery
    const query = Taro.createSelectorQuery();

    query.select(`#${snapshotId}`)
      .node()
      .exec((res) => {
        // 调试用：看看 res 到底是什么
        console.log('Snapshot 查询结果:', res);

        if (!res || !res[0] || !res[0].node) {
          Taro.hideLoading();
          Taro.showToast({ title: '未捕获到快照节点', icon: 'none' });
          return;
        }

        const node = res[0].node;

        // 3. 执行原生快照
        node.takeSnapshot({
          format: 'png',
          success: (result) => {
            console.log('快照生成成功，临时路径:', result.tempFilePath);

            // 4. 保存到相册
            Taro.saveImageToPhotosAlbum({
              filePath: result.tempFilePath,
              success: () => {
                Taro.hideLoading();
                Taro.showToast({ title: '保存成功', icon: 'success' });
              },
              fail: (err) => {
                Taro.hideLoading();
                console.error('保存相册失败:', err);
                // 可能是权限问题
                if (err.errMsg.includes('auth')) {
                  Taro.showModal({
                    title: '授权提示',
                    content: '保存图片需要相册权限，请前往设置开启',
                    success: (mRes) => {
                      if (mRes.confirm) Taro.openSetting();
                    }
                  });
                }
              }
            });
          },
          fail: (err) => {
            Taro.hideLoading();
            console.error('快照接口调用失败:', err);
            Taro.showToast({ title: '生成失败', icon: 'none' });
          }
        });
      });
  };

  return (
    <View className="flex flex-row justify-center p-4">
      {/* 确保按钮使用了 Flex 布局，在 Skyline 下更稳固 */}
      <View
        onTap={saveAsImage}
        className="flex flex-row items-center justify-center px-10 py-3 bg-indigo-600 rounded-2xl shadow-lg active:opacity-80"
      >
        <Text className="text-white font-bold text-sm">保存结果图像</Text>
      </View>
    </View>
  );
};

export default ToolBox;