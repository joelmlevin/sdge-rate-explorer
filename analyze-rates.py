#!/usr/bin/env python3

"""
Analyze 2026 NBT25 rate distribution
"""

import json
import math
from collections import defaultdict

# Read 2026 rates data
with open('public/rates-2026.json', 'r') as f:
    data = json.load(f)

# Extract all rates (total column, index 4)
rates = [entry[4] for entry in data['data']]

# Sort rates
rates.sort()

# Calculate statistics
min_rate = rates[0]
max_rate = rates[-1]
mean_rate = sum(rates) / len(rates)
median_rate = rates[len(rates) // 2]

# Calculate percentiles
percentiles = [1, 5, 10, 25, 50, 75, 90, 95, 99]
percentile_values = {}
for p in percentiles:
    index = int(len(rates) * (p / 100))
    percentile_values[f'p{p}'] = rates[index]

# Calculate distribution in key ranges
ranges = [
    {'name': '0¢-6¢', 'min': 0, 'max': 0.06},
    {'name': '6¢-7¢', 'min': 0.06, 'max': 0.07},
    {'name': '7¢-8¢', 'min': 0.07, 'max': 0.08},
    {'name': '8¢-9¢', 'min': 0.08, 'max': 0.09},
    {'name': '9¢-10¢', 'min': 0.09, 'max': 0.10},
    {'name': '10¢-11¢', 'min': 0.10, 'max': 0.11},
    {'name': '11¢-12¢', 'min': 0.11, 'max': 0.12},
    {'name': '12¢+', 'min': 0.12, 'max': 1}
]

range_counts = []
for r in ranges:
    count = len([rate for rate in rates if r['min'] <= rate < r['max']])
    percent = f"{(count / len(rates) * 100):.1f}"
    range_counts.append({**r, 'count': count, 'percent': percent})

# Print results
print('=' * 80)
print('2026 NBT25 RATE DISTRIBUTION ANALYSIS')
print('=' * 80)
print()

print('BASIC STATISTICS:')
print(f'  Total observations: {len(rates):,}')
print(f'  Min:    {min_rate * 100:.2f}¢/kWh')
print(f'  Max:    {max_rate * 100:.2f}¢/kWh')
print(f'  Mean:   {mean_rate * 100:.2f}¢/kWh')
print(f'  Median: {median_rate * 100:.2f}¢/kWh')
print()

print('PERCENTILES:')
for p in percentiles:
    value = percentile_values[f'p{p}']
    print(f'  {p:3d}%: {value * 100:.2f}¢/kWh')
print()

print('DISTRIBUTION BY RANGE:')
print('Range        Count      Percent    Bar')
print('-' * 80)
for r in range_counts:
    bar_length = int(float(r['percent']) / 2)
    bar = '█' * bar_length
    print(f"{r['name']:<12} {r['count']:>8,} {r['percent']:>7}%    {bar}")
print()

print('DETAILED 6¢-12¢ ANALYSIS:')
detailed_ranges = []
cents = 6.0
while cents < 12:
    min_val = cents / 100
    max_val = (cents + 0.5) / 100
    count = len([rate for rate in rates if min_val <= rate < max_val])
    percent = f"{(count / len(rates) * 100):.2f}"
    detailed_ranges.append({'min': cents, 'max': cents + 0.5, 'count': count, 'percent': percent})
    cents += 0.5

print('Range           Count      Percent    Bar')
print('-' * 80)
for r in detailed_ranges:
    label = f"{r['min']:.1f}¢-{r['max']:.1f}¢"
    bar_length = int(float(r['percent']))
    bar = '█' * bar_length
    print(f"{label:<15} {r['count']:>8,} {r['percent']:>7}%    {bar}")
print()

print('=' * 80)
print('RECOMMENDATIONS FOR COLOR GRADIENT:')
print('=' * 80)
print()

# Calculate concentration metrics
range_6to12 = [r for r in rates if 0.06 <= r < 0.12]
concentration = f"{(len(range_6to12) / len(rates) * 100):.1f}"

print(f'1. DATA CONCENTRATION:')
print(f'   {concentration}% of data falls in 6¢-12¢ range')
print(f'   This range deserves {concentration}% of color gradient space')
print()

print(f'2. CURRENT LOGARITHMIC APPROACH:')
epsilon = 0.001
log_min = math.log(percentile_values['p1'] + epsilon)
log_max = math.log(percentile_values['p99'] + epsilon)
log_6c = math.log(0.06 + epsilon)
log_12c = math.log(0.12 + epsilon)
current_color_space = f"{((log_12c - log_6c) / (log_max - log_min) * 100):.1f}"
print(f'   6¢-12¢ range gets ~{current_color_space}% of color space')
print(f'   Mismatch: {concentration}% data → {current_color_space}% colors')
print()

print(f'3. SUGGESTED PIECEWISE LINEAR TRANSFORMATION:')
print(f'   Range        Data%    Suggested Color%    Multiplier')
print(f'   ' + '-' * 60)

suggestions = [
    {'range': '0¢-6¢', 'dataPercent': range_counts[0]['percent'], 'colorPercent': 15},
    {'range': '6¢-8¢', 'dataPercent': f"{float(range_counts[1]['percent']) + float(range_counts[2]['percent']):.1f}", 'colorPercent': 25},
    {'range': '8¢-10¢', 'dataPercent': f"{float(range_counts[3]['percent']) + float(range_counts[4]['percent']):.1f}", 'colorPercent': 30},
    {'range': '10¢-12¢', 'dataPercent': f"{float(range_counts[5]['percent']) + float(range_counts[6]['percent']):.1f}", 'colorPercent': 20},
    {'range': '12¢+', 'dataPercent': range_counts[7]['percent'], 'colorPercent': 10}
]

for s in suggestions:
    multiplier = f"{(s['colorPercent'] / float(s['dataPercent'])):.2f}"
    print(f"   {s['range']:<12} {s['dataPercent']:>7}% {s['colorPercent']:>15}%         {multiplier}x")
print()

print(f'4. IMPLEMENTATION APPROACH:')
print(f'   Option A: Piecewise linear with custom breakpoints')
print(f'   Option B: Quantile transformation (histogram equalization)')
print(f'   Option C: Adjusted log scale with different base for middle range')
print()

print(f'   Recommendation: Piecewise linear (Option A) for maximum control')
print(f'   - Gives 75% of color space to critical 6¢-12¢ range')
print(f'   - Maintains discrimination at extremes')
print(f'   - Aligns color space allocation with data concentration')
print()
