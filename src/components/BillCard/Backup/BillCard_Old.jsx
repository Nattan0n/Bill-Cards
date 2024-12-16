import React, { useState, useCallback } from "react";
import BillSearch from "../BillSearch";
import BillTable from "../BillTable";
import ExcelJS from "exceljs";
import { getQRCodeDataUrl } from "../QrCodeGenerator";
import Pagination from "../../Pagination/Pagination";

// ฟังก์ชันสำหรับแปลงรูปแบบวันที่
const parseDate = (dateStr) => {
  try {
    if (!dateStr) return null;
    // แปลงจาก "11/20/24 14:06" เป็น Date object
    const [date, time] = dateStr.split(" ");
    if (!date || !time) return null;

    const [month, day, year] = date.split("/");
    const [hour, minute] = time.split(":");

    if (!month || !day || !year || !hour || !minute) return null;

    // เพิ่ม '20' นำหน้าปี ค.ศ. ถ้าเป็นตัวเลข 2 หลัก
    const fullYear = year.length === 2 ? `20${year}` : year;

    const result = new Date(fullYear, parseInt(month) - 1, day, hour, minute);
    return isNaN(result.getTime()) ? null : result;
  } catch (error) {
    console.error("Error parsing date:", dateStr, error);
    return null;
  }
};

// ฟังก์ชันสำหรับจัดรูปแบบวันที่แสดงผล
const formatDate = (dateStr) => {
  const date = parseDate(dateStr);
  if (!date) return dateStr;

  // แปลงเป็นรูปแบบ "วัน/เดือน/ปี เวลา"
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// ฟังก์ชันสำหรับหาเดือนและปีล่าสุด
const getLatestMonthAndYear = (bills) => {
  if (!bills || !Array.isArray(bills) || bills.length === 0) return null;

  const validDates = bills
    .map((bill) => (bill?.M_DATE ? parseDate(bill.M_DATE) : null))
    .filter((date) => date !== null);

  if (validDates.length === 0) return null;

  const latestDate = new Date(Math.max(...validDates));
  return {
    month: latestDate.getMonth(),
    year: latestDate.getFullYear(),
    fullDate: latestDate
  };
};

const BillCard = ({ bills }) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterLatestMonth, setFilterLatestMonth] = useState(true);
  const itemsPerPage = 6;
  const [selectedBills, setSelectedBills] = useState([]);

  // Toggle filter function
  const toggleMonthFilter = useCallback(() => {
    setFilterLatestMonth((prev) => !prev);
    setCurrentPage(1);
    setSelectedBills([]); // รีเซ็ตการเลือกเมื่อเปลี่ยน filter
  }, []);

  // ฟังก์ชัน handle การเลือกข้อมูล
  const handleSelectedRowsChange = useCallback((selectedRows) => {
    requestAnimationFrame(() => {
      setSelectedBills(selectedRows);
    });
  }, []);

  // Export to Excel function
  const exportToExcel = useCallback(async () => {
    try {
      const dataToExport = selectedBills.length > 0 ? selectedBills : bills;

      if (dataToExport.length === 0) {
        alert("ไม่มีข้อมูลที่จะส่งออก");
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Bills");

      worksheet.columns = [
        { header: "ลำดับ", key: "no", width: 10 },
        { header: "รหัสสินค้า", key: "partNumber", width: 15 },
        { header: "รายละเอียดสินค้า", key: "partDescription", width: 30 },
        { header: "ลูกค้า", key: "customer", width: 15 },
        { header: "วันที่", key: "date", width: 15 },
        { header: "จำนวนที่รับ", key: "quantityRC", width: 10 },
        { header: "จำนวนที่ขาย", key: "quantityS", width: 10 },
        { header: "จำนวนคงเหลือ", key: "quantityRM", width: 10 },
        { header: "ประเภท", key: "type", width: 15 },
        { header: "เลขที่งาน", key: "jobNumber", width: 15 },
        { header: "รหัสอ้างอิง", key: "sourceId", width: 15 },
        { header: "QR Code", key: "qrCode", width: 15 },
      ];

      // จัดแต่งหัวตาราง
      worksheet.getRow(1).font = { bold: true, size: 12 };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF8DB4E2" },
      };

      // เพิ่มเส้นขอบ
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

      // เรียงข้อมูลตามวันที่ล่าสุด
      const sortedBills = [...dataToExport].sort(
        (a, b) => parseDate(b.M_DATE) - parseDate(a.M_DATE)
      );

      // เพิ่มข้อมูลและ QR Code
      for (const [index, bill] of sortedBills.entries()) {
        try {
          const qrDataUrl = await getQRCodeDataUrl(bill);

          worksheet.addRow({
            no: index + 1,
            partNumber: bill.M_PART_NUMBER,
            partDescription: bill.M_PART_DESCRIPTION,
            customer: bill.M_SUBINV,
            date: formatDate(bill.M_DATE), // ใช้ฟังก์ชัน formatDate
            quantityRC: bill.M_QTY,
            quantityS: bill.M_QTY,
            quantityRM: bill.M_QTY_RM,
            type: bill.TRANSACTION_TYPE_NAME,
            jobNumber: bill.M_SOURCE_LINE_ID,
            sourceId: bill.M_SOURCE_ID,
          });

          if (qrDataUrl) {
            const imageId = workbook.addImage({
              base64: qrDataUrl.split(",")[1],
              extension: "png",
            });

            worksheet.addImage(imageId, {
              tl: { col: 11, row: index + 1 },
              ext: { width: 100, height: 100 },
            });

            worksheet.getRow(index + 2).height = 75;
          }
        } catch (error) {
          console.error(
            `Failed to generate QR code for bill ${bill.M_PART_NUMBER}:`,
            error
          );
          continue;
        }
      }

      // ส่งออกไฟล์
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `BillsData${
        selectedBills.length > 0 ? "_Selected" : ""
      }.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      alert("ส่งออกข้อมูลสำเร็จ!");
    } catch (error) {
      console.error("Export failed:", error);
      alert("เกิดข้อผิดพลาดในการส่งออกข้อมูล กรุณาลองใหม่อีกครั้ง");
    }
  }, [bills, selectedBills]);

  // ฟังก์ชันค้นหา
  const handleSearch = useCallback((searchTerm) => {
    setSearch(searchTerm);
    setCurrentPage(1);
    setSelectedBills([]);
  }, []);

  // กรองและจัดเรียงข้อมูล
  const filteredBills = React.useMemo(() => {
    if (!bills || !Array.isArray(bills)) return [];

    let filtered = [...bills];

    // กรองตามเดือนและปีล่าสุด
    if (filterLatestMonth) {
      const latest = getLatestMonthAndYear(bills);
      if (latest) {
        filtered = filtered.filter((bill) => {
          const billDate = parseDate(bill?.M_DATE);
          return (
            billDate &&
            billDate.getMonth() === latest.month &&
            billDate.getFullYear() === latest.year
          );
        });
      }
    }

    // กรองตามคำค้นหา
    if (search) {
      filtered = filtered.filter((bill) => {
        if (!bill || !bill.M_PART_DESCRIPTION || !bill.M_PART_NUMBER) {
          return false;
        }

        const searchLower = search.replace(/\s+/g, "").toLowerCase();
        return (
          (bill.M_PART_DESCRIPTION || "")
            .replace(/\s+/g, "")
            .toLowerCase()
            .includes(searchLower) ||
          (bill.M_PART_NUMBER || "")
            .replace(/\s+/g, "")
            .toLowerCase()
            .includes(searchLower) ||
          (bill.M_SUBINV || "")
            .replace(/\s+/g, "")
            .toLowerCase()
            .includes(searchLower) ||
          (formatDate(bill.M_DATE) || "")
            .replace(/\s+/g, "")
            .toLowerCase()
            .includes(searchLower)
        );
      });
    }

    // เรียงตามวันที่ล่าสุด
    return filtered.sort((a, b) => {
      const dateA = parseDate(a?.M_DATE);
      const dateB = parseDate(b?.M_DATE);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB - dateA;
    });
  }, [bills, search, filterLatestMonth]);

  // คำนวณข้อมูลสำหรับ pagination
  const totalItems = filteredBills.length;
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / itemsPerPage) : 0;
  const indexOfLastBill = currentPage * itemsPerPage;
  const indexOfFirstBill = indexOfLastBill - itemsPerPage;
  const currentBills = filteredBills.slice(indexOfFirstBill, indexOfLastBill);

  // ฟังก์ชันเปลี่ยนหน้า
  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        setSelectedBills([]);
      }
    },
    [totalPages]
  );

  return (
    <div>
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="overflow-y-auto h-screen">
          <div className="py-12">
            <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
              <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900">
                  <BillSearch
                    onSearch={handleSearch}
                    onExport={exportToExcel}
                    bills={bills}
                    filterLatestMonth={filterLatestMonth}
                    toggleMonthFilter={toggleMonthFilter}
                  />
                  <BillTable
                    bills={currentBills}
                    startingIndex={indexOfFirstBill}
                    onSelectedRowsChange={handleSelectedRowsChange}
                    key={`${currentPage}-${search}`}
                  />
                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <div className="h-screen flex flex-col overflow-hidden">
          <div className="sticky top-0 bg-white z-10 shadow-sm">
            <BillSearch
              onSearch={handleSearch}
              onExport={exportToExcel}
              bills={bills}
              filterLatestMonth={filterLatestMonth}
              toggleMonthFilter={toggleMonthFilter}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="py-1">
              <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                  <div className="text-gray-900">
                    <BillTable
                      bills={currentBills}
                      startingIndex={indexOfFirstBill}
                      onSelectedRowsChange={handleSelectedRowsChange}
                      key={`${currentPage}-${search}`}
                    />
                    <Pagination
                      totalPages={totalPages}
                      currentPage={currentPage}
                      totalItems={totalItems}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillCard;