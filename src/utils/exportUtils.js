import ExcelJS from "exceljs";
import Swal from 'sweetalert2';
import { formatDate } from "./dateUtils";

/**
 * แปลงวันที่เป็น string format
 * @param {Date|string} date - วันที่ที่ต้องการแปลง
 * @returns {string} วันที่ในรูปแบบ string
 */
const formatDateSafe = (date) => {
  if (!date) return '-';
  
  try {
    // ถ้าเป็น Date object ให้แปลงเป็น ISO string ก่อน
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    
    // ถ้าเป็น string ให้ใช้ formatDate ตามปกติ
    return formatDate(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * แสดง Loading Dialog
 */
const showLoading = () => {
  return Swal.fire({
    title: 'กำลังสร้างไฟล์ Excel',
    html: 'กรุณารอสักครู่...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

/**
 * แสดงข้อความแจ้งเตือน
 */
const showAlert = async (options) => {
  await Swal.fire({
    title: options.title,
    text: options.text,
    icon: options.icon,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#3085d6'
  });
};

/**
 * จัดรูปแบบตาราง
 */
const formatWorksheet = (worksheet) => {
  // สร้างสไตล์สำหรับส่วนหัว
  const headerStyle = {
    font: { bold: true, size: 11, color: { argb: '000000' } },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F2F2F2' }  // สีพื้นหลังอ่อนลง
    },
    alignment: { vertical: 'middle', horizontal: 'center' },
    border: {
      top: { style: 'medium', color: { argb: '000000' } },
      left: { style: 'medium', color: { argb: '000000' } },
      bottom: { style: 'medium', color: { argb: '000000' } },
      right: { style: 'medium', color: { argb: '000000' } }
    }
  };

  // สร้างสไตล์สำหรับข้อมูล
  const dataStyle = {
    alignment: { vertical: 'middle', horizontal: 'center' },
    border: {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } }
    },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF' }  // พื้นหลังขาว
    }
  };

  // จัดรูปแบบส่วนหัว
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.style = headerStyle;
  });

  // จัดรูปแบบข้อมูล
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber !== 1) {  // ข้ามแถวส่วนหัว
      row.eachCell((cell) => {
        cell.style = dataStyle;
      });
    }
  });

  // ปรับความกว้างคอลัมน์อัตโนมัติ
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, cell => {
      const cellValue = cell.value || '';
      const cellLength = cellValue.toString().length;
      maxLength = Math.max(maxLength, cellLength);
    });
    // กำหนดความกว้างขั้นต่ำและสูงสุด
    column.width = Math.max(Math.min(maxLength + 2, 50), 8);
  });
};

/**
 * ส่งออกข้อมูล Part List
 */
export const exportPartListToExcel = async (bills) => {
  try {
    if (!bills || bills.length === 0) {
      throw new Error("ไม่มีข้อมูลที่จะส่งออก");
    }

    const loading = showLoading();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Part List");

    // กำหนดคอลัมน์
    worksheet.columns = [
      { header: "NO.", key: "no", width: 10 },
      { header: "Part No.", key: "partNumber", width: 15 },
      { header: "Part Name", key: "partDescription", width: 30 },
      { header: "SubInventory", key: "subinvean", width: 15 },
    ];

    // เพิ่มข้อมูล
    bills.forEach((bill, index) => {
      worksheet.addRow({
        no: index + 1,
        partNumber: bill.M_PART_NUMBER || '-',
        partDescription: bill.M_PART_DESCRIPTION || '-',
        subinvean: bill.M_SUBINV || '-',
      });
    });

    formatWorksheet(worksheet);

    // ส่งออกไฟล์
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const currentDate = new Date().toISOString().split('T')[0];
    link.download = `PartList_${currentDate}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    loading.close();
    await showAlert({
      title: 'สำเร็จ!',
      text: 'ส่งออกข้อมูลเรียบร้อยแล้ว',
      icon: 'success'
    });

  } catch (error) {
    console.error("Export failed:", error);
    await showAlert({
      title: 'เกิดข้อผิดพลาด!',
      text: error.message || 'เกิดข้อผิดพลาดในการส่งออกข้อมูล กรุณาลองใหม่อีกครั้ง',
      icon: 'error'
    });
    throw error;
  }
};

/**
 * ส่งออกรายละเอียด Bill Card
 */
// export const exportBillDetailToExcel = async (inventory, partInfo, dateFilter) => {
//   try {
//     if (!inventory || inventory.length === 0) {
//       throw new Error("ไม่มีข้อมูลที่จะส่งออก");
//     }

//     const loading = showLoading();

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Bill Detail");

//     // เพิ่มส่วนหัว
//     worksheet.mergeCells('A1:G1');
//     worksheet.getCell('A1').value = `รายละเอียดการเคลื่อนไหวสินค้า: ${partInfo.M_PART_NUMBER || '-'}`;
//     worksheet.getCell('A1').font = { bold: true, size: 14 };
//     worksheet.getCell('A1').alignment = { horizontal: 'center' };

//     // ข้อมูลสินค้า
//     worksheet.mergeCells('A2:G2');
//     worksheet.getCell('A2').value = `รายละเอียด: ${partInfo.M_PART_DESCRIPTION || '-'}`;
//     worksheet.getCell('A2').alignment = { horizontal: 'center' };

//     // ช่วงวันที่
//     worksheet.mergeCells('A3:G3');
//     worksheet.getCell('A3').value = `วันที่: ${formatDateSafe(dateFilter.startDate)} ถึง ${formatDateSafe(dateFilter.endDate)}`;
//     worksheet.getCell('A3').alignment = { horizontal: 'center' };

//     // เว้น 1 บรรทัด
//     worksheet.addRow([]);

//     // กำหนดคอลัมน์
//     worksheet.columns = [
//       { header: "ลำดับ", key: "no", width: 10 },
//       { header: "วันที่", key: "date", width: 15 },
//       { header: "เลขที่เอกสาร", key: "docNo", width: 15 },
//       { header: "ประเภทรายการ", key: "type", width: 20 },
//       { header: "รับเข้า", key: "in", width: 12 },
//       { header: "จ่ายออก", key: "out", width: 12 },
//       { header: "คงเหลือ", key: "remaining", width: 12 }
//     ];

//     // เพิ่มข้อมูล
//     inventory.forEach((item, index) => {
//       worksheet.addRow({
//         no: index + 1,
//         date: formatDateSafe(item.date_time),
//         docNo: item.plan_id || '-',
//         type: item.transaction_type || '-',
//         in: item.quantity_in || '',
//         out: item.quantity_out || '',
//         remaining: item.quantity_remaining || 0
//       });
//     });

//     formatWorksheet(worksheet);

//     // ส่งออกไฟล์
//     const buffer = await workbook.xlsx.writeBuffer();
//     const blob = new Blob([buffer], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     });
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     const currentDate = new Date().toISOString().split('T')[0];
//     link.download = `Inventory_Log_${partInfo.M_PART_NUMBER}_${currentDate}.xlsx`;
//     link.click();
//     window.URL.revokeObjectURL(url);

//     loading.close();
//     await showAlert({
//       title: 'สำเร็จ!',
//       text: 'ส่งออกข้อมูลเรียบร้อยแล้ว',
//       icon: 'success'
//     });

//   } catch (error) {
//     console.error("Export failed:", error);
//     await showAlert({
//       title: 'เกิดข้อผิดพลาด!',
//       text: error.message || 'เกิดข้อผิดพลาดในการส่งออกข้อมูล กรุณาลองใหม่อีกครั้ง',
//       icon: 'error'
//     });
//     throw error;
//   }
// };