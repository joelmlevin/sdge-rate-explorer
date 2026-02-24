/**
 * Calendar Explorer V2 - Redesigned with three aesthetic options
 * Production-ready with polished UI and UX
 */

import { useMemo, useState, useEffect, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useRateStore } from '../../store/useRateStore';
import MonthViewV2 from './MonthViewV2';
import WeekViewV3 from './WeekViewV3';
import DayViewV2 from './DayViewV2';
import YearViewV2 from './YearViewV2';
import QuickDatePicker from '../shared/QuickDatePicker';
import Footer from '../shared/Footer';
import { addMonths, endOfMonth, endOfWeek, endOfYear, format, parse, startOfMonth, startOfWeek, startOfYear, subMonths } from 'date-fns';
import { designs, type DesignVariant } from '../../styles/designs';
import { getDateRange } from '../../services/dataService';
import type { RateComponent } from '../../types';

type ViewMode = 'day' | 'week' | 'month' | 'year';

export default function CalendarExplorerV2() {
  const { allRates, isLoading } = useRateStore();

  // Get current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDate, setSelectedDate] = useState(now);
  const [rateComponent, setRateComponent] = useState<RateComponent>('total');
  const design: DesignVariant = 'minimal';

  const designSystem = designs[design];
  const availableRange = useMemo(() => (
    allRates.length ? getDateRange(allRates) : null
  ), [allRates]);
  const parsedRange = useMemo(() => {
    if (!availableRange) return null;
    return {
      min: parse(availableRange.min, 'yyyy-MM-dd', new Date()),
      max: parse(availableRange.max, 'yyyy-MM-dd', new Date()),
    };
  }, [availableRange]);
  const activeRange = useMemo(() => {
    if (viewMode === 'day') {
      return { start: selectedDate, end: selectedDate };
    }
    if (viewMode === 'week') {
      return {
        start: startOfWeek(selectedDate, { weekStartsOn: 0 }),
        end: endOfWeek(selectedDate, { weekStartsOn: 0 }),
      };
    }
    if (viewMode === 'month') {
      const monthStart = startOfMonth(new Date(selectedYear, selectedMonth - 1));
      return { start: monthStart, end: endOfMonth(monthStart) };
    }
    const yearStart = startOfYear(new Date(selectedYear, 0));
    return { start: yearStart, end: endOfYear(yearStart) };
  }, [selectedDate, selectedMonth, selectedYear, viewMode]);
  const suggestedDate = useMemo(() => {
    if (!parsedRange || !activeRange) return null;
    if (activeRange.end < parsedRange.min) return parsedRange.min;
    if (activeRange.start > parsedRange.max) return parsedRange.max;
    return null;
  }, [activeRange, parsedRange]);

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

  const handleReturnToValidRange = () => {
    if (!suggestedDate) return;
    setSelectedDate(suggestedDate);
    setSelectedYear(suggestedDate.getFullYear());
    setSelectedMonth(suggestedDate.getMonth() + 1);
  };

  const handleQuickDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedYear(date.getFullYear());
    setSelectedMonth(date.getMonth() + 1);
    // Keep the same view mode - don't change it
  };

  const handleRateTypeKeyDown = (e: ReactKeyboardEvent<HTMLSelectElement>) => {
    const key = e.key.toLowerCase();
    if (key === 't' || key === 'g' || key === 'd') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();

      // Arrow keys for navigation
      if (key === 'arrowleft') {
        e.preventDefault();
        goToPrevious();
      } else if (key === 'arrowright') {
        e.preventDefault();
        goToNext();
      }
      // View mode shortcuts (only switch if not already on that view)
      else if (key === 'd' && viewMode !== 'day') {
        setViewMode('day');
      } else if (key === 'w' && viewMode !== 'week') {
        setViewMode('week');
      } else if (key === 'm' && viewMode !== 'month') {
        // When switching to month, ensure selectedDate is in the current month
        const currentMonthDate = new Date(selectedYear, selectedMonth - 1, 1);
        if (selectedDate.getMonth() !== selectedMonth - 1 ||
            selectedDate.getFullYear() !== selectedYear) {
          setSelectedDate(currentMonthDate);
        }
        setViewMode('month');
      } else if (key === 'y' && viewMode !== 'year') {
        setViewMode('year');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, selectedDate, selectedYear, selectedMonth]);

  return (
    <div className="flex-1" style={{ backgroundColor: designSystem.colors.background }}>
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3">
          {/* Row 1: view mode selector (left) + navigation (right) */}
          <div className="flex items-center justify-between gap-4">
            {/* View mode selector */}
            <div className="flex gap-2">
              {(['day', 'week', 'month', 'year'] as ViewMode[]).map((mode) => {
                const label = mode.charAt(0).toUpperCase() + mode.slice(1);
                const handleViewModeClick = () => {
                  // When switching from month to week/day, always ensure selectedDate matches the displayed month
                  if (viewMode === 'month' && (mode === 'week' || mode === 'day')) {
                    // Always set to first of current month to ensure consistency
                    const currentMonthDate = new Date(selectedYear, selectedMonth - 1, 1);
                    setSelectedDate(currentMonthDate);
                  }
                  setViewMode(mode);
                };
                return (
                  <button
                    key={mode}
                    onClick={handleViewModeClick}
                    className={`px-4 py-2 ${designSystem.borders.radius} text-sm font-medium transition-all`}
                    style={{
                      backgroundColor: viewMode === mode ? designSystem.colors.accent : designSystem.colors.surface,
                      color: viewMode === mode ? '#FFFFFF' : designSystem.colors.text.primary,
                      border: `${designSystem.borders.width} solid ${viewMode === mode ? designSystem.colors.accent : designSystem.colors.border}`,
                    }}
                  >
                    <span style={{ textDecoration: 'underline' }}>{label.charAt(0)}</span>{label.slice(1)}
                  </button>
                );
              })}
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

          {/* Row 2: rate component selector (right-aligned, below navigation) */}
          <div className="flex justify-end">
            <select
              value={rateComponent}
              onChange={(e) => setRateComponent(e.target.value as RateComponent)}
              onKeyDown={handleRateTypeKeyDown}
              className={`px-4 py-2 ${designSystem.borders.radius} text-sm font-medium transition-all cursor-pointer`}
              style={{
                backgroundColor: designSystem.colors.surface,
                color: designSystem.colors.text.primary,
                border: `${designSystem.borders.width} solid ${designSystem.colors.border}`,
                outline: 'none',
              }}
            >
              <option value="total">Total</option>
              <option value="generation">Generation</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
        </div>

        {suggestedDate && !isLoading && parsedRange && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">
                  No data available for this contract year in the selected {viewMode} view.
                </p>
                <p className="mt-1 text-xs text-amber-800">
                  Available dates: {format(parsedRange.min, 'MMM d, yyyy')} – {format(parsedRange.max, 'MMM d, yyyy')}.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReturnToValidRange}
                className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900 shadow-sm hover:bg-amber-100"
              >
                Go to {format(suggestedDate, 'MMM d, yyyy')}
              </button>
            </div>
          </div>
        )}

        {/* View content */}
        <div>
          {viewMode === 'month' && (
            <MonthViewV2
              rates={allRates}
              year={selectedYear}
              month={selectedMonth}
              onDayClick={handleDayClick}
              design={design}
              rateComponent={rateComponent}
              datePickerComponent={
                <QuickDatePicker
                  currentDate={selectedDate}
                  availableRange={parsedRange}
                  onDateChange={handleQuickDateChange}
                />
              }
            />
          )}

          {viewMode === 'week' && (
            <WeekViewV3
              rates={allRates}
              date={selectedDate}
              design={design}
              rateComponent={rateComponent}
              onDayClick={handleWeekDayClick}
              datePickerComponent={
                <QuickDatePicker
                  currentDate={selectedDate}
                  availableRange={parsedRange}
                  onDateChange={handleQuickDateChange}
                />
              }
            />
          )}

          {viewMode === 'day' && (
            <DayViewV2
              rates={allRates}
              date={selectedDate}
              design={design}
              rateComponent={rateComponent}
              datePickerComponent={
                <QuickDatePicker
                  currentDate={selectedDate}
                  availableRange={parsedRange}
                  onDateChange={handleQuickDateChange}
                />
              }
            />
          )}

          {viewMode === 'year' && (
            <YearViewV2
              rates={allRates}
              year={selectedYear}
              onMonthClick={handleMonthClick}
              rateComponent={rateComponent}
              onDateClick={(date) => {
                // Navigate to week view for this date
                const clickedDate = new Date(date + 'T00:00:00');
                setSelectedDate(clickedDate);
                setSelectedMonth(clickedDate.getMonth() + 1);
                setSelectedYear(clickedDate.getFullYear());
                setViewMode('week');
              }}
              design={design}
              datePickerComponent={
                <QuickDatePicker
                  currentDate={selectedDate}
                  availableRange={parsedRange}
                  onDateChange={handleQuickDateChange}
                />
              }
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
