import { X } from "lucide-react";
import React from "react";

const FeatureLossItem = ({ label, icon }: any) => (
  <div className="flex items-center">
    <X className="w-6 h-6 mr-3  text-red-600" />
    <div className="flex items-center gap-x-2 text-slate-700">
      <img src={icon} alt={label} className="w-[24pt] h-[23pt]  " />
      <span className="font-semibold text-[#000000] text-sm">{label}</span>
    </div>
  </div>
);

export default FeatureLossItem;
