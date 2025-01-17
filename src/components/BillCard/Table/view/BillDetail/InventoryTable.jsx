// components/BillCard/BillDetail/InventoryTable.jsx
import React from "react";

export const InventoryTable = ({ inventory }) => {
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
          <span className="text-white text-sm">Records : {inventory.length}</span>
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
        <th className="p-3 text-left">
          <span className="text-sm text-gray-600">วันที่</span>
        </th>
        <th className="p-3 text-center">
          <span className="text-sm text-gray-600">จำนวนรับ</span>
        </th>
        <th className="p-3 text-center">
          <span className="text-sm text-gray-600">จำนวนจ่าย</span>
        </th>
        <th className="p-3 text-left">
          <span className="text-sm text-gray-600">เอกสารเลขที่</span>
        </th>
        <th className="p-3 text-left">
          <span className="text-sm text-gray-600">คงเหลือ</span>
        </th>
        <th className="p-3 text-left">
          <span className="text-sm text-gray-600">ผู้บันทึก</span>
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-100">
      {inventory.length > 0 ? (
        inventory.map((item, index) => (
          <tr key={item.id} className="hover:bg-gray-50/50">
            <td className="p-3">
              <span className="text-sm text-gray-600">{index + 1}</span>
            </td>
            <td className="p-3">
              <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-xs font-medium text-blue-700">
                <span className="material-symbols-outlined text-sm mr-1">
                  calendar_today
                </span>
                <span>
                  {new Date(item.date_time).toISOString().slice(0, 19).replace('T', ' ')}
                </span>
              </div>
            </td>
            <td className="p-3 text-center">
              {Number(item.quantity_sold) > 0 ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-50 text-xs font-medium text-green-700">
                  <span className="material-symbols-outlined text-sm mr-1">
                    add_circle
                  </span>
                  {item.quantity_sold}
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
                  {Math.abs(item.quantity_sold)}
                </span>
              ) : (
                <span className="text-sm text-gray-400">-</span>
              )}
            </td>
            <td className="p-3">
              <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-xs font-medium text-indigo-700">
                <span className="material-symbols-outlined text-sm mr-1">
                  description
                </span>
                <span>{item.source_name || "-"}</span>
              </div>
            </td>
            <td className="p-3">
              <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-50 text-xs font-medium text-gray-600">
                <span className="material-symbols-outlined text-sm mr-1">
                  inventory_2
                </span>
                <span>{item.quantity_remaining}</span>
              </div>
            </td>
            <td className="p-3">
              <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-50 text-xs font-medium text-gray-600">
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