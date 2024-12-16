import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navigation from "./components/Nav/Nav";
import BillCard from "./components/BillCard/BillCard";
import { useBillDataAPI } from "./hook/useBillDataAPI";
import { useAuth } from './hook/useAuth';
import "./style/App.css"

const App = () => {
  const { bills, error, loading, refreshBills } = useBillDataAPI();
  const { user, roles, loading: authLoading, error: authError, logout } = useAuth();

  // ถ้ากำลังโหลดข้อมูล authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-gray-600">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
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
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-lg text-gray-600">กำลังโหลดรายการบิล...</div>
            </div>
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