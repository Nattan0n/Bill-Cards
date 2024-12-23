// components/BillCard/view/BillDetail/InventoryTable.jsx
import React from "react";

export const InventoryTable = ({ inventory , startingIndex = 0 }) => (
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
              <tr key={index} className="hover:bg-gray-50/50">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{startingIndex + index + 1}</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-400">
                      calendar_today
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(item.date_time).toLocaleDateString("th-TH")}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-center">
                  {Number(item.quantity_sold) > 0 ? (
                    <span className="text-sm text-emerald-600">
                      +{item.quantity_sold}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  {Number(item.quantity_sold) < 0 ? (
                    <span className="text-sm text-red-600">
                      -{Math.abs(item.quantity_sold)}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-violet-400">
                      description
                    </span>
                    <span className="text-sm text-gray-600">
                      {item.plan_id}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-400">
                      inventory_2
                    </span>
                    <span className="text-sm text-gray-600">
                      {item.quantity_remaining}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400">
                      person
                    </span>
                    <span className="text-sm text-gray-600">
                      {item.signature}
                    </span>
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
