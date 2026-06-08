# Rate Data Preprocessing

Converts SDG&E's "NBT Pricing Upload MIDAS" CSVs into the per-contract-year JSON the webapp loads (`../public/rates-<year>.json`).

## Usage

```bash
cd webapp/scripts
npm install                 # installs csv-parse
./preprocess-all-years.sh   # regenerate all four years
```

One year at a time:

```bash
node preprocess-rates.js <input.csv> <output.json> <year>
# e.g.
node preprocess-rates.js "../../Current Year NBT Pricing Upload MIDAS.csv" ../public/rates-2025.json 2025
```

Source CSVs live at the repo root (one level above `webapp/`):

| Year | Source CSV |
|------|-----------|
| 2023 | `LY2023 NBT Pricing Upload MIDAS/LY2023 NBT Pricing Upload MIDAS.csv` |
| 2024 | `LY2024 NBT Pricing Upload MIDAS/LY2024 NBT Pricing Upload MIDAS.csv` |
| 2025 | `Current Year NBT Pricing Upload MIDAS.csv` |
| 2026 | `LY2026 NBT Pricing Upload MIDAS/Current Year NBT Pricing Upload MIDAS.csv` |

After regenerating, redeploy the webapp (`cd .. && npm run deploy`).

## Output format

Each file is `{ meta, data }`; every `data` entry is a compact array:

```
[date, hour, generation, delivery, total, dayType]
// ["2025-01-01", 0, 0.0829, 0.0007, 0.0836, "h"]
```

- `date` — `YYYY-MM-DD` (Pacific) · `hour` — 0–23 (Pacific)
- `generation` / `delivery` / `total` — $/kWh, 4 dp
- `dayType` — `w` weekday · `e` weekend · `h` holiday

## How it works

- **Time:** MIDAS `DateStart`+`TimeStart` are **UTC**; the script converts to Pacific (`America/Los_Angeles`, DST-aware) and takes the Pacific clock hour from the `ValueName` `HS` field. ⚠️ `DateStart` is the **UTC** date, not Pacific — don't drop the conversion, or evening rates land on the wrong day.
- **Components:** two rows per hour, summed into `total` — generation (`RIN` contains `XXSD`) + delivery (`RIN` contains `SDXX`).
- **Day type:** from `DayStart` — 8 = holiday, 6–7 = weekend, 1–5 = weekday.
- Per-year format quirks (UTF-8 BOM, trailing commas) are handled automatically.

## License

PolyForm Noncommercial 1.0.0 — see [`../LICENSE`](../LICENSE).
