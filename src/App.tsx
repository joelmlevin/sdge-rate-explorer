/**
 * Main App component with routing
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useRateStore } from './store/useRateStore';
import CalendarExplorerV2 from './components/calendar/CalendarExplorerV2';
import LoadingSpinner from './components/shared/LoadingSpinner';
import ErrorMessage from './components/shared/ErrorMessage';

function App() {
  const { loadData, isLoading, error } = useRateStore();

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner message="Loading SDGE rate data..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <ErrorMessage error={error} />
      </div>
    );
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Navigate to="/calendar" replace />} />
        <Route path="/calendar" element={<CalendarExplorerV2 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
