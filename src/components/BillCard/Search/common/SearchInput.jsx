// src/components/BillCard/Search/common/SearchInput.jsx
import React from "react";
import { IconButton } from "./IconButton";

export const SearchInput = ({ value, onChange, onScan, isMobile = false }) => {
  const searchIconClasses = `w-5 h-5 transition-transform duration-200 ${
    isMobile ? "group-focus-within:scale-110" : ""
  }`;

  return (
    <div
      className={`relative flex items-center ${isMobile ? "w-full" : "w-96"}`}
    >
      {/* ไอคอนค้นหา */}
      <div className="absolute left-3 text-blue-600">
        <svg
          className={searchIconClasses}
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

      {/* ช่องค้นหา */}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={
          isMobile
            ? "Search Part by Part NO. or Part Name"
            : "Search Part by Part NO. or Part Name"
        }
        className="w-full pl-10 pr-12 py-3 text-sm bg-white rounded-xl border border-gray-200/75 
          shadow-sm hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100
          outline-none transition-all duration-200"
      />

      {/* ปุ่มสแกน QR */}
      <div className="absolute right-0">
        <IconButton
          icon="qr_code_scanner"
          tooltipTitle="สแกน QR Code"
          hideLabel={true}
          onClick={onScan}
          iconColor="text-blue-600"
          className="h-full px-3 flex items-center justify-center hover:text-blue-700 transition-colors rounded-r-xl"
          tooltipText="สแกน QR Code ด้วยเครื่องสแกนมือถือเพื่อค้นหาข้อมูล Bill Card"
        />
      </div>
    </div>
  );
};
