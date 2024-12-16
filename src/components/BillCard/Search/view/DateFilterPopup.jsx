import React, { useState, useEffect } from "react";

const DateFilterPopup = ({ isOpen, onClose, onApply, defaultDates }) => {
  const [startDate, setStartDate] = useState(defaultDates?.startDate || "");
  const [endDate, setEndDate] = useState(defaultDates?.endDate || "");
  const [isClosing, setIsClosing] = useState(false);

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
    handleClose();
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 500);  // ให้เวลาในการเล่น animation ก่อนที่จะปิด
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div>
      {/* Desktop/Mobile View */}
      <div>
        <div className="fixed inset-0 flex items-center justify-center z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-900/45 backdrop-blur-sm transition-opacity"
            onClick={handleClose}
            aria-hidden="true"
          ></div>

          {/* Popup with Animate.css */}
          <div
            className={`rounded-3xl overflow-hidden bg-gray-800 divide-gray-600 dark:bg-gray-800 dark:divide-gray-600 z-10 w-11/12 max-w-lg animate__animated animate__faster ${
              isClosing ? "animate__zoomOut" : "animate__zoomIn"
            }`}
            role="dialog"
          >
            <div className="h-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-800 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <span className="material-symbols-outlined mr-2"> filter_alt </span>
                  Filter by Date Range
                </h2>
                <button
                  onClick={handleClose} // ใช้ handleClose แทน onClose ตรงนี้
                  className="flex items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-red-500 text-white transition-all duration-200 backdrop-blur-sm group"
                >
                  <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-200">
                    close
                  </span>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
                <div className="space-y-6">
                  {/* Start Date */}
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 shadow-sm">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-3 border-0 rounded-lg bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* End Date */}
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 shadow-sm">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-3 border-0 rounded-lg bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 mt-4">
                    <button
                      onClick={handleClose}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg font-medium text-gray-600 dark:text-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApply}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 text-white hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 rounded-lg font-medium transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateFilterPopup;
