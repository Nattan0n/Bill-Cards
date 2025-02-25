// components/BillCard/view/BillDetail/DateFilter.jsx
import React from "react";
import DatePicker from "react-datepicker";
import "./style/datepicker.css";
import th from 'date-fns/locale/th';
import { registerLocale } from "react-datepicker";

registerLocale('th', th);

// เพิ่มข้อมูลเดือนภาษาไทย
const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

// เพิ่มข้อมูลวันภาษาไทย
const THAI_DAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

export const DateFilter = ({ dateFilter, onDateChange, onExport }) => {
  // ฟังก์ชันสำหรับจัดรูปแบบวันที่
  const formatDate = (date) => {
    if (!date) return "";
    const buddhistYear = date.getFullYear() + 543;
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${buddhistYear}`;
  };

  // ฟังก์ชันสำหรับ custom header ของ calendar
  const renderCustomHeader = ({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => {
    // สร้างช่วงปี 2548-2567
    const years = Array.from(
      { length: 20 }, 
      (_, i) => 2548 + i
    );

    return (
      <div className="flex flex-col gap-2 p-2">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">
            {THAI_MONTHS[date.getMonth()]} {date.getFullYear() + 543}
          </span>
          <div className="flex gap-2">
            <button
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              type="button"
              className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              type="button"
              className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="flex justify-between">
          <select
            value={date.getMonth()}
            onChange={({ target: { value } }) => changeMonth(Number(value))}
            className="px-2 py-1 border rounded text-sm"
          >
            {THAI_MONTHS.map((month, i) => (
              <option key={month} value={i}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={date.getFullYear() + 543}
            onChange={({ target: { value } }) => changeYear(Number(value) - 543)}
            className="px-2 py-1 border rounded text-sm"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
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
          </span>
        </div>
        <button onClick={onExport} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 text-white hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 text-sm font-medium rounded-lg transition-colors shadow-sm group">
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
              <DatePicker
                selected={dateFilter[field] ? new Date(dateFilter[field]) : null}
                onChange={(date) => onDateChange(field, date?.toISOString().split('T')[0] || '')}
                locale="th"
                renderCustomHeader={renderCustomHeader}
                formatWeekDay={day => THAI_DAYS[THAI_DAYS.indexOf(day)]}
                dateFormat="dd/MM/yyyy"
                showMonthDropdown
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={20}
                dropdownMode="scroll"
                dateFormatCalendar="MMMM yyyy"
                minDate={new Date('2548-01-01')}
                maxDate={new Date('2567-12-31')}
                calendarClassName="custom-calendar"
                popperClassName="calendar-popper"
                popperProps={{
                  positionFixed: true,
                  style: { zIndex: 9999 }
                }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                popperPlacement="bottom-start"
                showPopperArrow={false}
                customInput={
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={dateFilter[field] ? formatDate(new Date(dateFilter[field])) : ''}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer pr-10"
                      readOnly
                      placeholder="เลือกวันที่"
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
    </div>
  );
};

export default DateFilter;