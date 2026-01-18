/**
 * Year Heatmap - Hourly rate visualization across entire year
 * Shows a dense grid of hourly rates with color coding
 */

import { useMemo } from 'react';
import type { RateEntry } from '../../types';
import { toCents } from '../../utils/rateUtils';
import { designs, type DesignVariant } from '../../styles/designs';

interface YearHeatmapProps {
  rates: RateEntry[];
  year: number;
  design?: DesignVariant;
}

export default function YearHeatmap({ rates, year, design = 'minimal' }: YearHeatmapProps) {
  const designSystem = designs[design];

  // Filter rates for this year and organize by date and hour
  const yearData = useMemo(() => {
    const filtered = rates.filter(r => {
      const date = new Date(r.date);
      return date.getFullYear() === year;
    });

    // Group by date
    const byDate = new Map<string, Map<number, number>>();
    filtered.forEach(r => {
      if (!byDate.has(r.date)) {
        byDate.set(r.date, new Map());
      }
      byDate.get(r.date)!.set(r.hour, r.totalRate);
    });

    // Convert to sorted array of dates
    const dates = Array.from(byDate.keys()).sort();
    return { dates, byDate };
  }, [rates, year]);

  // Calculate color scale (95th percentile winsorization)
  const { minRate, maxRate, p95 } = useMemo(() => {
    const allRates = rates
      .filter(r => new Date(r.date).getFullYear() === year)
      .map(r => r.totalRate)
      .sort((a, b) => a - b);

    if (allRates.length === 0) {
      return { minRate: 0, maxRate: 0, p95: 0 };
    }

    const p95Index = Math.floor(allRates.length * 0.95);
    return {
      minRate: allRates[0],
      maxRate: allRates[allRates.length - 1],
      p95: allRates[p95Index]
    };
  }, [rates, year]);

  // Color scale function (winsorized at 95th percentile)
  const getColor = (rate: number): string => {
    const clampedRate = Math.min(rate, p95);
    const normalized = (clampedRate - minRate) / (p95 - minRate);

    // Purple (low) -> Teal (medium) -> Yellow (high)
    if (normalized < 0.5) {
      // Purple to Teal
      const t = normalized * 2;
      return interpolateColor('#8B5CF6', '#14B8A6', t);
    } else {
      // Teal to Yellow
      const t = (normalized - 0.5) * 2;
      return interpolateColor('#14B8A6', '#EAB308', t);
    }
  };

  if (yearData.dates.length === 0) {
    return (
      <div className="p-8">
        <p style={{ color: designSystem.colors.text.tertiary }}>
          No data available for heatmap
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold" style={{ color: designSystem.colors.text.primary }}>
          Hourly Rate Heatmap
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span style={{ color: designSystem.colors.text.secondary }}>Low</span>
            <div className="flex gap-0.5">
              <div className="w-8 h-4 rounded-l" style={{ backgroundColor: '#8B5CF6' }} />
              <div className="w-8 h-4" style={{ backgroundColor: '#14B8A6' }} />
              <div className="w-8 h-4 rounded-r" style={{ backgroundColor: '#EAB308' }} />
            </div>
            <span style={{ color: designSystem.colors.text.secondary }}>High</span>
          </div>
          <div style={{ color: designSystem.colors.text.tertiary }}>
            {toCents(minRate).toFixed(1)}¢ – {toCents(p95).toFixed(1)}¢
          </div>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Hour labels */}
          <div className="flex mb-1">
            <div style={{ width: '60px' }} />
            {Array.from({ length: 24 }, (_, hour) => (
              <div
                key={hour}
                className="text-[9px] text-center"
                style={{
                  width: '12px',
                  color: designSystem.colors.text.tertiary
                }}
              >
                {hour % 6 === 0 ? hour : ''}
              </div>
            ))}
          </div>

          {/* Day rows */}
          <div className="space-y-0.5">
            {yearData.dates.map((date) => {
              const dateObj = new Date(date);
              const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
              const day = dateObj.getDate();
              const hourData = yearData.byDate.get(date)!;

              // Show month label on first day of month
              const showMonthLabel = day === 1;

              return (
                <div key={date} className="flex items-center">
                  <div
                    className="text-[10px] pr-2 text-right"
                    style={{
                      width: '60px',
                      color: designSystem.colors.text.secondary,
                      fontWeight: showMonthLabel ? 'bold' : 'normal'
                    }}
                  >
                    {showMonthLabel ? month : ''} {day}
                  </div>
                  <div className="flex gap-[1px]">
                    {Array.from({ length: 24 }, (_, hour) => {
                      const rate = hourData.get(hour);
                      const color = rate !== undefined ? getColor(rate) : designSystem.colors.borderLight;

                      return (
                        <div
                          key={hour}
                          className="cursor-pointer hover:opacity-80"
                          style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: color
                          }}
                          title={rate !== undefined ? `${toCents(rate).toFixed(2)}¢/kWh` : 'No data'}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to interpolate between two hex colors
function interpolateColor(color1: string, color2: string, t: number): string {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);

  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
