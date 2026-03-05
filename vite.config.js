import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

  // 核心魔法：判断当前是否在 Cloudflare Pages 的构建环境中
  const isCloudflarePages = process.env.CF_PAGES === '1';

  return { 
    plugins: [react()],
    
    // 动态配置 base：如果在 Cloudflare 打包就用 '/'，否则（比如本地或 Github Pages）就用 '/bagua/'
    base: isCloudflarePages ? '/' : '/bagua/', 
    
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version), // 注入版本号
    },
  };
})
