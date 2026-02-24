/**
 * Core TypeScript types for SDGE Rate Explorer
 * These types are designed to be portable to other platforms (iOS, etc.)
 */

/**
 * Which price component to display in visualizations
 */
export type RateComponent = 'total' | 'generation' | 'delivery';

/**
 * Raw rate data entry from CSV file
 * Matches the structure of "Current Year NBT Pricing Upload MIDAS.csv"
 */
export interface RawRateEntry {
  RIN: string;                    // Rate Identification Number (e.g., "USCA-XXSD-NB00-0000")
  RateName: string;               // e.g., "NBT23", "NBT24", "NBT25", "NBT26"
  DateStart: string;              // Date in "M/D/YYYY" format (UTC)
  TimeStart: string;              // Time in "H:MM:SS" format (UTC)
  DateEnd: string;                // Date in "M/D/YYYY" format (UTC)
  TimeEnd: string;                // Time in "H:MM:SS" format (UTC)
  DayStart: number;               // Day of week: 1=Mon, 2=Tue, ..., 7=Sun, 8=Holiday (Pacific Time)
  DayEnd: number;                 // Day of week (Pacific Time)
  ValueName: string;              // e.g., "Jan Weekend HS0" (Hour Starting 0-23)
  Value: number;                  // Rate in $/kWh
  Unit: string;                   // "export $/kWh"
  RateType: string;               // "TOU" (Time of Use)
  Sector: string;                 // "All"
}

/**
 * Processed rate data entry (converted to Pacific Time, parsed for easy use)
 */
export interface RateEntry {
  timestamp: string;              // ISO 8601 timestamp in Pacific Time
  date: string;                   // Date string "YYYY-MM-DD" in Pacific Time
  hour: number;                   // Hour 0-23 in Pacific Time
  rate: number;                   // Total rate in $/kWh (generation + delivery)
  rateCents: number;              // Total rate in cents/kWh (for display)
  rateType: 'generation' | 'delivery';  // Parsed from RIN (kept for compatibility)
  rateName: string;               // e.g., "NBT23", "NBT24", "NBT25", "NBT26"
  dayType: 'weekday' | 'weekend' | 'holiday';  // Parsed from DayStart
  month: number;                  // 1-12
  monthName: string;              // "January", "February", etc.
  year: number;                   // Full year
  dayOfWeek: number;              // 0=Sunday, 1=Monday, ..., 6=Saturday
  dayOfWeekName: string;          // "Monday", "Tuesday", etc.
  // Separate generation and delivery rates (from optimized format)
  generationRate?: number;        // Generation rate in $/kWh
  deliveryRate?: number;          // Delivery rate in $/kWh
  generationRateCents?: number;   // Generation rate in cents/kWh
  deliveryRateCents?: number;     // Delivery rate in cents/kWh
}

/**
 * Battery action recommendation
 */
export interface BatteryRecommendation {
  startTime: string;              // ISO 8601 timestamp
  endTime: string;                // ISO 8601 timestamp
  startHour: number;              // Hour 0-23
  endHour: number;                // Hour 0-23
  action: 'charge' | 'discharge' | 'hold';
  averageRate: number;            // Average rate during this period ($/kWh)
  averageRateCents: number;       // Average rate in cents/kWh
  reasoning: string;              // Human-readable explanation
  priority: 'high' | 'medium' | 'low';  // How important this recommendation is
}

/**
 * Daily insights for a specific date
 */
export interface DailyInsights {
  date: string;                   // "YYYY-MM-DD"
  dayOfWeek: string;              // "Monday", "Tuesday", etc.
  peakRateHours: Array<{
    hour: number;
    rate: number;
    rateCents: number;
    timestamp: string;
  }>;
  lowestRateHours: Array<{
    hour: number;
    rate: number;
    rateCents: number;
    timestamp: string;
  }>;
  averageRate: number;            // Average rate for the day ($/kWh)
  averageRateCents: number;       // Average rate in cents/kWh
  minRate: number;                // Minimum rate for the day
  maxRate: number;                // Maximum rate for the day
  recommendations: BatteryRecommendation[];
  // Percentile thresholds (for color coding)
  percentile25: number;           // 25th percentile rate
  percentile50: number;           // Median rate
  percentile75: number;           // 75th percentile rate
  percentile90: number;           // 90th percentile rate
}

/**
 * Hourly rate data for visualization
 */
export interface HourlyRate {
  hour: number;                   // 0-23
  hourLabel: string;              // "12 AM", "1 PM", etc.
  rate: number;                   // $/kWh
  rateCents: number;              // cents/kWh
  percentile: number;             // 0-100, where this rate falls relative to the day
  isTopQuartile: boolean;         // Is this in the top 25% of rates for the day?
  isBottomQuartile: boolean;      // Is this in the bottom 25% of rates for the day?
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  startDate: string;              // "YYYY-MM-DD"
  endDate: string;                // "YYYY-MM-DD"
}

/**
 * Time range filter (hours of day)
 */
export interface TimeRangeFilter {
  startHour: number;              // 0-23
  endHour: number;                // 0-23
}

/**
 * Filter options for rate data
 */
export interface RateFilters {
  dateRange?: DateRangeFilter;
  timeRange?: TimeRangeFilter;
  months?: number[];              // Array of months (1-12) to include
  years?: number[];               // Array of years to include
  dayTypes?: ('weekday' | 'weekend' | 'holiday')[];
  rateTypes?: ('generation' | 'delivery')[];
  rateNames?: string[];           // Array of rate names (e.g., ["NBT23", "NBT24", "NBT25", "NBT26"])
}

/**
 * Statistics for a set of rates
 */
export interface RateStatistics {
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile90: number;
  percentile95: number;
}
