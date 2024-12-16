import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navigation from "../../Nav/Nav";
import BillCard from "../BillCard";
import "./style/App.css"

const App = () => {
  const [bills, setBills] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ดึงข้อมูลจากไฟล์ JSON ที่อยู่ใน public/data/bills.json
    fetch("/data/BillData.json")
      .then((res) => res.json())
      .then((data) => {
        setBills(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load bills.");
      });
  }, []);
  //   setBills([
  //     {
  //       partID: 1,
  //       partName: "Bill 1",
  //       customer: "Customer 1",
  //       job: 'TESBOM',
  //       date: "2024-11-07",
  //       quantity: 20,
  //       image: "https://placehold.co/400x400/orange/white",
  //     },
  //     {
  //       partID: 2,
  //       partName: "Bill 2",
  //       customer: "Customer 2",
  //       job: 'TESBOM',
  //       date: "2024-11-07",
  //       quantity: 20,
  //       image: "https://placehold.co/400x400/orange/white",
  //     },
  //   ]);
  // }, []);

  // useEffect(() => {
  //   const fetchBills = () => {
  //     fetch("/api/billcard")
  //       .then((res) => res.json())
  //       .then((data) => {
  //         console.log(data);
  //         setBills(data);
  //       })
  //       .catch((err) => {
  //         console.error(err);
  //         setError(err.message);
  //       });
  //   };
  
  //   const intervalId = setInterval(fetchBills, 5000);
  //   fetchBills();
  
  //   return () => clearInterval(intervalId);
  // }, []);



  // useEffect(() => {
  //   const fetchBills = async () => {
  //     try {
  //       const response = await fetch("/api/billcard");
  //       if (!response.ok) {
  //         throw new Error('Failed to fetch bills');
  //       }
  //       const data = await response.json();
  //       setBills(data);
  //     } catch (error) {
  //       setError(error.message);
  //     }
  //   };

  //   fetchBills();
  // }, []);

  const user = { name: "John Doe" }; // ตัวอย่างข้อมูลผู้ใช้
  const roles = ["plAdmin"]; // ตัวอย่าง roles
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
        <Routes>
          <Route path="/billcard" element={<BillCard bills={bills} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
