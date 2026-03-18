import { View, Text } from '@tarojs/components'
import './index.scss'

export default function Index() {
  return (
    <View className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <View className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm">
        <Text className="text-2xl font-bold text-blue-600 mb-4 block text-center">
          Taro + Tailwind
        </Text>
        <Text className="text-gray-600 text-base leading-relaxed text-center block">
          恭喜！你的基础项目已经搭建完成了。你可以像在普通的 React 网页中一样使用 Tailwind 类名。
        </Text>
        
        <View className="mt-6 flex justify-center">
          <View className="px-6 py-2 bg-blue-500 text-white rounded-full active:bg-blue-600 shadow-md">
            测试按钮
          </View>
        </View>
      </View>
    </View>
  )
}