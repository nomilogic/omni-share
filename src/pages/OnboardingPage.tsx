import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfileSetupSinglePage from '../components/ProfileSetupSinglePage';
import { useAppContext } from '../context/AppContext';

export const OnboardingPage: React.FC = () => {
  const { state } = useAppContext();

  // If user doesn't have a plan selected, redirect to pricing
  if (!state.userPlan) {
    return <Navigate to="/pricing" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="profile" element={<ProfileSetupSinglePage />} />
        <Route path="*" element={<Navigate to="/onboarding/profile" replace />} />
      </Routes>
    </div>
  );
};