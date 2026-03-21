/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    // 小程序不需要 preflight，因为小程序的标签和 Web 不同（如 view, text）
    // weapp-tailwindcss 会处理这部分，为了防止冲突，通常建议关闭原生的 preflight
    preflight: false,
  },
};
