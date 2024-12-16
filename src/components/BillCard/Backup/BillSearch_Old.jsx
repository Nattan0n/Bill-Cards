// components/BillSearch.jsx
import React, { useState, useRef, useEffect } from "react";
import ScanQrCodePopup from "../QRCode/ScanQrCodePopup";
import QrCodePopup from "../QRCode/QrCodePopup";
import QrCodeSelectionPopup from "./QrCodeSelectionPopup";
import DateFilterPopup from "../Search/view/DateFilterPopup";

const BillSearch = ({
  onSearch,
  onExport,
  bills,
  onFilterChange,
  isFiltered,
  defaultDates,
  filteredBills,
  selectedTableRows,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showQrPopup, setShowQrPopup] = useState(false);
  const [showQrSelectionPopup, setShowQrSelectionPopup] = useState(false);
  const [selectedBillsForQr, setSelectedBillsForQr] = useState([]);
  const [isDateFilterPopupOpen, setIsDateFilterPopupOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value.replace(/\s+/g, "").trim());
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenDateFilterPopup = () => {
    setIsDateFilterPopupOpen(true);
  };

  const handleCloseDateFilterPopup = () => {
    setIsDateFilterPopupOpen(false);
  };

  const handleApplyDateFilter = (dateRange) => {
    onFilterChange(dateRange);
    setIsDateFilterPopupOpen(false);
  };

  const handleOpenQrSelection = () => {
    setShowQrSelectionPopup(true);
  };

  const handleCloseQrSelection = () => {
    setShowQrSelectionPopup(false);
  };

  const handleGenerateQr = (selectedBills) => {
    setSelectedBillsForQr(selectedBills);
    setShowQrPopup(true);
  };

  const handleCloseQrPopup = () => {
    setShowQrPopup(false);
    setSelectedBillsForQr([]);
  };

  return (
    <div>
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="rounded-2xl mb-6 overflow-visible sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm bg-opacity-90 z-10 shadow-lg">
          <div className="p-4">
            <div className="flex justify-between items-center gap-4">
              {/* Search Input Group */}
              <div className="w-96">
                <div className="relative flex items-center">
                  {/* Search Icon */}
                  <div className="absolute left-3 text-blue-600">
                    <svg
                      className="w-5 h-5 transition-transform duration-200 group-focus-within:scale-110"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                  </div>

                  {/* Search Input */}
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search bills by Part NO. or Part Name"
                    className="w-full pl-10 pr-12 py-2.5 text-sm bg-white border border-blue-100 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:border-transparent outline-none transition-all duration-200"
                  />

                  {/* QR Scanner Button */}
                  <div className="relative group">
                    <button
                      onClick={openModal}
                      className="absolute right-0 h-full px-3 flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors rounded"
                    >
                      <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
                        qr_code_scanner
                      </span>
                    </button>

                    {/* QR Scanner Hover Popup */}
                    <div
                      className="invisible group-hover:visible absolute right-0 top-4 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100
                      before:content-[''] before:absolute before:top-[-6px] before:right-5 
                      before:w-3 before:h-3 before:bg-gradient-to-r before:from-blue-700 before:to-blue-800
                      before:rotate-45 before:border-l before:border-t before:border-gray-100"
                    >
                      <div className="px-4 py-3 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 rounded-t-lg border-b">
                        <h3 className="font-medium text-white">Scan QR Code</h3>
                      </div>
                      <div className="px-4 py-2">
                        <p className="text-sm text-gray-600">
                          Scan QR code to search for specific items quickly
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Group */}
              <div className="flex items-center gap-3">
                {/* Date Filter Button */}
                <div className="relative group">
                  <button
                    onClick={handleOpenDateFilterPopup}
                    className={`flex items-center px-4 py-2.5 ${
                      isFiltered
                        ? "bg-blue-100 text-blue-700"
                        : "bg-white text-gray-700"
                    } rounded-xl border border-blue-100 shadow-sm hover:bg-blue-50 transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2`}
                  >
                    <span className="material-symbols-outlined mr-2 text-blue-600 group-hover:scale-110 transition-transform">
                      filter_alt
                    </span>
                    <span className="text-sm">Date Filter</span>
                  </button>

                  {/* Date Filter Hover Popup */}
                  <div
                    className="invisible group-hover:visible absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100
                    before:content-[''] before:absolute before:top-[-6px] before:right-5 
                    before:w-3 before:h-3 before:bg-gradient-to-r before:from-blue-700 before:to-blue-800
                    before:rotate-45 before:border-l before:border-t before:border-gray-100"
                  >
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 rounded-t-lg">
                      <h3 className="font-medium text-white">Date Filter</h3>
                    </div>
                    <div className="px-4 py-2">
                      <p className="text-sm text-gray-600">
                        Filter data by selecting a specific date range
                      </p>
                    </div>
                  </div>
                </div>

                {/* Generate QR Button */}
                <div className="relative group">
                  <button
                    onClick={handleOpenQrSelection}
                    className="flex items-center px-4 py-2.5 bg-white text-gray-700 rounded-xl border border-blue-100 shadow-sm hover:bg-blue-50 transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    <span className="material-symbols-outlined mr-2 text-purple-600 group-hover:scale-110 transition-transform">
                      qr_code_2_add
                    </span>
                    <span className="text-sm">Generate QR</span>
                  </button>

                  {/* Generate QR Hover Popup */}
                  <div
                    className="invisible group-hover:visible absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100
                    before:content-[''] before:absolute before:top-[-6px] before:right-5 
                    before:w-3 before:h-3 before:bg-gradient-to-r before:from-blue-700 before:to-blue-800
                    before:rotate-45 before:border-l before:border-t before:border-gray-100"
                  >
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 rounded-t-lg">
                      <h3 className="font-medium text-white">
                        Generate QR Code
                      </h3>
                    </div>
                    <div className="px-4 py-2">
                      <p className="text-sm text-gray-600">
                        Create QR codes for selected items
                      </p>
                    </div>
                  </div>
                </div>

                {/* Export Button */}
                <div className="relative group">
                  <button
                    onClick={onExport}
                    className="flex items-center px-4 py-2.5 bg-white text-gray-700 rounded-xl border border-blue-100 shadow-sm hover:bg-blue-50 transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    <span className="material-symbols-outlined mr-2 text-gray-600 group-hover:scale-110 transition-transform">
                      file_export
                    </span>
                    <span className="text-sm">Export</span>
                  </button>

                  {/* Export Hover Popup */}
                  <div
                    className="invisible group-hover:visible absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100
                    before:content-[''] before:absolute before:top-[-6px] before:right-5 
                    before:w-3 before:h-3 before:bg-gradient-to-r before:from-blue-700 before:to-blue-800
                    before:rotate-45 before:border-l before:border-t before:border-gray-100"
                  >
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 rounded-t-lg">
                      <h3 className="font-medium text-white">Export Data</h3>
                    </div>
                    <div className="px-4 py-2">
                      <p className="text-sm text-gray-600">
                        Export your data with QR codes included
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm bg-opacity-90 z-10 shadow-lg">
          <div className="p-4">
            {/* Search Container */}
            <div className="flex items-center gap-3">
              {/* Search Input Group */}
              <div className="flex-1">
                <div className="relative flex items-center">
                  {/* Search Icon */}
                  <div className="absolute left-3 text-blue-600">
                    <svg
                      className="w-5 h-5 transition-transform duration-200 ease-in-out transform group-focus-within:scale-110"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                  </div>

                  {/* Enhanced Search Input */}
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search bills..."
                    className="w-full pl-10 pr-12 py-2.5 text-sm bg-white border border-blue-100 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200 ease-in-out"
                  />

                  {/* QR Scanner Button */}
                  <button
                    onClick={openModal}
                    className="absolute right-0 h-full px-3 flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    <span className="material-symbols-outlined text-2xl">
                      qr_code_scanner
                    </span>
                  </button>
                </div>
              </div>

              {/* More Options Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex px-2 py-2 rounded-xl bg-white text-blue-600 shadow-sm hover:bg-blue-50 active:bg-blue-100 transition-all duration-200 ease-in-out border border-blue-100"
                >
                  <span className="material-symbols-outlined">more_vert</span>
                </button>

                {/* Enhanced Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="z-60 absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-blue-100 transform transition-all duration-200 ease-in-out">
                    <div className="p-1.5">
                      {/* Date Filter Option */}
                      <button
                        onClick={() => {
                          handleOpenDateFilterPopup();
                          closeDropdown();
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                      >
                        <span className="material-symbols-outlined mr-3 text-blue-600">
                          filter_alt
                        </span>
                        <span>Date Filter</span>
                      </button>

                      {/* Generate QR Option */}
                      <button
                        onClick={() => {
                          handleOpenQrSelection();
                          closeDropdown();
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                      >
                        <span className="material-symbols-outlined mr-3 text-purple-600">
                          qr_code_2_add
                        </span>
                        <span>Generate QR</span>
                      </button>

                      {/* Export Option */}
                      <button
                        onClick={() => {
                          onExport();
                          closeDropdown();
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                      >
                        <span className="material-symbols-outlined mr-3 text-gray-600">
                          file_export
                        </span>
                        <span>Export Data</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popups */}
      <ScanQrCodePopup
        isOpen={isModalOpen}
        onClose={closeModal}
        onSearch={onSearch}
        bills={bills}
      />

      <QrCodeSelectionPopup
        isOpen={showQrSelectionPopup}
        onClose={handleCloseQrSelection}
        bills={filteredBills || bills}
        onGenerate={handleGenerateQr}
        selectedTableRows={selectedTableRows}
      />

      {showQrPopup && (
        <QrCodePopup bills={selectedBillsForQr} onClose={handleCloseQrPopup} />
      )}

      <DateFilterPopup
        isOpen={isDateFilterPopupOpen}
        onClose={handleCloseDateFilterPopup}
        onApply={handleApplyDateFilter}
        defaultDates={defaultDates}
      />
    </div>
  );
};

export default BillSearch;
