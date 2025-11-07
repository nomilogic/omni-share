import { X } from "lucide-react";
import React from "react";

const FeatureLossItem = ({ label, icon }) => (
  <div className="flex ">
    <X className="w-5 h-5 mr-2 flex-shrink-0 text-red-500" />
    <div className="flex items-center text-gray-700">
      <img src={icon} alt={label} className="w-5 h-5 mr-3 flex-shrink-0" />
      <span className="font-bold text-[#000000]">{label}</span>
    </div>
  </div>
);

export default FeatureLossItem;
