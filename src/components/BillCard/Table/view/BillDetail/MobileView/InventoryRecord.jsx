// components/BillCard/view/BillDetail/MobileView/InventoryRecord.jsx
import { formatDate, parseDate } from "../../../../../../utils/dateUtils";

// Helper function สำหรับ format ตัวเลข
const formatNumber = (number) => {
  // ถ้าเป็น null หรือ undefined ให้แสดงเป็น "-"
  if (number == null) return "-";
  
  // แปลงเป็นตัวเลข
  const num = Number(number);
  
  // ถ้าเป็น 0 ให้แสดงเป็น "-"
  if (num === 0) return "-";
  
  // ถ้าเป็นจำนวนเต็ม ให้แสดงแค่จำนวนเต็ม
  if (Number.isInteger(num)) {
    return num.toString();
  }
  
  // ถ้ามีทศนิยม ให้แสดง 2 ตำแหน่ง และตัดเลข 0 ที่ไม่จำเป็น
  return num.toFixed(2).replace(/\.?0+$/, '');
};

const formatInventoryDate = (dateTimeStr) => {
  try {
    if (!dateTimeStr) return "-";
    const parsedDate = parseDate(dateTimeStr);
    if (!parsedDate) return "-";
    return formatDate(dateTimeStr);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-";
  }
};

export const InventoryRecord = ({ item }) => {
  if (!item) return null;

  return (
    <div className="bg-white hover:bg-indigo-50/80 transition-colors duration-150 px-4 py-3 rounded-lg">
      {/* Header - No and Date */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-blue-600 font-medium">#{item.sequence_number}</span>
        <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-xs font-medium text-blue-700">
          <span className="material-symbols-outlined text-base mr-1">calendar_today</span>
          <span className="text-sm">{formatInventoryDate(item.date_time)}</span>
        </div>
      </div>

      {/* Quantities Row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <span className="text-xs text-gray-500 block mb-1.5">จำนวนรับ</span>
          {Number(item.quantity_sold) > 0 ? (
            <div className="inline-flex items-center px-2.5 gap-1 py-1 rounded-lg bg-green-50 text-xs font-medium">
              <span className="material-symbols-outlined text-green-500 text-base">
                add_circle
              </span>
              <span className="text-green-600">{formatNumber(item.quantity_sold)}</span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>

        <div>
          <span className="text-xs text-gray-500 block mb-1.5">จำนวนจ่าย</span>
          {Number(item.quantity_sold) < 0 ? (
            <div className="inline-flex items-center px-2.5 gap-1 py-1 rounded-lg bg-red-50 text-xs font-medium">
              <span className="material-symbols-outlined text-red-500 text-base">
                remove_circle
              </span>
              <span className="text-red-600">{formatNumber(Math.abs(item.quantity_sold))}</span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>

        <div>
          <span className="text-xs text-gray-500 block mb-1.5">คงเหลือ</span>
          <div className="inline-flex items-center px-2.5 gap-1 py-1 rounded-lg bg-blue-50 text-xs font-medium">
            <span className="material-symbols-outlined text-blue-500 text-base">
              inventory_2
            </span>
            <span className="text-blue-600">{formatNumber(item.quantity_remaining)}</span>
          </div>
        </div>
      </div>

      {/* Document and User */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-indigo-600 px-2 py-1 bg-indigo-50 rounded-lg">
          <span className="material-symbols-outlined text-base">description</span>
          <span>{item.eDocumentNo || "-"}</span>
        </div>
        <div className="flex items-center gap-1 text-yellow-600 px-2 py-1 bg-yellow-50 rounded-lg">
          <span className="material-symbols-outlined text-base">person</span>
          <span>{item.username}</span>
        </div>
      </div>
    </div>
  );
};