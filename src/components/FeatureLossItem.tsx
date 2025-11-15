import { X } from "lucide-react";
import React from "react";

const FeatureLossItem = ({ label, icon }: any) => (
  <div className="flex items-center">
    <X className="md:w-6 md:h-6 w-5 h-5 mr-3  text-red-600" />
    <div className="flex items-center gap-x-2 text-slate-700">
      <img
        src={icon}
        alt={label}
        className="md:w-[24pt] md:h-[23pt] w-[21pt] h-[21pt]  "
      />
      <span className="font-semibold text-[#000000] text-sm">{label}</span>
    </div>
  </div>
);

export default FeatureLossItem;
