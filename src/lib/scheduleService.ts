interface ScheduleRequest {
  prompt: string;
  category?: string;
  platforms: string[];
  timePreference?: 'morning' | 'afternoon' | 'evening' | 'custom';
  customTime?: string;
  keywords?: string[];
  campaignId: string;
  preferredModel?: string;
}

interface GeneratedSchedule {
  id: string;
  date: string;
  time: string;
  content: string;
  imagePrompt?: string;
  platform: string[];
  category: string;
  isLive?: boolean;
  reasoning?: string;
  campaignId: string;
}

interface ScheduledPost {
  id: string;
  date: string;
  time: string;
  content: string;
  imageUrl?: string;
  platform: string[];
  status: 'scheduled' | 'draft' | 'published' | 'failed';
  isLive?: boolean;
  category?: string;
  campaignId: string;
  createdAt: string;
  updatedAt: string;
}

class ScheduleService {
  private baseUrl = '/api';

  /**
   * Generate AI-powered posting schedule with image generation
   */
  async generateSchedule(request: ScheduleRequest): Promise<GeneratedSchedule[]> {
    try {
      console.log('Generating AI schedule with request:', request);
      
      const response = await fetch(`${this.baseUrl}/schedule/ai/generate-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Schedule generation failed:', errorData);
        throw new Error(errorData.error || 'Failed to generate schedule');
      }

      const schedule = await response.json();
      console.log('Generated schedule:', schedule);
      
      // Process schedule items and generate images for those with prompts
      const enhancedSchedule = await Promise.all(
        schedule.map(async (item: GeneratedSchedule, index: number) => {
          try {
            // Generate image if prompt is provided and platform supports images
            if (item.imagePrompt && this.shouldGenerateImage(item.platform)) {
              console.log(`Generating image for post ${index + 1}:`, item.imagePrompt);
              
              const imageUrl = await this.generateImageForPost(item.imagePrompt, item.platform);
              return { ...item, imageUrl };
            }
            return item;
          } catch (imageError) {
            console.warn(`Failed to generate image for post ${index + 1}:`, imageError);
            return item; // Return post without image if generation fails
          }
        })
      );
      
      return enhancedSchedule;
    } catch (error) {
      console.error('Error generating schedule:', error);
      throw error;
    }
  }

  /**
   * Save generated schedule to database
   */
  async saveSchedule(schedule: GeneratedSchedule[]): Promise<ScheduledPost[]> {
    try {
      const response = await fetch(`${this.baseUrl}/schedule/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ schedule })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save schedule');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving schedule:', error);
      throw error;
    }
  }

  /**
   * Get all scheduled posts for a campaign
   */
  async getScheduledPosts(campaignId: string, startDate?: string, endDate?: string): Promise<ScheduledPost[]> {
    try {
      const params = new URLSearchParams({
        campaignId
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`${this.baseUrl}/schedule/posts?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch scheduled posts');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      throw error;
    }
  }

  /**
   * Update a scheduled post
   */
  async updateScheduledPost(postId: string, updates: Partial<ScheduledPost>): Promise<ScheduledPost> {
    try {
      const response = await fetch(`${this.baseUrl}/schedule/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update scheduled post');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating scheduled post:', error);
      throw error;
    }
  }

  /**
   * Delete a scheduled post
   */
  async deleteScheduledPost(postId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/schedule/posts/${postId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete scheduled post');
      }
    } catch (error) {
      console.error('Error deleting scheduled post:', error);
      throw error;
    }
  }

  /**
   * Create a new scheduled post
   */
  async createScheduledPost(post: Omit<ScheduledPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScheduledPost> {
    try {
      const response = await fetch(`${this.baseUrl}/schedule/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(post)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create scheduled post');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating scheduled post:', error);
      throw error;
    }
  }

  /**
   * Get posts scheduled for a specific date
   */
  async getPostsForDate(campaignId: string, date: string): Promise<ScheduledPost[]> {
    try {
      const response = await fetch(`${this.baseUrl}/schedule/posts/date?campaignId=${campaignId}&date=${date}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch posts for date');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching posts for date:', error);
      throw error;
    }
  }

  /**
   * Enable/disable live content generation for specific posts
   */
  async toggleLiveContent(postId: string, isLive: boolean): Promise<ScheduledPost> {
    try {
      const response = await fetch(`${this.baseUrl}/schedule/posts/${postId}/live`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isLive })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle live content');
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling live content:', error);
      throw error;
    }
  }

  /**
   * Generate live content for a specific date
   */
  async generateLiveContent(campaignId: string, date: string, category?: string): Promise<GeneratedSchedule[]> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/generate-live-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campaignId,
          date,
          category
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate live content');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating live content:', error);
      throw error;
    }
  }

  /**
   * Publish a scheduled post immediately
   */
  async publishNow(postId: string): Promise<{ success: boolean; publishedUrls: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/schedule/posts/${postId}/publish`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish post');
      }

      return await response.json();
    } catch (error) {
      console.error('Error publishing post:', error);
      throw error;
    }
  }

  /**
   * Get scheduling analytics
   */
  async getSchedulingAnalytics(campaignId: string, period: 'week' | 'month' | 'quarter' = 'month'): Promise<{
    totalScheduled: number;
    totalPublished: number;
    totalFailed: number;
    postsByPlatform: Record<string, number>;
    postsByCategory: Record<string, number>;
    upcomingPosts: ScheduledPost[];
    recentActivity: ScheduledPost[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/schedule/analytics?campaignId=${campaignId}&period=${period}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  /**
   * Check if image should be generated for given platforms
   */
  private shouldGenerateImage(platforms: string[]): boolean {
    // Visual platforms that benefit from images
    const visualPlatforms = ['instagram', 'facebook', 'linkedin', 'twitter'];
    return platforms.some(platform => visualPlatforms.includes(platform.toLowerCase()));
  }

  /**
   * Generate image for a post using AI
   */
  private async generateImageForPost(prompt: string, platforms: string[]): Promise<string> {
    try {
      // Determine optimal aspect ratio based on platforms
      let aspectRatio = '1:1'; // Default square
      if (platforms.includes('linkedin') || platforms.includes('twitter')) {
        aspectRatio = '16:9'; // Landscape for professional platforms
      } else if (platforms.includes('instagram')) {
        aspectRatio = '1:1'; // Square for Instagram
      }

      const response = await fetch(`${this.baseUrl}/ai/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          size: this.getSizeFromAspectRatio(aspectRatio),
          quality: 'hd',
          style: 'professional'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  /**
   * Convert aspect ratio to DALL-E size format
   */
  private getSizeFromAspectRatio(aspectRatio: string): string {
    switch (aspectRatio) {
      case '1:1': return '1024x1024';
      case '16:9': return '1792x1024';
      case '9:16': return '1024x1792';
      case '4:3': return '1152x896';
      default: return '1024x1024';
    }
  }
}

// Utility functions for working with schedules
export const scheduleUtils = {
  /**
   * Parse natural language time preferences into specific times
   */
  parseTimePreference(preference: string, customTime?: string): string {
    switch (preference) {
      case 'morning':
        // Random time between 8-10 AM
        const morningHour = 8 + Math.floor(Math.random() * 2);
        const morningMinute = Math.floor(Math.random() * 60);
        return `${morningHour.toString().padStart(2, '0')}:${morningMinute.toString().padStart(2, '0')}`;
      
      case 'afternoon':
        // Random time between 1-3 PM
        const afternoonHour = 13 + Math.floor(Math.random() * 2);
        const afternoonMinute = Math.floor(Math.random() * 60);
        return `${afternoonHour.toString().padStart(2, '0')}:${afternoonMinute.toString().padStart(2, '0')}`;
      
      case 'evening':
        // Random time between 6-8 PM
        const eveningHour = 18 + Math.floor(Math.random() * 2);
        const eveningMinute = Math.floor(Math.random() * 60);
        return `${eveningHour.toString().padStart(2, '0')}:${eveningMinute.toString().padStart(2, '0')}`;
      
      case 'custom':
        return customTime || '09:00';
      
      default:
        return '09:00';
    }
  },

  /**
   * Generate dates based on schedule pattern
   */
  generateDatePattern(prompt: string, startDate: Date = new Date()): Date[] {
    const dates: Date[] = [];
    const promptLower = prompt.toLowerCase();

    // Parse common patterns
    if (promptLower.includes('daily')) {
      const days = this.extractDuration(prompt, 14); // Default 14 days
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
      }
    } else if (promptLower.includes('weekly')) {
      const weeks = this.extractDuration(prompt, 4); // Default 4 weeks
      for (let i = 0; i < weeks; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + (i * 7));
        dates.push(date);
      }
    } else if (promptLower.includes('every friday') || promptLower.includes('fridays')) {
      const endDate = this.extractEndDate(prompt);
      let current = new Date(startDate);
      
      // Find next Friday
      while (current.getDay() !== 5) {
        current.setDate(current.getDate() + 1);
      }
      
      while (current <= endDate) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 7);
      }
    }
    // Add more pattern matching as needed

    return dates;
  },

  /**
   * Extract duration from prompt (e.g., "2 weeks", "10 days")
   */
  extractDuration(prompt: string, defaultValue: number): number {
    const matches = prompt.match(/(\d+)\s*(day|week|month)s?/i);
    if (matches) {
      const number = parseInt(matches[1]);
      const unit = matches[2].toLowerCase();
      
      switch (unit) {
        case 'day': return number;
        case 'week': return number * 7;
        case 'month': return number * 30;
        default: return number;
      }
    }
    return defaultValue;
  },

  /**
   * Extract end date from prompt (e.g., "until November 10th")
   */
  extractEndDate(prompt: string): Date {
    const monthRegex = /until\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})/i;
    const match = prompt.match(monthRegex);
    
    if (match) {
      const monthName = match[1].toLowerCase();
      const day = parseInt(match[2]);
      const year = new Date().getFullYear();
      
      const monthIndex = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ].indexOf(monthName);
      
      return new Date(year, monthIndex, day);
    }
    
    // Default to 30 days from now
    const defaultEnd = new Date();
    defaultEnd.setDate(defaultEnd.getDate() + 30);
    return defaultEnd;
  },

  /**
   * Format date for API calls
   */
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  },

  /**
   * Format time for display
   */
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  }
};

export const scheduleService = new ScheduleService();
export type { ScheduleRequest, GeneratedSchedule, ScheduledPost };
