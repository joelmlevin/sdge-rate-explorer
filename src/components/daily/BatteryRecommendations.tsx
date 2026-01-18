/**
 * Battery Recommendations - Display battery charging/discharging suggestions
 */

import type { BatteryRecommendation } from '../../types';
import { formatHourRange } from '../../utils/dateUtils';

interface BatteryRecommendationsProps {
  recommendations: BatteryRecommendation[];
}

export default function BatteryRecommendations({ recommendations }: BatteryRecommendationsProps) {
  if (recommendations.length === 0) {
    return null;
  }

  // Separate by action type
  const dischargeRecs = recommendations.filter((r) => r.action === 'discharge');
  const chargeRecs = recommendations.filter((r) => r.action === 'charge');

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="text-lg">🔋</span>
        Battery Strategy Recommendations
      </h4>

      <div className="space-y-3">
        {/* Discharge recommendations */}
        {dischargeRecs.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-emerald-700 mb-2 uppercase tracking-wide">
              ⚡ Export to Grid (Discharge)
            </h5>
            <div className="space-y-2">
              {dischargeRecs.map((rec, index) => (
                <RecommendationCard key={index} recommendation={rec} />
              ))}
            </div>
          </div>
        )}

        {/* Charge recommendations */}
        {chargeRecs.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wide">
              ☀️ Charge from Solar
            </h5>
            <div className="space-y-2">
              {chargeRecs.map((rec, index) => (
                <RecommendationCard key={index} recommendation={rec} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: BatteryRecommendation }) {
  const { startHour, endHour, averageRateCents, reasoning, priority, action } = recommendation;

  const priorityColors = {
    high: 'border-l-4 border-l-green-500',
    medium: 'border-l-4 border-l-yellow-500',
    low: 'border-l-4 border-l-gray-400',
  };

  const actionIcons = {
    discharge: '📤',
    charge: '📥',
    hold: '⏸️',
  };

  return (
    <div className={`bg-white rounded p-3 ${priorityColors[priority]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <span>{actionIcons[action]}</span>
            <span>{formatHourRange(startHour, endHour)}</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">{reasoning}</div>
        </div>
        <div className="flex-shrink-0">
          <div className="text-right">
            <div className="text-sm font-bold text-gray-900">
              {averageRateCents.toFixed(1)}¢
            </div>
            <div className="text-xs text-gray-500">avg</div>
          </div>
        </div>
      </div>
    </div>
  );
}
