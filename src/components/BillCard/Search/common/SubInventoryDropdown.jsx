import React, { useState, useEffect, useRef, useCallback } from "react";
import { IconButton } from "./IconButton";

export const SubInventoryDropdown = ({
  onSelectSubInv,
  selectedSubInv,
  bills = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [subInventories, setSubInventories] = useState([]);
  const dropdownRef = useRef(null);
  const initialized = useRef(false);

  // Process SubInventories only once when component mounts
  useEffect(() => {
    if (!initialized.current && bills?.length > 0) {
      const uniqueSubInvs = [...new Set(bills.map((bill) => bill.M_SUBINV))]
        .filter(Boolean)
        .sort((a, b) => {
          if (a === "GP-DAIK") return -1;
          if (b === "GP-DAIK") return 1;
          return a.localeCompare(b);
        });

      setSubInventories(uniqueSubInvs);

      // Set GP-DAIK as default if it exists and no selection
      if (
        !selectedSubInv &&
        uniqueSubInvs.includes("GP-DAIK") &&
        onSelectSubInv
      ) {
        onSelectSubInv("GP-DAIK");
      }

      initialized.current = true;
    }
  }, [bills]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelectOption = useCallback(
    (subInv) => {
      onSelectSubInv(subInv);
      setIsOpen(false);
    },
    [onSelectSubInv]
  );

  if (!bills?.length) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <IconButton
        icon="warehouse"
        label={selectedSubInv || "SubInventory"}
        onClick={handleToggleDropdown}
        iconColor="text-orange-600"
        className={`flex items-center px-4 py-2.5 ${
          selectedSubInv
            ? "bg-orange-100 text-orange-700"
            : "bg-white text-gray-700"
        } rounded-xl border border-orange-100 shadow-sm hover:bg-orange-50 transition-all duration-200`}
        tooltipText="Filter by SubInventory"
      />

      {isOpen && subInventories.length > 0 && (
        <div className="absolute z-50 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
          {" "}
          {/* เพิ่ม overflow-hidden ที่ container */}
          <div className="py-1 max-h-60 overflow-y-auto">
            <button
              onClick={() => handleSelectOption(null)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                !selectedSubInv
                  ? "bg-orange-50 text-orange-700"
                  : "text-gray-700 hover:bg-orange-50 hover:text-orange-700"
              }`}
            >
              All SubInventories
            </button>

            {subInventories.map((subInv) => (
              <button
                key={subInv}
                onClick={() => handleSelectOption(subInv)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors
            ${
              selectedSubInv === subInv
                ? "bg-orange-50 text-orange-700"
                : "text-gray-700 hover:bg-orange-50 hover:text-orange-700"
            } flex items-center justify-between`}
              >
                <span>{subInv}</span>
                {subInv === "GP-DAIK" && (
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                    Default
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
