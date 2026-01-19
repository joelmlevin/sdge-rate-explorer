/**
 * Main App component with routing
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useRateStore } from './store/useRateStore';
import CalendarExplorerV2 from './components/calendar/CalendarExplorerV2';
import LoadingSpinner from './components/shared/LoadingSpinner';
import ErrorMessage from './components/shared/ErrorMessage';
import Navigation from './components/shared/Navigation';
import About from './components/shared/About';

function App() {
  const { loadData, isLoading, error, allRates } = useRateStore();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData().then(() => setInitialLoadComplete(true));
  }, [loadData]);

  // Show loading state ONLY for initial load
  // After that, CalendarExplorerV2 will handle loading states internally
  if (!initialLoadComplete && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner message="Loading SDGE rate data..." />
      </div>
    );
  }

  // Show error state only if we have no data at all
  if (error && allRates.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <ErrorMessage error={error} />
      </div>
    );
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <About />
        <Routes>
          <Route path="/" element={<CalendarExplorerV2 />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
