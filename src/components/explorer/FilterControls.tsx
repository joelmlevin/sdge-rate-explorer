/**
 * Filter Controls - UI for filtering rate data
 */

import { useState } from 'react';
import { getAvailableYears } from '../../services/dataService';
import { useRateStore } from '../../store/useRateStore';

export default function FilterControls() {
  const { allRates, filters, setFilters, resetFilters } = useRateStore();

  // Get available options from data
  const availableYears = getAvailableYears(allRates);

  // Local state for date inputs
  const [startDate, setStartDate] = useState(filters.dateRange?.startDate || '');
  const [endDate, setEndDate] = useState(filters.dateRange?.endDate || '');

  // Local state for time range
  const [startHour, setStartHour] = useState(filters.timeRange?.startHour?.toString() || '0');
  const [endHour, setEndHour] = useState(filters.timeRange?.endHour?.toString() || '23');

  const handleDateRangeChange = () => {
    if (startDate && endDate) {
      setFilters({
        dateRange: { startDate, endDate }
      });
    } else {
      setFilters({
        dateRange: undefined
      });
    }
  };

  const handleTimeRangeChange = () => {
    setFilters({
      timeRange: {
        startHour: parseInt(startHour),
        endHour: parseInt(endHour)
      }
    });
  };

  const handleMonthToggle = (month: number) => {
    const currentMonths = filters.months || [];
    const newMonths = currentMonths.includes(month)
      ? currentMonths.filter(m => m !== month)
      : [...currentMonths, month];

    setFilters({
      months: newMonths.length > 0 ? newMonths : undefined
    });
  };

  const handleYearToggle = (year: number) => {
    const currentYears = filters.years || [];
    const newYears = currentYears.includes(year)
      ? currentYears.filter(y => y !== year)
      : [...currentYears, year];

    setFilters({
      years: newYears.length > 0 ? newYears : undefined
    });
  };

  const handleDayTypeToggle = (dayType: 'weekday' | 'weekend' | 'holiday') => {
    const currentTypes = filters.dayTypes || [];
    const newTypes = currentTypes.includes(dayType)
      ? currentTypes.filter(t => t !== dayType)
      : [...currentTypes, dayType];

    setFilters({
      dayTypes: newTypes.length > 0 ? newTypes : undefined
    });
  };

  const handleRateTypeToggle = (rateType: 'generation' | 'delivery') => {
    const currentTypes = filters.rateTypes || [];
    const newTypes = currentTypes.includes(rateType)
      ? currentTypes.filter(t => t !== rateType)
      : [...currentTypes, rateType];

    setFilters({
      rateTypes: newTypes.length > 0 ? newTypes : undefined
    });
  };

  const handleReset = () => {
    resetFilters();
    setStartDate('');
    setEndDate('');
    setStartHour('0');
    setEndHour('23');
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Reset All
        </button>
      </div>

      {/* Date Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={handleDateRangeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Start Date"
            />
          </div>
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={handleDateRangeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Time Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time of Day
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <select
              value={startHour}
              onChange={(e) => {
                setStartHour(e.target.value);
                handleTimeRangeChange();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={endHour}
              onChange={(e) => {
                setEndHour(e.target.value);
                handleTimeRangeChange();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Months */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Months
        </label>
        <div className="flex flex-wrap gap-2">
          {monthNames.map((month, index) => {
            const monthNum = index + 1;
            const isSelected = filters.months?.includes(monthNum) ?? false;
            return (
              <button
                key={monthNum}
                onClick={() => handleMonthToggle(monthNum)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {month}
              </button>
            );
          })}
        </div>
      </div>

      {/* Years */}
      {availableYears.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years
          </label>
          <div className="flex flex-wrap gap-2">
            {availableYears.map((year) => {
              const isSelected = filters.years?.includes(year) ?? false;
              return (
                <button
                  key={year}
                  onClick={() => handleYearToggle(year)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {year}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Day Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Day Type
        </label>
        <div className="flex gap-2">
          {(['weekday', 'weekend', 'holiday'] as const).map((dayType) => {
            const isSelected = filters.dayTypes?.includes(dayType) ?? false;
            return (
              <button
                key={dayType}
                onClick={() => handleDayTypeToggle(dayType)}
                className={`px-3 py-1 rounded-md text-sm font-medium capitalize transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {dayType}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rate Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rate Type
        </label>
        <div className="flex gap-2">
          {(['generation', 'delivery'] as const).map((rateType) => {
            const isSelected = filters.rateTypes?.includes(rateType) ?? false;
            return (
              <button
                key={rateType}
                onClick={() => handleRateTypeToggle(rateType)}
                className={`px-3 py-1 rounded-md text-sm font-medium capitalize transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {rateType}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
