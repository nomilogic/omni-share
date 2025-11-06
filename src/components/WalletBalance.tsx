import React from "react";

import Icon from "./Icon";

export const WalletBalance = ({ balance, setShowPackage }: any) => {
  return (
    <div className="flex items-center gap-0 theme-text-secondary text-xs font-semibold">
      <button onClick={setShowPackage} className="rounded p-0">
        <Icon
          name="spiral-logo"
          size={25}
          className="inline m-1 theme-text-secondary shadow-sm"
        />
      </button>
      <div>
        <div className="text-[1rem] font-bold theme-text-primary">
          {balance}
        </div>
        {/* <div className="sentence-case theme-text-primary opacity-30 text-[0.7rem]">{'Left Today'}</div> */}
      </div>
    </div>
  );
};
