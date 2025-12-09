// context/PricingContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import API from "../services/api";
import { useAppContext } from "./AppContext";
import { notify } from "@/utils/toast";
import { useTranslation } from "react-i18next";

interface PricingContextType {
  // Data
  packages: any[];
  addons: any[];
  currentTier: any | null;
  pendingDowngradePackage: any | null;
  activePackage: any;
  hasPendingDowngrade: boolean;
  hasCancelRequested: boolean;

  // States
  loadingPackage: boolean;
  loadingAddon: boolean;
  selectedPlan: any | null;
  selectedAddon: any | null;
  downgradeLoading: boolean;

  // Modal Controls
  openConfirm: (plan: any) => void;
  openDowngradeRequest: (plan: any) => void;
  openCancelDowngrade: () => void;
  openCancelPackage: () => void;
  openReactivate: () => void;
  closeAllModals: () => void;

  // Actions
  handleChoosePlan: (plan: any) => void;
  handleSubscribe: (plan: any) => Promise<void>;
  handleUpdatePackage: (plan: any) => Promise<void>;
  handleRequestDowngrade: () => Promise<void>;
  handleCancelDowngradeRequest: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  reactivateSubscription: () => Promise<void>;
  handleBuyAddon: (addon: any) => Promise<void>;
}

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export const PricingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { state, refreshUser, packages, addons } = useAppContext();
  const activePackage = state?.user?.wallet;
  const { t, i18n } = useTranslation();

  const [loadingPackage, setLoadingPackage] = useState(false);
  const [loadingAddon, setLoadingAddon] = useState(false);
  const [downgradeLoading, setDowngradeLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [selectedAddon, setSelectedAddon] = useState<any | null>(null);

  // Modal states (ab sirf context se control honge)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [downgradeRequestOpen, setDowngradeRequestOpen] = useState(false);
  const [cancelDowngradeOpen, setCancelDowngradeOpen] = useState(false);
  const [cancelPackageOpen, setCancelPackageOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);

  const getTierById = useCallback(
    (id: string) => packages.find((p) => p.id === id),
    [packages]
  );

  const currentTier = useMemo(
    () =>
      activePackage?.packageId ? getTierById(activePackage.packageId) : null,
    [activePackage?.packageId, getTierById]
  );
  const pendingDowngradePackage = useMemo(
    () =>
      activePackage?.downgradeRequested
        ? getTierById(activePackage.downgradeRequested)
        : null,
    [activePackage?.downgradeRequested, getTierById]
  );

  const hasPendingDowngrade = !!activePackage?.downgradeRequested;
  const hasCancelRequested = !!activePackage?.cancelRequested;

  // Modal Controls
  const openConfirm = (plan: any) => {
    setSelectedPlan(plan);
    setConfirmOpen(true);
  };
  const openDowngradeRequest = (plan: any) => {
    setSelectedPlan(plan);
    setDowngradeRequestOpen(true);
  };
  const openCancelDowngrade = () => setCancelDowngradeOpen(true);
  const openCancelPackage = () => setCancelPackageOpen(true);
  const openReactivate = () => setReactivateOpen(true);
  const closeAllModals = () => {
    setConfirmOpen(false);
    setDowngradeRequestOpen(false);
    setCancelDowngradeOpen(false);
    setCancelPackageOpen(false);
    setReactivateOpen(false);
    setSelectedPlan(null);
    setSelectedAddon(null);
  };

  const handleChoosePlan = (plan: any) => {
    if (loadingPackage || hasCancelRequested || hasPendingDowngrade) return;
    const isUpgrade = Number(plan.amount) > Number(currentTier?.amount ?? 0);
    const isExpired =
      activePackage?.expiredAt &&
      new Date(activePackage.expiredAt) < new Date();

    if (!currentTier || isUpgrade || isExpired) {
      openConfirm(plan);
    } else {
      openDowngradeRequest(plan);
    }
  };

  const handleSubscribe = async (plan: any) => {
    setLoadingPackage(true);
    try {
      const language = localStorage.getItem("siteLang") ?? "en";
      const res = await API.buyPackage(plan.id, language);
      if (res?.data?.data?.url) window.location.href = res.data.data.url;
    } catch (err) {
      notify("error", t("failed"));
    } finally {
      setLoadingPackage(false);
      closeAllModals();
    }
  };

  const handleUpdatePackage = async (plan: any) => {
    setLoadingPackage(true);
    try {
      const res = await API.requestUpgradePackage(plan.id);
      if (res?.data?.data?.url) window.location.href = res.data.data.url;
    } catch (err) {
    } finally {
      setLoadingPackage(false);
      closeAllModals();
    }
  };

  const handleRequestDowngrade = async () => {
    if (!selectedPlan) return;
    setDowngradeLoading(true);
    try {
      await API.requestDowngrade(selectedPlan.id);
      await refreshUser();
    } catch (err) {
      notify("error", t("failed"));
    } finally {
      setDowngradeLoading(false);
      closeAllModals();
    }
  };

  const handleCancelDowngradeRequest = async () => {
    setDowngradeLoading(true);
    try {
      await API.cancelDowngradeRequest();
      await refreshUser();
    } catch (err) {
      notify("error", t("failed"));
    } finally {
      setDowngradeLoading(false);
      closeAllModals();
    }
  };

  const cancelSubscription = async () => {
    try {
      await API.cancelPackage();
      await refreshUser();
    } catch (err) {
      notify("error", t("failed"));
    } finally {
      closeAllModals();
    }
  };

  const reactivateSubscription = async () => {
    try {
      await API.reactivatePackage();
      await refreshUser();
    } catch (err) {
      notify("error", t("failed"));
    } finally {
      closeAllModals();
    }
  };

  const handleBuyAddon = async (addon: any) => {
    setLoadingAddon(true);
    setSelectedAddon(addon);

    const language = localStorage.getItem("siteLang") ?? "en";
    try {
      const res = await API.buyAddons(addon.id, language);
      if (res?.data?.data?.checkoutUrl)
        window.location.href = res.data.data.checkoutUrl;
    } catch (err) {
      notify("error", t("failed"));
    } finally {
      setLoadingAddon(false);
      setSelectedAddon(null);
    }
  };

  return (
    <PricingContext.Provider
      value={{
        packages,
        addons,
        currentTier,
        pendingDowngradePackage,
        activePackage,
        hasPendingDowngrade,
        hasCancelRequested,
        loadingPackage,
        loadingAddon,
        selectedPlan,
        selectedAddon,
        downgradeLoading,

        openConfirm,
        openDowngradeRequest,
        openCancelDowngrade,
        openCancelPackage,
        openReactivate,
        closeAllModals,

        handleChoosePlan,
        handleSubscribe,
        handleUpdatePackage,
        handleRequestDowngrade,
        handleCancelDowngradeRequest,
        cancelSubscription,
        reactivateSubscription,
        handleBuyAddon,
      }}
    >
      {children}
    </PricingContext.Provider>
  );
};

export const usePricing = () => {
  const ctx = useContext(PricingContext);
  if (!ctx) throw new Error("usePricing must be used within PricingProvider");
  return ctx;
};
