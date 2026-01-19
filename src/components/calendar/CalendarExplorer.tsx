/**
 * Calendar Explorer - Main component with view switching
 */

import { useState } from 'react';
import { useRateStore } from '../../store/useRateStore';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import YearView from './YearView';
import { addMonths, subMonths, parse } from 'date-fns';

type ViewMode = 'day' | 'week' | 'month' | 'year';

export default function CalendarExplorer() {
  const { allRates } = useRateStore();

  // Get current date or default to latest date in dataset
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDate, setSelectedDate] = useState(now);

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

  const handleMonthClick = (month: number) => {
    setSelectedMonth(month);
    setViewMode('month');
  };

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with controls */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SDGE Rate Calendar
          </h1>
          <p className="text-gray-600">
            Total rates (generation + delivery combined)
          </p>
        </div>

        {/* View mode selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('day')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === 'day'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('year')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === 'year'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={goToPrevious}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
        >
          ← Previous
        </button>

        <button
          onClick={goToToday}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
        >
          Today
        </button>

        <button
          onClick={goToNext}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
        >
          Next →
        </button>
      </div>

      {/* View content */}
      <div>
        {viewMode === 'month' && (
          <MonthView
            rates={allRates}
            year={selectedYear}
            month={selectedMonth}
            onDayClick={handleDayClick}
          />
        )}

        {viewMode === 'week' && <WeekView rates={allRates} date={selectedDate} />}

        {viewMode === 'day' && <DayView rates={allRates} date={selectedDate} />}

        {viewMode === 'year' && (
          <YearView
            rates={allRates}
            year={selectedYear}
            onMonthClick={handleMonthClick}
          />
        )}
      </div>
    </div>
  );
}
