import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
server: {
      port: 3000,
      host: '0.0.0.0',
      // 前端请求 /api 时自动代理至本地 Cloudflare Worker (默认端口 8787)
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8787',
          changeOrigin: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' 
        ? null 
        : {
            // 忽略 .wrangler 内部所有文件的变动监听，避免 D1 读写触发无限刷新
            ignored: ['**/.wrangler/**'],
          },
    },
  };
});
