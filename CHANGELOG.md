# Changelog

All notable changes to the SDG&E Rate Explorer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2026-01-19

### Changed
- **Month View Visual Hierarchy**: Further improved date prominence and text sizing
  - Date numbers: Increased from text-xl to text-3xl for maximum visibility
  - Peak hour labels: Increased from text-[10px] to text-xs to match rate range size
  - Better utilization of available cell space
- **Footer Spacing Refinement**: Adjusted link spacing for optimal readability
  - Bullet separator margins: Set to 12px (approximately 3 character spaces)
  - Creates comfortable visual separation without excessive whitespace

### Fixed
- **Year Heatmap Month Label Spacing**: Reduced top padding to balance with y-axis
  - Month label container height: Reduced from 28px to 20px
  - Added 2px bottom margin for subtle separation from heatmap grid
  - Creates even spacing on both x-axis and y-axis for visual balance
- **Year Heatmap Hover Indicator**: Removed distracting black ring outline on cell hover
  - Cells now show color and tooltip without additional visual overlay

## [2.1.0] - 2026-01-19

### Added
- **Keyboard Shortcuts**: Navigate the app without touching the mouse
  - Arrow keys: Left/Right for Previous/Next navigation
  - D/W/M/Y keys: Switch between Day/Week/Month/Year views
  - First letter underlined in view mode buttons as visual hint
  - Shortcuts ignore input fields to avoid conflicts with typing
  - Pressing current view's shortcut does nothing (no unnecessary reloads)

### Changed
- **Simplified Contract Year Dropdown**: Removed explanatory text box at bottom for cleaner UI
- **Improved Footer Readability**: Increased spacing between links (gap-4, px-5) with bullet separators
- **Year Heatmap Refinements**:
  - Removed "365 days × 24 hours" cell count text for cleaner header
  - Increased month abbreviation font size (9px → 12px/text-xs) for better readability
- **Month View Enhancement**: Redesigned cell hierarchy for better scanability
  - Decreased cell height (aspect ratio 1:0.85 instead of 1:1) for more compact layout
  - Date numbers: Much larger and bolder (text-xl font-extrabold) for prominence
  - Rate ranges: Smaller text (text-xs) to emphasize dates
  - Peak hour labels: Even smaller (text-[10px]) for subtle detail
- **Navigation Improvements**:
  - Date now persists when switching from Month → Week view
  - Previously: Switching to week view would jump to current date
  - Now: Stays in the selected month when switching views
- **Routing Fix**: Removed /calendar route to fix page refresh 404 errors
  - App now serves at root path only
  - Page refreshes work correctly on GitHub Pages deployment

### Fixed
- **Week View Scrolling**: Removed nested horizontal scroll container
  - Week view grid now part of main page flow
  - No more confusing sub-window with its own scrollbar
  - Better responsive behavior maintained with minmax(70px, 1fr) columns

### Technical
- Updated branding from "SDGE" to "SDG&E" throughout application
- Improved TypeScript type safety in Navigation component

## [2.0.0] - 2026-01-19

### Major Breaking Changes
This is a major version bump due to fundamental changes in how the application handles color scaling and UI organization. While there are no API-level breaking changes, the visual experience and data representation have been significantly altered.

### Added
- **Year Heatmap Complete Visualization**: 365 days × 24 hours interactive grid
  - Dynamic cell width scaling responsive to browser window size
  - Click-to-navigate: cells link to week view for detailed analysis
  - Month labels with intelligent positioning at top of grid
  - Comprehensive vertical legend showing full color scale
  - Interactive tooltips displaying date, hour, and exact rate

### Changed
- **Color Scale Philosophy**: Complete redesign from logarithmic to cube root transformation
  - **Breaking Visual Change**: All visualizations now use cube root transformation
  - Shows **full data range** (removed 99th percentile clipping that hid extreme values)
  - Better perceptual discrimination across entire rate spectrum
  - Purple (low) → Teal (medium) → Yellow (high) gradient maintained
  - Rationale: Cube root provides optimal discrimination for wide dynamic ranges without artificial clipping

- **Week View Accessibility**: Dynamic text color based on background luminance
  - Implements WCAG luminance calculation for optimal contrast
  - Black text on light backgrounds (luminance > 0.5)
  - White text on dark backgrounds (luminance ≤ 0.5)
  - Tooltip redesigned with 98% opaque white background and solid black text
  - Improved readability on dark purple/blue backgrounds

- **Week View Layout Optimization**:
  - Reduced minimum width from 900px to 600px (33% improvement)
  - Hour label column: 80px → 60px (still legible)
  - Day columns: Equal 1fr → `minmax(70px, 1fr)` (better space utilization)
  - More efficient use of screen space on medium-sized displays

- **Hour Label Standardization**: Consistent across all views
  - Format: 12a, 2a, 4a, 6a, 8a, 10a, 12p, 2p, 4p, etc.
  - Year heatmap shows labels every 2 hours for cleaner appearance
  - Matches established convention throughout application

- **Month View Clarity**: Peak pricing format improved
  - Changed from cryptic "@6p" to clear "Peak: 6pm"
  - Self-explanatory format requires no decoding
  - Applies to all hours: "Peak: 12am", "Peak: 6am", "Peak: 12pm", "Peak: 6pm"

### Removed
- **Simplified UI Philosophy**: Removed all prescriptive guidance panels
  - "About the Data" panels removed from all calendar views
  - "Battery Strategy" recommendations removed from daily views
  - Focus shifted to pure data visualization without telling users what to do
  - Users can interpret and apply data to their own needs

### Fixed
- Year heatmap vertical spacing eliminated for solid gradient appearance
- TypeScript compilation errors from unused imports/variables
- Week view text visibility on dark colored backgrounds

### Technical
- Implemented perceptual luminance calculation using WCAG formula: `0.299*R + 0.587*G + 0.114*B`
- Optimized CSS grid layout with `minmax()` for dynamic scaling
- Full range color mapping with cube root transformation: `normalized = ((rate - min) / (max - min))^(1/3)`
- Removed percentile-based clipping that artificially limited data visibility

---

## [1.2.0] - 2026-01-18

### Added
- **Date Range Validation**: Automatic detection when viewing dates outside available data
  - Warning banner with clear messaging when out of range
  - "Go to valid date" button for quick navigation
  - Prevents confusion when switching between contract years

- **GitHub Actions Preview Workflow**: Automatic PR preview deployments
  - Preview URLs: `https://joelmlevin.github.io/sdge-rate-explorer/previews/<pr-number>/`
  - Enables testing changes before merging to main
  - Fork guard prevents unauthorized deployments

- **Date Range Utility**: New `getDateRange()` function in dataService
  - O(n) linear scan performance (optimized from O(n log n))
  - ~5ms for 175,300 entries
  - Returns min/max dates from dataset

### Changed
- **Contract Year Switching Behavior** (Bug Fix):
  - **Before**: Feb 2025 (NBT25) → Feb 2026 (NBT26) - dates were incorrectly offset
  - **After**: Feb 2025 (NBT25) → Feb 2025 (NBT26) - same calendar date, different rates
  - Rationale: Contract years represent different rate structures for same dates, not different time periods

- **Week View Details**: Enhanced generation vs delivery breakdown in tooltips

### Fixed
- Date validation preventing broken UI states when out of range
- Contract year dropdown date persistence behavior
- Week view details display

### Technical
- Made Vite `base` path configurable via `VITE_BASE_PATH` environment variable
- Added preview workflow with concurrency control
- Performance optimization: O(n) date range scan

---

## [1.1.0] - 2026-01-18

### Added
- **Multi-Year Contract Support**: All 4 SDGE Net Billing Tariff years
  - **NBT23** (2023) - Data: 2024-2043
  - **NBT24** (2024) - Data: 2024-2043
  - **NBT25** (2025) - Data: 2025-2044 *(default)*
  - **NBT26** (2026) - Data: 2026-2045

- **Enhanced User Experience**:
  - Prominent contract year selector with blue accent
  - View mode persistence when switching years
  - Date context preservation with intelligent offsetting
  - Fast loading with per-year caching (~200ms)
  - Smooth transitions without full-page reloads

- **Quick Date Picker Navigation**:
  - Modal date picker for jumping to specific dates
  - Month/year selectors
  - Visual calendar interface
  - Toggle button in header

### Changed
- **Data Architecture**: Separate JSON files per contract year
  - `rates-2023.json` (7.0 MB)
  - `rates-2024.json` (7.0 MB)
  - `rates-2025.json` (6.8 MB)
  - `rates-2026.json` (6.8 MB)
  - Total deployment: ~27 MB (all years)

- **Language Improvements**: "signed contract" → "submitted solar application"
- **Rate Code Consistency**: Standardized as NBT23, NBT24, NBT25, NBT26

### Fixed
- View mode persistence when switching contract years
- Date context updates correctly when switching years
- Modal z-index and backdrop issues
- Day view axis label styling

### Technical
- Component preservation during year switches
- Local state persistence across year changes
- Year-specific data caching
- `dataStartYear` tracking for proper date offsetting
- Error handling with graceful fallback

---

## [1.0.0] - 2026-01-17

### Initial Release
First public release of SDGE Rate Explorer with comprehensive rate visualization tools.

### Added
- **Calendar Views**: Complete time-based navigation
  - Day View: 24-hour breakdown with bar charts
  - Week View: 7-day × 24-hour grid with color coding
  - Month View: Calendar grid with daily summaries
  - Year View: 12-month overview with statistics

- **Interactive Features**:
  - Hover tooltips with detailed rate breakdowns
  - Click navigation between views
  - Generation vs delivery rate separation
  - Color-coded rate visualization (Viridis scale)

- **Rate Visualization**:
  - Hourly rate heatmaps
  - Best export hour identification
  - Rate range displays
  - Weekend/holiday highlighting

- **Data Features**:
  - 2025 NBT25 contract year data (default)
  - Data coverage: 2025-2044 (20 years)
  - Hourly resolution
  - Combined generation + delivery rates

- **Design System**:
  - Three design variants: minimal, vibrant, professional
  - Responsive layout for all screen sizes
  - Clean, modern interface
  - Accessible color schemes

### Technical Implementation
- **Frontend**: React 19 + TypeScript
- **Build**: Vite 5 with optimized bundling
- **Styling**: Tailwind CSS 4 with custom design tokens
- **State**: Zustand for lightweight state management
- **Routing**: React Router 7 with GitHub Pages support
- **Charts**: Recharts for visualizations
- **Dates**: date-fns for reliable date handling
- **Deployment**: GitHub Pages with automated gh-pages workflow
- **Bundle Size**: ~93 KB gzipped (initial load)
- **Data Size**: 6.8 MB per year (loaded on demand)

### Documentation
- Comprehensive README with feature overview
- User guide with navigation instructions
- Development guide for contributors
- Design analysis and evaluation documents
- Visualization evaluation methodology

---

## Version History Summary

- **v2.0.0** (2026-01-19): Major UI overhaul - cube root color scale, year heatmap completion, accessibility improvements
- **v1.2.0** (2026-01-18): Date validation, preview workflow, contract year bug fix
- **v1.1.0** (2026-01-18): Multi-year support, quick date picker, enhanced UX
- **v1.0.0** (2026-01-17): Initial public release

## Semantic Versioning Guide

- **Major (X.0.0)**: Breaking changes in visual representation, data interpretation, or user-facing behavior
- **Minor (x.X.0)**: New features, enhancements, non-breaking changes
- **Patch (x.x.X)**: Bug fixes, performance improvements, documentation updates

---

**Current Version**: 2.0.0
**Release Date**: 2026-01-19
**Status**: ✅ Deployed and Live
**URL**: https://joelmlevin.github.io/sdge-rate-explorer/
