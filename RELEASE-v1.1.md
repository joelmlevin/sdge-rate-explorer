# Release Notes - v1.1 Multi-Year Contract Support

**Release Date**: 2026-01-18
**Live URL**: https://joelmlevin.github.io/sdge-rate-explorer/
**Branch**: `main` (merged from `v1.1-multi-year`)

## 🎉 Major Features

### Multi-Year Contract Support
The application now supports all 4 SDGE Net Billing Tariff contract years:
- **NBT23** (2023) - For customers who submitted solar applications in 2023
- **NBT24** (2024) - For customers who submitted solar applications in 2024
- **NBT25** (2025) - For customers who submitted solar applications in 2025 *(default)*
- **NBT26** (2026) - For customers who submitted solar applications in 2026

### Enhanced User Experience
- **Prominent Contract Year Selector**: Blue-accented dropdown with clear labeling
- **View Mode Persistence**: Switching contract years preserves your current view (Day/Week/Month/Year)
- **Date Context Preservation**: Dates adjust intelligently when switching years (e.g., Feb 2025 → Feb 2026)
- **Fast Loading**: Each year's data (~7 MB) loads in ~200ms with intelligent caching
- **Smooth Transitions**: Loading indicator in dropdown, no full-page reloads after initial load

## 🔧 Technical Improvements

### Data Architecture
- **Separate JSON files per contract year**:
  - `rates-2023.json` (7.0 MB) - NBT23 data (2024-2043)
  - `rates-2024.json` (7.0 MB) - NBT24 data (2024-2043)
  - `rates-2025.json` (6.8 MB) - NBT25 data (2025-2044)
  - `rates-2026.json` (6.8 MB) - NBT26 data (2026-2045)
- **Year-specific caching**: Each year cached separately for instant switching
- **Total deployment size**: ~27 MB (all 4 years)

### State Management
- **Component preservation**: CalendarExplorerV2 remains mounted during year switches
- **Local state persistence**: viewMode, selectedDate, selectedMonth, selectedYear all preserved
- **Loading optimization**: Full-screen loader only shown on initial app load
- **Error handling**: Graceful fallback if year data fails to load

### Date Handling
- **dataStartYear tracking**: Accounts for different data start years per contract
  - NBT23: starts 2024
  - NBT24: starts 2024
  - NBT25: starts 2025
  - NBT26: starts 2026
- **Smart date offsetting**: Maintains relative position in dataset when switching years

## 📝 Content Updates

### Language Improvements
- Changed "signed contract" → "submitted solar application" throughout
- More accurate terminology matching SDGE's process

### Rate Code Consistency
- All years now follow consistent naming: NBT23, NBT24, NBT25, NBT26
- Previously 2025 and 2026 were inconsistently labeled as NBT00

## 🐛 Bug Fixes

### View Mode Persistence (commit e9da66e)
**Issue**: Switching contract years returned to week view instead of maintaining current view

**Root Cause**: App.tsx unmounted CalendarExplorerV2 during year switches by showing full-screen loading spinner

**Fix**:
- Track initial load separately with `initialLoadComplete` state
- Only show full-screen loader during initial app load
- Keep CalendarExplorerV2 mounted during year switches
- ContractYearSelector provides loading feedback via spinner icon

### Date Context Persistence (commit 4eb584d)
**Issue**: When switching years, dates didn't adjust (Feb 2025 stayed Feb 2025 when switching to NBT26)

**Fix**:
- Added `dataStartYear` property to track where each dataset begins
- Calculate year offset based on data start years
- Apply offset to selectedYear and selectedDate
- Result: Feb 2025 (NBT25) → Feb 2026 (NBT26) automatically

## 📦 Deployment

### Build & Deploy Process
1. Merged `v1.1-multi-year` → `main`
2. Built production bundle: `npm run build`
3. Deployed to GitHub Pages: `npm run deploy`
4. Published to: https://joelmlevin.github.io/sdge-rate-explorer/

### Bundle Size
- Main bundle: ~302 KB (gzipped: ~91 KB)
- CSS: ~11 KB (gzipped: ~2.4 KB)
- Total initial load: ~93 KB gzipped

### Data Files (loaded on demand)
- rates-2023.json: 7.0 MB
- rates-2024.json: 7.0 MB
- rates-2025.json: 6.8 MB (loaded by default)
- rates-2026.json: 6.8 MB

## 🧪 Testing

All test cases from TESTING.md verified:
- ✅ View mode persists when switching contract years
- ✅ Date context updates correctly (Feb 2025 → Feb 2026)
- ✅ All 4 contract years load successfully
- ✅ Navigation works correctly after year switches
- ✅ Dropdown is prominent and accessible
- ✅ Loading indicators work properly
- ✅ Mobile responsive design maintained

## 📚 Documentation

Updated files:
- `/webapp/README.md` - Complete feature documentation
- `/webapp/scripts/README.md` - Preprocessing instructions for all 4 years
- `/TESTING.md` - Comprehensive test plan
- `/RELEASE-v1.1.md` - This release document

## 🔄 Migration Notes

### For Users
- No action required - app automatically loads with NBT25 (2025) as default
- Use the Contract Year dropdown to select your applicable year
- All your existing bookmarks and links will continue to work

### For Developers
If you're working on this codebase:
1. All 4 contract years must be preprocessed before deployment
2. Run `cd scripts && ./preprocess-all-years.sh` to generate all JSON files
3. Each JSON file must be in `/webapp/public/` for deployment
4. See `/webapp/scripts/README.md` for detailed preprocessing instructions

## 🎯 Next Steps

Potential future enhancements:
- [ ] URL parameter support for deep-linking (`?year=2023`)
- [ ] Automatic year detection based on browser date
- [ ] Year comparison view (side-by-side)
- [ ] Service Worker for offline caching
- [ ] Preloading adjacent years in background

## 🙏 Credits

- SDGE for providing rate data
- California Public Utilities Commission (CPUC) for rate structure

---

**Version**: v1.1
**Date**: 2026-01-18
**Commits**: 7 commits from v1.0 to v1.1
**Status**: ✅ Deployed and Live
