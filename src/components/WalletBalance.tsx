import React from "react";

import Icon from "./Icon";

export const WalletBalance = ({
  balance,
  setShowPackage,
  showPackage,
}: any) => {
  return (
    <button
      onClick={setShowPackage}
      className="flex items-center gap-1 theme-text-secondary text-xs font-semibold"
    >
      <div
        className={`rounded p-0 ${
          showPackage ? "bg-slate-100  rounded-full" : "bg-transparent"
        }`}
      >
        <Icon
          name="spiral-logo"
          size={26}
          className={`inline  theme-text-secondary transition-all duration-700  ${
            showPackage ? "rotate-180 p-1 " : ""
          }`}
        />
      </div>
      <div>
        <div className="text-[1.05rem] font-bold theme-text-primary">
          {balance}
        </div>
      </div>
    </button>
  );
};
