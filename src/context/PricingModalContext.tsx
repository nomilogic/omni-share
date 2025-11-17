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

  // Addon Confirm Modal
  addonConfirmOpen: boolean;
  selectedAddon: any;
  loadingAddon: boolean;
  openAddonConfirm: (addon: any) => void;
  closeAddonConfirm: () => void;
  setLoadingAddon: (loading: boolean) => void;
  setAddonHandler: (handler: () => Promise<void>) => void;

  // Downgrade Request Modal
  downgradeRequestOpen: boolean;
  downgradeLoading: boolean;
  downgradeReason: string;
  openDowngradeRequest: (plan: any) => void;
  closeDowngradeRequest: () => void;
  setDowngradeReason: (reason: string) => void;
  setDowngradeLoading: (loading: boolean) => void;
  setDowngradeHandler: (handler: () => Promise<void>) => void;
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

        addonConfirmOpen,
        selectedAddon,
        loadingAddon,
        openAddonConfirm,
        closeAddonConfirm,
        setLoadingAddon,
        setAddonHandler,

        downgradeRequestOpen,
        downgradeLoading,
        downgradeReason,
        openDowngradeRequest,
        closeDowngradeRequest,
        setDowngradeReason,
        setDowngradeLoading,
        setDowngradeHandler,
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
