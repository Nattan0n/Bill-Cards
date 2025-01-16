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

  // Helper function to compare dates with time
  const compareDatesWithTime = (dateA, dateB) => {
    const [dateStrA, timeStrA = '00:00:00'] = dateA.split(' ');
    const [dateStrB, timeStrB = '00:00:00'] = dateB.split(' ');

    // เปรียบเทียบวันที่
    if (dateStrA !== dateStrB) {
      return new Date(dateStrA) - new Date(dateStrB);
    }

    // ถ้าวันที่เท่ากัน เปรียบเทียบเวลา
    const timeA = timeStrA.split(':').map(Number);
    const timeB = timeStrB.split(':').map(Number);

    // เปรียบเทียบชั่วโมง
    if (timeA[0] !== timeB[0]) {
      return timeA[0] - timeB[0];
    }

    // เปรียบเทียบนาที
    if (timeA[1] !== timeB[1]) {
      return timeA[1] - timeB[1];
    }

    // เปรียบเทียบวินาที
    return timeA[2] - timeB[2];
  };

  // แปลงข้อมูลและเรียงลำดับตามวันที่และเวลา
  const inventoryData = useMemo(() => {
    if (!bill?.allRelatedBills?.length) return [];

    return bill.allRelatedBills
      .map(item => ({
        id: item.M_ID,
        numericId: Number(item.M_ID),
        date_time: item.M_DATE,
        quantity_sold: Number(item.M_QTY || 0),
        transaction_type: item.TRANSACTION_TYPE_NAME,
        username: item.M_USER_NAME,
        source_name: item.M_SOURCE_NAME || '-',
      }))
      .sort((a, b) => {
        const dateCompare = compareDatesWithTime(a.date_time, b.date_time);
        return dateCompare === 0 ? Number(a.id) - Number(b.id) : dateCompare;
      });
  }, [bill?.allRelatedBills]);

  // ตั้งค่าช่วงวันที่เริ่มต้นเป็นเดือนล่าสุด
  useEffect(() => {
    if (bill?.relatedBills?.length > 0) {
      const dates = bill.relatedBills.map(item => new Date(item.M_DATE));
      const maxDate = new Date(Math.max(...dates));
      
      // คำนวณวันที่เริ่มต้นและสิ้นสุดของเดือนล่าสุด
      const startOfMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      const endOfMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
      
      setDateFilter({
        startDate: startOfMonth.toISOString().split("T")[0],
        endDate: endOfMonth.toISOString().split("T")[0],
      });
    }
  }, [bill?.relatedBills]);

  // กรองข้อมูลตามช่วงวันที่
  useEffect(() => {
    if (!inventoryData?.length || !dateFilter.startDate || !dateFilter.endDate) {
      setFilteredInventory(inventoryData);
      return;
    }

    const filtered = inventoryData.filter((item) => {
      const itemDate = new Date(item.date_time);
      const start = new Date(dateFilter.startDate);
      const end = new Date(dateFilter.endDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      return itemDate >= start && itemDate <= end;
    });
    
    setFilteredInventory(filtered);
  }, [inventoryData, dateFilter]);

  // คำนวณ running total ที่ปรับปรุงใหม่
  const inventoryWithRunningTotal = useMemo(() => {
    if (!filteredInventory?.length || !bill?.allRelatedBills?.length) return [];
  
    // 1. เตรียมข้อมูลทั้งหมดและเรียงตามเวลาจากเก่าไปใหม่
    const sortedAllTransactions = [...bill.allRelatedBills]
      .map(item => ({
        id: item.M_ID,
        date_time: item.M_DATE,
        quantity_sold: Number(item.M_QTY || 0)
      }))
      .sort((a, b) => {
        const dateA = new Date(a.date_time);
        const dateB = new Date(b.date_time);
        if (dateA.getTime() === dateB.getTime()) {
          return Number(a.id) - Number(b.id);
        }
        return dateA - dateB;
      });
  
    // 2. คำนวณค่าคงเหลือสะสมและเก็บประวัติการคำนวณ
    const runningTotals = new Map();
    let total = 0;
    let previousValue = 0;
  
    sortedAllTransactions.forEach(transaction => {
      previousValue = total;
      total += transaction.quantity_sold;
      runningTotals.set(transaction.id, {
        final: total,
        previous: previousValue,
        change: transaction.quantity_sold
      });
    });
  
    // 3. นำข้อมูลที่กรองมาใส่ค่าคำนวณและจัดเรียง
    const displayData = filteredInventory.map(item => {
      const calculation = runningTotals.get(item.id);
      return {
        ...item,
        quantity_remaining: calculation.final,
        debug_info: {
          id: item.id,
          date: item.date_time,
          previous: calculation.previous,
          change: calculation.change,
          final: calculation.final
        }
      };
    });
  
    // 4. เรียงข้อมูลสำหรับแสดงผลจากใหม่ไปเก่า
    return displayData
      .sort((a, b) => {
        const dateA = new Date(a.date_time);
        const dateB = new Date(b.date_time);
        
        if (dateA.getTime() === dateB.getTime()) {
          // กรณีเวลาเดียวกัน
          if (a.quantity_sold < 0 && b.quantity_sold > 0) return 1;
          if (a.quantity_sold > 0 && b.quantity_sold < 0) return -1;
          // ถ้าประเภทเดียวกัน เรียงตาม ID จากมากไปน้อย
          return Number(b.id) - Number(a.id);
        }
        return dateB - dateA;
      })
      .map((item, index) => ({
        ...item,
        sequence_number: index + 1
      }));
  }, [filteredInventory, bill?.allRelatedBills]);
  
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

  const DebugCalculation = () => {
    if (process.env.NODE_ENV === 'production') return null;
    
    return (
      <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs font-mono overflow-x-auto">
        <h3 className="font-semibold mb-2">Calculation Debug:</h3>
        <div className="space-y-1">
          {inventoryWithRunningTotal.map((item) => (
            <div key={item.id} className="flex flex-col border-b border-gray-200 py-1">
              <div className="flex justify-between">
                <span className="whitespace-nowrap">
                  #{item.sequence_number} [ID: {item.id}] [{new Date(item.date_time).toLocaleString()}]
                </span>
                <span className="ml-4 text-blue-600 whitespace-nowrap">
                  {item.debug_info.previous} {item.debug_info.change >= 0 ? '+' : ''} 
                  ({item.debug_info.change}) = {item.debug_info.final}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
                {process.env.NODE_ENV !== 'production' && (
                  <DebugCalculation />
                )}
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

export default React.memo(BillDetailPopup);