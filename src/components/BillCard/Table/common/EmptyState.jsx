// EmptyState.jsx
export const EmptyState = () => (
  <tr>
    <td colSpan="10" className="p-8">
      <div className="flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 animate-bounce">
          inventory_2
        </span>
        <p className="text-gray-500 font-medium mb-1">
          No inventory items found
        </p>
        <p className="text-gray-400 text-sm">
          Try adjusting your search criteria
        </p>
      </div>
    </td>
  </tr>
);
