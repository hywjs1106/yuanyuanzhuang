import { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.qirui.dailyterminal',
  appName: '帝江号',
  webDir: 'dist',
  server: { androidScheme: 'https' },
  plugins: { LocalNotifications: { smallIcon: 'ic_stat_terminal', iconColor: '#E9C900' } },
};
export default config;