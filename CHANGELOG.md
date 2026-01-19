# Changelog

All notable changes to the SDGE Rate Explorer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-19

### Added
- **Year Heatmap**: Complete hourly rate visualization across entire year (365 days × 24 hours)
  - Dynamic cell width scaling based on browser window size
  - Interactive tooltips showing date, hour, and rate details
  - Click cells to navigate to week view for detailed analysis
  - Month labels at top for easy navigation
  - Vertical legend with color scale and rate range
  - Cube root color transformation for optimal perceptual discrimination across full range

### Changed
- **Color Scale Improvements**: Replaced logarithmic scale with cube root transformation
  - Shows full data range (not clipped at 99th percentile)
  - Better discrimination across all rate values
  - Purple (low) → Teal (medium) → Yellow (high) gradient

- **Week View Enhancements**:
  - Dynamic text color based on background luminance for optimal readability
  - Black text on light backgrounds, white text on dark backgrounds
  - Improved tooltip visibility with nearly opaque white background (98% opacity)
  - Optimized cell widths: reduced minimum width from 900px to 600px (33% improvement)
  - More efficient space utilization with `minmax(70px, 1fr)` columns

- **Month View Updates**:
  - Changed peak hour format from cryptic "@6p" to clear "Peak: 6pm"
  - More intuitive and self-explanatory labeling

- **Hour Label Standardization**:
  - Year heatmap now uses consistent format: 12a, 2a, 4a, 6a, 8a, 10a, 12p, 2p, etc.
  - Shows labels every 2 hours for cleaner appearance

### Removed
- **Simplified UI**: Removed informational panels for cleaner interface
  - Removed "About the Data" panels from all calendar views
  - Removed "Battery Strategy" recommendations from daily views
  - Focus on data visualization without prescriptive guidance

### Fixed
- Year heatmap vertical spacing removed for solid gradient appearance
- Week view rate text now readable on all background colors (especially dark purple)
- Month label alignment in year heatmap
- TypeScript compilation errors from unused variables

### Technical
- Implemented perceptual luminance calculation for dynamic text color (WCAG formula)
- Optimized grid layout with CSS `minmax()` for responsive scaling
- Full range color mapping with cube root transformation
- Removed hardcoded percentile clipping

---

## [0.1.0] - Initial Development

### Added
- Initial calendar explorer with year, month, week, and day views
- Rate data visualization for SDGE NBT25 plan
- Multiple design themes (minimal, vibrant, professional)
- Interactive date navigation
- Rate heatmaps and bar charts
- Hover tooltips with detailed rate breakdowns
- Generation and delivery rate components displayed separately
