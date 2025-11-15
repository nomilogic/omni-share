import React from "react";
import { Routes, Route } from "react-router-dom";
import ProfileSetupSinglePage from "../components/ProfileSetupSinglePage";

export const OnboardingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="profile" element={<ProfileSetupSinglePage />} />
      </Routes>
    </div>
  );
};
