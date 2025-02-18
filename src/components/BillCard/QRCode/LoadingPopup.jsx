// LoadingPopup.jsx
import React from "react";

const LoadingPopup = ({ progress }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900/45 backdrop-blur-sm"></div>
      <div className="bg-white rounded-2xl p-6 shadow-xl z-10 w-80 flex flex-col items-center animate__animated animate__zoomIn animate__faster">
        <div className="flex flex-col items-center space-y-4 w-full">
          {/* Loading Spinner and Progress Circle */}
          <div className="relative">
            <div className="w-20 h-20">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                />
                {/* Progress circle */}
                <circle
                  className="text-blue-600 transition-all duration-300"
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * progress) / 100}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              {/* Percentage text in middle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-700">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Generating QR Codes
            </h3>
            <p className="text-sm text-gray-500">
              Processing {Math.round(progress)}% complete...
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPopup;
