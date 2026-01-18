/**
 * Hourly Rate Bar - Visual representation of a single hour's rate
 */

import type { HourlyRate } from '../../types';
import { formatHour } from '../../utils/dateUtils';

interface HourlyRateBarProps {
  hourRate: HourlyRate;
}

export default function HourlyRateBar({ hourRate }: HourlyRateBarProps) {
  // Determine bar color based on percentile
  const getBarColor = (percentile: number): string => {
    if (percentile >= 75) return 'bg-emerald-500';    // Top quartile - best rates
    if (percentile >= 50) return 'bg-amber-400';      // Above median
    if (percentile >= 25) return 'bg-orange-400';     // Below median
    return 'bg-red-500';                              // Bottom quartile - worst rates
  };

  // Calculate bar height based on percentile (20% to 100% of container)
  const heightPercent = 20 + (hourRate.percentile * 0.8);

  const barColor = getBarColor(hourRate.percentile);

  return (
    <div
      className="group relative cursor-pointer"
      title={`${formatHour(hourRate.hour)}: ${hourRate.rateCents.toFixed(1)}¢/kWh`}
    >
      {/* Bar */}
      <div className="h-24 sm:h-32 flex items-end justify-center">
        <div
          className={`w-full ${barColor} rounded-t transition-all duration-200 hover:opacity-80`}
          style={{ height: `${heightPercent}%` }}
        />
      </div>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
          <div className="font-semibold">{formatHour(hourRate.hour)}</div>
          <div>{hourRate.rateCents.toFixed(1)}¢/kWh</div>
          {hourRate.isTopQuartile && (
            <div className="text-emerald-300 text-xs mt-1">⭐ Top 25%</div>
          )}
          {hourRate.isBottomQuartile && (
            <div className="text-red-300 text-xs mt-1">⚠️ Bottom 25%</div>
          )}
        </div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>

      {/* Hour label (shows every 2 hours on mobile, every hour on larger screens) */}
      <div className="text-center mt-1">
        {hourRate.hour % 2 === 0 && (
          <span className="text-xs text-gray-500 block sm:hidden">
            {hourRate.hour}
          </span>
        )}
        <span className="text-xs text-gray-500 hidden sm:block">
          {hourRate.hour}
        </span>
      </div>
    </div>
  );
}
