// components/BillCard/view/BillDetail/PartInfo.jsx
import React from "react";

export const PartInfo = ({
  partNumber,
  description,
  customer,
  stk_qty,
  calculatedTotal, // เพิ่มค่าที่คำนวณได้จากทุกรายการ
  isFiltered, // เพิ่มสถานะว่ามีการกรองหรือไม่
}) => {
  // แปลงค่าให้เป็นตัวเลข
  const apiStockQty = Number(stk_qty || 0);
  const calculatedStockQty = Number(calculatedTotal || 0);

  // ตรวจสอบว่าค่าแตกต่างกันหรือไม่
  const hasMismatch = Math.abs(apiStockQty - calculatedStockQty) > 0.01;

  return (
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
        {/* Stock Qty */}
        <div className="p-4 hover:bg-gray-50 transition-colors">
          <label className="text-sm font-medium text-gray-500">
            Stock Qty (จากระบบ)
          </label>
          <p className="mt-1 font-semibold flex items-center">
            <div
              className={`inline-flex items-center px-2.5 py-1 rounded-lg ${
                apiStockQty === 0
                  ? "bg-blue-50 text-blue-600" // สีฟ้าเมื่อค่าเป็น 0
                  : "bg-green-50 text-green-600" // สีเขียวเมื่อค่าเป็นเลขอื่น
              } text-base font-medium`}
            >
              <span
                className={`material-symbols-outlined mr-1 text-base ${
                  apiStockQty === 0
                    ? "text-blue-500" // สีไอคอนฟ้าเมื่อค่าเป็น 0
                    : "text-green-500" // สีไอคอนเขียวเมื่อค่าเป็นเลขอื่น
                }`}
              >
                inventory_2
              </span>
              {apiStockQty}
            </div>
          </p>
        </div>

        {/* Part Number */}
        <div className="p-4 hover:bg-gray-50 transition-colors">
          <label className="text-sm font-medium text-gray-500">
            Part Number
          </label>
          <p className="mt-1 font-semibold text-gray-900">
            <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 text-black-600 text-base font-medium">
              <span className="material-symbols-outlined mr-1 text-base">
                precision_manufacturing
              </span>
              {partNumber}
            </div>
          </p>
        </div>

        {/* Description */}
        <div className="p-4 hover:bg-gray-50 transition-colors">
          <label className="text-sm font-medium text-gray-500">
            Description
          </label>
          <p className="mt-1 font-semibold text-gray-900">
            <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-violet-50 text-violet-600 text-base font-medium">
              <span className="material-symbols-outlined mr-1 text-base">
              Article
              </span>
              {description}
            </div>
          </p>
        </div>

        {/* Customer */}
        <div className="p-4 hover:bg-gray-50 transition-colors">
          <label className="text-sm font-medium text-gray-500">
            Subinventory
          </label>
          <p className="mt-1 font-semibold text-gray-900">
            <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 text-base font-medium">
              <span className="material-symbols-outlined mr-1 text-base">
                warehouse
              </span>
              {customer}
            </div>
          </p>
        </div>
      </div>
    </div>
  );
};
