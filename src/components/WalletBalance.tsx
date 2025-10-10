import React from "react";

import Icon from "./Icon";

export const WalletBalance = ({ balance }: any) => {
  return (
    <div className="flex items-center gap-0 theme-text-secondary text-xs font-semibold">
      <div className="rounded p-0">
        <Icon
          name="wallet"
          size={25}
          className="inline m-1 theme-text-secondary shadow-sm"
        />
      </div>
      <div>
        <div className="text-[1rem] font-bold theme-text-primary">
          {balance}
        </div>
        {/* <div className="sentence-case theme-text-primary opacity-30 text-[0.7rem]">{'Left Today'}</div> */}
      </div>
    </div>
  );
};
