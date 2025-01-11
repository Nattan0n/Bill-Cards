import React, { useState, forwardRef } from 'react';

export const MobileDropdownMenu = forwardRef(({ 
  onFilter, 
  onGenerateQr, 
  onExport,
  onSelectSubInv,
  selectedSubInv,
  bills = []
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Process SubInventories
  const subInventories = [...new Set(bills.map((bill) => bill.M_SUBINV))]
    .filter(Boolean)
    .sort((a, b) => {
      if (a === "GP-DAIK") return -1;
      if (b === "GP-DAIK") return 1;
      return a.localeCompare(b);
    });

  const toggleMenu = () => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        setIsOpen(false);
      }, 200);
    } else {
      setIsOpen(true);
    }
  };

  const handleAction = (action) => {
    action();
    toggleMenu();
  };

  const handleSelectSubInv = (subInv) => {
    onSelectSubInv(subInv);
    toggleMenu();
  };

  const menuItems = [
    {
      icon: "filter_alt",
      label: "Date Filter",
      onClick: () => handleAction(onFilter),
      iconColor: "text-blue-600"
    },
    {
      icon: "qr_code_2_add",
      label: "Generate QR",
      onClick: () => handleAction(onGenerateQr),
      iconColor: "text-purple-600"
    },
    {
      icon: "file_export",
      label: "Export Data",
      onClick: () => handleAction(onExport),
      iconColor: "text-gray-600"
    }
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleMenu}
        className="flex px-2 py-2 rounded-xl bg-white text-blue-600 shadow-sm hover:bg-blue-50 active:bg-blue-100 transition-all duration-200 ease-in-out border border-blue-100"
      >
        <span className="material-symbols-outlined">more_vert</span>
      </button>

      {isOpen && (
        <div
          className={`z-60 absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-blue-100 transform transition-all duration-200 ease-in-out animate__animated animate__faster ${
            isClosing ? "animate__zoomOut" : "animate__bounceIn"
          }`}
        >
          {/* SubInventory Section */}
          <div className="p-3 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-2">SubInventory</div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              <button
                onClick={() => handleSelectSubInv(null)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  !selectedSubInv
                    ? "bg-orange-50 text-orange-700"
                    : "text-gray-700 hover:bg-orange-50"
                }`}
              >
                All SubInventories
              </button>
              
              {subInventories.map((subInv) => (
                <button
                  key={subInv}
                  onClick={() => handleSelectSubInv(subInv)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors
                    ${selectedSubInv === subInv
                      ? "bg-orange-50 text-orange-700"
                      : "text-gray-700 hover:bg-orange-50"
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

          {/* Other Actions */}
          <div className="p-1.5">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-blue-50 transition-colors duration-200"
              >
                <span className={`material-symbols-outlined mr-3 ${item.iconColor}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

MobileDropdownMenu.displayName = 'MobileDropdownMenu';