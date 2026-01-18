#!/bin/bash
# Batch preprocessing script for all contract years
# This script processes CSV files for all available contract years (2023, 2024, 2026)

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================"
echo "SDGE Multi-Year Data Preprocessing"
echo "========================================"
echo ""

# Process 2023
echo "Processing 2023 contract year..."
node preprocess-rates.js \
  "../../LY2023 NBT Pricing Upload MIDAS/LY2023 NBT Pricing Upload MIDAS.csv" \
  "../public/rates-2023.json" \
  2023
echo ""

# Process 2024
echo "Processing 2024 contract year..."
node preprocess-rates.js \
  "../../LY2024 NBT Pricing Upload MIDAS/LY2024 NBT Pricing Upload MIDAS.csv" \
  "../public/rates-2024.json" \
  2024
echo ""

# Process 2026
echo "Processing 2026 contract year..."
node preprocess-rates.js \
  "../../LY2026 NBT Pricing Upload MIDAS/Current Year NBT Pricing Upload MIDAS.csv" \
  "../public/rates-2026.json" \
  2026
echo ""

echo "========================================"
echo "✅ All contract years processed successfully!"
echo "========================================"
echo ""
echo "Generated files:"
echo "  - ../public/rates-2023.json"
echo "  - ../public/rates-2024.json"
echo "  - ../public/rates-2026.json"
