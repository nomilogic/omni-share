import React, { useEffect, useState } from "react";
import { OnboardingCarousel } from "../components/OnboardingCarousel";
import { AuthForm } from "../components/AuthForm";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

export const LandingPage: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { dispatch } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('hasLanded', 'true');
  })
  const handleGetStarted = () => {
    setShowAuth(true);
  };

  const handleAuthSuccess = (user: any) => {
    dispatch({ type: "SET_USER", payload: user });
    try {
      const profile = user?.profile;
      if (profile) {
        dispatch({ type: "SET_SELECTED_PROFILE", payload: profile });
        if (typeof (profile as any).isOnboarding !== 'undefined') {
          dispatch({ type: 'SET_ONBOARDING_COMPLETE', payload: (profile as any).isOnboarding });
        }
        if ((profile as any).isOnboarding === false) {
          navigate('/onboarding/profile');
          return;
        }
      }
    } catch (e) {
      console.error('Error applying login profile to app state', e);
    }
    navigate("/content");
  };

  const handleBackToCarousel = () => {
    setShowAuth(false);
  };

  if (showAuth) {
    return (
      <>
        <div className="w-full flex min-h-screen x-2 theme-gradient from-blue-50 to-indigo-100 items-center justify-center flex-col relative">
          <AuthForm onAuthSuccess={handleAuthSuccess} />
          <footer className="w-full px-4 py-4 text-center text-sm theme-text-light absolute bottom-0">
            <div className="max-w-full mx-auto flex md:flex-row items-center gap-2 md:justify-between justify-center flex-col">
              <span>© {new Date().getFullYear()} OMNISHARE</span>
              <div>
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy
                </a>
                &nbsp; | &nbsp;
                <a href="/terms" className="text-primary hover:underline">
                  Terms
                </a>
              </div>
            </div>
          </footer>
        </div>
      </>
    );
  }

  return <OnboardingCarousel onGetStarted={handleGetStarted} />;
};
