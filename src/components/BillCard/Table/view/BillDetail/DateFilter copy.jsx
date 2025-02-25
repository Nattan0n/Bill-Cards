// components/BillCard/view/BillDetail/DateFilter.jsx
import React from "react";

export const DateFilter = ({ dateFilter, onDateChange, onExport }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-100 bg-gradient-to-l from-blue-200 to-indigo-200 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined mr-2 text-blue-600 p-2 bg-white rounded-full">
          date_range
        </span>
        <span className="[text-shadow:_0_8px_8px_rgb(99_102_241_/_0.8)] font-semibold text-white flex items-center">Date Filter</span>
      </div>
      <button
        onClick={onExport}
        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 text-white hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 text-sm font-medium rounded-lg transition-colors shadow-sm group"
      >
        <span className="material-symbols-outlined mr-2 group-hover:animate-bounce">
          file_download
        </span>
        Export to Excel
      </button>
    </div>
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Start Date", field: "startDate" },
          { label: "End Date", field: "endDate" },
        ].map(({ label, field }) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <input
              type="date"
              value={dateFilter[field]}
              onChange={(e) => onDateChange(field, e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);
