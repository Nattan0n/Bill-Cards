import * as ExcelJS from "exceljs";
import Swal from 'sweetalert2';

export const exportToExcel = async (
  inventoryWithRemaining,
  bill,
  dateFilter
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
      `${dateFilter.startDate} to ${dateFilter.endDate}`,
    ]);
    worksheet.addRow([]); // Empty row for spacing

    // Define columns - เปลี่ยนจาก ID เป็น No.
    const headers = [
      { header: "No.", key: "no", width: 10 },
      { header: "Date", key: "date", width: 20 },
      { header: "Quantity In/Out", key: "quantity", width: 15 },
      { header: "Plan ID", key: "planId", width: 15 },
      { header: "Remaining", key: "remaining", width: 15 },
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

    // Add data rows - เพิ่ม index + 1 เป็นลำดับที่
    inventoryWithRemaining.forEach((item, index) => {
      const row = worksheet.addRow([
        index + 1, // ใช้ index + 1 แทน item.id
        item.date_time,
        item.quantity_sold,
        item.plan_id,
        item.quantity_remaining,
        item.username,
      ]);

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