// components/BillCard/SearchComponents/HoverTooltip.jsx
import React from "react";

export const HoverTooltip = ({ title, text }) => (
  <div
    className=" invisible group-hover:visible absolute right-0 top-full mt-2 
    w-60 bg-white rounded-lg border border-gray-100/50 backdrop-blur-sm
    transform transition-all duration-200 origin-top-right
    scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 z-[9999]
    before:content-[''] before:absolute before:top-[-6px] before:right-5 
    before:w-3 before:h-3 before:bg-gradient-to-r before:from-indigo-600 before:to-blue-600
    before:rotate-45 before:border-l before:border-t before:border-gray-100/50 shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]"
  >
    {/* Header */}
    <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-lg">
      <div className="flex items-center gap-2">
        <svg
          className="w-4 h-4 text-white/80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="font-medium text-white text-sm tracking-wide">
          {title}
        </h3>
      </div>
    </div>

    {/* Content */}
    <div className="p-4 bg-gradient-to-b from-white to-gray-50">
      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
    </div>

    {/* Footer - Optional line with subtle styling */}
    <div className="h-1 bg-gradient-to-r from-transparent via-blue-100/20 to-transparent rounded-b-lg" />
  </div>
);
