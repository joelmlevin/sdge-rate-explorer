#!/usr/bin/env node

/**
 * Analyze 2026 NBT25 rate distribution
 * Focus on 6¢-12¢ range to inform better color gradient mapping
 */

const fs = require('fs');
const path = require('path');

// Read 2026 rates data
const dataPath = path.join(__dirname, 'public', 'rates-2026.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Extract all rates (total column, index 4)
const rates = data.data.map(entry => entry[4]);

// Sort rates
rates.sort((a, b) => a - b);

// Calculate statistics
const min = rates[0];
const max = rates[rates.length - 1];
const mean = rates.reduce((sum, r) => sum + r, 0) / rates.length;
const median = rates[Math.floor(rates.length / 2)];

// Calculate percentiles
const percentiles = [1, 5, 10, 25, 50, 75, 90, 95, 99];
const percentileValues = {};
percentiles.forEach(p => {
  const index = Math.floor(rates.length * (p / 100));
  percentileValues[`p${p}`] = rates[index];
});

// Create histogram with fine-grained bins in 6¢-12¢ range
const binSize = 0.0005; // 0.05¢ bins
const bins = {};
rates.forEach(rate => {
  const bin = Math.floor(rate / binSize) * binSize;
  bins[bin] = (bins[bin] || 0) + 1;
});

// Calculate distribution in key ranges
const ranges = [
  { name: '0¢-6¢', min: 0, max: 0.06 },
  { name: '6¢-7¢', min: 0.06, max: 0.07 },
  { name: '7¢-8¢', min: 0.07, max: 0.08 },
  { name: '8¢-9¢', min: 0.08, max: 0.09 },
  { name: '9¢-10¢', min: 0.09, max: 0.10 },
  { name: '10¢-11¢', min: 0.10, max: 0.11 },
  { name: '11¢-12¢', min: 0.11, max: 0.12 },
  { name: '12¢+', min: 0.12, max: 1 }
];

const rangeCounts = ranges.map(range => {
  const count = rates.filter(r => r >= range.min && r < range.max).length;
  const percent = (count / rates.length * 100).toFixed(1);
  return { ...range, count, percent };
});

// Print results
console.log('='.repeat(80));
console.log('2026 NBT25 RATE DISTRIBUTION ANALYSIS');
console.log('='.repeat(80));
console.log();

console.log('BASIC STATISTICS:');
console.log(`  Total observations: ${rates.length.toLocaleString()}`);
console.log(`  Min:    ${(min * 100).toFixed(2)}¢/kWh`);
console.log(`  Max:    ${(max * 100).toFixed(2)}¢/kWh`);
console.log(`  Mean:   ${(mean * 100).toFixed(2)}¢/kWh`);
console.log(`  Median: ${(median * 100).toFixed(2)}¢/kWh`);
console.log();

console.log('PERCENTILES:');
percentiles.forEach(p => {
  const value = percentileValues[`p${p}`];
  console.log(`  ${p.toString().padStart(3)}%: ${(value * 100).toFixed(2)}¢/kWh`);
});
console.log();

console.log('DISTRIBUTION BY RANGE:');
console.log('Range        Count      Percent    Bar');
console.log('-'.repeat(80));
rangeCounts.forEach(range => {
  const barLength = Math.round(parseFloat(range.percent) / 2);
  const bar = '█'.repeat(barLength);
  console.log(
    `${range.name.padEnd(12)} ${range.count.toLocaleString().padStart(8)} ${
      (range.percent + '%').padStart(8)
    }    ${bar}`
  );
});
console.log();

console.log('DETAILED 6¢-12¢ ANALYSIS:');
const detailedRanges = [];
for (let cents = 6; cents < 12; cents += 0.5) {
  const min = cents / 100;
  const max = (cents + 0.5) / 100;
  const count = rates.filter(r => r >= min && r < max).length;
  const percent = (count / rates.length * 100).toFixed(2);
  detailedRanges.push({ min: cents, max: cents + 0.5, count, percent });
}

console.log('Range           Count      Percent    Bar');
console.log('-'.repeat(80));
detailedRanges.forEach(range => {
  const label = `${range.min.toFixed(1)}¢-${range.max.toFixed(1)}¢`;
  const barLength = Math.round(parseFloat(range.percent) / 1);
  const bar = '█'.repeat(barLength);
  console.log(
    `${label.padEnd(15)} ${range.count.toLocaleString().padStart(8)} ${
      (range.percent + '%').padStart(8)
    }    ${bar}`
  );
});
console.log();

console.log('='.repeat(80));
console.log('RECOMMENDATIONS FOR COLOR GRADIENT:');
console.log('='.repeat(80));
console.log();

// Calculate concentration metrics
const range6to12 = rates.filter(r => r >= 0.06 && r < 0.12);
const concentration = (range6to12.length / rates.length * 100).toFixed(1);

console.log(`1. DATA CONCENTRATION:`);
console.log(`   ${concentration}% of data falls in 6¢-12¢ range`);
console.log(`   This range deserves ${concentration}% of color gradient space`);
console.log();

console.log(`2. CURRENT LOGARITHMIC APPROACH:`);
const epsilon = 0.001;
const logMin = Math.log(percentileValues.p1 + epsilon);
const logMax = Math.log(percentileValues.p99 + epsilon);
const log6c = Math.log(0.06 + epsilon);
const log12c = Math.log(0.12 + epsilon);
const currentColorSpaceFor6to12 = ((log12c - log6c) / (logMax - logMin) * 100).toFixed(1);
console.log(`   6¢-12¢ range gets ~${currentColorSpaceFor6to12}% of color space`);
console.log(`   Mismatch: ${concentration}% data → ${currentColorSpaceFor6to12}% colors`);
console.log();

console.log(`3. SUGGESTED PIECEWISE LINEAR TRANSFORMATION:`);
console.log(`   Range        Data%    Suggested Color%    Multiplier`);
console.log(`   ` + '-'.repeat(60));

const suggestions = [
  { range: '0¢-6¢', dataPercent: rangeCounts[0].percent, colorPercent: 15 },
  { range: '6¢-8¢', dataPercent: parseFloat(rangeCounts[1].percent) + parseFloat(rangeCounts[2].percent), colorPercent: 25 },
  { range: '8¢-10¢', dataPercent: parseFloat(rangeCounts[3].percent) + parseFloat(rangeCounts[4].percent), colorPercent: 30 },
  { range: '10¢-12¢', dataPercent: parseFloat(rangeCounts[5].percent) + parseFloat(rangeCounts[6].percent), colorPercent: 20 },
  { range: '12¢+', dataPercent: rangeCounts[7].percent, colorPercent: 10 }
];

suggestions.forEach(s => {
  const multiplier = (s.colorPercent / parseFloat(s.dataPercent)).toFixed(2);
  console.log(`   ${s.range.padEnd(12)} ${(s.dataPercent + '%').padStart(7)} ${(s.colorPercent + '%').padStart(15)}         ${multiplier}x`);
});
console.log();

console.log(`4. IMPLEMENTATION APPROACH:`);
console.log(`   Option A: Piecewise linear with custom breakpoints`);
console.log(`   Option B: Quantile transformation (histogram equalization)`);
console.log(`   Option C: Adjusted log scale with different base for middle range`);
console.log();

console.log(`   Recommendation: Piecewise linear (Option A) for maximum control`);
console.log(`   - Gives 75% of color space to critical 6¢-12¢ range`);
console.log(`   - Maintains discrimination at extremes`);
console.log(`   - Aligns color space allocation with data concentration`);
console.log();
