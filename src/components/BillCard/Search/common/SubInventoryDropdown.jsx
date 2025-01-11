// components/SubInventoryDropdown.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { IconButton } from "./IconButton";

export const SubInventoryDropdown = ({
  onSelectSubInv,
  selectedSubInv,
  inventories = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter inventories based on search
  const filteredInventories = useMemo(() => {
    if (!searchTerm) return inventories;
    const search = searchTerm.toLowerCase();
    return inventories.filter(inv => 
      inv.name.toLowerCase().includes(search) || 
      inv.description.toLowerCase().includes(search)
    );
  }, [inventories, searchTerm]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opening dropdown
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsOpen(false);
      setSearchTerm("");
    }, 200);
  };

  const handleToggleDropdown = useCallback(() => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
      setSearchTerm("");
    }
  }, [isOpen]);

  const handleSelectOption = useCallback(
    (invName) => {
      onSelectSubInv(invName);
      handleClose();
    },
    [onSelectSubInv]
  );

  const getSelectedInventoryDetails = useMemo(() => {
    return inventories.find(inv => inv.name === selectedSubInv) || null;
  }, [inventories, selectedSubInv]);

  if (!inventories?.length) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <IconButton
        icon="warehouse"
        label={getSelectedInventoryDetails?.name || "SubInventory"}
        onClick={handleToggleDropdown}
        iconColor="text-orange-600"
        className={`flex items-center px-4 py-2.5 ${
          selectedSubInv
            ? "bg-orange-100 text-orange-700"
            : "bg-white text-gray-700"
        } rounded-xl border border-blue-100 shadow-sm hover:bg-blue-50 transition-all duration-200`}
        tooltipText={getSelectedInventoryDetails?.description || "Filter by SubInventory"}
      />

      {isOpen && (
        <div className="absolute z-50 mt-2 w-64 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none 
          transform transition-all duration-200 ease-in-out animate__animated animate__faster
          ${isClosing ? 'animate__zoomOut' : 'animate__bounceIn'}">
          {/* Search Section */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="text-xs font-medium text-gray-500">SubInventory</div>
              <div className="text-xs text-gray-400">
                {filteredInventories.length} of {inventories.length}
              </div>
            </div>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search SubInventory..."
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
          </div>

          {/* SubInventory List */}
          <div className="py-1 max-h-60 overflow-y-auto">
            {/* <button
              onClick={() => handleSelectOption(null)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                !selectedSubInv
                  ? "bg-orange-50 text-orange-700"
                  : "text-gray-700 hover:bg-orange-50 hover:text-orange-700"
              }`}
            >
              All SubInventories
            </button> */}

            {filteredInventories.length > 0 ? (
              filteredInventories.map((inv) => (
                <button
                  key={inv.name}
                  onClick={() => handleSelectOption(inv.name)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                    ${selectedSubInv === inv.name
                      ? "bg-orange-50 text-orange-700"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                    } flex flex-col`}
                >
                  <span className="flex items-center justify-between">
                    <span>{inv.name}</span>
                    {inv.name === "GP-DAIK" && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </span>
                  {inv.description && (
                    <span className="text-xs text-gray-500 mt-1">
                      {inv.description}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                No matching SubInventory found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};