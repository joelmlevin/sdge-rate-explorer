/**
 * Year View V2 - Grid of 12 months with design system integration
 * Clean, scannable annual overview
 */

import { getMonthSummary, type MonthSummary } from '../../utils/calendarUtils';
import { toCents } from '../../utils/rateUtils';
import type { RateEntry } from '../../types';
import { designs, type DesignVariant } from '../../styles/designs';

interface YearViewProps {
  rates: RateEntry[];
  year: number;
  onMonthClick?: (month: number) => void;
  design?: DesignVariant;
}

export default function YearViewV2({ rates, year, onMonthClick, design = 'minimal' }: YearViewProps) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const monthSummaries = months
    .map(month => getMonthSummary(rates, year, month))
    .filter((summary): summary is MonthSummary => summary !== null);

  const designSystem = designs[design];

  if (monthSummaries.length === 0) {
    return (
      <div className={`${designSystem.borders.radius} p-12 text-center shadow-sm`}
           style={{ backgroundColor: designSystem.colors.surface, borderColor: designSystem.colors.border }}>
        <p style={{ color: designSystem.colors.text.tertiary }}>No data available for {year}.</p>
      </div>
    );
  }

  return (
    <div className={`${designSystem.borders.radius} overflow-hidden shadow-sm`}
         style={{ backgroundColor: designSystem.colors.surface }}>
      {/* Header */}
      <div className="px-8 py-6 border-b" style={{ borderColor: designSystem.colors.border }}>
        <h2 className="text-4xl font-bold" style={{ color: designSystem.colors.text.primary }}>{year}</h2>
      </div>

      {/* Month grid - fixed 4 columns × 3 rows */}
      <div className="p-8 grid grid-cols-4 gap-4">
        {monthSummaries.map(month => (
          <MonthCard
            key={month.month}
            summary={month}
            onClick={() => onMonthClick?.(month.month)}
            design={design}
          />
        ))}
      </div>
    </div>
  );
}

interface MonthCardProps {
  summary: MonthSummary;
  onClick?: () => void;
  design: DesignVariant;
}

function MonthCard({ summary, onClick, design }: MonthCardProps) {
  const { monthName, dayCount, avgDailyMin, avgDailyMax, overallAvg } = summary;
  const designSystem = designs[design];

  return (
    <div
      className={`${designSystem.borders.radius} p-5 cursor-pointer transition-all hover:shadow-lg`}
      style={{
        backgroundColor: designSystem.colors.surface,
        border: `2px solid ${designSystem.colors.border}`,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = designSystem.colors.accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = designSystem.colors.border;
      }}
    >
      <h3 className="text-lg font-bold mb-4" style={{ color: designSystem.colors.text.primary }}>
        {monthName}
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-baseline">
          <span style={{ color: designSystem.colors.text.secondary }}>Days</span>
          <span className="font-bold tabular-nums" style={{ color: designSystem.colors.text.primary }}>
            {dayCount}
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <span style={{ color: designSystem.colors.text.secondary }}>Avg Low</span>
          <span className="font-bold tabular-nums" style={{ color: '#8B5CF6' }}>
            {toCents(avgDailyMin).toFixed(1)}¢
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <span style={{ color: designSystem.colors.text.secondary }}>Avg High</span>
          <span className="font-bold tabular-nums" style={{ color: '#EAB308' }}>
            {toCents(avgDailyMax).toFixed(1)}¢
          </span>
        </div>

        <div className="pt-3 border-t flex justify-between items-baseline"
             style={{ borderColor: designSystem.colors.borderLight }}>
          <span className="font-medium" style={{ color: designSystem.colors.text.secondary }}>Overall</span>
          <span className="font-bold text-base tabular-nums" style={{ color: designSystem.colors.text.primary }}>
            {toCents(overallAvg).toFixed(1)}¢
          </span>
        </div>
      </div>

      {/* Visual indicator */}
      <div className={`mt-4 h-2 ${designSystem.borders.radius}`} style={{
        background: 'linear-gradient(to right, #8B5CF6, #14B8A6, #EAB308)'
      }}></div>
    </div>
  );
}
