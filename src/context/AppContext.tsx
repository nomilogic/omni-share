import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { getCurrentUser } from "../lib/database";
import { LoadingProvider } from "./LoadingContext";
import { Platform } from "../types";
import Pusher from "pusher-js";
import API from "../services/api";

// --- Types ---

export interface User {
  id: string;
  email: string;
  name?: string;
  profile_type?: "business" | "individual";
  plan?: "free" | "ipro" | "business";
  created_at?: string;
  user_metadata?: { name?: string; [key: string]: any };
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
  | { type: "SET_BALANCE"; payload: number }
  | { type: "SET_PACKAGES"; payload: any[] }
  | { type: "SET_ADDONS"; payload: any[] }
  | { type: "SET_LOADER"; payload: boolean }
  | { type: "SET_UNREAD_COUNT"; payload: number };

const initialState: AppState & {
  packages: any[];
  addons: any[];
  loader: boolean;
  unreadCount: number;
} = {
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
  packages: [],
  addons: [],
  loader: false,
  unreadCount: 0,
};

function appReducer(
  state: typeof initialState,
  action: AppAction
): typeof initialState {
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
      return {
        ...state,
        generatedPosts: state.generatedPosts.map((p) =>
          p.platform === platform ? post : p
        ),
      };
    case "SET_CONTENT_DATA":
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
      return { ...initialState, loading: false };
    case "SET_BUSINESS_ACCOUNT":
      return { ...state, isBusinessAccount: action.payload };
    case "SET_PACKAGES":
      return { ...state, packages: action.payload };
    case "SET_ADDONS":
      return { ...state, addons: action.payload };
    case "SET_LOADER":
      return { ...state, loader: action.payload };
    case "SET_UNREAD_COUNT":
      return { ...state, unreadCount: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: typeof initialState;
  dispatch: React.Dispatch<AppAction>;
  processing: boolean;
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  generationAmounts: any;
  setGenerationAmounts: React.Dispatch<React.SetStateAction<any>>;
  fetchBalance: () => Promise<void>;
  refreshUser: () => Promise<void>;
  selectCampaign: (campaign: null) => void;
  logout: () => void;
  setProfileEditing: (v: boolean) => void;
  setPasswordEditing: (v: boolean) => void;
  fetchUnreadCount: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [processing, setProcessing] = useState(false);
  const [generationAmounts, setGenerationAmounts] = useState<any>({});

  const pusher = useMemo(
    () =>
      new Pusher("5a8f542f7e4c1f452d53", { cluster: "ap2", forceTLS: true }),
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("pusherTransportTLS");
    localStorage.removeItem("forgot_token");
    localStorage.removeItem("forgot_token_time");
    dispatch({ type: "RESET_STATE" });
  }, []);

  const refreshToken = useCallback(async () => {
    const refToken = localStorage.getItem("refresh_token");
    if (!refToken) return logout();
    try {
      const res = await API.refreshToken(refToken);
      localStorage.setItem("auth_token", res.data.data.accessToken);
      localStorage.setItem("refresh_token", res.data.data.refreshToken);
    } catch (error) {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    refreshToken();
  }, []);

  const fetchBalance = useCallback(async () => {
    try {
      const [balanceRes, userRes] = await Promise.all([
        API.userBalance(),
        getCurrentUser(),
      ]);
      const balance = balanceRes.data?.data ?? 0;
      const user = (userRes as any)?.user;
      if (user) dispatch({ type: "SET_USER", payload: user });
      dispatch({ type: "SET_BALANCE", payload: balance });
    } catch (error) {
      console.error("Balance fetch failed:", error);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res: any = await getCurrentUser();
      if (res?.user) dispatch({ type: "SET_USER", payload: res.user });
    } catch (error) {
      console.error("User refresh failed:", error);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await API.unreadHistory();
      dispatch({
        type: "SET_UNREAD_COUNT",
        payload: Number(res?.data?.data?.unreadCount) || 0,
      });
    } catch (error) {
      console.error("Unread count failed:", error);
    }
  }, []);

  const checkProfileCompletion = (profile: Profile | null): boolean => {
    if (!profile?.plan) return false;
    const basic = !!(profile.name && profile.plan);
    if (profile.plan === "free") return basic;
    if (profile.plan === "ipro")
      return basic && !!(profile.campaignType || profile.contentNiche);
    if (profile.plan === "business") {
      return (
        basic &&
        !!(profile.businessName || profile.industry) &&
        !!(profile.campaignType || profile.contentNiche)
      );
    }
    return basic;
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }

      try {
        const res: any = await getCurrentUser();
        const user = res?.user || null;
        if (!user) {
          dispatch({ type: "SET_LOADING", payload: false });
          return;
        }

        dispatch({ type: "SET_USER", payload: user });
        dispatch({
          type: "SET_BALANCE",
          payload: user.wallet.coins + user.wallet.referralCoin,
        });

        const profile = user.profile as Profile | null;
        if (profile) {
          dispatch({ type: "SET_SELECTED_PROFILE", payload: profile });
          dispatch({ type: "SET_USER_PLAN", payload: profile.plan || "free" });
          dispatch({
            type: "SET_BUSINESS_ACCOUNT",
            payload: profile.type === "business",
          });
          const complete = checkProfileCompletion(profile);
          dispatch({ type: "SET_TIER_SELECTED", payload: true });
          dispatch({ type: "SET_PROFILE_SETUP", payload: complete });
          dispatch({ type: "SET_ONBOARDING_COMPLETE", payload: complete });
        }
      } catch (error) {
        console.error("Auth init failed:", error);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    init();
  }, []);

  useEffect(() => {
    const loadExtras = async () => {
      dispatch({ type: "SET_LOADER", payload: true });
      try {
        const [pkgRes, addRes] = await Promise.all([
          API.listPackages(),
          API.listAddons(),
        ]);
        dispatch({ type: "SET_PACKAGES", payload: pkgRes.data.data || [] });
        dispatch({ type: "SET_ADDONS", payload: addRes.data.data || [] });
      } catch (error) {
        console.error("Load packages/addons failed:", error);
      } finally {
        dispatch({ type: "SET_LOADER", payload: false });
      }
    };

    if (state.user?.id) {
      loadExtras();
    }
  }, [state.user?.id]);

  useEffect(() => {
    const userId = state.user?.id;
    if (!userId) return;

    const userChannel = pusher.subscribe(`user-${userId}`);
    userChannel.bind("subscription-success", fetchBalance);

    const walletChannel = pusher.subscribe(`wallet-${userId}`);
    walletChannel.bind("coins-update", (data: { coins: number }) => {
      dispatch({ type: "SET_BALANCE", payload: data.coins });
      fetchBalance();
    });

    const loadGenAmounts = async () => {
      try {
        const res = await API.getGenerateAmount();
        const formatted = (res.data.data || []).reduce(
          (acc: any, item: any) => {
            acc[item.type] = item.amount;
            return acc;
          },
          {}
        );
        setGenerationAmounts(formatted);
      } catch (err) {
        console.error("Gen amounts failed:", err);
      }
    };
    loadGenAmounts();

    fetchUnreadCount();

    return () => {
      pusher.unsubscribe(`user-${userId}`);
      pusher.unsubscribe(`wallet-${userId}`);
    };
  }, [state.user?.id, pusher, fetchBalance, fetchUnreadCount]);

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      processing,
      setProcessing,
      generationAmounts,
      setGenerationAmounts,
      fetchBalance,
      refreshUser,
      selectCampaign: (campaign: null) =>
        dispatch({ type: "SET_SELECTED_CAMPAIGN", payload: campaign }),
      logout,
      setProfileEditing: (v: boolean) =>
        dispatch({ type: "SET_PROFILE_EDITING", payload: v }),
      setPasswordEditing: (v: boolean) =>
        dispatch({ type: "SET_PASSWORD_EDITING", payload: v }),
      fetchUnreadCount,
      refreshBalance: fetchBalance,
    }),
    [
      state,
      dispatch,
      processing,
      setProcessing,
      generationAmounts,
      setGenerationAmounts,
      fetchBalance,
      refreshUser,
      logout,
      fetchUnreadCount,
    ]
  );

  return (
    <LoadingProvider>
      <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
    </LoadingProvider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }

  const {
    state,
    dispatch,
    processing,
    setProcessing,
    generationAmounts,
    fetchBalance,
    refreshUser,
    logout,
    fetchUnreadCount,
    selectCampaign,
    setProfileEditing,
    setPasswordEditing,
  } = context;

  const setUnreadCount = useCallback(
    (count: number) => {
      dispatch({ type: "SET_UNREAD_COUNT", payload: count });
    },
    [dispatch]
  );

  return {
    state: state,
    user: state.user,
    balance: state.balance,
    profile: state.selectedProfile,
    campaign: state.selectedCampaign,
    loader: state.loader,
    addons: state.addons,
    packages: state.packages,
    unreadCount: state.unreadCount,
    setUnreadCount,

    dispatch: dispatch,
    fetchUnreadCount,
    paymentProcessing: processing,
    setProcessing: setProcessing,

    generationAmounts: generationAmounts,

    refreshUser,
    refreshBalance: fetchBalance,
    selectCampaign,
    logout,
    setProfileEditing,
    setPasswordEditing,
  };
};
