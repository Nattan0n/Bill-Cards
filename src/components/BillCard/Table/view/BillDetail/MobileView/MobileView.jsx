// components/BillCard/view/BillDetail/MobileView/MobileView.jsx
import { MobileHeader } from "./Header";
import { PartCard } from "../PartCard";
import { PartInfo } from "../PartInfo";
import { InventoryRecord } from "./InventoryRecord";

export const MobileView = ({
  bill,
  inventoryWithRunningTotal,
  dateFilter,
  onDateChange,
  onClose,
  handleExport,
  isClosing,
}) => (
  <div className="md:hidden">
    <div
      className={`fixed inset-0 flex flex-col bg-gray-100 animate__animated animate__faster ${
        isClosing ? "animate__slideOutDown" : "animate__slideInUp"
      }`}
    >
      <MobileHeader
        recordCount={inventoryWithRunningTotal.length}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Image and Info Section */}
          <div className="space-y-4">
            <PartCard
              partNumber={bill.M_PART_NUMBER}
              description={bill.M_PART_DESCRIPTION}
              image={bill.M_PART_NUMBER}
            />
            <PartInfo
              partNumber={bill.M_PART_NUMBER}
              description={bill.M_PART_DESCRIPTION}
              customer={bill.M_SUBINV}
            />
          </div>

          {/* Date Filter */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-l from-blue-200 to-indigo-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <span className="material-symbols-outlined mr-2 text-blue-600 p-2 bg-white rounded-full">
                  date_range
                </span>
                Date Filter
              </h3>
              <button
                onClick={handleExport}
                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 text-white hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 text-xs font-medium rounded-lg transition-colors shadow-sm group"
              >
                <span className="material-symbols-outlined text-sm mr-1 group-hover:animate-bounce">
                  file_download
                </span>
                Export
              </button>
            </div>
            <div className="p-4 space-y-4">
              {[
                { label: "Start Date", field: "startDate" },
                { label: "End Date", field: "endDate" },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    type="date"
                    value={dateFilter[field]}
                    onChange={(e) => onDateChange(field, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Inventory Records */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#4052e5] to-[#4052e5]/90 p-4 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600 p-2 bg-white rounded-full">
                  format_list_bulleted
                </span>
                <span className="text-white">Inventory</span>
              </div>
              <div className="bg-white/30 px-3 py-1 rounded-lg">
                <span className="text-white text-sm">
                   {inventoryWithRunningTotal.length} Records 
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {inventoryWithRunningTotal.length > 0 ? (
                inventoryWithRunningTotal.map((item, index) => (
                  <InventoryRecord 
                    key={item.id || index} 
                    item={item} 
                    index={index}
                  />
                ))
              ) : (
                <div className="py-12 px-4 text-center">
                  <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 animate-bounce">
                    inventory_2
                  </span>
                  <p className="text-gray-500 font-medium mb-1">
                    No records found
                  </p>
                  <p className="text-sm text-gray-400">
                    Try adjusting your date range
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Spacing */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  </div>
);
