import React, { useState, forwardRef } from 'react';

export const MobileDropdownMenu = forwardRef(({ 
  onFilter, 
  onGenerateQr, 
  onExport 
}, ref) => {
  const [isOpen, setIsOpen] = useState(false); // ใช้สถานะควบคุมการแสดงผล
  const [isClosing, setIsClosing] = useState(false); // ใช้สถานะควบคุม animation ปิด

  const toggleMenu = () => {
    if (isOpen) {
      // ถ้าเมนูเปิดอยู่ ให้เล่น animation ปิด
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        setIsOpen(false); // ปิดเมนูหลัง animation
      }, 200); // ระยะเวลาตรงกับ duration animation
    } else {
      // ถ้าเมนูปิดอยู่ ให้เปิดเมนู
      setIsOpen(true);
    }
  };

  const handleAction = (action) => {
    action();
    toggleMenu(); // ปิดเมนูเมื่อกด Action
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
      {/* Toggle Button */}
      <button
        onClick={toggleMenu} // ใช้ปุ่มเดียวเปิด-ปิด
        className="flex px-2 py-2 rounded-xl bg-white text-blue-600 shadow-sm hover:bg-blue-50 active:bg-blue-100 transition-all duration-200 ease-in-out border border-blue-100"
      >
        <span className="material-symbols-outlined">more_vert</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`z-60 absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-blue-100 transform transition-all duration-200 ease-in-out animate__animated animate__faster ${
            isClosing ? "animate__zoomOut" : "animate__bounceIn"
          }`}
        >
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
