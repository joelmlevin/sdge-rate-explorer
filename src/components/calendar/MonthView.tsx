/**
 * Month View - Calendar grid showing daily rate summaries
 * Inspired by Apple Calendar design
 */

import { getMonthCalendarGrid, type DaySummary } from '../../utils/calendarUtils';
import { toCents } from '../../utils/rateUtils';
import type { RateEntry } from '../../types';
import { format } from 'date-fns';

interface MonthViewProps {
  rates: RateEntry[];
  year: number;
  month: number;
  onDayClick?: (date: string) => void;
}

export default function MonthView({ rates, year, month, onDayClick }: MonthViewProps) {
  const calendarGrid = getMonthCalendarGrid(rates, year, month);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Split into weeks (7 days each)
  const weeks: (DaySummary | null)[][] = [];
  for (let i = 0; i < calendarGrid.length; i += 7) {
    weeks.push(calendarGrid.slice(i, i + 7));
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header with month/year */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900">
          {format(new Date(year, month - 1), 'MMMM yyyy')}
        </h2>
      </div>

      {/* Day name headers */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {dayNames.map(day => (
          <div
            key={day}
            className="py-2 text-center text-sm font-semibold text-gray-600 border-r border-gray-200 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="divide-y divide-gray-200">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 divide-x divide-gray-200">
            {week.map((day, dayIndex) => (
              <DayCell
                key={`${weekIndex}-${dayIndex}`}
                daySummary={day}
                onClick={day ? () => onDayClick?.(day.date) : undefined}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface DayCellProps {
  daySummary: DaySummary | null;
  onClick?: () => void;
}

function DayCell({ daySummary, onClick }: DayCellProps) {
  if (!daySummary) {
    // Empty cell for days outside the month
    return <div className="h-32 bg-gray-50"></div>;
  }

  const { dateObj, minRate, maxRate, bestExportHour, isWeekend } = daySummary;
  const dayNumber = dateObj.getDate();

  const cellClasses = `h-32 p-2 ${
    isWeekend ? 'bg-blue-50' : 'bg-white'
  } hover:bg-gray-50 cursor-pointer transition-colors relative group`;

  return (
    <div className={cellClasses} onClick={onClick}>
      {/* Day number */}
      <div className="text-sm font-semibold text-gray-900 mb-1">{dayNumber}</div>

      {/* Rate range */}
      <div className="text-xs text-gray-600 space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Range:</span>
          <span className="font-medium">
            {toCents(minRate).toFixed(1)}-{toCents(maxRate).toFixed(1)}¢
          </span>
        </div>

        {/* Best export hour */}
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Best:</span>
          <span className="font-medium text-green-700">
            {formatHour(bestExportHour)}
          </span>
        </div>
      </div>

      {/* Mini heatmap visualization */}
      <div className="mt-2 flex gap-px">
        {daySummary.hourlyRates.slice(0, 24).map((hourRate, i) => {
          const normalized = (hourRate.totalRate - minRate) / (maxRate - minRate || 1);
          const intensity = Math.floor(normalized * 4); // 0-4 intensity levels

          return (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-sm ${getIntensityColor(intensity)}`}
              title={`${i}:00 - ${toCents(hourRate.totalRate).toFixed(1)}¢/kWh`}
            />
          );
        })}
      </div>

      {/* Hover tooltip */}
      <div className="absolute inset-0 bg-gray-900 bg-opacity-90 text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-xs space-y-1">
        <div className="font-semibold">{format(dateObj, 'EEEE, MMMM d')}</div>
        <div>Min: {toCents(minRate).toFixed(2)}¢/kWh</div>
        <div>Max: {toCents(maxRate).toFixed(2)}¢/kWh</div>
        <div>Avg: {toCents(daySummary.avgRate).toFixed(2)}¢/kWh</div>
        <div className="text-green-300">Best export: {formatHour(bestExportHour)}</div>
        <div className="text-xs text-gray-400 mt-2">Click for details</div>
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

function getIntensityColor(intensity: number): string {
  const colors = [
    'bg-purple-200', // 0 - lowest
    'bg-teal-300',   // 1
    'bg-teal-400',   // 2
    'bg-yellow-400', // 3
    'bg-yellow-500', // 4 - highest
  ];
  return colors[intensity] || colors[0];
}
