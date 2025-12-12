import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { getCurrentUser } from "../lib/database"; // Assuming getCurrentUser is stable
import { LoadingProvider } from "./LoadingContext";
import { Platform } from "../types"; // Assuming Platform is correctly typed
import Pusher from "pusher-js";
import API from "../services/api"; // Assuming API client is imported

// --- 1. Types and Interfaces ---

// Extended User interface for better type safety
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
  wallet: any;
  profile: Profile | null;
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
  campaignName?: string;
  campaignType?: string;
  campaignGoals?: string[];
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
  businessName?: string;
  jobTitle?: string;
  campaignSize?: string;
  teamCollaboration?: boolean;
  customIntegrations?: string[];
  monthlyBudget?: string;
  contentVolume?: string;
  // Ensure consistency for completion checks
  campaign_type?: string;
  content_niche?: string;
  business_name?: string;
}

export interface AppState {
  user: User | null;
  userPlan: "free" | "ipro" | "business" | null;
  selectedProfile: Profile | null;
  selectedCampaign: null;
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

// Actions
type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_USER_PLAN"; payload: "free" | "ipro" | "business" | null }
  | { type: "SET_SELECTED_PROFILE"; payload: Profile | null }
  | { type: "SET_SELECTED_CAMPAIGN"; payload: null }
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

// --- 2. Utility Functions ---

const checkProfileCompletion = (profile: any): boolean => {
  if (!profile || !profile.plan) {
    return false;
  }

  const hasBasicInfo = !!(profile.name && profile.plan);

  if (profile.plan === "free") {
    return hasBasicInfo;
  }

  // Use properties that align with profile structure for consistency
  if (profile.plan === "ipro") {
    const hasPostsInfo = !!(profile.campaignType || profile.contentNiche);
    return hasBasicInfo && hasPostsInfo;
  }

  if (profile.plan === "business") {
    const hasBusinessInfo = !!(profile.businessName || profile.industry);
    const hasPostsInfo = !!(profile.campaignType || profile.contentNiche);
    return hasBasicInfo && hasBusinessInfo && hasPostsInfo;
  }

  return hasBasicInfo;
};

const setStoredContentData = (data: any) => {
  try {
    // Implement or remove localStorage logic as needed
  } catch (error) {
    console.warn("Failed to store content data:", error);
  }
};

// --- 3. Reducer and Initial State ---

const initialState: AppState = {
  user: null,
  userPlan: null,
  selectedProfile: null,
  selectedCampaign: null,
  loading: true,
  error: null,
  generatedPosts: [],
  contentData: null,
  hasCompletedOnboarding: false,
  isBusinessAccount: false,
  hasTierSelected: false,
  hasProfileSetup: false,
  balance: 0,
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
      const { platform, post } = action.payload;
      const updatedPosts = state.generatedPosts.map((existingPost) =>
        existingPost.platform === platform ? post : existingPost
      );
      return { ...state, generatedPosts: updatedPosts };
    case "SET_CONTENT_DATA":
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
      setStoredContentData(null);
      return { ...initialState, loading: false, contentData: null };
    case "SET_BUSINESS_ACCOUNT":
      return { ...state, isBusinessAccount: action.payload };
    default:
      return state;
  }
}

// --- 4. Context Definition ---

export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  processing: any;
  setProcessing: any;
  generationAmounts: any;
  setGenerationAmounts: React.Dispatch<React.SetStateAction<any>>;
  fetchBalance: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

// --- 5. App Provider Component ---

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [processing, setProcessing] = useState<boolean>(false);
  const [generationAmounts, setGenerationAmounts] = useState<any>({});

  const pusher = useMemo(
    () =>
      new Pusher("5a8f542f7e4c1f452d53", {
        cluster: "ap2",
        forceTLS: true,
      }),
    []
  );

  const fetchBalance = useCallback(async () => {
    try {
      const [balanceResponse, authResult] = await Promise.all([
        API.userBalance(),
        getCurrentUser(),
      ]);

      const balance = balanceResponse.data?.data ?? 0;
      const updatedUser: User = (authResult as any).user;

      if (updatedUser) {
        dispatch({ type: "SET_USER", payload: updatedUser });
      }
      dispatch({ type: "SET_BALANCE", payload: balance });
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const persistentToken = localStorage.getItem("auth_token");

        if (!persistentToken) {
          dispatch({ type: "SET_LOADING", payload: false });
          return;
        }

        const authResult: any = await getCurrentUser();
        const user: User | null = authResult?.user || null;

        if (!user) {
          dispatch({ type: "SET_LOADING", payload: false });
          return;
        }

        dispatch({ type: "SET_USER", payload: user });
        dispatch({
          type: "SET_BALANCE",
          payload: user.wallet.coins + user.wallet.referralCoin,
        });

        const profile = user.profile;
        if (profile) {
          dispatch({
            type: "SET_SELECTED_PROFILE",
            payload: profile as Profile,
          });
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
        console.error("Failed to initialize authentication:", error);
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

  useEffect(() => {
    const userId = state.user?.id;
    if (!userId) return;

    const userChannel = pusher.subscribe(`user-${userId}`);
    const handleSubscriptionSuccess = () => {
      fetchBalance();
    };

    userChannel.bind("subscription-success", handleSubscriptionSuccess);

    const walletChannel = pusher.subscribe(`wallet-${userId}`);
    const handleCoinsUpdate = (data: { coins: number }) => {
      dispatch({ type: "SET_BALANCE", payload: data.coins });
      fetchBalance();
    };

    walletChannel.bind("coins-update", handleCoinsUpdate);

    const fetchGenerationAmounts = async () => {
      try {
        const res = await API.getGenerateAmount();
        const data = await res.data;

        const formattedData = (data.data || []).reduce(
          (acc: any, item: any) => {
            acc[item.type] = item.amount;
            return acc;
          },
          {}
        );

        setGenerationAmounts(formattedData);
      } catch (err) {
        console.error("Error fetching generation amounts:", err);
      }
    };

    fetchGenerationAmounts();

    // Cleanup function
    return () => {
      userChannel.unbind("subscription-success", handleSubscriptionSuccess);
      pusher.unsubscribe(`user-${userId}`);

      walletChannel.unbind("coins-update", handleCoinsUpdate);
      pusher.unsubscribe(`wallet-${userId}`);
    };
  }, [state.user?.id, pusher, fetchBalance]);

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      processing,
      setProcessing,
      generationAmounts,
      setGenerationAmounts,
      fetchBalance,
    }),
    [
      state,
      processing,
      generationAmounts,
      fetchBalance,
      setProcessing,
      setGenerationAmounts,
    ]
  );

  return (
    <LoadingProvider>
      <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
    </LoadingProvider>
  );
};

// --- 6. Use Context Hook ---

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  const [packages, setPackages] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [loader, setLoader] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      let response = await API.unreadHistory();

      setUnreadCount(Number(response?.data?.data?.unreadCount) || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoader(true);
        const packagesRes = await API.listPackages();
        setPackages(packagesRes.data.data || []);

        const addonsRes = await API.listAddons();
        setAddons(addonsRes.data.data || []);
        setLoader(false);
      } catch (error) {
        setLoader(false);
        console.error("Failed to load packages/addons:", error);
      }
    };
    fetchData();
  }, []);
  const selectCampaign = useCallback(
    (campaign: null) => {
      context.dispatch({ type: "SET_SELECTED_CAMPAIGN", payload: campaign });
    },
    [context.dispatch]
  );

  const refreshUser = useCallback(async () => {
    const authResult: any = await getCurrentUser();

    if (authResult && authResult.user) {
      context.dispatch({ type: "SET_USER", payload: authResult.user });
    }
  }, [context.dispatch]);

  const logout = async () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("pusherTransportTLS");
    context.dispatch({ type: "RESET_STATE" });
  };

  const setProfileEditing = useCallback(
    (v: boolean) =>
      context.dispatch({ type: "SET_PROFILE_EDITING", payload: v }),
    [context.dispatch]
  );

  const setPasswordEditing = useCallback(
    (v: boolean) =>
      context.dispatch({ type: "SET_PASSWORD_EDITING", payload: v }),
    [context.dispatch]
  );

  return {
    // State Accessors
    state: context.state,
    user: context.state.user,
    balance: context.state.balance,
    profile: context.state.selectedProfile,
    campaign: context.state.selectedCampaign,
    loader: loader,
    addons: addons,
    packages: packages,
    setUnreadCount: setUnreadCount,
    unreadCount: unreadCount,
    dispatch: context.dispatch,
    fetchUnreadCount: fetchUnreadCount,
    paymentProcessing: context.processing,
    setProcessing: context.setProcessing,

    // Data Accessors
    generationAmounts: context.generationAmounts,

    // Actions
    refreshUser,
    refreshBalance: context.fetchBalance,
    selectCampaign,
    logout,
    setProfileEditing,
    setPasswordEditing,
  };
};
