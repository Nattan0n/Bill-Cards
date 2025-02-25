import React, { useState, useMemo } from "react";
import { formatDate, parseDate } from "../../../../../utils/dateUtils";

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
  
  // ถ้ามีทศนิยม ให้แสดง 2 ตำแหน่ง
  return num.toFixed(2).replace(/\.?0+$/, '');
};

// Helper function สำหรับ format วันที่
const formatInventoryDate = (dateTimeStr) => {
  try {
    if (!dateTimeStr) return "-";
    const parsedDate = parseDate(dateTimeStr);
    if (!parsedDate) return "-";
    
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(parsedDate);
  } catch (error) {
    console.error("Error formatting inventory date:", error);
    return "-";
  }
};

export const InventoryTable = ({ inventory, sortDirection = 'desc', onSortDirectionChange }) => {
  // Add sort state if not provided by parent
  const [localSortDirection, setLocalSortDirection] = useState(sortDirection);
  
  // Use provided sort direction or local state
  const effectiveSortDirection = sortDirection || localSortDirection;

  // Sort inventory data
  const sortedInventory = useMemo(() => {
    if (!inventory?.length) return [];
    
    return [...inventory].sort((a, b) => {
      const dateA = parseDate(a.date_time);
      const dateB = parseDate(b.date_time);
      
      if (!dateA || !dateB) return 0;
      
      // Compare timestamps first
      const timeCompare = dateA.getTime() - dateB.getTime();
      
      // If timestamps are different, use them
      if (timeCompare !== 0) {
        return effectiveSortDirection === 'asc' ? timeCompare : -timeCompare;
      }
      
      // If timestamps are the same, compare by document ID
      const idA = Number(a.id || 0);
      const idB = Number(b.id || 0);
      return effectiveSortDirection === 'asc' ? idA - idB : idB - idA;
    });
  }, [inventory, effectiveSortDirection]);

  // Toggle sort direction
  const handleSortClick = () => {
    const newDirection = effectiveSortDirection === 'asc' ? 'desc' : 'asc';
    setLocalSortDirection(newDirection);
    if (onSortDirectionChange) {
      onSortDirectionChange(newDirection);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4052e5] to-[#4052e5]/90 p-4 rounded-t-2xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined mr-2 text-blue-600 p-2 bg-white rounded-full">
            format_list_bulleted
          </span>
          <span className="font-semibold text-white flex items-center">
            Inventory
          </span>
        </div>
        <div className="bg-white/30 px-3 py-1 rounded-lg">
          <span className="text-white text-sm">Records : {inventory?.length || 0}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-white sticky top-0 z-10">
            <tr className="border-b">
              <th className="p-3 text-left">
                <span className="text-sm text-gray-600">No.</span>
              </th>
              <th className="p-3 text-left min-w-[140px]">
                <button 
                  onClick={handleSortClick}
                  className="w-full flex items-center justify-between group hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
                >
                  <span className="text-sm text-gray-600">วันที่</span>
                  <span className="material-symbols-outlined text-gray-400 text-xl group-hover:text-blue-500">
                    {effectiveSortDirection === 'asc' ? 'stat_1' : 'stat_minus_1'}
                  </span>
                </button>
              </th>
              <th className="p-3 text-center">
                <span className="text-sm text-gray-600">จำนวนรับ</span>
              </th>
              <th className="p-3 text-center">
                <span className="text-sm text-gray-600">จำนวนจ่าย</span>
              </th>
              <th className="p-3 text-left">
                <span className="text-sm text-gray-600">คงเหลือ</span>
              </th>
              <th className="p-3 text-left">
                <span className="text-sm text-gray-600">เอกสารเลขที่</span>
              </th>
              <th className="p-3 text-left">
                <span className="text-sm text-gray-600">ผู้บันทึก</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedInventory.length > 0 ? (
              sortedInventory.map((item) => (
                <tr key={`${item.id}-${item.sequence_number}`} className="hover:bg-indigo-50/80">
                  <td className="p-3">
                    <span className="text-sm text-gray-600">{item.sequence_number}</span>
                  </td>
                  <td className="p-3">
                    <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-xs font-medium text-blue-700">
                      <span className="material-symbols-outlined text-sm mr-1">
                        calendar_today
                      </span>
                      <span>{formatInventoryDate(item.date_time)}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    {Number(item.quantity_sold) > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-50 text-xs font-medium text-green-700">
                        <span className="material-symbols-outlined text-sm mr-1">
                          add_circle
                        </span>
                        {formatNumber(item.quantity_sold)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {Number(item.quantity_sold) < 0 ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-red-50 text-xs font-medium text-red-700">
                        <span className="material-symbols-outlined text-sm mr-1">
                          remove_circle
                        </span>
                        {formatNumber(Math.abs(item.quantity_sold))}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-xs font-medium">
                      <span className="material-symbols-outlined mr-1 text-blue-500 text-base">
                        inventory_2
                      </span>
                      <span className="text-blue-600">{formatNumber(item.quantity_remaining)}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-xs font-medium text-indigo-700">
                      <span className="material-symbols-outlined text-sm mr-1">
                        description
                      </span>
                      <span>{item.eDocumentNo || "-"}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-yellow-50 text-xs font-medium text-yellow-600">
                      <span className="material-symbols-outlined text-sm mr-1">
                        person
                      </span>
                      <span>{item.username}</span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-4xl text-gray-300">
                      inventory_2
                    </span>
                    <p className="text-gray-500 font-medium">ไม่พบข้อมูล</p>
                    <p className="text-sm text-gray-400">
                      กรุณาลองปรับเปลี่ยนช่วงวันที่ใหม่
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;