import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = resolve(root, 'node_modules/@capacitor/local-notifications/android/src/main/java/com/capacitorjs/plugins/localnotifications');
function patch(file, anchor, replacement) {
  const path = resolve(dir, file);
  const text = readFileSync(path, 'utf8').replaceAll('\r\n', '\n');
  if (text.includes(replacement)) return;
  if (!text.includes(anchor)) throw new Error(`Unsupported Capacitor source: ${file}`);
  writeFileSync(path, text.replace(anchor, replacement));
}
for (const file of ['TerminalCalendar.java', 'TerminalCalendarDates.java']) {
  copyFileSync(resolve(root, 'scripts/native', file), resolve(dir, file));
}
patch('TimedNotificationPublisher.java',
  '        String dateString = intent.getStringExtra(CRON_KEY);',
  '        if (TerminalCalendar.reschedule(context, intent, id)) return true;\n        String dateString = intent.getStringExtra(CRON_KEY);');
patch('TimedNotificationPublisher.java',
  '        JSObject notificationJson = storage.getSavedNotificationAsJSObject(Integer.toString(id));',
  '        JSObject notificationJson = storage.getSavedNotificationAsJSObject(Integer.toString(id));\n        if (notificationJson == null) return; // cancelled schedules must not deliver a stale broadcast');
patch('LocalNotification.java',
  '        LocalNotification localNotification = new LocalNotification();',
  '        if (TerminalCalendar.repeating(jsonObject)) {\n            TerminalCalendar.advance(jsonObject, System.currentTimeMillis());\n        }\n        LocalNotification localNotification = new LocalNotification();');
patch('LocalNotificationSchedule.java',
  '    public boolean isRemovable() {',
  '    public boolean isRemovable() {\n        if (scheduleObj != null && !scheduleObj.optBoolean("isRemovable", true)) return false;');
const manifest = resolve(root, 'node_modules/@capacitor/local-notifications/android/src/main/AndroidManifest.xml');
const manifestText = readFileSync(manifest, 'utf8');
if (!manifestText.includes('android.intent.action.TIMEZONE_CHANGED')) {
  const anchor = '<action android:name="android.intent.action.QUICKBOOT_POWERON" />';
  if (!manifestText.includes(anchor)) throw new Error('Unsupported notification manifest');
  writeFileSync(manifest, manifestText.replace(anchor, `${anchor}
                <action android:name="android.intent.action.TIMEZONE_CHANGED" />
                <action android:name="android.intent.action.TIME_SET" />
                <action android:name="android.intent.action.MY_PACKAGE_REPLACED" />
                <action android:name="android.app.action.SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED" />`));
}
console.log('Applied persistent terminal calendar notification patch.');
