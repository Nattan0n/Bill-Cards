// DateFilter.jsx
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import th from "date-fns/locale/th";
import { registerLocale } from "react-datepicker";

registerLocale("th", th);

export const DateFilter = ({ 
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

  // เพิ่มฟังก์ชันสำหรับปุ่ม "แสดงทั้งหมด"
  const handleShowAll = () => {
    if (typeof onFilterReset === 'function') {
      onFilterReset();
    } else {
      // ตั้งค่าวันที่ให้กว้างมากพอที่จะครอบคลุมข้อมูลทั้งหมด (ย้อนหลัง 5 ปี)
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 5);
      
      const endDate = new Date();
      // บวกไปอีก 1 ปีข้างหน้าเพื่อครอบคลุมข้อมูลในอนาคตด้วย
      endDate.setFullYear(endDate.getFullYear() + 1);
      
      onDateChange('startDate', startDate.toISOString().split('T')[0]);
      onDateChange('endDate', endDate.toISOString().split('T')[0]);
    }
  };

  // เพิ่มฟังก์ชันสำหรับปุ่ม "แสดงเดือนล่าสุด"
  const handleShowLatestMonth = () => {
    if (typeof onShowLatestMonth === 'function') {
      onShowLatestMonth();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-l from-blue-200 to-indigo-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined mr-2 text-blue-600 p-2 bg-white rounded-full">
            date_range
          </span>
          <span className="[text-shadow:_0_8px_8px_rgb(99_102_241_/_0.8)] font-semibold text-white flex items-center">
            Date Filter
            {isFiltered && (
              <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full animate-pulse">
                กำลังกรองข้อมูล
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* ปุ่มแสดงเดือนล่าสุด */}
          <button
            onClick={handleShowLatestMonth}
            className="inline-flex items-center px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-base mr-1">
              today
            </span>
            เดือนล่าสุด
          </button>
          
          {/* ปุ่ม Show All - ปรับให้มีการเน้นมากขึ้นเมื่อมีการกรอง */}
          <button
            onClick={handleShowAll}
            className={`inline-flex items-center px-3 py-1.5 
              ${isFiltered 
                ? "bg-yellow-500 hover:bg-yellow-600 text-white animate-pulse"
                : "bg-indigo-500 hover:bg-indigo-600 text-white"}
              text-sm font-medium rounded-lg transition-colors shadow-sm`}
          >
            <span className="material-symbols-outlined text-base mr-1">
              filter_alt_off
            </span>
            {isFiltered ? "แสดงทั้งหมด (!)" : "แสดงทั้งหมด"}
          </button>
          
          <button
            onClick={onExport}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 text-white hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 text-sm font-medium rounded-lg transition-colors shadow-sm group"
          >
            <span className="material-symbols-outlined text-base group-hover:animate-bounce">
              file_download
            </span>
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* เพิ่มคำเตือนเมื่อมีการกรอง */}
        {/* {isFiltered && (
          <div className="mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-yellow-600">warning</span>
              <div>
                <p className="text-yellow-800 font-medium">กำลังกรองข้อมูลตามช่วงวันที่</p>
                <p className="text-sm text-yellow-700 mt-1">
                  การกรองข้อมูลอาจทำให้ค่า "คงเหลือ" ไม่ตรงกับ Stock QTY ที่แสดงในส่วนข้อมูลหลัก
                  เนื่องจากการคำนวณคงเหลือใช้เฉพาะรายการที่แสดงในตาราง
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  กดปุ่ม "เดือนล่าสุด" เพื่อดูข้อมูลเฉพาะเดือนล่าสุด หรือ 
                  กดปุ่ม "แสดงทั้งหมด" เพื่อยกเลิกการกรองและดูข้อมูลทั้งหมด
                </p>
              </div>
            </div>
          </div>
        )} */}

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Start Date", field: "startDate" },
            { label: "End Date", field: "endDate" },
          ].map(({ label, field }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-600 mb-1">
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
                popperPlacement="bottom-start"
                showPopperArrow={false}
                customInput={
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={formatDisplayDate(dateFilter[field])}
                      className={`w-full px-3 py-2 bg-gray-50 border 
                        ${isFiltered ? "border-yellow-300" : "border-gray-200"} 
                        rounded-lg cursor-pointer pr-10 
                        hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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
      </div>

{/* Datepicker Custom Styles */}
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