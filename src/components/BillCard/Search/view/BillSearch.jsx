import React, { useState, useRef } from 'react';
import { SearchInput, ActionButtons, MobileDropdownMenu } from '../common';
import { useClickOutside } from '../../../../hook/useClickOutside';
import ScanQrCodePopup from "../../QRCode/ScanQrCodePopup";
import QrCodePopup from "../../QRCode/QrCodePopup";
import QrCodeSelectionPopup from "../../QRCode/QrCodeSelectionPopup";
import DateFilterPopup from "./DateFilterPopup";

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
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showQrPopup, setShowQrPopup] = useState(false);
  const [showQrSelectionPopup, setShowQrSelectionPopup] = useState(false);
  const [selectedBillsForQr, setSelectedBillsForQr] = useState([]);
  const [isDateFilterPopupOpen, setIsDateFilterPopupOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  // Search handler without modifying the search term
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value); // Pass the raw value without modification
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  const handleOpenDateFilterPopup = () => setIsDateFilterPopupOpen(true);
  const handleCloseDateFilterPopup = () => setIsDateFilterPopupOpen(false);
  const handleApplyDateFilter = (dateRange) => {
    onFilterChange(dateRange);
    setIsDateFilterPopupOpen(false);
  };

  const handleOpenQrSelection = () => setShowQrSelectionPopup(true);
  const handleCloseQrSelection = () => setShowQrSelectionPopup(false);
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
        <div className="rounded-2xl mb-6 overflow-visible sticky top-0 bg-gradient-to-l from-blue-200 to-indigo-200 backdrop-blur-sm bg-opacity-90 z-10 shadow-lg">
          <div className="p-4">
            <div className="flex justify-between items-center gap-4">
              <SearchInput 
                value={searchTerm}
                onChange={handleSearchChange}
                onScan={openModal}
              />
              <ActionButtons 
                isFiltered={isFiltered}
                onFilter={handleOpenDateFilterPopup}
                onGenerateQr={handleOpenQrSelection}
                onExport={onExport}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <div className="sticky top-0 bg-gradient-to-l from-blue-200 to-indigo-200 backdrop-blur-sm bg-opacity-90 z-10 shadow-lg">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <SearchInput 
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onScan={openModal}
                  isMobile
                />
              </div>
              <MobileDropdownMenu 
                ref={dropdownRef}
                isOpen={isDropdownOpen}
                onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
                onClose={() => setIsDropdownOpen(false)}
                onFilter={handleOpenDateFilterPopup}
                onGenerateQr={handleOpenQrSelection}
                onExport={onExport}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Popups */}
      {isModalOpen && (
        <ScanQrCodePopup
          isOpen={isModalOpen}
          onClose={closeModal}
          onSearch={onSearch}
          bills={bills}
        />
      )}

      {showQrSelectionPopup && (
        <QrCodeSelectionPopup
          isOpen={showQrSelectionPopup}
          onClose={handleCloseQrSelection}
          bills={filteredBills || bills}
          onGenerate={handleGenerateQr}
          selectedTableRows={selectedTableRows}
        />
      )}

      {showQrPopup && (
        <QrCodePopup 
          bills={selectedBillsForQr} 
          onClose={handleCloseQrPopup} 
        />
      )}

      {isDateFilterPopupOpen && (
        <DateFilterPopup
          isOpen={isDateFilterPopupOpen}
          onClose={handleCloseDateFilterPopup}
          onApply={handleApplyDateFilter}
          defaultDates={defaultDates}
        />
      )}
    </div>
  );
};

export default BillSearch;