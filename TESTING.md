# Testing Plan - v1.1 Multi-Year Support

## Test 1: View Mode Persistence (FIXED in commit e9da66e)

**Issue**: Switching contract years was returning to week view instead of maintaining current view mode.

**Root Cause**: App.tsx was unmounting CalendarExplorerV2 whenever `isLoading` was true, which reset all local state.

**Fix**: Only show full-screen loading spinner during initial app load. After that, keep CalendarExplorerV2 mounted during year switches.

**Test Steps**:
1. Start dev server: `npm run dev`
2. Navigate to Month view
3. Select February 2025
4. Switch contract year to NBT26 using dropdown
5. **Expected**: Should show February 2026 in Month view
6. **Actual**: (test and report result)

**Additional Test Cases**:
- Switch from Year view in 2025 to NBT24 → should show Year view for 2024
- Switch from Day view on Feb 15, 2025 to NBT26 → should show Day view for Feb 15, 2026
- Switch from Week view to different contract year → should stay in Week view

## Test 2: Date Context Persistence (FIXED in commit 4eb584d)

**Test Steps**:
1. Navigate to Month view
2. Select February 2025
3. Switch to NBT23
4. **Expected**: Should show February 2024 (NBT23 data starts in 2024)
5. Switch to NBT26
6. **Expected**: Should show February 2026

**Data Start Years**:
- NBT23: starts in 2024
- NBT24: starts in 2024
- NBT25: starts in 2025
- NBT26: starts in 2026

## Test 3: Contract Year UI (FIXED in commits a41e20f, bd3c334)

**Test Steps**:
1. Check dropdown shows all 4 years with correct labels:
   - 2023 (NBT23)
   - 2024 (NBT24)
   - 2025 (NBT25) ✓ (default)
   - 2026 (NBT26)
2. Verify dropdown is prominent (blue borders, larger size)
3. Check helper text says "submitted solar application" (not "signed contract")
4. Verify loading spinner shows in dropdown during year switch

## Test 4: All Contract Years Load

**Test Steps**:
1. Switch to NBT23 → verify data loads successfully
2. Switch to NBT24 → verify data loads successfully
3. Switch to NBT25 → verify data loads successfully
4. Switch to NBT26 → verify data loads successfully

**Expected**: Each year should load in ~200ms (may be longer on first load)

## Test 5: Navigation After Year Switch

**Test Steps**:
1. Start in Month view, February 2025, NBT25
2. Switch to NBT26 → should show February 2026
3. Click "Previous" button
4. **Expected**: Should show January 2026 (not January 2025)
5. Click "Next" button twice
6. **Expected**: Should show March 2026

## Test 6: Mobile Responsiveness

**Test Steps**:
1. Resize browser to mobile width (375px)
2. Verify contract year dropdown is still accessible
3. Test all view modes work on mobile
4. Verify year switching works on mobile

## Test 7: Performance

**Metrics to check**:
- Initial load: < 500ms
- Switch to cached year: < 50ms (instant)
- Switch to uncached year: < 500ms
- Memory per year: ~20 MB

**Test Steps**:
1. Open browser dev tools → Network tab
2. Hard refresh (Cmd+Shift+R)
3. Check rates-2025.json loads in < 500ms
4. Switch to NBT26
5. Check rates-2026.json loads in < 500ms
6. Switch back to NBT25
7. Should be instant (cached)

## Known Issues

None currently. All reported issues have been fixed.

## Deployment Checklist

Before deploying to GitHub Pages:
- [ ] All test cases pass locally
- [ ] No console errors
- [ ] All 4 contract years load successfully
- [ ] View mode persists when switching years
- [ ] Date context updates correctly when switching years
- [ ] Build completes successfully: `npm run build`
- [ ] Preview build works: `npm run preview`
- [ ] Deploy: `npm run deploy`
