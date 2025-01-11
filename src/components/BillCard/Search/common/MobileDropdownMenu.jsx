// components/MobileDropdownMenu.jsx
import React, { useState, useMemo, forwardRef } from 'react';

export const MobileDropdownMenu = forwardRef(({ 
  onFilter, 
  onGenerateQr, 
  onExport,
  onSelectSubInv,
  selectedSubInv,
  isFiltered = false,
  disabled = false,
  inventories = [] // เปลี่ยนจาก bills เป็น inventories
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchSubInv, setSearchSubInv] = useState('');

  // Filter inventories based on search
  const filteredInventories = useMemo(() => {
    if (!searchSubInv) return inventories;
    const searchTerm = searchSubInv.toLowerCase();
    return inventories.filter(inv => 
      inv.name.toLowerCase().includes(searchTerm) ||
      inv.description.toLowerCase().includes(searchTerm)
    );
  }, [inventories, searchSubInv]);

  const toggleMenu = () => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        setIsOpen(false);
        setSearchSubInv('');
      }, 200);
    } else {
      setIsOpen(true);
    }
  };

  const handleAction = (action) => {
    action();
    toggleMenu();
  };

  const handleSelectSubInv = (invName) => {
    onSelectSubInv?.(invName);
    toggleMenu();
  };

  const menuItems = [
    {
      icon: "filter_alt",
      label: "Date Filter",
      onClick: () => handleAction(onFilter),
      iconColor: "text-blue-600",
      active: isFiltered
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
        disabled={disabled}
        className={`flex px-2 py-2 rounded-xl bg-white text-blue-600 shadow-sm hover:bg-blue-50 active:bg-blue-100 transition-all duration-200 ease-in-out border border-blue-100
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="material-symbols-outlined">more_vert</span>
      </button>

      {isOpen && (
        <div className={`z-60 absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-blue-100 transform transition-all duration-200 ease-in-out animate__animated animate__faster ${
          isClosing ? "animate__zoomOut" : "animate__bounceIn"
        }`}>
          {/* SubInventory Section */}
          {onSelectSubInv && inventories?.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-gray-500">SubInventory</div>
                <div className="text-xs text-gray-400">
                  {filteredInventories.length} of {inventories.length}
                </div>
              </div>

              {/* Search Input */}
              <div className="relative mb-2">
                <input
                  type="text"
                  value={searchSubInv}
                  onChange={(e) => setSearchSubInv(e.target.value)}
                  placeholder="Search SubInventory..."
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  autoFocus
                />
                {searchSubInv && (
                  <button
                    onClick={() => setSearchSubInv('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {/* <button
                  onClick={() => handleSelectSubInv(null)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    !selectedSubInv
                      ? "bg-orange-50 text-orange-700"
                      : "text-gray-700 hover:bg-orange-50"
                  }`}
                >
                  All SubInventories
                </button> */}
                
                {filteredInventories.length > 0 ? (
                  filteredInventories.map((inv) => (
                    <button
                      key={inv.name}
                      onClick={() => handleSelectSubInv(inv.name)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors
                        ${selectedSubInv === inv.name
                          ? "bg-orange-50 text-orange-700"
                          : "text-gray-700 hover:bg-orange-50"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{inv.name}</span>
                        {inv.name === "GP-DAIK" && (
                          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      {inv.description && (
                        <span className="block text-xs text-gray-500 mt-1">
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

          {/* Other Actions */}
          <div className="p-1.5">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                disabled={disabled}
                className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg transition-colors duration-200
                  ${item.active 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-700 hover:bg-blue-50"
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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