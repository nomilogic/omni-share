import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useAppContext } from "./context/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SubscriptionModalProvider } from "./context/SubscriptionModalContext";
import { AppLayout } from "./components/Layout/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthPage } from "./pages/AuthPage";
import { PricingPage } from "./pages/PricingPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ContentPage } from "./pages/ContentPage";
import { SchedulePage } from "./pages/SchedulePage";
import { SettingsPage } from "./pages/SettingsPage";
import { OAuthCallback } from "./components/OAuthCallback";
import { AuthOAuthCallback } from "./components/AuthOAuthCallback";
import { ProfilePage } from "./pages/ProfilePage"; // Import ProfilePage
import { CampaignsPage } from "./pages/CampaignsPage";
import { AccountsPage } from "./pages/AccountsPage";
import { HistoryPage } from "./pages/HistoryPage";
import PrivacyPolicy from "./components/PrivacyPolicy";
import AddonSuccessPage from "./pages/PackageAddonSuccess";
import PackageSuccessPage from "./pages/PackagePaymentSuccess";
import TransactionHistory from "./pages/TransectionHistory";
import GenerationAmountPage from "./pages/GenerationAmountPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import { Bounce, ToastContainer } from "react-toastify";
import { themeManager } from "./lib/theme";
import { PricingProvider } from "./context/PricingContext";

const OAuthCallbackWrapper = () => {
  const { dispatch } = useAppContext();

  const handleAuthSuccess = (user: any) => {
    dispatch({ type: "SET_USER", payload: user });
    dispatch({ type: "SET_LOADING", payload: false });
  };

  return <AuthOAuthCallback onAuthSuccess={handleAuthSuccess} />;
};

function App() {
  useEffect(() => {
    themeManager.initialize();
    localStorage.getItem("hasLanded");
  }, []);
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />

      <AppProvider>
        <AuthProvider>
          <SubscriptionModalProvider>
            <PricingProvider>
              <Routes>
                {/* <Route path="/" element={showlanded() ? <HomePage /> : <LandingPage />} />   */}
                <Route path="/" element={<HomePage />} />

                <Route path="/auth" element={<AuthPage />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/home" element={<HomePage />} />

                <Route
                  path="/oauth/:platform/callback"
                  element={<OAuthCallback />}
                />

                <Route
                  path="/auth/:provider/callback"
                  element={<OAuthCallbackWrapper />}
                />

                <Route
                  path="/pricing"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <PricingPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/payment/addon/success"
                  element={
                    <ProtectedRoute>
                      <AddonSuccessPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/payment/package/success"
                  element={
                    <ProtectedRoute>
                      <PackageSuccessPage />{" "}
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/onboarding/*"
                  element={
                    <ProtectedRoute>
                      <OnboardingPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <DashboardPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transaction-history"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <TransactionHistory />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/generate-amount"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <GenerationAmountPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route
                  path="/profile/*"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ProfilePage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                {/* New campaigns route */}
                <Route
                  path="/campaigns/*"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <CampaignsPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Companies route redirects to campaigns for backward compatibility */}
                {/* <Route path="/campaigns/*" element={<Navigate to="/campaigns" replace />} /> */}

                <Route
                  path="/content/*"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ContentPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Direct /generate route - redirects to /content (Generate now shows as modal overlay) */}
                <Route
                  path="/generate"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/content" replace />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/schedule"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <SchedulePage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/posts/schedule"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <SchedulePage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/settings/*"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <SettingsPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/accounts"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <AccountsPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <HistoryPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Catch all - redirect to auth by default if not logged in, otherwise to dashboard */}
                <Route path="*" element={<Navigate to="/auth" replace />} />
              </Routes>
            </PricingProvider>
          </SubscriptionModalProvider>
        </AuthProvider>
      </AppProvider>
    </>
  );
}

export default App;
