import axios from "axios";
import { GeneratedPost, Platform } from "../types";
import API from "../services/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Enhanced Social Media API Service
export class SocialMediaAPI {
  private static instance: SocialMediaAPI;

  static getInstance(): SocialMediaAPI {
    if (!SocialMediaAPI.instance) {
      SocialMediaAPI.instance = new SocialMediaAPI();
    }
    return SocialMediaAPI.instance;
  }

  // OAuth Management
  async initiateOAuth(platform: Platform, userId: string): Promise<string> {
    try {
      const response = await axios.get(`${API_BASE}/oauth/${platform}`, {
        params: { user_id: userId },
      });

      // The server will redirect to the OAuth provider
      return response.config.url || "";
    } catch (error: any) {
      throw new Error(
        `Failed to initiate OAuth for ${platform}: ${error.message}`
      );
    }
  }

  async handleOAuthCallback(
    platform: Platform,
    code: string,
    redirectUri: string
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${API_BASE}/oauth/${platform}/callback`,
        {
          code,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        `OAuth callback failed for ${platform}: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  }

  async validateToken(
    platform: Platform,
    accessToken: string
  ): Promise<boolean> {
    try {
      const response = await axios.get(
        `${API_BASE}/oauth/${platform}/validate`,
        {
          params: { access_token: accessToken },
        }
      );

      return response.data.valid;
    } catch (error) {
      return false;
    }
  }

  async refreshToken(platform: Platform, refreshToken: string): Promise<any> {
    try {
      const response = await axios.post(
        `${API_BASE}/oauth/${platform}/refresh`,
        {
          refresh_token: refreshToken,
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Token refresh failed for ${platform}: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  }

  // Platform-specific posting methods

  // LinkedIn
  async postToLinkedIn(accessToken: string, post: GeneratedPost): Promise<any> {
    try {
      const response = await API.linkedinPost({
        accessToken,
        post,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `LinkedIn post failed: ${error.response?.data?.error || error.message}`
      );
    }
  }

  async getLinkedInProfile(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE}/linkedin/me`, {
        params: { access_token: accessToken },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to get LinkedIn profile: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  }

  // Facebook
  async postToFacebook(
    accessToken: string,
    post: GeneratedPost,
    pageId?: string
  ): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE}/facebook/post`, {
        accessToken,
        post,
        pageId,
      });

      return response.data;
    } catch (error: any) {
      const errorData = error.response?.data;

      // Handle specific Facebook errors with user-friendly messages
      if (errorData?.platform === "facebook") {
        const fbError = new Error(errorData.error || "Facebook post failed");
        (fbError as any).code = error.response?.status;
        (fbError as any).retryable = errorData.retryable || false;
        (fbError as any).platform = "facebook";
        (fbError as any).details = errorData.details;
        throw fbError;
      }

      throw new Error(
        `Facebook post failed: ${error.response?.data?.error || error.message}`
      );
    }
  }

  async getFacebookPages(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE}/facebook/pages`, {
        params: { access_token: accessToken },
      });

      return response.data.pages || [];
    } catch (error: any) {
      throw new Error(
        `Failed to get Facebook pages: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  }

  async getFacebookProfile(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE}/facebook/me`, {
        params: { access_token: accessToken },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to get Facebook profile: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  }

  // Instagram
  async postToInstagram(
    accessToken: string,
    post: GeneratedPost,
    businessAccountId: string,
    pageAccessToken?: string
  ): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE}/instagram/post`, {
        accessToken,
        post,
        businessAccountId,
        pageAccessToken,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Instagram post failed: ${error.response?.data?.error || error.message}`
      );
    }
  }

  async postToInstagramCarousel(
    accessToken: string,
    post: GeneratedPost,
    businessAccountId: string,
    images: string[],
    pageAccessToken?: string
  ): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE}/instagram/carousel`, {
        accessToken,
        post,
        businessAccountId,
        images,
        pageAccessToken,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Instagram carousel post failed: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  }

  async getInstagramBusinessAccounts(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${API_BASE}/instagram/business-accounts`,
        {
          params: { access_token: accessToken },
        }
      );

      return response.data.accounts || [];
    } catch (error: any) {
      throw new Error(
        `Failed to get Instagram business accounts: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  }

  // Twitter
  async postToTwitter(accessToken: string, post: GeneratedPost): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE}/twitter/post`, {
        accessToken,
        post,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Twitter post failed: ${error.response?.data?.error || error.message}`
      );
    }
  }

  async postToTwitterThread(
    accessToken: string,
    posts: GeneratedPost[]
  ): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE}/twitter/thread`, {
        accessToken,
        posts,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Twitter thread failed: ${error.response?.data?.error || error.message}`
      );
    }
  }

  async getTwitterProfile(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE}/twitter/me`, {
        params: { access_token: accessToken },
      });

      return response.data.user;
    } catch (error: any) {
      throw new Error(
        `Failed to get Twitter profile: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  }

  // TikTok
  async postToTikTok(
    accessToken: string,
    post: GeneratedPost,
    videoUrl: string
  ): Promise<any> {
    try {
      // Step 1: Initialize upload
      const initResponse = await axios.post(`${API_BASE}/tiktok/upload-init`, {
        accessToken,
        post,
      });

      const { uploadUrl, publishId } = initResponse.data;

      // Step 2: Upload video
      await axios.post(`${API_BASE}/tiktok/upload-video`, {
        uploadUrl,
        videoUrl,
      });

      // Step 3: Complete upload
      const completeResponse = await axios.post(
        `${API_BASE}/tiktok/complete-upload`,
        {
          accessToken,
          publishId,
        }
      );

      return completeResponse.data;
    } catch (error: any) {
      throw new Error(
        `TikTok post failed: ${error.response?.data?.error || error.message}`
      );
    }
  }

  async getTikTokProfile(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE}/tiktok/me`, {
        params: { access_token: accessToken },
      });

      return response.data.user;
    } catch (error: any) {
      throw new Error(
        `Failed to get TikTok profile: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  }

  async getTikTokPublishStatus(
    accessToken: string,
    publishId: string
  ): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE}/tiktok/publish-status`, {
        params: { access_token: accessToken, publish_id: publishId },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to get TikTok publish status: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  }

  // YouTube
  async postToYouTube(
    accessToken: string,
    post: GeneratedPost,
    videoUrl: string,
    channelId?: string
  ): Promise<any> {
    try {
      // Use the simplified YouTube post endpoint (like LinkedIn)
      const response = await axios.post(`${API_BASE}/youtube/post`, {
        accessToken,
        post,
        videoUrl,
      });

      return response.data;
    } catch (error: any) {
      const errorData = error.response?.data;

      // Handle specific YouTube errors with user-friendly messages
      if (errorData?.platform === "youtube") {
        const ytError = new Error(errorData.error || "YouTube post failed");
        (ytError as any).code = error.response?.status;
        (ytError as any).retryable = errorData.retryable || false;
        (ytError as any).platform = "youtube";
        (ytError as any).details = errorData.details;
        throw ytError;
      }

      throw new Error(
        `YouTube post failed: ${error.response?.data?.error || error.message}`
      );
    }
  }

  async getYouTubeChannels(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE}/youtube/channels`, {
        params: { access_token: accessToken },
      });

      return response.data.channels || [];
    } catch (error: any) {
      throw new Error(
        `Failed to get YouTube channels: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  }

  async getYouTubeProfile(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE}/youtube/me`, {
        params: { access_token: accessToken },
      });

      return response.data.user;
    } catch (error: any) {
      throw new Error(
        `Failed to get YouTube profile: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  }

  async getYouTubeVideoStatus(
    accessToken: string,
    videoId: string
  ): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE}/youtube/video-status`, {
        params: { access_token: accessToken, video_id: videoId },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to get YouTube video status: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  }

  // YouTube upload methods for consistency with TikTok pattern
  async initializeYouTubeUpload(
    accessToken: string,
    post: GeneratedPost
  ): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE}/youtube/upload-init`, {
        accessToken,
        post,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to initialize YouTube upload: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  }

  async uploadYouTubeVideo(
    accessToken: string,
    uploadUrl: string,
    videoUrl: string
  ): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE}/youtube/upload-video`, {
        accessToken,
        uploadUrl,
        videoUrl,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to upload YouTube video: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  }

  async updateYouTubeVideo(
    accessToken: string,
    videoId: string,
    metadata: any
  ): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE}/youtube/update-video`, {
        accessToken,
        videoId,
        ...metadata,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to update YouTube video: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  }

  // Universal posting method
  async postToAllPlatforms(
    userId: string,
    posts: GeneratedPost[],
    accessTokens: Record<Platform, string>,
    onProgress?: (
      platform: Platform,
      status: "pending" | "success" | "error"
    ) => void
  ): Promise<Record<Platform, any>> {
    const results: Record<Platform, any> = {} as Record<Platform, any>;

    for (const post of posts) {
      const platform = post.platform;
      const accessToken = accessTokens[platform];

      if (!accessToken) {
        results[platform] = {
          success: false,
          error: `No access token for ${platform}`,
        };
        onProgress?.(platform, "error");
        continue;
      }

      try {
        onProgress?.(platform, "pending");

        let result;
        switch (platform) {
          case "linkedin":
            result = await this.postToLinkedIn(accessToken, post);
            break;
          case "facebook":
            result = await this.postToFacebook(accessToken, post);
            break;
          case "instagram":
            // Need to get business account first
            const accounts = await this.getInstagramBusinessAccounts(
              accessToken
            );
            if (accounts.length === 0) {
              throw new Error("No Instagram business accounts found");
            }
            result = await this.postToInstagram(
              accessToken,
              post,
              accounts[0].id,
              accounts[0].page_access_token
            );
            break;
          case "twitter":
            result = await this.postToTwitter(accessToken, post);
            break;
          case "tiktok":
            if (!post.imageUrl) {
              throw new Error("TikTok requires a video file");
            }
            result = await this.postToTikTok(accessToken, post, post.imageUrl);
            break;
          case "youtube":
            if (!post.imageUrl) {
              throw new Error("YouTube requires a video file");
            }
            result = await this.postToYouTube(accessToken, post, post.imageUrl);
            break;
          default:
            throw new Error(`Unsupported platform: ${platform}`);
        }

        results[platform] = {
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
        };
        onProgress?.(platform, "success");
      } catch (error: any) {
        console.error(`Failed to post to ${platform}:`, error);
        results[platform] = {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        };
        onProgress?.(platform, "error");
      }
    }

    return results;
  }

  // Get user profiles from all connected platforms
  async getAllProfiles(
    accessTokens: Record<Platform, string>
  ): Promise<Record<Platform, any>> {
    const profiles: Record<Platform, any> = {} as Record<Platform, any>;

    for (const [platform, accessToken] of Object.entries(accessTokens)) {
      if (!accessToken) continue;

      try {
        let profile;
        switch (platform as Platform) {
          case "linkedin":
            profile = await this.getLinkedInProfile(accessToken);
            break;
          case "facebook":
            profile = await this.getFacebookProfile(accessToken);
            break;
          case "twitter":
            profile = await this.getTwitterProfile(accessToken);
            break;
          case "tiktok":
            profile = await this.getTikTokProfile(accessToken);
            break;
          case "youtube":
            profile = await this.getYouTubeProfile(accessToken);
            break;
        }

        if (profile) {
          profiles[platform as Platform] = profile;
        }
      } catch (error) {
        console.warn(`Failed to get ${platform} profile:`, error);
      }
    }

    return profiles;
  }
}

// Export singleton instance
export const socialMediaAPI = SocialMediaAPI.getInstance();
