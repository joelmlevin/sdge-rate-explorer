# Data Files

## rates.csv

This file is **not included in the repository** due to its size (38 MB).

### To run this application locally:

1. Obtain the SDGE rate data file (Current Year NBT Pricing Upload from MIDAS)
2. Place it in this directory as `rates.csv`
3. The file should contain columns: `StartDate`, `ValueName`, `Cost`, etc.

### Quick Setup

If you have the data file in the parent directory, copy it:

```bash
cp "../Current Year NBT Pricing Upload MIDAS.csv" ./public/rates.csv
```

### File Format

The CSV should contain SDGE rate pricing data with the following structure:
- **StartDate**: UTC timestamp for the rate period
- **ValueName**: Hour identifier (e.g., "HS1", "HS2", etc.)
- **Cost**: Rate in dollars per kWh
- Additional columns for generation and delivery rates

### Note

This application converts UTC timestamps to Pacific Time and provides hourly rate visualization for optimizing solar battery charging and grid export timing.
