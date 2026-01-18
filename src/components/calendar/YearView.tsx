/**
 * Year View - Grid of 12 months showing summary statistics
 */

import { getMonthSummary, type MonthSummary } from '../../utils/calendarUtils';
import { toCents } from '../../utils/rateUtils';
import type { RateEntry } from '../../types';

interface YearViewProps {
  rates: RateEntry[];
  year: number;
  onMonthClick?: (month: number) => void;
}

export default function YearView({ rates, year, onMonthClick }: YearViewProps) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const monthSummaries = months
    .map(month => getMonthSummary(rates, year, month))
    .filter((summary): summary is MonthSummary => summary !== null);

  if (monthSummaries.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No data available for {year}.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900">{year}</h2>
      </div>

      {/* Month grid */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {monthSummaries.map(month => (
          <MonthCard
            key={month.month}
            summary={month}
            onClick={() => onMonthClick?.(month.month)}
          />
        ))}
      </div>
    </div>
  );
}

interface MonthCardProps {
  summary: MonthSummary;
  onClick?: () => void;
}

function MonthCard({ summary, onClick }: MonthCardProps) {
  const { monthName, dayCount, avgDailyMin, avgDailyMax, overallAvg } = summary;

  return (
    <div
      className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{monthName}</h3>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Days:</span>
          <span className="font-medium text-gray-900">{dayCount}</span>
        </div>

        <div className="flex justify-between">
          <span>Avg Low:</span>
          <span className="font-medium text-purple-700">{toCents(avgDailyMin).toFixed(1)}¢</span>
        </div>

        <div className="flex justify-between">
          <span>Avg High:</span>
          <span className="font-medium text-yellow-700">{toCents(avgDailyMax).toFixed(1)}¢</span>
        </div>

        <div className="flex justify-between pt-2 border-t border-gray-200">
          <span className="font-medium">Overall Avg:</span>
          <span className="font-semibold text-gray-900">{toCents(overallAvg).toFixed(1)}¢</span>
        </div>
      </div>

      {/* Visual indicator bar */}
      <div className="mt-3 h-2 rounded-full bg-gradient-to-r from-purple-300 via-teal-400 to-yellow-400"></div>
    </div>
  );
}
