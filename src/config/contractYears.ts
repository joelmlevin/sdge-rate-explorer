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
  dataStartYear: number; // The actual year the data starts (may differ from contract year)
}

export const CONTRACT_YEAR_INFO: Record<ContractYear, ContractYearInfo> = {
  2023: {
    label: '2023 (NBT23)',
    description: 'For customers who submitted a solar application in 2023',
    rateCode: 'NBT23',
    dataStartYear: 2024 // Data actually starts in 2024
  },
  2024: {
    label: '2024 (NBT24)',
    description: 'For customers who submitted a solar application in 2024',
    rateCode: 'NBT24',
    dataStartYear: 2024 // Data starts in 2024
  },
  2025: {
    label: '2025 (NBT25)',
    description: 'For customers who submitted a solar application in 2025',
    rateCode: 'NBT25',
    dataStartYear: 2025 // Data starts in 2025
  },
  2026: {
    label: '2026 (NBT26)',
    description: 'For customers who submitted a solar application in 2026',
    rateCode: 'NBT26',
    dataStartYear: 2026 // Data starts in 2026
  }
};
