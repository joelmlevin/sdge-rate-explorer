/**
 * Daily View - Shows today's rates and the next 6 days
 * Optimized for quick glance on mobile
 */

import { useMemo } from 'react';
import { useRateStore } from '../../store/useRateStore';
import { getNextNDays, getTodayString } from '../../utils/dateUtils';
import { getRatesForDates } from '../../services/dataService';
import DayCard from './DayCard';

export default function DailyView() {
  const { allRates } = useRateStore();

  // Get next 7 days (today + 6 days ahead)
  const dates = useMemo(() => getNextNDays(7), []);
  const todayString = useMemo(() => getTodayString(), []);

  // Get rates for all 7 days
  const ratesForDays = useMemo(() => {
    if (allRates.length === 0) return [];

    return dates.map((date) => {
      const rates = getRatesForDates(allRates, [date]);
      return {
        date,
        rates,
        isToday: date === todayString,
      };
    });
  }, [allRates, dates, todayString]);

  // Filter out days with no data
  const daysWithData = ratesForDays.filter((day) => day.rates.length > 0);

  if (daysWithData.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            No rate data available for the next 7 days. The dataset may not include current dates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Daily Rate Forecast
        </h2>
        <p className="text-gray-600">
          Showing export rates for the next 7 days. Today is highlighted.
        </p>
      </div>

      {/* Days Grid */}
      <div className="space-y-6">
        {daysWithData.map((day) => (
          <DayCard
            key={day.date}
            date={day.date}
            rates={day.rates}
            isToday={day.isToday}
          />
        ))}
      </div>

      {/* Info Footer */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          For Solar + Battery Users
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">●</span>
            <span><strong>Green hours:</strong> Best times to discharge battery and export to grid</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 font-bold">●</span>
            <span><strong>Red hours:</strong> Low rates - consider charging battery from solar instead of exporting</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 font-bold">●</span>
            <span>Rates shown are for <strong>Generation</strong> export pricing (non-CCA customers)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
