# Mobile Responsiveness Testing Guide

## Version: 2.2.0 - Mobile Responsive Update

This document outlines the mobile responsiveness improvements and testing procedures for the SDG&E Rate Explorer.

---

## Changes Summary

### Critical Fixes (Breaking Mobile Issues)

1. **ContractYearSelector** - Fixed dropdown overflow
   - Before: Fixed `w-96` (384px) width overflowed on mobile
   - After: `w-[calc(100vw-2rem)] sm:w-96 max-w-md` - responsive width
   - Touch targets: Added `min-h-[44px]` to all interactive elements

2. **YearHeatmap** - Major mobile optimization
   - Hour label width: Reduced from 48px → 32px for mobile
   - Legend layout: Changed from vertical-only to `flex-col md:flex-row` (horizontal on mobile, vertical on desktop)
   - Padding: Responsive `p-4 sm:p-6 md:p-8`
   - Cell width calculation: Adjusted for smaller hour labels and responsive padding

3. **WeekViewV3** - Fixed grid overflow
   - Grid template: Changed from `'60px repeat(7, minmax(70px, 1fr))'` → `'minmax(40px, 60px) repeat(7, 1fr)'`
   - Before: Required 550px minimum width
   - After: Fits on 320px screens
   - Touch targets: All interactive elements min 44px height

4. **Navigation** - Responsive header
   - Title: `text-base sm:text-lg md:text-xl` (was fixed `text-xl`)
   - Layout: Added `gap-2` and `flex-1 min-w-0` for better space management
   - Height: Changed from fixed `h-16` → `min-h-[60px] py-2`

### Layout Improvements

5. **CalendarExplorerV2** - Responsive controls
   - Controls: `flex-col sm:flex-row` - stack vertically on mobile
   - View buttons: `px-2 sm:px-4` - smaller on mobile
   - Touch targets: All buttons `min-h-[44px]`

6. **MonthViewV2** - Optimized calendar grid
   - Header: `px-4 sm:px-8 py-4 sm:py-6`
   - Title: `text-2xl sm:text-3xl`
   - Grid automatically responsive (7 columns always)

7. **DayViewV2** - Better chart layout
   - Stats: `flex-col sm:flex-row` with `gap-4 sm:gap-8`
   - Header: `text-2xl sm:text-3xl`
   - Padding: `p-4 sm:p-8`

8. **YearViewV2** - Responsive grid columns
   - Grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` (was fixed 4 cols)
   - Before: 4 columns @ ~200px each = 800px minimum
   - After: 2 columns on mobile, scales to 3/4 on larger screens

---

## Testing Checklist

### Test Viewports

Test on the following viewport sizes:
- ✅ **320px** - iPhone SE (smallest modern phone)
- ✅ **375px** - iPhone 12/13/14 standard
- ✅ **414px** - iPhone 12/13/14 Max
- ✅ **768px** - iPad portrait
- ✅ **1024px** - iPad landscape

### Component-Specific Tests

#### 1. Navigation (All Pages)
- [ ] Title text truncates properly on narrow screens
- [ ] Contract year selector dropdown doesn't overflow screen
- [ ] Dropdown menu is fully tappable (44px minimum height)
- [ ] Header height adjusts properly without cutting off content

#### 2. Year Heatmap View
- [ ] Heatmap scrolls horizontally on mobile without breaking layout
- [ ] Legend appears **above** heatmap on mobile (order-first)
- [ ] Legend switches to **horizontal** layout on mobile
- [ ] Month labels are readable (though small, they should be visible)
- [ ] Hour labels fit in 32px column without overlapping
- [ ] Cell tooltips appear on tap/hover and don't go off-screen
- [ ] Zoom/pinch works on mobile browsers

#### 3. Week View
- [ ] Grid fits within viewport without horizontal overflow at 375px
- [ ] All 7 day columns visible without scrolling
- [ ] Day headers are readable and don't wrap
- [ ] Hour cells are tappable (44px height)
- [ ] Cell text is legible at small sizes
- [ ] Color legend at top is visible and readable

#### 4. Month View
- [ ] Calendar grid shows all 7 days without overflow
- [ ] Date numbers are large and readable (text-3xl)
- [ ] Rate ranges and peak hours are legible
- [ ] Cells are tappable for bar chart view
- [ ] Bar charts display properly when cell is tapped

#### 5. Day View
- [ ] Stats section stacks vertically on mobile
- [ ] 24-hour bar chart is readable
- [ ] Bars are wide enough to see colors
- [ ] Hour labels don't overlap
- [ ] Tooltip appears on tap without going off-screen

#### 6. Year View (12-month grid)
- [ ] Shows 2 columns on mobile (not 4)
- [ ] Each month card has enough space for content
- [ ] Scales to 3 columns on tablet, 4 on desktop
- [ ] Month cards are tappable to navigate

#### 7. Controls (View Switcher)
- [ ] View mode buttons (Day/Week/Month/Year) stack on very small screens
- [ ] Buttons are tappable (44px minimum height)
- [ ] Previous/Next buttons work and are large enough to tap
- [ ] Date picker modal fits on screen
- [ ] Selected view is clearly indicated

---

## Browser Testing

### iOS Safari
- [ ] Test on iPhone 12/13 (375px)
- [ ] Test on iPhone 12/13 Max (414px)
- [ ] Verify touch gestures work (tap, pinch-zoom on heatmap)
- [ ] Check that viewport meta tag prevents zoom issues

### Android Chrome
- [ ] Test on Pixel 5 (393px)
- [ ] Test on Samsung Galaxy (360px)
- [ ] Verify touch targets are accessible

### Desktop Browsers (Responsive Mode)
- [ ] Chrome DevTools responsive mode (320px-768px)
- [ ] Firefox responsive design mode
- [ ] Safari responsive design mode

---

## Performance Considerations

### Mobile-Specific Performance
- [ ] Year heatmap loads without lag on mobile (365 days × 24 hours = 8,760 cells)
- [ ] Scrolling is smooth (no jank)
- [ ] Touch interactions respond immediately
- [ ] No layout shifts during page load

### Bundle Size
- No additional JavaScript added for mobile
- Only CSS/Tailwind classes for responsiveness
- Mobile users download same bundle as desktop

---

## Accessibility

### Touch Targets (WCAG 2.5.5)
- Minimum touch target size: **44px × 44px**
- All buttons, links, and interactive elements meet this standard
- Adequate spacing between touch targets (minimum 8px)

### Text Readability
- Minimum font size on mobile: 10px (for dense data like hour labels)
- Body text: 14px minimum
- Headers scale appropriately

### Color Contrast
- All existing color contrast ratios maintained
- No changes to color palette

---

## Known Limitations

### Year Heatmap on Very Small Screens (320px)
- Cells become 1-2px wide on 320px screens
- Still functional but very dense
- Consider adding a "mobile view" toggle in future for simplified yearly overview

### Week View on 320px
- 7 columns @ ~40px each = very tight
- Still usable but information density is high
- Text may be difficult to read for users with vision impairments

---

## Future Improvements (v2.3.0+)

Potential mobile enhancements for future releases:

1. **Simplified Mobile Views**
   - Year view: Show monthly summary instead of full heatmap
   - Week view: Option to show 3-4 days at a time with swipe gesture

2. **Touch Gestures**
   - Swipe left/right to navigate dates
   - Pinch-to-zoom on heatmap
   - Long-press for details

3. **Mobile-Specific Features**
   - "Today" button for quick navigation
   - Landscape mode optimization
   - Dark mode (easier on eyes for mobile users)

4. **Progressive Web App (PWA)**
   - Installable on mobile home screen
   - Offline data caching
   - Push notifications for rate changes

---

## Testing Commands

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing in Chrome DevTools
1. Open DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Select preset devices or enter custom dimensions
4. Test all views at each breakpoint

### Testing on Real Devices
1. Find local IP: `ifconfig` (Mac/Linux) or `ipconfig` (Windows)
2. Run `npm run dev`
3. Access from mobile: `http://[your-ip]:5173`
4. Test all functionality with real touch input

---

## Sign-Off Checklist

Before merging mobile-responsive branch:

- [ ] All viewports tested (320px-768px)
- [ ] Touch targets verified (44px minimum)
- [ ] No horizontal overflow on any view
- [ ] Text is readable on all screen sizes
- [ ] All interactive elements work with touch
- [ ] Performance is acceptable on mobile devices
- [ ] Builds without errors
- [ ] CHANGELOG updated
- [ ] Version bumped to 2.2.0

---

## Regression Testing

Ensure desktop experience is not degraded:

- [ ] Desktop layout unchanged at 1024px+
- [ ] All existing features work
- [ ] No visual regressions
- [ ] Performance not impacted

---

**Test Status**: Ready for Testing
**Target Release**: v2.2.0
**Branch**: `mobile-responsive`
