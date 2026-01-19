/**
 * Day View - Detailed 24-hour breakdown for a single day
 */

import { processDayRates } from '../../utils/calendarUtils';
import { toCents } from '../../utils/rateUtils';
import { getColorForRate } from '../../utils/colorScale';
import type { RateEntry } from '../../types';
import { format } from 'date-fns';

interface DayViewProps {
  rates: RateEntry[];
  date: Date;
}

export default function DayView({ rates, date }: DayViewProps) {
  const daySummary = processDayRates(rates, date);

  if (!daySummary) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No data available for this date.</p>
      </div>
    );
  }

  const { hourlyRates, minRate, maxRate, avgRate, bestExportHour, worstExportHour } = daySummary;

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </h2>
        <div className="mt-2 flex gap-6 text-sm text-gray-600">
          <div>
            <span className="font-medium">Avg:</span> {toCents(avgRate).toFixed(2)}¢/kWh
          </div>
          <div>
            <span className="font-medium">Range:</span> {toCents(minRate).toFixed(2)}-
            {toCents(maxRate).toFixed(2)}¢/kWh
          </div>
          <div>
            <span className="font-medium text-green-700">Best export:</span> {formatHour(bestExportHour)}
          </div>
        </div>
      </div>

      {/* Hourly breakdown */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {hourlyRates.map(({ hour, totalRate, generationRate, deliveryRate }) => {
            const normalized = (totalRate - minRate) / (maxRate - minRate || 1);
            const bgColor = getColorForRate(normalized, 'viridis');
            const isBestHour = hour === bestExportHour;
            const isWorstHour = hour === worstExportHour;

            return (
              <div
                key={hour}
                className={`rounded-lg p-3 border-2 ${
                  isBestHour
                    ? 'border-green-500 ring-2 ring-green-200'
                    : isWorstHour
                    ? 'border-red-400'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: bgColor }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white drop-shadow">
                    {formatHour(hour)}
                  </span>
                  {isBestHour && (
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
                      Best
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-white drop-shadow">
                  <div className="font-bold text-base">
                    {toCents(totalRate).toFixed(1)}¢/kWh
                  </div>
                  <div className="opacity-90">
                    Gen: {toCents(generationRate).toFixed(2)}¢
                  </div>
                  <div className="opacity-90">
                    Del: {toCents(deliveryRate).toFixed(2)}¢
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatHour(hour: number): string {
  if (hour === 0) return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
}
