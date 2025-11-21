import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import { getCurrentUser, signInAnonymously } from "../lib/database";
import { Campaign } from "@shared/schema";
import { LoadingProvider } from "./LoadingContext";

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  profile_type?: "business" | "individual";
  plan?: "free" | "ipro" | "business";
  created_at?: string;
  user_metadata?: {
    name?: string;
    [key: string]: any;
  };
}

export interface Profile {
  id: string;
  name: string;
  type: "individual" | "business";
  industry: string;
  description?: string;
  tone?: string;
  target_audience?: string;
  userId: string;
  plan: "free" | "ipro" | "business";
  // Campaign fields
  campaignName?: string;
  campaignType?: string;
  campaignGoals?: string[];
  // Additional profile fields
  profession?: string;
  location?: string;
  website?: string;
  bio?: string;
  contentNiche?: string;
  preferredPlatforms?: string[];
  brandVoice?: string;
  socialGoals?: string[];
  businessGoals?: string[];
  postingFrequency?: string;
  // Business specific fields
  businessName?: string;
  jobTitle?: string;
  campaignSize?: string;
  teamCollaboration?: boolean;
  customIntegrations?: string[];
  monthlyBudget?: string;
  contentVolume?: string;
}

// export interface Campaign {
//   id: string;
//   name: string;
//   description?: string;
//   profileId: string;
//   isActive: boolean;
// }

export interface AppState {
  user: any | null;
  userPlan: "free" | "ipro" | "business" | null;
  selectedProfile: Profile | null;
  selectedCampaign: Campaign | null;
  loading: boolean;
  error: string | null;
  generatedPosts: any[];
  contentData: any;
  hasCompletedOnboarding: boolean;
  isBusinessAccount: boolean;
  hasTierSelected: boolean;
  hasProfileSetup: boolean;
  balance: number;
  isProfileEditing?: boolean;
  isPasswordEditing?: boolean;
}

import { Platform } from "../types";
import Pusher from "pusher-js";
import API from "../services/api";

// Actions
type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_USER_PLAN"; payload: "free" | "ipro" | "business" | null }
  | { type: "SET_SELECTED_PROFILE"; payload: Profile | null }
  | { type: "SET_SELECTED_CAMPAIGN"; payload: Campaign | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_GENERATED_POSTS"; payload: any[] }
  | {
      type: "UPDATE_SINGLE_PLATFORM_POST";
      payload: { platform: Platform; post: any };
    }
  | { type: "SET_CONTENT_DATA"; payload: any }
  | { type: "SET_ONBOARDING_COMPLETE"; payload: boolean }
  | { type: "SET_TIER_SELECTED"; payload: boolean }
  | { type: "SET_PROFILE_SETUP"; payload: boolean }
  | { type: "SET_PROFILE_EDITING"; payload: boolean }
  | { type: "SET_PASSWORD_EDITING"; payload: boolean }
  | { type: "RESET_STATE" }
  | { type: "SET_BUSINESS_ACCOUNT"; payload: boolean }
  | { type: "SET_BALANCE"; payload: number };

// Helper function to check if profile is complete based on plan requirements
const checkProfileCompletion = (profile: any): boolean => {
  if (!profile || !profile.plan) {
    console.log("❌ Profile incomplete: No profile or plan");
    return false;
  }

  console.log("🔍 Checking profile completion:", {
    hasProfile: !!profile,
    name: profile.name,
    plan: profile.plan,
    type: profile.type,
    campaign_type: profile.campaign_type,
    business_name: profile.business_name,
    industry: profile.industry,
  });

  // Check basic required fields for all plans
  const hasBasicInfo = !!(profile.name && profile.plan);

  // For free plan, basic info + name is sufficient
  if (profile.plan === "free") {
    const isComplete = hasBasicInfo;
    console.log("✅ Free plan completion check:", { hasBasicInfo, isComplete });
    return isComplete;
  }

  // For pro plan, also check campaign fields
  if (profile.plan === "ipro") {
    const hasPostsInfo = !!(profile.campaign_type || profile.content_niche);
    const isComplete = hasBasicInfo && hasPostsInfo;
    console.log("✅ Pro plan completion check:", {
      hasBasicInfo,
      hasPostsInfo,
      isComplete,
    });
    return isComplete;
  }

  // For business plan, check additional business-specific fields and campaign info
  if (profile.plan === "business") {
    const hasBusinessInfo = !!(profile.business_name || profile.industry);
    const hasPostsInfo = !!(profile.campaign_type || profile.content_niche);
    const isComplete = hasBasicInfo && hasBusinessInfo && hasPostsInfo;
    console.log("✅ Business plan completion check:", {
      hasBasicInfo,
      hasBusinessInfo,
      hasPostsInfo,
      isComplete,
    });
    return isComplete;
  }

  // Default fallback
  console.log("⚠️ Default fallback completion check:", hasBasicInfo);
  return hasBasicInfo;
};

const setStoredContentData = (data: any) => {
  try {
    if (data) {
      // localStorage.setItem('s_ai_content_data', JSON.stringify(data));
    } else {
      //  localStorage.removeItem('s_ai_content_data');
    }
  } catch (error) {
    console.warn("Failed to store content data:", error);
  }
};

// Initial state
const initialState: AppState = {
  user: null,
  userPlan: null,
  selectedProfile: null,
  selectedCampaign: null,
  loading: true,
  error: null,
  generatedPosts: [],
  contentData: null, // Load from localStorage
  hasCompletedOnboarding: false,
  isBusinessAccount: false,
  hasTierSelected: false,
  hasProfileSetup: false,
  balance: 0, // ✅ added
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_BALANCE":
      return { ...state, balance: action.payload };
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_USER_PLAN":
      return { ...state, userPlan: action.payload };
    case "SET_SELECTED_PROFILE":
      return {
        ...state,
        selectedProfile: action.payload,
        userPlan: action.payload?.plan || state.userPlan,
        isBusinessAccount: action.payload?.type === "business",
      };
    case "SET_SELECTED_CAMPAIGN":
      return { ...state, selectedCampaign: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_GENERATED_POSTS":
      return { ...state, generatedPosts: action.payload };
    case "UPDATE_SINGLE_PLATFORM_POST":
      // Update only the specific platform's post while keeping others unchanged
      const { platform, post } = action.payload;
      const updatedPosts = state.generatedPosts.map((existingPost) =>
        existingPost.platform === platform ? post : existingPost
      );
      console.log(
        `🔄 Updated ${platform} post in context. Total posts: ${updatedPosts.length}`
      );
      return { ...state, generatedPosts: updatedPosts };
    case "SET_CONTENT_DATA":
      // Persist contentData to localStorage
      setStoredContentData(action.payload);
      return { ...state, contentData: action.payload };
    case "SET_ONBOARDING_COMPLETE":
      return { ...state, hasCompletedOnboarding: action.payload };
    case "SET_TIER_SELECTED":
      return { ...state, hasTierSelected: action.payload };
    case "SET_PROFILE_SETUP":
      return { ...state, hasProfileSetup: action.payload };
    case "SET_PROFILE_EDITING":
      return { ...state, isProfileEditing: action.payload };
    case "SET_PASSWORD_EDITING":
      return { ...state, isPasswordEditing: action.payload };
    case "RESET_STATE":
      // Clear localStorage when resetting state
      setStoredContentData(null);
      return { ...initialState, loading: false, contentData: null };
    case "SET_BUSINESS_ACCOUNT":
      return { ...state, isBusinessAccount: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  processing: boolean;
  setProcessing: any;
  generationAmounts: any;
  setGenerationAmounts: any;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const pusher = new Pusher("5a8f542f7e4c1f452d53", {
    cluster: "ap2",
    forceTLS: true,
  });

  const fetchBalance = async () => {
    try {
      const response = await API.userBalance();
      const { data } = response;
      dispatch({ type: "SET_BALANCE", payload: data?.data ?? 0 });
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const persistentToken = localStorage.getItem("auth_token");

        if (!persistentToken) {
          dispatch({ type: "SET_LOADING", payload: false });
          return;
        }

        const authResult = await getCurrentUser();
        if (!authResult?.user) {
          dispatch({ type: "SET_LOADING", payload: false });
          return;
        }

        dispatch({ type: "SET_USER", payload: authResult.user });

        const profile = authResult.user.profile;
        if (profile) {
          dispatch({ type: "SET_SELECTED_PROFILE", payload: profile });
          dispatch({ type: "SET_USER_PLAN", payload: profile.plan || "free" });
          if (profile.type === "business") {
            dispatch({ type: "SET_BUSINESS_ACCOUNT", payload: true });
          }

          const isProfileComplete = checkProfileCompletion(profile);
          dispatch({ type: "SET_TIER_SELECTED", payload: true });
          dispatch({ type: "SET_PROFILE_SETUP", payload: isProfileComplete });
          dispatch({
            type: "SET_ONBOARDING_COMPLETE",
            payload: isProfileComplete,
          });
        }
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: "Failed to initialize authentication",
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initializeAuth();
  }, []);

  const [processing, setProcessing] = useState<any>(false);

  useEffect(() => {
    if (!state.user?.id) return;

    const channel = pusher.subscribe(`user-${state.user.id}`);
    const handleSubscriptionSuccess = async () => {
      try {
        const updatedAuthResult: any = await getCurrentUser();
        dispatch({ type: "SET_USER", payload: updatedAuthResult.user });
        fetchBalance();
      } catch (error) {}
    };

    channel.bind("subscription-success", handleSubscriptionSuccess);

    return () => {
      channel.unbind("subscription-success", handleSubscriptionSuccess);
      pusher.unsubscribe(`user-${state.user.id}`);
    };
  }, [state.user?.id]);

  useEffect(() => {
    if (!state.user?.id) return;

    fetchBalance();

    const userId = state.user.id;
    const channel = pusher.subscribe(`wallet-${userId}`);

    channel.bind("coins-update", (data: { coins: number }) => {
      dispatch({ type: "SET_BALANCE", payload: data.coins });
    });

    return () => {
      pusher.unsubscribe(`wallet-${userId}`);
      pusher.disconnect();
    };
  }, [state.user?.id]);

  const [generationAmounts, setGenerationAmounts] = useState<any>({});

  const fetchData = async () => {
    if (!state.user?.id) return;

    try {
      const res = await API.getGenerateAmount();
      const data = await res.data;

      const formattedData = (data.data || []).reduce((acc: any, item: any) => {
        acc[item.type] = item.amount;
        return acc;
      }, {});

      setGenerationAmounts(formattedData);
    } catch (err) {
      console.error("Error fetching generation amounts:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [state.user?.id]);

  return (
    <LoadingProvider>
      <AppContext.Provider
        value={{
          state,
          dispatch,
          processing,
          setProcessing,
          generationAmounts,
          setGenerationAmounts,
        }}
      >
        {children}
      </AppContext.Provider>
    </LoadingProvider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  const selectCampaign = (campaign: Campaign | null) => {
    context.dispatch({ type: "SET_SELECTED_CAMPAIGN", payload: campaign });
  };

  const refreshUser = async () => {
    const authResult = await getCurrentUser();

    if (authResult && authResult.user) {
      context.dispatch({ type: "SET_USER", payload: authResult.user });
      return;
    }
  };

  const logout = async () => {
    localStorage.clear();

    context.dispatch({ type: "RESET_STATE" });
  };

  return {
    generationAmounts: context.generationAmounts,
    state: context.state,
    paymentProcessing: context.processing,
    setProcessing: context.setProcessing,
    refreshUser: refreshUser,
    dispatch: context.dispatch,
    user: context.state.user,
    balance: context.state.balance,
    profile: context.state.selectedProfile,
    campaign: context.state.selectedCampaign,
    selectCampaign,
    logout,
    setProfileEditing: (v: boolean) =>
      context.dispatch({ type: "SET_PROFILE_EDITING", payload: v }),
    setPasswordEditing: (v: boolean) =>
      context.dispatch({ type: "SET_PASSWORD_EDITING", payload: v }),
  };
};
