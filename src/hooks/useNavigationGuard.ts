import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useConfirmDialog } from "@/context/ConfirmDialogContext";

type NavigateTo = { to: string; replace?: boolean };

type GuardEntry = {
  id: string;
  registeredAt: number;
  getIsActive: () => boolean;
  getTitle: () => string;
  getMessage: () => string;
  isDangerous: boolean;
  onConfirm?: () => void | Promise<void>;
  navigateTo?: NavigateTo;
};

const guards = new Map<string, GuardEntry>();
let registerCounter = 0;

let listenerAttached = false;
let dialogOpen = false;
let ignoreNextPop = false;

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `guard_${Math.random().toString(36).slice(2)}_${Date.now()}`;

const ensureBufferState = () => {
  try {
    const st: any = window.history.state;
    if (!st || !st.__nav_guard__) {
      window.history.pushState({ __nav_guard__: true }, "", window.location.href);
    }
  } catch {}
};

const attachOnce = (
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    isDangerous?: boolean,
    onCancel?: () => void
  ) => void,
  closeConfirm: () => void,
  navigate: ReturnType<typeof useNavigate>
) => {
  if (listenerAttached) return;
  listenerAttached = true;

  window.addEventListener("popstate", () => {
    if (ignoreNextPop) {
      ignoreNextPop = false;
      return;
    }

    const active = Array.from(guards.values()).filter((g) => g.getIsActive());
    if (active.length === 0) return;

    // Back pressed => buffer popped. Re-arm buffer immediately so URL stays stable.
    ensureBufferState();

    if (dialogOpen) return;
    dialogOpen = true;

    const newest = active.reduce((best, g) =>
      g.registeredAt > best.registeredAt ? g : best
    , active[0]);

    showConfirm(
      newest.getTitle(),
      newest.getMessage(),
      async () => {
        try {
          for (const g of active) {
            if (g.onConfirm) await g.onConfirm();
          }
        } finally {
          closeConfirm();
          dialogOpen = false;

          // Now we intentionally navigate (don’t let popstate re-trigger guard)
          ignoreNextPop = true;

          if (newest.navigateTo) {
            navigate(newest.navigateTo.to, {
              replace: newest.navigateTo.replace ?? false,
            });
          } else {
            navigate(-1);
          }
        }
      },
      newest.isDangerous,
      () => {
        closeConfirm();
        dialogOpen = false;
        ensureBufferState();
      }
    );
  });
};

interface UseNavigationGuardOptions {
  isActive: boolean;
  title?: string;
  message?: string;
  isDangerous?: boolean;
  onConfirm?: () => void | Promise<void>;
  navigateTo?: NavigateTo;
}

export const useNavigationGuard = ({
  isActive,
  title,
  message,
  isDangerous = false,
  onConfirm,
  navigateTo,
}: UseNavigationGuardOptions) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showConfirm, closeConfirm } = useConfirmDialog();

  const idRef = useRef<string>(makeId());

  // refresh/close tab
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isActive) return;
      e.preventDefault();
      e.returnValue =
        message ||
        t("unsaved_changes_warning") ||
        "You have unsaved changes. Are you sure you want to leave?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isActive, message, t]);

  // Ensure buffer when guard becomes active
  useEffect(() => {
    if (isActive) ensureBufferState();
  }, [isActive]);

  useEffect(() => {
    const id = idRef.current;

    const entry: GuardEntry = {
      id,
      registeredAt: ++registerCounter,
      getIsActive: () => isActive,
      getTitle: () => title || t("confirm_navigation") || "Confirm Navigation",
      getMessage: () =>
        message ||
        t("unsaved_changes_warning") ||
        "You have unsaved changes. Are you sure you want to leave?",
      isDangerous,
      onConfirm,
      navigateTo,
    };

    guards.set(id, entry);
    attachOnce(showConfirm as any, closeConfirm, navigate);

    return () => {
      guards.delete(id);
    };
  }, [
    isActive,
    title,
    message,
    isDangerous,
    onConfirm,
    navigateTo,
    t,
    showConfirm,
    closeConfirm,
    navigate,
  ]);
};
