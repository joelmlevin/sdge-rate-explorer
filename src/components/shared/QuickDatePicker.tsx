/**
 * Quick Date Picker Component
 * Allows users to quickly navigate to any date within the available data range
 */

import { useState } from 'react';
import { format, isValid } from 'date-fns';

interface QuickDatePickerProps {
  currentDate: Date;
  availableRange: { min: Date; max: Date } | null;
  onDateChange: (date: Date) => void;
}

export default function QuickDatePicker({
  currentDate,
  availableRange,
  onDateChange,
}: QuickDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate());
  const [error, setError] = useState<string | null>(null);

  // Generate year options based on available range
  const yearOptions = availableRange
    ? Array.from(
        { length: availableRange.max.getFullYear() - availableRange.min.getFullYear() + 1 },
        (_, i) => availableRange.min.getFullYear() + i
      )
    : [];

  // Month options
  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Get days in selected month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleOpen = () => {
    // Reset to current date when opening
    setSelectedYear(currentDate.getFullYear());
    setSelectedMonth(currentDate.getMonth() + 1);
    setSelectedDay(currentDate.getDate());
    setError(null);
    setIsOpen(true);
  };

  const handleApply = () => {
    // Construct the selected date
    const newDate = new Date(selectedYear, selectedMonth - 1, selectedDay);

    // Validate date is in range
    if (availableRange) {
      if (newDate < availableRange.min || newDate > availableRange.max) {
        setError(
          `Date must be between ${format(availableRange.min, 'MMM d, yyyy')} and ${format(
            availableRange.max,
            'MMM d, yyyy'
          )}`
        );
        return;
      }
    }

    // Validate date is valid
    if (!isValid(newDate)) {
      setError('Invalid date');
      return;
    }

    onDateChange(newDate);
    setIsOpen(false);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setError(null);

    // Adjust day if it's invalid for the new month/year combo
    const daysInNewMonth = new Date(year, selectedMonth, 0).getDate();
    if (selectedDay > daysInNewMonth) {
      setSelectedDay(daysInNewMonth);
    }
  };

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    setError(null);

    // Adjust day if it's invalid for the new month/year combo
    const daysInNewMonth = new Date(selectedYear, month, 0).getDate();
    if (selectedDay > daysInNewMonth) {
      setSelectedDay(daysInNewMonth);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        title="Change date"
      >
        Change Date
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            style={{ zIndex: 999999 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Modal content */}
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl p-4"
            style={{ zIndex: 1000000 }}
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Select Date</h3>

              {/* Date selectors */}
              <div className="space-y-4 mb-6">
                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {monthOptions.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Day */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {dayOptions.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                  {error}
                </div>
              )}

              {/* Preview */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Selected date:</p>
                <p className="text-lg font-semibold text-gray-900">
                  {format(new Date(selectedYear, selectedMonth - 1, selectedDay), 'MMMM d, yyyy')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
