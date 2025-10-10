import React, { createContext, useContext } from "react";
import { useAppContext } from "../context/AppContext";
import API from "../services/api";

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
      // Check both localStorage and sessionStorage for token
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Convert snake_case fields to camelCase if needed
      const apiProfileData = {
        name: profileData.full_name || profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        plan: profileData.plan_type || profileData.planType,
        type: profileData.business_name ? "business" : "individual",
        industry:
          profileData.content_categories?.join(", ") ||
          profileData.contentCategories?.join(", "),
        description:
          profileData.business_description || profileData.businessDescription,
        tone: profileData.brand_tone || profileData.brandTone,
        target_audience:
          profileData.target_audience || profileData.targetAudience,
        // Campaign fields
        campaign_type: profileData.campaign_type || profileData.campaignType,
        campaign_goals: profileData.goals,
        // Additional profile fields
        website: profileData.business_website || profileData.businessWebsite,
        content_niche:
          profileData.content_categories?.join(", ") ||
          profileData.contentCategories?.join(", "),
        preferred_platforms:
          profileData.primary_platforms || profileData.primaryPlatforms,
        posting_frequency:
          profileData.posting_frequency || profileData.postingFrequency,
        social_goals: profileData.goals,
        // Business specific fields
        business_name: profileData.business_name || profileData.businessName,
        business_type: profileData.business_type || profileData.businessType,
        team_size: profileData.team_size || profileData.teamSize,
        monthly_budget: profileData.monthly_budget || profileData.monthlyBudget,
        integrations: profileData.integrations,
        profile_completed: true,
      };

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
