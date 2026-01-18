/**
 * Year Heatmap - Hourly rate visualization across entire year
 * X-axis: Days of year (365 columns)
 * Y-axis: Hours of day (24 rows)
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

  // Organize data: Map<date, Map<hour, rate>>
  const { dateArray, dataGrid } = useMemo(() => {
    console.log('YearHeatmap: Processing rates for year', year);
    console.log('Total rates:', rates.length);

    // Filter rates for this year
    const filtered = rates.filter(r => {
      const rateDate = new Date(r.date + 'T00:00:00');
      return rateDate.getFullYear() === year;
    });

    console.log('Filtered rates for year:', filtered.length);

    // Group by date
    const byDate = new Map<string, Map<number, number>>();
    filtered.forEach(r => {
      if (!byDate.has(r.date)) {
        byDate.set(r.date, new Map());
      }
      byDate.get(r.date)!.set(r.hour, r.totalRate);
    });

    // Get sorted array of dates
    const dates = Array.from(byDate.keys()).sort();
    console.log('Unique dates:', dates.length);
    console.log('First date:', dates[0], 'Last date:', dates[dates.length - 1]);

    return {
      dateArray: dates,
      dataGrid: byDate
    };
  }, [rates, year]);

  // Calculate color scale (95th percentile winsorization)
  const { minRate, maxRate, p95 } = useMemo(() => {
    const allRates = rates
      .filter(r => {
        const rateDate = new Date(r.date + 'T00:00:00');
        return rateDate.getFullYear() === year;
      })
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

  // Color scale function
  const getColor = (rate: number | undefined): string => {
    if (rate === undefined) return '#e5e7eb'; // Gray for missing data

    const clampedRate = Math.min(rate, p95);
    const normalized = Math.max(0, Math.min(1, (clampedRate - minRate) / (p95 - minRate)));

    // Purple (low) -> Teal (medium) -> Yellow (high)
    if (normalized < 0.5) {
      const t = normalized * 2;
      return interpolateColor('#8B5CF6', '#14B8A6', t);
    } else {
      const t = (normalized - 0.5) * 2;
      return interpolateColor('#14B8A6', '#EAB308', t);
    }
  };

  if (dateArray.length === 0) {
    return (
      <div className="p-8">
        <p style={{ color: designSystem.colors.text.tertiary }}>
          No data available for {year} heatmap
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between mb-4">
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

      {/* Heatmap grid: X=days, Y=hours */}
      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Month labels at top */}
          <div className="flex mb-1 ml-12">
            {dateArray.map((date, idx) => {
              const dateObj = new Date(date + 'T00:00:00');
              const day = dateObj.getDate();

              // Show month name on first day of month
              if (day === 1) {
                const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
                return (
                  <div
                    key={date}
                    className="text-[9px] font-bold"
                    style={{
                      width: '3px',
                      color: designSystem.colors.text.secondary,
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed'
                    }}
                  >
                    {month}
                  </div>
                );
              }
              return <div key={date} style={{ width: '3px' }} />;
            })}
          </div>

          {/* Hour rows */}
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="flex items-center mb-[1px]">
              {/* Hour label */}
              <div
                className="text-[10px] pr-2 text-right"
                style={{
                  width: '48px',
                  color: designSystem.colors.text.secondary
                }}
              >
                {hour}:00
              </div>

              {/* Day columns */}
              <div className="flex gap-[1px]">
                {dateArray.map((date) => {
                  const hourData = dataGrid.get(date);
                  const rate = hourData?.get(hour);
                  const color = getColor(rate);

                  return (
                    <div
                      key={date}
                      className="cursor-pointer hover:ring-1 hover:ring-black"
                      style={{
                        width: '3px',
                        height: '8px',
                        backgroundColor: color
                      }}
                      title={rate !== undefined
                        ? `${date} ${hour}:00 - ${toCents(rate).toFixed(2)}¢/kWh`
                        : `${date} ${hour}:00 - No data`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs" style={{ color: designSystem.colors.text.tertiary }}>
        {dateArray.length} days × 24 hours = {dateArray.length * 24} data points
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
