/**
 * Navigation component - Simple header for the app
 */

import ContractYearSelector from './ContractYearSelector';
import { useRateStore } from '../../store/useRateStore';

export default function Navigation() {
  const { contractYear, switchContractYear, isLoading } = useRateStore();

  const handleYearChange = (year: string) => {
    switchContractYear(year as any);
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">SDG&E NBT Export Rate Tool</h1>
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
