import { createContext, useContext, useState } from "react";

type ActionFn = (() => void) | null;

interface DiscardModalContextType {
  // Modal 1
  discardImageOpen: boolean;
  openDiscardImage: (action: ActionFn) => void;
  closeDiscardImage: () => void;
  discardImageAction: ActionFn;

  // Modal 2
  discardPostOpen: boolean;
  openDiscardPost: (action: ActionFn) => void;
  closeDiscardPost: () => void;
  discardPostAction: ActionFn;

  // Modal 3
  discardPostWarningOpen: boolean;
  openDiscardPostWarning: (action: ActionFn) => void;
  closeDiscardPostWarning: () => void;
  discardPostWarningAction: ActionFn;
}

const DiscardModalContext = createContext<DiscardModalContextType | null>(null);

export const DiscardModalProvider = ({ children }: { children: React.ReactNode }) => {
  // ---------------- Modal 1 ----------------
  const [discardImageOpen, setDiscardImageOpen] = useState(false);
  const [discardImageAction, setDiscardImageAction] = useState<ActionFn>(null);

  // ---------------- Modal 2 ----------------
  const [discardPostOpen, setDiscardPostOpen] = useState(false);
  const [discardPostAction, setDiscardPostAction] = useState<ActionFn>(null);

  // ---------------- Modal 3 ----------------
  const [discardPostWarningOpen, setDiscardPostWarningOpen] = useState(false);
  const [discardPostWarningAction, setDiscardPostWarningAction] = useState<ActionFn>(null);

  return (
    <DiscardModalContext.Provider
      value={{
        // --- Modal 1 ---
        discardImageOpen,
        discardImageAction,
        openDiscardImage: (action) => {
          setDiscardImageAction(action);
          setDiscardImageOpen(true);
        },
        closeDiscardImage: () => {
          setDiscardImageOpen(false);
          setDiscardImageAction(null);
        },

        // --- Modal 2 ---
        discardPostOpen,
        discardPostAction,
        openDiscardPost: (action) => {
          setDiscardPostAction(action);
          setDiscardPostOpen(true);
        },
        closeDiscardPost: () => {
          setDiscardPostOpen(false);
          setDiscardPostAction(null);
        },

        // --- Modal 3 ---
        discardPostWarningOpen,
        discardPostWarningAction,
        openDiscardPostWarning: (action) => {
          setDiscardPostWarningAction(action);
          setDiscardPostWarningOpen(true);
        },
        closeDiscardPostWarning: () => {
          setDiscardPostWarningOpen(false);
          setDiscardPostWarningAction(null);
        },
      }}
    >
      {children}
    </DiscardModalContext.Provider>
  );
};

export const useDiscardModals = () => {
  const ctx = useContext(DiscardModalContext);
  if (!ctx) throw new Error("useDiscardModals must be used inside provider");
  return ctx;
};
