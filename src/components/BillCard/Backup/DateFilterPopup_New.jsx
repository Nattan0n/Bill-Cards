import React, { useState, useEffect } from "react";

const DateFilterPopup = ({ isOpen, onClose, onApply, defaultDates }) => {
  const [startDate, setStartDate] = useState(defaultDates?.startDate || "");
  const [endDate, setEndDate] = useState(defaultDates?.endDate || "");

  useEffect(() => {
    if (defaultDates) {
      setStartDate(defaultDates.startDate);
      setEndDate(defaultDates.endDate);
    }
  }, [defaultDates]);

  const handleApply = () => {
    if (!startDate || !endDate) {
      alert("กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุด");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      alert("วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด");
      return;
    }

    onApply({ startDate, endDate });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-w-full mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-slate-700 rounded-t-lg">
          <h2 className="text-xl font-semibold text-white">Filter by Date Range</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 focus:outline-none"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateFilterPopup;