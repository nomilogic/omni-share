import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  FC,
} from "react";
import ReactDOM from "react-dom";

// 1. Types Define Karna
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

// 2. useModal Hook
export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
       
// 3. Modal Provider Component
export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<ModalItem<any>[]>([]);

  const openModal = useCallback(
    <P extends {}>(
      ModalComponent: FC<P & BaseModalProps>,
      props: P = {} as P
    ) => {
      const modalKey = Date.now();
      setModals((prevModals) => [
        ...prevModals,
        {
          key: modalKey,
          Component: ModalComponent as FC<any>,
          props,
        } as ModalItem<any>,
      ]);
    },
    []
  );

  const closeModal = useCallback((modalKey: number) => {
    setModals((prevModals) =>
      prevModals.filter((modal) => modal.key !== modalKey)
    );
  }, []);

  // ✅ SCROLL LOCK LOGIC: Agar koi bhi modal open hai, toh scroll lock kar do.
  React.useEffect(() => {
    if (modals.length > 0) {
      document.body.style.overflow = "hidden"; // Scroll lock
    } else {
      document.body.style.overflow = "unset"; // Scroll release
    }

    // Cleanup function: Zaroori hai agar component unmount ho jaaye.
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modals.length]);
  // -----------------------------------------------------------------------

  const contextValue: ModalContextType = {
    openModal: openModal as any,
    closeModal,
    modals,
  };

  return (
    <ModalContext.Provider value={contextValue}>
            {children}
            <ModalHost />   
    </ModalContext.Provider>
  );
};

// 4. ModalHost Component
const ModalHost: FC = () => {
  const { modals, closeModal } = useModal();

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot || modals.length === 0) return null;

  // Sahi zIndex se modals ke beech mein layers ban jayengi.
  const baseZIndex = 1000;

  // ✅ Backdrop Click Logic: Top-most modal ko close karna
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Sirf outer backdrop div par click hone par hi chalega
    if (e.target === e.currentTarget && modals.length > 0) {
      const latestModalKey = modals[modals.length - 1].key;
      closeModal(latestModalKey);
    }
  };

  return ReactDOM.createPortal(
    <>
            {/* 1. ✅ BACKDROP WITH BLUR & CORRECT STYLES */}     
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0, // Backdrop Blur aur Shadow styles
          backgroundColor: "rgba(0, 0, 0, 0.3)", // Thoda halka dark
          backdropFilter: "blur(2px)", // Background blur add kiya
          zIndex: baseZIndex, // Base Z-Index for backdrop // Centering aur items ko align karne ke liye:
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          pointerEvents: "auto", // Zaroori hai taake click events kaam karein
        }} // ✅ 2. BACKDROP CLICK TO CLOSE TOP-MOST MODAL
        onClick={handleBackdropClick}
      >
        {/* Is div ko khali rakha gaya hai taake sirf backdrop ka role play kare */}
      </div>
            {/* 3. ✅ SAARE MODALS RENDER KAR RAHE HAIN */}     
      {modals.map((modal, index) => {
        // Har modal ko incremental zIndex diya gaya hai (1001, 1002, ...)
        const modalZIndex = baseZIndex + 1 + index;

        // Zaroori hai ke Modal Component (jaise ReferralSection)
        // khud ko fixed position aur sahi zIndex par rakhe.
        return (
          // Inner Wrapper (Optional, agar aapke modal components khud fixed position nahi use kar rahe)
          // Agar aapke modal components (jaise ReferralSection) khud ko fixed position dete hain,
          // toh yeh wrapper zaroori nahi. Lekin agar nahi, toh lagana padega:
          <div
            key={modal.key}
            // Z-Index ko har modal ke liye update karo
            style={{ zIndex: modalZIndex }}
            onClick={(e) => e.stopPropagation()} // Har modal ko click se bachaao
          >
            <modal.Component
              close={() => closeModal(modal.key)}
              {...modal.props}
            />
          </div>
        );
      })}
         
    </>,
    modalRoot
  );
};

// Final: Agar aapke Modal Components (jaise ReferralSection) mein pehle se fixed positioning nahi hai,
// toh aapko ModalHost ke andar har modal ko wrap karna hoga.
