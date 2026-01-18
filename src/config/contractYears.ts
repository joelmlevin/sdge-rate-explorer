/**
 * Contract Year Configuration
 * Defines available contract years and their metadata
 */

export const AVAILABLE_CONTRACT_YEARS = [2023, 2024, 2025, 2026] as const;
export type ContractYear = typeof AVAILABLE_CONTRACT_YEARS[number];

export const DEFAULT_CONTRACT_YEAR: ContractYear = 2025;

export interface ContractYearInfo {
  label: string;
  description: string;
  rateCode: string;
}

export const CONTRACT_YEAR_INFO: Record<ContractYear, ContractYearInfo> = {
  2023: {
    label: '2023 (NBT23)',
    description: 'For customers who signed their contract in 2023',
    rateCode: 'NBT23'
  },
  2024: {
    label: '2024 (NBT24)',
    description: 'For customers who signed their contract in 2024',
    rateCode: 'NBT24'
  },
  2025: {
    label: '2025 (NBT00)',
    description: 'For customers who signed their contract in 2025',
    rateCode: 'NBT00'
  },
  2026: {
    label: '2026 (NBT00)',
    description: 'For customers who signed their contract in 2026',
    rateCode: 'NBT00'
  }
};
