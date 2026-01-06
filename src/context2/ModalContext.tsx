import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  FC,
  useEffect,
} from "react";
import ReactDOM from "react-dom";

interface BaseModalProps {
  close: () => void;
}

interface ModalItem<P = {}> {
  key: number;
  Component: FC<P & BaseModalProps>;
  props: P;
}

interface ModalContextType {
  openModal: <P>(ModalComponent: FC<P & BaseModalProps>, props?: P) => void;
  closeModal: (modalKey: number) => void;
  modals: ModalItem<any>[];
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within a ModalProvider");
  return ctx;
};

export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<ModalItem<any>[]>([]);

  const openModal = useCallback(
    <P extends {}>(
      ModalComponent: FC<P & BaseModalProps>,
      props: P = {} as P
    ) => {
      const modalKey = Date.now() + Math.floor(Math.random() * 1000);
      setModals((prev) => [
        ...prev,
        { key: modalKey, Component: ModalComponent as FC<any>, props },
      ]);
    },
    []
  );

  const closeModal = useCallback((modalKey: number) => {
    setModals((prev) => prev.filter((m) => m.key !== modalKey));
  }, []);

  // ✅ scroll lock
  useEffect(() => {
    document.body.style.overflow = modals.length > 0 ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modals.length]);

  return (
    <ModalContext.Provider value={{ openModal: openModal as any, closeModal, modals }}>
      {children}
      <ModalHost />
    </ModalContext.Provider>
  );
};

const ModalHost: FC = () => {
  const { modals, closeModal } = useModal();

  // ✅ SSR-safe / safety guard
  if (typeof window === "undefined") return null;

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot || modals.length === 0) return null;

  const baseZIndex = 1000;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && modals.length > 0) {
      const latestKey = modals[modals.length - 1].key;
      closeModal(latestKey);
    }
  };

  return ReactDOM.createPortal(
    <>
      {/* ✅ Backdrop */}
      <div
        onClick={handleBackdropClick}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(2px)",
          zIndex: baseZIndex,
          pointerEvents: "auto",
        }}
      />

      {/* ✅ Modals (each one is its own full-screen layer, but clicks pass-through unless inside modal content) */}
      {modals.map((modal, index) => {
        const modalZIndex = baseZIndex + 1 + index;

        return (
    <div
      key={modal.key}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: modalZIndex,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",        // ✅ center vertically
        padding: "16px",             // ✅ equal padding all sides
        pointerEvents: "none",
      }}
    >
      {/* ✅ scroll-safe wrapper (if modal gets tall on small screens) */}
      <div style={{ pointerEvents: "auto", maxHeight: "calc(100vh - 32px)", overflowY: "auto" }}>
        <modal.Component close={() => closeModal(modal.key)} {...modal.props} />
      </div>
    </div>
  );
      })}
    </>,
    modalRoot
  );
};
