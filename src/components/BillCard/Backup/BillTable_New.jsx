import React, { useState, useCallback } from "react";
import BillDetailPopup from "./BillDetailPopup";
import QrCodePopup from "./QrCodePopup";

const BillTable = ({ bills, startingIndex = 0, onSelectedRowsChange }) => {
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showQrPopup, setShowQrPopup] = useState(false);
  const [currentBillIndex, setCurrentBillIndex] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  // ปรับปรุงฟังก์ชัน handleSelectAll ให้ทำงานทั้ง desktop และ mobile
  const handleSelectAll = useCallback(
    (e) => {
      const isChecked = e.target.checked;
      const newSelectedRows = isChecked ? bills.map((_, index) => index) : [];
      setSelectedRows(newSelectedRows);
      // ส่งข้อมูล bills ที่ถูกเลือกทั้งหมดไปยัง parent
      onSelectedRowsChange(isChecked ? bills : []);
    },
    [bills, onSelectedRowsChange]
  );

  // ปรับปรุงฟังก์ชัน handleSelectRow ให้ทำงานทั้ง desktop และ mobile
  const handleSelectRow = useCallback(
    (index, e) => {
      e?.stopPropagation(); // ป้องกันการ bubble event ถ้ามี

      setSelectedRows((prev) => {
        const newSelectedRows = prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index];

        // ส่งข้อมูล bills ที่ถูกเลือกไปยัง parent
        const selectedBills = newSelectedRows.map((idx) => bills[idx]);
        onSelectedRowsChange(selectedBills);

        return newSelectedRows;
      });
    },
    [bills, onSelectedRowsChange]
  );

  const handleShowPopup = (bill) => {
    setSelectedBill(bill);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedBill(null);
  };

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:block min-h-screen px-4 py-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 rounded-t-2xl px-6 py-4 shadow-lg animate-gradient">
          <h2 className="text-xl font-semibold text-white flex items-center justify-between">
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-3 text-2xl animate-bounce">
                inventory_2
              </span>
              <div>
                <p className="text-lg font-bold">Part List</p>
                <p className="text-xs text-blue-100 mt-0.5">
                  Manage your inventory
                </p>
              </div>
            </div>
            <div className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              {selectedRows.length}/{bills.length} selected
            </div>
          </h2>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-b-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === bills.length}
                        onChange={handleSelectAll}
                        className="peer w-5 h-5 text-blue-600 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                      />
                      <span className="absolute inset-0 bg-blue-500 scale-0 peer-checked:scale-100 transition-transform duration-200 opacity-0 peer-checked:opacity-20 rounded-lg"></span>
                    </div>
                  </th>
                  <th className="p-4 text-xs font-semibold text-left text-gray-600 uppercase">
                    No.
                  </th>
                  <th className="p-4 text-xs font-semibold text-left text-gray-600 uppercase">
                    Image
                  </th>
                  <th className="p-4 text-xs font-semibold text-left text-gray-600 uppercase">
                    Part No.
                  </th>
                  <th className="p-4 text-xs font-semibold text-left text-gray-600 uppercase">
                    Part Name
                  </th>
                  <th className="p-4 text-xs font-semibold text-left text-gray-600 uppercase">
                    Customer
                  </th>
                  <th className="p-4 text-xs font-semibold text-left text-gray-600 uppercase">
                    Job No.
                  </th>
                  <th className="p-4 text-xs font-semibold text-left text-gray-600 uppercase">
                    Date
                  </th>
                  <th className="p-4 text-xs font-semibold text-left text-gray-600 uppercase">
                    Quantity
                  </th>
                  <th className="p-4 text-xs font-semibold text-left text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bills.length > 0 ? (
                  bills.map((bill, index) => (
                    <tr
                      key={index}
                      className="group hover:bg-blue-50/50 transition-colors duration-200"
                    >
                      <td className="p-4">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(index)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectRow(index, e);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="peer w-5 h-5 text-blue-600 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                          />
                          <span className="absolute inset-0 bg-blue-500 scale-0 peer-checked:scale-100 transition-transform duration-200 opacity-0 peer-checked:opacity-20 rounded-lg"></span>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-900">
                        #{startingIndex + index + 1}
                      </td>
                      <td className="p-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 group-hover:border-blue-100 transition-all duration-300 shadow-sm">
                          <img
                            src={
                              bill.M_PART_IMG ||
                              "https://via.placeholder.com/64"
                            }
                            alt={bill.M_PART_IMG ? "Part" : "No Image"}
                            className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {bill.M_PART_NUMBER}
                      </td>
                      <td className="p-4 text-sm text-gray-600 max-w-xs">
                        <p className="line-clamp-2">
                          {bill.M_PART_DESCRIPTION}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-50 text-xs font-medium text-gray-600 group-hover:bg-gray-100 transition-colors duration-300">
                          {bill.M_SUBINV}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {bill.M_SOURCE_LINE_ID}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-xs font-medium text-blue-700 group-hover:bg-blue-100 transition-colors duration-300">
                          <span className="material-symbols-outlined text-sm mr-1">
                            calendar_today
                          </span>
                          {bill.M_DATE}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-xs font-medium text-blue-700 group-hover:bg-blue-100 transition-colors duration-300">
                          <span className="material-symbols-outlined text-sm mr-1">
                            inventory
                          </span>
                          {bill.M_QTY_RM}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleShowPopup(bill)}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow group-hover:scale-105"
                        >
                          <span className="material-symbols-outlined text-sm mr-1">
                            visibility
                          </span>
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="p-8">
                      <div className="flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 animate-bounce">
                          inventory_2
                        </span>
                        <p className="text-gray-500 font-medium mb-1">
                          No inventory items found
                        </p>
                        <p className="text-gray-400 text-sm">
                          Try adjusting your search criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden bg-gray-100 min-h-screen">
        {/* Improved Header with Animation */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 px-4 py-4 shadow-lg animate-gradient">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <span className="material-symbols-outlined mr-3 text-2xl animate-bounce">
                inventory_2
              </span>
              <div>
                <p className="text-lg font-bold">Part List</p>
                <p className="text-xs text-blue-100 mt-0.5">
                  Manage your inventory
                </p>
              </div>
            </h2>
          </div>
        </div>

        {/* Enhanced Select All Section */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md shadow-md border-b border-gray-200">
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3 group cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === bills.length}
                    onChange={handleSelectAll}
                    className="peer w-5 h-5 text-blue-600 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200 ease-in-out"
                  />
                  <span className="absolute inset-0 bg-blue-500 scale-0 peer-checked:scale-100 transition-transform duration-200 ease-in-out opacity-0 peer-checked:opacity-20 rounded-lg"></span>
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  Select All
                </span>
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-full font-medium shadow-sm">
                  {selectedRows.length}/{bills.length} selected
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Improved Cards Container */}
        <div className="p-4 space-y-4 max-w-md mx-auto">
          {bills.length > 0 ? (
            bills.map((bill, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-blue-200 transform hover:-translate-y-1"
              >
                {/* Enhanced Card Header */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-blue-800 border-b transition-colors duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(index)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectRow(index, e);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="peer w-4 h-4 text-blue-600 rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      />
                      <span className="absolute inset-0 bg-blue-500 scale-0 peer-checked:scale-100 transition-transform duration-200 opacity-0 peer-checked:opacity-20 rounded-md"></span>
                    </div>
                    <span className="text-sm font-semibold text-white">
                      #{startingIndex + index + 1}
                    </span>
                  </div>
                  <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-xs font-medium text-blue-700 group-hover:bg-blue-100 transition-colors duration-300">
                    <span className="material-symbols-outlined text-sm">
                      calendar_today
                    </span>
                    <span className="text-xs font-medium">{bill.M_DATE}</span>
                  </div>
                </div>

                {/* Enhanced Image and Content Grid */}
                <div
                  className="grid grid-cols-3 gap-4 p-4 cursor-pointer"
                  onClick={() => handleShowPopup(bill)}
                >
                  {/* Improved Image Section */}
                  <div className="col-span-1">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 group-hover:border-blue-100 transition-colors duration-300 shadow-sm">
                      <img
                        src={
                          bill.M_PART_IMG || "https://via.placeholder.com/64"
                        }
                        alt={bill.M_PART_IMG ? "Part" : "No Image"}
                        className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  {/* Improved Content Section */}
                  <div className="col-span-2 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors duration-300">
                        {bill.M_PART_NUMBER}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 group-hover:text-gray-600 transition-colors duration-300">
                        {bill.M_PART_DESCRIPTION}
                      </p>
                    </div>

                    {/* Enhanced Tags */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-xs font-medium text-blue-700 group-hover:bg-blue-100 transition-colors duration-300">
                        <span className="material-symbols-outlined text-sm mr-1">
                          inventory
                        </span>
                        {bill.M_QTY_RM}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-50 text-xs font-medium text-gray-600 group-hover:bg-gray-100 transition-colors duration-300">
                        {bill.M_SUBINV}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Footer */}
                <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-t flex justify-between items-center group-hover:from-blue-50 group-hover:to-white transition-colors duration-300">
                  <span className="text-xs font-medium text-gray-500 group-hover:text-gray-600">
                    JOB: {bill.M_SOURCE_LINE_ID}
                  </span>
                  <button
                    onClick={() => handleShowPopup(bill)}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow group-hover:scale-105"
                  >
                    <span className="material-symbols-outlined text-sm mr-1">
                      visibility
                    </span>
                    Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 animate-bounce">
                  inventory_2
                </span>
                <p className="text-gray-500 font-medium mb-1">
                  No inventory items found
                </p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your search criteria
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPopup && (
        <BillDetailPopup bill={selectedBill} onClose={handleClosePopup} />
      )}
    </div>
  );
};

export default BillTable;
