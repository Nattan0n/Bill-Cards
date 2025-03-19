// components/BillCard/view/BillDetail/MobileView/InventoryRecord.jsx
import React from "react";
import { parseDate } from "../../../../../../utils/dateUtils";

// Helper function สำหรับ format ตัวเลข
const formatNumber = (number) => {
  // ถ้าเป็น null หรือ undefined ให้แสดงเป็น "-"
  if (number == null) return "-";

  // แปลงเป็นตัวเลข
  const num = Number(number);

  // ถ้าเป็น 0 ให้แสดงเป็น "0"
  if (num === 0) return "0";

  // ถ้าเป็นจำนวนเต็ม ให้แสดงแค่จำนวนเต็ม
  if (Number.isInteger(num)) {
    return num.toString();
  }

  // ถ้ามีทศนิยม ให้แสดง 2 ตำแหน่ง และตัดเลข 0 ที่ไม่จำเป็น
  return num.toFixed(2).replace(/\.?0+$/, "");
};

const formatInventoryDate = (dateTimeStr) => {
  try {
    if (!dateTimeStr) return "-";
    const parsedDate = parseDate(dateTimeStr);
    if (!parsedDate) return "-";

    // แก้ไขจาก formatDate เป็น Intl.DateTimeFormat ตาม Design ใน Image 2
    return new Intl.DateTimeFormat("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(parsedDate);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-";
  }
};

// Function to determine document number or type name
const getDocumentReference = (item) => {
  // If source is "source_nu", return m_type_name
  if (item.eDocumentNo === "source_nu") {
    return item.transaction_type || "-";
  }
  // Otherwise, return eDocumentNo (existing behavior)
  return item.eDocumentNo || "-";
};

export const InventoryRecord = ({ item }) => {
  if (!item) return null;

  return (
    <div className="p-3 hover:bg-indigo-50/30 transition-colors duration-150">
      {/* Header - Record Number and Date */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="text-blue-700 font-medium text-sm mr-1">
            #{item.sequence_number}
          </span>
        </div>
        <div className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-50 text-xs font-medium text-blue-700">
          <span className="material-symbols-outlined text-sm mr-1">
            calendar_today
          </span>
          <span>{formatInventoryDate(item.date_time)}</span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* จำนวนรับ */}
        <div>
          <span className="text-xs text-gray-500 block mb-1">IN</span>
          {Number(item.quantity_sold) > 0 ? (
            <div className="inline-flex items-center px-2 py-1 rounded-lg bg-green-50 text-xs font-medium">
              <span className="material-symbols-outlined text-green-500 text-sm mr-1">
                add_circle
              </span>
              <span className="text-green-600">
                {formatNumber(item.quantity_sold)}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>

        {/* จำนวนจ่าย */}
        <div>
          <span className="text-xs text-gray-500 block mb-1">OUT</span>
          {Number(item.quantity_sold) < 0 ? (
            <div className="inline-flex items-center px-2 py-1 rounded-lg bg-red-50 text-xs font-medium">
              <span className="material-symbols-outlined text-red-500 text-sm mr-1">
                remove_circle
              </span>
              <span className="text-red-600">
                {formatNumber(Math.abs(item.quantity_sold))}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>

        {/* คงเหลือ */}
        <div>
          <span className="text-xs text-gray-500 block mb-1">Balance</span>
          <div
            className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
              item.quantity_remaining === 0
                ? "bg-blue-50 text-blue-600"
                : "bg-green-50 text-green-600"
            } font-medium`}
          >
            <span
              className={`material-symbols-outlined ${
                item.quantity_remaining === 0
                  ? "text-blue-500"
                  : "text-green-500"
              } text-sm mr-1`}
            >
              inventory_2
            </span>
            <span>{formatNumber(item.quantity_remaining)}</span>
          </div>
        </div>
      </div>

      {/* Document and User - Bottom Row */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1 text-indigo-600 px-2 py-1 bg-indigo-50 rounded-lg text-xs">
          <span className="material-symbols-outlined text-sm">description</span>
          <span className="">
            {getDocumentReference(item)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-blue-600 px-2 py-1 bg-blue-50 rounded-lg text-xs">
          <span className="material-symbols-outlined text-sm">description</span>
          <span className="">
            {item.transaction_type}
          </span>
        </div>

        <div className="flex items-center gap-1 text-yellow-600 px-2 py-1 bg-yellow-50 rounded-lg text-xs">
          <span className="material-symbols-outlined text-sm">person</span>
          <span className="truncate max-w-[120px]">{item.username}</span>
        </div>
      </div>
    </div>
  );
};
