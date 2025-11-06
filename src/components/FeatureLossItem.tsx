import React from "react";

const FeatureLossItem = ({ label, icon }) => (
  <div className="flex items-start mb-3">
    <svg
      className="w-5 h-5 mr-3 mt-1 text-pink-600 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
    <div className="flex items-center text-gray-700">
      <img src={icon} alt={label} className="w-5 h-5 mr-3 flex-shrink-0" />
      <span className="font-bold text-[#000000]">{label}</span>
    </div>
  </div>
);

export default FeatureLossItem;
