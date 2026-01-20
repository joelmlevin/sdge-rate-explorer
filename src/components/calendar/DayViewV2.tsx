/**
 * Day View V2 - Bar chart visualization (hour vs rate)
 * Clean, data-focused design with generation/delivery details on hover only
 */

import { processDayRates } from '../../utils/calendarUtils';
import { toCents } from '../../utils/rateUtils';
import type { RateEntry } from '../../types';
import { format } from 'date-fns';
import { designs, type DesignVariant } from '../../styles/designs';

interface DayViewProps {
  rates: RateEntry[];
  date: Date;
  design?: DesignVariant;
  datePickerComponent?: React.ReactNode;
}

export default function DayViewV2({ rates, date, design = 'minimal', datePickerComponent }: DayViewProps) {
  const daySummary = processDayRates(rates, date);
  const designSystem = designs[design];

  if (!daySummary) {
    return (
      <div className={`${designSystem.borders.radius} p-12 text-center`}
           style={{ backgroundColor: designSystem.colors.surface, borderColor: designSystem.colors.border }}>
        <p style={{ color: designSystem.colors.text.tertiary }}>No data available for this date.</p>
      </div>
    );
  }

  const { hourlyRates, minRate, maxRate, avgRate, bestExportHour } = daySummary;

  // Calculate scale for bar chart
  const yMax = Math.ceil(maxRate * 100) / 100; // Round up to nearest 0.01
  const yMin = Math.floor(minRate * 100) / 100; // Round down to nearest 0.01
  const range = yMax - yMin;

  return (
    <div className={`${designSystem.borders.radius} overflow-hidden shadow-sm`}
         style={{ backgroundColor: designSystem.colors.surface }}>
      {/* Header */}
      <div className="px-4 sm:px-8 py-4 sm:py-6 border-b" style={{ borderColor: designSystem.colors.border }}>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: designSystem.colors.text.primary }}>
            {format(date, 'EEEE, MMMM d, yyyy')}
          </h2>
          {datePickerComponent}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm">
          <div>
            <span style={{ color: designSystem.colors.text.secondary }}>Average: </span>
            <span className="font-bold tabular-nums" style={{ color: designSystem.colors.text.primary }}>
              {toCents(avgRate).toFixed(2)}¢/kWh
            </span>
          </div>
          <div>
            <span style={{ color: designSystem.colors.text.secondary }}>Range: </span>
            <span className="font-bold tabular-nums" style={{ color: designSystem.colors.text.primary }}>
              {toCents(minRate).toFixed(2)} - {toCents(maxRate).toFixed(2)}¢/kWh
            </span>
          </div>
          <div>
            <span style={{ color: designSystem.colors.text.secondary }}>Best export: </span>
            <span className="font-bold" style={{ color: '#10B981' }}>
              {formatHour(bestExportHour)}
            </span>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="p-4 sm:p-8">
        <div className="flex gap-4">
          {/* Y-axis labels and ticks */}
          <div className="flex flex-col justify-between" style={{ height: '320px', paddingBottom: '24px' }}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium tabular-nums" style={{ color: designSystem.colors.text.secondary }}>
                {toCents(yMax).toFixed(2)}¢
              </span>
              <div style={{ width: '8px', height: '1px', backgroundColor: designSystem.colors.border }}></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium tabular-nums" style={{ color: designSystem.colors.text.secondary }}>
                {toCents(yMin).toFixed(2)}¢
              </span>
              <div style={{ width: '8px', height: '1px', backgroundColor: designSystem.colors.border }}></div>
            </div>
          </div>

          {/* Chart area */}
          <div className="flex-1">
            <div className="flex gap-2 items-end h-80">
              {hourlyRates.map(({ hour, totalRate, generationRate, deliveryRate }) => {
                const isBest = hour === bestExportHour;
                const barHeight = ((totalRate - yMin) / range) * 100;

                return (
                  <div key={hour} className="flex-1 flex flex-col items-center group">
                    {/* Bar */}
                    <div className="w-full flex items-end" style={{ height: '300px' }}>
                      <div
                        className={`w-full transition-all ${designSystem.borders.radius} relative`}
                        style={{
                          height: `${barHeight}%`,
                          backgroundColor: isBest ? '#10B981' : designSystem.colors.accent,
                          opacity: isBest ? 1 : 0.7,
                        }}
                      >
                        {/* Hover tooltip - with white background for readability */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                          <div className="text-xs whitespace-nowrap shadow-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)', borderRadius: '12px', padding: '9px 13px' }}>
                            <div className="font-bold mb-1.5 text-gray-900">{formatHour(hour)}</div>
                            <div className="font-bold text-base text-gray-900">{toCents(totalRate).toFixed(2)}¢/kWh</div>
                            <div className="text-[10px] text-gray-600 mt-2 pt-2 border-t border-gray-300 space-y-0.5">
                              <div>Gen: {toCents(generationRate).toFixed(2)}¢</div>
                              <div>Del: {toCents(deliveryRate).toFixed(2)}¢</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hour label - increased from text-[10px] to text-sm */}
                    <div className="mt-2 text-sm font-medium tabular-nums"
                         style={{ color: isBest ? '#10B981' : designSystem.colors.text.tertiary }}>
                      {formatHourCompact(hour)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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

function formatHourCompact(hour: number): string {
  if (hour === 0) return '12a';
  if (hour === 12) return '12p';
  if (hour < 12) return `${hour}a`;
  return `${hour - 12}p`;
}
