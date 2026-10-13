import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {VitePWA} from 'vite-plugin-pwa';
export default defineConfig({
  publicDir:'terminal-public',
  plugins:[react(),VitePWA({registerType:'autoUpdate',includeAssets:['terminal-icon.svg','LICENSE.txt','SOURCE.txt'],manifest:{id:'/daily-terminal',name:'日常终端',short_name:'日常终端',description:'记账、天气、提醒和黄历',lang:'zh-CN',theme_color:'#e6ed32',background_color:'#eeefeb',display:'standalone',start_url:'/',icons:[{src:'terminal-icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}]},workbox:{globPatterns:['**/*.{js,css,html,svg,txt}'],maximumFileSizeToCacheInBytes:3*1024*1024}})],
  resolve:{alias:{'@':path.resolve(__dirname,'./src')}},
  define:{'import.meta.env.PACKAGE_VERSION':JSON.stringify('0.1.0')},
  build:{target:'es2020',sourcemap:false,rollupOptions:{output:{manualChunks:{vendor:['react','react-dom'],calendar:['lunar-javascript'],db:['dexie','dexie-react-hooks']}}}},
});
