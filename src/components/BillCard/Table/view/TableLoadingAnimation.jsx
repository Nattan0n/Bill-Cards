import React from 'react';

const TableLoadingAnimation = () => {
  return (
    <div className="animate__animated animate__fadeIn animate__faster">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 sm:rounded-t-2xl px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
              <div className="h-2 w-32 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-6 w-32 bg-white/20 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-b-2xl shadow-lg overflow-hidden border border-gray-200">
        {/* Table Header Skeleton */}
        <div className="p-4 border-b border-gray-100">
          <div className="grid grid-cols-6 gap-4">
            <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="divide-y divide-gray-100">
          {[...Array(5)].map((_, index) => (
            <div 
              key={index} 
              className="p-4 transition-all duration-200"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            >
              <div className="grid grid-cols-6 gap-4 items-center">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-16 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Loading Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4 bg-white p-6 rounded-2xl shadow-xl">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-blue-200 animate-spin" />
              <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-t-4 border-blue-600 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">Loading Data</p>
              <p className="text-sm text-gray-500 mt-1">Please wait while we fetch the inventory items...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Loading Bar */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 to-blue-600 animate-progress-indeterminate fixed bottom-0 left-0 right-0" />

      {/* CSS for Progress Bar Animation */}
      <style jsx>{`
        @keyframes progress-indeterminate {
          0% {
            transform: translateX(-100%) scaleX(0.5);
          }
          50% {
            transform: translateX(0%) scaleX(0.5);
          }
          100% {
            transform: translateX(100%) scaleX(0.5);
          }
        }
        .animate-progress-indeterminate {
          animation: progress-indeterminate 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default TableLoadingAnimation;