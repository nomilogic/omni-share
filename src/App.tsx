import "./i18n";
import React, { useEffect, useLayoutEffect } from "react";
import { ModalProvider } from "./context2/ModalContext";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useAppContext } from "./context/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SubscriptionModalProvider } from "./context/SubscriptionModalContext";
import { PricingModalProvider } from "./context/PricingModalContext";
import { ConfirmDialogProvider } from "./context/ConfirmDialogContext";
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
import { ProfilePage } from "./pages/ProfilePage";
import { CampaignsPage } from "./pages/CampaignsPage";
import { AccountsPage } from "./pages/AccountsPage";
import { HistoryPage } from "./pages/HistoryPage";
import PrivacyPolicy from "./components/PrivacyPolicy";
import AddonSuccessPage from "./pages/PackageAddonSuccess";
import TransactionHistory from "./pages/TransectionHistory";
import GenerationAmountPage from "./pages/GenerationAmountPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import { Bounce, ToastContainer } from "react-toastify";
import { FAQ, Support, Terms } from "./components";
import PackageErrorPage from "./pages/PackageErrorPage";
import CookieBanner from "./components/CookieBanner";
import AnalyticsPage from "./pages/AnalyticsPage";
import ReferralRewards from "./components/RefferalShare";
import { PublicRoute } from "./components/PublicRoute";
import { useTranslation } from "react-i18next";
const OAuthCallbackWrapper = () => {
  const { initUser } = useAppContext();

  const handleAuthSuccess = () => {
    initUser();
  };

  return <AuthOAuthCallback onAuthSuccess={handleAuthSuccess} />;
};

function App() {
  const { i18n } = useTranslation();
  useLayoutEffect(() => {
    const detectUserLanguage = async () => {
      try {
        const res = await fetch("https://api.country.is/");
        const data = await res.json();

        let lang = "en";

        const chineseCountries = ["CN", "HK", "TW", "SG", "MO"];
        const spanishCountries = ["ES", "MX", "AR", "CO", "PE"];
        if (spanishCountries.includes(data.country)) {
          lang = "es";
        } else if (chineseCountries.includes(data.country)) {
          lang = "zh";
        }

        i18n.changeLanguage(lang);

        localStorage.setItem("siteLang", lang);
      } catch (error) {}
    };

    const savedLang = localStorage.getItem("siteLang");
    if (savedLang && savedLang.trim() !== "") {
      i18n.changeLanguage(savedLang);
    } else {
      detectUserLanguage();
    }
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
        <ConfirmDialogProvider>
          <ModalProvider>
            <AuthProvider>
              <SubscriptionModalProvider>
                <PricingModalProvider>
                  <Routes>
                    <Route path="/" element={<HomePage />} />

                    <Route
                      path="/auth"
                      element={
                        <PublicRoute>
                          <AuthPage />
                        </PublicRoute>
                      }
                    />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/conditions" element={<ReferralRewards />} />

                    <Route
                      path="/analytics"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <AnalyticsPage />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
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
                      path="/payment/error"
                      element={
                        <ProtectedRoute>
                          <PackageErrorPage />
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
                    <Route
                      path="/reset-password"
                      element={<ResetPasswordPage />}
                    />

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

                    {/* <Route
                      path="/settings/*"
                      element={
                        <ProtectedRoute>
                          <AppLayout>
                            <SettingsPage />
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    /> */}

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

                    <Route path="*" element={<Navigate to="/auth" replace />} />
                  </Routes>
                </PricingModalProvider>
              </SubscriptionModalProvider>
            </AuthProvider>
          </ModalProvider>
        </ConfirmDialogProvider>
      </AppProvider>
      <CookieBanner />
    </>
  );
}

export default App;
