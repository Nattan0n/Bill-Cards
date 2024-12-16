// TableContainer.jsx
import { TableColumns } from "./TableColumns";

export const TableContainer = ({ children }) => (
  <div className="bg-white rounded-b-2xl shadow-lg overflow-hidden border border-gray-200">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <TableColumns />
        </thead>
        <tbody className="divide-y divide-gray-200">{children}</tbody>
      </table>
    </div>
  </div>
);
