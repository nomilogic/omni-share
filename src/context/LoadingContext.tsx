import React, { createContext, useContext, useState, useCallback } from "react";

// Loading state interface
export interface LoadingState {
  isLoading: boolean;
  message: string;
  progress?: number;
  canCancel?: boolean;
  onCancel?: () => void;
}

// Context interface
interface LoadingContextType {
  loadingState: LoadingState;
  showLoading: (message: string, options?: Partial<LoadingState>) => void;
  hideLoading: () => void;
  updateLoadingMessage: (message: string) => void;
  updateLoadingProgress: (progress: number) => void;
  setLoadingCancellable: (canCancel: boolean, onCancel?: () => void) => void;
}

// Default loading state
const defaultLoadingState: LoadingState = {
  isLoading: false,
  message: "",
  progress: undefined,
  canCancel: false,
  onCancel: undefined,
};

// Create context
const LoadingContext = createContext<LoadingContextType | null>(null);

// Loading provider component
export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loadingState, setLoadingState] =
    useState<LoadingState>(defaultLoadingState);

  // Show loading with optional configuration
  const showLoading = useCallback(
    (message: string, options?: Partial<LoadingState>) => {
      setLoadingState({
        isLoading: true,
        message,
        progress: options?.progress,
        canCancel: options?.canCancel || false,
        onCancel: options?.onCancel,
      });
    },
    []
  );

  // Hide loading
  const hideLoading = useCallback(() => {
    setLoadingState(defaultLoadingState);
  }, []);

  // Update loading message
  const updateLoadingMessage = useCallback((message: string) => {
    setLoadingState((prev) => ({
      ...prev,
      message,
    }));
  }, []);

  // Update loading progress
  const updateLoadingProgress = useCallback((progress: number) => {
    setLoadingState((prev) => ({
      ...prev,
      progress,
    }));
  }, []);

  // Set loading cancellable
  const setLoadingCancellable = useCallback(
    (canCancel: boolean, onCancel?: () => void) => {
      setLoadingState((prev) => ({
        ...prev,
        canCancel,
        onCancel,
      }));
    },
    []
  );

  const value: LoadingContextType = {
    loadingState,
    showLoading,
    hideLoading,
    updateLoadingMessage,
    updateLoadingProgress,
    setLoadingCancellable,
  };

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};

// Hook to use loading context
export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

// Higher-order component for automatic loading management
export const withLoading = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    return (
      <LoadingProvider>
        <WrappedComponent {...props} />
      </LoadingProvider>
    );
  };
};
