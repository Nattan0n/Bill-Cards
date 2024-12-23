import React, { useState, useEffect, useMemo } from "react";

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
  const [isProcessing, setIsProcessing] = useState(false);

  // Memoize unique values
  const uniqueValues = useMemo(() => {
    if (!bills?.length) return { partNumbers: [], subinvens: [] };
    return {
      partNumbers: [...new Set(bills.map(bill => bill.M_PART_NUMBER))],
      subinvens: [...new Set(bills.map(bill => bill.M_SUBINV))]
    };
  }, [bills]);

  const handleTypeChange = (type) => {
    if (isProcessing) return;
    setSelectedType(type);
    setSelectedValue("");
    setError("");
  };

  const handleValueChange = (e) => {
    if (isProcessing) return;
    setSelectedValue(e.target.value);
    setError("");
  };

  const handleGenerate = async () => {
    try {
      setIsProcessing(true);
      setError("");

      // Handle selected rows case
      if (selectedTableRows?.length > 0) {
        if (selectedTableRows.length > 50) {
          const confirmed = window.confirm(
            `You are trying to generate ${selectedTableRows.length} QR codes. This might take a while. Continue?`
          );
          if (!confirmed) {
            setIsProcessing(false);
            return;
          }
        }
        await onGenerate(selectedTableRows);
        onClose();
        return;
      }

      // Validate selection
      if (!selectedType) {
        setError("Please select generation type");
        return;
      }

      // Handle "Generate All" case
      if (selectedType === "all") {
        if (bills.length > 50) {
          const confirmed = window.confirm(
            `You are trying to generate ${bills.length} QR codes. This might take a while. Continue?`
          );
          if (!confirmed) {
            setIsProcessing(false);
            return;
          }
        }
        await onGenerate(bills);
        onClose();
        return;
      }

      // Validate value selection
      if (!selectedValue) {
        setError("Please select a value");
        return;
      }

      // Filter and generate based on selection
      let dataToGenerate = [];
      if (selectedType === "partno") {
        dataToGenerate = bills.filter(bill => bill.M_PART_NUMBER === selectedValue);
      } else if (selectedType === "subinven") {
        dataToGenerate = bills.filter(bill => bill.M_SUBINV === selectedValue);
      }

      if (dataToGenerate.length === 0) {
        setError("No matching records found");
        return;
      }

      await onGenerate(dataToGenerate);
      onClose();

    } catch (error) {
      console.error("Generation error:", error);
      setError(error.message || "An error occurred during generation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isProcessing) {
      const confirmClose = window.confirm(
        'Generation is in progress. Are you sure you want to cancel?'
      );
      if (!confirmClose) return;
    }
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 500);
  };

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setSelectedType("");
      setSelectedValue("");
      setError("");
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40">
      <div
        className="absolute inset-0 bg-gray-900/45 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        className={`rounded-3xl overflow-hidden bg-gray-800 divide-gray-600 dark:bg-gray-800 dark:divide-gray-600 z-10 w-11/12 max-w-lg animate__animated animate__faster ${
          isClosing ? "animate__zoomOut" : "animate__zoomIn"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <span className="material-symbols-outlined mr-2">qr_code_2</span>
              {selectedTableRows?.length > 0
                ? `Generate QR Codes (${selectedTableRows.length} selected)`
                : "Select QR Code Type"}
            </h2>
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="flex items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-red-500 text-white transition-all duration-200 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
          <div className="space-y-6">
            {/* Selected items info */}
            {selectedTableRows?.length > 0 && (
              <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200">
                  {selectedTableRows.length} items selected from table
                </p>
              </div>
            )}

            {/* Selection Type Buttons */}
            {(!selectedTableRows?.length) && (
              <>
                {["partno", "subinven", "all"].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    disabled={isProcessing}
                    className={`w-full p-4 rounded-lg transition-colors duration-200 ${
                      selectedType === type
                        ? "bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200"
                    } flex items-center justify-between disabled:opacity-50`}
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

                {/* Dropdown for selected type */}
                {selectedType && selectedType !== "all" && (
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Select {selectedType === "partno" ? "Part Number" : "Customer"}
                    </label>
                    <select
                      value={selectedValue}
                      onChange={handleValueChange}
                      disabled={isProcessing}
                      className="w-full p-3 border-0 rounded-lg bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="">Choose option...</option>
                      {(selectedType === "partno"
                        ? uniqueValues.partNumbers
                        : uniqueValues.subinvens
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
            disabled={isProcessing}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg font-medium text-gray-600 dark:text-gray-300 transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isProcessing}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 text-white hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <span className="material-symbols-outlined animate-spin">
                  sync
                </span>
                <span>Processing...</span>
              </>
            ) : (
              <span>Generate</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrCodeSelectionPopup;