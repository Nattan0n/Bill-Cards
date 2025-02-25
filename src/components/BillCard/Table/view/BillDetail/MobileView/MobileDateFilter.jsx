// components/BillCard/view/BillDetail/MobileView/MobileDateFilter.jsx
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import th from "date-fns/locale/th";
import { registerLocale } from "react-datepicker";

registerLocale("th", th);

export const MobileDateFilter = ({ dateFilter, onDateChange, onExport }) => {
  // Helper function to format date for display - เหมือนกับใน DateFilter.jsx
  const formatDisplayDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-l from-blue-200 to-indigo-200 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <span className="material-symbols-outlined mr-2 text-blue-600 p-2 bg-white rounded-full">
            date_range
          </span>
          Date Filter
        </h3>
        <button
          onClick={onExport}
          className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 text-white hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 text-xs font-medium rounded-lg transition-colors shadow-sm group"
        >
          <span className="material-symbols-outlined text-sm mr-1 group-hover:animate-bounce">
            file_download
          </span>
          Export
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        {[
          { label: "Start Date", field: "startDate" },
          { label: "End Date", field: "endDate" },
        ].map(({ label, field }) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <DatePicker
              selected={
                dateFilter[field] ? new Date(dateFilter[field]) : null
              }
              onChange={(date) =>
                onDateChange(field, date?.toISOString().split("T")[0] || "")
              }
              locale="th"
              dateFormat="dd/MM/yyyy"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              placeholderText="วัน/เดือน/ปี"
              calendarClassName="custom-datepicker-calendar"
              popperClassName="custom-datepicker-popper" 
              popperPlacement="auto"
              showPopperArrow={false}
              customInput={
                <div className="relative w-full">
                  <input
                    type="text"
                    value={formatDisplayDate(dateFilter[field])}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer pr-10 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                    placeholder="วัน/เดือน/ปี"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    calendar_month
                  </span>
                </div>
              }
            />
          </div>
        ))}
      </div>
      
      {/* Datepicker Custom Styles (เหมือนกับใน DateFilter.jsx) */}
      <style>{`
        .custom-datepicker-calendar {
          font-family: 'Kanit', sans-serif !important;
          border: none !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          padding: 12px !important;
          background: white !important;
        }

        .custom-datepicker-calendar .react-datepicker__header {
          background: white !important;
          border-bottom: 1px solid #f3f4f6 !important;
          padding: 12px !important;
        }

        .custom-datepicker-calendar .react-datepicker__day-name {
          color: #6b7280 !important;
          font-weight: 500 !important;
          width: 36px !important;
          margin: 2px !important;
        }

        .custom-datepicker-calendar .react-datepicker__day {
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          margin: 2px !important;
          border-radius: 8px !important;
          color: #1f2937 !important;
        }

        .custom-datepicker-calendar .react-datepicker__day:hover {
          background-color: #f3f4f6 !important;
        }

        .custom-datepicker-calendar .react-datepicker__day--selected {
          background-color: #4052e5 !important;
          color: white !important;
        }

        .custom-datepicker-calendar .react-datepicker__day--keyboard-selected {
          background-color: #e5e7eb !important;
          color: #1f2937 !important;
        }

        .custom-datepicker-calendar .react-datepicker__day--today {
          font-weight: bold !important;
          color: #4052e5 !important;
        }

        .custom-datepicker-calendar .react-datepicker__day--disabled {
          color: #d1d5db !important;
        }

        .custom-datepicker-popper {
          z-index: 9999 !important;
        }

        .react-datepicker__month-select,
        .react-datepicker__year-select {
          padding: 4px 8px !important;
          border-radius: 6px !important;
          border: 1px solid #e5e7eb !important;
          background-color: white !important;
          font-size: 14px !important;
          color: #1f2937 !important;
          cursor: pointer !important;
        }

        .react-datepicker__month-select:focus,
        .react-datepicker__year-select:focus {
          outline: none !important;
          border-color: #4052e5 !important;
          ring: 2px !important;
          ring-color: #4052e5 !important;
        }
      `}</style>
    </div>
  );
};