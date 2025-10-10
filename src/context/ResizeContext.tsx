import React, { createContext, useContext } from "react";

export type ResizeContextType = {
  handleResizeMainToFullScreen: (isFullScreen: boolean) => void;
};

export const ResizeContext = createContext<ResizeContextType | undefined>(undefined);

export function useResize() {
  const ctx = useContext(ResizeContext);
  if (!ctx) throw new Error("useResize must be used within ResizeContext.Provider");
  return ctx;
}
