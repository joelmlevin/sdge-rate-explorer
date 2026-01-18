# Review: copilot/bugfix-contract-year-dropdown

**Branch**: `origin/copilot/bugfix-contract-year-dropdown`
**Compared to**: `main`
**Reviewer**: Claude
**Date**: 2026-01-18

## Summary

This branch addresses a critical UX issue where switching contract years could navigate users to dates outside the available data range. It also adds GitHub Actions workflow for PR previews.

## Key Changes

### 1. Date Range Validation (CalendarExplorerV2.tsx)

**Problem Solved**: When switching contract years, users could end up viewing dates that don't exist in the new contract year's data range.

**Example Scenario**:
- User viewing Feb 2026 in NBT26 (data: 2026-2045)
- Switches to NBT23 (data: 2024-2043)
- Feb 2026 doesn't exist in NBT23 data
- App showed empty/broken state

**Solution Implemented**:
```typescript
// Calculate available date range from loaded data
const availableRange = useMemo(() => (
  allRates.length ? getDateRange(allRates) : null
), [allRates]);

// Parse into Date objects
const parsedRange = useMemo(() => {
  if (!availableRange) return null;
  return {
    min: parse(availableRange.min, 'yyyy-MM-dd', new Date()),
    max: parse(availableRange.max, 'yyyy-MM-dd', new Date()),
  };
}, [availableRange]);

// Calculate current view's date range
const activeRange = useMemo(() => {
  // Returns {start, end} for current view (day/week/month/year)
}, [selectedDate, selectedMonth, selectedYear, viewMode]);

// Check if current view is outside available data
const suggestedDate = useMemo(() => {
  if (!parsedRange || !activeRange) return null;
  if (activeRange.end < parsedRange.min) return parsedRange.min;
  if (activeRange.start > parsedRange.max) return parsedRange.max;
  return null;
}, [activeRange, parsedRange]);
```

**Warning Banner**: When dates are out of range, shows:
```
┌────────────────────────────────────────────────────────────┐
│ ⚠️ No data available for this contract year in the        │
│    selected [view] view.                                   │
│                                                            │
│    Available dates: Jan 1, 2024 – Dec 31, 2043            │
│                                                            │
│    [Go to Jan 1, 2024] ←── Click to navigate to valid date│
└────────────────────────────────────────────────────────────┘
```

### 2. Simplified Year Change Handler

**IMPORTANT CHANGE**: Removed the date offset logic!

**Before** (in our v1.1):
```typescript
const handleYearChange = async (year: ContractYear) => {
  // Calculate the year offset based on where the data actually starts
  const oldDataStartYear = CONTRACT_YEAR_INFO[contractYear].dataStartYear;
  const newDataStartYear = CONTRACT_YEAR_INFO[year].dataStartYear;
  const yearOffset = newDataStartYear - oldDataStartYear;

  // Update selected dates to maintain relative position in the dataset
  const newYear = selectedYear + yearOffset;
  const newDate = new Date(
    selectedDate.getFullYear() + yearOffset,
    selectedDate.getMonth(),
    selectedDate.getDate()
  );

  setSelectedYear(newYear);
  setSelectedDate(newDate);

  await switchContractYear(year);
};
```

**After** (Copilot's version):
```typescript
const handleYearChange = async (year: ContractYear) => {
  await switchContractYear(year);
};
```

**Analysis**:
- ❌ **Removes our smart date preservation** (Feb 2025 → Feb 2026)
- ✅ **But adds date range validation** to prevent broken states
- 🤔 **Trade-off**: Simpler but less intuitive

### 3. New Utility Function (dataService.ts)

```typescript
/**
 * Get date range of available data
 */
export function getDateRange(rates: RateEntry[]): { min: string; max: string } {
  if (rates.length === 0) {
    return { min: '', max: '' };
  }

  const sorted = [...rates].sort((a, b) => a.date.localeCompare(b.date));
  return {
    min: sorted[0].date,
    max: sorted[sorted.length - 1].date,
  };
}
```

**Performance Note**: Creates a sorted copy of entire rates array. For 175,300 entries, this could be slow. Could be optimized with min/max scan instead of full sort.

### 4. GitHub Actions Preview Workflow

**New File**: `.github/workflows/preview-pages.yml`

**Purpose**: Deploy PR previews to GitHub Pages for testing

**Preview URLs**:
```
https://joelmlevin.github.io/sdge-rate-explorer/previews/<pr-number>/
https://joelmlevin.github.io/sdge-rate-explorer/previews/<branch-name>/
```

**Features**:
- Triggers on pull requests or manual dispatch
- Only runs for PRs from same repo (not forks)
- Uses `VITE_BASE_PATH` env var to configure base path
- Deploys to subdirectory without overwriting main site
- Concurrent builds cancelled if new commit pushed

### 5. Vite Config Update

**Before**:
```typescript
base: '/sdge-rate-explorer/',
```

**After**:
```typescript
base: process.env.VITE_BASE_PATH ?? '/sdge-rate-explorer/',
```

**Purpose**: Allows preview workflow to override base path for subdirectory deployment

### 6. README Update

Documents the new preview workflow feature.

## Pros and Cons

### ✅ Pros

1. **Prevents Broken States**: Users can't get stuck viewing invalid date ranges
2. **Clear User Feedback**: Warning banner with action button is user-friendly
3. **Preview Workflow**: Great for testing changes before merging
4. **Simpler Code**: Removed complex date offset logic
5. **Date Range Utility**: Useful function for future features

### ❌ Cons

1. **Lost Smart Date Preservation**: Our Feb 2025 → Feb 2026 behavior is gone
   - Users now manually adjust dates after switching years
   - Less intuitive UX than our v1.1 implementation

2. **Performance**: `getDateRange()` sorts entire array unnecessarily
   - Could be optimized to O(n) instead of O(n log n)

3. **Redundant Validation**: The warning banner is good, but we could have both:
   - Smart date offsetting (our v1.1 feature)
   - AND validation fallback (Copilot's addition)

## Recommendation

**Option 1: Merge with Modifications** ⭐ (Recommended)
1. Merge the branch to get the preview workflow and date range validation
2. Add back our smart date offsetting from v1.1
3. Use date range validation as a fallback for edge cases
4. Optimize `getDateRange()` to avoid full sort

**Option 2: Cherry-Pick**
1. Take the preview workflow (`.github/workflows/preview-pages.yml`)
2. Take the vite config change
3. Keep our v1.1 date handling logic
4. Add date range validation separately

**Option 3: Decline**
1. Keep our v1.1 implementation as-is
2. Add preview workflow separately
3. Don't merge the simplified year change handler

## Suggested Improvements

### 1. Combine Both Approaches

```typescript
const handleYearChange = async (year: ContractYear) => {
  // Try smart offset first (our v1.1 logic)
  const oldDataStartYear = CONTRACT_YEAR_INFO[contractYear].dataStartYear;
  const newDataStartYear = CONTRACT_YEAR_INFO[year].dataStartYear;
  const yearOffset = newDataStartYear - oldDataStartYear;

  const newYear = selectedYear + yearOffset;
  const newDate = new Date(
    selectedDate.getFullYear() + yearOffset,
    selectedDate.getMonth(),
    selectedDate.getDate()
  );

  // Switch year first
  await switchContractYear(year);

  // Get new data range
  const range = getDateRange(allRates);
  const parsedMin = parse(range.min, 'yyyy-MM-dd', new Date());
  const parsedMax = parse(range.max, 'yyyy-MM-dd', new Date());

  // Validate proposed date is in range
  if (newDate >= parsedMin && newDate <= parsedMax) {
    // Smart offset worked! Use it.
    setSelectedYear(newYear);
    setSelectedDate(newDate);
  } else {
    // Out of range, fall back to closest valid date
    if (newDate < parsedMin) {
      setSelectedDate(parsedMin);
      setSelectedYear(parsedMin.getFullYear());
      setSelectedMonth(parsedMin.getMonth() + 1);
    } else {
      setSelectedDate(parsedMax);
      setSelectedYear(parsedMax.getFullYear());
      setSelectedMonth(parsedMax.getMonth() + 1);
    }
  }
};
```

### 2. Optimize getDateRange

```typescript
export function getDateRange(rates: RateEntry[]): { min: string; max: string } {
  if (rates.length === 0) {
    return { min: '', max: '' };
  }

  // O(n) scan instead of O(n log n) sort
  let min = rates[0].date;
  let max = rates[0].date;

  for (const rate of rates) {
    if (rate.date < min) min = rate.date;
    if (rate.date > max) max = rate.date;
  }

  return { min, max };
}
```

### 3. Cache Date Range

```typescript
// In useRateStore
interface RateStore {
  // ... existing fields
  dateRange: { min: string; max: string } | null;
}

// Update when loading data
loadData: async (year?: ContractYear) => {
  // ... existing code
  const dateRange = getDateRange(rates);
  set({
    allRates: rates,
    filteredRates: filtered,
    isLoading: false,
    contractYear,
    dateRange, // Cache it!
  });
}
```

## Testing Checklist

If merged, verify:
- [ ] Switching from NBT26 (2026 data) to NBT23 (2024 data) shows warning
- [ ] "Go to [date]" button navigates to valid date
- [ ] Warning disappears after clicking button
- [ ] Preview workflow works for PRs
- [ ] Main site still deploys correctly
- [ ] Smart date offsetting still works (if we add it back)

## Conclusion

Copilot identified a real issue (invalid date ranges after year switch) and proposed a solution (validation + warning banner). However, it removed our better UX feature (smart date preservation) in the process.

**Best path forward**: Merge the preview workflow and validation infrastructure, but restore our smart date offsetting logic with validation as a fallback.
