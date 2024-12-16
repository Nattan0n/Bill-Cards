import React from "react";
import { generateQRCodeElement } from "../QrCodeGenerator";

const QrCodePopup = ({ bills, onClose }) => {
  return (
    <div>
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="fixed inset-0 flex items-center justify-center z-40">
          <div
            className="absolute inset-0 dark:bg-gray-900 opacity-75"
            onClick={onClose}
            aria-hidden="true"
          ></div>
          <div
            className="rounded-lg overflow-hidden dark:bg-gray-800 dark:divide-gray-600 z-10 w-11/12 max-w-4xl max-h-screen"
            role="dialog"
          >
            <div className="h-full text-gray-500">
              {/* Header */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-t-lg">
                <div className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 flex justify-between">
                  <h2 className="flex items-center justify-center">
                    QR Code Generator
                  </h2>
                  <button
                    onClick={onClose}
                    className="flex p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
                    aria-label="Close"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="dark:bg-gray-800 dark:divide-gray-600 p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {bills.map((bill, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 shadow-sm"
                    >
                      <div className="mb-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-500 uppercase dark:text-gray-400">
                            Part Number:
                          </span>
                          <span className="text-white">
                            {bill.M_PART_NUMBER}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-500 uppercase dark:text-gray-400">
                            Customer:
                          </span>
                          <span className="text-white">{bill.M_SUBINV}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-500 uppercase dark:text-gray-400">
                            Date:
                          </span>
                          <span className="text-white">{bill.M_DATE}</span>
                        </div>
                      </div>
                      <div className="flex justify-center bg-white p-4 rounded-lg shadow-inner">
                        {generateQRCodeElement(bill)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <div className="fixed inset-0 flex z-50">
          <div
            className="absolute inset-0 dark:bg-gray-900 opacity-75"
            onClick={onClose}
            aria-hidden="true"
          ></div>
          <div
            className="relative w-full m-4 rounded-lg overflow-hidden dark:bg-gray-800 dark:divide-gray-600 z-10"
            role="dialog"
          >
            <div className="h-full dark:bg-gray-800 dark:divide-gray-600 text-gray-500 rounded-lg">
              {/* Header */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-t-lg">
                <div className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 flex justify-between">
                  <h2 className="flex items-center justify-center">
                    QR Code Generator
                  </h2>
                  <button
                    onClick={onClose}
                    className="flex p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
                    aria-label="Close"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="dark:bg-gray-800 dark:divide-gray-600 overflow-y-auto max-h-[calc(100vh-120px)]">
                <div className="p-4 space-y-4">
                  {bills.map((bill, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 shadow-sm"
                    >
                      <div className="mb-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-500 uppercase dark:text-gray-400">
                            Part Number:
                          </span>
                          <span className="text-white">
                            {bill.M_PART_NUMBER}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-500 uppercase dark:text-gray-400">
                            Customer:
                          </span>
                          <span className="text-white">{bill.M_SUBINV}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-500 uppercase dark:text-gray-400">
                            Date:
                          </span>
                          <span className="text-white">{bill.M_DATE}</span>
                        </div>
                      </div>
                      <div className="flex justify-center bg-white p-4 rounded-lg shadow-inner">
                        {generateQRCodeElement(bill)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCodePopup;