import React, { useState, useEffect } from "react";
import LoadingPopup from "./LoadingPopup";

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
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const handleGenerate = async () => {
    setIsLoading(true);
    setProgress(0);
    try {
      let dataToGenerate = [];
      
      // Check for selected rows first
      if (selectedTableRows && selectedTableRows.length > 0) {
        dataToGenerate = selectedTableRows;
      } 
      // If no rows selected, check selection type
      else if (!selectedType) {
        setError("Please select generation type");
        setIsLoading(false);
        return;
      }
      // Handle "all" type
      else if (selectedType === "all") {
        dataToGenerate = bills;
      }
      // Handle other types that require a value
      else if (!selectedValue) {
        setError("Please select a value");
        setIsLoading(false);
        return;
      }
      // Filter by part number
      else if (selectedType === "partno") {
        dataToGenerate = bills.filter(
          (bill) => bill.M_PART_NUMBER === selectedValue
        );
      }
      // Filter by subinventory
      else if (selectedType === "subinven") {
        dataToGenerate = bills.filter((bill) => bill.M_SUBINV === selectedValue);
      }

      // Check if we have data to process
      if (dataToGenerate.length === 0) {
        setError("No matching records found");
        setIsLoading(false);
        return;
      }

      // Calculate processing time based on data size
      const timePerItem = Math.max(50, Math.min(100, 1000 / dataToGenerate.length));
      const totalTime = timePerItem * dataToGenerate.length;
      let processedItems = 0;

      // Process items with progress updates
      for (const item of dataToGenerate) {
        await new Promise(resolve => setTimeout(resolve, timePerItem));
        processedItems++;
        setProgress((processedItems / dataToGenerate.length) * 100);
      }

      // Ensure minimum loading time
      const minimumLoadingTime = 1000;
      const remainingTime = minimumLoadingTime - totalTime;
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      // Generate QR codes
      await onGenerate(dataToGenerate);
      onClose();
    } catch (error) {
      console.error("Error generating QR codes:", error);
      setError("An error occurred while generating QR codes");
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, 500); // Animation duration
    }
  };

  // Reset state when popup opens
  useEffect(() => {
    if (isOpen) {
      setSelectedType("");
      setSelectedValue("");
      setError("");
      setIsLoading(false);
      setProgress(0);
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  return (
    <>
      {isLoading && <LoadingPopup progress={progress} />}
      <div className="fixed inset-0 flex items-center justify-center z-40">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-gray-900/45 backdrop-blur-sm transition-opacity"
          onClick={!isLoading ? handleClose : undefined}
          aria-hidden="true"
        ></div>

        {/* Modal */}
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
            {!isLoading && (
              <button
                onClick={handleClose}
                className="flex items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-red-500 text-white transition-all duration-200 backdrop-blur-sm group"
              >
                <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-200">
                  close
                </span>
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
            <div className="space-y-6">
              {/* Selected items info */}
              {selectedTableRows && selectedTableRows.length > 0 && (
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-200">
                    {selectedTableRows.length} items selected from table. Click
                    Generate to create QR codes for selected items.
                  </p>
                </div>
              )}

              {/* Selection Type Buttons */}
              {(!selectedTableRows || selectedTableRows.length === 0) && (
                <>
                  {["partno", "subinven", "all"].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeChange(type)}
                      disabled={isLoading}
                      className={`w-full p-4 rounded-lg transition-colors duration-200 ${
                        selectedType === type
                          ? "bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200"
                      } flex items-center justify-between ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
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

                  {/* Dropdown for part number or customer selection */}
                  {selectedType && selectedType !== "all" && (
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                        Select{" "}
                        {selectedType === "partno" ? "Part Number" : "Customer"}
                      </label>
                      <select
                        value={selectedValue}
                        onChange={handleValueChange}
                        disabled={isLoading}
                        className={`w-full p-3 border-0 rounded-lg bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 ${
                          isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
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
              disabled={isLoading}
              className={`px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg font-medium text-gray-600 dark:text-gray-300 transition-colors duration-200 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`px-6 py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 text-white hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 rounded-lg font-medium transition-colors duration-200 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QrCodeSelectionPopup;