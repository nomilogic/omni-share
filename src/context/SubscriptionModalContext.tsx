import React, { createContext, useContext, useState } from 'react';

interface SubscriptionModalContextType {
  showManageSubscription: boolean;
  openManageSubscription: () => void;
  closeManageSubscription: () => void;
}

const SubscriptionModalContext = createContext<SubscriptionModalContextType | undefined>(undefined);

export const SubscriptionModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showManageSubscription, setShowManageSubscription] = useState(false);

  const openManageSubscription = () => {
    setShowManageSubscription(true);
  };

  const closeManageSubscription = () => {
    setShowManageSubscription(false);
  };

  return (
    <SubscriptionModalContext.Provider
      value={{
        showManageSubscription,
        openManageSubscription,
        closeManageSubscription,
      }}
    >
      {children}
    </SubscriptionModalContext.Provider>
  );
};

export const useSubscriptionModal = () => {
  const context = useContext(SubscriptionModalContext);
  if (context === undefined) {
    throw new Error('useSubscriptionModal must be used within a SubscriptionModalProvider');
  }
  return context;
};