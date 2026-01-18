/**
 * Week View - 7-day heatmap showing hourly rates
 */

import { getWeekDays } from '../../utils/calendarUtils';
import { toCents } from '../../utils/rateUtils';
import { getColorForRate } from '../../utils/colorScale';
import type { RateEntry } from '../../types';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface WeekViewProps {
  rates: RateEntry[];
  date: Date; // Any date within the week
}

export default function WeekView({ rates, date }: WeekViewProps) {
  const weekDays = getWeekDays(rates, date);
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 0 });

  if (weekDays.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No data available for this week.</p>
      </div>
    );
  }

  // Calculate global min/max for consistent coloring
  const allRates = weekDays.flatMap(d => d.hourlyRates.map(h => h.totalRate));
  const minRate = Math.min(...allRates);
  const maxRate = Math.max(...allRates);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900">
          Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </h2>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Day headers */}
          <div className="flex border-b border-gray-200">
            <div className="w-16 flex-shrink-0 bg-gray-50"></div>
            {weekDays.map(day => (
              <div
                key={day.date}
                className={`flex-1 text-center py-3 text-sm font-semibold border-l border-gray-200 min-w-[100px] ${
                  day.isWeekend ? 'bg-blue-50 text-blue-900' : 'bg-gray-50 text-gray-900'
                }`}
              >
                <div>{format(day.dateObj, 'EEE')}</div>
                <div className="text-xs font-normal text-gray-600">{format(day.dateObj, 'MMM d')}</div>
              </div>
            ))}
          </div>

          {/* Hour rows */}
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="flex border-b border-gray-200">
              {/* Hour label */}
              <div className="w-16 flex-shrink-0 flex items-center justify-center text-xs text-gray-600 font-medium bg-gray-50 border-r border-gray-200">
                {formatHour(hour)}
              </div>

              {/* Day cells */}
              {weekDays.map(day => {
                const hourRate = day.hourlyRates.find(h => h.hour === hour);

                if (!hourRate) {
                  return (
                    <div
                      key={day.date}
                      className="flex-1 h-12 bg-gray-100 border-l border-gray-200 min-w-[100px]"
                    />
                  );
                }

                const normalized = (hourRate.totalRate - minRate) / (maxRate - minRate || 1);
                const bgColor = getColorForRate(normalized, 'viridis');

                return (
                  <div
                    key={day.date}
                    className="flex-1 h-12 border-l border-gray-200 flex items-center justify-center text-xs font-semibold text-white cursor-pointer hover:ring-2 hover:ring-inset hover:ring-blue-500 transition-all min-w-[100px]"
                    style={{ backgroundColor: bgColor }}
                    title={`${format(day.dateObj, 'MMM d')}, ${formatHour(hour)}: ${toCents(hourRate.totalRate).toFixed(1)}¢/kWh`}
                  >
                    {toCents(hourRate.totalRate).toFixed(1)}¢
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
        <div>
          Low: {toCents(minRate).toFixed(2)}¢/kWh
        </div>
        <div className="flex-1 mx-4 h-4 rounded" style={{
          background: `linear-gradient(to right, ${getColorForRate(0, 'viridis')}, ${getColorForRate(1, 'viridis')})`
        }}></div>
        <div>
          High: {toCents(maxRate).toFixed(2)}¢/kWh
        </div>
      </div>
    </div>
  );
}

function formatHour(hour: number): string {
  if (hour === 0) return '12a';
  if (hour === 12) return '12p';
  if (hour < 12) return `${hour}a`;
  return `${hour - 12}p`;
}
