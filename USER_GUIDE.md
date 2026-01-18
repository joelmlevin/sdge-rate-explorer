# SDGE Rate Explorer - User Guide

## Quick Start

1. **Open the app** in your browser (currently running at http://localhost:5174)
2. You'll see the **Month View** by default, showing the current month
3. Try the three different designs using the dropdown in the top-right

## Understanding the Interface

### Header
- **Title**: SDGE Rate Calendar
- **Design Selector**: Choose between Minimal Modern, Data-Dense Professional, or Clean Geometric
- **View Buttons**: Day | Week | Month | Year
- **Navigation**: Previous ← | Today | → Next

### Month View (Default)
**What you see:**
- Calendar grid with each day showing:
  - Day number (large, top-left)
  - Rate range in cents (e.g., "4.8-10.4¢")
  - Best export hour (e.g., "@5p")

**How to use:**
- **Hover** over any day to see detailed statistics
- **Click** any day to see hour-by-hour breakdown (Day View)

**What the data means:**
- **Rate range**: Lowest to highest rate for that day
- **Best export hour**: The hour with the highest rate (best time to sell solar back to grid)
- **@5p format**: Time of day (5p = 5:00 PM, 12a = 12:00 AM, etc.)

### Day View
**What you see:**
- Bar chart with 24 bars (one per hour)
- Height of bar = rate for that hour
- Green bar = best hour to export solar

**How to use:**
- **Hover** over any bar to see:
  - Exact time
  - Total rate
  - Generation rate (what you get paid)
  - Delivery rate (what you pay)

**What the data means:**
- Taller bars = higher rates = better time to export solar
- Green bar = optimal export hour
- All rates shown are **total** (generation + delivery combined)

### Week View
**What you see:**
- 7 columns (days of week)
- 24 rows (hours of day)
- Color-coded cells (purple = low, yellow = high)

**How to use:**
- **Hover** over any cell to see exact rate and breakdown
- Look for patterns (e.g., weekends vs weekdays)
- Scan for yellow cells (high rates = good export times)

**What the data means:**
- Each cell = one hour of one day
- Color intensity = rate level
- Weekend columns highlighted with blue background

### Year View
**What you see:**
- 12 cards (one per month)
- Summary statistics for each month

**How to use:**
- **Click** any month card to see that month's calendar
- Compare months to find seasonal patterns

**What the data means:**
- **Days**: Number of days with data
- **Avg Low**: Average daily minimum rate
- **Avg High**: Average daily maximum rate
- **Overall**: Average rate for the entire month

## Understanding the Rates

### What Are "Total Rates"?
The app shows **generation + delivery** combined:
- **Generation rate**: What SDG&E pays you for solar exported to grid
- **Delivery rate**: What you pay SDG&E for electricity delivered from grid
- **Total**: Sum of both (the number you see)

### Why Sum Them?
This gives you the full picture of the rate structure at any time. For battery + solar users:
- High total rate = good time to export solar
- Low total rate = good time to charge battery from grid

### Where's the Breakdown?
Hover over any data point to see generation and delivery rates separately.

## Tips for Solar + Battery Users

### Optimize Battery Usage
1. **Charge battery** during low-rate hours (purple in Week View)
2. **Discharge/export** during high-rate hours (yellow in Week View, green bar in Day View)
3. Look for patterns:
   - Often low rates overnight
   - Often high rates late afternoon/evening

### Plan Ahead
1. Check **Week View** for the upcoming week
2. Identify high-rate periods
3. Plan battery discharge accordingly

### Compare Seasons
1. Use **Year View** to see seasonal patterns
2. Summer months often have higher rates
3. Adjust strategy seasonally

## Design Guide

### Minimal Modern (Default)
- **When to use**: Everyday use, clean interface
- **Pros**: Easy on eyes, clear hierarchy
- **Cons**: Less data visible at once

### Data-Dense Professional
- **When to use**: When you need to see more data
- **Pros**: More information, professional look
- **Cons**: Slightly more cluttered

### Clean Geometric
- **When to use**: When you want strong visual structure
- **Pros**: Maximum contrast, bold and clear
- **Cons**: Very stark, not for everyone

## Keyboard Shortcuts (Future)
*Not yet implemented, coming soon:*
- `←` / `→` : Navigate previous/next
- `T` : Go to today
- `D` / `W` / `M` / `Y` : Switch view mode

## FAQ

**Q: Why don't I see my own usage data?**
A: This shows SDGE rate schedules, not your personal usage. It helps you understand when rates are high/low.

**Q: What's the difference between generation and delivery?**
A: Generation = what SDGE pays you for solar. Delivery = what you pay SDGE for electricity from grid. The app shows the sum.

**Q: Why are some hours missing data?**
A: The dataset may not include all hours. Gray cells indicate no data available.

**Q: Can I export this data?**
A: Not yet in V2, coming soon. You'll be able to export to CSV.

**Q: Does this work on mobile?**
A: It works but isn't optimized yet. Desktop is recommended for now.

**Q: How current is the data?**
A: The app uses the SDGE rate schedule from the CSV file. Check the date range in the data.

## Support

For issues or questions:
1. Check this guide first
2. Review the technical documentation (V2_REDESIGN_COMPLETE.md)
3. Report issues or suggest features

## Version Info

**Current Version**: V2 (Complete Redesign)
**Last Updated**: January 2026
**Features**: 3 designs, 4 view modes, hover tooltips, navigation
