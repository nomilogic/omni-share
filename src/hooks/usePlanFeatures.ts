import { useUser } from "@/store/useUser";
import { useAppContext } from "../context/AppContext";

type PlanType = "free" | "ipro" | "business";

interface PlanFeatures {
  canSchedule: boolean;
  canCreateCampaigns: boolean;
  maxPostsPerMonth: number;
  maxImageGenerations: number;
  hasAdvancedAI: boolean;
  hasAnalytics: boolean;
  hasTeamCollaboration: boolean;
  hasPrioritySupport: boolean;
  planName: string;
  planPrice: string;
}

const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  free: {
    canSchedule: false,
    canCreateCampaigns: false,
    maxPostsPerMonth: 5,
    maxImageGenerations: 0,
    hasAdvancedAI: false,
    hasAnalytics: false,
    hasTeamCollaboration: false,
    hasPrioritySupport: false,
    planName: "aiFree",
    planPrice: "Free",
  },
  ipro: {
    canSchedule: true,
    canCreateCampaigns: true,
    maxPostsPerMonth: 1000,
    maxImageGenerations: 20,
    hasAdvancedAI: true,
    hasAnalytics: true,
    hasTeamCollaboration: false,
    hasPrioritySupport: true,
    planName: "aiPRO",
    planPrice: "$39.99/month",
  },
  business: {
    canSchedule: true,
    canCreateCampaigns: true,
    maxPostsPerMonth: -1, // unlimited
    maxImageGenerations: 100,
    hasAdvancedAI: true,
    hasAnalytics: true,
    hasTeamCollaboration: true,
    hasPrioritySupport: true,
    planName: "aiBusiness",
    planPrice: "$99.99/month",
  },
};

export const usePlanFeatures = () => {
  const { state } = useAppContext();
  const { user } = useUser();

  // Check if user has a business profile/account
  const isBusinessAccount =
    state.selectedProfile?.type === "business" ||
    state.userPlan === "business" ||
    state.isBusinessAccount ||
    user?.email === "nomilogic@gmail.com";

  const currentPlan: PlanType = isBusinessAccount
    ? "business"
    : state.userPlan || "free";

  const features = PLAN_FEATURES[currentPlan];

  const canUseFeature = (requiredPlan: PlanType): boolean => {
    // Business accounts can use all features
    if (isBusinessAccount) return true;

    const planHierarchy = { free: 0, ipro: 1, business: 2 };
    return planHierarchy[currentPlan] >= planHierarchy[requiredPlan];
  };

  const getRequiredPlanForFeature = (
    feature: keyof PlanFeatures
  ): PlanType | null => {
    for (const [plan, planFeatures] of Object.entries(PLAN_FEATURES)) {
      if (planFeatures[feature]) {
        return plan as PlanType;
      }
    }
    return null;
  };

  return {
    ...features,
    currentPlan,
    canUseFeature,
    getRequiredPlanForFeature,
    isUnlimited: (value: number) => value === -1,
  };
};
