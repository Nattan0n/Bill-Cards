// BillCard/QrCodePopup.jsx
import React from "react";
import { generateQRCodeElement } from "../QrCodeGenerator";

const QrCodePopup = ({ bill, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        <h2 className="text-lg font-bold mb-4">QR Code</h2>
        {bill && (
          <div className="flex justify-center">
            {generateQRCodeElement(bill)}
          </div>
        )}
        <button
          className="mt-6 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QrCodePopup;
