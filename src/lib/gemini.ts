import { Platform, CampaignInfo, PostContent, GeneratedPost } from "../types";
import API from "../services/api";

// Only initialize if we have a valid API key

export interface PlatformConfig {
  maxLength: number;
  hashtagCount: number;
  tone: string;
  features: string[];
}

export const platformConfigs: Record<Platform, PlatformConfig> = {
  facebook: {
    maxLength: 2000,
    hashtagCount: 5,
    tone: "conversational",
    features: ["link preview", "reactions", "community engagement"],
  },
  instagram: {
    maxLength: 2200,
    hashtagCount: 10,
    tone: "visual-first",
    features: ["hashtags", "emojis", "stories", "visual appeal"],
  },
  twitter: {
    maxLength: 280,
    hashtagCount: 5,
    tone: "concise",
    features: ["trending", "mentions", "brevity", "real-time"],
  },
  linkedin: {
    maxLength: 3000,
    hashtagCount: 5,
    tone: "professional",
    features: ["industry insights", "networking", "thought leadership"],
  },
  tiktok: {
    maxLength: 300,
    hashtagCount: 8,
    tone: "trendy",
    features: ["viral", "sounds", "challenges", "youth appeal"],
  },
  youtube: {
    maxLength: 1500,
    hashtagCount: 5,
    tone: "educational",
    features: [
      "description",
      "thumbnails",
      "social engagement",
      "entertainment",
    ],
  },
};

export async function analyzeImage(imageFile: File): Promise<string> {
  if (!genAI) {
    console.warn("Gemini API not available for image analysis");
    return "Image analysis requires a valid Gemini API key. Please add a description manually.";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  try {
    // Convert file to base64
    const imageData = await fileToGenerativePart(imageFile);

    const prompt = `
Analyze this image and provide a detailed description that would be useful for social media content creation. Include:
1. What's in the image (objects, people, setting)
2. The mood/atmosphere
3. Colors and visual elements
4. Potential marketing angles or messages
5. Suggested content themes

Keep the description concise but informative for social media marketing purposes.
`;

    const result = await model.generateContent([prompt, imageData as any]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "Unable to analyze image. Please add a description manually.";
  }
}

async function fileToGenerativePart(file: File) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const base64Content = base64Data.split(",")[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.readAsDataURL(file);
  });
}

export async function generatePostForPlatform(
  platform: Platform,
  campaignInfo: CampaignInfo,
  contentData: PostContent
): Promise<{
  caption: string;
  hashtags: string[];
  emojis: string;
  characterCount: number;
  engagement: "high" | "medium" | "low";
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  const config = platformConfigs[platform];

  const prompt = `
You are an expert social media content creator. Generate a ${platform} post with the following requirements:

COMPANY INFORMATION:
- Campaign: ${campaignInfo.name}
- Industry: ${campaignInfo.industry || "General"}
- Target Audience: ${campaignInfo.targetAudience || "General audience"}
- Brand Tone: ${campaignInfo.brandTone}
- Goals: ${campaignInfo.goals.join(", ")}

CONTENT DETAILS:
- Main Message: ${contentData.prompt}
- Keywords/Tags: ${contentData.tags.join(", ")}
- Campaign ID: ${contentData.campaignId || "N/A"}

PLATFORM REQUIREMENTS FOR ${platform.toUpperCase()}:
- Maximum length: ${config.maxLength} characters
- Tone: ${config.tone}
- Key features: ${config.features.join(", ")}
- Hashtag count: ${config.hashtagCount}

INSTRUCTIONS:
1. Create an engaging caption that matches the brand tone and platform style
2. Keep within the character limit (${config.maxLength} characters)
3. Generate hashtags ${config.hashtagCount} relevant hashtags
4. Include appropriate emojis for the platform
5. Make it optimized for ${platform} audience engagement
6. Keep it short and sweet
7. create some additional random hashtags as per the content
8. Dont use paragraphs, keep it in single paragraph dont use line breaks
9. Dont use Ai elements like "As an AI language model" for e.g(**, symbols etc**)

Please respond in this exact JSON format:
{
  "caption": "Your generated caption here",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "emojis": "🎉 ✨ 🚀",
  "engagement_prediction": "high"
}

Make sure the JSON is valid and properly formatted.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const jsonResponse = JSON.parse(jsonMatch[0]);

    return {
      caption: jsonResponse.caption || contentData.prompt,
      hashtags: jsonResponse.hashtags || [
        `#${campaignInfo.name.replace(/\s+/g, "").toLowerCase()}`,
      ],
      emojis: jsonResponse.emojis || "✨",
      characterCount: jsonResponse.caption?.length || 0,
      engagement: jsonResponse.engagement_prediction || "medium",
    };
  } catch (error) {
    console.error("Error generating content with Gemini:", error);

    // Fallback content generation
    return generateFallbackContent(platform, campaignInfo, contentData, config);
  }
}

function generateFallbackContent(
  platform: Platform,
  campaignInfo: CampaignInfo,
  contentData: PostContent,
  config: PlatformConfig
) {
  const platformStyles = {
    facebook: `🌟 ${contentData.prompt}\n\nWhat do you think? Share your thoughts in the comments!`,
    instagram: `✨ ${contentData.prompt}\n\nSwipe to see more! 👉`,
    twitter: `🚀 ${contentData.prompt}\n\nWhat's your take?`,
    linkedin: `🔍 ${contentData.prompt}\n\nI'd love to hear your professional insights on this. What has been your experience?`,
    tiktok: `🎵 ${contentData.prompt}\n\nWho else relates? 🙋‍♀️`,
    youtube: `🎬 ${contentData.prompt}\n\nDon't forget to like and subscribe for more content like this!`,
  };

  let caption = platformStyles[platform] || contentData.prompt;

  // Truncate if too long
  if (caption.length > config.maxLength) {
    caption = caption.substring(0, config.maxLength - 3) + "...";
  }

  const baseTags = contentData.tags.map(
    (tag) => `#${tag.toLowerCase().replace(/\s+/g, "")}`
  );
  const platformTags = {
    facebook: ["#socialmedia", "#business", "#marketing"],
    instagram: ["#instagood", "#photooftheday", "#beautiful"],
    twitter: ["#trending", "#business"],
    linkedin: ["#professional", "#business"],
    tiktok: ["#fyp", "#viral"],
    youtube: ["#youtube", "#subscribe"],
  };

  const hashtags = [...baseTags, ...(platformTags[platform] || [])].slice(
    0,
    config.hashtagCount
  );

  return {
    caption,
    hashtags,
    emojis: "✨ 🚀 💫",
    characterCount: caption.length,
    engagement: "medium" as const,
  };
}

export async function generateSinglePlatformPost(
  platform: any,
  campaignInfo: any,
  contentData: any
): Promise<GeneratedPost> {
  console.log(`🚀 generateSinglePlatformPost called for platform: ${platform}`);
  console.log("📄 Content data:", {
    prompt: contentData.prompt?.substring(0, 100) + "...",
    platform: platform,
    tags: contentData.tags,
  });

  try {
    const payload: any = {
      campaign: {
        name: campaignInfo.name,
        industry: campaignInfo.industry,
        description: campaignInfo.description,
        targetAudience: campaignInfo.targetAudience,
        brandTone: campaignInfo.brandTone,
      },
      content: {
        topic: contentData.prompt,
        contentType: contentData.contentType || "general",
        tone: contentData.tone || campaignInfo.brandTone,
        targetAudience:
          contentData.targetAudience || campaignInfo.targetAudience,
        tags: contentData.tags || [],
      },
      platforms: [platform], // Send one platform per request
    };

    const response = await API.generateAI(payload);
    console.log("response", response.data);

    const data = response.data.data;

    console.log(`API response for ${platform}:`, data?.posts);
    if (data?.posts?.length > 0) {
      const post = data?.posts[0];
      console.log("post sdklasdkljasdkl", post);
      let caption =
        post.content ||
        post.caption ||
        contentData.prompt ||
        "Check out our latest updates!";
      let hashtags: string[] = [];

      // Extract hashtags from content
      const hashtagMatches = caption.match(/#\w+/g);
      if (hashtagMatches) {
        hashtags = [...new Set(hashtagMatches)].slice(0, 5); // Remove duplicates
        // Clean hashtags from caption
        caption = caption.replace(/#\w+(\s+#\w+)*/g, "").trim();
      }

      // Add default hashtags if none found
      if (hashtags.length === 0) {
        hashtags = [
          `#${
            campaignInfo.name?.replace(/\s+/g, "")?.toLowerCase() || "business"
          }`,
          "#socialmedia",
        ];
      }

      // Use server URL if available, fallback to mediaUrl
      const serverMediaUrl =
        (contentData as any).serverUrl || contentData.mediaUrl;

      return {
        platform,
        caption: caption,
        hashtags: hashtags,
        emojis: "✨ 🚀 💫",
        characterCount: caption.length + hashtags.join(" ").length,
        engagement: "medium" as const,
        imageUrl: serverMediaUrl || null,
        mediaUrl: serverMediaUrl || null,
        thumbnailUrl: (contentData as any).thumbnailUrl || null,
        generationPrompt: contentData.prompt,
        success: true,
      } as any;
    } else {
      throw new Error("No content generated");
    }
  } catch (error) {
    console.error(`Error generating for ${platform}:`, error);

    // Use server URL if available, fallback to mediaUrl
    const serverMediaUrl =
      (contentData as any).serverUrl || contentData.mediaUrl;

    // Return fallback post for this platform
    return {
      platform,
      caption: contentData.prompt || "Check out our latest updates!",
      hashtags: [
        `#${
          campaignInfo.name?.replace(/\s+/g, "")?.toLowerCase() || "business"
        }`,
        "#update",
      ],
      emojis: "✨ 🚀 💫",
      characterCount:
        (contentData.prompt || "Check out our latest updates!").length + 20, // rough estimate
      engagement: "medium" as const,
      imageUrl: serverMediaUrl || null,
      mediaUrl: serverMediaUrl || null,
      thumbnailUrl: (contentData as any).thumbnailUrl || null,
      generationPrompt: contentData.prompt,
      success: false,
      error: error instanceof Error ? error.message : "Generation failed",
    } as any;
  }
}

export async function generateAllPosts(
  campaignInfo: any,
  contentData: any,
  onProgress?: (platform: Platform, progress: number) => void
): Promise<GeneratedPost[]> {
  const platforms = campaignInfo.platforms ||
    contentData.selectedPlatforms || ["linkedin"];
  const posts: GeneratedPost[] = [];

  try {
    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i] as Platform;
      const progress = ((i + 1) / platforms.length) * 100;

      // Update progress
      if (onProgress) {
        onProgress(platform, progress);
      }

      console.log(`Generating content for ${platform}...`);

      try {
        const payload: any = {
          campaign: {
            name: campaignInfo.name,
            industry: campaignInfo.industry,
            description: campaignInfo.description,
            targetAudience: campaignInfo.targetAudience,
            brandTone: campaignInfo.brandTone,
          },
          content: {
            topic: contentData.prompt,
            contentType: contentData.contentType || "general",
            tone: contentData.tone || campaignInfo.brandTone,
            targetAudience:
              contentData.targetAudience || campaignInfo.targetAudience,
            tags: contentData.tags || [],
          },
          platforms: [platform], // Send one platform per request
        };

        const response = await API.generateAI(payload);
        console.log("response", response.data);

        const data = response.data.data;
        console.log(`API response for ${platform}:`, data?.posts);

        if (data.posts.length > 0) {
          const post = data.posts[0];
          console.log("post sdklasdkljasdkl", post);
          // Parse the generated content to extract caption and hashtags
          let caption =
            post.content ||
            post.caption ||
            contentData.prompt ||
            "Check out our latest updates!";
          let hashtags: string[] = [];

          // Extract hashtags from content
          const hashtagMatches = caption.match(/#\w+/g);
          if (hashtagMatches) {
            hashtags = [...new Set(hashtagMatches)].slice(0, 5); // Remove duplicates
            // Clean hashtags from caption
            caption = caption.replace(/#\w+(\s+#\w+)*/g, "").trim();
          }

          // Add default hashtags if none found
          if (hashtags.length === 0) {
            hashtags = [
              `#${
                campaignInfo.name?.replace(/\s+/g, "")?.toLowerCase() ||
                "business"
              }`,
              "#socialmedia",
            ];
          }

          // Use server URL if available, fallback to mediaUrl
          const serverMediaUrl =
            (contentData as any).serverUrl || contentData.mediaUrl;

          posts.push({
            platform,
            caption: caption,
            hashtags: hashtags,
            emojis: "✨ 🚀 💫",
            characterCount: caption.length + hashtags.join(" ").length,
            engagement: "medium" as const,
            imageUrl: serverMediaUrl || null,
            mediaUrl: serverMediaUrl || null,
            thumbnailUrl: (contentData as any).thumbnailUrl || null,
            generationPrompt: contentData.prompt,
            success: true,
          } as any);
        } else {
          throw new Error("No content generated");
        }
      } catch (platformError) {
        console.error(`Error generating for ${platform}:`, platformError);

        // Use server URL if available, fallback to mediaUrl
        const serverMediaUrl =
          (contentData as any).serverUrl || contentData.mediaUrl;

        // Add fallback post for this platform
        posts.push({
          platform,
          caption: contentData.prompt || "Check out our latest updates!",
          hashtags: [
            `#${
              campaignInfo.name?.replace(/\s+/g, "")?.toLowerCase() ||
              "business"
            }`,
            "#update",
          ],
          emojis: "✨ 🚀 💫",
          characterCount:
            (contentData.prompt || "Check out our latest updates!").length + 20,
          engagement: "medium" as const,
          imageUrl: serverMediaUrl || null,
          mediaUrl: serverMediaUrl || null,
          thumbnailUrl: (contentData as any).thumbnailUrl || null,
          generationPrompt: contentData.prompt,
          success: false,
          error:
            platformError instanceof Error
              ? platformError.message
              : "Generation failed",
        } as any);
      }

      // Small delay between platforms for better UX and to avoid rate limiting
      if (i < platforms.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log(
      "Generated posts with mediaUrl debugging:",
      posts.map((post) => ({
        platform: post.platform,
        caption: post.caption?.substring(0, 50) + "...",
        imageUrl: post.imageUrl,
        mediaUrl: post.mediaUrl,
        hasImage: !!(post.imageUrl || post.mediaUrl),
      }))
    );
    return posts;
  } catch (error: any) {
    console.error("Error in generateAllPosts:", error);

    // Use server URL if available, fallback to mediaUrl
    const serverMediaUrl =
      (contentData as any).serverUrl || contentData.mediaUrl;

    // Return fallback posts for all platforms
    return platforms.map(
      (platform: Platform) =>
        ({
          platform,
          caption: contentData.prompt || "Check out our latest updates!",
          hashtags: [
            `#${
              campaignInfo.name?.replace(/\s+/g, "")?.toLowerCase() ||
              "business"
            }`,
          ],
          emojis: "✨ 🚀 💫",
          characterCount:
            (contentData.prompt || "Check out our latest updates!").length + 20,
          engagement: "medium" as const,
          imageUrl: serverMediaUrl || null,
          mediaUrl: serverMediaUrl || null,
          thumbnailUrl: (contentData as any).thumbnailUrl || null,
          generationPrompt: contentData.prompt,
          success: false,
          error: error.message || "AI generation failed",
        } as any)
    );
  }
}

function getDefaultHashtags(platform: Platform, industry: string): string[] {
  const baseHashtags = ["#business", "#innovation"];
  const industryHashtags = {
    Technology: ["#tech", "#innovation", "#digital"],
    Marketing: ["#marketing", "#branding", "#socialmedia"],
    Finance: ["#finance", "#business", "#investment"],
    Healthcare: ["#healthcare", "#wellness", "#medical"],
    Education: ["#education", "#learning", "#knowledge"],
  };

  const specific = industryHashtags[
    industry as keyof typeof industryHashtags
  ] || ["#updates"];
  return [...baseHashtags, ...specific].slice(0, 5);
}

export async function analyzeImageWithGemini(imageFile: File): Promise<string> {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    console.warn("Gemini API key not found");
    return "Unable to analyze image. Please add a description manually.";
  }

  //const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  //const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    // Convert file to base64
    const imageData = await fileToGenerativePart(imageFile);

    const prompt = `
Analyze this image and provide a detailed description that would be useful for social media content creation. Include:
1. What's in the image (objects, people, setting)
2. The mood/atmosphere
3. Colors and visual elements
4. Potential marketing angles or messages
5. Suggested content themes
6. Tell in general terms what the image is about.
7. don't use special characters like #, @, **, —, -, *, etc. 
Keep the description concise in on paragraph informative for social media marketing purposes.
`;

    const result = await model.generateContent([prompt, imageData as any]);
    const response = await result.response;
    const text = response.text();

    if (text && text.trim()) {
      return text;
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error: any) {
    console.error("Error analyzing image with Gemini:", error);

    // Provide a more helpful fallback message
    if (error.message?.includes("API_KEY")) {
      return "Image analysis requires a valid Gemini API key. Please add a description manually.";
    } else if (
      error.message?.includes("quota") ||
      error.message?.includes("limit")
    ) {
      return "Image analysis quota exceeded. Please add a description manually.";
    } else {
      return "Unable to analyze image automatically. Please add a description manually.";
    }
  }
}
