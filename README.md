# SDGE Rate Explorer

[![GitHub](https://img.shields.io/badge/GitHub-joelmlevin%2Fsdge--rate--explorer-blue?logo=github)](https://github.com/joelmlevin/sdge-rate-explorer)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#license)

A web application for exploring San Diego Gas & Electric (SDGE) solar buyback rates. Designed specifically for solar + battery system owners to optimize when to charge batteries and export power to the grid.

**Web application link**: [https://github.com/joelmlevin/sdge-rate-explorer](https://joelmlevin.github.io/sdge-rate-explorer/)

## Features

### Daily View
- **7-Day Forecast**: See today's rates plus the next 6 days
- **Visual Hourly Rates**: Color-coded bars showing relative rates throughout each day

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

### Local installation

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

✅ **Optimized Data**: This application uses a preprocessed `rates.json` file (6.8 MB) that is included in the repository. The preprocessing reduces data size by 82% and load time from 5-10 seconds to ~200ms (50x faster).

**Note**: If you need to update the rate data, see `/scripts/README.md` for instructions on preprocessing the original SDGE CSV file. Source data were obtained at: https://www.sdge.com/solar/solar-billing-plan/export-pricing

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

## Data Format

The app loads rate data from `/public/rates.csv`, which should be in the format provided by SDGE:
- CSV with headers matching "Current Year NBT Pricing Upload MIDAS.csv"
- Times in UTC (converted to Pacific automatically)
- See `Understanding Solar Billing Plan Export Pricing Web.pdf` for details

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

## License

[Your License Here]

## Author

Joel Levin
Created: 2026-01-17

## Acknowledgments

- SDGE for providing export pricing data
- California Public Utilities Commission (CPUC) for rate structure

## License

MIT License - see LICENSE file for details

## Contributing

This is a personal project, but issues and suggestions are welcome! Please open an issue on GitHub if you find bugs or have feature requests.
