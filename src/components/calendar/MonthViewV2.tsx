/**
 * Month View V2 - Clean calendar with bar chart tooltip on hover
 */

import { useState, useEffect, useRef } from 'react';
import { getMonthCalendarGrid, getComponentRate, type DaySummary } from '../../utils/calendarUtils';
import { toCents } from '../../utils/rateUtils';
import type { RateEntry, RateComponent } from '../../types';
import { format } from 'date-fns';
import { designs, type DesignVariant } from '../../styles/designs';

interface MonthViewProps {
  rates: RateEntry[];
  year: number;
  month: number;
  onDayClick?: (date: string) => void;
  design?: DesignVariant;
  rateComponent?: RateComponent;
  datePickerComponent?: React.ReactNode;
}

export default function MonthViewV2({ rates, year, month, onDayClick, design = 'minimal', rateComponent = 'total', datePickerComponent }: MonthViewProps) {
  const calendarGrid = getMonthCalendarGrid(rates, year, month);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const designSystem = designs[design];

  // Split into weeks (7 days each)
  const weeks: (DaySummary | null)[][] = [];
  for (let i = 0; i < calendarGrid.length; i += 7) {
    weeks.push(calendarGrid.slice(i, i + 7));
  }

  return (
    <div className={`${designSystem.borders.radius} overflow-hidden shadow-sm`}
         style={{ backgroundColor: designSystem.colors.surface }}>
      {/* Header */}
      <div className="px-8 py-6 border-b" style={{
        borderColor: designSystem.colors.border,
        backgroundColor: designSystem.colors.surface
      }}>
        <div className="flex items-center gap-3">
          <h2 className={`text-3xl font-bold`} style={{ color: designSystem.colors.text.primary }}>
            {format(new Date(year, month - 1), 'MMMM yyyy')}
          </h2>
          {datePickerComponent}
        </div>
      </div>

      {/* Calendar container */}
      <div className="w-full">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b" style={{ borderColor: designSystem.colors.border }}>
          {dayNames.map((day, i) => (
            <div
              key={day}
              className={`py-3 text-center border-r last:border-r-0 ${designSystem.typography.label}`}
              style={{
                borderColor: designSystem.colors.borderLight,
                color: i === 0 || i === 6 ? designSystem.colors.weekend.text : designSystem.colors.text.secondary
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0"
                 style={{ borderColor: designSystem.colors.border }}>
              {week.map((day, dayIndex) => (
                <DayCell
                  key={`${weekIndex}-${dayIndex}`}
                  daySummary={day}
                  onClick={day ? () => onDayClick?.(day.date) : undefined}
                  design={design}
                  rateComponent={rateComponent}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface DayCellProps {
  daySummary: DaySummary | null;
  onClick?: () => void;
  design: DesignVariant;
  rateComponent: RateComponent;
}

function DayCell({ daySummary, onClick, design, rateComponent }: DayCellProps) {
  const designSystem = designs[design];
  const [showBarChart, setShowBarChart] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (daySummary && daySummary.hourlyRates && daySummary.hourlyRates.length > 0) {
      hoverTimeoutRef.current = setTimeout(() => {
        setShowBarChart(true);
      }, 1000); // 1 second delay
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setShowBarChart(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  if (!daySummary) {
    return (
      <div
        className="border-r last:border-r-0"
        style={{
          backgroundColor: designSystem.colors.background,
          borderColor: designSystem.colors.borderLight,
          aspectRatio: '1 / 0.85'
        }}
      />
    );
  }

  const { dateObj, isWeekend, hourlyRates } = daySummary;
  const dayNumber = dateObj.getDate();

  // Format hour compact
  const formatHourCompact = (hour: number): string => {
    if (hour === 0) return '12a';
    if (hour === 12) return '12p';
    if (hour < 12) return `${hour}a`;
    return `${hour - 12}p`;
  };

  // Format hour for peak display
  const formatPeakHour = (hour: number): string => {
    if (hour === 0) return 'Peak: 12am';
    if (hour === 12) return 'Peak: 12pm';
    if (hour < 12) return `Peak: ${hour}am`;
    return `Peak: ${hour - 12}pm`;
  };

  // Compute stats based on the selected rate component
  const componentRates = hourlyRates.map(h => getComponentRate(h, rateComponent));
  const minRate = Math.min(...componentRates);
  const maxRate = Math.max(...componentRates);
  const bestExportHour = hourlyRates.reduce((best, curr) =>
    getComponentRate(curr, rateComponent) > getComponentRate(best, rateComponent) ? curr : best
  ).hour;

  // Calculate bar chart scale
  const yMax = maxRate;
  const yMin = minRate;
  const range = yMax - yMin;

  // Debug logging
  if (showBarChart && dayNumber === 1) {
    console.log('Day 1 bar chart:', {
      yMax,
      yMin,
      range,
      sampleRate: hourlyRates[0]?.totalRate,
      sampleBarHeight: range > 0 ? ((hourlyRates[0]?.totalRate - yMin) / range) * 100 : 50
    });
  }

  const cellStyle: React.CSSProperties = {
    backgroundColor: isWeekend ? designSystem.colors.weekend.bg : designSystem.colors.surface,
    borderColor: designSystem.colors.borderLight,
  };

  return (
    <div
      className={`border-r last:border-r-0 ${onClick ? 'cursor-pointer' : ''} relative overflow-hidden`}
      style={{...cellStyle, aspectRatio: '1 / 0.85'}}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!showBarChart ? (
        // Normal view
        <div className="h-full flex flex-col p-2">
          {/* Day number */}
          <div
            className="text-3xl font-extrabold"
            style={{ color: designSystem.colors.text.primary }}
          >
            {dayNumber}
          </div>

          {/* Rate range */}
          <div className="flex-1 flex flex-col justify-center items-start">
            <div className="text-xs leading-tight"
                 style={{ color: designSystem.colors.text.primary }}>
              {toCents(minRate).toFixed(1)}-{toCents(maxRate).toFixed(1)}¢
            </div>

            {/* Best export hour */}
            <div className="text-xs mt-0.5"
                 style={{ color: designSystem.colors.text.tertiary }}>
              {formatPeakHour(bestExportHour)}
            </div>
          </div>
        </div>
      ) : (
        // Bar chart view
        <div className="h-full w-full flex flex-col p-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.97)' }}>
          {/* Main content area with Y-axis and chart */}
          <div className="flex items-end" style={{ flex: 1, paddingBottom: '14px' }}>
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between pr-1" style={{ width: '28px', height: '100%' }}>
              <div className="text-[9px] font-semibold text-gray-800">
                {toCents(yMax).toFixed(1)}¢
              </div>
              <div className="text-[9px] font-semibold text-gray-800">
                {toCents(yMin).toFixed(1)}¢
              </div>
            </div>

            {/* Bar chart */}
            <div className="flex-1 flex gap-[1px] items-end" style={{ height: '100%' }}>
              {hourlyRates.map((hourlyRate) => {
                const { hour } = hourlyRate;
                const displayRate = getComponentRate(hourlyRate, rateComponent);
                // Calculate height as percentage of range
                const barHeight = range > 0 ? ((displayRate - yMin) / range) * 100 : 50;
                const isBest = hour === bestExportHour;

                return (
                  <div key={hour} className="flex-1 flex items-end" style={{ minWidth: '2px', height: '100%' }}>
                    {/* Bar - taller means higher rate */}
                    <div
                      className="w-full"
                      style={{
                        height: `${Math.max(barHeight, 8)}%`,
                        backgroundColor: isBest ? '#10B981' : designSystem.colors.accent,
                        opacity: isBest ? 1 : 0.7,
                        minHeight: '4px'
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex gap-[1px]" style={{ marginLeft: '28px' }}>
            {hourlyRates.map(({ hour }) => (
              <div key={hour} className="flex-1 text-center">
                {hour % 6 === 0 && (
                  <div className="text-[7px] text-gray-700 font-medium">
                    {formatHourCompact(hour)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
