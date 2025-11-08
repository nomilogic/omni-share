import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProfileSetupSinglePage from "../components/ProfileSetupSinglePage";
import { useAppContext } from "../context/AppContext";

export const OnboardingPage: React.FC = () => {
  const { state } = useAppContext();

  // If user doesn't have a plan selected, show a friendly CTA to choose a plan
  // if (!state.userPlan) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="bg-white rounded-md shadow p-8 text-center max-w-lg">
  //         <h2 className="text-2xl font-semibold mb-4">Choose a plan to continue</h2>
  //         <p className="mb-6 text-slate-500">Please select a pricing plan to proceed with onboarding.</p>
  //         <div className="flex justify-center gap-4">
  //           <a href="/pricing" className="px-6 py-3 bg-blue-600 text-white rounded-md">View Pricing</a>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="profile" element={<ProfileSetupSinglePage />} />
        {/* <Route path="*" element={<Navigate to="/ " replace />} /> */}
      </Routes>
    </div>
  );
};
