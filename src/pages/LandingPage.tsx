import React, { useState } from "react";
import { OnboardingCarousel } from "../components/OnboardingCarousel";
import { AuthForm } from "../components/AuthForm";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

export const LandingPage: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { dispatch } = useAppContext();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  const handleAuthSuccess = (user: any) => {
    dispatch({ type: "SET_USER", payload: user });
    navigate("/content");
  };

  const handleBackToCarousel = () => {
    setShowAuth(false);
  };

  if (showAuth) {
    return (
      <div className="w-full flex h-full-dec-hf  x-2 theme-gradient from-blue-50 to-indigo-100 items-center justify-center">
        <div className="w-full max-w-md p-6">
          <div className="text-center text-white"></div>
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        </div>
      </div>
    );
  }

  return <OnboardingCarousel onGetStarted={handleGetStarted} />;
};
