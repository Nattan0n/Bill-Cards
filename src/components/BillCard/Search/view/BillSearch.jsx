import React, { useState, useRef, useEffect } from "react";
import { SearchInput, ActionButtons, MobileDropdownMenu } from "../common";
import { useClickOutside } from "../../../../hooks/useClickOutside";
import HandheldScanner from "../../QRCode/Scanner/HandheldScanner";
import QrCodePopup from "../../QRCode/QrCodePopup";
import QrCodeSelectionPopup from "../../QRCode/QrCodeSelectionPopup";
import DateFilterPopup from "../view/DateFilterPopup";
import { billCardService } from "../../../../services/billCardService";

const BillSearch = ({
 onSearch,
 onExport,
 inventories,
 onFilterChange,
 onSelectSubInv,
 onSelectItemId,
 selectedSubInv,
 selectedItemId,
 isFiltered,
 defaultDates,
 filteredBills,
 selectedTableRows,
 bills,
}) => {
 // States
 const [searchTerm, setSearchTerm] = useState("");
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [showQrPopup, setShowQrPopup] = useState(false);
 const [showQrSelectionPopup, setShowQrSelectionPopup] = useState(false);
 const [selectedBillsForQr, setSelectedBillsForQr] = useState([]);
 const [isDateFilterPopupOpen, setIsDateFilterPopupOpen] = useState(false);
 const [isDropdownOpen, setIsDropdownOpen] = useState(false);
 const [isGeneratingQr, setIsGeneratingQr] = useState(false);

 // States for bills management
 const [localBills, setLocalBills] = useState(bills || []);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState(null);

 // Refs
 const dropdownRef = useRef(null);
 useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

 // Effect for loading bills
 useEffect(() => {
   const loadBills = async () => {
     if (!selectedSubInv) return;

     setIsLoading(true);
     setError(null);
     
     try {
       const response = await billCardService.getBillCards(selectedSubInv);
       setLocalBills(response || []);
     } catch (error) {
       console.error('Error loading bills:', error);
       setError('Failed to load bill data');
     } finally {
       setIsLoading(false);
     }
   };

   loadBills();
 }, [selectedSubInv]);

 // Effect for syncing bills from props
 useEffect(() => {
   if (bills?.length > 0) {
     setLocalBills(bills);
   }
 }, [bills]);

 // Handlers
 const handleSearchChange = (e) => {
   const value = e.target.value;
   setSearchTerm(value);
   onSearch(value);
 };

 const openModal = () => {
   if (isLoading) {
     return;
   }
   if (error) {
     return;
   }
   setIsModalOpen(true);
 };

 const closeModal = () => setIsModalOpen(false);

 const handleOpenDateFilterPopup = () => setIsDateFilterPopupOpen(true);
 const handleCloseDateFilterPopup = () => setIsDateFilterPopupOpen(false);

 const handleApplyDateFilter = (dateRange) => {
   onFilterChange(dateRange);
   setIsDateFilterPopupOpen(false);
 };

 const handleOpenQrSelection = () => {
   setShowQrSelectionPopup(true);
   setIsGeneratingQr(false);
 };

 const handleCloseQrSelection = () => {
   if (!isGeneratingQr) {
     setShowQrSelectionPopup(false);
   }
 };

 const handleGenerateQr = async (selectedBills) => {
   try {
     setIsGeneratingQr(true);
     await new Promise((resolve) => setTimeout(resolve, 100));
     setSelectedBillsForQr(selectedBills);
     setShowQrSelectionPopup(false);
     setShowQrPopup(true);
   } catch (error) {
     console.error("Error generating QR codes:", error);
   } finally {
     setIsGeneratingQr(false);
   }
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
               onSelectSubInv={onSelectSubInv}
               onSelectItemId={onSelectItemId}
               selectedSubInv={selectedSubInv}
               selectedItemId={selectedItemId}
               inventories={inventories}
               disabled={isGeneratingQr}
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
               onSelectSubInv={onSelectSubInv}
               onSelectItemId={onSelectItemId}
               selectedSubInv={selectedSubInv}
               selectedItemId={selectedItemId}
               isFiltered={isFiltered}
               disabled={isGeneratingQr}
               inventories={inventories}
             />
           </div>
         </div>
       </div>
     </div>

     {/* Popups */}
     {isModalOpen && (
       <HandheldScanner
         isOpen={isModalOpen}
         onClose={(shouldCloseNav) => {
           setIsModalOpen(false);
         }}
         bills={localBills}
         selectedSubInv={selectedSubInv}
         onSelectSubInv={onSelectSubInv}
         isLoading={isLoading}
         error={error}
       />
     )}

     {showQrSelectionPopup && (
       <QrCodeSelectionPopup
         isOpen={showQrSelectionPopup}
         onClose={handleCloseQrSelection}
         bills={filteredBills}
         onGenerate={handleGenerateQr}
         selectedTableRows={selectedTableRows}
       />
     )}

     {showQrPopup && (
       <QrCodePopup bills={selectedBillsForQr} onClose={handleCloseQrPopup} />
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