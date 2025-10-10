import { ProfileInfo } from '../types';

export interface PlanLimits {
  textualPosts: number;
  imageGenerations: number;
  platforms: number;
  hasAutoScheduling: boolean;
  hasAnalytics: boolean;
  hasAdvancedAI: boolean;
  hasTeamCollaboration: boolean;
  hasCustomBranding: boolean;
  hasAPIAccess: boolean;
  hasBulkUpload: boolean;
  hasCampaignManagement: boolean;
  hasAdvancedTargeting: boolean;
  supportLevel: 'community' | 'email' | 'priority';
}

export const PLAN_FEATURES: Record<'free' | 'ipro' | 'business', PlanLimits> = {
  free: {
    textualPosts: 5,
    imageGenerations: 2,
    platforms: 1,
    hasAutoScheduling: false,
    hasAnalytics: false,
    hasAdvancedAI: false,
    hasTeamCollaboration: false,
    hasCustomBranding: false,
    hasAPIAccess: false,
    hasBulkUpload: false,
    hasCampaignManagement: false,
    hasAdvancedTargeting: false,
    supportLevel: 'community'
  },
  ipro: {
    textualPosts: 1000,
    imageGenerations: 20,
    platforms: 999, // unlimited
    hasAutoScheduling: true,
    hasAnalytics: true,
    hasAdvancedAI: true,
    hasTeamCollaboration: false,
    hasCustomBranding: false,
    hasAPIAccess: false,
    hasBulkUpload: false,
    hasCampaignManagement: true,
    hasAdvancedTargeting: false,
    supportLevel: 'email'
  },
  business: {
    textualPosts: 999999, // unlimited
    imageGenerations: 100,
    platforms: 999, // unlimited
    hasAutoScheduling: true,
    hasAnalytics: true,
    hasAdvancedAI: true,
    hasTeamCollaboration: true,
    hasCustomBranding: true,
    hasAPIAccess: true,
    hasBulkUpload: true,
    hasCampaignManagement: true,
    hasAdvancedTargeting: true,
    supportLevel: 'priority'
  }
};

export const getPlanLimits = (profileType: 'individual' | 'business', plan?: string): PlanLimits => {
  // Business profiles always get business features regardless of plan field
  // Also check if plan is 'business' regardless of profile type
  if (profileType === 'business' || plan === 'business') {
    return PLAN_FEATURES.business;
  }

  // For individual users, use their selected plan
  const selectedPlan = (plan as 'free' | 'ipro' | 'business') || 'free';
  return PLAN_FEATURES[selectedPlan];
};

export const isFeatureAvailable = (
  profileType: 'individual' | 'business', 
  plan: string | undefined, 
  feature: keyof PlanLimits
): boolean => {
  // Business accounts or business plan always have all features
  if (profileType === 'business' || plan === 'business') {
    return true;
  }
  
  const limits = getPlanLimits(profileType, plan);
  return Boolean(limits[feature]);
};

export const getUsageLimits = (
  profileType: 'individual' | 'business', 
  plan: string | undefined
): { textualPosts: number; imageGenerations: number; platforms: number } => {
  const limits = getPlanLimits(profileType, plan);
  return {
    textualPosts: limits.textualPosts,
    imageGenerations: limits.imageGenerations,
    platforms: limits.platforms
  };
};

export const getRestrictedFeatures = (
  profileType: 'individual' | 'business', 
  plan: string | undefined
): string[] => {
  if (profileType === 'business' || plan === 'business') {
    return []; // Business profiles/plans have all features
  }

  const limits = getPlanLimits(profileType, plan);
  const restrictedFeatures: string[] = [];

  if (!limits.hasAutoScheduling) restrictedFeatures.push('Auto Scheduling');
  if (!limits.hasAnalytics) restrictedFeatures.push('Analytics');
  if (!limits.hasAdvancedAI) restrictedFeatures.push('Advanced AI Models');
  if (!limits.hasTeamCollaboration) restrictedFeatures.push('Team Collaboration');
  if (!limits.hasCustomBranding) restrictedFeatures.push('Custom Branding');
  if (!limits.hasAPIAccess) restrictedFeatures.push('API Access');
  if (!limits.hasBulkUpload) restrictedFeatures.push('Bulk Upload');
  if (!limits.hasCampaignManagement) restrictedFeatures.push('Advanced Campaign Management');
  if (!limits.hasAdvancedTargeting) restrictedFeatures.push('Advanced Targeting');

  return restrictedFeatures;
};

export const shouldShowUpgradePrompt = (
  profileType: 'individual' | 'business', 
  plan: string | undefined, 
  feature: keyof PlanLimits
): boolean => {
  return profileType === 'individual' && !isFeatureAvailable(profileType, plan, feature);
};