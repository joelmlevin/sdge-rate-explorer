/**
 * Date and time utility functions
 * All functions handle conversion between UTC and Pacific Time
 */

import { parse, format, addHours, startOfDay, addDays } from 'date-fns';

/**
 * Convert UTC date and time strings from CSV to Pacific Time ISO string
 * CSV times are in UTC (8 hours ahead of Pacific)
 *
 * @param dateStr - Date string in "M/D/YYYY" format
 * @param timeStr - Time string in "H:MM:SS" format
 * @returns ISO 8601 timestamp in Pacific Time
 */
export function utcToPacific(dateStr: string, timeStr: string): string {
  // Parse the date and time as UTC
  const dateTimeStr = `${dateStr} ${timeStr}`;
  const utcDate = parse(dateTimeStr, 'M/d/yyyy H:mm:ss', new Date());

  // Subtract 8 hours to convert UTC to Pacific (PST/PDT)
  // Note: This is a simplified conversion that doesn't account for DST transitions
  // For production, you might want to use a library like date-fns-tz
  const pacificDate = addHours(utcDate, -8);

  return pacificDate.toISOString();
}

/**
 * Extract hour (0-23) from Pacific Time ISO timestamp
 */
export function getHourFromTimestamp(timestamp: string): number {
  const date = new Date(timestamp);
  return date.getHours();
}

/**
 * Extract date string (YYYY-MM-DD) from Pacific Time ISO timestamp
 */
export function getDateFromTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format hour (0-23) as human-readable string (e.g., "12 AM", "1 PM")
 */
export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

/**
 * Format hour range as human-readable string (e.g., "5-9 PM")
 */
export function formatHourRange(startHour: number, endHour: number): string {
  const start = formatHour(startHour);
  const end = formatHour(endHour);

  // Simplify if both in same period (AM/PM)
  if (start.endsWith('AM') && end.endsWith('AM')) {
    return `${startHour}-${endHour} AM`;
  }
  if (start.endsWith('PM') && end.endsWith('PM')) {
    if (startHour === 12) {
      return `12-${endHour - 12} PM`;
    }
    return `${startHour - 12}-${endHour - 12} PM`;
  }

  return `${start} - ${end}`;
}

/**
 * Get month name from month number (1-12)
 */
export function getMonthName(month: number): string {
  const date = new Date(2000, month - 1, 1);
  return format(date, 'MMMM');
}

/**
 * Get short month name from month number (1-12)
 */
export function getShortMonthName(month: number): string {
  const date = new Date(2000, month - 1, 1);
  return format(date, 'MMM');
}

/**
 * Get day of week name from day number (0=Sunday, 1=Monday, ..., 6=Saturday)
 */
export function getDayOfWeekName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}

/**
 * Get short day of week name from day number
 */
export function getShortDayOfWeekName(dayOfWeek: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayOfWeek];
}

/**
 * Convert DayStart code (from CSV) to day type
 * 1-5 = Weekday, 6-7 = Weekend, 8 = Holiday
 */
export function getDayType(dayStart: number): 'weekday' | 'weekend' | 'holiday' {
  if (dayStart === 8) return 'holiday';
  if (dayStart >= 6) return 'weekend';
  return 'weekday';
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get array of next N days as YYYY-MM-DD strings (including today)
 */
export function getNextNDays(n: number): string[] {
  const today = startOfDay(new Date());
  return Array.from({ length: n }, (_, i) => {
    const date = addDays(today, i);
    return format(date, 'yyyy-MM-dd');
  });
}

/**
 * Format date as human-readable string (e.g., "Monday, Jan 17")
 */
export function formatDateHuman(dateStr: string): string {
  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  return format(date, 'EEEE, MMM d');
}

/**
 * Check if a date string is today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayString();
}

/**
 * Parse ValueName from CSV to extract hour
 * ValueName format: "Jan Weekend HS0" where HS0-HS23 represents hour starting
 */
export function parseHourFromValueName(valueName: string): number {
  const match = valueName.match(/HS(\d+)/);
  if (!match) {
    throw new Error(`Unable to parse hour from ValueName: ${valueName}`);
  }
  return parseInt(match[1], 10);
}
