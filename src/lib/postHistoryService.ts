/**
 * Post History and Gallery Service for Sprint 0.009
 * Manages post history, templates, and content reusability
 */

import { MediaAsset, MediaUsageContext } from './mediaAssetService';

export interface PostVersion {
  id: string;
  postId: string;
  version: number;
  content: string;
  mediaAssets: string[]; // asset IDs
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'archived';
  metadata: {
    generatedBy?: string; // AI model or user
    generationType?: 'manual' | 'ai-generated' | 'template-based' | 'reused';
    sourcePostId?: string; // if reused from another post
    templateId?: string; // if generated from template
    aiPrompt?: string;
    aiModel?: string;
    performanceData?: {
      reach?: number;
      engagement?: number;
      clicks?: number;
      impressions?: number;
      saves?: number;
      shares?: number;
    };
  };
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface PostHistoryRecord {
  id: string;
  campaignId: string;
  originalContent: string;
  currentVersion: number;
  versions: PostVersion[];
  tags: string[];
  categories: string[];
  platforms: string[];
  mediaAssets: MediaUsageContext[];
  status: 'active' | 'archived' | 'deleted';
  usage: {
    timesReused: number;
    lastReused: string;
    reusedInPosts: string[];
    templateCreated: boolean;
    templateId?: string;
  };
  performance: {
    totalReach: number;
    totalEngagement: number;
    avgEngagementRate: number;
    bestPerformingPlatform: string;
    bestPerformingVersion: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description?: string;
  campaignId: string;
  category: string;
  templateType: 'content' | 'layout' | 'campaign' | 'series';
  content: {
    text?: string;
    structure?: {
      sections: {
        type: 'text' | 'image' | 'video' | 'hashtags' | 'mention' | 'cta';
        content?: string;
        placeholder?: string;
        required: boolean;
        order: number;
      }[];
    };
    mediaPlaceholders?: {
      type: 'image' | 'video';
      aspectRatio: string;
      purpose: string;
      aiPromptSuggestion?: string;
    }[];
    variables?: {
      name: string;
      type: 'text' | 'date' | 'number' | 'list';
      defaultValue?: any;
      options?: string[]; // for list type
      required: boolean;
    }[];
  };
  platforms: string[];
  tags: string[];
  usage: {
    timesUsed: number;
    lastUsed: string;
    usedInPosts: string[];
  };
  isPublic: boolean;
  sourcePostId?: string; // if created from a post
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostGalleryItem {
  id: string;
  postHistoryId: string;
  version: number;
  thumbnail: string; // image URL for preview
  title: string;
  preview: string; // short text preview
  platforms: string[];
  mediaCount: number;
  performance: {
    reach: number;
    engagement: number;
    engagementRate: number;
  };
  tags: string[];
  categories: string[];
  createdAt: string;
  status: PostVersion['status'];
  isFavorite: boolean;
  canReuse: boolean;
}

export interface ContentAnalytics {
  topPerformingContent: PostGalleryItem[];
  contentByCategory: Record<string, number>;
  contentByPlatform: Record<string, number>;
  mediaUsage: {
    mostUsedAssets: MediaAsset[];
    mediaTypes: Record<string, number>;
  };
  reusabilityMetrics: {
    mostReusedPosts: PostGalleryItem[];
    templatesCreated: number;
    averageReuses: number;
  };
  aiGeneration: {
    totalAiGenerated: number;
    aiVsManual: { ai: number; manual: number };
    modelUsage: Record<string, number>;
  };
}

export interface ReuseRequest {
  sourcePostId: string;
  targetPlatforms: string[];
  modifications?: {
    content?: string;
    mediaAssets?: string[];
    adaptForPlatform?: boolean;
    regenerateMedia?: boolean;
  };
  reuseType: 'exact-copy' | 'platform-adapted' | 'content-variation' | 'template-based';
  aiModel?: string; // for content adaptation
}

class PostHistoryService {
  private baseUrl = '/api/posts';

  /**
   * Get post history for a campaign
   */
  async getPostHistory(
    campaignId: string,
    filters: {
      status?: PostHistoryRecord['status'];
      categories?: string[];
      platforms?: string[];
      dateRange?: { start: string; end: string };
      limit?: number;
      offset?: number;
      sortBy?: 'date' | 'performance' | 'reuses';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{ posts: PostHistoryRecord[], total: number }> {
    try {
      const params = new URLSearchParams({
        campaignId,
        ...Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [
            key,
            Array.isArray(value) ? value.join(',') : JSON.stringify(value)
          ])
        )
      });

      const response = await fetch(`${this.baseUrl}/history?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch post history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching post history:', error);
      throw error;
    }
  }

  /**
   * Get detailed post history record
   */
  async getPostDetails(postId: string): Promise<PostHistoryRecord> {
    try {
      const response = await fetch(`${this.baseUrl}/history/${postId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch post details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching post details:', error);
      throw error;
    }
  }

  /**
   * Create a new version of an existing post
   */
  async createPostVersion(
    postId: string,
    version: Omit<PostVersion, 'id' | 'postId' | 'version' | 'createdAt' | 'updatedAt'>
  ): Promise<PostVersion> {
    try {
      const response = await fetch(`${this.baseUrl}/history/${postId}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(version)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create post version');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating post version:', error);
      throw error;
    }
  }

  /**
   * Get gallery view of posts
   */
  async getPostGallery(
    campaignId: string,
    filters: {
      categories?: string[];
      platforms?: string[];
      status?: PostVersion['status'][];
      favorites?: boolean;
      canReuse?: boolean;
      sortBy?: 'date' | 'performance' | 'popularity';
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ items: PostGalleryItem[], total: number }> {
    try {
      const params = new URLSearchParams({
        campaignId,
        ...Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [
            key,
            Array.isArray(value) ? value.join(',') : String(value)
          ])
        )
      });

      const response = await fetch(`${this.baseUrl}/gallery?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch post gallery');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching post gallery:', error);
      throw error;
    }
  }

  /**
   * Reuse an existing post with modifications
   */
  async reusePost(request: ReuseRequest): Promise<PostHistoryRecord> {
    try {
      const response = await fetch(`${this.baseUrl}/reuse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reuse post');
      }

      return await response.json();
    } catch (error) {
      console.error('Error reusing post:', error);
      throw error;
    }
  }

  /**
   * Create template from existing post
   */
  async createTemplateFromPost(
    postId: string,
    templateData: Omit<ContentTemplate, 'id' | 'sourcePostId' | 'createdAt' | 'updatedAt' | 'usage'>
  ): Promise<ContentTemplate> {
    try {
      const response = await fetch(`${this.baseUrl}/history/${postId}/create-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create template');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  /**
   * Get content templates
   */
  async getContentTemplates(
    campaignId: string,
    filters: {
      category?: string;
      templateType?: ContentTemplate['templateType'];
      platforms?: string[];
      isPublic?: boolean;
      tags?: string[];
    } = {}
  ): Promise<ContentTemplate[]> {
    try {
      const params = new URLSearchParams({
        campaignId,
        ...Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [
            key,
            Array.isArray(value) ? value.join(',') : String(value)
          ])
        )
      });

      const response = await fetch(`${this.baseUrl}/templates?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch templates');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  /**
   * Use template to create new post
   */
  async createPostFromTemplate(
    templateId: string,
    variables: Record<string, any>,
    platforms: string[]
  ): Promise<PostHistoryRecord> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/${templateId}/create-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ variables, platforms })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create post from template');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating post from template:', error);
      throw error;
    }
  }

  /**
   * Search through post history
   */
  async searchPosts(
    campaignId: string,
    query: string,
    filters: {
      platforms?: string[];
      categories?: string[];
      dateRange?: { start: string; end: string };
      hasMedia?: boolean;
      status?: PostVersion['status'][];
    } = {}
  ): Promise<PostGalleryItem[]> {
    try {
      const params = new URLSearchParams({
        campaignId,
        query,
        ...Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [
            key,
            Array.isArray(value) ? value.join(',') : JSON.stringify(value)
          ])
        )
      });

      const response = await fetch(`${this.baseUrl}/search?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to search posts');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  }

  /**
   * Get content analytics and insights
   */
  async getContentAnalytics(
    campaignId: string,
    timeRange?: { start: string; end: string }
  ): Promise<ContentAnalytics> {
    try {
      const params = new URLSearchParams({ campaignId });
      if (timeRange) {
        params.append('startDate', timeRange.start);
        params.append('endDate', timeRange.end);
      }

      const response = await fetch(`${this.baseUrl}/analytics?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch content analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching content analytics:', error);
      throw error;
    }
  }

  /**
   * Mark post as favorite/unfavorite
   */
  async toggleFavorite(postId: string, isFavorite: boolean): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/history/${postId}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isFavorite })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to toggle favorite');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Archive/unarchive posts
   */
  async archivePost(postId: string, archive: boolean): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/history/${postId}/archive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ archive })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to archive post');
      }
    } catch (error) {
      console.error('Error archiving post:', error);
      throw error;
    }
  }

  /**
   * Get AI-powered content suggestions based on history
   */
  async getContentSuggestions(
    campaignId: string,
    context: {
      platforms: string[];
      category?: string;
      previousContent?: string[];
      performanceGoal?: 'engagement' | 'reach' | 'clicks';
    }
  ): Promise<{
    suggestions: {
      type: 'reuse' | 'template' | 'similar' | 'trending';
      postId?: string;
      templateId?: string;
      content: string;
      reasoning: string;
      confidence: number;
    }[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ campaignId, ...context })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get content suggestions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting content suggestions:', error);
      throw error;
    }
  }

  /**
   * Duplicate post with modifications
   */
  async duplicatePost(
    postId: string,
    modifications: {
      content?: string;
      platforms?: string[];
      mediaAssets?: string[];
      tags?: string[];
    } = {}
  ): Promise<PostHistoryRecord> {
    try {
      const response = await fetch(`${this.baseUrl}/history/${postId}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(modifications)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to duplicate post');
      }

      return await response.json();
    } catch (error) {
      console.error('Error duplicating post:', error);
      throw error;
    }
  }

  /**
   * Update post performance data
   */
  async updatePerformanceData(
    postId: string,
    version: number,
    performanceData: PostVersion['metadata']['performanceData']
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/history/${postId}/versions/${version}/performance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ performanceData })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update performance data');
      }
    } catch (error) {
      console.error('Error updating performance data:', error);
      throw error;
    }
  }
}

export const postHistoryService = new PostHistoryService();
export type { 
  PostVersion, 
  PostHistoryRecord, 
  ContentTemplate, 
  PostGalleryItem, 
  ContentAnalytics, 
  ReuseRequest 
};
