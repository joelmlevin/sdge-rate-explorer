# SDGE Rate Explorer

[![GitHub](https://img.shields.io/badge/GitHub-joelmlevin%2Fsdge--rate--explorer-blue?logo=github)](https://github.com/joelmlevin/sdge-rate-explorer)

A web application for visualizing and exploring San Diego Gas & Electric (SDG&E) solar buyback rates across multiple contract years. Designed for solar + battery system owners to optimize when to charge batteries and export power to the grid.

**🌐 Live App**: https://joelmlevin.github.io/sdge-rate-explorer/

## Features

### Multi-Year Contract Support
- **Contract Year Selector**: Choose your contract year (2023, 2024, 2025, or 2026)
- **Fast Switching**: Seamlessly switch between contract years with optimized caching
- **Smart Loading**: Each year's data (~7 MB) loads on demand in ~200ms

### Multiple View Modes
- **Day View**: Detailed hour-by-hour analysis with bar charts
- **Week View**: 7-day overview with color-coded hourly pricing
- **Month View**: Calendar grid with daily rate highlights
- **Year View**: Full-year heatmap showing rate patterns

### Visual Rate Analysis
- Color-coded rates showing relative costs throughout each period
- Hover tooltips with detailed breakdowns
- Identification of best export hours (highest rates)
- Responsive design for desktop and mobile

### Battery Strategy (Coming Soon)
- Automatic identification of optimal discharge windows (high rates)
- Suggestions for charging from solar instead of exporting (low rates)
- Context-aware recommendations based on rate patterns

## Technology Stack

- **React 18** + TypeScript - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **PapaParse** - CSV parsing
- **date-fns** - Date manipulation

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/joelmlevin/sdge-rate-explorer.git
cd sdge-rate-explorer

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

✅ **Optimized Data**: This application uses preprocessed JSON files for each contract year:
- `rates-2023.json` (7.0 MB) - 2023 contract year (NBT23)
- `rates-2024.json` (7.0 MB) - 2024 contract year (NBT24)
- `rates-2025.json` (6.8 MB) - 2025 contract year (NBT25)
- `rates-2026.json` (6.8 MB) - 2026 contract year (NBT26)

The preprocessing reduces data size by 82% and load time from 5-10 seconds to ~200ms (50x faster).

**Note**: If you need to update the rate data or add new contract years, see `/scripts/README.md` for instructions on preprocessing the original SDGE CSV files.

### Development Server
The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── daily/          # Daily view components
│   ├── explorer/       # Explorer view components (coming soon)
│   └── shared/         # Reusable UI components
├── services/           # Data loading and processing
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── dateUtils.ts    # Date/time conversions
│   └── rateUtils.ts    # Rate calculations
└── App.tsx             # Main app component
```

## Contract Year Data

### Which Contract Year Should You Use?

Your rate structure depends on when you submitted your solar application to SDGE:

- **2023 (NBT23)**: For customers who submitted their solar application in 2023
- **2024 (NBT24)**: For customers who submitted their solar application in 2024
- **2025 (NBT25)**: For customers who submitted their solar application in 2025 (current default)
- **2026 (NBT26)**: For customers who submitted their solar application in 2026

The year you submitted your application determines your rate schedule for the lifetime of your agreement. Use the dropdown selector in the app to choose your year.

### Data Format

The app loads rate data from optimized JSON files in `/public/`:
- Preprocessed from SDGE's "NBT Pricing Upload MIDAS" CSV files
- Times converted from UTC to Pacific Time
- Combined generation + delivery rates
- See `/scripts/README.md` for preprocessing details

## Code Philosophy

This codebase prioritizes:
1. **Readability**: Clear variable names, extensive comments
2. **Maintainability**: Simple patterns, avoid over-engineering
3. **Type Safety**: TypeScript throughout for catching errors early
4. **Portability**: Core logic (types, utilities) designed to be reusable in iOS app

## Key Files

### Types (`src/types/index.ts`)
All TypeScript interfaces. Designed to be portable to other platforms (iOS).

### Data Service (`src/services/dataService.ts`)
Loads and parses CSV data. Includes caching for performance.

### Utilities
- `dateUtils.ts` - Converting between UTC and Pacific time, formatting dates/times
- `rateUtils.ts` - Calculating statistics, generating battery recommendations

### Components
- `DailyView.tsx` - Main view showing 7-day forecast
- `DayCard.tsx` - Individual day display with rates and recommendations
- `HourlyRateBar.tsx` - Visual bar chart for hourly rates
- `BatteryRecommendations.tsx` - Battery strategy display

## Future Enhancements

### Explorer View
- Interactive heatmap of rates over time
- Advanced filtering (date ranges, time ranges, months, years)
- Statistical analysis
- Export to CSV

### PWA Support
- Install as app on iOS/Android
- Offline support
- Push notifications for peak rates

### iOS App Integration
- Core TypeScript types can be translated to Swift
- Data processing logic documented for reimplementation
- API-first design for future backend

## Understanding the Code

### How Rates Are Processed

1. **Loading** (`dataService.ts`):
   - CSV is parsed with PapaParse
   - Raw entries converted to `RateEntry` objects
   - UTC times converted to Pacific time
   - Hour extracted from ValueName (more reliable than timestamp)

2. **Filtering** (`dataService.ts`):
   - Apply filters (date range, time range, rate type, etc.)
   - Default filter: Generation rates only (not Delivery)

3. **Analysis** (`rateUtils.ts`):
   - Calculate statistics (mean, median, percentiles)
   - Determine which hours are in top/bottom quartiles
   - Generate battery recommendations based on rate patterns

4. **Display** (Components):
   - Visual representation with color-coded bars
   - Hover tooltips for details
   - Responsive design for mobile

### Date/Time Handling

**Important**: CSV times are in UTC, but we display Pacific Time
- TimeStart = 8:00 UTC → 12:00 AM Pacific (midnight)
- We use the `ValueName` field's "HS" number to get the correct hour
- All display times are in Pacific (PST/PDT)

## Deployment

### GitHub Pages / Netlify / Vercel
1. Build the app: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Make sure `rates.csv` is in the `public` folder

### Preview GitHub Pages (PRs)
Pull requests from branches in this repository publish previews at:
`https://joelmlevin.github.io/sdge-rate-explorer/previews/<pr-number-or-branch>/`

You can trigger the "Preview GitHub Pages" workflow manually for a branch via GitHub Actions.

### Important Notes
- The CSV file is ~40MB, so initial load may take a few seconds
- Data is cached after first load for performance
- App is fully client-side (no backend required)

## Contributing

When adding features:
1. Add types to `src/types/index.ts` first
2. Write utility functions with clear comments
3. Keep components focused on UI, logic in utilities
4. Test on mobile viewport (this is primarily a mobile app)

## Author

Joel Levin
Created: 2026-01-17

## License

License: PolyForm Noncommercial 1.0.0 (noncommercial use only).
Commercial use requires a separate paid license. See COMMERCIAL-LICENSE.md.

