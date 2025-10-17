import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { useAppContext } from '../context/AppContext';
import API from '../services/api';

export const AuthPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated
  useEffect(() => {
    if (state.user) {
      const from = (location.state as any)?.from?.pathname || '/content';
      navigate(from, { replace: true });
    }
  }, [state.user, navigate, location]);

  const handleAuthSuccess = (user: any) => {
    dispatch({ type: 'SET_USER', payload: user });
    
    // Set user plan and business account status based on login response
    if (user.plan) {
      dispatch({ type: 'SET_USER_PLAN', payload: user.plan });
    } else {
      // Auto-set new users to free plan and skip onboarding
      dispatch({ type: 'SET_USER_PLAN', payload: 'free' });
    }
    
    if (user.profile_type === 'business') {
      dispatch({ type: 'SET_BUSINESS_ACCOUNT', payload: true });
    }
    
    // Auto-complete onboarding for all users
    dispatch({ type: 'SET_TIER_SELECTED', payload: true });
    dispatch({ type: 'SET_PROFILE_SETUP', payload: true });
    dispatch({ type: 'SET_ONBOARDING_COMPLETE', payload: true });
    
    const from = (location.state as any)?.from?.pathname || '/content';
    navigate(from, { replace: true });
  };

  // Send forget-password link
  const handleForgetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await API.generateForgetLink({ email });
      // inform user
      alert('If that email exists, a reset link has been sent.');
    } catch (err: any) {
      console.error('generateForgetLink failed', err);
      setError(err?.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  // This handler is for in-page reset (optional) — Reset via ResetPasswordPage will call API directly
  const handleResetPassword = async (token: string, new_password: string) => {
    setLoading(true);
    setError(null);
    try {
      // call API with token in header
      await API.setNewPassword({ new_password }, {
        headers: { authorization: token },
      } as any);
      alert('Password updated successfully');
      navigate('/login');
    } catch (err: any) {
      console.error('setNewPassword failed', err);
      setError(err?.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (state.user) {
    return null; // Will redirect in useEffect
  }

  return (
    <AuthForm
      onAuthSuccess={handleAuthSuccess}
      onForgetPassword={handleForgetPassword}
      onResetPassword={(token: string, password: string) => handleResetPassword(token, password)}
      loading={loading}
      error={error}
    />
  );
};