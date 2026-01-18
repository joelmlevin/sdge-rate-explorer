/**
 * Zustand store for managing rate data and UI state
 * Keeps state management simple and centralized
 */

import { create } from 'zustand';
import type { RateEntry, RateFilters } from '../types';
import { loadRates, filterRates } from '../services/dataService';

interface RateStore {
  // Data state
  allRates: RateEntry[];
  filteredRates: RateEntry[];
  isLoading: boolean;
  error: string | null;

  // Filter state
  filters: RateFilters;

  // Actions
  loadData: () => Promise<void>;
  setFilters: (filters: Partial<RateFilters>) => void;
  resetFilters: () => void;
}

/**
 * Default filters - show both generation and delivery rates for full picture
 */
const defaultFilters: RateFilters = {
  rateTypes: ['generation', 'delivery'],
};

/**
 * Main rate store
 */
export const useRateStore = create<RateStore>((set, get) => ({
  // Initial state
  allRates: [],
  filteredRates: [],
  isLoading: false,
  error: null,
  filters: defaultFilters,

  // Load data from CSV
  loadData: async () => {
    set({ isLoading: true, error: null });

    try {
      const rates = await loadRates();
      const filtered = filterRates(rates, get().filters);

      set({
        allRates: rates,
        filteredRates: filtered,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load data',
        isLoading: false,
      });
    }
  },

  // Update filters and re-filter data
  setFilters: (newFilters) => {
    const updatedFilters = { ...get().filters, ...newFilters };
    const filtered = filterRates(get().allRates, updatedFilters);

    set({
      filters: updatedFilters,
      filteredRates: filtered,
    });
  },

  // Reset filters to defaults
  resetFilters: () => {
    const filtered = filterRates(get().allRates, defaultFilters);

    set({
      filters: defaultFilters,
      filteredRates: filtered,
    });
  },
}));
