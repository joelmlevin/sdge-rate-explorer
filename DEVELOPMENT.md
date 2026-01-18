# Development Guide

## Current Status

### ✅ Completed Features
- [x] Project setup with React + TypeScript + Vite
- [x] Tailwind CSS configuration
- [x] Core TypeScript types (iOS-portable)
- [x] Date/time utilities (UTC to Pacific conversion)
- [x] Rate calculation utilities
- [x] CSV data loading with caching
- [x] State management with Zustand
- [x] React Router setup
- [x] Daily View with 7-day forecast
- [x] Visual hourly rate bars
- [x] Battery charging/discharging recommendations
- [x] Mobile-responsive design
- [x] Comprehensive documentation

### 🚧 In Progress / Planned
- [ ] Explorer View with heatmap
- [ ] Advanced filtering controls
- [ ] PWA support (installable app)
- [ ] Export to CSV functionality
- [ ] Historical rate trends
- [ ] Rate comparison tools

## Running the App

```bash
# Start development server
npm run dev

# App will be at http://localhost:5173
```

## Project Architecture

### Data Flow

1. **App.tsx** loads on mount
2. **useRateStore** calls `loadData()`
3. **dataService.ts** fetches and parses CSV
4. Data cached in memory for performance
5. **DailyView** requests rates for next 7 days
6. **rateUtils** calculates statistics and recommendations
7. Components render visualizations

### Key Concepts

#### Rate Percentiles
Instead of absolute thresholds, we use percentile-based coloring:
- Top 25% of day = Green (best export times)
- 50-75% = Amber
- 25-50% = Orange
- Bottom 25% = Red (worst export times)

This adapts to each day's unique rate distribution.

#### Battery Recommendations
Algorithm in `rateUtils.ts`:
1. Find consecutive hours ≥ 75th percentile → "Discharge" recommendation
2. Find consecutive hours ≤ 25th percentile → "Charge from solar" recommendation
3. Group by windows of 2+ hours for meaningful advice

#### Date/Time Conversion
CSV uses UTC timestamps. We convert to Pacific:
- Use `parseHourFromValueName()` to extract hour from "HS0"-"HS23"
- More reliable than timestamp conversion
- All display uses Pacific Time

## Adding New Features

### Example: Add a new visualization

1. **Define types** in `src/types/index.ts`:
```typescript
export interface MyNewFeature {
  // ... your types
}
```

2. **Add utility functions** in `src/utils/`:
```typescript
export function calculateMyFeature(rates: RateEntry[]): MyNewFeature {
  // Pure function, easy to test
}
```

3. **Create component** in appropriate folder:
```typescript
export default function MyFeatureComponent() {
  const { allRates } = useRateStore();
  const myData = useMemo(() => calculateMyFeature(allRates), [allRates]);
  return <div>{/* Your JSX */}</div>;
}
```

4. **Add route** if needed in `App.tsx`

### Example: Add a new filter

1. **Update types** in `src/types/index.ts`:
```typescript
export interface RateFilters {
  // ... existing filters
  myNewFilter?: string[];
}
```

2. **Update filter logic** in `src/services/dataService.ts`:
```typescript
export function filterRates(rates: RateEntry[], filters: RateFilters) {
  // ... existing filters
  if (filters.myNewFilter) {
    filtered = filtered.filter(/* your logic */);
  }
  return filtered;
}
```

3. **Add UI control** and wire to `useRateStore.setFilters()`

## Code Style

### Comments
- Every file has a header comment explaining its purpose
- Complex functions have explanatory comments
- Types are documented with JSDoc-style comments

### Naming Conventions
- Components: PascalCase (`DayCard.tsx`)
- Utilities: camelCase (`rateUtils.ts`)
- Types: PascalCase (`RateEntry`)
- Functions: camelCase (`calculateStatistics`)

### File Organization
- One component per file
- Related components in same folder
- Utilities separated from components
- Types in dedicated file

## Testing Strategy

### Manual Testing Checklist
- [ ] Daily View loads without errors
- [ ] Rates display for next 7 days
- [ ] Hover tooltips work on hourly bars
- [ ] Battery recommendations show for each day
- [ ] Navigation works (Daily ↔ Explorer)
- [ ] Mobile responsive (test at 375px width)
- [ ] Color coding is clear and intuitive

### Unit Testing (Future)
Consider adding:
- `rateUtils.test.ts` - Test calculation functions
- `dateUtils.test.ts` - Test date conversions
- `dataService.test.ts` - Test filtering logic

## Performance Considerations

### Current Optimizations
- CSV cached after first load
- `useMemo` for expensive calculations
- Filtered data stored in Zustand state
- React.memo for components (when needed)

### Known Limitations
- 40MB CSV file takes 2-3 seconds to load initially
- All data loaded at once (no pagination)
- Client-side processing only

### Future Improvements
- Add loading progress indicator
- Consider backend API for large datasets
- Implement virtual scrolling for long lists
- Add service worker for offline access

## Building for Production

```bash
# Create production build
npm run build

# Output will be in /dist folder

# Test production build locally
npm run preview
```

### Deployment Options

**Static Hosting** (Recommended)
- Vercel: `vercel deploy`
- Netlify: `netlify deploy --prod`
- GitHub Pages: Push `dist` folder to gh-pages branch

**Requirements**
- Must serve `rates.csv` from same origin
- No backend required (fully static)
- HTTPS recommended (for PWA features)

## Troubleshooting

### "Command not found: npm"
- Install Node.js from nodejs.org
- Restart terminal after installation

### "Failed to load rates"
- Check that `rates.csv` exists in `/public` folder
- Verify CSV format matches expected structure
- Check browser console for detailed error

### Blank page / White screen
- Check browser console for errors
- Verify dev server is running on port 5173
- Try clearing browser cache

### Styles not applying
- Ensure Tailwind is configured correctly
- Check `index.css` has `@tailwind` directives
- Restart dev server

## iOS App Integration (Future)

### Portable Code
These files can be translated to Swift:
- `src/types/index.ts` → Swift structs
- `src/utils/dateUtils.ts` → Swift Date extensions
- `src/utils/rateUtils.ts` → Swift calculation functions

### Data Format
- Export JSON instead of CSV for iOS
- Use same TypeScript types as schema
- Document API endpoints for future backend

### Shared Logic
The battery recommendation algorithm is documented in `rateUtils.ts` and can be implemented in Swift using the same logic:
1. Calculate percentiles
2. Find windows above/below thresholds
3. Group consecutive hours
4. Generate recommendations

## Questions?

- Check README.md for overview
- Review code comments for implementation details
- Types in `src/types/index.ts` are the source of truth
- All utility functions are pure and testable

## Next Steps

1. **Test the app** - Open http://localhost:5173 and verify Daily View works
2. **Build Explorer View** - Add heatmap visualization and filters
3. **Add PWA** - Make app installable on mobile
4. **Deploy** - Host on Vercel/Netlify for public access
5. **Iterate** - Get user feedback and add features

---

Last updated: 2026-01-17
