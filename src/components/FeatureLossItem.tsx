import { X } from "lucide-react";
import React from "react";

const FeatureLossItem = ({ label, icon }: any) => (
  <div className="flex ">
    <X className="w-5 h-5 mr-2 flex-shrink-0 text-red-500" />
    <div className="flex items-center gap-2 text-slate-700">
      <img src={icon} alt={label} className="w-4 h-4  flex-shrink-0" />
      <span className="font-semibold text-[#000000] text-sm">{label}</span>
    </div>
  </div>
);

export default FeatureLossItem;
