import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navigation from "./components/Nav/Nav";
import BillCard from "./components/BillCard/BillCard";
import { useBillDataAPI } from "./hook/useBillDataAPI";
import "./style/App.css"

const App = () => {
  const { bills, error, loading, refreshBills } = useBillDataAPI();
  
  const user = { name: "John Doe" };
  const roles = ["plAdmin"];
  const onLogout = () => {
    console.log("Logged out");
  };

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-100">
        <Navigation user={user} roles={roles} onLogout={onLogout} />
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {loading && (
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
                loading={loading}
              />
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
