// src/utils/dateUtils.js

// Global caches
const DATE_PARSE_CACHE = new Map();
const FORMAT_DATE_CACHE = new Map();
const LATEST_MONTH_CACHE = new Map();
const DATE_RANGE_CACHE = new Map();

// Cache clearing function
export const clearDateCaches = () => {
  DATE_PARSE_CACHE.clear();
  FORMAT_DATE_CACHE.clear();
  LATEST_MONTH_CACHE.clear();
  DATE_RANGE_CACHE.clear();
};

export const parseDate = (dateStr) => {
  try {
    if (!dateStr) return null;
    
    // Check cache first
    if (DATE_PARSE_CACHE.has(dateStr)) {
      return DATE_PARSE_CACHE.get(dateStr);
    }
    
    let result = null;
    
    // Parse based on date format
    if (dateStr.includes('-')) {
      // For "2024-04-19 09:26:19" format
      const date = new Date(dateStr);
      result = isNaN(date.getTime()) ? null : date;
    } else {
      // For "MM/DD/YY HH:mm" format
      const [date, time] = dateStr.split(" ");
      if (!date || !time) return null;

      const [month, day, year] = date.split("/");
      const [hour, minute] = time.split(":");

      if (!month || !day || !year || !hour || !minute) return null;

      const fullYear = year.length === 2 ? `20${year}` : year;
      const parsedDate = new Date(
        fullYear, 
        parseInt(month) - 1, 
        day, 
        hour, 
        minute
      );
      result = isNaN(parsedDate.getTime()) ? null : parsedDate;
    }

    // Store in cache
    DATE_PARSE_CACHE.set(dateStr, result);
    return result;

  } catch (error) {
    console.error("Error parsing date:", dateStr, error);
    return null;
  }
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  
  // Check cache first
  if (FORMAT_DATE_CACHE.has(dateStr)) {
    return FORMAT_DATE_CACHE.get(dateStr);
  }

  const date = parseDate(dateStr);
  if (!date) return dateStr;

  const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  
  // Store in cache
  FORMAT_DATE_CACHE.set(dateStr, formattedDate);
  return formattedDate;
};

// Enhanced getLatestMonthAndYear with better caching
export const getLatestMonthAndYear = (bills) => {
  if (!bills || !Array.isArray(bills) || bills.length === 0) return null;

  // Create a cache key from the latest 5 bill dates to improve cache hit rate
  const cacheKey = bills
    .map(bill => bill?.M_DATE)
    .filter(Boolean)
    .sort((a, b) => parseDate(b).getTime() - parseDate(a).getTime())
    .slice(0, 5)
    .join('|');

  // Check cache first
  if (LATEST_MONTH_CACHE.has(cacheKey)) {
    return LATEST_MONTH_CACHE.get(cacheKey);
  }

  // Find the latest date efficiently using reduce
  const latestDate = bills.reduce((latest, bill) => {
    if (!bill?.M_DATE) return latest;
    
    const currentDate = parseDate(bill.M_DATE);
    if (!currentDate) return latest;
    
    return !latest || currentDate > latest ? currentDate : latest;
  }, null);

  if (!latestDate) return null;

  // Create result object
  const result = {
    month: latestDate.getMonth(),
    year: latestDate.getFullYear(),
    fullDate: latestDate,
    startDate: new Date(latestDate.getFullYear(), latestDate.getMonth(), 1),
    endDate: new Date(
      latestDate.getFullYear(), 
      latestDate.getMonth() + 1, 
      0, 
      23, 
      59, 
      59, 
      999
    )
  };

  // Store in cache
  LATEST_MONTH_CACHE.set(cacheKey, result);
  return result;
};

// Enhanced isDateInRange with normalization
export const isDateInRange = (date, startDate, endDate) => {
  const checkDate = typeof date === 'string' ? parseDate(date) : date;
  if (!checkDate || !startDate || !endDate) return false;
  
  // Normalize time components for more accurate comparison
  const normalizedCheckDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
  const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);
  
  return normalizedCheckDate >= normalizedStartDate && normalizedCheckDate <= normalizedEndDate;
};

// Enhanced getMonthRange with caching
export const getMonthRange = (date) => {
  if (!date) return null;
  
  const cacheKey = `${date.getFullYear()}-${date.getMonth()}`;
  
  if (DATE_RANGE_CACHE.has(cacheKey)) {
    return DATE_RANGE_CACHE.get(cacheKey);
  }
  
  const range = {
    startDate: new Date(date.getFullYear(), date.getMonth(), 1),
    endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
  };
  
  DATE_RANGE_CACHE.set(cacheKey, range);
  return range;
};

// New helper function to get effective date range
export const getEffectiveDateRange = (bills, providedDateRange = null) => {
  if (providedDateRange) {
    return {
      startDate: new Date(providedDateRange.startDate),
      endDate: new Date(providedDateRange.endDate)
    };
  }
  
  const latestMonth = getLatestMonthAndYear(bills);
  return latestMonth ? {
    startDate: latestMonth.startDate,
    endDate: latestMonth.endDate
  } : null;
};

// New helper to filter bills by date range
export const filterBillsByDateRange = (bills, dateRange) => {
  if (!Array.isArray(bills) || !dateRange) return bills;
  
  return bills.filter(bill => 
    bill && bill.M_DATE && isDateInRange(bill.M_DATE, dateRange.startDate, dateRange.endDate)
  );
};

// New helper to group bills by part number
export const groupBillsByPartNumber = (bills, dateRange = null) => {
  const partMap = new Map();
  
  bills.forEach(bill => {
    if (!bill?.M_PART_NUMBER) return;
    
    if (!partMap.has(bill.M_PART_NUMBER)) {
      const relatedBills = bills.filter(b => b.M_PART_NUMBER === bill.M_PART_NUMBER);
      
      const sortedBills = relatedBills.sort((a, b) => {
        const dateA = parseDate(a.M_DATE);
        const dateB = parseDate(b.M_DATE);
        return dateB.getTime() - dateA.getTime();
      });
      
      const totalQty = relatedBills.reduce((sum, b) => sum + Number(b.M_QTY || 0), 0);
      
      partMap.set(bill.M_PART_NUMBER, {
        ...sortedBills[0],
        totalQty,
        billCount: relatedBills.length,
        relatedBills: sortedBills,
        latestDate: parseDate(sortedBills[0].M_DATE),
        dateRange
      });
    }
  });
  
  return Array.from(partMap.values());
};