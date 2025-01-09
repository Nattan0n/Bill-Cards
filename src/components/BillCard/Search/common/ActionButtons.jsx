// components/BillCard/SearchComponents/ActionButtons.jsx
import React from "react";
import { IconButton } from "./IconButton";
import { SubInventoryDropdown } from "./SubInventoryDropdown";

export const ActionButtons = ({
  isFiltered,
  onFilter,
  onGenerateQr,
  onExport,
  onSelectSubInv,
  selectedSubInv,
  bills,
}) => {
  return (
    <div className="flex items-center gap-3">
      {/* SubInventory Dropdown */}
      <SubInventoryDropdown
        onSelectSubInv={onSelectSubInv}
        selectedSubInv={selectedSubInv}
        bills={bills}
      />

      {/* Date Filter Button */}
      <IconButton
        icon="filter_alt"
        label="Date Filter"
        onClick={onFilter}
        iconColor="text-blue-600"
        className={`flex items-center px-4 py-2.5 ${
          isFiltered ? "bg-blue-100 text-blue-700" : "bg-white text-gray-700"
        } rounded-xl border border-blue-100 shadow-sm hover:bg-blue-50 transition-all duration-200`}
        tooltipText="Filter data by selecting a specific date range"
      />

      {/* Generate QR Button */}
      <IconButton
        icon="qr_code_2_add"
        label="Generate QR"
        onClick={onGenerateQr}
        iconColor="text-purple-600"
        className="flex items-center px-4 py-2.5 bg-white text-gray-700 rounded-xl border border-blue-100 shadow-sm hover:bg-blue-50 transition-all duration-200"
        tooltipText="Create QR codes for selected items"
      />

      {/* Export Button */}
      <IconButton
        icon="file_export"
        label="Export"
        onClick={onExport}
        iconColor="text-white"
        className="flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 text-white hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 rounded-xl border border-blue-100 shadow-sm hover:bg-blue-50 transition-all duration-200"
        tooltipText="Export your data"
      />
    </div>
  );
};