import React, { createContext, useContext } from "react";
import { useAppContext } from "../context/AppContext";
import API from "../services/api";
import Cookies from "js-cookie";

interface AuthContextType {
  user: any;
  updateProfile: (profileData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { state, dispatch } = useAppContext();

  const updateProfile = async (profileData: any) => {
    try {
      const token = Cookies.get("auth_token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await API.updateProfile(profileData);

      const updatedProfile = await response.data.data;

      dispatch({ type: "SET_SELECTED_PROFILE", payload: updatedProfile });
      dispatch({ type: "SET_USER_PLAN", payload: updatedProfile.plan });
      dispatch({ type: "SET_TIER_SELECTED", payload: true });
      dispatch({ type: "SET_PROFILE_SETUP", payload: true });
      dispatch({ type: "SET_ONBOARDING_COMPLETE", payload: true });

      if (updatedProfile.type === "business") {
        dispatch({ type: "SET_BUSINESS_ACCOUNT", payload: true });
      }

      console.log("✅ Profile successfully updated:", updatedProfile);
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  const value = {
    user: state.user,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
