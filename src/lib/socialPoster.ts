import axios from "axios";
import { GeneratedPost, Platform } from "../types";
import API from "../services/api";

// Facebook
export async function postToFacebook(
  pageId: string,
  accessToken: string,
  post: GeneratedPost
) {
  const url = `https://graph.facebook.com/${pageId}/feed`;
  const data: any = {
    message: `${post.caption}\n${post.hashtags.join(" ")}`,
    access_token: accessToken,
  };
  if (post.imageUrl) data.picture = post.imageUrl;
  return axios.post(url, data);
}

// Instagram
export async function postToInstagram(
  businessAccountId: string,
  accessToken: string,
  post: GeneratedPost
) {
  if (!post.imageUrl) throw new Error("Instagram post requires imageUrl");
  // Step 1: Create media object
  const mediaRes = await axios.post(
    `https://graph.facebook.com/v19.0/${businessAccountId}/media`,
    {
      image_url: post.imageUrl,
      caption: post.caption,
      access_token: accessToken,
    }
  );
  // Step 2: Publish media
  return axios.post(
    `https://graph.facebook.com/v19.0/${businessAccountId}/media_publish`,
    { creation_id: mediaRes.data.id, access_token: accessToken }
  );
}

// LinkedIn
export async function postToLinkedIn(
  organizationId: string,
  accessToken: string,
  post: GeneratedPost
) {
  const url = "https://api.linkedin.com/v2/ugcPosts";
  const data = {
    author: `urn:li:organization:${organizationId}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: post.caption },
        shareMediaCategory: post.imageUrl ? "IMAGE" : "NONE",
        media: post.imageUrl
          ? [{ status: "READY", originalUrl: post.imageUrl }]
          : [],
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };
  return axios.post(url, data, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function postToLinkedInFromServer(
  accessToken: string,
  post: GeneratedPost
) {
  try {
    const response = await API.linkedinPost({ accessToken, post });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message);
  }
}

export async function postToFacebookFromServer(
  accessToken: string,
  post: GeneratedPost,
  pageId?: string
) {
  try {
    console.log("Posting to Facebook with:", {
      pageId,
      hasImage: !!post.imageUrl,
      caption: post.caption?.substring(0, 50) + "...",
    });

    const response = await API.facebookPost({ accessToken, post, pageId });

    return response.data;
  } catch (error: any) {
    console.error("Facebook posting error:", error.response?.data);
    throw new Error(error.response?.data?.error || error.message);
  }
}

export async function postToYouTubeFromServer(
  accessToken: string,
  post: GeneratedPost,
  videoUrl?: string,
  thumbnailUrl?: string
) {
  try {
    if (!videoUrl && !post.imageUrl) {
      throw new Error("YouTube requires a video file");
    }

    const videoUrlToUse = videoUrl || post.imageUrl;

    console.log("📹 YouTube posting with:", {
      videoUrl: videoUrlToUse?.substring(0, 50) + "...",
      hasThumbnail: !!thumbnailUrl,
      thumbnailUrl: thumbnailUrl?.substring(0, 50) + "...",
    });

    const response = await API.youtubePost({
      accessToken,
      post,
      videoUrl: videoUrlToUse,
    });

    const videoId = response.data?.data?.videoId;
    console.log("✅ YouTube video uploaded successfully, videoId:", videoId);

    // Step 2: Upload custom thumbnail if available
    if (thumbnailUrl && videoId) {
      console.log("🎨 Uploading custom thumbnail for YouTube video:", videoId);
      try {
        const thumbnailResponse = await axios.post(
          "/api/youtube/set-thumbnail",
          {
            accessToken,
            videoId,
            thumbnailUrl,
          }
        );

        if (thumbnailResponse.data?.success) {
          console.log("✅ YouTube thumbnail uploaded successfully");
          // Add thumbnail info to response
          response.data.thumbnailUploaded = true;
          response.data.thumbnailMessage = thumbnailResponse.data.message;
        } else {
          console.warn(
            "⚠️ YouTube thumbnail upload failed:",
            thumbnailResponse.data?.error
          );
          response.data.thumbnailUploaded = false;
          response.data.thumbnailError =
            thumbnailResponse.data?.error || "Unknown thumbnail upload error";
        }
      } catch (thumbnailError: any) {
        console.warn(
          "⚠️ YouTube thumbnail upload failed:",
          thumbnailError.message
        );
        // Don't fail the entire upload if thumbnail fails, just log it
        response.data.thumbnailUploaded = false;
        response.data.thumbnailError =
          thumbnailError.response?.data?.error || thumbnailError.message;
      }
    } else if (!thumbnailUrl) {
      console.log("🎨 No thumbnail URL provided, skipping thumbnail upload");
    } else if (!videoId) {
      console.warn("⚠️ No video ID available for thumbnail upload");
    }

    return response.data;
  } catch (error: any) {
    // Improve error message for quota limits
    const errorMessage = error.response?.data?.error || error.message;

    if (
      errorMessage.includes("upload limit exceeded") ||
      errorMessage.includes("exceeded the number of videos")
    ) {
      throw new Error(
        "YouTube daily upload limit exceeded. Try again tomorrow after midnight PT."
      );
    }

    throw new Error(errorMessage);
  }
}
export async function postToLinkedInPersonal(
  accessToken: string,
  post: GeneratedPost
) {
  // Step 1: Get personId from LinkedIn
  const meResponse = await fetch(
    `/api/linkedin/me?access_token=${accessToken}`,
    {}
  );

  const meData = await meResponse.json();
  if (!meResponse.ok) {
    throw new Error(
      `Failed to get LinkedIn person ID: ${
        meData.message || meResponse.statusText
      }`
    );
  }

  const personId = meData.id;

  // Step 2: Prepare post data
  const url = "https://api.linkedin.com/v2/ugcPosts";
  const data = {
    author: `urn:li:person:${personId}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: post.caption },
        shareMediaCategory: post.imageUrl ? "IMAGE" : "NONE",
        media: post.imageUrl
          ? [{ status: "READY", originalUrl: post.imageUrl }]
          : [],
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  // Step 3: Send post request
  return axios.post(url, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Restli-Protocol-Version": "2.0.0",
      "Content-Type": "application/json",
    },
  });
}

// Placeholder for Twitter, TikTok, YouTube
// Twitter/X
export async function postToTwitter(params: {
  accessToken: string;
  post: GeneratedPost;
}) {
  const url = "https://api.twitter.com/2/tweets";

  const tweetText = `${params.post.caption}\n\n${params.post.hashtags.join(
    " "
  )}`;

  const data: any = {
    text: tweetText.slice(0, 280), // Twitter character limit
  };

  // Add media if image URL is provided
  if (params.post.imageUrl) {
    // First upload media
    const mediaId = await uploadTwitterMedia(
      params.accessToken,
      params.post.imageUrl
    );
    if (mediaId) {
      data.media = { media_ids: [mediaId] };
    }
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new SocialPosterError(
      `Twitter post failed: ${error.detail || error.title || "Unknown error"}`,
      "twitter",
      response.status,
      response.status >= 500
    );
  }

  return response.json();
}

// TikTok
export async function postToTikTok(params: {
  accessToken: string;
  post: GeneratedPost;
}) {
  if (!params.post.imageUrl) {
    throw new SocialPosterError(
      "TikTok requires a video file",
      "tiktok",
      400,
      false
    );
  }

  const url = "https://open.tiktokapis.com/v2/post/publish/video/init/";

  const data = {
    post_info: {
      title: params.post.caption.slice(0, 150), // TikTok title limit
      privacy_level: "MUTUAL_FOLLOW_FRIENDS", // or 'PUBLIC_TO_EVERYONE'
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
      video_cover_timestamp_ms: 1000,
    },
    source_info: {
      source: "FILE_UPLOAD",
      video_size: 50000000, // Max 50MB
      chunk_size: 10000000, // 10MB chunks
      total_chunk_count: 1,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new SocialPosterError(
      `TikTok post failed: ${error.error?.message || "Unknown error"}`,
      "tiktok",
      response.status,
      response.status >= 500
    );
  }

  const result = await response.json();

  // Upload video file using the upload URL
  if (result.data?.upload_url) {
    await uploadTikTokVideo(result.data.upload_url, params.post.imageUrl);
  }

  return result;
}

// YouTube
export async function postToYouTube(params: {
  accessToken: string;
  post: GeneratedPost;
  videoUrl?: string;
}) {
  if (!params.videoUrl) {
    throw new SocialPosterError(
      "YouTube requires a video file",
      "youtube",
      400,
      false
    );
  }

  try {
    // Use the server API for YouTube posting
    const response = await fetch("/api/youtube/upload-init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: params.accessToken,
        post: params.post,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new SocialPosterError(
        `YouTube upload init failed: ${error.error || "Unknown error"}`,
        "youtube",
        response.status,
        response.status >= 500
      );
    }

    const initData = await response.json();

    // Upload the video using the server API
    const uploadResponse = await fetch("/api/youtube/upload-video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: params.accessToken,
        uploadUrl: initData.uploadUrl,
        videoUrl: params.videoUrl,
      }),
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new SocialPosterError(
        `YouTube video upload failed: ${error.error || "Unknown error"}`,
        "youtube",
        uploadResponse.status,
        uploadResponse.status >= 500
      );
    }

    return uploadResponse.json();
  } catch (error) {
    if (error instanceof SocialPosterError) {
      throw error;
    }
    throw new SocialPosterError(
      `YouTube posting failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      "youtube",
      500,
      true
    );
  }
}

// Enhanced posting function that supports both real and mock OAuth
export async function postToAllPlatforms(
  posts: GeneratedPost[],
  onProgress?: (
    platform: string,
    status: "pending" | "success" | "error"
  ) => void,
  context?: {
    facebookPageId?: string;
    youtubeChannelId?: string;
    thumbnailUrl?: string;
  }
): Promise<Record<string, any>> {
  const results: Record<string, any> = {};
  const errors: string[] = [];
  const successes: string[] = [];

  console.log(`Starting to post to ${posts.length} platforms`);

  // Get the authentication token for API requests
  const token = localStorage.getItem("auth_token");
  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  for (const post of posts) {
    try {
      onProgress?.(post.platform, "pending");
      console.log(`Attempting to post to ${post.platform}`);

      // Try to get real OAuth tokens using authenticated endpoint
      let realPostResult = null;
      try {
        const tokenResponse = await API.tokenForPlatform(post.platform);
        if (tokenResponse?.data) {
          const tokenData = tokenResponse.data;

          if (
            tokenData.connected &&
            tokenData.token?.access_token &&
            !tokenData.expired
          ) {
            console.log(
              `Found valid OAuth token for ${post.platform}, attempting real post`
            );
            realPostResult = await postWithRealOAuth(
              post,
              tokenData.token.access_token,
              context
            );
          } else if (tokenData.expired) {
            throw new Error(
              `${post.platform} token has expired. Please reconnect your account.`
            );
          } else {
            throw new Error(
              `No valid token found for ${post.platform}. Please connect your account.`
            );
          }
        } else {
          const errorData = await tokenResponse.text();
          throw new Error(
            `Failed to get token for ${post.platform}: ${errorData}`
          );
        }
      } catch (error) {
        console.error(
          `OAuth token retrieval failed for ${post.platform}:`,
          error
        );
        throw error;
      }
      console.log("realPostResult", realPostResult);
      if (realPostResult?.success) {
        results[post.platform] = {
          success: true,
          data: realPostResult,
          method: "real",
          message:
            realPostResult.message || `Successfully posted to ${post.platform}`,
          postId: realPostResult.postId || "Unknown",
        };
        successes.push(post.platform);
        onProgress?.(post.platform, "success");
        console.log(`Successfully posted to ${post.platform} via real OAuth`);

        // Save the published post to history
        try {
          await savePublishedPostToHistory(post, realPostResult);
        } catch (historyError: any) {
          console.warn(
            `Failed to save ${post.platform} post to history:`,
            historyError.message
          );
          // Don't fail the entire posting process if history saving fails
        }
      } else if (realPostResult && !realPostResult.success) {
        // Real OAuth attempt failed - propagate the actual error message
        throw new Error(
          realPostResult.message || `Failed to post to ${post.platform}`
        );
      } else {
        // No result at all - OAuth token issue
        throw new Error(
          `No valid OAuth token found for ${post.platform}. Please connect your account.`
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.message || `Failed to post to ${post.platform}`;
      console.error(`Failed to post to ${post.platform}:`, error);

      results[post.platform] = {
        success: false,
        error: errorMessage,
        platform: post.platform,
        retryable:
          !errorMessage.includes("connect") &&
          !errorMessage.includes("expired"),
      };
      errors.push(`${post.platform}: ${errorMessage}`);
      onProgress?.(post.platform, "error");

      // Continue with other platforms instead of stopping
      console.log(
        `Continuing with remaining platforms despite ${post.platform} failure`
      );
    }

    // Add small delay between posts to avoid rate limits
    if (posts.indexOf(post) < posts.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Log summary
  console.log(
    `Publishing complete. Successes: ${
      successes.join(", ") || "none"
    }. Errors: ${errors.length}`
  );
  if (errors.length > 0) {
    console.warn("Publishing errors:", errors);
  }

  // Add summary to results for UI feedback
  results._summary = {
    total: posts.length,
    successful: successes.length,
    failed: errors.length,
    errors: errors,
    successes: successes,
  };

  return results;
}

// Function to handle real OAuth posting
async function postWithRealOAuth(
  post: GeneratedPost,
  accessToken: string,
  context?: {
    facebookPageId?: string;
    youtubeChannelId?: string;
    thumbnailUrl?: string;
  }
): Promise<{ success: boolean; message: string; postId?: string }> {
  try {
    switch (post.platform) {
      case "linkedin":
        const result = await postToLinkedInFromServer(accessToken, post);
        return {
          success: true,
          message: `Successfully posted to LinkedIn`,
          postId: result?.data?.data?.id,
        };

      case "facebook":
        const fbResult = await postToFacebookFromServer(
          accessToken,
          post,
          context?.facebookPageId || post.pageId
        );
        return {
          success: true,
          message: `Successfully posted to Facebook`,
          postId: fbResult.postId || fbResult.data?.id,
        };

      case "youtube":
        // Get thumbnail URL from context if available (passed from video posting component)
        const thumbnailUrl =
          context?.thumbnailUrl || (post as any).thumbnailUrl;
        const ytResult = await postToYouTubeFromServer(
          accessToken,
          post,
          post.imageUrl,
          thumbnailUrl
        );

        let message = `Successfully posted to YouTube`;
        if (ytResult.thumbnailUploaded) {
          message += ` with custom thumbnail`;
        } else if (ytResult.thumbnailError) {
          message += ` (thumbnail upload failed: ${ytResult.thumbnailError})`;
        }

        return {
          success: true,
          message,
          postId: ytResult.videoId || ytResult.data?.id,
        };

      case "instagram":
        // Add real Instagram posting logic here
        throw new Error("Real Instagram posting not implemented yet");

      case "twitter":
        // Add real Twitter posting logic here
        throw new Error("Real Twitter posting not implemented yet");

      case "tiktok":
        // Add real TikTok posting logic here
        throw new Error("Real TikTok posting not implemented yet");

      default:
        throw new Error(`Unsupported platform: ${post.platform}`);
    }
  } catch (error: any) {
    console.error(`Real OAuth posting failed for ${post.platform}:`, error);
    return {
      success: false,
      message: error.message || `Failed to post to ${post.platform}`,
    };
  }
}

// Enhanced error handling with retry logic
export class SocialPosterError extends Error {
  constructor(
    message: string,
    public platform: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "SocialPosterError";
  }
}

// Retry mechanism for failed posts
async function withRetry<T>(
  fn: () => Promise<T>,
  platform: string,
  maxRetries: number = 2
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on authentication errors
      if (error instanceof SocialPosterError && !error.retryable) {
        throw error;
      }

      if (attempt === maxRetries) {
        throw new SocialPosterError(
          `Failed after ${maxRetries} attempts: ${lastError.message}`,
          platform,
          undefined,
          false
        );
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  throw lastError!;
}

// Platform-specific utility functions

// Helper function to upload media to Twitter
async function uploadTwitterMedia(
  accessToken: string,
  imageUrl: string
): Promise<string | null> {
  try {
    // Download image
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();
    const base64Image = btoa(
      String.fromCharCode.apply(
        null,
        Array.from(new Uint8Array(imageBuffer)) as any
      )
    );

    // Upload to Twitter
    const uploadResponse = await fetch(
      "https://upload.twitter.com/1.1/media/upload.json",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          media_data: base64Image,
        }),
      }
    );

    if (uploadResponse.ok) {
      const result = await uploadResponse.json();
      return result.media_id_string;
    }
  } catch (error) {
    console.error("Failed to upload Twitter media:", error);
  }
  return null;
}

// Helper function to upload video to TikTok
async function uploadTikTokVideo(
  uploadUrl: string,
  videoUrl: string
): Promise<void> {
  const videoResponse = await fetch(videoUrl);
  const videoBlob = await videoResponse.blob();

  await fetch(uploadUrl, {
    method: "PUT",
    body: videoBlob,
    headers: {
      "Content-Type": "video/mp4",
    },
  });
}

// Helper functions to get platform-specific IDs
async function getFacebookPageId(accessToken: string): Promise<string> {
  const response = await fetch(
    `https://graph.facebook.com/me/accounts?access_token=${accessToken}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new SocialPosterError(
      `Failed to get Facebook page ID: ${data.error?.message}`,
      "facebook",
      response.status,
      false
    );
  }

  if (!data.data || data.data.length === 0) {
    throw new SocialPosterError(
      "No Facebook pages found",
      "facebook",
      404,
      false
    );
  }

  return data.data[0].id; // Use first page
}

async function getInstagramBusinessAccountId(
  accessToken: string
): Promise<string> {
  const pageId = await getFacebookPageId(accessToken);
  const response = await fetch(
    `https://graph.facebook.com/${pageId}?fields=instagram_business_account&access_token=${accessToken}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new SocialPosterError(
      `Failed to get Instagram account ID: ${data.error?.message}`,
      "instagram",
      response.status,
      false
    );
  }

  if (!data.instagram_business_account) {
    throw new SocialPosterError(
      "No Instagram business account linked",
      "instagram",
      404,
      false
    );
  }

  return data.instagram_business_account.id;
}

async function getLinkedInOrganizationId(accessToken: string): Promise<string> {
  const response = await fetch(
    `/api/v2/organizationalEntityAcls?q=roleAssignee&role=ADMIN&access_token=${accessToken}`,
    {
      // headers: { Authorization: `Bearer ${accessToken}` }
    }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new SocialPosterError(
      `Failed to get LinkedIn organization ID: ${data.message}`,
      "linkedin",
      response.status,
      false
    );
  }

  const org = data.elements?.find((el: any) =>
    el.organizationalTarget?.startsWith("urn:li:organization:")
  );
  if (!org) {
    throw new SocialPosterError(
      "No LinkedIn organizations found",
      "linkedin",
      404,
      false
    );
  }

  return org.organizationalTarget.split(":").pop();
}

// Helper function to extract post ID from API response
function getPostIdFromResult(result: any, platform: string): string {
  switch (platform) {
    case "facebook":
      return result.data?.id || result.id || "Unknown";
    case "instagram":
      return result.data?.id || result.id || "Unknown";
    case "linkedin":
      return result.data?.id || result.id || "Unknown";
    case "twitter":
      return result.data?.id || result.id || "Unknown";
    case "tiktok":
      return result.data?.publish_id || "Unknown";
    case "youtube":
      return result.id || "Unknown";
    default:
      return "Unknown";
  }
}

// Function to save published post to history database
async function savePublishedPostToHistory(
  post: any,
  publishResult: any
): Promise<void> {
  try {
    console.log(`📝 Saving ${post.platform} post to history database...`);

    // Generate a unique post ID for this publishing session
    const postId = `${post.platform}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    console.log("publishResult", publishResult);
    // Get the platform-specific post URL
    let platformUrl = "";
    if (publishResult.postId && publishResult.postId !== "Unknown") {
      switch (post.platform) {
        case "linkedin":
          if (publishResult.postId.startsWith("urn:li:share:")) {
            platformUrl = `https://www.linkedin.com/feed/update/${publishResult.postId}`;
          } else if (publishResult.postId.includes("activity-")) {
            platformUrl = `https://www.linkedin.com/posts/${publishResult.postId}`;
          } else {
            platformUrl = `https://www.linkedin.com/feed/update/urn:li:share:${publishResult.postId}`;
          }
          break;
        case "facebook":
          // Facebook URLs are typically facebook.com/:fbpostId
          platformUrl = `https://www.facebook.com/${publishResult.postId}`;
          break;
        case "youtube":
          platformUrl = `https://www.youtube.com/watch?v=${publishResult.postId}`;
          break;
        case "instagram":
          platformUrl = `https://www.instagram.com/p/${publishResult.postId}/`;
          break;
        case "twitter":
        case "x":
          platformUrl = `https://twitter.com/user/status/${publishResult.postId}`;
          break;
        case "tiktok":
          platformUrl = `https://www.tiktok.com/@user/video/${publishResult.postId}`;
          break;
        default:
          platformUrl = `https://${post.platform}.com/posts/${publishResult.postId}`;
          break;
      }
    }

    // Prepare the published URLs object
    const publishedUrls = {
      [post.platform]: platformUrl,
    };

    console.log("publishedUrls", publishedUrls);

    // Save to post history API
    const response = await API.savePublishedUrls({
      postId,
      postContent: post.content || post.caption,
      publishedUrls,
      platforms: [post.platform],
      category: "General",
      imageUrl: post.imageUrl || post.mediaUrl,
    });

    const result = await response.data.data;

    console.log(
      `✅ Successfully saved ${post.platform} post to history:`,
      result.message
    );
  } catch (error: any) {
    console.error(
      `❌ Failed to save ${post.platform} post to history:`,
      error.message
    );
    throw error;
  }
}
