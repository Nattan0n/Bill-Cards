import ExcelJS from "exceljs";
import Swal from 'sweetalert2';
import { formatDate } from "./dateUtils";

/**
 * ส่งออกข้อมูลเป็นไฟล์ Excel
 * @param {Array} bills - รายการบิลที่จะส่งออก
 * @returns {Promise<void>}
 */
export const exportBillsToExcel = async (bills) => {
  try {
    if (!bills || bills.length === 0) {
      await Swal.fire({
        title: 'ไม่พบข้อมูล',
        text: 'ไม่มีข้อมูลที่จะส่งออก',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#3085d6'
      });
      throw new Error("ไม่มีข้อมูลที่จะส่งออก");
    }

    // แสดง loading
    Swal.fire({
      title: 'กำลังสร้างไฟล์ Excel',
      html: 'กรุณารอสักครู่...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bills");

    // กำหนดคอลัมน์
    worksheet.columns = [
      { header: "ลำดับ", key: "no", width: 10 },
      { header: "รหัสสินค้า", key: "partNumber", width: 15 },
      { header: "รายละเอียดสินค้า", key: "partDescription", width: 30 },
      { header: "ลูกค้า", key: "customer", width: 15 },
      { header: "วันที่", key: "date", width: 15 },
      { header: "จำนวนที่รับ", key: "quantityRC", width: 10 },
      { header: "จำนวนคงเหลือ", key: "quantityRM", width: 10 },
      { header: "เลขที่งาน", key: "jobNumber", width: 15 },
    ];

    // เพิ่มข้อมูล
    bills.forEach((bill, index) => {
      worksheet.addRow({
        no: index + 1,
        partNumber: bill.M_PART_NUMBER,
        partDescription: bill.M_PART_DESCRIPTION,
        customer: bill.M_SUBINV,
        date: formatDate(bill.M_DATE),
        quantityRC: bill.M_QTY,
        quantityRM: bill.M_QTY_RM,
        jobNumber: bill.M_SOURCE_LINE_ID,
      });
    });

    // จัดแต่งตาราง
    worksheet.getRow(1).font = { bold: true };
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // ส่งออกไฟล์
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Bills_${new Date().toLocaleDateString()}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    // แสดงข้อความสำเร็จ
    await Swal.fire({
      title: 'สำเร็จ!',
      text: 'ส่งออกข้อมูลเรียบร้อยแล้ว',
      icon: 'success',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#3085d6'
    });

    return Promise.resolve();
  } catch (error) {
    console.error("Export failed:", error);
    
    // แสดงข้อความเมื่อเกิดข้อผิดพลาด
    await Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: error.message || 'เกิดข้อผิดพลาดในการส่งออกข้อมูล กรุณาลองใหม่อีกครั้ง',
      icon: 'error',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#3085d6'
    });
    
    throw error;
  }
};