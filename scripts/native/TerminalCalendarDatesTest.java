package com.capacitorjs.plugins.localnotifications;
import java.text.SimpleDateFormat;
import java.util.Locale;
import java.util.TimeZone;

public final class TerminalCalendarDatesTest {
    static final SimpleDateFormat F = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm", Locale.US);
    static void check(String start, String recurrence, String after, String expected) throws Exception {
        String actual = F.format(TerminalCalendarDates.next(start, recurrence, F.parse(after).getTime()));
        if (!actual.equals(expected)) throw new AssertionError(actual + " != " + expected);
    }
    public static void main(String[] args) throws Exception {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Shanghai"));
        F.setTimeZone(TimeZone.getDefault());
        check("2026-11-01T08:30", "daily", "2026-10-14T10:00", "2026-11-01T08:30");
        check("2026-01-01T08:30", "daily", "2026-10-14T08:30", "2026-10-15T08:30");
        check("2026-10-12T08:30", "weekly", "2026-10-14T10:00", "2026-10-19T08:30");
        check("2026-01-31T08:30", "monthly", "2026-01-31T08:30", "2026-03-31T08:30");
        check("2026-01-31T08:30", "monthly", "2026-03-31T08:30", "2026-05-31T08:30");
        check("2024-02-29T08:30", "yearly", "2024-02-29T08:30", "2028-02-29T08:30");
        check("2096-02-29T08:30", "yearly", "2096-02-29T08:30", "2104-02-29T08:30");
        check("2026-12-31T08:30", "yearly", "2026-01-01T08:30", "2026-12-31T08:30");
        TimeZone.setDefault(TimeZone.getTimeZone("America/New_York"));
        F.setTimeZone(TimeZone.getDefault());
        check("2026-03-01T08:30", "daily", "2026-03-07T08:30", "2026-03-08T08:30");
        check("2026-03-01T08:30", "weekly", "2026-03-01T08:30", "2026-03-08T08:30");
        System.out.println("10 native calendar recurrence cases passed");
    }
}
