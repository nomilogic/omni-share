export interface ProfileInfo {
  type: 'individual' | 'business';
  name: string;
  website: string;
  industry: string;
  description: string;
  targetAudience: string;
  brandTone: 'professional' | 'playful' | 'motivational' | 'casual' | 'authoritative';
  goals: string[];
  platforms: Platform[];
  plan?: 'free' | 'ipro' | 'business';
}

// CampaignInfo (renamed from CampaignInfo with additional campaign fields)
export interface CampaignInfo {
  name: string;
  website?: string;
  industry?: string;
  description?: string;
  targetAudience?: string;
  brandTone?: 'professional' | 'playful' | 'motivational' | 'casual' | 'authoritative';
  goals?: string[];
  platforms: Platform[];
  // Additional campaign-specific fields
  objective?: 'awareness' | 'engagement' | 'conversions' | 'leads' | 'sales' | 'brand_building';
  startDate?: string;
  endDate?: string;
  budget?: number;
  status?: 'active' | 'paused' | 'completed' | 'draft';
  keywords?: string[];
  hashtags?: string[];
  totalPosts?: number;
  publishedPosts?: number;
  scheduledPosts?: number;
}

export interface PostContent {
  prompt: string;
  media?: File;
  mediaUrl?: string;
  tags: string[];
  campaignId?: string;
  selectedPlatforms?: Platform[];
  imageAnalysis?: string;
  thumbnailUrl?: string; // For video thumbnails
  // Optional TikTok-specific fields carried forward into generation/publish pipeline
  tiktokVideoDurationSec?: number;
}

export interface GeneratedPost {
  platform: Platform;
  caption: string;
  hashtags: string[];
  emojis: string;
  characterCount: number;
  engagement: 'high' | 'medium' | 'low';
  imageUrl?: string;
  pageId?: string; // For Facebook/Instagram pages
  mediaUrl?: string; // URL of uploaded media
  generationPrompt?: string; // Individual prompt for each platform
  thumbnailUrl?: string; // For video thumbnails
  // TikTok Direct Post specific (optional for other platforms)
  tiktokTitle?: string;
  tiktokPrivacyLevel?: string;
  tiktokAllowComment?: boolean;
  tiktokAllowDuet?: boolean;
  tiktokAllowStitch?: boolean;
  tiktokIsCommercial?: boolean;
  tiktokIsYourBrand?: boolean;
  tiktokIsBrandedContent?: boolean;
  tiktokVideoDurationSec?: number;
}

export type Platform = 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube';

export interface Campaign {
  id?: string;
  profileId: string;
  name: string;
  description?: string;
  objective?: 'awareness' | 'engagement' | 'conversions' | 'leads' | 'sales' | 'brand_building';
  startDate?: string;
  endDate?: string;
  targetAudience?: string;
  platforms: Platform[];
  budget?: number;
  status: 'active' | 'paused' | 'completed' | 'draft';
  brandVoice?: string;
  keywords?: string[];
  hashtags?: string[];
  totalPosts?: number;
  publishedPosts?: number;
  scheduledPosts?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StepData {
  campaign?: CampaignInfo;
  profile?: ProfileInfo;
  campaignId?: string;
  profileId?: string;
  content?: PostContent;
  generatedPosts?: GeneratedPost[];
  contentId?: string;
  userId?: string;
}

export type Step = 'auth' | 'campaign' | 'content' | 'generate' | 'preview' | 'publish';

export interface PublishResult {
  success: boolean;
  message: string;
  postId?: string;
  timestamp: string;
  error?: string;
}

export interface PlatformCredentials {
  facebook?: { pageId: string; accessToken: string };
  instagram?: { businessAccountId: string; accessToken: string };
  linkedin?: { organizationId: string; accessToken: string };
  twitter?: { accessToken: string };
  tiktok?: { accessToken: string };
  youtube?: { accessToken: string; videoPath: string };
}