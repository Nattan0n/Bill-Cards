import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navigation from "./components/Nav/Nav";
import BillCard from "./components/BillCard/BillCard";
import { useBillDataAPI } from "./hook/useBillDataAPI";
import { useAuth } from './hook/useAuth';
import "./style/App.css"
import { BlinkBlur } from "react-loading-indicators";

// แก้ไขส่วน loading ใน App.jsx
const LoadingScreen = () => (
  <div className="fixed inset-0 bg-white z-50">
    <div className="flex items-center justify-center w-full h-screen">
      <div className="flex flex-col items-center gap-3">
        {/* <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div> */}
        <BlinkBlur color="#dd1414" size="small" text="" textColor="" />
        <div className="text-xl text-gray-600">Loading data...</div>
      </div>
    </div>
  </div>
);

// ใช้งานใน App component
const App = () => {
  const { bills, error, loading, refreshBills } = useBillDataAPI();
  const { user, roles, loading: authLoading, error: authError, logout } = useAuth();

  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-100">
        <Navigation user={user} roles={roles} onLogout={logout} />
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <Routes>
          <Route 
            path="/iplan/billcard" 
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