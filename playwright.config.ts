import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir:'./tests/browser', timeout:30000, workers:1, use:{channel:'chromium',baseURL:'http://127.0.0.1:5180', viewport:{width:390,height:844}}, webServer:{command:'npm run dev -- --host 127.0.0.1 --port 5180 --strictPort',url:'http://127.0.0.1:5180',reuseExistingServer:true}, reporter:'list' });
