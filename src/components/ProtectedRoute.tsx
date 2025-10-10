import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Sparkles } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { state } = useAppContext();
  const location = useLocation();

  if (state.loading) {
    return (
      <div className="h-full-dec-hf  x-2 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Omni Share</h2>
          <p className="text-gray-600">Setting up your workspace...</p>
        </div>
      </div>
    );
  }

  if (!state.user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user is authenticated but on auth page, redirect based on setup status
  if (location.pathname === '/auth') {
    if (state.hasCompletedOnboarding) {
      return <Navigate to="/content" replace />;
    } else {
      return <Navigate to="/pricing" replace />;
    }
  }

  // Check if user needs to complete onboarding
  if (!state.hasCompletedOnboarding && !location.pathname.includes('/pricing')) {
   // return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};
