/**
 * Simplified Explorer View for debugging
 */

import { useRateStore } from '../../store/useRateStore';
import RateHeatmapSimple from './RateHeatmapSimple';

export default function ExplorerViewSimple() {
  const { filteredRates, isLoading, error } = useRateStore();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Explorer View - Testing Heatmap</h1>
      <p className="mb-4">Filtered rates count: {filteredRates.length}</p>

      <div className="bg-white p-4 border rounded">
        <p>This is a test div before heatmap</p>
      </div>

      <RateHeatmapSimple rates={filteredRates} />

      <div className="bg-white p-4 border rounded mt-4">
        <p>This is a test div after heatmap</p>
      </div>
    </div>
  );
}
