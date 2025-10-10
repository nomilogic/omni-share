// Using API calls instead of Supabase client
import API from "../services/api";
import { CampaignInfo, PostContent, GeneratedPost } from "../types";
import { apiRequest } from "./api";

// Campaign operations
export async function saveCampaign(campaignInfo: CampaignInfo, userId: string) {
  console.log("saveCampaign called with:", { campaignInfo, userId });

  const token = localStorage.getItem("auth_token");
  console.log("Auth token exists:", !!token);

  const requestBody = {
    ...campaignInfo,
    userId: userId,
  };
  console.log("Request body:", requestBody);

  try {
    const response = await fetch("/api/campaigns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const error = await response.json();
      console.error("Error saving campaign:", error);
      throw new Error(
        error.error || error.message || "Failed to save campaign"
      );
    }

    const result = await response.json();
    console.log("Campaign save result:", result);
    return result.data;
  } catch (error) {
    console.error("Network or parsing error in saveCampaign:", error);
    throw error;
  }
}

export const getCampaigns = async (userId: string) => {
  try {
    console.log("Fetching campaigns for userId:", userId);
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`/api/campaigns?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();

    console.log("Campaigns API response:", response.status, result);

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch campaigns");
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
  }
};

export const getCampaignById = async (campaignId: string, userId: string) => {
  try {
    console.log("Fetching campaign by ID:", campaignId, "for userId:", userId);
    const token = localStorage.getItem("auth_token");
    const response = await fetch(
      `/api/campaigns/${campaignId}?userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const result = await response.json();

    console.log("Campaign API response:", response.status, result);

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch campaign");
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching campaign by ID:", error);
    throw error;
  }
};

export async function updateCampaign(
  campaignId: string,
  updates: Partial<CampaignInfo>,
  userId: string
) {
  const token = localStorage.getItem("auth_token");
  const response = await fetch(`/api/campaigns/${campaignId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...updates,
      userId: userId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Error updating campaign:", error);
    throw new Error(error.message || "Failed to update campaign");
  }

  const result = await response.json();
  return result.data;
}

export async function deleteCampaign(campaignId: string, userId: string) {
  const token = localStorage.getItem("auth_token");
  const response = await fetch(
    `/api/campaigns/${campaignId}?userId=${userId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Error deleting campaign:", error);
    throw new Error(error.message || "Failed to delete campaign");
  }
}

// Post operations
export async function savePost(
  campaignId: string,
  contentData: PostContent,
  generatedPosts: GeneratedPost[],
  userId: string
) {
  try {
    const response = await apiRequest("/posts", {
      method: "POST",
      body: JSON.stringify({
        campaignId,
        prompt: contentData.prompt,
        tags: contentData.tags,
        generatedContent: generatedPosts,
        userId,
        created_at: new Date().toISOString(),
      }),
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to save post");
    }

    return response.data.data;
  } catch (error) {
    console.error("Error saving post:", error);
    throw error;
  }
}

export async function getPosts(userId: string, campaignId?: string) {
  try {
    const params = new URLSearchParams({ userId });
    if (campaignId) params.append("campaignId", campaignId);

    const response = await apiRequest(`/posts?${params.toString()}`);

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to fetch posts");
    }

    return response.data.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
}

export async function deletePost(postId: string, userId: string) {
  try {
    const response = await apiRequest(`/posts/${postId}?userId=${userId}`, {
      method: "DELETE",
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to delete post");
    }

    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

// Media upload (JWT authenticated - userId extracted from token)
export async function uploadMedia(file: File, userId?: string) {
  console.log("📤 Starting media upload:", {
    fileName: file.name,
    size: file.size,
    type: file.type,
    userId,
  });

  const formData = new FormData();
  formData.append("file", file);

  const response = await API.uploadMedia(formData);

  const result = response.data;

  return result.data.fileUrl;
}

// Authentication helpers
export async function getCurrentUser() {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    console.log("🔑 No auth token found");
    return null;
  }

  try {
    console.log("🔑 Fetching current user with JWT token");
    const response = await API.getUser();

    const responseData = await response.data.data;

    return {
      user: responseData,
      session: { access_token: token },
      error: null,
    };
  } catch (error) {
    console.error("❌ Error fetching current user:", error);
    localStorage.removeItem("auth_token");
    return null;
  }
}

export async function signInAnonymously() {
  try {
    // Import auth service for authentication operations
    const { authService } = await import("./auth");
    return await authService.signInAnonymously();
  } catch (error) {
    console.error("Error in signInAnonymously:", error);
    throw error;
  }
}
