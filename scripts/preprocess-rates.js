#!/usr/bin/env node
/**
 * SDGE Rate Data Preprocessor
 *
 * Converts the 38 MB SDGE CSV file into an optimized JSON format
 * Reduces file size by ~95% (38 MB → 1-2 MB)
 *
 * Usage:
 *   node preprocess-rates.js [input.csv] [output.json]
 *
 * Default:
 *   Input: ../Current Year NBT Pricing Upload MIDAS.csv
 *   Output: ../webapp/public/rates.json
 */

import fs from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse command line arguments
const inputPath = process.argv[2] || path.join(__dirname, '../Current Year NBT Pricing Upload MIDAS.csv');
const outputPath = process.argv[3] || path.join(__dirname, '../webapp/public/rates.json');

console.log('SDGE Rate Data Preprocessor');
console.log('===========================');
console.log(`Input:  ${inputPath}`);
console.log(`Output: ${outputPath}`);
console.log('');

// Check if input file exists
if (!fs.existsSync(inputPath)) {
  console.error(`❌ Error: Input file not found: ${inputPath}`);
  process.exit(1);
}

// Helper: Convert UTC timestamp to Pacific Time
function utcToPacific(dateStr, timeStr) {
  // Parse date: "M/D/YYYY"
  const [month, day, year] = dateStr.split('/').map(Number);

  // Parse time: "H:MM:SS"
  const [hour, minute, second] = timeStr.split(':').map(Number);

  // Create UTC date
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  // Convert to Pacific Time (UTC-8 or UTC-7 for DST)
  // JavaScript handles DST automatically
  const pacificDate = new Date(utcDate.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));

  // Format as YYYY-MM-DD
  const pacificYear = pacificDate.getFullYear();
  const pacificMonth = String(pacificDate.getMonth() + 1).padStart(2, '0');
  const pacificDay = String(pacificDate.getDate()).padStart(2, '0');
  const date = `${pacificYear}-${pacificMonth}-${pacificDay}`;

  // Get hour (0-23)
  const pacificHour = pacificDate.getHours();

  return { date, hour: pacificHour };
}

// Helper: Get day type from DayStart value
function getDayType(dayStart) {
  if (dayStart === 8) return 'holiday';
  if (dayStart === 6 || dayStart === 7) return 'weekend';
  return 'weekday';
}

// Helper: Parse hour from ValueName (e.g., "Jan Weekend HS14" → 14)
function parseHourFromValueName(valueName) {
  const match = valueName.match(/HS(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

console.log('📖 Reading CSV file...');
const startRead = Date.now();

// Read CSV file
const csvContent = fs.readFileSync(inputPath, 'utf-8');

console.log(`✅ Read complete (${((Date.now() - startRead) / 1000).toFixed(2)}s)`);
console.log('');
console.log('🔄 Parsing and processing...');
const startProcess = Date.now();

// Parse CSV
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  cast: (value, context) => {
    // Convert numeric values
    if (context.column === 'Value' || context.column === 'DayStart' || context.column === 'DayEnd') {
      return parseFloat(value);
    }
    return value;
  }
});

console.log(`  Found ${records.length.toLocaleString()} rows`);

// Group by date + hour
const grouped = {};
let processedCount = 0;
let skippedCount = 0;

for (const row of records) {
  // Skip invalid rows
  if (!row.DateStart || !row.TimeStart || row.Value === undefined) {
    skippedCount++;
    continue;
  }

  // Convert UTC to Pacific Time
  const { date, hour } = utcToPacific(row.DateStart, row.TimeStart);

  // Use hour from ValueName as fallback (more reliable)
  const valueNameHour = parseHourFromValueName(row.ValueName);
  const finalHour = valueNameHour !== null ? valueNameHour : hour;

  // Create unique key for date+hour
  const key = `${date}-${finalHour}`;

  // Initialize entry if needed
  if (!grouped[key]) {
    grouped[key] = {
      d: date,
      h: finalHour,
      dt: getDayType(row.DayStart),
      g: 0,    // generation rate
      del: 0   // delivery rate
    };
  }

  // Add rate based on type (XXSD = generation, others = delivery)
  if (row.RIN && row.RIN.includes('XXSD')) {
    grouped[key].g = row.Value;
  } else {
    grouped[key].del = row.Value;
  }

  processedCount++;
}

console.log(`  Processed ${processedCount.toLocaleString()} rows`);
if (skippedCount > 0) {
  console.log(`  Skipped ${skippedCount.toLocaleString()} invalid rows`);
}

// Convert to array and calculate totals
// Encode day type as single char: w=weekday, e=weekend, h=holiday
const dayTypeMap = { 'weekday': 'w', 'weekend': 'e', 'holiday': 'h' };

const hourlyRates = Object.values(grouped).map(entry => {
  // Round to 4 decimals for smaller size (sufficient precision)
  const g = Math.round(entry.g * 10000) / 10000;
  const del = Math.round(entry.del * 10000) / 10000;
  const t = Math.round((g + del) * 10000) / 10000;

  return [
    entry.d,              // date
    entry.h,              // hour
    g,                    // generation
    del,                  // delivery
    t,                    // total
    dayTypeMap[entry.dt]  // day type (single char)
  ];
});

// Sort by date and hour (arrays: [date, hour, ...])
hourlyRates.sort((a, b) => {
  const dateCompare = a[0].localeCompare(b[0]);
  if (dateCompare !== 0) return dateCompare;
  return a[1] - b[1];
});

console.log(`  Combined into ${hourlyRates.length.toLocaleString()} unique hours`);

// Get date range
const dates = [...new Set(hourlyRates.map(r => r[0]))].sort();
const minDate = dates[0];
const maxDate = dates[dates.length - 1];

console.log(`  Date range: ${minDate} to ${maxDate}`);

// Create output structure
// Use array format for hourlyRates to reduce size
// Each entry: [date, hour, gen, del, total, dayType]
const output = {
  meta: {
    generated: new Date().toISOString().split('T')[0],
    version: '2.0',
    dateRange: [minDate, maxDate],
    totalHours: hourlyRates.length,
    totalDays: dates.length,
    description: 'Optimized SDGE rate data - generated from MIDAS CSV',
    format: 'Array format: [date, hour, generation, delivery, total, dayType]',
    fields: ['date', 'hour', 'generation', 'delivery', 'total', 'dayType'],
    dayTypes: { 'w': 'weekday', 'e': 'weekend', 'h': 'holiday' }
  },
  data: hourlyRates
};

console.log(`✅ Processing complete (${((Date.now() - startProcess) / 1000).toFixed(2)}s)`);
console.log('');
console.log('💾 Writing JSON file...');
const startWrite = Date.now();

// Write JSON file (no formatting for smaller size)
const jsonString = JSON.stringify(output);
fs.writeFileSync(outputPath, jsonString);

const outputSize = fs.statSync(outputPath).size;
const inputSize = fs.statSync(inputPath).size;
const reduction = ((1 - outputSize / inputSize) * 100).toFixed(1);

console.log(`✅ Write complete (${((Date.now() - startWrite) / 1000).toFixed(2)}s)`);
console.log('');
console.log('📊 Results:');
console.log(`  Input size:  ${(inputSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Output size: ${(outputSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Reduction:   ${reduction}%`);
console.log('');
console.log('✅ Success! Optimized data ready for deployment.');
console.log(`   Output: ${outputPath}`);
