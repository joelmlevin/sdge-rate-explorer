/**
 * Week View V3 - Fixed alignment using CSS Grid
 * Ensures perfect column alignment between headers and data rows
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
  onDayClick?: (date: Date) => void;
  datePickerComponent?: React.ReactNode;
}

export default function WeekViewV3({ rates, date, design = 'minimal', onDayClick, datePickerComponent }: WeekViewProps) {
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
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold" style={{ color: designSystem.colors.text.primary }}>
            Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h2>
          {datePickerComponent}
        </div>
      </div>

      {/* Grid container - 8 columns (1 for time + 7 for days) */}
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, minmax(70px, 1fr))' }}>

          {/* Day headers row */}
          <div style={{
            backgroundColor: designSystem.colors.background,
            borderBottom: `1px solid ${designSystem.colors.border}`,
          }}></div>

          {weekDays.map(day => (
            <div
              key={`header-${day.date}`}
              className="text-center py-4 cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: day.isWeekend ? designSystem.colors.weekend.bg : designSystem.colors.background,
                borderLeft: `1px solid ${designSystem.colors.borderLight}`,
                borderBottom: `1px solid ${designSystem.colors.border}`,
                color: day.isWeekend ? designSystem.colors.weekend.text : designSystem.colors.text.primary,
              }}
              onClick={() => onDayClick?.(day.dateObj)}
            >
              <div className="font-bold text-base">{format(day.dateObj, 'EEE')}</div>
              <div className="text-xs mt-1" style={{ color: designSystem.colors.text.secondary }}>
                {format(day.dateObj, 'MMM d')}
              </div>
            </div>
          ))}

          {/* Hour rows */}
          {Array.from({ length: 24 }, (_, hour) => (
            <>
              {/* Hour label */}
              <div
                key={`hour-${hour}`}
                className="flex items-center justify-center text-xs font-medium"
                style={{
                  backgroundColor: designSystem.colors.background,
                  borderRight: `1px solid ${designSystem.colors.borderLight}`,
                  borderBottom: hour === 23 ? 'none' : `1px solid ${designSystem.colors.borderLight}`,
                  color: designSystem.colors.text.secondary,
                  height: '36px',
                }}
              >
                {formatHour(hour)}
              </div>

              {/* Day cells for this hour */}
              {weekDays.map(day => {
                const hourRate = day.hourlyRates.find(h => h.hour === hour);

                if (!hourRate) {
                  return (
                    <div
                      key={`${day.date}-${hour}`}
                      style={{
                        backgroundColor: designSystem.colors.background,
                        borderLeft: `1px solid ${designSystem.colors.borderLight}`,
                        borderBottom: hour === 23 ? 'none' : `1px solid ${designSystem.colors.borderLight}`,
                        height: '36px',
                      }}
                    />
                  );
                }

                const normalized = (hourRate.totalRate - minRate) / (maxRate - minRate || 1);
                const bgColor = getColorForRate(normalized, 'viridis');

                // Calculate luminance to determine text color for readability
                const getLuminance = (hex: string) => {
                  const rgb = parseInt(hex.slice(1), 16);
                  const r = (rgb >> 16) & 0xff;
                  const g = (rgb >> 8) & 0xff;
                  const b = (rgb >> 0) & 0xff;
                  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                };
                const textColor = getLuminance(bgColor) > 0.5 ? '#000000' : '#FFFFFF';

                return (
                  <div
                    key={`${day.date}-${hour}`}
                    className="flex items-center justify-center text-sm font-bold cursor-pointer hover:ring-2 hover:ring-inset hover:ring-blue-500 transition-all group relative"
                    style={{
                      backgroundColor: bgColor,
                      borderLeft: `1px solid ${designSystem.colors.borderLight}`,
                      borderBottom: hour === 23 ? 'none' : `1px solid ${designSystem.colors.borderLight}`,
                      height: '36px',
                      color: textColor,
                    }}
                  >
                    <span>{toCents(hourRate.totalRate).toFixed(1)}¢</span>

                    {/* Hover tooltip - with opaque white background for readability */}
                    <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="text-xs whitespace-nowrap shadow-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: '12px', padding: '8px 11px', border: '1px solid rgba(0, 0, 0, 0.1)' }}>
                        <div className="font-bold mb-1" style={{ color: '#000000' }}>
                          {format(day.dateObj, 'EEE, MMM d')} at {formatHour(hour)}
                        </div>
                        <div className="font-bold text-base" style={{ color: '#000000' }}>{toCents(hourRate.totalRate).toFixed(2)}¢/kWh</div>
                        <div className="text-[10px] mt-1.5 pt-1.5 border-t space-y-0.5" style={{ color: '#333333', borderColor: 'rgba(0, 0, 0, 0.2)' }}>
                          <div>Gen: {toCents(hourRate.generationRate).toFixed(2)}¢</div>
                          <div>Del: {toCents(hourRate.deliveryRate).toFixed(2)}¢</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
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
