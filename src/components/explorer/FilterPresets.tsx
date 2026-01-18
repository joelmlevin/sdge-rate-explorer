/**
 * Filter Presets - Quick shortcuts for common filter combinations
 */

import { useRateStore } from '../../store/useRateStore';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export default function FilterPresets() {
  const { setFilters } = useRateStore();

  const presets = [
    {
      name: 'Last 30 Days',
      action: () => {
        const endDate = format(new Date(), 'yyyy-MM-dd');
        const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
        setFilters({
          dateRange: { startDate, endDate },
          timeRange: undefined,
          months: undefined,
          dayTypes: undefined,
        });
      },
    },
    {
      name: 'Weekdays Only',
      action: () => {
        setFilters({
          dayTypes: ['weekday'],
        });
      },
    },
    {
      name: 'Weekdays 9-5',
      action: () => {
        setFilters({
          dayTypes: ['weekday'],
          timeRange: { startHour: 9, endHour: 17 },
        });
      },
    },
    {
      name: 'This Month',
      action: () => {
        const now = new Date();
        const startDate = format(startOfMonth(now), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(now), 'yyyy-MM-dd');
        setFilters({
          dateRange: { startDate, endDate },
          months: undefined,
          years: undefined,
        });
      },
    },
    {
      name: 'Summer (Jun-Aug)',
      action: () => {
        setFilters({
          months: [6, 7, 8],
          dateRange: undefined,
        });
      },
    },
    {
      name: 'Winter (Dec-Feb)',
      action: () => {
        setFilters({
          months: [12, 1, 2],
          dateRange: undefined,
        });
      },
    },
    {
      name: 'Peak Hours (4-9 PM)',
      action: () => {
        setFilters({
          timeRange: { startHour: 16, endHour: 21 },
        });
      },
    },
  ];

  return (
    <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Filters</h4>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={preset.action}
            className="px-3 py-1.5 bg-white text-gray-700 rounded-md text-xs font-medium hover:bg-blue-100 hover:text-blue-800 transition-colors border border-gray-200"
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
}
