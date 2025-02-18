// App.jsx
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navigation from './components/Nav/Nav';
import ErrorBoundary from './components/ErrorBoundary';
import BillCard from './components/BillCard/BillCard';

const App = () => {
  return (
    <BrowserRouter basename="/iplan" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-100">
          <Navigation />
          <Routes>
            <Route path="/billcard" element={<BillCard />} />
          </Routes>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;