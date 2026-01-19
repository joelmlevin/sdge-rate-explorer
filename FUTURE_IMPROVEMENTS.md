# Future Improvements

## Year Heatmap Color Scale Enhancement

### Status: ✅ IMPLEMENTED (2026-01-19)

### Solution
Implemented piecewise linear color mapping based on 2026 NBT25 data distribution analysis:
- Analyzed 175,300 hourly observations
- Found 18.7% of data in 6¢-12¢ range, but logarithmic scale only allocated 10% color space
- Implemented piecewise linear transformation with breakpoints at 6¢, 8¢, 10¢, 12¢
- Color space allocation: 15% (below 6¢) | 25% (6¢-8¢) | 30% (8¢-10¢) | 20% (10¢-12¢) | 10% (above 12¢)
- Now gives 75% of color space to the critical 6¢-12¢ range

### Previous Approach (Deprecated)
- Used logarithmic transformation: `log(rate + epsilon)`
- Maps 1st percentile to purple, 99th percentile to yellow
- Linear interpolation through teal midpoint
- Problem: Insufficient color discrimination in common rate ranges

### Alternative Approaches Considered

1. **Piecewise Linear Scale**
   - Apply different scaling in different rate ranges
   - E.g., More granular in 6¢-10¢, coarser in outlier regions

2. **Perceptually Uniform Color Scale**
   - Consider using perceptually uniform color spaces (CIELAB, CIELUV)
   - Or use established scales like Viridis (already used in RateHeatmap)

3. **Adaptive Binning**
   - Histogram equalization: bins sized to contain equal number of observations
   - This would maximize use of color range for actual data distribution

4. **Custom Curve Fitting**
   - Fit a curve to emphasize discrimination where rates are most clustered
   - Could use quantile-based transformation instead of log

### Implementation Ideas
```typescript
// Option 1: Piecewise linear
if (rate < 8) {
  // Slow scale: 6-8¢ gets 40% of color range
  normalized = 0.4 * (rate - 6) / 2;
} else if (rate < 12) {
  // Medium scale: 8-12¢ gets 40% of color range
  normalized = 0.4 + 0.4 * (rate - 8) / 4;
} else {
  // Fast scale: 12¢+ gets remaining 20%
  normalized = 0.8 + 0.2 * (rate - 12) / (maxRate - 12);
}

// Option 2: Use Viridis for consistency with RateHeatmap
import { getViridisColor } from './utils/colorScale';
```

### References
- Current implementation: `webapp/src/components/calendar/YearHeatmap.tsx:105-136`
- Related color utilities: `webapp/src/utils/colorScale.ts`
- Similar component: `webapp/src/components/explorer/RateHeatmap.tsx` (uses Viridis)

### Priority
Medium - Current visualization is functional but could be more informative for decision-making in the common rate ranges.
