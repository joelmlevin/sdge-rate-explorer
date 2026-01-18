/**
 * Export utilities for downloading data as CSV
 */

import type { RateEntry } from '../types';

/**
 * Export rate data to CSV file
 */
export function exportToCSV(rates: RateEntry[], filename: string = 'sdge-rates.csv'): void {
  if (rates.length === 0) {
    alert('No data to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'Date',
    'Time',
    'Hour',
    'Rate ($/kWh)',
    'Rate (¢/kWh)',
    'Rate Type',
    'Rate Name',
    'Day Type',
    'Day of Week',
    'Month',
    'Year',
  ];

  // Convert rates to CSV rows
  const rows = rates.map((rate) => [
    rate.date,
    formatTime(rate.hour),
    rate.hour.toString(),
    rate.rate.toFixed(6),
    rate.rateCents.toFixed(2),
    rate.rateType,
    rate.rateName,
    rate.dayType,
    rate.dayOfWeekName,
    rate.monthName,
    rate.year.toString(),
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format hour as time string (e.g., "14" -> "2:00 PM")
 */
function formatTime(hour: number): string {
  if (hour === 0) return '12:00 AM';
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return '12:00 PM';
  return `${hour - 12}:00 PM`;
}

/**
 * Escape CSV field (handle commas, quotes, newlines)
 */
function escapeCSV(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Export statistics summary to CSV
 */
export function exportStatisticsToCSV(
  stats: {
    label: string;
    value: string | number;
  }[],
  filename: string = 'sdge-rate-statistics.csv'
): void {
  const csvContent = [
    'Statistic,Value',
    ...stats.map(stat => `${escapeCSV(stat.label)},${escapeCSV(stat.value.toString())}`)
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
