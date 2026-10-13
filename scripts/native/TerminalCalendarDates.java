package com.capacitorjs.plugins.localnotifications;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

/** Gregorian local wall-clock recurrence, skipping absent dates instead of clamping. */
public final class TerminalCalendarDates {
    public static long next(String startAt, String recurrence, long after) throws Exception {
        SimpleDateFormat parser = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm", Locale.US);
        parser.setLenient(false);
        Calendar origin = Calendar.getInstance();
        origin.setTime(parser.parse(startAt));
        long bound = Math.max(after, origin.getTimeInMillis() - 1);
        Calendar base = Calendar.getInstance();
        base.setTimeInMillis(bound);
        int hour = origin.get(Calendar.HOUR_OF_DAY), minute = origin.get(Calendar.MINUTE);
        if (recurrence.equals("daily") || recurrence.equals("weekly")) {
            base.set(Calendar.HOUR_OF_DAY, hour);
            base.set(Calendar.MINUTE, minute);
            base.set(Calendar.SECOND, 0);
            base.set(Calendar.MILLISECOND, 0);
            if (recurrence.equals("weekly")) {
                int delta = (origin.get(Calendar.DAY_OF_WEEK) - base.get(Calendar.DAY_OF_WEEK) + 7) % 7;
                base.add(Calendar.DATE, delta);
            }
            if (base.getTimeInMillis() <= bound) base.add(Calendar.DATE, recurrence.equals("weekly") ? 7 : 1);
            return base.getTimeInMillis();
        }
        if (!recurrence.equals("monthly") && !recurrence.equals("yearly")) throw new IllegalArgumentException("recurrence");
        int year = base.get(Calendar.YEAR), month = base.get(Calendar.MONTH);
        for (int i = 0; i < 120; i++) {
            Calendar candidate = Calendar.getInstance();
            candidate.clear();
            candidate.setLenient(false);
            candidate.set(year, recurrence.equals("yearly") ? origin.get(Calendar.MONTH) : month,
                origin.get(Calendar.DAY_OF_MONTH), hour, minute, 0);
            try {
                long time = candidate.getTimeInMillis();
                if (time > bound) return time;
            } catch (IllegalArgumentException invalidDate) { /* absent day31 / Feb29 */ }
            if (recurrence.equals("yearly")) year++;
            else if (++month > 11) { month = 0; year++; }
        }
        throw new IllegalArgumentException("No calendar occurrence");
    }
}
