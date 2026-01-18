/**
 * Simplified Rate Heatmap - working version without fancy features
 */

import { useMemo } from 'react';
import type { RateEntry } from '../../types';

interface RateHeatmapProps {
  rates: RateEntry[];
}

export default function RateHeatmapSimple({ rates }: RateHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Get unique dates (limited for performance)
    const uniqueDates = Array.from(new Set(rates.map(r => r.date))).sort().slice(0, 30);

    // Create map of date -> hour -> rate
    const ratesByDateAndHour = new Map<string, Map<number, number>>();

    rates.forEach(rate => {
      if (!ratesByDateAndHour.has(rate.date)) {
        ratesByDateAndHour.set(rate.date, new Map());
      }
      ratesByDateAndHour.get(rate.date)!.set(rate.hour, rate.rate);
    });

    // Get min/max for color scaling (don't use spread with large arrays!)
    let minRate = Infinity;
    let maxRate = -Infinity;
    rates.forEach(r => {
      if (r.rate < minRate) minRate = r.rate;
      if (r.rate > maxRate) maxRate = r.rate;
    });

    return { uniqueDates, ratesByDateAndHour, minRate, maxRate };
  }, [rates]);

  const { uniqueDates, ratesByDateAndHour, minRate, maxRate } = heatmapData;

  if (rates.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No data to display. Adjust filters to see rates.</p>
      </div>
    );
  }

  // Simple color function
  const getColor = (rate: number) => {
    const normalized = (rate - minRate) / (maxRate - minRate);
    const r = Math.round(68 + (253 - 68) * normalized);
    const g = Math.round(1 + (231 - 1) * normalized);
    const b = Math.round(84 + (37 - 84) * normalized);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Rate Heatmap</h3>
        <p className="text-sm text-gray-600">
          Showing first {uniqueDates.length} days
        </p>
      </div>

      <div className="overflow-x-auto">
        {/* Hour labels */}
        <div className="flex mb-2">
          <div className="w-24"></div>
          <div className="flex-1 flex">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="flex-1 text-center text-xs" style={{ minWidth: '32px' }}>
                {i % 6 === 0 ? (i === 0 ? '12a' : i === 12 ? '12p' : i < 12 ? `${i}a` : `${i - 12}p`) : ''}
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap rows */}
        <div className="space-y-1">
          {uniqueDates.map((date) => {
            const dayRates = ratesByDateAndHour.get(date);
            if (!dayRates) return null;

            return (
              <div key={date} className="flex items-center">
                <div className="w-24 text-xs pr-2">{date}</div>
                <div className="flex-1 flex gap-0.5">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const rate = dayRates.get(hour);
                    if (!rate) {
                      return (
                        <div key={hour} className="flex-1 bg-gray-100 rounded-sm" style={{ minWidth: '32px', height: '32px' }} />
                      );
                    }

                    return (
                      <div
                        key={hour}
                        className="flex-1 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500"
                        style={{
                          backgroundColor: getColor(rate),
                          minWidth: '32px',
                          height: '32px',
                        }}
                        title={`${date}, ${hour}:00 - ${(rate * 100).toFixed(1)}¢/kWh`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm">
        <span>Low ({(minRate * 100).toFixed(1)}¢)</span>
        <div className="w-32 h-4" style={{
          background: `linear-gradient(to right, ${getColor(minRate)}, ${getColor(maxRate)})`
        }}></div>
        <span>High ({(maxRate * 100).toFixed(1)}¢)</span>
      </div>
    </div>
  );
}
