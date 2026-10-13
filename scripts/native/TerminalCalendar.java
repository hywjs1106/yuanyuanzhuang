package com.capacitorjs.plugins.localnotifications;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Logger;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;
import org.json.JSONObject;

/** Runs in the alarm receiver without a WebView; stored next dates survive boot. */
public final class TerminalCalendar {
    public static boolean repeating(JSObject notification) {
        if (notification == null) return false;
        JSONObject extra = notification.optJSONObject("extra");
        return extra != null && extra.optBoolean("terminal") &&
            !extra.optString("recurrence", "once").equals("once") && extra.has("startAt");
    }

    public static boolean advance(JSObject notification, long after) {
        if (!repeating(notification)) return false;
        try {
            JSONObject extra = notification.getJSONObject("extra");
            String skip = extra.optString("skipUntil", "");
            if (!skip.isEmpty()) {
                SimpleDateFormat iso = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX", Locale.US);
                after = Math.max(after, iso.parse(skip).getTime());
            }
            long next = TerminalCalendarDates.next(extra.getString("startAt"), extra.getString("recurrence"), after);
            SimpleDateFormat utc = new SimpleDateFormat(LocalNotificationSchedule.JS_DATE_FORMAT, Locale.US);
            utc.setTimeZone(TimeZone.getTimeZone("UTC"));
            JSONObject schedule = notification.getJSONObject("schedule");
            schedule.put("at", utc.format(new Date(next)));
            schedule.put("repeats", false);
            schedule.put("isRemovable", false);
            return true;
        } catch (Exception error) {
            Logger.error(Logger.tags("LN"), "Terminal calendar recurrence failed", error);
            return false;
        }
    }

    public static boolean reschedule(Context context, Intent intent, int id) {
        NotificationStorage storage = new NotificationStorage(context);
        JSObject json = storage.getSavedNotificationAsJSObject(Integer.toString(id));
        if (!repeating(json)) return false;
        if (!advance(json, System.currentTimeMillis())) return true; // retain recoverable recurring record
        try {
            LocalNotification request = LocalNotification.buildNotificationFromJSObject(json);
            storage.appendNotifications(java.util.Collections.singletonList(request));
            AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) flags |= PendingIntent.FLAG_MUTABLE;
            PendingIntent pending = PendingIntent.getBroadcast(context, id, (Intent) intent.clone(), flags);
            long at = request.getSchedule().getAt().getTime();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !manager.canScheduleExactAlarms()) {
                manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pending);
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pending);
            } else {
                manager.setExact(AlarmManager.RTC_WAKEUP, at, pending);
            }
            return true;
        } catch (Exception error) {
            Logger.error(Logger.tags("LN"), "Terminal alarm reschedule failed", error);
            return true; // boot / foreground reconciliation can retry this stored recurrence
        }
    }
}
