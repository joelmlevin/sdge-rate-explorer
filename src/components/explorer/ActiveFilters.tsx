/**
 * Active Filters - Shows which filters are currently active with ability to remove them
 */

import { useRateStore } from '../../store/useRateStore';

export default function ActiveFilters() {
  const { filters, setFilters } = useRateStore();

  // Build list of active filter descriptions
  const activeFilters: Array<{ key: string; label: string; onRemove: () => void }> = [];

  // Date range
  if (filters.dateRange) {
    activeFilters.push({
      key: 'dateRange',
      label: `${filters.dateRange.startDate} to ${filters.dateRange.endDate}`,
      onRemove: () => setFilters({ dateRange: undefined }),
    });
  }

  // Time range (only if not default 0-23)
  if (filters.timeRange && (filters.timeRange.startHour !== 0 || filters.timeRange.endHour !== 23)) {
    const formatHour = (h: number) => h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`;
    activeFilters.push({
      key: 'timeRange',
      label: `${formatHour(filters.timeRange.startHour)} - ${formatHour(filters.timeRange.endHour)}`,
      onRemove: () => setFilters({ timeRange: undefined }),
    });
  }

  // Months
  if (filters.months && filters.months.length > 0 && filters.months.length < 12) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsStr = filters.months.map(m => monthNames[m - 1]).join(', ');
    activeFilters.push({
      key: 'months',
      label: `Months: ${monthsStr}`,
      onRemove: () => setFilters({ months: undefined }),
    });
  }

  // Years
  if (filters.years && filters.years.length > 0) {
    const yearsStr = filters.years.join(', ');
    activeFilters.push({
      key: 'years',
      label: `Years: ${yearsStr}`,
      onRemove: () => setFilters({ years: undefined }),
    });
  }

  // Day types
  if (filters.dayTypes && filters.dayTypes.length > 0 && filters.dayTypes.length < 3) {
    const dayTypesStr = filters.dayTypes.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
    activeFilters.push({
      key: 'dayTypes',
      label: dayTypesStr,
      onRemove: () => setFilters({ dayTypes: undefined }),
    });
  }

  // Rate types
  if (filters.rateTypes && filters.rateTypes.length === 1) {
    activeFilters.push({
      key: 'rateTypes',
      label: filters.rateTypes[0] === 'generation' ? 'Generation Only' : 'Delivery Only',
      onRemove: () => setFilters({ rateTypes: undefined }),
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-900">
          Active Filters ({activeFilters.length})
        </h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter) => (
          <div
            key={filter.key}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
          >
            <span>{filter.label}</span>
            <button
              onClick={filter.onRemove}
              className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              title="Remove filter"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
