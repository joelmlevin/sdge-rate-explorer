/**
 * Data service for loading and processing SDGE rate data
 * Handles CSV parsing and caching
 */

import Papa from 'papaparse';
import type { RawRateEntry, RateEntry, RateFilters } from '../types';
import {
  utcToPacific,
  getDateFromTimestamp,
  getMonthName,
  getDayOfWeekName,
  getDayType,
  parseHourFromValueName,
} from '../utils/dateUtils';
import { toCents } from '../utils/rateUtils';

// In-memory cache for processed data
let cachedRates: RateEntry[] | null = null;
let cachePromise: Promise<RateEntry[]> | null = null;

/**
 * Load and parse the CSV file
 * Uses caching to avoid re-parsing on subsequent calls
 */
export async function loadRates(): Promise<RateEntry[]> {
  // Return cached data if available
  if (cachedRates) {
    return cachedRates;
  }

  // Return existing promise if already loading
  if (cachePromise) {
    return cachePromise;
  }

  // Start loading
  cachePromise = new Promise((resolve, reject) => {
    Papa.parse<RawRateEntry>('/rates.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        try {
          const processed = processRawRates(results.data);
          cachedRates = processed;
          resolve(processed);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`Failed to load rates: ${error.message}`));
      },
    });
  });

  return cachePromise;
}

/**
 * Process raw CSV data into structured RateEntry objects
 */
function processRawRates(rawData: RawRateEntry[]): RateEntry[] {
  return rawData
    .filter((row) => {
      // Filter out invalid rows
      return row.RIN && row.DateStart && row.TimeStart && row.Value !== undefined;
    })
    .map((row) => {
      // Convert UTC timestamp to Pacific Time
      const timestamp = utcToPacific(row.DateStart, row.TimeStart);
      const date = getDateFromTimestamp(timestamp);

      // Parse hour from ValueName (more reliable than timestamp due to UTC conversion)
      const hour = parseHourFromValueName(row.ValueName);

      // Determine rate type from RIN
      const rateType: 'generation' | 'delivery' = row.RIN.includes('XXSD') ? 'generation' : 'delivery';

      // Create date object for extracting month, year, day of week
      const dateObj = new Date(timestamp);
      const month = dateObj.getMonth() + 1; // 0-indexed, so add 1
      const year = dateObj.getFullYear();
      const dayOfWeek = dateObj.getDay(); // 0=Sunday, 6=Saturday

      // Determine day type
      const dayType = getDayType(row.DayStart);

      return {
        timestamp,
        date,
        hour,
        rate: row.Value,
        rateCents: toCents(row.Value),
        rateType,
        rateName: row.RateName,
        dayType,
        month,
        monthName: getMonthName(month),
        year,
        dayOfWeek,
        dayOfWeekName: getDayOfWeekName(dayOfWeek),
      };
    })
    .sort((a, b) => {
      // Sort by date, then by hour
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.hour - b.hour;
    });
}

/**
 * Filter rates based on provided criteria
 */
export function filterRates(rates: RateEntry[], filters: RateFilters): RateEntry[] {
  let filtered = rates;

  // Date range filter
  if (filters.dateRange) {
    filtered = filtered.filter((rate) => {
      return (
        rate.date >= filters.dateRange!.startDate &&
        rate.date <= filters.dateRange!.endDate
      );
    });
  }

  // Time range filter (hours of day)
  if (filters.timeRange) {
    filtered = filtered.filter((rate) => {
      return (
        rate.hour >= filters.timeRange!.startHour &&
        rate.hour <= filters.timeRange!.endHour
      );
    });
  }

  // Month filter
  if (filters.months && filters.months.length > 0) {
    filtered = filtered.filter((rate) => filters.months!.includes(rate.month));
  }

  // Year filter
  if (filters.years && filters.years.length > 0) {
    filtered = filtered.filter((rate) => filters.years!.includes(rate.year));
  }

  // Day type filter
  if (filters.dayTypes && filters.dayTypes.length > 0) {
    filtered = filtered.filter((rate) => filters.dayTypes!.includes(rate.dayType));
  }

  // Rate type filter
  if (filters.rateTypes && filters.rateTypes.length > 0) {
    filtered = filtered.filter((rate) => filters.rateTypes!.includes(rate.rateType));
  }

  // Rate name filter
  if (filters.rateNames && filters.rateNames.length > 0) {
    filtered = filtered.filter((rate) => filters.rateNames!.includes(rate.rateName));
  }

  return filtered;
}

/**
 * Get rates for a specific date
 */
export function getRatesForDate(rates: RateEntry[], date: string): RateEntry[] {
  return rates.filter((rate) => rate.date === date);
}

/**
 * Get rates for multiple dates
 */
export function getRatesForDates(rates: RateEntry[], dates: string[]): RateEntry[] {
  const dateSet = new Set(dates);
  return rates.filter((rate) => dateSet.has(rate.date));
}

/**
 * Get all unique years in the dataset
 */
export function getAvailableYears(rates: RateEntry[]): number[] {
  const years = new Set(rates.map((rate) => rate.year));
  return Array.from(years).sort((a, b) => a - b);
}

/**
 * Get all unique rate names in the dataset
 */
export function getAvailableRateNames(rates: RateEntry[]): string[] {
  const rateNames = new Set(rates.map((rate) => rate.rateName));
  return Array.from(rateNames).sort();
}

/**
 * Get date range of available data
 */
export function getDateRange(rates: RateEntry[]): { min: string; max: string } {
  if (rates.length === 0) {
    return { min: '', max: '' };
  }

  const sorted = [...rates].sort((a, b) => a.date.localeCompare(b.date));
  return {
    min: sorted[0].date,
    max: sorted[sorted.length - 1].date,
  };
}

/**
 * Clear the cache (useful for testing or if data needs to be reloaded)
 */
export function clearCache(): void {
  cachedRates = null;
  cachePromise = null;
}
