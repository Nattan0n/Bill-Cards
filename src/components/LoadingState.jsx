import React from 'react';

const LoadingState = ({ message }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 animate-spin"></div>
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-t-4 border-blue-600 animate-spin"></div>
      </div>
      <div className="text-center">
        <p className="text-gray-600 font-medium">{message || 'กำลังโหลดข้อมูล...'}</p>
        <p className="text-sm text-gray-500 mt-1">กรุณารอสักครู่</p>
      </div>
    </div>
  </div>
);

export default LoadingState;