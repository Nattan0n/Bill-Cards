// components/BillCard/view/BillDetail/PartInfo.jsx
import React from "react";

export const PartInfo = ({ partNumber, description, customer }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-100 bg-gray-800">
      <h3 className="font-semibold text-white flex items-center">
        <span className="material-symbols-outlined mr-2 text-blue-600 p-2 bg-white rounded-full">
          info
        </span>
        Part Information
      </h3>
    </div>
    <div className="divide-y divide-gray-100">
      {[
        { label: "Part Number", value: partNumber },
        { label: "Description", value: description },
        { label: "Customer", value: customer },
      ].map(({ label, value }) => (
        <div key={label} className="p-4 hover:bg-gray-50 transition-colors">
          <label className="text-sm font-medium text-gray-500">{label}</label>
          <p className="mt-1 font-semibold text-gray-900">{value}</p>
        </div>
      ))}
    </div>
  </div>
);
