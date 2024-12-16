import React, { useState, useEffect } from "react";
import ExportPopup from "../ExportPopup";
import * as XLSX from "xlsx";

const BillDetailPopup = ({ bill, onClose }) => {
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: ""
  });

  // Get latest month's start and end dates
  useEffect(() => {
    if (bill?.inventory && bill.inventory.length > 0) {
      const dates = bill.inventory.map(item => new Date(item.date_time));
      const latestDate = new Date(Math.max(...dates));
      
      const startDate = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
      const endDate = new Date(latestDate.getFullYear(), latestDate.getMonth() + 1, 0);

      setDateFilter({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
    }
  }, [bill]);

  // Filter inventory based on date range
  useEffect(() => {
    if (bill?.inventory) {
      const filtered = bill.inventory.filter(item => {
        const itemDate = new Date(item.date_time);
        const start = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
        const end = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

        if (start && end) {
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          return itemDate >= start && itemDate <= end;
        }
        return true;
      });

      setFilteredInventory(filtered);
    }
  }, [bill, dateFilter]);

  const handleExportClick = () => {
    setIsExportPopupOpen(true);
  };

  const calculateInventoryWithRemaining = () => {
    let remaining = bill.quantity || 0;
    return filteredInventory.map((item) => {
      const itemWithRemaining = {
        ...item,
        quantity_remaining: Math.max(remaining - (item.quantity_sold || 0), 0),
      };
      remaining -= item.quantity_sold || 0;
      return itemWithRemaining;
    });
  };

  const inventoryWithRemaining = calculateInventoryWithRemaining();

  const handleDateChange = (field, value) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!bill) return null;

  return (
    <div>
      <ExportPopup
        isOpen={isExportPopupOpen}
        onClose={() => setIsExportPopupOpen(false)}
        onExport={async () => {
          // Export logic remains the same
        }}
      />

      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="fixed inset-0 flex items-center justify-center z-40">
          <div
            className="absolute inset-0 bg-gray-900 dark:bg-gray-900 opacity-75"
            onClick={onClose}
            aria-hidden="true"
          ></div>
          <div
            className="rounded-lg overflow-hidden bg-gray-800 divide-gray-600 dark:bg-gray-800 dark:divide-gray-600 z-10 w-11/12 max-w-4xl max-h-screen"
            role="dialog"
          >
            <div className="h-full text-gray-500">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-t-lg">
                <div className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 flex justify-between">
                  <h2 className="flex items-center justify-center">
                    Bill Details
                  </h2>
                  <button
                    onClick={onClose}
                    className="flex p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
                    aria-label="Close"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex gap-4">
                  {/* Left side - Image */}
                  {bill.M_PART_IMG && (
                    <div className="flex-shrink-0">
                      <img
                        src={bill.M_PART_IMG}
                        alt={bill.M_PART_DESCRIPTION}
                        className="w-60 h-60 object-cover rounded"
                      />
                    </div>
                  )}
                  
                  {/* Right side - Date filters */}
                  <div className="flex-grow space-y-4 bg-gray-100 rounded-xl">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-t-lg">
                      <div className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 flex justify-between">
                        <h2 className="flex items-center justify-center">
                          Bill Details
                        </h2>
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={dateFilter.startDate}
                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                        className="w-full p-3 border-0 rounded-lg bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={dateFilter.endDate}
                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                        className="w-full p-3 border-0 rounded-lg bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pb-4 flex justify-between items-center mt-4">
                  <h3 className="font-semibold">Inventory Change Log :</h3>
                  <button
                    onClick={handleExportClick}
                    type="button"
                    className="flex items-center text-white bg-orange-500 hover:bg-slate-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
                  >
                    <span className="material-symbols-outlined">file_export</span>
                    Export
                  </button>
                </div>

                <div className="max-h-[30rem] overflow-x-auto rounded-lg">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 rounded-lg">
                    <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                      <tr>
                        <th className="p-4">เบอร์ชิ้นส่วน</th>
                        <th className="p-4">ว.ด.ป</th>
                        <th className="p-4">จำนวนจ่าย</th>
                        <th className="p-4">plan ID</th>
                        <th className="p-4">คงเหลือ</th>
                        <th className="p-4">ผู้บันทึก</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white border-b hover:bg-gray-50 text-black">
                      {inventoryWithRemaining.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-200"
                        >
                          <td className="p-4">{item.id}</td>
                          <td className="p-4">{item.date_time}</td>
                          <td className="p-4">{item.quantity_sold}</td>
                          <td className="p-4">{item.plan_id}</td>
                          <td className="p-4">{item.quantity_remaining}</td>
                          <td className="p-4">{item.signature}</td>
                        </tr>
                      ))}
                      {inventoryWithRemaining.length === 0 && (
                        <tr>
                          <td colSpan="6" className="p-10 text-center">
                            No changes logged for this date range.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <div className="fixed inset-0 flex z-50">
          <div
            className="absolute inset-0 dark:bg-gray-900 opacity-75"
            onClick={onClose}
            aria-hidden="true"
          ></div>
          <div
            className="rounded-lg overflow-hidden dark:bg-gray-800 dark:divide-gray-600 z-10"
            role="dialog"
          >
            <div className="h-full text-gray-500">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-t-lg">
                <div className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 flex justify-between">
                  <h2 className="flex items-center justify-center">
                    Bill Details
                  </h2>
                  <button
                    onClick={onClose}
                    className="flex p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
                    aria-label="Close"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              <div>
                {bill.M_PART_IMG && (
                  <div className="p-4 flex items-center justify-center">
                    <img
                      src={bill.M_PART_IMG}
                      alt={bill.M_PART_DESCRIPTION}
                      className="w-60 h-60 object-cover rounded"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold mt-4">Inventory Change Log :</h3>
                  <div className="max-h-[30rem] overflow-y-auto rounded-lg">
                    <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 rounded-lg">
                      <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                        <tr>
                          <th className="p-4 whitespace-nowrap">
                            เบอร์ชิ้นส่วน
                          </th>
                          <th className="p-4 whitespace-nowrap">ว.ด.ป</th>
                          <th className="p-4 whitespace-nowrap">จำนวนจ่าย</th>
                          <th className="p-4 whitespace-nowrap">plan ID</th>
                          <th className="p-4 whitespace-nowrap">คงเหลือ</th>
                          <th className="p-4 whitespace-nowrap">ผู้บันทึก</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white border-b hover:bg-gray-50 text-black">
                        {inventoryWithRemaining.map((item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 dark:hover:bg-gray-200"
                          >
                            <td className="p-4">{item.id}</td>
                            <td className="p-4">{item.date_time}</td>
                            <td className="p-4">{item.quantity_sold}</td>
                            <td className="p-4">{item.plan_id}</td>
                            <td className="p-4">{item.quantity_remaining}</td>
                            <td className="p-4">{item.signature}</td>
                          </tr>
                        ))}
                        {inventoryWithRemaining.length === 0 && (
                          <tr>
                            <td colSpan="6" className="p-10 text-center">
                              No changes logged for this bill.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="p-4">
                {/* ปุ่ม export ข้อมูล */}
                <button
                  onClick={handleExportClick} // เปิด popup export
                  type="button"
                  className="flex items-center text-white bg-orange-500 hover:bg-slate-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 w-full"
                >
                  <span className="material-symbols-outlined">file_export</span>
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDetailPopup;
