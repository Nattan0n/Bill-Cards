import React, { useState } from "react";
import BillDetailPopup from "../BillDetailPopup";
import QrCodePopup from "../QrCodePopup";

const BillTable = ({ bills, startingIndex = 0, onSelectedRowsChange }) => {
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showQrPopup, setShowQrPopup] = useState(false);
  const [currentBillIndex, setCurrentBillIndex] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  // ฟังก์ชันสำหรับเลือกทั้งหมด
  const handleSelectAll = (e) => {
    const newSelectedRows = e.target.checked ? bills.map((_, index) => index) : [];
    setSelectedRows(newSelectedRows);
    // ส่งข้อมูลที่เลือกกลับไปยัง parent
    onSelectedRowsChange(e.target.checked ? bills : []);
  };

  // ฟังก์ชันสำหรับเลือกแถวเดียว
  const handleSelectRow = (index) => {
    setSelectedRows(prev => {
      const newSelectedRows = prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index];

      // ส่งข้อมูลที่เลือกกลับไปยัง parent
      const selectedBills = newSelectedRows.map(idx => bills[idx]);
      onSelectedRowsChange(selectedBills);

      return newSelectedRows;
    });
  };
  const handleShowPopup = (bill) => {
    setSelectedBill(bill);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedBill(null);
  };

  const handleShowQrPopup = (bill, index) => {
    setSelectedBill(bill);
    setCurrentBillIndex(index);
    setShowQrPopup(true);
  };

  const handleCloseQrPopup = () => {
    setShowQrPopup(false);
    setSelectedBill(null);
    setCurrentBillIndex(null);
  };

  const handleQrCodeReady = (dataUrl) => {
    setQrCodeDataUrls((prev) => {
      const newUrls = [...prev];
      newUrls[currentBillIndex] = dataUrl;
      return newUrls;
    });
  };

  return (
    <div className="relative overflow-x-auto sm:rounded-lg">
      {/* Desktop View */}
      <div className="hidden md:block">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 rounded-t-lg overflow-hidden">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
                            <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedRows.length === bills.length}
                  onChange={handleSelectAll}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </th>
              <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 whitespace-nowrap">
                NO.
              </th>
              <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 whitespace-nowrap">
                Image
              </th>
              <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 whitespace-nowrap">
                Part No.
              </th>
              <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 whitespace-nowrap">
                Part Name
              </th>
              <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 whitespace-nowrap">
                Customer
              </th>
              <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 whitespace-nowrap">
                JOB NO.
              </th>
              <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 whitespace-nowrap">
                Date
              </th>
              {/* <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 whitespace-nowrap">
                quantity sold
              </th> */}
              <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 whitespace-nowrap">
                Quantity Remaining
              </th>
              <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-600">
            {bills.length > 0 ? (
              bills.map((bill, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="p-4 text-sm font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(index)}
                      onChange={() => handleSelectRow(index)}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4 text-sm font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {startingIndex + index + 1}
                  </td>
                  <td className="p-4 text-sm font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    <img
                      src={bill.M_PART_IMG || "https://via.placeholder.com/64"}
                      alt={bill.M_PART_IMG ? "Bill" : "No Image Available"}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </td>
                  <td className="p-4 text-sm font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {bill.M_PART_NUMBER}
                  </td>
                  <td className="p-4 text-sm font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {bill.M_PART_DESCRIPTION}
                  </td>
                  <td className="p-4 text-sm font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {bill.M_SUBINV}
                  </td>
                  <td className="p-4 text-sm font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {bill.M_SOURCE_LINE_ID}
                  </td>
                  <td className="p-4 text-sm font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {bill.M_DATE}
                  </td>
                  {/* <td className="p-4 text-sm font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {bill.M_QTY}
                  </td> */}
                  <td className="p-4 text-sm font-normal text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {bill.M_QTY_RM}
                  </td>
                  <td className="p-4 text-sm font-normal text-gray-500 dark:text-gray-400 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleShowPopup(bill)}
                      className="text-white bg-sky-500 hover:bg-sky-600 focus:ring-4 focus:ring-yellow-50 font-medium rounded-lg text-sm px-5 py-2.5 flex mr-3"
                    >
                      <span className="material-symbols-outlined">
                        visibility
                      </span>
                    </button>
                    {/* <button
                      type="button"
                      onClick={() => handleShowQrPopup(bill)}
                      className="text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-yellow-50 font-medium rounded-lg text-sm px-5 py-2.5 flex mr-3"
                    >
                      <span className="material-symbols-outlined">
                        qr_code_2_add
                      </span>
                    </button> */}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="12"
                  className="p-20 text-center text-gray-500 dark:text-gray-400"
                >
                  No bills found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Card view for mobile screens */}
      <div className="block md:hidden overflow-x-auto pb-1.5">
        {bills.length > 0 ? (
          bills.map((bill, index) => (
            <div
              key={index}
              className="relative bg-white dark:bg-gray-800 rounded-lg mb-4 shadow-lg shadow-slate-900/40 m-4"
              onClick={() => handleShowPopup(bill)}
            >
              <img
                src={bill.M_PART_IMG || "https://via.placeholder.com/64"}
                alt="Bill"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute bottom-0 w-full p-4 bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 shadow-md rounded-b-lg">
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {bill.M_PART_NUMBER}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Quantity: {bill.M_QTY}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 text-center text-gray-500 dark:text-gray-400">
            No bills found
          </div>
        )}
      </div>

      {/* แสดง Popup ถ้ามีการเปิด */}
      {showPopup && (
        <BillDetailPopup bill={selectedBill} onClose={handleClosePopup} />
      )}
    </div>
  );
};

export default BillTable;
