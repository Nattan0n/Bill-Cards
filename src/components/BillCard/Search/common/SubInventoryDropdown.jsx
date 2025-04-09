// src/components/BillCard/SearchComponents/SubInventoryDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import { HoverTooltip } from "./HoverTooltip";

export const SubInventoryDropdown = ({
  onSelectSubInv,
  onSelectItemId,
  selectedSubInv = "GP-DAIK",
  selectedItemId,
  inventories = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef(null);

  // Filter and sort inventories
  const filteredInventories = React.useMemo(() => {
    if (!inventories) return [];

    let filtered = [...inventories];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.name.toLowerCase().includes(search) ||
          inv.description?.toLowerCase().includes(search)
      );
    }

    return filtered.sort((a, b) => {
      if (a.name === selectedSubInv) return -1;
      if (b.name === selectedSubInv) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [inventories, searchTerm, selectedSubInv]);

  const toggleMenu = () => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        setIsOpen(false);
        setSearchTerm("");
      }, 200);
    } else {
      setIsOpen(true);
    }
  };

  const handleSelectInventory = (inv) => {
    onSelectSubInv(inv.name);
    toggleMenu();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && isOpen) {
        toggleMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Button */}
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={toggleMenu}
          className={`flex items-center px-4 py-2.5 ${
            selectedSubInv
              ? "bg-orange-100 text-orange-700"
              : "bg-white text-gray-700"
          } rounded-xl border border-blue-100 shadow-sm hover:bg-blue-50 transition-all duration-200`}
        >
          <span className="material-symbols-outlined mr-2 text-orange-600 group-hover:scale-110 transition-transform duration-200">
            warehouse
          </span>
          <span className="text-sm font-medium tracking-wide">
            {selectedSubInv || "Select SubInventory"}
          </span>
        </button>

        {/* Hover Tooltip */}
        {isHovered && (
          <div className="hidden md:block">
            <HoverTooltip
              title="Subinventory Selection"
              text="Filter and access inventory items by selecting a specific Subinventory. Each Subinventory contains a unique set of parts and materials."
            />
          </div>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={`absolute z-50 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 transform transition-all duration-200 ease-in-out animate__animated animate__faster ${
            isClosing ? "animate__zoomOut" : "animate__bounceIn"
          }`}
        >
          {/* Header */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-gray-500">
                Select SubInventory
              </div>
              <div className="text-xs text-gray-400">
                {filteredInventories.length} items
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mt-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search SubInventory..."
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-orange-400"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-outlined text-sm">
                    close
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* List Container */}
          <div className="max-h-96 overflow-y-auto">
            {filteredInventories.map((inv) => (
              <button
                key={inv.name}
                onClick={() => handleSelectInventory(inv)}
                className={`w-full text-left p-3 hover:bg-orange-50/50 transition-colors ${
                  selectedSubInv === inv.name
                    ? "bg-orange-50 sticky top-0 z-10 border-b border-orange-100"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {inv.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {inv.name === "GP-DAIK" && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                    {inv.inventory_items?.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                        {inv.inventory_items.length} parts
                      </span>
                    )}
                  </div>
                </div>
                {inv.description && (
                  <span className="text-xs text-gray-500 mt-0.5 block">
                    {inv.description}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};