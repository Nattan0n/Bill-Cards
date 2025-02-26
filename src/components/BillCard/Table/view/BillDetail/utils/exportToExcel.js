import * as ExcelJS from "exceljs";
import Swal from 'sweetalert2';
import { parseDate } from "../../../../../../utils/dateUtils";

export const exportToExcel = async (
  inventoryWithRemaining,
  bill,
  dateFilter,
  sortDirection = 'desc' // รับ sortDirection จาก UI
) => {
  try {
    if (inventoryWithRemaining.length === 0) {
      await Swal.fire({
        title: 'ไม่พบข้อมูล',
        text: 'ไม่มีข้อมูลที่จะส่งออก',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    // เรียงข้อมูลก่อนส่งออกด้วยลอจิกเดียวกันกับในตาราง UI
    const sortedInventory = [...inventoryWithRemaining].sort((a, b) => {
      const dateA = parseDate(a.date_time);
      const dateB = parseDate(b.date_time);
      
      if (!dateA || !dateB) return 0;
      
      // Compare timestamps first
      const timeCompare = dateA.getTime() - dateB.getTime();
      
      // If timestamps are different, use them
      if (timeCompare !== 0) {
        return sortDirection === 'asc' ? timeCompare : -timeCompare;
      }
      
      // If timestamps are the same, compare by document ID
      const idA = Number(a.id || 0);
      const idB = Number(b.id || 0);
      return sortDirection === 'asc' ? idA - idB : idB - idA;
    });

    // เพิ่มฟังก์ชันใหม่สำหรับจัดรูปแบบวันที่ใน Excel
    const formatDateForExcel = (dateTimeStr) => {
      try {
        if (!dateTimeStr) return "-";
        const date = new Date(dateTimeStr);
        if (isNaN(date.getTime())) return dateTimeStr;
        
        // จัดรูปแบบเป็น วัน/เดือน/ปี เวลา
        return new Intl.DateTimeFormat('th-TH', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(date);
        
      } catch (error) {
        console.error("Error formatting date for Excel:", error);
        return dateTimeStr;
      }
    };

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Inventory Log");

    // Add title section
    const titleRow = worksheet.addRow(["Part Details"]);
    titleRow.font = { bold: true, size: 14 };

    // Add part information
    worksheet.addRow(["Part Number:", bill.M_PART_NUMBER]);
    worksheet.addRow(["Description:", bill.M_PART_DESCRIPTION]);
    worksheet.addRow(["Customer:", bill.M_SUBINV]);
    worksheet.addRow([
      "Date Range:",
      `${formatDateForExcel(dateFilter.startDate)} to ${formatDateForExcel(dateFilter.endDate)}`,
    ]);
    worksheet.addRow([]); // Empty row for spacing

    // Define columns with separate Quantity In and Quantity Out
    const headers = [
      { header: "No.", key: "no", width: 10 },
      { header: "Date", key: "date", width: 20 },
      { header: "Quantity In (+)", key: "quantityIn", width: 15 },
      { header: "Quantity Out (-)", key: "quantityOut", width: 15 },
      { header: "Remaining", key: "remaining", width: 15 },
      { header: "Document number", key: "eDocumentNo", width: 17 },
      { header: "User", key: "user", width: 20 },
    ];

    // Add header row
    const headerRow = worksheet.addRow(headers.map((h) => h.header));

    // Style header row
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };
      cell.font = { bold: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // ใช้ข้อมูลที่เรียงแล้วในการสร้าง Excel
    sortedInventory.forEach((item, index) => {
      const quantityIn = item.quantity_sold > 0 ? `+${Math.abs(item.quantity_sold)}` : "-";
      const quantityOut = item.quantity_sold < 0 ? `-${Math.abs(item.quantity_sold)}` : "-";

      const documentReference = item.eDocumentNo === "source_nu" 
        ? (item.transaction_type || "-") 
        : (item.eDocumentNo || "-");
        
      const row = worksheet.addRow([
        index + 1,
        formatDateForExcel(item.date_time),
        quantityIn,
        quantityOut,
        item.quantity_remaining,
        documentReference,
        item.username,
      ]);

      // Conditional coloring
      if (item.quantity_sold > 0) {
        row.getCell(3).font = { color: { argb: 'FF008000' } }; // Green for Quantity In
      }
      if (item.quantity_sold < 0) {
        row.getCell(4).font = { color: { argb: 'FFFF0000' } }; // Red for Quantity Out
      }

      // Style data cells
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
    });

    // Set column widths
    headers.forEach((header, index) => {
      worksheet.getColumn(index + 1).width = header.width;
    });

    // Show loading while generating file
    Swal.fire({
      title: 'กำลังสร้างไฟล์',
      html: 'กรุณารอสักครู่...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Generate and download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Inventory_Log_${
      bill.M_PART_NUMBER
    }_${new Date().toLocaleDateString()}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    // Close loading and show success message
    await Swal.fire({
      title: 'สำเร็จ!',
      text: 'ส่งออกข้อมูลเรียบร้อยแล้ว',
      icon: 'success',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#3085d6'
    });

  } catch (error) {
    console.error("Export failed:", error);
    console.log("Error details:", error.message);
    console.log("Data causing error:", inventoryWithRemaining);
    
    await Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: 'เกิดข้อผิดพลาดในการส่งออกข้อมูล กรุณาลองใหม่อีกครั้ง',
      icon: 'error',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#3085d6'
    });
  }
};