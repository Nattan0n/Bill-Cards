// components/BillCard/BillDetail/BillDetailPopup.jsx
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

  // แปลงข้อมูลและเรียงลำดับตามวันที่
  const inventoryData = useMemo(() => {
    if (!bill.relatedBills) return [];

    // หายอดเริ่มต้นจากข้อมูลทั้งหมด
    const allRecords = bill.allRelatedBills || bill.relatedBills;
    const initialTotal = allRecords.reduce((sum, item) => {
      const date = new Date(item.M_DATE);
      // นับเฉพาะรายการที่เก่ากว่าช่วงที่แสดง
      if (date < new Date(Math.min(...bill.relatedBills.map(b => new Date(b.M_DATE))))) {
        return sum + Number(item.M_QTY || 0);
      }
      return sum;
    }, 0);

    return bill.relatedBills
      .map(item => ({
        id: item.M_ID,
        date_time: item.M_DATE,
        quantity_sold: Number(item.M_QTY || 0),
        plan_id: item.M_SOURCE_ID,
        signature: item.M_SOURCE_NAME || '-',
        transaction_type: item.TRANSACTION_TYPE_NAME,
        username: item.M_USER_NAME,
        initial_total: initialTotal // เก็บยอดเริ่มต้นไว้
      }))
      .sort((a, b) => new Date(a.date_time) - new Date(b.date_time)); // เรียงจากเก่าไปใหม่
  }, [bill.relatedBills, bill.allRelatedBills]);

  // ตั้งค่าช่วงวันที่เริ่มต้น
  useEffect(() => {
    if (inventoryData?.length > 0) {
      const dates = inventoryData.map(item => new Date(item.date_time));
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      
      setDateFilter({
        startDate: minDate.toISOString().split("T")[0],
        endDate: maxDate.toISOString().split("T")[0],
      });
    }
  }, [inventoryData]);

  // กรองข้อมูลตามช่วงวันที่
  useEffect(() => {
    if (inventoryData && dateFilter.startDate && dateFilter.endDate) {
      const filtered = inventoryData.filter((item) => {
        const itemDate = new Date(item.date_time);
        const start = new Date(dateFilter.startDate);
        const end = new Date(dateFilter.endDate);

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        return itemDate >= start && itemDate <= end;
      });
      setFilteredInventory(filtered);
    } else {
      setFilteredInventory(inventoryData);
    }
  }, [inventoryData, dateFilter]);

  // คำนวณ running total แยกตามลำดับเวลา
  const inventoryWithRunningTotal = useMemo(() => {
    if (filteredInventory.length === 0) return [];

    // ใช้ยอดเริ่มต้นจากรายการแรก
    let runningTotal = filteredInventory[0].initial_total;

    const withRunningTotal = filteredInventory.map(item => {
      // คำนวณยอดคงเหลือ
      runningTotal += item.quantity_sold;

      return {
        ...item,
        quantity_in: item.quantity_sold > 0 ? item.quantity_sold : 0,
        quantity_out: item.quantity_sold < 0 ? Math.abs(item.quantity_sold) : 0,
        quantity_remaining: runningTotal
      };
    });

    // เรียงจากใหม่ไปเก่าสำหรับการแสดงผล
    return withRunningTotal.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
  }, [filteredInventory]);

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
    }, 300);
  };

  const handleExport = () => {
    exportToExcel(inventoryWithRunningTotal, bill, dateFilter);
  };

  if (!bill || !bill.relatedBills) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-gray-900/45 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Desktop View */}
      <div className={`hidden md:flex items-center justify-center min-h-screen p-4 animate__animated animate__faster ${
        isClosing ? "animate__zoomOut" : "animate__zoomIn"
      }`}>
        <div className="relative w-11/12 max-w-6xl max-h-[90vh] bg-gray-100 rounded-2xl shadow-xl">
          <Header 
            recordCount={inventoryWithRunningTotal.length} 
            onClose={handleClose}
          />
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
            <div className="grid grid-cols-3 gap-6">
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

              <div className="col-span-2 space-y-4">
                <DateFilter
                  dateFilter={dateFilter}
                  onDateChange={handleDateChange}
                  onExport={handleExport}
                />
                <InventoryTable 
                  inventory={inventoryWithRunningTotal}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <MobileView
        bill={bill}
        inventoryWithRunningTotal={inventoryWithRunningTotal}
        dateFilter={dateFilter}
        onDateChange={handleDateChange}
        onClose={handleClose}
        handleExport={handleExport}
        isClosing={isClosing}
      />
    </div>
  );
};

export default BillDetailPopup;