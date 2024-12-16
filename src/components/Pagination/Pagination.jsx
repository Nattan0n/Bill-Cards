import React from "react";

const Pagination = ({
  totalPages = 0,
  currentPage = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 6,
}) => {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const startIndex =
    totalItems > 0 && currentPage > 0
      ? (currentPage - 1) * itemsPerPage + 1
      : 0;

  const endIndex =
    totalItems > 0 && currentPage > 0
      ? Math.min(currentPage * itemsPerPage, totalItems)
      : 0;

  const getDisplayedPages = () => {
    const displayedPages = [];

    if (totalPages <= 5) {
      return pages;
    }

    displayedPages.push(1);

    if (currentPage > 3) {
      displayedPages.push("...");
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      displayedPages.push(i);
    }

    if (currentPage < totalPages - 2) {
      displayedPages.push("...");
      displayedPages.push(totalPages);
    }

    return displayedPages;
  };

  const displayedPages = getDisplayedPages();

  const handlePageChange = (page) => {
    onPageChange(page);
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 100);
  };

  return (
    <div className="py-4 px-4">
      {/* Desktop Pagination */}
      <div className="hidden sm:flex sm:items-center sm:justify-between">
        {/* Results Info */}
        <div className="text-sm">
          {totalItems > 0 ? (
            <p className="text-gray-700 dark:text-gray-400">
              Showing
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {" "}
                {startIndex}{" "}
              </span>
              to
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {" "}
                {endIndex}{" "}
              </span>
              of
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {" "}
                {totalItems}{" "}
              </span>
              results
            </p>
          ) : (
            <p className="text-gray-700 dark:text-gray-400">
              No results available
            </p>
          )}
        </div>

        {/* Pagination Controls */}
        <nav className="inline-flex space-x-1 rounded-lg shadow-sm">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-l-lg
              ${
                currentPage === 1
                  ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600"
              } 
              transition-colors duration-200 border border-gray-200`}
          >
            <span className="material-symbols-outlined text-[20px] mr-1">
              chevron_left
            </span>
            Previous
          </button>

          {/* Page Numbers */}
          {displayedPages.map((page, index) => (
            <div key={index}>
              {page === "..." ? (
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200">
                  ...
                </span>
              ) : (
                <button
                  onClick={() => handlePageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-200
                    ${
                      currentPage === page
                        ? "z-10 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 text-white hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 border-blue-600"
                        : "text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600"
                    } 
                    transition-colors duration-200`}
                >
                  {page}
                </button>
              )}
            </div>
          ))}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-r-lg
              ${
                currentPage === totalPages
                  ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600"
              } 
              transition-colors duration-200 border border-gray-200`}
          >
            Next
            <span className="material-symbols-outlined text-[20px] ml-1">
              chevron_right
            </span>
          </button>
        </nav>
      </div>

      {/* Mobile Pagination */}
      <div className="md:hidden flex flex-col items-center space-y-3 mb-20">
        {" "}
        {/* เพิ่ม margin-bottom */}
        {/* Results Info */}
        <div className="text-sm text-gray-700 dark:text-gray-400">
          {totalItems > 0 ? (
            <span className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
              {startIndex} - {endIndex} of {totalItems}
            </span>
          ) : (
            <span>No results</span>
          )}
        </div>
        {/* Compact Pagination Controls */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center bg-white/80 backdrop-blur-sm py-2">
          {" "}
          {/* เพิ่ม fixed position */}
          <nav className="inline-flex rounded-lg shadow-sm">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-l-lg
          ${
            currentPage === 1
              ? "text-gray-400 bg-gray-50 cursor-not-allowed"
              : "text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600"
          } 
          transition-colors duration-200 border border-gray-200`}
            >
              <span className="material-symbols-outlined text-[20px]">
                chevron_left
              </span>
            </button>

            {/* Page Numbers */}
            {displayedPages.map((page, index) => (
              <button
                key={index}
                onClick={() => page !== "..." && handlePageChange(page)}
                disabled={page === "..."}
                className={`relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium border border-gray-200
            ${
              page === "..."
                ? "text-gray-500 bg-white cursor-default"
                : currentPage === page
                ? "z-10 bg-blue-600 text-white border-blue-600"
                : "text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600"
            } 
            transition-colors duration-200`}
              >
                {page}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-r-lg
          ${
            currentPage === totalPages
              ? "text-gray-400 bg-gray-50 cursor-not-allowed"
              : "text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600"
          } 
          transition-colors duration-200 border border-gray-200`}
            >
              <span className="material-symbols-outlined text-[20px]">
                chevron_right
              </span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
