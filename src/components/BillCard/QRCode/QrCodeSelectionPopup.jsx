import React, { useState, useEffect, useMemo } from "react";
import LoadingPopup from "./LoadingPopup";

const QrCodeSelectionPopup = ({
  isOpen,
  onClose,
  bills,
  onGenerate,
  selectedTableRows,
}) => {
  const [selectedType, setSelectedType] = useState("");
  const [selectedValues, setSelectedValues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Get unique values for dropdown with sorting
  const uniquePartNumbers = useMemo(() => {
    return [...new Set(bills.map((bill) => bill.M_PART_NUMBER))]
      .sort((a, b) => a.localeCompare(b));
  }, [bills]);

  // Filter Part Numbers based on search term
  const filteredPartNumbers = useMemo(() => {
    if (!searchTerm) return uniquePartNumbers;
    
    return uniquePartNumbers.filter(part => 
      part.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [uniquePartNumbers, searchTerm]);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setSelectedValues([]);
    setSearchTerm('');
    setError("");
  };

  const handleValueChange = (e) => {
    const value = e.target.value;
    setSelectedValues(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
    setError("");
  };

  const handleSelectAll = () => {
    setSelectedValues(prev => 
      prev.length === filteredPartNumbers.length 
        ? [] // If all are already selected, clear selection
        : [...filteredPartNumbers] // Select all filtered parts
    );
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
      // Handle part number selection
      else if (selectedType === "partno") {
        if (selectedValues.length === 0) {
          setError("Please select at least one Part Number");
          setIsLoading(false);
          return;
        }
        dataToGenerate = bills.filter(
          (bill) => selectedValues.includes(bill.M_PART_NUMBER)
        );
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
      setSelectedValues([]);
      setSearchTerm('');
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
                  {["partno", "all"].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeChange(type)}
                      disabled={isLoading}
                      className={`w-full p-4 rounded-lg transition-colors duration-200 ${
                        selectedType === type
                          ? "bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 text-white"
                          : "bg-gray-700 text-gray-400 hover:bg-gray-200"
                      } flex items-center justify-between ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <span className="font-medium">
                        {type === "partno"
                          ? "Generate by Part NO."
                          : "Generate All List"}
                      </span>
                      <span className="material-symbols-outlined">
                        {selectedType === type
                          ? "radio_button_checked"
                          : "radio_button_unchecked"}
                      </span>
                    </button>
                  ))}

                  {/* Dropdown for part number selection */}
                  {selectedType === "partno" && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      {/* Search input */}
                      <div className="mb-2">
                        <input
                          type="text"
                          placeholder="Search Part Number..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Select Part Number ({filteredPartNumbers.length})
                        </label>
                        <button 
                          onClick={handleSelectAll}
                          className="text-xs text-blue-300 hover:text-blue-100"
                        >
                          {selectedValues.length === filteredPartNumbers.length 
                            ? "Deselect All" 
                            : "Select All"}
                        </button>
                      </div>
                      <div 
                        className="max-h-64 overflow-y-auto border border-gray-600 rounded-lg"
                      >
                        {filteredPartNumbers.map((value) => (
                          <div 
                            key={value}
                            className={`flex items-center p-2 cursor-pointer transition-colors 
                              ${selectedValues.includes(value) 
                                ? 'bg-blue-600/20' 
                                : 'hover:bg-gray-600 hover:bg-opacity-50'}`}
                            onClick={() => handleValueChange({ target: { value } })}
                          >
                            <div 
                              className={`w-5 h-5 mr-3 border-2 rounded flex items-center justify-center 
                              ${selectedValues.includes(value) 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'bg-transparent border-gray-400'}`}
                            >
                              {selectedValues.includes(value) && (
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-4 w-4 text-white" 
                                  viewBox="0 0 20 20" 
                                  fill="currentColor"
                                >
                                  <path 
                                    fillRule="evenodd" 
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                    clipRule="evenodd" 
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 text-sm text-gray-200">
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>
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
          <div className="flex justify-end space-x-2 px-6 py-4 bg-gray-800">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className={`px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-gray-300 transition-colors duration-200 ${
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
              {(() => {
                // Check if rows are selected from table
                if (selectedTableRows?.length > 0) {
                  return `Generate (${selectedTableRows.length})`;
                }
                // If using "Generate All" option
                if (selectedType === "all") {
                  return `Generate (${bills.length})`;
                }
                // If selecting specific part numbers
                if (selectedType === "partno") {
                  return `Generate (${selectedValues.length})`;
                }
                // Default case
                return "Generate";
              })()}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QrCodeSelectionPopup;