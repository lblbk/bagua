import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

  return { 
    plugins: [react()],
    base: '/bagua/', 
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version), // 注入版本号
    },
  };
})
