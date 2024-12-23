// components/BillCard/Table/view/BillTable.jsx
import React, { useState, useCallback, useMemo } from "react";
import BillDetailPopup from "./BillDetail/BillDetailPopup";
import Card from "../common/Card";
import { PartImage } from "../../../../services/partImageService";

const BillTable = ({ bills, startingIndex = 0, onSelectedRowsChange }) => {
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);

  // Memoize selected bills data
  const selectedBillsData = useMemo(() => {
    return selectedRows.map(index => bills[index]);
  }, [bills, selectedRows]);

  // Optimize select all handler
  const handleSelectAll = useCallback(async (e) => {
    try {
      setIsProcessingSelection(true);
      const isChecked = e.target.checked;
      const newSelectedRows = isChecked ? bills.map((_, index) => index) : [];
      setSelectedRows(newSelectedRows);
      
      // Batch update selected bills
      await Promise.resolve();
      onSelectedRowsChange(isChecked ? bills : []);
    } finally {
      setIsProcessingSelection(false);
    }
  }, [bills, onSelectedRowsChange]);

  // Optimize individual row selection
  const handleSelectRow = useCallback(async (index, e) => {
    try {
      e?.stopPropagation();
      setIsProcessingSelection(true);

      setSelectedRows(prev => {
        const newSelectedRows = prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index];

        // Update selected bills data through callback
        const selectedBills = newSelectedRows.map(idx => bills[idx]);
        onSelectedRowsChange(selectedBills);

        return newSelectedRows;
      });
    } finally {
      setIsProcessingSelection(false);
    }
  }, [bills, onSelectedRowsChange]);

  // Optimize popup handling
  const handleShowPopup = useCallback((bill) => {
    setSelectedBill(bill);
    setShowPopup(true);
  }, []);

  const handleClosePopup = useCallback(() => {
    setShowPopup(false);
    setSelectedBill(null);
  }, []);

  // Memoize selection status for performance
  const selectionStatus = useMemo(() => ({
    totalSelected: selectedRows.length,
    totalItems: bills.length,
    isAllSelected: selectedRows.length === bills.length,
    hasSelections: selectedRows.length > 0
  }), [selectedRows.length, bills.length]);

  // Status indicator component
  const SelectionStatus = useCallback(() => (
    <div className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
      {selectionStatus.totalSelected}/{selectionStatus.totalItems} selected
    </div>
  ), [selectionStatus]);
  
  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:block">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 rounded-t-2xl px-6 py-4 shadow-lg animate-gradient">
          <h2 className="text-xl font-semibold text-white flex items-center justify-between">
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-3 text-2xl animate-bounce">
                inventory_2
              </span>
              <div>
                <p className="text-lg font-bold">Part List</p>
                <p className="text-xs text-blue-100 mt-0.5">
                  Manage bill card inventory
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
              <thead className="bg-gray-50 sticky top-0">
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 w-[50px]">
                    <div className="flex items-center justify-center">
                      <div className="relative inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.length === bills.length}
                          onChange={handleSelectAll}
                          className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity hover:before:opacity-10 checked:border-blue-500 checked:bg-blue-500 checked:before:bg-blue-500"
                        />
                        <span className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="1"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </div>
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
                    SubInventory
                  </th>
                  <th className="p-4 text-xs font-semibold text-left text-gray-600 uppercase">
                    Transaction Type
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
                      <td className="p-4 w-[50px]">
                        <div className="flex items-center justify-center">
                          <div className="relative inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(index)}
                              onChange={(e) => handleSelectRow(index, e)}
                              className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity hover:before:opacity-10 checked:border-blue-500 checked:bg-blue-500 checked:before:bg-blue-500"
                            />
                            <span className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                stroke="currentColor"
                                strokeWidth="1"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-900">
                        {startingIndex + index + 1}
                      </td>
                      {/* <td className="p-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 group-hover:border-blue-100 transition-all duration-300 shadow-sm">
                          <img
                            src={bill.M_PART_IMG || "https://via.placeholder.com/64"}
                            alt={bill.M_PART_DESCRIPTION || "Part image"}
                            className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      </td> */}
                      {/* <td className="p-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 group-hover:border-blue-100 transition-all duration-300 shadow-sm">
                          <img
                            src={"http://127.0.0.1:8000/storage/images/KMks9OZEMYhO7Xilev6uykB48gRW1DvrntbEPx1M.png"}
                            alt={bill.M_PART_DESCRIPTION || "Part image"}
                            className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      </td> */}
                      <td className="p-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 group-hover:border-blue-100 transition-all duration-300 shadow-sm">
                          {console.log(
                            "Rendering image for part:",
                            bill.m_part_number
                          )}{" "}
                          {/* Debug log */}
                          <PartImage
                              partNumber={bill.M_PART_NUMBER}
                              partName={bill.M_PART_DESCRIPTION}
                              width="w-20"
                              height="h-20"
                              className="object-cover transform transition-transform duration-300 group-hover:scale-105"
                              showError={false}
                          />
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-900 group-hover:text-blue-600">
                        {bill.M_PART_NUMBER}
                      </td>
                      <td className="p-4 text-sm text-gray-600 max-w-xs">
                        <p className="line-clamp-2">
                          {bill.M_PART_DESCRIPTION}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-50 text-xs font-medium text-gray-600">
                          {bill.M_SUBINV}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-xs font-medium text-indigo-700">
                          {bill.TRANSACTION_TYPE_NAME}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-xs font-medium text-blue-700">
                          <span className="material-symbols-outlined text-sm mr-1">
                            calendar_today
                          </span>
                          {bill.M_DATE}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg ${
                            bill.totalQty > 0
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          } text-xs font-medium`}
                        >
                          <span className="material-symbols-outlined text-sm mr-1">
                            {bill.totalQty > 0 ? "add_circle" : "remove_circle"}
                          </span>
                          {bill.totalQty}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleShowPopup(bill)}
                          className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 text-white hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 text-xs font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow group-hover:scale-105"
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
      <div className="block md:hidden">
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 px-4 py-4 shadow-lg animate-gradient sticky top-0 z-0">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <span className="material-symbols-outlined mr-3 text-2xl animate-bounce">
                inventory_2
              </span>
              <div>
                <p className="text-lg font-bold">Part List</p>
                <p className="text-xs text-blue-100 mt-0.5">
                  Manage bill card inventory
                </p>
              </div>
            </h2>
          </div>
        </div>

        {/* Select All Section for Mobile */}
        <div className="sticky bottom-0 z-0 bg-white/90 backdrop-blur-md shadow-md border-t border-gray-200">
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3 group cursor-pointer">
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === bills.length}
                    onChange={handleSelectAll}
                    className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity hover:before:opacity-10 checked:border-blue-500 checked:bg-blue-500 checked:before:bg-blue-500"
                  />
                  <span className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Select All
                </span>
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-gradient-to-r from-indigo-600 to-blue-700 text-white px-3 py-1.5 rounded-full font-medium shadow-sm">
                  {selectedRows.length}/{bills.length} selected
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative p-4 space-y-4 max-w-md mx-auto">
          {bills.length > 0 ? (
            bills.map((bill, index) => (
              <Card
                key={index}
                bill={bill}
                index={index}
                selectedRows={selectedRows}
                handleSelectRow={handleSelectRow}
                handleShowPopup={handleShowPopup}
              />
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

      {/* Bill Detail Popup */}
      {showPopup && selectedBill && (
        <BillDetailPopup 
          bill={selectedBill} 
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
};

export default BillTable;
