/**
 * Media Asset Management Service for Sprint 0.009
 * Handles images, videos, and their usage across posts
 */

import API from "../services/api";

export interface MediaAsset {
  id: string;
  type: "image" | "video" | "audio";
  url: string;
  thumbnailUrl?: string;
  filename: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // for videos/audio in seconds
  format: string; // jpg, png, mp4, etc.
  createdAt: string;
  uploadedBy: string;
  campaignId: string;
  tags: string[];
  metadata: {
    altText?: string;
    caption?: string;
    source?: "generated" | "uploaded" | "stock";
    generationPrompt?: string; // if AI generated
    aiModel?: string; // which model generated it
    aspectRatio?: string;
    colorPalette?: string[];
  };
  usage: {
    totalUsed: number;
    lastUsed: string;
    usedInPosts: string[]; // post IDs
    usageType: (
      | "post-content"
      | "reference-only"
      | "background"
      | "thumbnail"
    )[];
  };
  collections: string[]; // custom collections/folders
  isPublic: boolean;
  status: "processing" | "ready" | "failed" | "archived";
}

export interface MediaCollection {
  id: string;
  name: string;
  description?: string;
  campaignId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assetIds: string[];
  isPublic: boolean;
  tags: string[];
  color?: string; // for UI organization
}

export interface MediaUsageContext {
  postId: string;
  assetId: string;
  usageType: "post-content" | "reference-only" | "background" | "thumbnail";
  platforms: string[];
  generatedVariants?: {
    platform: string;
    variantUrl: string;
    dimensions: { width: number; height: number };
  }[];
  metadata?: {
    placement: string; // where in post
    importance: "primary" | "secondary" | "background";
    aiInstructions?: string; // how AI should use this asset
  };
}

export interface VideoGenerationRequest {
  model: string;
  prompt?: string;
  sourceImage?: string;
  duration?: number;
  aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3";
  fps?: number;
  style?: string;
  motion?: "low" | "medium" | "high";
}

export interface VideoGenerationResponse {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  status: "processing" | "completed" | "failed";
  model: string;
}

class MediaAssetService {
  private baseUrl = "/api/media";

  /**
   * Upload media file (image, video, audio)
   */
  async uploadMedia(
    file: File,
    campaignId: string,
    metadata: Partial<MediaAsset["metadata"]> = {}
  ): Promise<MediaAsset> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("campaignId", campaignId);
      formData.append("metadata", JSON.stringify(metadata));

      const response = await API.uploadMedia(formData);

      return await response.data;
    } catch (error) {
      console.error("Error uploading media:", error);
      throw error;
    }
  }

  /**
   * Generate video from text prompt or image
   */
  async generateVideo(
    request: VideoGenerationRequest
  ): Promise<VideoGenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate video");
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating video:", error);
      throw error;
    }
  }

  /**
   * Get all media assets for a campaign
   */
  async getMediaAssets(
    campaignId: string,
    filters: {
      type?: "image" | "video" | "audio";
      tags?: string[];
      collection?: string;
      source?: "generated" | "uploaded" | "stock";
      status?: MediaAsset["status"];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ assets: MediaAsset[]; total: number }> {
    try {
      const params = new URLSearchParams({
        campaignId,
        ...Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [
            key,
            Array.isArray(value) ? value.join(",") : String(value),
          ])
        ),
      });

      const response = await fetch(
        `${this.baseUrl}/assets?${params.toString()}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch media assets");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching media assets:", error);
      throw error;
    }
  }

  /**
   * Get media asset by ID
   */
  async getMediaAsset(assetId: string): Promise<MediaAsset> {
    try {
      const response = await fetch(`${this.baseUrl}/assets/${assetId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch media asset");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching media asset:", error);
      throw error;
    }
  }

  /**
   * Update media asset metadata
   */
  async updateMediaAsset(
    assetId: string,
    updates: Partial<
      Pick<MediaAsset, "tags" | "metadata" | "collections" | "isPublic">
    >
  ): Promise<MediaAsset> {
    try {
      const response = await fetch(`${this.baseUrl}/assets/${assetId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update media asset");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating media asset:", error);
      throw error;
    }
  }

  /**
   * Delete media asset
   */
  async deleteMediaAsset(assetId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/assets/${assetId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete media asset");
      }
    } catch (error) {
      console.error("Error deleting media asset:", error);
      throw error;
    }
  }

  /**
   * Create media collection
   */
  async createCollection(
    collection: Omit<MediaCollection, "id" | "createdAt" | "updatedAt">
  ): Promise<MediaCollection> {
    try {
      const response = await fetch(`${this.baseUrl}/collections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(collection),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create collection");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating collection:", error);
      throw error;
    }
  }

  /**
   * Get collections for a campaign
   */
  async getCollections(campaignId: string): Promise<MediaCollection[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/collections?campaignId=${campaignId}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch collections");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching collections:", error);
      throw error;
    }
  }

  /**
   * Add asset to collection
   */
  async addToCollection(collectionId: string, assetId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/collections/${collectionId}/assets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assetId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add asset to collection");
      }
    } catch (error) {
      console.error("Error adding asset to collection:", error);
      throw error;
    }
  }

  /**
   * Track media usage in post
   */
  async trackMediaUsage(usage: MediaUsageContext): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/usage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usage),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to track media usage");
      }
    } catch (error) {
      console.error("Error tracking media usage:", error);
      throw error;
    }
  }

  /**
   * Generate platform-specific variants of an image/video
   */
  async generatePlatformVariants(
    assetId: string,
    platforms: string[]
  ): Promise<
    {
      platform: string;
      variantUrl: string;
      dimensions: { width: number; height: number };
    }[]
  > {
    try {
      const response = await fetch(
        `${this.baseUrl}/assets/${assetId}/variants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ platforms }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate platform variants");
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating platform variants:", error);
      throw error;
    }
  }

  /**
   * Search media assets by content, tags, or metadata
   */
  async searchMediaAssets(
    campaignId: string,
    query: string,
    filters: {
      type?: "image" | "video" | "audio";
      tags?: string[];
      dateRange?: { start: string; end: string };
    } = {}
  ): Promise<MediaAsset[]> {
    try {
      const params = new URLSearchParams({
        campaignId,
        query,
        ...Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [
            key,
            Array.isArray(value) ? value.join(",") : JSON.stringify(value),
          ])
        ),
      });

      const response = await fetch(
        `${this.baseUrl}/search?${params.toString()}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to search media assets");
      }

      return await response.json();
    } catch (error) {
      console.error("Error searching media assets:", error);
      throw error;
    }
  }

  /**
   * Get media usage analytics
   */
  async getMediaAnalytics(campaignId: string): Promise<{
    totalAssets: number;
    totalUsage: number;
    topUsedAssets: MediaAsset[];
    usageByType: Record<string, number>;
    usageByPlatform: Record<string, number>;
    generatedVsUploaded: { generated: number; uploaded: number; stock: number };
    storageUsed: number; // in bytes
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/analytics?campaignId=${campaignId}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch media analytics");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching media analytics:", error);
      throw error;
    }
  }

  /**
   * Duplicate media asset with new metadata
   */
  async duplicateAsset(
    assetId: string,
    metadata: Partial<MediaAsset["metadata"]>
  ): Promise<MediaAsset> {
    try {
      const response = await fetch(
        `${this.baseUrl}/assets/${assetId}/duplicate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ metadata }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to duplicate asset");
      }

      return await response.json();
    } catch (error) {
      console.error("Error duplicating asset:", error);
      throw error;
    }
  }
}

export const mediaAssetService = new MediaAssetService();
export type {
  MediaAsset,
  MediaCollection,
  MediaUsageContext,
  VideoGenerationRequest,
  VideoGenerationResponse,
};
