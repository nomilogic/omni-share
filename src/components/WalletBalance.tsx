import React from "react";

import Icon from "./Icon";

export const WalletBalance = ({ balance, setShowPackage }: any) => {
  return (
    <div className="flex items-center gap-1.5 theme-text-secondary text-xs font-semibold">
      <button onClick={setShowPackage} className="rounded p-0">
        <Icon
          name="spiral-logo"
          size={26}
          className="inline  theme-text-secondary"
        />
      </button>
      <div>
        <div className="text-[1.05rem] font-bold theme-text-primary">
          {balance}
        </div>
        {/* <div className="sentence-case theme-text-primary opacity-30 text-[0.7rem]">{'Left Today'}</div> */}
      </div>
    </div>
  );
};
