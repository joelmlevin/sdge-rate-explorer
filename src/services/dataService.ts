/**
 * Data service for loading and processing SDGE rate data
 * Loads optimized JSON format (generated from CSV via preprocess-rates.js)
 */

import type { RateEntry, RateFilters } from '../types';
import { getMonthName, getDayOfWeekName } from '../utils/dateUtils';
import { toCents } from '../utils/rateUtils';

// In-memory cache for processed data
let cachedRates: RateEntry[] | null = null;
let cachePromise: Promise<RateEntry[]> | null = null;

// Get data URL from environment variable or use default
const DATA_URL = import.meta.env.VITE_DATA_URL || '/rates.json';

// Type for the optimized JSON format
interface OptimizedRateData {
  meta: {
    generated: string;
    version: string;
    dateRange: [string, string];
    totalHours: number;
    totalDays: number;
    description: string;
    format: string;
    fields: string[];
    dayTypes: Record<string, string>;
  };
  data: Array<[
    string,  // date
    number,  // hour
    number,  // generation
    number,  // delivery
    number,  // total
    string   // dayType (w/e/h)
  ]>;
}

/**
 * Validate the structure of loaded rate data
 * @param data - The data to validate
 * @throws Error if data is invalid
 */
function validateRateData(data: unknown): asserts data is OptimizedRateData {
  if (!data || typeof data !== 'object' || data === null) {
    throw new Error('Invalid rate data: not an object');
  }

  const obj = data as Record<string, unknown>;

  // Check for required meta field
  if (!obj.meta || typeof obj.meta !== 'object' || obj.meta === null) {
    throw new Error('Invalid rate data: missing or invalid meta field');
  }

  // Check for required data field
  if (!Array.isArray(obj.data)) {
    throw new Error('Invalid rate data: missing or invalid data array');
  }

  // Validate a sample of data entries
  if (obj.data.length > 0) {
    const sample = obj.data[0];
    if (!Array.isArray(sample) || sample.length !== 6) {
      throw new Error('Invalid rate data: data entries must be arrays of 6 elements');
    }
  }
}

/**
 * Load and parse the optimized JSON file
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
  cachePromise = (async () => {
    try {
      const response = await fetch(DATA_URL);

      if (!response.ok) {
        throw new Error(`Failed to load rates: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      
      // Validate data structure
      validateRateData(json);
      
      const processed = processOptimizedData(json);
      cachedRates = processed;
      return processed;
    } catch (error) {
      cachePromise = null; // Reset on error
      throw new Error(`Failed to load rates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  })();

  return cachePromise;
}

/**
 * Process optimized JSON data into RateEntry objects
 * Format: [date, hour, generation, delivery, total, dayType]
 */
function processOptimizedData(data: OptimizedRateData): RateEntry[] {
  const dayTypeMap: Record<string, 'weekday' | 'weekend' | 'holiday'> = {
    'w': 'weekday',
    'e': 'weekend',
    'h': 'holiday'
  };

  return data.data.map((entry) => {
    const [date, hour, generationRate, deliveryRate, totalRate, dayTypeCode] = entry;

    // Create timestamp string (Pacific Time)
    const timestamp = `${date}T${String(hour).padStart(2, '0')}:00:00-08:00`;

    // Parse date components
    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    const dayOfWeek = dateObj.getDay();

    // Decode day type
    const dayType = dayTypeMap[dayTypeCode] || 'weekday';

    return {
      timestamp,
      date,
      hour,
      rate: totalRate,
      rateCents: toCents(totalRate),
      rateType: 'generation', // Not needed anymore - we have combined data
      rateName: 'NBT',
      dayType,
      month,
      monthName: getMonthName(month),
      year,
      dayOfWeek,
      dayOfWeekName: getDayOfWeekName(dayOfWeek),
      // Add generation and delivery rates as separate fields
      generationRate,
      deliveryRate,
      generationRateCents: toCents(generationRate),
      deliveryRateCents: toCents(deliveryRate),
    };
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
