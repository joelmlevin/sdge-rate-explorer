/**
 * Contract Year Selector Component
 * Allows users to switch between different contract years (2023, 2024, 2026)
 */

import { useState } from 'react';
import { AVAILABLE_CONTRACT_YEARS, CONTRACT_YEAR_INFO, type ContractYear } from '../../config/contractYears';

interface ContractYearSelectorProps {
  currentYear: ContractYear;
  onYearChange: (year: ContractYear) => Promise<void>;
  isLoading: boolean;
}

export default function ContractYearSelector({
  currentYear,
  onYearChange,
  isLoading,
}: ContractYearSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleYearClick = async (year: ContractYear) => {
    if (year !== currentYear && !isLoading) {
      setIsOpen(false);
      await onYearChange(year);
    }
  };

  return (
    <div className="relative">
      {/* Dropdown button */}
      <button
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`
          flex items-center gap-3 px-5 py-3 rounded-xl border-2 shadow-sm
          ${isLoading ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'bg-white border-blue-400 hover:border-blue-600 hover:shadow-md'}
          transition-all duration-200
        `}
      >
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Contract Year
          </span>
          <span className="text-base font-bold text-gray-900">
            {CONTRACT_YEAR_INFO[currentYear].label}
          </span>
        </div>
        {isLoading ? (
          <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && !isLoading && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border-2 border-blue-200 z-20">
            <div className="py-2">
              {AVAILABLE_CONTRACT_YEARS.map((year) => {
                const info = CONTRACT_YEAR_INFO[year];
                const isCurrent = year === currentYear;

                return (
                  <button
                    key={year}
                    onClick={() => handleYearClick(year)}
                    className={`
                      w-full px-4 py-3 text-left transition-colors duration-150
                      ${isCurrent ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isCurrent ? 'text-blue-700' : 'text-gray-900'}`}>
                            {info.label}
                          </span>
                          {isCurrent && (
                            <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {info.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Helper text */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <p className="text-xs text-gray-600">
                Your rate structure depends on when you submitted your solar application to SDGE. Select the year you applied.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
