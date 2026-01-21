import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useConfirmDialog } from "@/context/ConfirmDialogContext";

interface UseNavigationGuardOptions {
  isActive: boolean;
  title?: string;
  message?: string;
  isDangerous?: boolean;
  onConfirm?: () => void;
}

/**
 * Hook to guard navigation (back button, refresh, close) when there are unsaved changes
 * Automatically shows confirm dialog and prevents navigation until confirmed
 * 
 * @param options - Configuration for the guard
 * @param options.isActive - Whether the guard should be active (e.g., hasUnsavedChanges)
 * @param options.title - Dialog title (default: "Confirm Navigation")
 * @param options.message - Dialog message (default: "You have unsaved changes...")
 * @param options.isDangerous - Whether to show dangerous styling (default: false - uses purple button)
 * @param options.onConfirm - Optional callback when user confirms navigation
 */
export const useNavigationGuard = ({
  isActive,
  title,
  message,
  isDangerous = false,
  onConfirm,
}: UseNavigationGuardOptions) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showConfirm, closeConfirm } = useConfirmDialog();

  // Guard for page refresh and close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isActive) {
        e.preventDefault();
        // Modern browsers require a non-empty string to show the dialog
        e.returnValue =
          message ||
          (t("unsaved_changes_warning") ||
            "You have unsaved changes. Are you sure you want to leave?");
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isActive, message, t]);

  // Guard for back button
  useEffect(() => {
    let isConfirmDialogOpen = false;

    const handlePopState = (e: PopStateEvent) => {
      if (isActive && !isConfirmDialogOpen) {
        // Prevent the back navigation
        e.preventDefault();
        isConfirmDialogOpen = true;

        const dialogTitle =
          title || (t("confirm_navigation") || "Confirm Navigation");
        const dialogMessage =
          message ||
          (t("unsaved_changes_warning") ||
            "You have unsaved changes. Are you sure you want to leave?");

        showConfirm(
          dialogTitle,
          dialogMessage,
          () => {
            closeConfirm();
            isConfirmDialogOpen = false;
            // User confirmed - actually navigate back
            if (onConfirm) {
              onConfirm();
            }
            window.history.back();
          },
          isDangerous,
          () => {
            // Cancel callback - user clicked cancel, re-push state
            closeConfirm();
            isConfirmDialogOpen = false;
            window.history.pushState(null, "", window.location.href);
          }
        );
      }
    };

    // Push initial state to allow back button detection
    window.history.pushState(null, "", window.location.href);

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isActive, title, message, isDangerous, t, showConfirm, closeConfirm, onConfirm]);
};
