// components/BillCard/view/BillDetail/MobileView/MobileDateFilter.jsx
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import th from "date-fns/locale/th";
import { registerLocale } from "react-datepicker";

registerLocale("th", th);

export const MobileDateFilter = ({
  dateFilter,
  onDateChange,
  onExport,
  onFilterReset,
  onShowLatestMonth,
  isFiltered
}) => {
  // Helper function to format date for display
  const formatDisplayDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      {/* Header - ปรับตาม Design ใน Image 2 */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-l from-blue-200 to-indigo-200 flex justify-between items-center">
        <div className="flex items-center">
          <span className="material-symbols-outlined mr-2 text-blue-600 p-2 bg-white rounded-full">
            date_range
          </span>
          <span className="[text-shadow:_0_8px_8px_rgb(99_102_241_/_0.8)] font-semibold text-white flex items-center">Date Filter</span>
        </div>
        {isFiltered && (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
            กรอง
          </span>
        )}
      </div>

      {/* Warning Message */}
      {/* {isFiltered && (
        <div className="px-3 py-2 bg-yellow-50">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-yellow-600">warning</span>
            <p className="text-sm text-yellow-700">
              กดปุ่ม "เดือนล่าสุด" เพื่อดูเฉพาะเดือนล่าสุด หรือ
              กดปุ่ม "ทั้งหมด" เพื่อยกเลิกการกรอง
            </p>
          </div>
        </div>
      )} */}

      {/* Date Fields */}
      <div className="p-3">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Start Date", field: "startDate" },
            { label: "End Date", field: "endDate" },
          ].map(({ label, field }) => (
            <div key={field}>
              <label className="block text-xs font-medium text-gray-500 mb-1">
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
                      className={`w-full px-3 py-2 text-sm bg-gray-50 border
                        ${isFiltered ? "border-yellow-300" : "border-gray-200"} 
                        rounded-lg cursor-pointer pr-8
                        hover:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent`}
                      readOnly
                      placeholder="วัน/เดือน/ปี"
                    />
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      calendar_month
                    </span>
                  </div>
                }
              />
            </div>
          ))}
        </div>

        {/* Action Buttons - ปรับตาม Design ใน Image 2 */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <button
            onClick={() => onShowLatestMonth()}
            className="flex items-center justify-center px-2 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-medium rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-sm mr-1">last_page</span>
            <span>เดือนล่าสุด</span>
          </button>
          
          <button
            onClick={() => onFilterReset()}
            className={`flex items-center justify-center px-2 py-2 
              ${isFiltered 
                ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-700" 
                : "bg-blue-100 hover:bg-blue-200 text-blue-700"}
              text-sm font-medium rounded-lg transition-colors`}
          >
            <span className="material-symbols-outlined text-sm mr-1">filter_alt_off</span>
            <span>ทั้งหมด</span>
          </button>
          
          <button
            onClick={onExport}
            className="flex items-center justify-center px-2 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-medium rounded-lg transition-all hover:shadow-md"
          >
            <span className="material-symbols-outlined text-sm mr-1">download</span>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Datepicker Custom Styles (ยังคงเดิม) */}
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