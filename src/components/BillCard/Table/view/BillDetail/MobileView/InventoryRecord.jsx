// components/BillCard/view/BillDetail/MobileView/InventoryRecord.jsx
import { formatDate, parseDate } from "../../../../../../utils/dateUtils";

export const InventoryRecord = ({ item, index }) => {
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

  if (!item) return null;

  return (
    <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-4 hover:bg-gray-50/50">
      <div>
        <span className="text-xs text-gray-500">ลำดับ</span>
        <div className="mt-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-gray-400">
            tag
          </span>
          <span className="text-sm text-gray-600">{item.sequence_number}</span>
        </div>
      </div>
      
      <div>
        <span className="text-xs text-gray-500">วันที่</span>
        <div className="mt-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-400">
            calendar_today
          </span>
          <span className="text-sm text-gray-600">
            {formatInventoryDate(item.date_time)}
          </span>
        </div>
      </div>

      <div>
        <span className="text-xs text-gray-500">จำนวนรับ</span>
        <div className="mt-1">
          {Number(item.quantity_sold) > 0 ? (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500">
                add_circle
              </span>
              <span className="text-sm text-emerald-600">
                {item.quantity_sold}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>
      </div>

      <div>
        <span className="text-xs text-gray-500">จำนวนจ่าย</span>
        <div className="mt-1">
          {Number(item.quantity_sold) < 0 ? (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">
                remove_circle
              </span>
              <span className="text-sm text-red-600">
                {Math.abs(item.quantity_sold)}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>
      </div>

      <div>
        <span className="text-xs text-gray-500">เอกสารเลขที่</span>
        <div className="mt-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-violet-400">
            description
          </span>
          <span className="text-sm text-gray-600">{item.source_name || '-'}</span>
        </div>
      </div>

      <div>
        <span className="text-xs text-gray-500">คงเหลือ</span>
        <div className="mt-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-400">
            inventory_2
          </span>
          <span className="text-sm text-gray-600">{item.quantity_remaining}</span>
        </div>
      </div>

      <div className="col-span-2">
        <span className="text-xs text-gray-500">ผู้บันทึก</span>
        <div className="mt-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-gray-400">
            person
          </span>
          <span className="text-sm text-gray-600">{item.username}</span>
        </div>
      </div>
    </div>
  );
};