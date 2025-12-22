/**
 * Utility functions for video processing and thumbnail generation
 */

/**
 * Extracts a thumbnail image from a video file
 * @param videoFile - The video file to extract thumbnail from
 * @param seekTime - Time in seconds to extract the frame (default: 1 second)
 * @returns Promise that resolves to a blob containing the thumbnail image
 */
export const generateVideoThumbnail = async (
  videoFile: File, 
  seekTime: number = 1
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not create canvas context'));
      return;
    }

    video.preload = 'metadata';
    video.muted = true;
    video.crossOrigin = 'anonymous';
    
    video.onloadedmetadata = () => {
      // Set canvas dimensions to match video (maintain aspect ratio)
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Seek to the desired time
      video.currentTime = Math.min(seekTime, video.duration);
    };
    
    video.onseeked = () => {
      try {
        // Draw the video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create thumbnail blob'));
            }
          },
          'image/jpeg',
          0.8
        );
      } catch (error) {
        reject(error);
      }
    };
    
    video.onerror = (error) => {
      reject(new Error(`Video loading failed: ${error}`));
    };
    
    // Create object URL and load video
    const videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;
    
    // Clean up when done
    video.onended = () => {
      URL.revokeObjectURL(videoUrl);
    };
  });
};

/**
 * Checks if a file is a video file
 * @param file - File to check
 * @returns boolean indicating if file is a video
 */
export const isVideoFile = (file: File | undefined | null): boolean => {
  return file ? file.type.startsWith('video/') : false;
};

/**
 * Checks if a URL points to a video file
 * @param url - URL to check
 * @returns boolean indicating if URL is a video
 */
export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check if it's a video file - match actual video file extensions
  // Exclude data URLs and certain image generation services
  return !url.startsWith('data:') && 
         !url.includes('pollinations.ai') && 
         /\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|3gp)(\?.*)?$/i.test(url);
};

/**
 * Gets video aspect ratio
 * @param videoFile - Video file to analyze
 * @returns Promise that resolves to aspect ratio (width/height)
 */
export const getVideoAspectRatio = async (videoFile: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    
    video.preload = 'metadata';
    video.muted = true;
    
    video.onloadedmetadata = () => {
      const aspectRatio = video.videoWidth / video.videoHeight;
      URL.revokeObjectURL(video.src);
      resolve(aspectRatio);
    };
    
    video.onerror = (error) => {
      URL.revokeObjectURL(video.src);
      reject(new Error(`Video loading failed: ${error}`));
    };
    
    video.src = URL.createObjectURL(videoFile);
  });
};

/**
 * Determines if a video is in 16:9 format (or close to it)
 * @param aspectRatio - Video aspect ratio (width/height)
 * @param tolerance - Tolerance for aspect ratio matching (default: 0.1)
 * @returns boolean indicating if video is 16:9
 */
export const is16x9Video = (aspectRatio: number, tolerance: number = 0.1): boolean => {
  const target16x9 = 16 / 9; // ≈ 1.778
  return Math.abs(aspectRatio - target16x9) <= tolerance;
};

/**
 * Determines if a video is in 9:16 format (vertical/shorts)
 * @param aspectRatio - Video aspect ratio (width/height)  
 * @param tolerance - Tolerance for aspect ratio matching (default: 0.1)
 * @returns boolean indicating if video is 9:16
 */
export const is9x16Video = (aspectRatio: number, tolerance: number = 0.1): boolean => {
  const target9x16 = 9 / 16; // ≈ 0.5625
  return Math.abs(aspectRatio - target9x16) <= tolerance;
};

/**
 * Creates a video thumbnail URL from a video file
 * @param videoFile - Video file to create thumbnail for
 * @param seekTime - Time in seconds to extract the frame
 * @returns Promise that resolves to a data URL of the thumbnail
 */
export const createVideoThumbnailUrl = async (
  videoFile: File,
  seekTime: number = 1
): Promise<string> => {
  const thumbnailBlob = await generateVideoThumbnail(videoFile, seekTime);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to create thumbnail URL'));
      }
    };
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsDataURL(thumbnailBlob);
  });
};

/**
 * Video limits for different platforms and formats
 */
export interface VideoLimits {
  shortForm?: {
    aspectRatio: string;
    resolution: string;
    maxDuration: string;
    maxFileSize: string;
    notes?: string;
  };
  horizontal?: {
    aspectRatio: string;
    resolution: string;
    maxDuration: string;
    maxFileSize: string;
    notes?: string;
  };
}

export const PLATFORM_VIDEO_LIMITS: Record<string, VideoLimits> = {
  tiktok: {
    shortForm: {
      aspectRatio: "9:16",
      resolution: "1080 x 1920",
      maxDuration: "60 minutes (uploaded) / 10 min (in-app)",
      maxFileSize: "500 MB (Web) / 287 MB (iOS) / 72 MB (Android)",
      notes: "Algorithm favors content under 60 seconds"
    },
    horizontal: {
      aspectRatio: "16:9",
      resolution: "1920 x 1080",
      maxDuration: "60 minutes (horizontal support varies)",
      maxFileSize: "500 MB"
    }
  },
  youtube: {
    shortForm: {
      aspectRatio: "9:16",
      resolution: "1080 x 1920",
      maxDuration: "3 minutes (for square or taller videos)",
      maxFileSize: "10 MB (approximate)",
      notes: "Videos longer than 60 seconds must be square or vertical"
    },
    horizontal: {
      aspectRatio: "16:9",
      resolution: "1920 x 1080",
      maxDuration: "12 hours",
      maxFileSize: "256 GB"
    }
  },
  instagram: {
    shortForm: {
      aspectRatio: "9:16",
      resolution: "1080 x 1920",
      maxDuration: "3 minutes",
      maxFileSize: "4 GB"
    },
    horizontal: {
      aspectRatio: "16:9",
      resolution: "1920 x 1080",
      maxDuration: "60 minutes",
      maxFileSize: "4 GB"
    }
  },
  facebook: {
    shortForm: {
      aspectRatio: "9:16",
      resolution: "1080 x 1920",
      maxDuration: "90 seconds",
      maxFileSize: "4 GB"
    },
    horizontal: {
      aspectRatio: "16:9",
      resolution: "1920 x 1080",
      maxDuration: "4 hours (240 minutes)",
      maxFileSize: "10 GB"
    }
  },
  linkedin: {
    shortForm: {
      aspectRatio: "9:16",
      resolution: "1080 x 1920",
      maxDuration: "10 minutes (Mobile) / 15 min (Desktop)",
      maxFileSize: "5 GB"
    },
    horizontal: {
      aspectRatio: "16:9",
      resolution: "1920 x 1080",
      maxDuration: "15 minutes (Desktop) / 10 min (Mobile)",
      maxFileSize: "5 GB"
    }
  }
};

/**
 * Gets video limits for a specific platform
 * @param platform - Platform name (tiktok, youtube, instagram, facebook, linkedin)
 * @param isVertical - Whether the video is vertical/short-form (default: true)
 * @returns Video limits for the platform or null if not found
 */
export const getPlatformVideoLimits = (
  platform: string,
  isVertical: boolean = true
): Partial<VideoLimits[keyof VideoLimits]> | null => {
  const platformLower = platform.toLowerCase();
  const limits = PLATFORM_VIDEO_LIMITS[platformLower];
  
  if (!limits) return null;
  
  return isVertical ? limits.shortForm : limits.horizontal;
};
