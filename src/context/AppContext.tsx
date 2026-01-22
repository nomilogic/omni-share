import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import { getCurrentUser } from "../lib/database";
import { LoadingProvider } from "./LoadingContext";
import { Platform } from "../types";
import Pusher from "pusher-js";
import API from "../services/api";
import Cookies from "js-cookie";
import { oauthManagerClient } from "@/lib/oauthManagerClient";

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
  brandLogo?: string;
  publicUrl?: string;
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
  connectedPlatforms: Platform[] | null;
  connectingPlatforms: Platform[];
  analyticsList: any[];
  analyticsLoading: boolean;
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
  | { type: "SET_UNREAD_COUNT"; payload: number }
  | { type: "SET_SECURITY_QUESTIONS"; payload: any[] }
  | { type: "SET_CONNECTED_PLATFORMS"; payload: Platform[] }
  | { type: "SET_CONNECTING_PLATFORMS"; payload: Platform[] }
  | { type: "SET_ANALYTICS"; payload: any[] }
  | { type: "SET_ANALYTICS_LOADING"; payload: boolean }
  | { type: "SET_POST_HISTORY"; payload: any[] }
  | { type: "SET_POST_HISTORY_LOADING"; payload: boolean }
  | { type: "SET_EXCHANGE_RATES"; payload: Record<string, number> }
  | { type: "SET_EXCHANGE_RATES_LOADING"; payload: boolean };

const initialState: AppState & {
  security_question: any[];
  packages: any[];
  addons: any[];
  loader: boolean;
  unreadCount: number;
  postHistory: any[];
  postHistoryLoading: Boolean;
  exchangeRatesLoading: Boolean;
  exchangeRates: any;
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
  security_question: [],
  addons: [],
  loader: true,
  unreadCount: 0,
  connectedPlatforms: null,
  connectingPlatforms: [],
  analyticsList: [],
  analyticsLoading: false,
  postHistory: [],
  postHistoryLoading: false,
  exchangeRates: {},
  exchangeRatesLoading: false,
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
    case "SET_SECURITY_QUESTIONS":
      return { ...state, security_question: action.payload };
    case "SET_ADDONS":
      return { ...state, addons: action.payload };
    case "SET_LOADER":
      return { ...state, loader: action.payload };
    case "SET_UNREAD_COUNT":
      return { ...state, unreadCount: action.payload };
    case "SET_CONNECTED_PLATFORMS":
      return { ...state, connectedPlatforms: action.payload };

    case "SET_CONNECTING_PLATFORMS":
      return { ...state, connectingPlatforms: action.payload };
    case "SET_ANALYTICS_LOADING":
      return { ...state, analyticsLoading: action.payload };

    case "SET_ANALYTICS":
      return { ...state, analyticsList: action.payload };
    case "SET_POST_HISTORY":
      return { ...state, postHistory: action.payload };

    case "SET_POST_HISTORY_LOADING":
      return { ...state, postHistoryLoading: action.payload };
    case "SET_EXCHANGE_RATES":
      return { ...state, exchangeRates: action.payload };

    case "SET_EXCHANGE_RATES_LOADING":
      return { ...state, exchangeRatesLoading: action.payload };

    default:
      return state;
  }
}
const ALL_PLATFORMS: Platform[] = [
  "linkedin",
  "facebook",
  "instagram",
  "youtube",
  "tiktok",
];

interface AppContextType {
  state: typeof initialState;
  dispatch: React.Dispatch<AppAction>;
  processing: boolean;
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  generationAmounts: any;
  setGenerationAmounts: React.Dispatch<React.SetStateAction<any>>;
  fetchBalance: () => Promise<void>;
  fetchPostHistory: () => Promise<void>;
  initUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  selectCampaign: (campaign: null) => void;
  logout: () => void;
  setProfileEditing: (v: boolean) => void;
  setPasswordEditing: (v: boolean) => void;
  fetchUnreadCount: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  checkConnectedPlatforms: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
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

  const apiKey = "80f18a670f8f17b074ee56f9";

  const fetchExchangeRates = async () => {
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

    try {
      dispatch({ type: "SET_EXCHANGE_RATES_LOADING", payload: true });

      const res = await fetch(url);
      const data = await res.json();

      if (data?.result === "success") {
        dispatch({
          type: "SET_EXCHANGE_RATES",
          payload: data.conversion_rates || {},
        });
      } else {
        dispatch({ type: "SET_EXCHANGE_RATES", payload: {} });
      }
    } catch (err) {
      console.error("Failed to fetch exchange rates:", err);
      dispatch({ type: "SET_EXCHANGE_RATES", payload: {} });
    } finally {
      dispatch({ type: "SET_EXCHANGE_RATES_LOADING", payload: false });
    }
  };

  const logout = () => {
    Cookies.remove("auth_token");
    Cookies.remove("refresh_token");
    localStorage.removeItem("pusherTransportTLS");
    localStorage.removeItem("forgot_token");
    localStorage.removeItem("forgot_token_time");
    localStorage.removeItem("cached_user");
    dispatch({ type: "RESET_STATE" });
    dispatch({ type: "SET_LOADER", payload: false });
  };

  const refreshToken = useCallback(async () => {
    const refToken = Cookies.get("refresh_token");
    if (!refToken) return logout();
    try {
      const res = await API.refreshToken(refToken);
      Cookies.set("auth_token", res.data.data.accessToken, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      });
      Cookies.set("refresh_token", res.data.data.refreshToken, {
        expires: 14,
        secure: true,
        sameSite: "strict",
      });
    } catch (error) {}
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      dispatch({ type: "SET_ANALYTICS_LOADING", payload: true });

      const res = await API.facebookAnalytics();
      dispatch({
        type: "SET_ANALYTICS",
        payload: res?.data?.data || [],
      });
    } catch (e) {
      console.error("Analytics fetch error:", e);
      dispatch({ type: "SET_ANALYTICS", payload: [] });
    } finally {
      dispatch({ type: "SET_ANALYTICS_LOADING", payload: false });
    }
  }, []);

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
    } finally {
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

  const initUser = async () => {
    dispatch({ type: "SET_LOADER", payload: true });
    const token = Cookies.get("auth_token");
    if (!token) {
      dispatch({ type: "SET_LOADER", payload: false });
      return;
    }

    try {
      const res: any = await getCurrentUser();
      const user = res?.user;

      dispatch({ type: "SET_USER", payload: user });
      dispatch({
        type: "SET_BALANCE",
        payload: user.wallet.coins + user.wallet.referralCoin,
      });

      const profile = user.profile as Profile | null;
      if (profile) {
        dispatch({ type: "SET_SELECTED_PROFILE", payload: profile });
        dispatch({
          type: "SET_USER_PLAN",
          payload: profile.plan || "free",
        });
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
    } finally {
      setTimeout(() => {
        dispatch({ type: "SET_LOADER", payload: false });
      }, 1000);
    }
  };

  useLayoutEffect(() => {
    initUser();
  }, []);

  useEffect(() => {
    const loadExtras = async () => {
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
      }
    };

    if (state.user?.id) {
      loadExtras();
    }
  }, [state.user?.id]);

  const loadSecurityQuestion = async () => {
    try {
      if (!state?.security_question?.length) {
        const [question] = await Promise.all([API.securityQuestion()]);
        dispatch({
          type: "SET_SECURITY_QUESTIONS",
          payload: question.data?.data || [],
        });
      }
    } catch (error) {}
  };

  useEffect(() => {
    loadSecurityQuestion();
  }, [state?.user?.id, logout]);

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

  const checkConnectedPlatforms = useCallback(async () => {
    try {
      const response = await API.connectionsStatus();
      const statusData = response.data;

      const connected: Platform[] = [];

      ALL_PLATFORMS.forEach((platform) => {
        const status = statusData[platform];
        if (status?.connected && !status.expired) {
          connected.push(platform);
        }
      });

      dispatch({ type: "SET_CONNECTED_PLATFORMS", payload: connected });
    } catch (error) {
      dispatch({ type: "SET_CONNECTED_PLATFORMS", payload: [] });
    }
  }, []);
  const fetchPostHistory = async () => {
    try {
      dispatch({ type: "SET_POST_HISTORY_LOADING", payload: true });

      const res = await API.getHistory();
      dispatch({
        type: "SET_POST_HISTORY",
        payload: res?.data?.data || [],
      });
    } catch (err) {
      dispatch({ type: "SET_POST_HISTORY", payload: [] });
    } finally {
      dispatch({ type: "SET_POST_HISTORY_LOADING", payload: false });
    }
  };

  useEffect(() => {
    if (state.user?.id) {
      checkConnectedPlatforms();
      fetchPostHistory();
      fetchAnalytics();
      fetchExchangeRates();
    }
  }, [state.user?.id]);

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      processing,
      setProcessing,
      generationAmounts,
      setGenerationAmounts,
      checkConnectedPlatforms,
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
      fetchAnalytics,
      fetchPostHistory,
      initUser,
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
  const [cost, setCost] = useState(0);
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
    checkConnectedPlatforms,
    fetchAnalytics,
    fetchPostHistory,
    initUser,
  } = context;

  const setUnreadCount = useCallback(
    (count: number) => {
      dispatch({ type: "SET_UNREAD_COUNT", payload: count });
    },
    [dispatch]
  );

  const handleConnectPlatform = useCallback(
    async (platform: Platform) => {
      let authWindow: Window | null = null;

      try {
        // Mark platform as connecting
        dispatch({
          type: "SET_CONNECTING_PLATFORMS",
          payload: [...state.connectingPlatforms, platform],
        });

        // Start OAuth flow
        const result: any = await oauthManagerClient.startOAuthFlow(platform);
        const authUrl = result?.data?.data?.authUrl;
        if (!authUrl) throw new Error("No auth URL returned from server");

        authWindow = window.open(
          authUrl,
          `${platform}_oauth`,
          "width=600,height=700,scrollbars=yes,resizable=yes"
        );
        if (!authWindow) throw new Error("OAuth popup blocked by browser");

        const messageListener = (event: MessageEvent) => {
          if (!event.data?.type || event.data.provider !== platform) return;

          console.log("OAuth message received:", event.data);

          switch (event.data.type) {
            case "oauth_success":
              authWindow?.close();
              break;

            case "oauth_error":
              authWindow?.close();
              break;

            case "oauth_cancelled":
              authWindow?.close();
              break;
          }

          window.removeEventListener("message", messageListener);
        };

        window.addEventListener("message", messageListener);

        const checkClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener("message", messageListener);
            checkConnectedPlatforms();
          }
        }, 800);
      } catch (error: any) {
        checkConnectedPlatforms();
      } finally {
        dispatch({
          type: "SET_CONNECTING_PLATFORMS",
          payload: state.connectingPlatforms.filter((p) => p !== platform),
        });
      }
    },
    [state.connectingPlatforms, checkConnectedPlatforms]
  );

  const handleDisconnectPlatform = useCallback(
    async (platform: Platform) => {
      try {
        await oauthManagerClient.disconnectPlatform(platform);
        checkConnectedPlatforms();
      } catch (error) {
        console.error("Failed to disconnect:", error);
      }
    },
    [checkConnectedPlatforms]
  );

  return {
    state: state,
    security_question: state.security_question,
    user: state.user,
    balance: state.balance,
    profile: state.selectedProfile,
    campaign: state.selectedCampaign,
    loader: state.loader,
    addons: state.addons,
    packages: state.packages,
    unreadCount: state.unreadCount,
    setUnreadCount,
    initUser: initUser,
    dispatch: dispatch,
    fetchUnreadCount,
    paymentProcessing: processing,
    setProcessing: setProcessing,
    cost,
    setCost,
    generationAmounts: generationAmounts,
    fetchPostHistory: fetchPostHistory,
    refreshUser,
    refreshBalance: fetchBalance,
    selectCampaign,
    logout,
    setProfileEditing,
    setPasswordEditing,
    fetchAnalytics,
    connectedPlatforms: state.connectedPlatforms,
    connectingPlatforms: state.connectingPlatforms,
    checkConnectedPlatforms: checkConnectedPlatforms,
    handleConnectPlatform: handleConnectPlatform,
    handleDisconnectPlatform: handleDisconnectPlatform,
  };
};
