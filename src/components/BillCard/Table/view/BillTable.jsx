// components/BillCard/Table/view/BillTable.jsx
import React, { useState, useCallback, useMemo } from "react";
import BillDetailPopup from "./BillDetail/BillDetailPopup";
import Card from "../common/Card";
import TableLoadingAnimation from "./TableLoadingAnimation";
import { PartImage } from "../../../../services/partImageService";

// Row component for better performance
const TableRow = React.memo(({ 
  bill, 
  index, 
  startingIndex, 
  selectedRows, 
  handleSelectRow,
  isLoading, 
  handleShowPopup 
}) => (
  <tr className="group hover:bg-blue-50/50 transition-colors duration-200">
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
    <td className="p-4 text-base font-medium text-gray-900">
      {startingIndex + index + 1}
    </td>
    <td className="p-4">
      <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 group-hover:border-blue-100 transition-all duration-300 shadow-sm">
        <PartImage
          partNumber={bill.M_PART_NUMBER}
          partName={bill.M_PART_DESCRIPTION}
          width="w-28"
          height="h-28"
          className="object-cover transform transition-transform duration-300 group-hover:scale-105"
          showError={false}
        />
      </div>
    </td>
    <td className="p-4 text-base font-medium text-gray-900 group-hover:text-blue-600">
      {bill.M_PART_NUMBER}
    </td>
    <td className="p-4 text-base text-gray-600 max-w-xs">
      <p className="line-clamp-2">{bill.M_PART_DESCRIPTION}</p>
    </td>
    <td className="p-4">
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-orange-50 text-base font-medium text-orange-600">
        {bill.M_SUBINV}
      </span>
    </td>
    {/* <td className="p-4">
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-xs font-medium text-indigo-700">
        {bill.TRANSACTION_TYPE_NAME}
      </span>
    </td>
    <td className="p-4">
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-xs font-medium text-blue-700">
        <span className="material-symbols-outlined text-base mr-1">calendar_today</span>
        {bill.M_DATE}
      </span>
    </td>
    <td className="p-4">
      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg ${
        bill.totalQty > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
      } text-xs font-medium`}>
       <span className="material-symbols-outlined text-base mr-1">
          {bill.totalQty > 0 ? "add_circle" : "remove_circle"}
        </span>
        {bill.totalQty}
      </span>
    </td> */}
    <td className="p-4">
      <button
        onClick={() => handleShowPopup(bill)}
        className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 text-white hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 text-base font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow group-hover:scale-105"
      >
        <span className="material-symbols-outlined text-base mr-1">visibility</span>
        Details
      </button>
    </td>
  </tr>
));

const BillTable = ({ bills, startingIndex = 0, onSelectedRowsChange,isLoading = false }) => {
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);

  // Handlers
  const handleSelectAll = useCallback(
    async (e) => {
      if (isProcessingSelection) return;
      try {
        setIsProcessingSelection(true);
        const isChecked = e.target.checked;
        const newSelectedRows = isChecked ? bills.map((_, index) => index) : [];
        setSelectedRows(newSelectedRows);
        await Promise.resolve();
        onSelectedRowsChange(isChecked ? bills : []);
      } finally {
        setIsProcessingSelection(false);
      }
    },
    [bills, onSelectedRowsChange, isProcessingSelection]
  );

  const handleSelectRow = useCallback(
    async (index, e) => {
      if (isProcessingSelection) return;
      try {
        e?.stopPropagation();
        setIsProcessingSelection(true);
        setSelectedRows((prev) => {
          const newSelectedRows = prev.includes(index)
            ? prev.filter((i) => i !== index)
            : [...prev, index];
          const selectedBills = newSelectedRows.map((idx) => bills[idx]);
          onSelectedRowsChange(selectedBills);
          return newSelectedRows;
        });
      } finally {
        setIsProcessingSelection(false);
      }
    },
    [bills, onSelectedRowsChange, isProcessingSelection]
  );

  const handleShowPopup = useCallback((bill) => {
    setSelectedBill(bill);
    setShowPopup(true);
  }, []);

  const handleClosePopup = useCallback(() => {
    setShowPopup(false);
    setSelectedBill(null);
  }, []);

  // Shared selection controls
  const SelectionControls = () => (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        checked={selectedRows.length === bills.length}
        onChange={handleSelectAll}
        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity hover:before:opacity-10 checked:border-blue-500 checked:bg-blue-500 checked:before:bg-blue-500"
        disabled={isProcessingSelection}
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
  );

  // Selection status component
  const SelectionStatus = useMemo(() => (
    <div className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
      {selectedRows.length}/{bills.length} selected
    </div>
  ), [selectedRows.length, bills.length]);


    // Show loading animation when loading
    if (isLoading) {
      return <TableLoadingAnimation />;
    }

  return (
    <div className="w-full">
      {/* Common Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 sm:rounded-t-2xl px-6 py-4 shadow-lg animate-gradient">
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
          {SelectionStatus}
        </h2>
      </div>

      <div className="bg-white rounded-b-2xl shadow-lg overflow-hidden border border-gray-200">
        {/* Selection Controls for Mobile */}
        <div className="block md:hidden sticky top-0 z-0 bg-white border-b border-gray-200">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SelectionControls />
              <span className="text-base text-gray-600">Select All</span>
            </div>
          </div>
        </div>

        {/* Table/Cards Container */}
        <div className="divide-y divide-gray-200">
          {bills.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 w-[50px]">
                        <SelectionControls />
                      </th>
                      <th className="p-4 text-sm font-semibold text-left text-gray-600 uppercase">No.</th>
                      <th className="p-4 text-sm font-semibold text-left text-gray-600 uppercase">Image</th>
                      <th className="p-4 text-sm font-semibold text-left text-gray-600 uppercase">Part No.</th>
                      <th className="p-4 text-sm font-semibold text-left text-gray-600 uppercase">Part Name</th>
                      <th className="p-4 text-sm font-semibold text-left text-gray-600 uppercase">SubInventory</th>
                      {/* <th className="p-4 text-sm font-semibold text-left text-gray-600 uppercase">Transaction Type</th>
                      <th className="p-4 text-sm font-semibold text-left text-gray-600 uppercase">Date</th>
                      <th className="p-4 text-sm font-semibold text-left text-gray-600 uppercase">Quantity</th> */}
                      <th className="p-4 text-sm font-semibold text-left text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill, index) => (
                      <TableRow
                        key={`${bill.M_PART_NUMBER}-${index}`}
                        bill={bill}
                        index={index}
                        startingIndex={startingIndex}
                        selectedRows={selectedRows}
                        handleSelectRow={handleSelectRow}
                        handleShowPopup={handleShowPopup}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden">
                <div className="space-y-4 p-4">
                  {bills.map((bill, index) => (
                    <Card
                      key={`${bill.M_PART_NUMBER}-${index}`}
                      bill={bill}
                      index={index}
                      startingIndex={startingIndex}
                      selectedRows={selectedRows}
                      handleSelectRow={handleSelectRow}
                      handleShowPopup={handleShowPopup}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-8">
              <div className="flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 animate-bounce">
                  inventory_2
                </span>
                <p className="text-gray-500 font-medium mb-1">
                  No inventory items found
                </p>
                <p className="text-gray-400 text-base">
                  Try adjusting your search criteria
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popup */}
      {showPopup && selectedBill && (
        <BillDetailPopup bill={selectedBill} onClose={handleClosePopup} />
      )}
    </div>
  );
};

export default React.memo(BillTable);