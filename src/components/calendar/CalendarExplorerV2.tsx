/**
 * Calendar Explorer V2 - Redesigned with three aesthetic options
 * Production-ready with polished UI and UX
 */

import { useState } from 'react';
import { useRateStore } from '../../store/useRateStore';
import MonthViewV2 from './MonthViewV2';
import WeekViewV3 from './WeekViewV3';
import DayViewV2 from './DayViewV2';
import YearViewV2 from './YearViewV2';
import { addMonths, subMonths, parse } from 'date-fns';
import { designs, type DesignVariant } from '../../styles/designs';

type ViewMode = 'day' | 'week' | 'month' | 'year';

export default function CalendarExplorerV2() {
  const { allRates } = useRateStore();

  // Get current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDate, setSelectedDate] = useState(now);
  const design: DesignVariant = 'minimal';

  const designSystem = designs[design];

  // Navigation handlers
  const goToToday = () => {
    const today = new Date();
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth() + 1);
    setSelectedDate(today);
  };

  const goToPrevious = () => {
    if (viewMode === 'month') {
      const prevMonth = subMonths(new Date(selectedYear, selectedMonth - 1), 1);
      setSelectedYear(prevMonth.getFullYear());
      setSelectedMonth(prevMonth.getMonth() + 1);
    } else if (viewMode === 'year') {
      setSelectedYear(selectedYear - 1);
    } else if (viewMode === 'week') {
      const prevWeek = new Date(selectedDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setSelectedDate(prevWeek);
      setSelectedMonth(prevWeek.getMonth() + 1);
      setSelectedYear(prevWeek.getFullYear());
    } else if (viewMode === 'day') {
      const prevDay = new Date(selectedDate);
      prevDay.setDate(prevDay.getDate() - 1);
      setSelectedDate(prevDay);
      setSelectedMonth(prevDay.getMonth() + 1);
      setSelectedYear(prevDay.getFullYear());
    }
  };

  const goToNext = () => {
    if (viewMode === 'month') {
      const nextMonth = addMonths(new Date(selectedYear, selectedMonth - 1), 1);
      setSelectedYear(nextMonth.getFullYear());
      setSelectedMonth(nextMonth.getMonth() + 1);
    } else if (viewMode === 'year') {
      setSelectedYear(selectedYear + 1);
    } else if (viewMode === 'week') {
      const nextWeek = new Date(selectedDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setSelectedDate(nextWeek);
      setSelectedMonth(nextWeek.getMonth() + 1);
      setSelectedYear(nextWeek.getFullYear());
    } else if (viewMode === 'day') {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setSelectedDate(nextDay);
      setSelectedMonth(nextDay.getMonth() + 1);
      setSelectedYear(nextDay.getFullYear());
    }
  };

  const handleDayClick = (dateStr: string) => {
    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    setSelectedDate(date);
    setViewMode('day');
  };

  const handleWeekDayClick = (date: Date) => {
    setSelectedDate(date);
    setViewMode('day');
  };

  const handleMonthClick = (month: number) => {
    setSelectedMonth(month);
    setViewMode('month');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: designSystem.colors.background }}>
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2" style={{ color: designSystem.colors.text.primary }}>
              SDGE Rate Calendar
            </h1>
            <p className="text-sm" style={{ color: designSystem.colors.text.secondary }}>
              Total rates (generation + delivery combined)
            </p>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between gap-4">
            {/* View mode selector */}
            <div className="flex gap-2">
              {(['day', 'week', 'month', 'year'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 ${designSystem.borders.radius} text-sm font-medium transition-all`}
                  style={{
                    backgroundColor: viewMode === mode ? designSystem.colors.accent : designSystem.colors.surface,
                    color: viewMode === mode ? '#FFFFFF' : designSystem.colors.text.primary,
                    border: `${designSystem.borders.width} solid ${viewMode === mode ? designSystem.colors.accent : designSystem.colors.border}`,
                  }}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={goToPrevious}
                className={`px-4 py-2 ${designSystem.borders.radius} text-sm font-medium transition-all hover:opacity-80`}
                style={{
                  backgroundColor: designSystem.colors.surface,
                  color: designSystem.colors.text.primary,
                  border: `${designSystem.borders.width} solid ${designSystem.colors.border}`,
                }}
              >
                ← Previous
              </button>

              <button
                onClick={goToToday}
                className={`px-4 py-2 ${designSystem.borders.radius} text-sm font-semibold transition-all`}
                style={{
                  backgroundColor: designSystem.colors.accent,
                  color: '#FFFFFF',
                  border: `${designSystem.borders.width} solid ${designSystem.colors.accent}`,
                }}
              >
                Today
              </button>

              <button
                onClick={goToNext}
                className={`px-4 py-2 ${designSystem.borders.radius} text-sm font-medium transition-all hover:opacity-80`}
                style={{
                  backgroundColor: designSystem.colors.surface,
                  color: designSystem.colors.text.primary,
                  border: `${designSystem.borders.width} solid ${designSystem.colors.border}`,
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* View content */}
        <div>
          {viewMode === 'month' && (
            <MonthViewV2
              rates={allRates}
              year={selectedYear}
              month={selectedMonth}
              onDayClick={handleDayClick}
              design={design}
            />
          )}

          {viewMode === 'week' && <WeekViewV3 rates={allRates} date={selectedDate} design={design} onDayClick={handleWeekDayClick} />}

          {viewMode === 'day' && <DayViewV2 rates={allRates} date={selectedDate} design={design} />}

          {viewMode === 'year' && (
            <YearViewV2
              rates={allRates}
              year={selectedYear}
              onMonthClick={handleMonthClick}
              design={design}
            />
          )}
        </div>

        {/* Info footer */}
        <div className={`mt-8 ${designSystem.borders.radius} p-6`}
             style={{
               backgroundColor: designSystem.colors.surface,
               border: `${designSystem.borders.width} solid ${designSystem.colors.border}`,
             }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: designSystem.colors.text.primary }}>
            About the Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm"
               style={{ color: designSystem.colors.text.secondary }}>
            <div>
              • Rates = <strong>generation + delivery</strong> combined (total cost/credit)
            </div>
            <div>
              • <strong>Best export hour</strong> = highest rate for selling solar to grid
            </div>
            <div>
              • Hover over elements for detailed breakdowns
            </div>
            <div>
              • Click any day to see hour-by-hour analysis
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
