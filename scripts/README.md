# SDGE Rate Data Preprocessing

This directory contains tools for converting SDGE rate data from the original 38 MB CSV format into optimized 6.8-7.0 MB JSON files for multiple contract years (2023, 2024, 2025, 2026).

## Why Preprocessing?

The original SDGE rate CSV file is:
- **38 MB** in size
- Contains **350,640 rows** with redundant data
- Requires **5-10 seconds** to parse in the browser
- Too large for efficient GitHub Pages hosting

The optimized JSON format is:
- **6.8 MB** (82% smaller)
- Contains **175,300 combined hourly rates**
- Loads in **~200ms** (50x faster)
- Perfect for GitHub Pages deployment

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Access to SDGE rate data CSV files for contract years

### Generate Optimized Data

**Process All Contract Years:**
```bash
./preprocess-all-years.sh
```

**Process Individual Contract Year:**
```bash
node preprocess-rates.js <input.csv> <output.json> <contractYear>

# Examples:
node preprocess-rates.js \
  "../../LY2023 NBT Pricing Upload MIDAS/LY2023 NBT Pricing Upload MIDAS.csv" \
  "../public/rates-2023.json" \
  2023

node preprocess-rates.js \
  "../../LY2024 NBT Pricing Upload MIDAS/LY2024 NBT Pricing Upload MIDAS.csv" \
  "../public/rates-2024.json" \
  2024

node preprocess-rates.js \
  "../../Current Year NBT Pricing Upload MIDAS.csv" \
  "../public/rates-2025.json" \
  2025

node preprocess-rates.js \
  "../../LY2026 NBT Pricing Upload MIDAS/Current Year NBT Pricing Upload MIDAS.csv" \
  "../public/rates-2026.json" \
  2026
```

### Output Files
- `../public/rates-2023.json` (7.0 MB) - 2023 contract year
- `../public/rates-2024.json` (7.0 MB) - 2024 contract year
- `../public/rates-2025.json` (6.8 MB) - 2025 contract year
- `../public/rates-2026.json` (6.8 MB) - 2026 contract year

## Optimization Techniques

### 1. Row Combination
**Before**: 2 rows per hour (generation + delivery)
```csv
USCA-XXSD-NB00-0000,NBT00,1/1/2025,8:00:00,...,0.082907,... (generation)
USCA-XXDL-NB00-0000,NBT00,1/1/2025,8:00:00,...,0.053421,... (delivery)
```

**After**: 1 array per hour
```json
["2025-01-01", 8, 0.0829, 0.0534, 0.1363, "h"]
```

### 2. Field Compression
- Object keys → Array indices (no repeated keys)
- Long keys (`"generation"`) → Short codes (`g`)
- Day types: `"weekday"/"weekend"/"holiday"` → `"w"/"e"/"h"`

### 3. Precision Reduction
- Reduced to 4 decimal places (sufficient for rate display)
- From: `0.082907` → To: `0.0829`

### 4. Data Pre-calculation
- UTC → Pacific Time conversion done once
- Total rates pre-calculated (generation + delivery)
- Day types pre-determined

## Output Format

### JSON Structure
```json
{
  "meta": {
    "generated": "2026-01-17",
    "version": "2.0",
    "dateRange": ["2025-01-01", "2044-12-31"],
    "totalHours": 175300,
    "totalDays": 7305,
    "description": "Optimized SDGE rate data",
    "format": "Array format: [date, hour, generation, delivery, total, dayType]",
    "fields": ["date", "hour", "generation", "delivery", "total", "dayType"],
    "dayTypes": {
      "w": "weekday",
      "e": "weekend",
      "h": "holiday"
    }
  },
  "data": [
    ["2025-01-01", 0, 0.0829, 0.0534, 0.1363, "h"],
    ["2025-01-01", 1, 0.0841, 0.0546, 0.1387, "h"],
    ...
  ]
}
```

### Array Format (per hour)
```
[
  date,        // string: "YYYY-MM-DD" (Pacific Time)
  hour,        // number: 0-23 (Pacific Time)
  generation,  // number: generation rate ($/kWh)
  delivery,    // number: delivery rate ($/kWh)
  total,       // number: total rate ($/kWh)
  dayType      // string: "w"=weekday, "e"=weekend, "h"=holiday
]
```

## Performance Comparison

| Metric | CSV (Before) | JSON (After) | Improvement |
|--------|--------------|--------------|-------------|
| File Size | 38.02 MB | 6.82 MB | 82.1% smaller |
| Rows/Entries | 350,640 | 175,300 | 50% fewer |
| Parse Time | ~5-10 sec | ~200ms | 50x faster |
| Memory Usage | ~200 MB | ~20 MB | 10x less |

## Contract Year Variations

All contract years have identical schema but minor formatting differences:

| Feature | LY2023 | LY2024 | 2025 | LY2026 |
|---------|--------|--------|------|--------|
| BOM marker | ✓ | ✓ | ✗ | ✗ |
| Trailing commas | ✓ | ✓ | ✗ | ✗ |
| TimeEnd format | `:00` | `:00` | `:59` | `:59` |
| Unit capitalization | Export | Export | export | export |
| RateName | NBT23 | NBT24 | NBT00 | NBT00 |

The preprocessing script handles all these variations automatically.

## When to Regenerate

Update the preprocessed data when:
1. SDGE releases new rate schedules
2. Rate structure changes
3. You need data for additional years

## Updating the Webapp

After regenerating `rates.json`:

```bash
# 1. Generate new data
cd scripts
npm run preprocess

# 2. Test locally
cd ../webapp
npm run dev

# 3. Build and deploy
npm run build
npm run deploy
```

## Troubleshooting

### "Input file not found"
Ensure the SDGE CSV file is in the parent directory with the correct name:
```
/sdge usage/
  ├── Current Year NBT Pricing Upload MIDAS.csv  ← Must be here
  ├── scripts/
  └── webapp/
```

### "Parse error"
Check that the CSV file has the expected format with these columns:
- RIN, RateName, DateStart, TimeStart, DayStart, ValueName, Value

### Output file too large
The optimized file should be around 6-7 MB. If much larger:
- Check for duplicate rows in source CSV
- Verify preprocessing script is combining generation+delivery rows

## Technical Details

### UTC to Pacific Time Conversion
The script automatically handles:
- Daylight Saving Time transitions
- Timezone offset calculations
- Date boundary adjustments

### Hour Parsing
Uses the `ValueName` field (e.g., "Jan Weekend HS14") as the authoritative source for hours, as it's more reliable than UTC timestamp conversion.

### Day Type Determination
- `DayStart = 8`: Holiday
- `DayStart = 6 or 7`: Weekend
- `DayStart = 1-5`: Weekday

## License

MIT License - see ../webapp/LICENSE for details
