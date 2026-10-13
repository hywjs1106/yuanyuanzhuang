import { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.qirui.dailyterminal',
  appName: '日常终端',
  webDir: 'dist',
  server: { androidScheme: 'https' },
  plugins: { LocalNotifications: { smallIcon: 'ic_stat_terminal', iconColor: '#E9C900' } },
};
export default config;