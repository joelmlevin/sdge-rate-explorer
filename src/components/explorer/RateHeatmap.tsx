/**
 * Rate Heatmap - Visual heatmap of rates by date and hour
 * Improved with colorblind-safe colors, better labels, and visual separators
 */

import { useMemo } from 'react';
import type { RateEntry } from '../../types';
import { toCents } from '../../utils/rateUtils';
import { getColorForRate, getLegendColors } from '../../utils/colorScale';
import { parse, format } from 'date-fns';

interface RateHeatmapProps {
  rates: RateEntry[];
  allRates: RateEntry[]; // All rates for consistent percentile calculation
}

export default function RateHeatmap({ rates, allRates }: RateHeatmapProps) {
  // Group rates by date and hour
  const heatmapData = useMemo(() => {
    if (rates.length === 0) return {
      dates: [] as string[],
      ratesByDateAndHour: new Map<string, Map<number, number>>(),
      minRate: 0,
      maxRate: 0,
      weekStarts: [] as number[]
    };

    // Get unique dates (sorted)
    const uniqueDates = Array.from(new Set(rates.map(r => r.date))).sort();

    // Create a map of date -> hour -> rate
    const ratesByDateAndHour = new Map<string, Map<number, number>>();

    rates.forEach(rate => {
      if (!ratesByDateAndHour.has(rate.date)) {
        ratesByDateAndHour.set(rate.date, new Map());
      }
      ratesByDateAndHour.get(rate.date)!.set(rate.hour, rate.rate);
    });

    // Calculate percentile-based min/max from ALL data (not just filtered)
    // This ensures consistent color scaling regardless of filters
    const sortedAllRates = [...allRates].map(r => r.rate).sort((a, b) => a - b);
    const p5Index = Math.floor(sortedAllRates.length * 0.05);
    const p95Index = Math.floor(sortedAllRates.length * 0.95);

    const minRate = sortedAllRates[p5Index]; // 5th percentile of ALL data
    const maxRate = sortedAllRates[p95Index]; // 95th percentile of ALL data

    // Identify week boundaries (Sundays)
    const weekStarts: number[] = [];
    uniqueDates.forEach((date, index) => {
      const dateObj = parse(date, 'yyyy-MM-dd', new Date());
      if (dateObj.getDay() === 0 && index > 0) { // Sunday and not first row
        weekStarts.push(index);
      }
    });

    return {
      dates: uniqueDates,
      ratesByDateAndHour,
      minRate,
      maxRate,
      weekStarts,
    };
  }, [rates, allRates]);

  if (rates.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No data to display. Adjust filters to see rates.</p>
      </div>
    );
  }

  const { dates, ratesByDateAndHour, minRate, maxRate, weekStarts } = heatmapData;

  // Calculate range for better color distribution
  const rateRange = maxRate - minRate;
  const rangePercent = (maxRate > 0) ? (rateRange / maxRate) * 100 : 0;

  // Get color using colorblind-safe scale with percentile-based normalization
  const getColor = (rate: number) => {
    // Handle edge case where all rates are the same
    if (maxRate === minRate) {
      return getColorForRate(0.5, 'viridis'); // Use middle color
    }

    // Normalize to 0-1 based on percentile range, clamp outliers
    let normalized = (rate - minRate) / (maxRate - minRate);
    normalized = Math.max(0, Math.min(1, normalized)); // Clamp to 0-1

    return getColorForRate(normalized, 'viridis');
  };

  // Debug: log the rate range
  console.log('Rate range:', {
    minRate: minRate.toFixed(4),
    maxRate: maxRate.toFixed(4),
    range: rateRange.toFixed(4),
    rangePercent: rangePercent.toFixed(1) + '%',
    rateCount: rates.length,
    dateCount: dates.length
  });

  // Format date as short label
  const formatDateShort = (dateStr: string) => {
    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    return format(date, 'MMM d'); // e.g., "Jan 17"
  };

  // Get day of week abbreviation
  const getDayOfWeek = (dateStr: string) => {
    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    return format(date, 'EEE'); // e.g., "Mon"
  };

  // Check if date is weekend
  const isWeekend = (dateStr: string) => {
    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // Legend colors
  const legendColors = getLegendColors(24, 'viridis');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Rate Heatmap</h3>
          <p className="text-sm text-gray-600">
            Showing {rates.length} entries • {dates.length} days
          </p>
        </div>
        <div className="text-xs text-gray-500">
          Colorblind-safe scale • Hover for details
        </div>
      </div>

      <div className="flex gap-4">
        {/* Main heatmap */}
        <div className="flex-1 overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Hour labels */}
            <div className="flex mb-2">
              <div className="w-24 flex-shrink-0"></div>
              <div className="flex-1 flex">
                {Array.from({ length: 24 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 text-center text-xs text-gray-600 font-medium"
                    style={{ minWidth: '36px' }}
                  >
                    {i % 6 === 0 ? (i === 0 ? '12a' : i === 12 ? '12p' : i < 12 ? `${i}a` : `${i - 12}p`) : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Heatmap rows */}
            <div className="space-y-0.5">
              {dates.map((date, dateIndex) => {
                const dayRates = ratesByDateAndHour.get(date);
                if (!dayRates) return null;

                const isWeekendDay = isWeekend(date);
                const isWeekBoundary = weekStarts.includes(dateIndex);

                return (
                  <div key={date}>
                    {/* Week separator */}
                    {isWeekBoundary && (
                      <div className="h-3 border-t-2 border-gray-300 mb-2 mt-2" />
                    )}

                    <div className="flex items-center">
                      {/* Date label */}
                      <div className={`w-24 flex-shrink-0 text-xs font-medium pr-2 ${isWeekendDay ? 'text-blue-600' : 'text-gray-700'}`}>
                        <span className="block">{getDayOfWeek(date)}</span>
                        <span className="block text-gray-500">{formatDateShort(date)}</span>
                      </div>

                      {/* Hour cells */}
                      <div className="flex-1 flex gap-0.5">
                        {Array.from({ length: 24 }, (_, hour) => {
                          const rate = dayRates.get(hour);
                          if (rate === undefined) {
                            return (
                              <div
                                key={hour}
                                className="flex-1 bg-gray-100 rounded-sm"
                                style={{ minWidth: '36px', height: '36px' }}
                                title="No data"
                              />
                            );
                          }

                          return (
                            <div
                              key={hour}
                              className={`flex-1 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all ${isWeekendDay ? 'ring-1 ring-blue-200' : ''}`}
                              style={{
                                backgroundColor: getColor(rate),
                                minWidth: '36px',
                                height: '36px',
                              }}
                              title={`${formatDateShort(date)}, ${hour % 12 || 12}${hour >= 12 ? 'PM' : 'AM'}: ${toCents(rate).toFixed(1)}¢/kWh`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Vertical legend on right */}
        <div className="flex-shrink-0 w-20 flex flex-col items-center justify-center">
          <div className="text-xs text-gray-600 mb-1 text-center font-medium">
            {toCents(maxRate).toFixed(1)}¢
          </div>
          <div className="text-[10px] text-gray-400 mb-2 text-center">
            95th %ile
          </div>
          <div className="flex flex-col-reverse gap-0.5">
            {legendColors.map((color, i) => (
              <div
                key={i}
                className="w-8 h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="text-[10px] text-gray-400 mt-2 text-center">
            5th %ile
          </div>
          <div className="text-xs text-gray-600 mt-1 text-center font-medium">
            {toCents(minRate).toFixed(1)}¢
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm ring-1 ring-blue-200"></div>
            <span>Weekend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-8 bg-gray-300"></div>
            <span>Week boundary</span>
          </div>
        </div>
        <div>
          Purple = Low • Yellow = High • Color scale fixed to dataset's 5th-95th percentile for consistent comparison
        </div>
      </div>
    </div>
  );
}
