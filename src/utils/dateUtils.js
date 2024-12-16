// src/utils/dateUtils.js

// Global caches
const DATE_PARSE_CACHE = new Map();
const FORMAT_DATE_CACHE = new Map();
const LATEST_MONTH_CACHE = new Map();

// Cache clearing function
export const clearDateCaches = () => {
  DATE_PARSE_CACHE.clear();
  FORMAT_DATE_CACHE.clear();
  LATEST_MONTH_CACHE.clear();
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

export const getLatestMonthAndYear = (bills) => {
  if (!bills || !Array.isArray(bills) || bills.length === 0) return null;

  // Create a cache key from bill dates
  const cacheKey = bills
    .map(bill => bill?.M_DATE)
    .filter(Boolean)
    .sort()
    .join('|');

  // Check cache first
  if (LATEST_MONTH_CACHE.has(cacheKey)) {
    return LATEST_MONTH_CACHE.get(cacheKey);
  }

  // Find the latest date efficiently
  let latestDate = null;
  for (const bill of bills) {
    if (!bill?.M_DATE) continue;
    
    const currentDate = parseDate(bill.M_DATE);
    if (currentDate && (!latestDate || currentDate > latestDate)) {
      latestDate = currentDate;
    }
  }

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

// Helper function to check if a date is within a range
export const isDateInRange = (date, startDate, endDate) => {
  const checkDate = parseDate(date);
  if (!checkDate || !startDate || !endDate) return false;
  
  return checkDate >= startDate && checkDate <= endDate;
};

// Helper function to get start and end of month for a given date
export const getMonthRange = (date) => {
  if (!date) return null;
  
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return { startDate, endDate };
};