import React from 'react';

// Desktop Header
export const TableHeader = ({ selectedCount, totalCount, onSelectAll }) => {
  return (
    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 rounded-t-2xl px-6 py-4 shadow-lg">
      <h2 className="text-xl font-semibold text-white flex items-center justify-between">
        <div className="flex items-center">
          <span className="material-symbols-outlined mr-3 text-2xl animate-bounce">
            inventory_2
          </span>
          <div>
            <p className="text-lg font-bold">Part List</p>
            <p className="text-xs text-blue-100 mt-0.5">
              Manage bill card inventory
            </p>
          </div>
        </div>
        <div className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
          {selectedCount}/{totalCount} selected
        </div>
      </h2>
    </div>
  );
};

// Mobile Header
export const MobileHeader = ({ selectedCount, totalCount, onSelectAll }) => {
  return (
    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 px-4 py-4 shadow-lg">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-2xl text-white mr-3 animate-bounce">
              inventory_2
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">Part List</h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Manage your inventory
              </p>
            </div>
          </div>
          <div className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white">
            {selectedCount}/{totalCount} selected
          </div>
        </div>
      </div>
    </div>
  );
};