/**
 * Day Card - Displays rates for a single day
 */

import { useMemo } from 'react';
import type { RateEntry } from '../../types';
import { formatDateHuman } from '../../utils/dateUtils';
import { generateDailyInsights, processHourlyRates } from '../../utils/rateUtils';
import HourlyRateBar from './HourlyRateBar';
import BatteryRecommendations from './BatteryRecommendations';

interface DayCardProps {
  date: string;
  rates: RateEntry[];
  isToday: boolean;
}

export default function DayCard({ date, rates, isToday }: DayCardProps) {
  // Generate insights and process hourly rates
  const insights = useMemo(() => {
    if (rates.length === 0) return null;
    return generateDailyInsights(rates);
  }, [rates]);

  const hourlyRates = useMemo(() => {
    if (rates.length === 0) return [];
    return processHourlyRates(rates);
  }, [rates]);

  if (!insights) {
    return null;
  }

  const cardClass = isToday
    ? 'bg-white border-4 border-blue-500 rounded-lg shadow-lg p-6'
    : 'bg-white border border-gray-200 rounded-lg shadow-sm p-6';

  return (
    <div className={cardClass}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatDateHuman(date)}
            {isToday && (
              <span className="ml-3 inline-block px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                TODAY
              </span>
            )}
          </h3>
          <p className="text-gray-600 mt-1">
            Average: {insights.averageRateCents.toFixed(1)}¢/kWh
            <span className="mx-2">•</span>
            Range: {(insights.minRate * 100).toFixed(1)}¢ - {(insights.maxRate * 100).toFixed(1)}¢
          </p>
        </div>
      </div>

      {/* Hourly Rate Bars */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Hourly Rates</h4>
        <div className="grid grid-cols-12 gap-1 sm:gap-2">
          {hourlyRates.map((hourRate) => (
            <HourlyRateBar key={hourRate.hour} hourRate={hourRate} />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
          <span>12 AM</span>
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>11 PM</span>
        </div>
      </div>

      {/* Battery Recommendations */}
      {insights.recommendations.length > 0 && (
        <BatteryRecommendations recommendations={insights.recommendations} />
      )}

      {/* Peak Hours Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
        <div>
          <h4 className="text-sm font-semibold text-emerald-700 mb-2">
            📈 Best Export Times
          </h4>
          <ul className="space-y-1">
            {insights.peakRateHours.map((peak) => (
              <li key={peak.hour} className="text-sm text-gray-700">
                <span className="font-medium">{peak.hour % 12 || 12}{peak.hour >= 12 ? 'PM' : 'AM'}:</span>{' '}
                {peak.rateCents.toFixed(1)}¢/kWh
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-red-700 mb-2">
            📉 Lowest Export Times
          </h4>
          <ul className="space-y-1">
            {insights.lowestRateHours.map((low) => (
              <li key={low.hour} className="text-sm text-gray-700">
                <span className="font-medium">{low.hour % 12 || 12}{low.hour >= 12 ? 'PM' : 'AM'}:</span>{' '}
                {low.rateCents.toFixed(1)}¢/kWh
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
