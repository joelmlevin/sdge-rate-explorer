/**
 * Date and time utility functions
 * All functions handle conversion between UTC and Pacific Time
 */

import { parse, format, startOfDay, addDays } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

// Pacific timezone identifier
const PACIFIC_TZ = 'America/Los_Angeles';

/**
 * Convert UTC date and time strings from CSV to Pacific Time ISO string
 * Pacific Standard Time is 8 hours behind UTC (UTC-8)
 * Pacific Daylight Time is 7 hours behind UTC (UTC-7)
 *
 * @param dateStr - Date string in "M/D/YYYY" format (UTC)
 * @param timeStr - Time string in "H:MM:SS" format (UTC)
 * @returns ISO 8601 timestamp representing the Pacific time moment
 */
export function utcToPacific(dateStr: string, timeStr: string): string {
  // Parse the date and time components
  const [month, day, year] = dateStr.split('/').map(Number);
  const [hour, minute, second] = timeStr.split(':').map(Number);
  
  // Create a UTC date using Date.UTC (this is the correct UTC moment)
  const utcTimestamp = Date.UTC(year, month - 1, day, hour, minute, second);
  const utcDate = new Date(utcTimestamp);
  
  // Format this UTC moment in Pacific timezone
  // The formatInTimeZone function will handle DST automatically
  const pacificStr = formatInTimeZone(utcDate, PACIFIC_TZ, "yyyy-MM-dd'T'HH:mm:ssXXX");
  
  // Convert back to ISO string (which represents the same moment in UTC)
  return new Date(pacificStr).toISOString();
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
