import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useConfirmDialog } from "@/context/ConfirmDialogContext";

// Global flag to prevent dialogs during navigation
let isNavigatingAway = false;

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
  const guardSetupRef = useRef(false);
  const dialogOpenRef = useRef(false);
  const listenerRef = useRef<((e: PopStateEvent) => void) | null>(null);

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
    // Only set up guard if active
    if (!isActive) {
      guardSetupRef.current = false;
      // Remove listener when guard is deactivated
      if (listenerRef.current) {
        window.removeEventListener("popstate", listenerRef.current);
        listenerRef.current = null;
      }
      return;
    }

    // Only set up once per component mount
    if (guardSetupRef.current) {
      return;
    }

    guardSetupRef.current = true;

    const handlePopState = (e: PopStateEvent) => {
      // Skip dialog if already navigating away from another page
      if (isNavigatingAway) {
        return;
      }

      // Only show dialog once
      if (!dialogOpenRef.current) {
        dialogOpenRef.current = true;

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
            // Set flag to prevent dialogs on other pages
            isNavigatingAway = true;
            
            // Remove listener before navigating away
            if (listenerRef.current) {
              window.removeEventListener("popstate", listenerRef.current);
              listenerRef.current = null;
            }
            
            // User confirmed navigation
            closeConfirm();
            dialogOpenRef.current = false;
            guardSetupRef.current = false;
            if (onConfirm) {
              onConfirm();
            }
            
            // Navigate back using React Router
            navigate(-1);
            
            // Clear flag after navigation completes
            setTimeout(() => {
              isNavigatingAway = false;
            }, 100);
          },
          isDangerous,
          () => {
            // User cancelled - stay on page
            closeConfirm();
            dialogOpenRef.current = false;
            // Push state to restore page position
            window.history.pushState(null, "", window.location.href);
          }
        );
      }
    };

    // Push initial state to detect back button
    window.history.pushState(null, "", window.location.href);

    listenerRef.current = handlePopState;
    window.addEventListener("popstate", handlePopState);

    return () => {
      if (listenerRef.current) {
        window.removeEventListener("popstate", listenerRef.current);
        listenerRef.current = null;
      }
    };
  }, [isActive, title, message, isDangerous, t, showConfirm, closeConfirm, onConfirm, navigate]);
};
