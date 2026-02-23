/**
 * Calendar-specific utility functions for aggregating and displaying rate data
 */

import type { RateEntry } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';

export interface HourlyRate {
  hour: number;
  totalRate: number; // Sum of generation + delivery
  generationRate: number;
  deliveryRate: number;
}

export interface DaySummary {
  date: string; // yyyy-MM-dd
  dateObj: Date;
  hourlyRates: HourlyRate[];
  minRate: number;
  maxRate: number;
  avgRate: number;
  bestExportHour: number; // Hour with highest generation credit
  worstExportHour: number; // Hour with lowest generation credit
  dayOfWeek: number;
  dayOfWeekName: string;
  isWeekend: boolean;
}

/**
 * Aggregate generation and delivery rates for a single hour
 */
export function aggregateHourlyRate(rates: RateEntry[]): HourlyRate | null {
  if (rates.length === 0) return null;

  const hour = rates[0].hour;
  let generationRate = 0;
  let deliveryRate = 0;

  // Each entry already has dedicated generationRate/deliveryRate fields from the
  // preprocessed JSON format. rateType is hardcoded to 'generation' for all entries
  // and must not be used to distinguish the two components.
  rates.forEach(rate => {
    generationRate += rate.generationRate ?? 0;
    deliveryRate += rate.deliveryRate ?? 0;
  });

  return {
    hour,
    totalRate: generationRate + deliveryRate,
    generationRate,
    deliveryRate,
  };
}

/**
 * Process all rates for a single day
 */
export function processDayRates(rates: RateEntry[], date: Date): DaySummary | null {
  const dateStr = format(date, 'yyyy-MM-dd');

  // Filter rates for this specific day
  const dayRates = rates.filter(r => r.date === dateStr);

  if (dayRates.length === 0) return null;

  // Group by hour and aggregate
  const hourlyMap = new Map<number, RateEntry[]>();
  dayRates.forEach(rate => {
    if (!hourlyMap.has(rate.hour)) {
      hourlyMap.set(rate.hour, []);
    }
    hourlyMap.get(rate.hour)!.push(rate);
  });

  const hourlyRates: HourlyRate[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourRates = hourlyMap.get(hour);
    if (hourRates) {
      const aggregated = aggregateHourlyRate(hourRates);
      if (aggregated) {
        hourlyRates.push(aggregated);
      }
    }
  }

  if (hourlyRates.length === 0) return null;

  // Calculate statistics
  const totalRates = hourlyRates.map(h => h.totalRate);
  const minRate = Math.min(...totalRates);
  const maxRate = Math.max(...totalRates);
  const avgRate = totalRates.reduce((sum, r) => sum + r, 0) / totalRates.length;

  // Find best/worst export hours based on total rate (generation + delivery)
  const bestHour = hourlyRates.reduce((best, curr) => curr.totalRate > best.totalRate ? curr : best);
  const worstHour = hourlyRates.reduce((worst, curr) => curr.totalRate < worst.totalRate ? curr : worst);

  const dayOfWeek = date.getDay();

  return {
    date: dateStr,
    dateObj: date,
    hourlyRates,
    minRate,
    maxRate,
    avgRate,
    bestExportHour: bestHour.hour,
    worstExportHour: worstHour.hour,
    dayOfWeek,
    dayOfWeekName: format(date, 'EEEE'),
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
  };
}

/**
 * Get all days in a month with their rate summaries
 */
export function getMonthDays(rates: RateEntry[], year: number, month: number): DaySummary[] {
  const monthStart = startOfMonth(new Date(year, month - 1)); // month is 1-indexed
  const monthEnd = endOfMonth(monthStart);

  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return allDays
    .map(day => processDayRates(rates, day))
    .filter((summary): summary is DaySummary => summary !== null);
}

/**
 * Get days for a specific week
 */
export function getWeekDays(rates: RateEntry[], date: Date): DaySummary[] {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(date, { weekStartsOn: 0 });

  const allDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return allDays
    .map(day => processDayRates(rates, day))
    .filter((summary): summary is DaySummary => summary !== null);
}

/**
 * Get calendar grid for month view (includes leading/trailing days)
 */
export function getMonthCalendarGrid(rates: RateEntry[], year: number, month: number): (DaySummary | null)[] {
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(monthStart);

  // Start from the Sunday of the week containing the 1st
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });

  // End on the Saturday of the week containing the last day
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return allDays.map(day => {
    // Only return summary if day is in the target month
    if (day.getMonth() === month - 1) {
      return processDayRates(rates, day);
    }
    return null;
  });
}

/**
 * Get summary stats for a month
 */
export interface MonthSummary {
  year: number;
  month: number;
  monthName: string;
  dayCount: number;
  avgDailyMin: number;
  avgDailyMax: number;
  overallAvg: number;
}

export function getMonthSummary(rates: RateEntry[], year: number, month: number): MonthSummary | null {
  const days = getMonthDays(rates, year, month);

  if (days.length === 0) return null;

  const avgDailyMin = days.reduce((sum, d) => sum + d.minRate, 0) / days.length;
  const avgDailyMax = days.reduce((sum, d) => sum + d.maxRate, 0) / days.length;
  const overallAvg = days.reduce((sum, d) => sum + d.avgRate, 0) / days.length;

  return {
    year,
    month,
    monthName: format(new Date(year, month - 1), 'MMMM'),
    dayCount: days.length,
    avgDailyMin,
    avgDailyMax,
    overallAvg,
  };
}
