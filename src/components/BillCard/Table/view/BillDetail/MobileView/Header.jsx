// components/BillCard/view/BillDetail/MobileView/Header.jsx
export const MobileHeader = ({ recordCount, onClose }) => (
  <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 px-4 py-4 shadow-lg">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <span className="material-symbols-outlined text-2xl text-white mr-3 animate-bounce">
          description
        </span>
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-3">
            Part Details
            <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              {recordCount} Records
            </span>
          </h2>
          <p className="text-xs text-blue-100 mt-0.5">
            View complete part information and inventory history
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="flex items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-red-500 text-white transition-all duration-200 backdrop-blur-sm group"
      >
        <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-200">
          close
        </span>
      </button>
    </div>
  </div>
);
