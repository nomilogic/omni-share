import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export interface PricingModalContextType {
  // Confirm Plan Modal
  confirmOpen: boolean;
  selectedPlan: any;
  loadingPackage: boolean;
  openConfirm: (plan: any) => void;
  closeConfirm: () => void;
  setLoadingPackage: (loading: boolean) => void;
  setConfirmHandler: (handler: () => Promise<void>) => void;
  runConfirmHandler: () => Promise<void>;

  // Addon Confirm Modal
  addonConfirmOpen: boolean;
  selectedAddon: any;
  loadingAddon: boolean;
  openAddonConfirm: (addon: any) => void;
  closeAddonConfirm: () => void;
  setLoadingAddon: (loading: boolean) => void;
  setAddonHandler: (handler: () => Promise<void>) => void;
  runAddonHandler: () => Promise<void>;

  // Downgrade Request Modal
  downgradeRequestOpen: boolean;
  downgradeLoading: boolean;
  downgradeReason: string;
  openDowngradeRequest: (plan: any) => void;
  closeDowngradeRequest: () => void;
  setDowngradeReason: (reason: string) => void;
  setDowngradeLoading: (loading: boolean) => void;
  setDowngradeHandler: (handler: () => Promise<void>) => void;
  runDowngradeHandler: () => Promise<void>;

  // Cancel Downgrade Modal
  cancelDowngradeOpen: boolean;
  cancelDowngradeData: {
    currentPlanName: string;
    currentPlanAmount: number;
    downgradePlanName: string;
  } | null;
  openCancelDowngrade: (data: {
    currentPlanName: string;
    currentPlanAmount: number;
    downgradePlanName: string;
  }) => void;
  closeCancelDowngrade: () => void;
  setCancelDowngradeHandler: (handler: () => Promise<void>) => void;
  runCancelDowngradeHandler: () => Promise<void>;
}

const PricingModalContext = createContext<PricingModalContextType | undefined>(undefined);

export const PricingModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loadingPackage, setLoadingPackage] = useState(false);
  const confirmHandlerRef = useRef<(() => Promise<void>) | null>(null);

  const [addonConfirmOpen, setAddonConfirmOpen] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<any>(null);
  const [loadingAddon, setLoadingAddon] = useState(false);
  const addonHandlerRef = useRef<(() => Promise<void>) | null>(null);

  const [downgradeRequestOpen, setDowngradeRequestOpen] = useState(false);
  const [downgradeLoading, setDowngradeLoading] = useState(false);
  const [downgradeReason, setDowngradeReason] = useState('');
  const downgradeHandlerRef = useRef<(() => Promise<void>) | null>(null);

  const [cancelDowngradeOpen, setCancelDowngradeOpen] = useState(false);
  const [cancelDowngradeData, setCancelDowngradeData] = useState<{
    currentPlanName: string;
    currentPlanAmount: number;
    downgradePlanName: string;
  } | null>(null);
  const cancelDowngradeHandlerRef = useRef<(() => Promise<void>) | null>(null);

  const openConfirm = useCallback((plan: any) => {
    setSelectedPlan(plan);
    setConfirmOpen(true);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmOpen(false);
    setSelectedPlan(null);
    setLoadingPackage(false);
  }, []);

  const setConfirmHandler = useCallback((handler: () => Promise<void>) => {
    confirmHandlerRef.current = handler;
  }, []);

  const runConfirmHandler = useCallback(async () => {
    if (!confirmHandlerRef.current) return;
    try {
      setLoadingPackage(true);
      await confirmHandlerRef.current();
    } finally {
      setLoadingPackage(false);
      setConfirmOpen(false);
      setSelectedPlan(null);
    }
  }, []);

  const openAddonConfirm = useCallback((addon: any) => {
    setSelectedAddon(addon);
    setAddonConfirmOpen(true);
  }, []);

  const closeAddonConfirm = useCallback(() => {
    setAddonConfirmOpen(false);
    setSelectedAddon(null);
    setLoadingAddon(false);
  }, []);

  const setAddonHandler = useCallback((handler: () => Promise<void>) => {
    addonHandlerRef.current = handler;
  }, []);

  const runAddonHandler = useCallback(async () => {
    if (!addonHandlerRef.current) return;
    try {
      setLoadingAddon(true);
      await addonHandlerRef.current();
    } finally {
      setLoadingAddon(false);
      setAddonConfirmOpen(false);
      setSelectedAddon(null);
    }
  }, []);

  const openDowngradeRequest = useCallback((plan: any) => {
    setSelectedPlan(plan);
    setDowngradeRequestOpen(true);
    setDowngradeReason('');
  }, []);

  const closeDowngradeRequest = useCallback(() => {
    setDowngradeRequestOpen(false);
    setSelectedPlan(null);
    setDowngradeReason('');
    setDowngradeLoading(false);
  }, []);

  const setDowngradeHandler = useCallback((handler: () => Promise<void>) => {
    downgradeHandlerRef.current = handler;
  }, []);

  const runDowngradeHandler = useCallback(async () => {
    if (!downgradeHandlerRef.current) return;
    try {
      setDowngradeLoading(true);
      await downgradeHandlerRef.current();
    } finally {
      setDowngradeLoading(false);
      setDowngradeRequestOpen(false);
      setSelectedPlan(null);
      setDowngradeReason('');
    }
  }, []);

  const openCancelDowngrade = useCallback((data: {
    currentPlanName: string;
    currentPlanAmount: number;
    downgradePlanName: string;
  }) => {
    setCancelDowngradeData(data);
    setCancelDowngradeOpen(true);
  }, []);

  const closeCancelDowngrade = useCallback(() => {
    setCancelDowngradeOpen(false);
    setCancelDowngradeData(null);
  }, []);

  const setCancelDowngradeHandler = useCallback((handler: () => Promise<void>) => {
    cancelDowngradeHandlerRef.current = handler;
  }, []);

  const runCancelDowngradeHandler = useCallback(async () => {
    if (!cancelDowngradeHandlerRef.current) return;
    try {
      setDowngradeLoading(true);
      await cancelDowngradeHandlerRef.current();
    } finally {
      setDowngradeLoading(false);
      setCancelDowngradeOpen(false);
      setCancelDowngradeData(null);
    }
  }, []);

  return (
    <PricingModalContext.Provider
      value={{
        confirmOpen,
        selectedPlan,
        loadingPackage,
        openConfirm,
        closeConfirm,
        setLoadingPackage,
        setConfirmHandler,
        runConfirmHandler,

        addonConfirmOpen,
        selectedAddon,
        loadingAddon,
        openAddonConfirm,
        closeAddonConfirm,
        setLoadingAddon,
        setAddonHandler,
        runAddonHandler,

        downgradeRequestOpen,
        downgradeLoading,
        downgradeReason,
        openDowngradeRequest,
        closeDowngradeRequest,
        setDowngradeReason,
        setDowngradeLoading,
        setDowngradeHandler,
        runDowngradeHandler,

        cancelDowngradeOpen,
        cancelDowngradeData,
        openCancelDowngrade,
        closeCancelDowngrade,
        setCancelDowngradeHandler,
        runCancelDowngradeHandler,
      }}
    >
      {children}
    </PricingModalContext.Provider>
  );
};

export const usePricingModal = () => {
  const context = useContext(PricingModalContext);
  if (context === undefined) {
    throw new Error('usePricingModal must be used within a PricingModalProvider');
  }
  return context;
};
