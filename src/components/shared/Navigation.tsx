/**
 * Navigation component - Simple header for the app
 */

import ContractYearSelector from './ContractYearSelector';
import { useRateStore } from '../../store/useRateStore';
import type { ContractYear } from '../../config/contractYears';

export default function Navigation() {
  const { contractYear, switchContractYear, isLoading } = useRateStore();

  const handleYearChange = async (year: ContractYear) => {
    await switchContractYear(year);
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[60px] py-2 gap-2">
          <div className="flex items-center flex-1 min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">SDG&E NBT Export Rate Tool</h1>
          </div>
          <ContractYearSelector
            currentYear={contractYear}
            onYearChange={handleYearChange}
            isLoading={isLoading}
          />
        </div>
      </div>
    </nav>
  );
}
