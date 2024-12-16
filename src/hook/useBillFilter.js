// hooks/useBillFilter.js
import { useMemo } from "react";
import {
  parseDate,
  getLatestMonthAndYear,
  formatDate,
} from "../utils/dateUtils";

export const useBillFilter = (bills, search, dateFilter) => {
  // Date filtering with memoization
  const dateFilteredBills = useMemo(() => {
    if (!Array.isArray(bills)) return [];
    let filtered = [...bills];

    if (!dateFilter) {
      const latestDates = getLatestMonthAndYear(filtered);
      if (latestDates) {
        filtered = filtered.filter((bill) => {
          const billDate = parseDate(bill?.M_DATE);
          return (
            billDate &&
            billDate >= latestDates.startDate &&
            billDate <= latestDates.endDate
          );
        });
      }
    } else {
      const startDate = new Date(dateFilter.startDate);
      const endDate = new Date(dateFilter.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter((bill) => {
        const billDate = parseDate(bill?.M_DATE);
        return billDate && billDate >= startDate && billDate <= endDate;
      });
    }
    return filtered;
  }, [bills, dateFilter]);

  // Search filtering with memoization
  return useMemo(() => {
    if (!search) return dateFilteredBills;
  
    // ทำความสะอาดคำค้นหา
    const searchLower = search
      .toLowerCase()
      // แปลงเครื่องหมายพิเศษทั้งหมดเป็นช่องว่าง
      .replace(/[;:,"=]/g, ' ') 
      // แทนที่วงเล็บด้วยช่องว่าง
      .replace(/[\(\)]/g, ' ')  
      .trim();
    
    if (!searchLower.includes(' ')) {
      return dateFilteredBills.filter(bill => {
        if (!bill) return false;
        const searchFields = [
          bill.M_PART_NUMBER,
          bill.M_PART_DESCRIPTION,
          bill.M_SUBINV,
          formatDate(bill.M_DATE)
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return searchFields.includes(searchLower);
      });
    }
  
    // แยกคำและทำความสะอาดแต่ละคำ
    const searchTerms = searchLower
      .split(/\s+/)
      .filter(Boolean)
      .map(term => 
        // อนุญาตเฉพาะตัวอักษร ตัวเลข จุด และเครื่องหมายที่จำเป็น
        term.replace(/[^\u0E00-\u0E7F\w\-.×x]/g, '')
      )
      .filter(term => term.length > 0); // กรองคำที่ว่างออก
  
    return dateFilteredBills.filter(bill => {
      if (!bill) return false;
      
      const searchString = [
        bill.M_PART_NUMBER,
        bill.M_PART_DESCRIPTION,
        bill.M_SUBINV,
        formatDate(bill.M_DATE)
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        // แทนที่เครื่องหมายในข้อมูลด้วยช่องว่างเช่นกัน
        .replace(/[;:,"=\(\)]/g, ' ')
        .trim();
  
      // ต้องเจอทุกคำ
      return searchTerms.every(term => searchString.includes(term));
    });
  }, [dateFilteredBills, search]);
};
