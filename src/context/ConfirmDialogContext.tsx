import React, { createContext, useContext, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useTranslation } from "react-i18next";

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isDangerous?: boolean;
  onClose?: () => void;
}

interface ConfirmDialogContextType {
  confirmDialog: ConfirmDialogState;
  setConfirmDialog: (state: ConfirmDialogState) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    isDangerous?: boolean,
    onCancel?: () => void,
    onClose?: () => void
  ) => void;
  closeConfirm: () => void;
  setSidebarCloseFn: (fn: () => void) => void;
}

const ConfirmDialogContext = createContext<
  ConfirmDialogContextType | undefined
>(undefined);

export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDangerous: false,
  });
  const [sidebarCloseFn, setSidebarCloseFn] = useState<(() => void) | null>(
    null
  );
  const { t } = useTranslation();

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    isDangerous = false,
    onCancel?: () => void,
    onClose?: () => void
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
      onCancel,
      isDangerous,
      onClose,
    });
  };

  const closeConfirm = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = async () => {
  await Promise.resolve(confirmDialog.onConfirm());
  if (sidebarCloseFn) sidebarCloseFn();
  closeConfirm();
};

  const handleCancel = () => {
    confirmDialog.onCancel?.();  // ✅ call cancel callback
    sidebarCloseFn?.();
    closeConfirm();
  };

  return (
    <ConfirmDialogContext.Provider
      value={{
        confirmDialog,
        setConfirmDialog,
        showConfirm,
        closeConfirm,
        setSidebarCloseFn,
      }}
    >
      {children}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={t("discard_changes_question")}
        message={confirmDialog.message}
        confirmText={t("leave")}
        cancelText={t("stay")}
        isDangerous={confirmDialog.isDangerous}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmDialogContext.Provider>
  );
};

export const useConfirmDialog = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error(
      "useConfirmDialog must be used within ConfirmDialogProvider"
    );
  }
  return context;
};
