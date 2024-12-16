// components/BillCard/view/BillDetail/BillDetailPopup.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Header } from './Header';
import { PartCard } from './PartCard';
import { PartInfo } from './PartInfo';
import { DateFilter } from './DateFilter';
import { InventoryTable } from './InventoryTable';
import { exportToExcel } from './utils/exportToExcel';
import { MobileView } from "./MobileView/MobileView";

const BillDetailPopup = ({ bill, onClose }) => {
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [isClosing, setIsClosing] = useState(false);

  // สร้าง mock inventory data ด้วย useMemo แทนการสร้างใหม่ทุกครั้ง
  const mockInventory = useMemo(() => [{
    id: bill.M_ID,
    date_time: bill.M_DATE,
    quantity_sold: bill.M_QTY,
    plan_id: bill.M_SOURCE_ID,
    quantity_remaining: bill.M_QTY_RM,
    signature: bill.M_SOURCE_NAME
  }], [bill]); // dependency เฉพาะ bill

  // ตั้งค่า initial date range เมื่อ component mount หรือเมื่อ bill เปลี่ยน
  useEffect(() => {
    if (mockInventory?.length > 0) {
      const currentDate = new Date(mockInventory[0].date_time);
      
      setDateFilter({
        startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          .toISOString()
          .split("T")[0],
        endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
          .toISOString()
          .split("T")[0],
      });
    }
  }, [mockInventory]); // เพิ่ม dependency array

  // กรองข้อมูล inventory ตาม date range
  useEffect(() => {
    if (mockInventory && dateFilter.startDate && dateFilter.endDate) {
      const filtered = mockInventory.filter((item) => {
        const itemDate = new Date(item.date_time);
        const start = new Date(dateFilter.startDate);
        const end = new Date(dateFilter.endDate);

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        return itemDate >= start && itemDate <= end;
      });
      setFilteredInventory(filtered);
    } else {
      setFilteredInventory(mockInventory);
    }
  }, [mockInventory, dateFilter.startDate, dateFilter.endDate]); // ระบุ dependencies ที่ชัดเจน

  // คำนวณ remaining quantity ด้วย useMemo
  const inventoryWithRemaining = useMemo(() => {
    let remaining = Number(bill.M_QTY) || 0;
    return filteredInventory.map((item) => {
      const itemWithRemaining = {
        ...item,
        quantity_remaining: Math.max(remaining, 0),
      };
      remaining = Math.max(remaining - (Number(item.quantity_sold) || 0), 0);
      return itemWithRemaining;
    });
  }, [filteredInventory, bill.M_QTY]);

  const handleDateChange = (field, value) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 500);
  };

  if (!bill && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-gray-900/45 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Desktop View */}
      <div
        className={`hidden md:flex items-center justify-center min-h-screen p-4 animate__animated animate__faster ${
          isClosing ? "animate__zoomOut" : "animate__zoomIn"
        }`}
      >
        <div className="relative w-11/12 max-w-6xl max-h-[90vh] bg-gray-100 rounded-2xl shadow-xl">
          <Header recordCount={inventoryWithRemaining.length} onClose={handleClose} />
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
            <div className="grid grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <PartCard
                  partNumber={bill.M_PART_NUMBER}
                  description={bill.M_PART_DESCRIPTION}
                  image={bill.M_PART_IMG}
                />
                <PartInfo
                  partNumber={bill.M_PART_NUMBER}
                  description={bill.M_PART_DESCRIPTION}
                  customer={bill.M_SUBINV}
                />
              </div>

              {/* Right Column */}
              <div className="col-span-2 space-y-4">
                <DateFilter
                  dateFilter={dateFilter}
                  onDateChange={handleDateChange}
                  onExport={() => exportToExcel(inventoryWithRemaining, bill, dateFilter)}
                />
                <InventoryTable inventory={inventoryWithRemaining} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <MobileView
        bill={bill}
        inventoryWithRemaining={inventoryWithRemaining}
        dateFilter={dateFilter}
        onDateChange={handleDateChange}
        onClose={handleClose}
        handleExport={() => exportToExcel(inventoryWithRemaining, bill, dateFilter)}
        isClosing={isClosing}
      />
    </div>
  );
};

export default BillDetailPopup;