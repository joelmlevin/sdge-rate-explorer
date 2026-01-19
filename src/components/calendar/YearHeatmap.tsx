/**
 * Year Heatmap - Hourly rate visualization across entire year
 * X-axis: Days of year (365 columns)
 * Y-axis: Hours of day (24 rows)
 */

import { useMemo, useRef, useEffect, useState } from 'react';
import { format } from 'date-fns';
import type { RateEntry } from '../../types';
import { toCents } from '../../utils/rateUtils';
import { designs, type DesignVariant } from '../../styles/designs';

interface YearHeatmapProps {
  rates: RateEntry[];
  year: number;
  design?: DesignVariant;
  onDateClick?: (date: string) => void;
}

export default function YearHeatmap({ rates, year, design = 'minimal', onDateClick }: YearHeatmapProps) {
  const designSystem = designs[design];
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellWidth, setCellWidth] = useState(2);
  const [hoveredCell, setHoveredCell] = useState<{ date: string; hour: number; rate: number } | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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

    // Group by date and hour, summing generation + delivery
    const byDate = new Map<string, Map<number, number>>();
    filtered.forEach(r => {
      if (!byDate.has(r.date)) {
        byDate.set(r.date, new Map());
      }
      const hourMap = byDate.get(r.date)!;
      const currentRate = hourMap.get(r.hour) || 0;
      // Add this rate to the hour total (to sum generation + delivery)
      hourMap.set(r.hour, currentRate + r.rate);
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

  // Calculate color scale (full range)
  const { minRate, maxRate } = useMemo(() => {
    // Get all aggregated hourly rates from dataGrid
    const allRates: number[] = [];
    dataGrid.forEach(hourMap => {
      hourMap.forEach(rate => {
        allRates.push(rate);
      });
    });

    allRates.sort((a, b) => a - b);

    if (allRates.length === 0) {
      return { minRate: 0, maxRate: 0 };
    }

    const result = {
      minRate: allRates[0],
      maxRate: allRates[allRates.length - 1]
    };

    console.log('Color scale:', result);
    console.log('Sample rates:', allRates.slice(0, 10));

    return result;
  }, [dataGrid]);

  // Dynamic cell width calculation based on container width
  useEffect(() => {
    const updateCellWidth = () => {
      if (containerRef.current && dateArray.length > 0) {
        const containerWidth = containerRef.current.offsetWidth;
        const hourLabelWidth = 48;
        const availableWidth = containerWidth - hourLabelWidth - 32; // 32px for padding
        const calculatedWidth = Math.max(1, Math.floor(availableWidth / dateArray.length));
        setCellWidth(Math.min(calculatedWidth, 4)); // Cap at 4px max for visual consistency
      }
    };

    updateCellWidth();
    window.addEventListener('resize', updateCellWidth);
    return () => window.removeEventListener('resize', updateCellWidth);
  }, [dateArray.length]);

  // Color scale function with cubic root transformation (full range)
  // Cube root provides good perceptual discrimination across the full range
  const getColor = (rate: number | undefined): string => {
    if (rate === undefined) return '#e5e7eb'; // Gray for missing data

    // Clamp to valid range
    const clampedRate = Math.max(minRate, Math.min(rate, maxRate));

    // Cubic root transformation for perceptual uniformity
    // Works well across wide dynamic ranges
    const normalized = Math.pow((clampedRate - minRate) / (maxRate - minRate), 1/3);

    // Purple (low) -> Teal (medium) -> Yellow (high)
    if (normalized < 0.5) {
      const t = normalized * 2;
      return interpolateColor('#8B5CF6', '#14B8A6', t);
    } else {
      const t = (normalized - 0.5) * 2;
      return interpolateColor('#14B8A6', '#EAB308', t);
    }
  };

  // Generate legend color stops for display using cubic root transformation
  const legendStops = useMemo(() => {
    const stops = [];
    const numStops = 8;

    for (let i = 0; i <= numStops; i++) {
      const normalized = i / numStops;

      // Inverse of cubic root: normalized^3 scaled to rate range
      const rate = minRate + Math.pow(normalized, 3) * (maxRate - minRate);

      // Get color for this normalized position
      let color: string;
      if (normalized < 0.5) {
        const t = normalized * 2;
        color = interpolateColor('#8B5CF6', '#14B8A6', t);
      } else {
        const t = (normalized - 0.5) * 2;
        color = interpolateColor('#14B8A6', '#EAB308', t);
      }

      stops.push({ rate, color, normalized });
    }

    return stops;
  }, [minRate, maxRate]);

  if (dateArray.length === 0) {
    return (
      <div className="p-8">
        <p style={{ color: designSystem.colors.text.tertiary }}>
          No data available for {year} heatmap
        </p>
      </div>
    );
  }

  // Calculate month positions for labels
  const monthPositions = useMemo(() => {
    const positions: Array<{ month: string; index: number }> = [];
    dateArray.forEach((date, idx) => {
      const dateObj = new Date(date + 'T00:00:00');
      const day = dateObj.getDate();
      if (day === 1 || (idx === 0 && positions.length === 0)) {
        const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
        positions.push({ month, index: idx });
      }
    });
    return positions;
  }, [dateArray]);

  return (
    <div className="p-8 space-y-4" ref={containerRef}>
      <div className="mb-4">
        <h3 className="text-2xl font-bold" style={{ color: designSystem.colors.text.primary }}>
          Hourly Rate Heatmap
        </h3>
      </div>

      {/* Heatmap grid and legend container */}
      <div className="flex gap-6">
        {/* Heatmap grid: X=days, Y=hours */}
        <div className="flex-1 overflow-x-auto">
        <div className="inline-block">
          {/* Month labels at top */}
          <div className="relative mb-0" style={{ marginLeft: '48px', height: '28px' }}>
            {monthPositions.map(({ month, index }) => (
              <div
                key={index}
                className="absolute text-[11px] font-bold"
                style={{
                  left: `${index * cellWidth}px`,
                  color: designSystem.colors.text.secondary,
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed'
                }}
              >
                {month}
              </div>
            ))}
          </div>

          {/* Hour rows */}
          {Array.from({ length: 24 }, (_, hour) => {
            // Show labels every 2 hours (12a, 2a, 4a, etc.)
            const showLabel = hour % 2 === 0;
            const label = hour === 0 ? '12a' :
                         hour < 12 ? `${hour}a` :
                         hour === 12 ? '12p' :
                         `${hour - 12}p`;

            return (
              <div key={hour} className="flex items-center" style={{ lineHeight: 0 }}>
                {/* Hour label */}
                <div
                  className="text-[10px] pr-2 text-right"
                  style={{
                    width: '48px',
                    color: designSystem.colors.text.secondary
                  }}
                >
                  {showLabel ? label : ''}
                </div>

              {/* Day columns */}
              <div className="flex">
                {dateArray.map((date, idx) => {
                  const hourData = dataGrid.get(date);
                  const rate = hourData?.get(hour);
                  const color = getColor(rate);

                  // Debug: Log first date's data for hour 12
                  if (hour === 12 && idx === 0) {
                    console.log('Sample cell - date:', date, 'hour:', hour, 'rate:', rate, 'color:', color);
                    console.log('hourData for this date:', hourData);
                  }

                  return (
                    <div
                      key={date}
                      className="cursor-pointer"
                      style={{
                        width: `${cellWidth}px`,
                        height: '8px',
                        backgroundColor: color,
                        display: 'block',
                        lineHeight: 0
                      }}
                      onClick={() => onDateClick?.(date)}
                      onMouseEnter={(e) => {
                        if (rate !== undefined) {
                          setHoveredCell({ date, hour, rate });
                          setMousePosition({ x: e.clientX, y: e.clientY });
                        }
                      }}
                      onMouseMove={(e) => {
                        if (rate !== undefined) {
                          setMousePosition({ x: e.clientX, y: e.clientY });
                        }
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  );
                })}
              </div>
            </div>
            );
          })}
        </div>
        </div>

        {/* Vertical Legend */}
        <div className="flex-shrink-0 flex items-center" style={{ width: '100px' }}>
          <div className="flex flex-col" style={{ height: '200px', width: '100%' }}>
            <div className="text-xs font-semibold mb-2" style={{ color: designSystem.colors.text.primary }}>
              Rate (¢/kWh)
            </div>

            {/* Legend: gradient bar with rate labels */}
            <div className="flex gap-3 flex-1">
              {/* Continuous gradient bar showing color scale */}
              <div className="relative rounded overflow-hidden" style={{ width: '20px', minHeight: '100%' }}>
                {/* Render each color stop as a segment */}
                {legendStops.map((stop, idx) => {
                  if (idx === legendStops.length - 1) return null; // Skip last one
                  const nextStop = legendStops[idx + 1];
                  const height = (1 / (legendStops.length - 1)) * 100;

                  return (
                    <div
                      key={idx}
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: `${(idx / (legendStops.length - 1)) * 100}%`,
                        height: `${height}%`,
                        background: `linear-gradient(to top, ${stop.color}, ${nextStop.color})`
                      }}
                    />
                  );
                })}
              </div>

              {/* Rate labels positioned along the gradient */}
              <div className="relative flex-1">
                {legendStops.map((stop, idx) => {
                  // Only show some labels to avoid crowding
                  const showLabel = idx % 2 === 0 || idx === legendStops.length - 1;

                  return showLabel ? (
                    <div
                      key={idx}
                      className="absolute"
                      style={{
                        bottom: `${(idx / (legendStops.length - 1)) * 100}%`,
                        transform: 'translateY(50%)',
                        left: 0
                      }}
                    >
                      <span
                        className="text-[10px] whitespace-nowrap"
                        style={{ color: designSystem.colors.text.secondary }}
                      >
                        {toCents(stop.rate).toFixed(1)}¢
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredCell && (
        <div
          className="fixed pointer-events-none z-50 px-3 py-2 rounded-lg shadow-xl"
          style={{
            left: `${mousePosition.x + 12}px`,
            top: `${mousePosition.y - 40}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div className="text-xs font-semibold text-gray-700">
            {format(new Date(hoveredCell.date + 'T00:00:00'), 'MMM d, yyyy')} at {hoveredCell.hour}:00
          </div>
          <div className="text-sm font-bold" style={{ color: '#14B8A6' }}>
            {toCents(hoveredCell.rate).toFixed(2)}¢/kWh
          </div>
        </div>
      )}
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
