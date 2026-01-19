# Year Heatmap Improvements - January 19, 2026

## Changes Made

### 1. Removed Vertical Spacing Between Cells
**Goal**: Create a solid gradient appearance without gaps between hour rows

**Implementation**:
- Added `lineHeight: 0` to hour row containers
- Added `display: 'block'` and `lineHeight: 0` to individual cells
- Removes any implicit spacing from flexbox layout

**Files Modified**: `YearHeatmap.tsx` lines 227, 256-262

---

### 2. Improved Color Gradient - Piecewise Linear Transformation

**Goal**: Better capture variance in the 6¢-12¢ range based on actual 2026 NBT25 data distribution

#### Analysis Results
Analyzed 175,300 hourly observations from 2026 NBT25 pricing:

```
DISTRIBUTION BY RANGE:
Range        Count      Percent
0¢-6¢          58,609    33.4%
6¢-7¢           5,648     3.2%
7¢-8¢           7,395     4.2%
8¢-9¢           8,876     5.1%
9¢-10¢          5,197     3.0%
10¢-11¢         2,571     1.5%
11¢-12¢         3,115     1.8%
12¢+           82,694    47.2%

KEY FINDINGS:
- 18.7% of data falls in 6¢-12¢ range
- Previous logarithmic scale allocated only 10.1% of color space to this range
- Mismatch: 18.7% data → 10.1% colors (almost 2x underrepresented)
```

#### Previous Approach (Logarithmic)
```typescript
const epsilon = 0.001;
const logMin = Math.log(p1 + epsilon);
const logMax = Math.log(p99 + epsilon);
const logRate = Math.log(clampedRate + epsilon);
const normalized = (logRate - logMin) / (logMax - logMin);
```

**Problem**: Insufficient color discrimination in the 6¢-12¢ range where most decision-making occurs.

#### New Approach (Piecewise Linear)
```typescript
// Breakpoints: p1 → 0.06 → 0.08 → 0.10 → 0.12 → p99
// Color space allocation: 15% | 25% | 30% | 20% | 10%

if (clampedRate < 0.06) {
  // 0% - 15% of color space (below 6¢)
  normalized = 0.15 * ((clampedRate - p1) / (0.06 - p1));
} else if (clampedRate < 0.08) {
  // 15% - 40% of color space (6¢-8¢ range)
  normalized = 0.15 + 0.25 * ((clampedRate - 0.06) / 0.02);
} else if (clampedRate < 0.10) {
  // 40% - 70% of color space (8¢-10¢ range)
  normalized = 0.40 + 0.30 * ((clampedRate - 0.08) / 0.02);
} else if (clampedRate < 0.12) {
  // 70% - 90% of color space (10¢-12¢ range)
  normalized = 0.70 + 0.20 * ((clampedRate - 0.10) / 0.02);
} else {
  // 90% - 100% of color space (above 12¢)
  normalized = 0.90 + 0.10 * ((clampedRate - 0.12) / (p99 - 0.12));
}
```

**Benefits**:
- Allocates 75% of color space to the critical 6¢-12¢ range
- Matches color space allocation to data concentration
- Better discrimination in the range where most usage occurs
- Maintains visibility of outliers (very low and very high rates)

**Color Space Allocation**:
```
Range        Data%    Color%    Multiplier
0¢-6¢         33.4%      15%        0.45x (compressed)
6¢-8¢          7.4%      25%        3.38x (expanded)
8¢-10¢         8.1%      30%        3.70x (expanded)
10¢-12¢        3.3%      20%        6.06x (highly expanded)
12¢+          47.2%      10%        0.21x (compressed)
```

#### Legend Updates
- Updated legend generation to use inverse piecewise transformation
- Changed label from "Log scale" to "Piecewise linear"
- Updated description from "Logarithmic color scale" to "Optimized for 6¢-12¢ range"

**Files Modified**:
- `YearHeatmap.tsx` lines 111-151 (getColor function)
- `YearHeatmap.tsx` lines 153-194 (legendStops generation)
- `YearHeatmap.tsx` line 227 (description text)
- `YearHeatmap.tsx` line 376 (legend label)

---

## Supporting Files Created

### 1. `analyze-rates.py`
Python script that analyzes the 2026 rate distribution:
- Reads `public/rates-2026.json`
- Calculates statistics, percentiles, and distribution
- Provides detailed analysis of 6¢-12¢ range
- Recommends piecewise linear transformation parameters

**Run**: `python3 analyze-rates.py`

### 2. `analyze-rates.js` (backup)
Node.js version of the analysis script (functionally identical)

---

## Testing Recommendations

1. **Visual Check**:
   - Load year heatmap for 2026
   - Verify no vertical gaps between hour rows (solid gradient appearance)
   - Check that colors in 6¢-12¢ range show clear discrimination
   - Verify purple (low) → teal (medium) → yellow (high) gradient is smooth

2. **Legend Verification**:
   - Check legend shows correct rate values
   - Verify legend label says "Piecewise linear" (not "Log scale")
   - Confirm description says "Optimized for 6¢-12¢ range"

3. **Hover Tooltip**:
   - Hover over cells in different rate ranges
   - Verify tooltip shows correct values
   - Check tooltip has semi-opaque white background

4. **Responsiveness**:
   - Resize browser window
   - Verify heatmap scales dynamically
   - Check month labels remain aligned

---

## Expected Visual Improvements

**Before (Logarithmic)**:
- 6¢-12¢ range: subtle color changes, hard to distinguish
- Most cells appeared similar teal color
- Outliers (>30¢) dominated the yellow spectrum

**After (Piecewise Linear)**:
- 6¢-12¢ range: 75% of color spectrum, clear visual differences
- Each 1¢ increment in 6¢-12¢ range shows noticeable color shift
- High rates (>12¢) still visible but compressed into top 10% of spectrum
- Better alignment between visual discrimination and decision-making needs

---

## Documentation Updates

Updated `FUTURE_IMPROVEMENTS.md`:
- Marked color scale enhancement as ✅ IMPLEMENTED
- Documented the solution and rationale
- Preserved alternative approaches for future reference
