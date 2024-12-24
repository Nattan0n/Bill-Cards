import React, { useState, useEffect } from "react";

const QrCodeSelectionPopup = ({
  isOpen,
  onClose,
  bills,
  onGenerate,
  selectedTableRows,
}) => {
  const [selectedType, setSelectedType] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [error, setError] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  // Get unique values for dropdowns
  const uniquePartNumbers = [
    ...new Set(bills.map((bill) => bill.M_PART_NUMBER)),
  ];
  const uniqueSubinvens = [...new Set(bills.map((bill) => bill.M_SUBINV))];

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setSelectedValue("");
    setError("");
  };

  const handleValueChange = (e) => {
    setSelectedValue(e.target.value);
    setError("");
  };

  const handleGenerate = () => {
    // ถ้ามีการเลือก checkbox ให้ใช้เฉพาะ checkbox เสมอ
    if (selectedTableRows && selectedTableRows.length > 0) {
      console.log("Using selected rows:", selectedTableRows.length);
      onGenerate(selectedTableRows);
      onClose();
      return;
    }

    // ถ้าไม่มี checkbox แต่เลือก type
    if (!selectedType) {
      setError("Please select generation type");
      return;
    }

    if (selectedType === "all") {
      // ถ้าเลือก all และไม่มี checkbox ให้ใช้ข้อมูลทั้งหมด
      onGenerate(bills);
      onClose();
      return;
    }

    // ถ้าเลือก type อื่นที่ไม่ใช่ all ต้องเลือก value
    if (!selectedValue) {
      setError("Please select a value");
      return;
    }

    // กรองตาม type และ value
    let dataToGenerate = [];
    if (selectedType === "partno") {
      dataToGenerate = bills.filter(
        (bill) => bill.M_PART_NUMBER === selectedValue
      );
    } else if (selectedType === "subinven") {
      dataToGenerate = bills.filter((bill) => bill.M_SUBINV === selectedValue);
    }

    if (dataToGenerate.length === 0) {
      setError("No matching records found");
      return;
    }

    onGenerate(dataToGenerate);
    onClose();
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 500); // ให้เวลาในการเล่น animation ก่อนที่จะปิด
  };

  // Reset state เมื่อเปิด popup
  useEffect(() => {
    if (isOpen) {
      setSelectedType("");
      setSelectedValue("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  return (
    <div>
      {/* Desktop/Mobile View */}
      <div className="fixed inset-0 flex items-center justify-center z-40">
        <div
          className="absolute inset-0 bg-gray-900/45 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
          aria-hidden="true"
        ></div>
        <div
          className={`rounded-3xl overflow-hidden bg-gray-800 divide-gray-600 dark:bg-gray-800 dark:divide-gray-600 z-10 w-11/12 max-w-lg animate__animated animate__faster ${
            isClosing ? "animate__zoomOut" : "animate__zoomIn"
          }`}
          role="dialog"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-800 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <span className="material-symbols-outlined mr-2">qr_code_2</span>
              {selectedTableRows && selectedTableRows.length > 0
                ? `Generate QR Codes (${selectedTableRows.length} selected)`
                : "Select QR Code Type"}
            </h2>
            <button
              onClick={onClose}
              className="flex items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-red-500 text-white transition-all duration-200 backdrop-blur-sm group"
            >
              <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-200">
                close
              </span>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
            <div className="space-y-6">
              {/* Show selected items info if any */}
              {selectedTableRows && selectedTableRows.length > 0 && (
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-200">
                    {selectedTableRows.length} items selected from table. Click
                    Generate to create QR codes for selected items.
                  </p>
                </div>
              )}

              {/* Selection Type Buttons - show only if no items selected */}
              {(!selectedTableRows || selectedTableRows.length === 0) && (
                <>
                  {["partno", "subinven", "all"].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeChange(type)}
                      className={`w-full p-4 rounded-lg transition-colors duration-200 ${
                        selectedType === type
                          ? "bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200"
                      } flex items-center justify-between`}
                    >
                      <span className="font-medium">
                        {type === "partno"
                          ? "Generate by Part NO."
                          : type === "subinven"
                          ? "Generate by Customer"
                          : "Generate All List"}
                      </span>
                      <span className="material-symbols-outlined">
                        {selectedType === type
                          ? "radio_button_checked"
                          : "radio_button_unchecked"}
                      </span>
                    </button>
                  ))}

                  {/* Dropdown */}
                  {selectedType && selectedType !== "all" && (
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                        Select{" "}
                        {selectedType === "partno" ? "Part Number" : "Customer"}
                      </label>
                      <select
                        value={selectedValue}
                        onChange={handleValueChange}
                        className="w-full p-3 border-0 rounded-lg bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Choose option...</option>
                        {(selectedType === "partno"
                          ? uniquePartNumbers
                          : uniqueSubinvens
                        ).map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 text-red-800 p-4 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-2 px-6 py-4 bg-gray-100 dark:bg-gray-800">
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg font-medium text-gray-600 dark:text-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 text-white hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 rounded-lg font-medium transition-colors duration-200"
            >
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCodeSelectionPopup;