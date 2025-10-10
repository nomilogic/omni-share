import axios from "axios";
import { CampaignInfo, PostContent, GeneratedPost } from "../types";
import API from "../services/api";

// Base API configuration
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid, clear it and redirect to login
      localStorage.removeItem("auth_token");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

// Response wrapper interface
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Campaign operations
export const campaignsApi = {
  // Get all campaigns for a user
  async getAll(userId: string): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>("/campaigns", {
      params: { userId },
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to fetch campaigns");
    }

    return response.data.data || [];
  },

  // Create a new campaign
  async create(campaignInfo: CampaignInfo, userId: string): Promise<any> {
    const response = await api.post<ApiResponse>("/campaigns", {
      ...campaignInfo,
      userId,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to create campaign");
    }

    return response.data.data;
  },

  // Update an existing campaign
  async update(
    campaignId: string,
    updates: Partial<CampaignInfo>,
    userId: string
  ): Promise<any> {
    const response = await api.put<ApiResponse>(`/campaigns/${campaignId}`, {
      ...updates,
      userId,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to update campaign");
    }

    return response.data.data;
  },

  // Delete a campaign
  async delete(campaignId: string, userId: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/campaigns/${campaignId}`, {
      params: { userId },
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to delete campaign");
    }
  },
};

// Post operations
export const postsApi = {
  // Get all posts for a user (optionally filtered by campaign)
  async getAll(userId: string, campaignId?: string): Promise<any[]> {
    const params: any = { userId };
    if (campaignId) params.campaignId = campaignId;

    const response = await api.get<ApiResponse<any[]>>("/posts", { params });

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to fetch posts");
    }

    return response.data.data || [];
  },

  // Create a new post
  async create(
    campaignId: string,
    contentData: PostContent,
    generatedPosts: GeneratedPost[],
    userId: string
  ): Promise<any> {
    const response = await api.post<ApiResponse>("/posts", {
      campaignId,
      prompt: contentData.prompt,
      tags: contentData.tags,
      generatedContent: generatedPosts,
      userId,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to create post");
    }

    return response.data.data;
  },

  // Update a post
  async update(
    postId: string,
    updates: {
      prompt?: string;
      tags?: string[];
      campaignId?: string;
      generatedContent?: GeneratedPost[];
    },
    userId: string
  ): Promise<any> {
    const response = await api.put<ApiResponse>(`/posts/${postId}`, {
      ...updates,
      userId,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to update post");
    }

    return response.data.data;
  },

  // Delete a post
  async delete(postId: string, userId: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/posts/${postId}`, {
      params: { userId },
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to delete post");
    }
  },

  // Mark a post as published
  async markPublished(
    postId: string,
    publishedPlatforms: string[],
    userId: string
  ): Promise<any> {
    const response = await api.post<ApiResponse>(`/posts/${postId}/publish`, {
      publishedPlatforms,
      userId,
    });

    if (!response.data.success) {
      throw new Error(
        response.data.error || "Failed to mark post as published"
      );
    }

    return response.data.data;
  },
};

// Media operations
export const mediaApi = {
  // Upload a file
  async upload(file: File, userId: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    const response = await api.post<ApiResponse<{ url: string }>>(
      "/media/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to upload file");
    }

    return response.data.data?.url || "";
  },

  // Get all media files for a user
  async getAll(userId: string): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`/media/${userId}`);

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to fetch media files");
    }

    return response.data.data || [];
  },

  // Delete a media file
  async delete(userId: string, fileName: string): Promise<void> {
    const response = await api.delete<ApiResponse>(
      `/media/${userId}/${fileName}`,
      {
        params: { userId },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to delete media file");
    }
  },
};

// AI content generation (using existing route)
export const aiApi = {
  async generateContent(
    campaign: any,
    content: any,
    platforms: string[]
  ): Promise<any[]> {
    const payload = {
      campaign,
      content,
      platforms,
    };
    const response = await API.generateAI(payload);
    console.log("response.data.data?.posts", response.data.data?.posts);
    return response.data.data?.posts || [];
  },
};

// Export the main API object
export const apiService = {
  campaigns: campaignsApi,
  posts: postsApi,
  media: mediaApi,
  ai: aiApi,
};

// API utility functions
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  //  const baseUrl = ;
  const url =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api" + endpoint;

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// Default export for compatibility
export default { apiRequest };
