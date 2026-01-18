/**
 * Statistics Panel - Shows statistics for filtered rate data
 */

import { useMemo } from 'react';
import type { RateEntry } from '../../types';
import { calculateRateStatistics, toCents } from '../../utils/rateUtils';

interface StatisticsPanelProps {
  rates: RateEntry[];
}

export default function StatisticsPanel({ rates }: StatisticsPanelProps) {
  const stats = useMemo(() => {
    if (rates.length === 0) return null;
    return calculateRateStatistics(rates.map(r => r.rate));
  }, [rates]);

  if (!stats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
        <p className="text-gray-500">No data to analyze</p>
      </div>
    );
  }

  const statItems = [
    { label: 'Count', value: stats.count.toLocaleString(), unit: 'entries' },
    { label: 'Mean', value: toCents(stats.mean).toFixed(2), unit: '¢/kWh' },
    { label: 'Median', value: toCents(stats.median).toFixed(2), unit: '¢/kWh' },
    { label: 'Minimum', value: toCents(stats.min).toFixed(2), unit: '¢/kWh' },
    { label: 'Maximum', value: toCents(stats.max).toFixed(2), unit: '¢/kWh' },
    { label: 'Std Dev', value: toCents(stats.stdDev).toFixed(2), unit: '¢/kWh' },
  ];

  const percentileItems = [
    { label: '25th', value: toCents(stats.percentile25).toFixed(2) },
    { label: '50th', value: toCents(stats.percentile50).toFixed(2) },
    { label: '75th', value: toCents(stats.percentile75).toFixed(2) },
    { label: '90th', value: toCents(stats.percentile90).toFixed(2) },
    { label: '95th', value: toCents(stats.percentile95).toFixed(2) },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {statItems.map((item) => (
          <div key={item.label} className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">{item.label}</div>
            <div className="text-lg font-semibold text-gray-900">
              {item.value}
              <span className="text-sm text-gray-600 ml-1">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Percentiles */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Percentiles (¢/kWh)</h4>
        <div className="flex justify-between items-center">
          {percentileItems.map((item, index) => (
            <div key={item.label} className="text-center">
              <div className="text-xs text-gray-600 mb-1">{item.label}</div>
              <div className="text-sm font-semibold text-gray-900">{item.value}</div>
              {index < percentileItems.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 text-gray-300">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
