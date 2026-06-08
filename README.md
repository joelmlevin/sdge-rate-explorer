# SDGE Rate Explorer

[![GitHub](https://img.shields.io/badge/GitHub-joelmlevin%2Fsdge--rate--explorer-blue?logo=github)](https://github.com/joelmlevin/sdge-rate-explorer)

Visualize San Diego Gas & Electric (SDG&E) solar **export (buyback) rates** by hour across contract years — built for solar + battery owners deciding when to export versus store power.

**Live app:** https://joelmlevin.github.io/sdge-rate-explorer/

## Features

- **Contract-year selector** (2023–2026 / NBT23–NBT26)
- **Day / Week / Month / Year views** — color-coded hourly rates and a full-year heatmap
- **Rate-component toggle** — Total, Generation, or Delivery (Total by default)
- Best-hour highlighting, hover tooltips, and CSV export

## Which contract year?

Pick the year you submitted your SDG&E solar application — it fixes your rate schedule for the life of the agreement:

| Year | Schedule |
|------|----------|
| 2023 | NBT23 |
| 2024 | NBT24 |
| 2025 | NBT25 *(default)* |
| 2026 | NBT26 |

## Data

Rates are preprocessed from SDG&E's "NBT Pricing Upload MIDAS" CSVs into one JSON file per contract year (`public/rates-<year>.json`), combining the generation + delivery components and converting times from **UTC to Pacific (PST/PDT)**. To regenerate or add a year, see [`scripts/README.md`](scripts/README.md).

## Development & deploy

```bash
npm install
npm run dev      # dev server at localhost:5173
npm run build    # production build
npm run deploy   # build + publish to GitHub Pages
```

Deploys are **manual and run from `main`**; the live site is GitHub Pages serving the `gh-pages` branch.

## Tech stack

React 19 · TypeScript · Vite · React Router · Zustand · Tailwind CSS · date-fns

## License

PolyForm Noncommercial 1.0.0 — noncommercial use only; commercial use requires a separate license (see [`COMMERCIAL-LICENSE.md`](COMMERCIAL-LICENSE.md)).

Author: Joel Levin
