import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navigation from "./components/Nav/Nav";
import BillCard from "./components/BillCard/BillCard";
import { useBillDataAPI } from "./hook/useBillDataAPI";
import { useAuth } from "./hook/useAuth";
import "./style/App.css"

const App = () => {
  const { bills, error: billError, loading: billLoading, refreshBills } = useBillDataAPI();
  const { user, loading: authLoading, error: authError } = useAuth();

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">Loading authentication...</div>
    </div>;
  }

  // if (!user) {
  //   window.location.href = 'http://localhost:8000/login';
  //   return null;
  // }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-100">
        <Navigation user={user} />
        {(billError || authError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {billError || authError}
          </div>
        )}
        {billLoading && (
          <div className="text-center py-4">
            Loading bills...
          </div>
        )}
        <Routes>
          <Route 
            path="/billcard" 
            element={
              <BillCard 
                bills={bills} 
                onRefresh={refreshBills}
                loading={billLoading}
              />
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;