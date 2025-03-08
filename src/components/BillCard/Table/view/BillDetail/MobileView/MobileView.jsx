// components/BillCard/view/BillDetail/MobileView/MobileView.jsx
import React from 'react';
import { MobileHeader } from "./Header";
import { PartCard } from "../PartCard";
import { PartInfo } from "../PartInfo";
import { InventoryRecord } from "./InventoryRecord";
import { MobileDateFilter } from "./MobileDateFilter";

export const MobileView = ({
  bill,
  inventoryWithRunningTotal,
  dateFilter,
  onDateChange,
  onClose,
  handleExport,
  isClosing,
  onFilterReset,
  onShowLatestMonth,
  totalRecordCount,
  isFiltered,
  apiStockQty,
  calculatedTotal
}) => (
  <div className="md:hidden">
    <div
      className={`fixed inset-0 flex flex-col bg-gray-50 animate__animated animate__faster ${
        isClosing ? "animate__slideOutDown" : "animate__slideInUp"
      }`}
    >
      {/* Header */}
      <MobileHeader
        recordCount={inventoryWithRunningTotal.length}
        totalRecordCount={totalRecordCount}
        onClose={onClose}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3 space-y-3">
          {/* Part Info Section - จากภาพ 2 */}
          <div className="space-y-3 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            {/* Part Image */}
            <PartCard
              partNumber={bill.M_PART_NUMBER}
              description={bill.M_PART_DESCRIPTION}
              image={bill.M_PART_NUMBER}
              isMobile={true}
            />
            
            {/* Part Information */}
            <PartInfo
              partNumber={bill.M_PART_NUMBER}
              description={bill.M_PART_DESCRIPTION}
              customer={bill.M_SUBINV}
              stk_qty={bill.stk_qty}
              calculatedTotal={calculatedTotal}
              isFiltered={isFiltered}
              isMobile={true}
            />
          </div>

          {/* Date Filter Section */}
          <MobileDateFilter 
            dateFilter={dateFilter}
            onDateChange={onDateChange}
            onExport={handleExport}
            onFilterReset={onFilterReset}
            onShowLatestMonth={onShowLatestMonth}
            isFiltered={isFiltered}
          />

          {/* Inventory Section - ปรับให้เหมือนกับภาพที่ 1 */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#4052e5] to-[#4052e5]/90 p-4 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl text-white">
                  format_list_bulleted
                </span>
                <span className="font-semibold text-white text-base">Inventory</span>
              </div>
              <div className="bg-white/30 px-3 py-1 rounded-full">
                <span className="text-white text-sm">
                  {inventoryWithRunningTotal.length} Records 
                  {totalRecordCount && inventoryWithRunningTotal.length !== totalRecordCount && ` (จาก ${totalRecordCount})`}
                </span>
              </div>
            </div>

            {/* Filter Warning - ปรับให้เหมือนกับภาพ 1 */}
            {isFiltered && (
              <div className="bg-yellow-50 p-3 border-b border-yellow-100">
                <div className="flex items-start">
                  <span className="material-symbols-outlined text-yellow-600 mr-2 mt-0.5">
                    info
                  </span>
                  <div className="flex-1">
                    <span className="text-sm text-yellow-700">
                      <strong>ข้อมูลถูกกรองตามช่วงวันที่</strong> กำลังแสดง{" "}
                      {inventoryWithRunningTotal.length}
                      {totalRecordCount && inventoryWithRunningTotal.length !== totalRecordCount && (
                        <> จาก {totalRecordCount} รายการ</>
                      )}
                    </span>
                    <div className="flex flex-row gap-2 mt-2">
                      {/* <button
                        onClick={() => {
                          if (typeof onShowLatestMonth === 'function') {
                            onShowLatestMonth();
                          }
                        }}
                        className="flex items-center justify-center gap-1 py-1.5 px-3 bg-white text-blue-600 text-sm font-medium rounded-lg transition-colors border border-blue-100 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">today</span>
                        <span>เดือนล่าสุด</span>
                      </button> */}
                      
                      <button
                        onClick={() => {
                          if (typeof onFilterReset === 'function') {
                            onFilterReset();
                          }
                        }}
                        className="flex items-center justify-center gap-1 py-1.5 px-3 bg-white text-blue-600 text-sm font-medium rounded-lg transition-colors border border-blue-100 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                        <span>แสดงทั้งหมด</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Inventory Records - จากภาพ 1 */}
            <div className="divide-y divide-gray-100">
              {inventoryWithRunningTotal.length > 0 ? (
                inventoryWithRunningTotal.map((item) => (
                  <InventoryRecord 
                    key={`${item.id}-${item.sequence_number}`}
                    item={item} 
                  />
                ))
              ) : (
                <div className="py-12 px-4 text-center">
                  <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 animate-bounce">
                    inventory_2
                  </span>
                  <p className="text-gray-500 font-medium mb-1">
                    ไม่พบข้อมูล
                  </p>
                  <p className="text-sm text-gray-400">
                    ลองปรับช่วงวันที่ใหม่
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="h-4" />
        </div>
      </div>
    </div>
  </div>
);