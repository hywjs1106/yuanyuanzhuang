import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {VitePWA} from 'vite-plugin-pwa';
export default defineConfig({
  publicDir:'terminal-public',
  plugins:[react(),VitePWA({registerType:'autoUpdate',includeAssets:['terminal-icon.svg','LICENSE.txt','SOURCE.txt'],manifest:{id:'/daily-terminal',name:'帝江号',short_name:'帝江号',description:'记账、天气、提醒和黄历',lang:'zh-CN',theme_color:'#e6ed32',background_color:'#eeefeb',display:'standalone',start_url:'/',icons:[{src:'terminal-icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}]},workbox:{globPatterns:['**/*.{js,css,html,svg,txt}'],globIgnores:['characters/**','themes/**','branding/**','fonts/**'],maximumFileSizeToCacheInBytes:3*1024*1024,cleanupOutdatedCaches:true,runtimeCaching:[
    {urlPattern:({url})=>url.origin===self.location.origin&&/^\/(?:fonts|themes\/si)\/.*\.(?:woff2|ttf)$/.test(url.pathname),handler:'CacheFirst',options:{cacheName:'terminal-fonts-v1',cacheableResponse:{statuses:[200]},expiration:{maxEntries:8,maxAgeSeconds:365*24*60*60,purgeOnQuotaError:true}}},
    {urlPattern:({url})=>url.origin===self.location.origin&&/^\/(?:characters|themes|branding|previews)\/.*\.(?:png|webp|jpg|jpeg|gif|svg)$/.test(url.pathname),handler:'CacheFirst',options:{cacheName:'terminal-art-v1',cacheableResponse:{statuses:[200]},expiration:{maxEntries:160,maxAgeSeconds:30*24*60*60,purgeOnQuotaError:true}}},
    {urlPattern:({url})=>url.origin===self.location.origin&&/^\/(?:characters|themes)\/.*\.(?:mp4|webm)$/.test(url.pathname),handler:'CacheFirst',options:{cacheName:'terminal-media-v1',rangeRequests:true,cacheableResponse:{statuses:[200]},expiration:{maxEntries:8,maxAgeSeconds:30*24*60*60,purgeOnQuotaError:true}}}
   ]}})],
  resolve:{alias:{'@':path.resolve(__dirname,'./src')}},
  define:{'import.meta.env.PACKAGE_VERSION':JSON.stringify('0.7.1')},
  build:{target:'es2020',sourcemap:false,rollupOptions:{output:{manualChunks:{vendor:['react','react-dom'],calendar:['lunar-javascript'],db:['dexie','dexie-react-hooks']}}}},
});

