/**
 * Utility functions for rate calculations and analysis
 */

import type { RateEntry, RateStatistics, HourlyRate, DailyInsights, BatteryRecommendation } from '../types';
import { formatHour } from './dateUtils';

/**
 * Calculate statistics for an array of rates
 */
export function calculateRateStatistics(rates: number[]): RateStatistics {
  if (rates.length === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      percentile25: 0,
      percentile50: 0,
      percentile75: 0,
      percentile90: 0,
      percentile95: 0,
    };
  }

  const sorted = [...rates].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const mean = sum / count;

  // Calculate standard deviation
  const squaredDiffs = sorted.map((val) => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / count;
  const stdDev = Math.sqrt(variance);

  // Calculate percentiles
  const percentile = (p: number) => {
    const index = Math.ceil((p / 100) * count) - 1;
    return sorted[Math.max(0, index)];
  };

  return {
    count,
    mean,
    median: percentile(50),
    min: sorted[0],
    max: sorted[count - 1],
    stdDev,
    percentile25: percentile(25),
    percentile50: percentile(50),
    percentile75: percentile(75),
    percentile90: percentile(90),
    percentile95: percentile(95),
  };
}

/**
 * Calculate which percentile a rate falls into
 * Returns a value between 0 and 100
 */
export function getRatePercentile(rate: number, allRates: number[]): number {
  const sorted = [...allRates].sort((a, b) => a - b);
  const index = sorted.findIndex((r) => r >= rate);
  if (index === -1) return 100;
  return (index / sorted.length) * 100;
}

/**
 * Convert $/kWh to cents/kWh
 */
export function toCents(dollarRate: number): number {
  return dollarRate * 100;
}

/**
 * Get color for a rate based on its percentile
 * Returns Tailwind color class
 */
export function getRateColor(percentile: number): string {
  if (percentile >= 75) return 'text-emerald-600';  // High rate (good for export)
  if (percentile >= 50) return 'text-amber-600';    // Medium-high rate
  if (percentile >= 25) return 'text-orange-600';   // Medium-low rate
  return 'text-red-600';                            // Low rate
}

/**
 * Get background color for a rate based on its percentile
 */
export function getRateBackgroundColor(percentile: number): string {
  if (percentile >= 75) return 'bg-emerald-100';
  if (percentile >= 50) return 'bg-amber-100';
  if (percentile >= 25) return 'bg-orange-100';
  return 'bg-red-100';
}

/**
 * Process hourly rates for a single day
 */
export function processHourlyRates(dayRates: RateEntry[]): HourlyRate[] {
  const rates = dayRates.map((r) => r.rate);

  return dayRates.map((entry) => {
    const percentile = getRatePercentile(entry.rate, rates);
    return {
      hour: entry.hour,
      hourLabel: formatHour(entry.hour),
      rate: entry.rate,
      rateCents: entry.rateCents,
      percentile,
      isTopQuartile: percentile >= 75,
      isBottomQuartile: percentile <= 25,
    };
  });
}

/**
 * Generate daily insights including battery recommendations
 */
export function generateDailyInsights(dayRates: RateEntry[]): DailyInsights {
  if (dayRates.length === 0) {
    throw new Error('No rates provided for daily insights');
  }

  const rates = dayRates.map((r) => r.rate);
  const stats = calculateRateStatistics(rates);

  // Sort by rate to find peaks and lows
  const sorted = [...dayRates].sort((a, b) => b.rate - a.rate);

  // Top 3 highest rate hours
  const peakRateHours = sorted.slice(0, 3).map((entry) => ({
    hour: entry.hour,
    rate: entry.rate,
    rateCents: entry.rateCents,
    timestamp: entry.timestamp,
  }));

  // Top 3 lowest rate hours
  const lowestRateHours = sorted.slice(-3).reverse().map((entry) => ({
    hour: entry.hour,
    rate: entry.rate,
    rateCents: entry.rateCents,
    timestamp: entry.timestamp,
  }));

  // Generate battery recommendations
  const recommendations = generateBatteryRecommendations(dayRates, stats);

  return {
    date: dayRates[0].date,
    dayOfWeek: dayRates[0].dayOfWeekName,
    peakRateHours,
    lowestRateHours,
    averageRate: stats.mean,
    averageRateCents: toCents(stats.mean),
    minRate: stats.min,
    maxRate: stats.max,
    percentile25: stats.percentile25,
    percentile50: stats.percentile50,
    percentile75: stats.percentile75,
    percentile90: stats.percentile90,
    recommendations,
  };
}

/**
 * Generate battery charging/discharging recommendations
 */
function generateBatteryRecommendations(
  dayRates: RateEntry[],
  stats: RateStatistics
): BatteryRecommendation[] {
  const recommendations: BatteryRecommendation[] = [];

  // Sort rates by hour for sequential processing
  const sortedByHour = [...dayRates].sort((a, b) => a.hour - b.hour);

  // Find discharge windows (high rate periods)
  // Look for consecutive hours above 75th percentile
  let currentDischargeWindow: RateEntry[] = [];

  sortedByHour.forEach((entry, index) => {
    if (entry.rate >= stats.percentile75) {
      currentDischargeWindow.push(entry);
    } else {
      if (currentDischargeWindow.length > 0) {
        recommendations.push(createDischargeRecommendation(currentDischargeWindow));
        currentDischargeWindow = [];
      }
    }

    // Handle end of day
    if (index === sortedByHour.length - 1 && currentDischargeWindow.length > 0) {
      recommendations.push(createDischargeRecommendation(currentDischargeWindow));
    }
  });

  // Find charge windows (low rate periods)
  // Look for consecutive hours below 25th percentile
  let currentChargeWindow: RateEntry[] = [];

  sortedByHour.forEach((entry, index) => {
    if (entry.rate <= stats.percentile25) {
      currentChargeWindow.push(entry);
    } else {
      if (currentChargeWindow.length > 0) {
        recommendations.push(createChargeRecommendation(currentChargeWindow));
        currentChargeWindow = [];
      }
    }

    // Handle end of day
    if (index === sortedByHour.length - 1 && currentChargeWindow.length > 0) {
      recommendations.push(createChargeRecommendation(currentChargeWindow));
    }
  });

  // Sort by start hour
  return recommendations.sort((a, b) => a.startHour - b.startHour);
}

/**
 * Create a discharge recommendation from a window of high-rate hours
 */
function createDischargeRecommendation(window: RateEntry[]): BatteryRecommendation {
  const avgRate = window.reduce((sum, e) => sum + e.rate, 0) / window.length;
  const startHour = window[0].hour;
  const endHour = window[window.length - 1].hour;

  return {
    startTime: window[0].timestamp,
    endTime: window[window.length - 1].timestamp,
    startHour,
    endHour,
    action: 'discharge',
    averageRate: avgRate,
    averageRateCents: toCents(avgRate),
    reasoning: `High export rates (${toCents(avgRate).toFixed(1)}¢/kWh avg). Good time to discharge battery and export to grid.`,
    priority: window.length >= 3 ? 'high' : window.length >= 2 ? 'medium' : 'low',
  };
}

/**
 * Create a charge recommendation from a window of low-rate hours
 */
function createChargeRecommendation(window: RateEntry[]): BatteryRecommendation {
  const avgRate = window.reduce((sum, e) => sum + e.rate, 0) / window.length;
  const startHour = window[0].hour;
  const endHour = window[window.length - 1].hour;

  return {
    startTime: window[0].timestamp,
    endTime: window[window.length - 1].timestamp,
    startHour,
    endHour,
    action: 'charge',
    averageRate: avgRate,
    averageRateCents: toCents(avgRate),
    reasoning: `Low export rates (${toCents(avgRate).toFixed(1)}¢/kWh avg). Consider charging battery from solar rather than exporting.`,
    priority: window.length >= 3 ? 'high' : window.length >= 2 ? 'medium' : 'low',
  };
}

/**
 * Format rate for display with appropriate precision
 */
export function formatRate(rate: number, unit: 'dollars' | 'cents' = 'cents'): string {
  if (unit === 'cents') {
    return `${toCents(rate).toFixed(1)}¢`;
  }
  return `$${rate.toFixed(4)}`;
}
