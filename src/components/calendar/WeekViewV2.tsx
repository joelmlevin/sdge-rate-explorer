/**
 * Week View V2 - Refined 7-day heatmap with design system
 * Clean, professional, data-focused
 */

import { getWeekDays } from '../../utils/calendarUtils';
import { toCents } from '../../utils/rateUtils';
import { getColorForRate } from '../../utils/colorScale';
import type { RateEntry } from '../../types';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { designs, type DesignVariant } from '../../styles/designs';

interface WeekViewProps {
  rates: RateEntry[];
  date: Date;
  design?: DesignVariant;
}

export default function WeekViewV2({ rates, date, design = 'minimal' }: WeekViewProps) {
  const weekDays = getWeekDays(rates, date);
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
  const designSystem = designs[design];

  if (weekDays.length === 0) {
    return (
      <div className={`${designSystem.borders.radius} p-12 text-center shadow-sm`}
           style={{ backgroundColor: designSystem.colors.surface, borderColor: designSystem.colors.border }}>
        <p style={{ color: designSystem.colors.text.tertiary }}>No data available for this week.</p>
      </div>
    );
  }

  // Calculate global min/max for consistent coloring
  const allRates = weekDays.flatMap(d => d.hourlyRates.map(h => h.totalRate));
  const minRate = Math.min(...allRates);
  const maxRate = Math.max(...allRates);

  return (
    <div className={`${designSystem.borders.radius} overflow-hidden shadow-sm`}
         style={{ backgroundColor: designSystem.colors.surface }}>
      {/* Header */}
      <div className="px-8 py-6 border-b" style={{ borderColor: designSystem.colors.border }}>
        <h2 className="text-3xl font-bold" style={{ color: designSystem.colors.text.primary }}>
          Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </h2>
      </div>

      {/* Heatmap grid - optimized for readability */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Day headers */}
          <div className="flex border-b" style={{ borderColor: designSystem.colors.border }}>
            <div className="w-20 flex-shrink-0" style={{ backgroundColor: designSystem.colors.background }}></div>
            {weekDays.map(day => (
              <div
                key={day.date}
                className="flex-1 text-center py-4 border-l min-w-[120px]"
                style={{
                  backgroundColor: day.isWeekend ? designSystem.colors.weekend.bg : designSystem.colors.background,
                  borderColor: designSystem.colors.borderLight,
                  color: day.isWeekend ? designSystem.colors.weekend.text : designSystem.colors.text.primary,
                }}
              >
                <div className="font-bold text-base">{format(day.dateObj, 'EEE')}</div>
                <div className="text-xs mt-1" style={{ color: designSystem.colors.text.secondary }}>
                  {format(day.dateObj, 'MMM d')}
                </div>
              </div>
            ))}
          </div>

          {/* Hour rows */}
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="flex border-b last:border-b-0"
                 style={{ borderColor: designSystem.colors.borderLight }}>
              {/* Hour label */}
              <div
                className="w-20 flex-shrink-0 flex items-center justify-center text-xs font-medium border-r"
                style={{
                  backgroundColor: designSystem.colors.background,
                  borderColor: designSystem.colors.borderLight,
                  color: designSystem.colors.text.secondary,
                }}
              >
                {formatHour(hour)}
              </div>

              {/* Day cells */}
              {weekDays.map(day => {
                const hourRate = day.hourlyRates.find(h => h.hour === hour);

                if (!hourRate) {
                  return (
                    <div
                      key={day.date}
                      className="flex-1 h-16 border-l min-w-[120px]"
                      style={{
                        backgroundColor: designSystem.colors.background,
                        borderColor: designSystem.colors.borderLight,
                      }}
                    />
                  );
                }

                const normalized = (hourRate.totalRate - minRate) / (maxRate - minRate || 1);
                const bgColor = getColorForRate(normalized, 'viridis');

                return (
                  <div
                    key={day.date}
                    className="flex-1 h-16 border-l flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:ring-2 hover:ring-inset transition-all min-w-[120px] group relative"
                    style={{
                      backgroundColor: bgColor,
                      borderColor: designSystem.colors.borderLight,
                    }}
                  >
                    <span className="drop-shadow">{toCents(hourRate.totalRate).toFixed(1)}¢</span>

                    {/* Hover tooltip */}
                    <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
                        <div className="font-bold mb-1">
                          {format(day.dateObj, 'EEE, MMM d')} at {formatHour(hour)}
                        </div>
                        <div className="font-semibold">{toCents(hourRate.totalRate).toFixed(2)}¢/kWh</div>
                        <div className="text-[10px] text-gray-400 mt-1 pt-1 border-t border-gray-700">
                          Gen: {toCents(hourRate.generationRate).toFixed(2)}¢
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Del: {toCents(hourRate.deliveryRate).toFixed(2)}¢
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-8 py-4 border-t flex items-center justify-between text-sm"
           style={{
             borderColor: designSystem.colors.border,
             backgroundColor: designSystem.colors.background,
             color: designSystem.colors.text.secondary,
           }}>
        <div className="font-semibold">
          Low: {toCents(minRate).toFixed(2)}¢/kWh
        </div>
        <div className="flex-1 mx-6 h-4 rounded-full" style={{
          background: `linear-gradient(to right, ${getColorForRate(0, 'viridis')}, ${getColorForRate(1, 'viridis')})`
        }}></div>
        <div className="font-semibold">
          High: {toCents(maxRate).toFixed(2)}¢/kWh
        </div>
      </div>
    </div>
  );
}

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}
