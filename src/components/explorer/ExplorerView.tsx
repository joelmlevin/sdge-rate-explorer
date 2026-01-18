/**
 * Explorer View - Advanced data exploration with heatmap and filters
 */

import { useRateStore } from '../../store/useRateStore';
import { exportToCSV } from '../../utils/exportUtils';
import RateHeatmap from './RateHeatmap';
import FilterControls from './FilterControls';
import ActiveFilters from './ActiveFilters';
import StatisticsPanel from './StatisticsPanel';

export default function ExplorerView() {
  const { filteredRates, allRates } = useRateStore();

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(filteredRates, `sdge-rates-${timestamp}.csv`);
  };

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Rate Explorer
          </h2>
          <p className="text-gray-600">
            Interactive heatmap and filtering tools for SDGE export rates
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={filteredRates.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          Export CSV ({filteredRates.length})
        </button>
      </div>

      {/* Filters and Active Filters */}
      <div className="mb-6 space-y-4">
        <ActiveFilters />
        <FilterControls />
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Statistics Panel */}
        <StatisticsPanel rates={filteredRates} />

        {/* Heatmap */}
        <RateHeatmap rates={filteredRates} allRates={allRates} />
      </div>

      {/* Info Footer */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Understanding the Data
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
          <div>
            <strong>Generation rates:</strong> What you GET PAID for exporting solar power to the grid
          </div>
          <div>
            <strong>Delivery rates:</strong> What you PAY for electricity from the grid (always higher)
          </div>
          <div>• Colors use 5th-95th percentile for better contrast</div>
          <div>• Hover over cells for exact rate values</div>
          <div>• Weekend days highlighted in blue</div>
          <div>• Click active filter pills to remove them</div>
        </div>
      </div>
    </div>
  );
}
