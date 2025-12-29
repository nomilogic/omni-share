import React, { useState, useRef, useEffect } from "react";
import {
  Wand2,
  Eye,
  Loader,
  Sparkles,
  X,
  CheckCircle,
  AlertCircle,
  Palette,
  Edit3,
  Trash2,
} from "lucide-react";
import Icon from "./Icon";
import TextPostIcon from "../assets/create-text-post-icon-01.svg";
import ImagePostIcon from "../assets/create-image-post-icon-01.svg";
import VideoPostIcon from "../assets/create-video-post-icon-01.svg";
import { PostContent, Platform } from "../types";
import { uploadMedia, getCurrentUser } from "../lib/database";
import { PostPreview } from "./PostPreview";
import { getPlatformColors, platformOptions } from "../utils/platformIcons";
import { getCampaignById } from "../lib/database";
import { useAppContext } from "../context/AppContext";
import { TemplateSelector } from "./TemplateSelector";
import { ImageTemplateEditor } from "./ImageTemplateEditor";
import { Template } from "../types/templates";
import { getTemplateById } from "../utils/templates";
import IntroVideo from "../assets/Omnishare Tutorial.Final.00.mp4";
import { motion } from "framer-motion";
import {
  isVideoFile,
  getVideoAspectRatio,
  is16x9Video,
  is9x16Video,
} from "../utils/videoUtils";
import { useLoadingAPI } from "../hooks/useLoadingAPI";
import VideoPoster from "../assets/omnishare-02 (6).jpg";
import API from "@/services/api";
import { notify } from "@/utils/toast";
import { useTranslation } from "react-i18next";
import ImageRegenerationModal from "./ImageRegenerationModal";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result.split(",")[1]);
      } else {
        reject(new Error("FileReader result is not a string"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

interface ContentInputProps {
  onNext: (data: PostContent) => void;
  onBack: () => void;
  initialData?: Partial<PostContent>;
  selectedPlatforms?: Platform[];
  editMode?: boolean;
}

export const ContentInput: React.FC<ContentInputProps> = ({
  onNext,
  onBack,
  initialData,
  selectedPlatforms,
  editMode,
}) => {
  const { state, generationAmounts } = useAppContext();
  const {
    executeVideoThumbnailGeneration,
    executeImageGeneration,
    executeFileUpload,
    showLoading,
    hideLoading,
  } = useLoadingAPI();
  const { t } = useTranslation();

  const getCost = () => {
    if (!selectedPostType || !generationAmounts) return 0;

    const textPrice = Number(generationAmounts["text"] || 0);
    const imagePrice = Number(generationAmounts["image"] || 0);
    const videoPrice = Number(generationAmounts["image"] || 0);

    switch (selectedPostType) {
      case "text":
        return textPrice * 2;
      case "image":
        return imagePrice + textPrice * 3;
      case "video":
        return videoPrice + textPrice * 5;
      default:
        return textPrice;
    }
  };

  const [formData, setFormData] = useState<PostContent>({
    prompt: initialData?.prompt || "",
    tags: initialData?.tags || [],
    selectedPlatforms: initialData?.selectedPlatforms ||
      selectedPlatforms || ["linkedin"],
    media: initialData?.media || undefined,
    mediaUrl: initialData?.mediaUrl || undefined,
  });
  const [dragActive, setDragActive] = useState(false);

  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState("");

  const [generatedResults, setGeneratedResults] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [campaignInfo, setCampaignInfo] = useState<any>(null);
  const [loadingCampaign, setLoadingCampaign] = useState(false);

  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    Template | undefined
  >();
  const [templatedImageUrl, setTemplatedImageUrl] = useState<string>("");
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showVideoMenu, setShowVideoMenu] = useState(false);
  const [selectedVideoMode, setSelectedVideoMode] = useState<
    "upload" | "uploadShorts" | ""
  >("");

  const [selectedPostType, setSelectedPostType] = useState<
    "text" | "image" | "video" | ""
  >("");

  const [selectedImageMode, setSelectedImageMode] = useState<
    "upload" | "textToImage" | ""
  >("");

  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState<string>("");
  const [originalVideoFile, setOriginalVideoFile] = useState<File | null>(null);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null);
  const [videoAspectRatioWarning, setVideoAspectRatioWarning] =
    useState<string>("");
  const [warningTimeoutId, setWarningTimeoutId] =
    useState<NodeJS.Timeout | null>(null);

  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [imageDescription, setImageDescription] = useState<string>("");
  const [generateImageWithPost, setGenerateImageWithPost] = useState(true);
  const [isGeneratingBoth, setIsGeneratingBoth] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [generateVideoThumbnailAI, setGenerateVideoThumbnailAI] =
    useState(true);
  const [showVideoThumbnailModal, setShowVideoThumbnailModal] = useState(false);
  const [videoThumbnailForRegeneration, setVideoThumbnailForRegeneration] =
    useState<string>("");
  const [videoThumbnailGenerations, setVideoThumbnailGenerations] = useState<
    string[]
  >([]);
  const [videoModifyMode, setVideoModify] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [customThumbnailUploading, setCustomThumbnailUploading] =
    useState(false);

  const uploadAbortControllerRef = useRef<AbortController | null>(null);

  const currentFileRef = useRef<File | null>(null);

  const [pendingPostGeneration, setPendingPostGeneration] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAppropiatePlatforms = (
    postType: "text" | "image" | "video",
    imageMode?: string,
    videoMode?: string
  ): Platform[] => {
    switch (postType) {
      case "text":
        return ["facebook", "linkedin"];
      case "image":
        return ["facebook", "instagram", "linkedin"];
      case "video":
        if (videoMode === "uploadShorts") {
          return ["facebook", "instagram", "linkedin", "tiktok", "youtube"];
        } else if (videoMode === "upload") {
          return ["facebook", "linkedin", "youtube"];
        }
        return ["facebook", "instagram", "linkedin", "tiktok", "youtube"];
      default:
        return ["linkedin", "facebook"];
    }
  };

  useEffect(() => {
    const appropriatePlatforms = getAppropiatePlatforms(
      selectedPostType?.toLowerCase() as "text" | "image" | "video",
      selectedImageMode,
      selectedVideoMode
    );
    setFormData((prev) => ({
      ...prev,
      selectedPlatforms: appropriatePlatforms,
    }));

    if (selectedPostType === "video") {
      if (videoAspectRatio) {
        let shouldClearWarning = false;
        if (selectedVideoMode === "upload" && is16x9Video(videoAspectRatio)) {
          shouldClearWarning = true;
        } else if (
          selectedVideoMode === "uploadShorts" &&
          is9x16Video(videoAspectRatio)
        ) {
          shouldClearWarning = true;
        }

        if (shouldClearWarning && videoAspectRatioWarning) {
          console.log(
            "✅ Video mode now matches aspect ratio, clearing warning"
          );
          if (warningTimeoutId) {
            clearTimeout(warningTimeoutId);
            setWarningTimeoutId(null);
          }
          setVideoAspectRatioWarning("");
        }
      }
    } else {
      if (videoAspectRatioWarning) {
        console.log(
          "🔄 Clearing video warning when switching away from video post type"
        );
        setVideoAspectRatioWarning("");
      }
    }
  }, [
    selectedImageMode,
    selectedVideoMode,
    videoAspectRatio,
    videoAspectRatioWarning,
  ]);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        prompt: initialData.prompt || "",
        tags: initialData.tags || [],
        selectedPlatforms: initialData.selectedPlatforms ||
          selectedPlatforms || ["linkedin"],
        media: initialData.media,
        mediaUrl: initialData.mediaUrl,
      }));
      if (initialData.imageAnalysis) {
        setImageAnalysis(initialData.imageAnalysis);
      }
    }
  }, [initialData, selectedPlatforms, editMode]);

  useEffect(() => {
    const fetchCampaignInfo = async () => {
      if (state.selectedCampaign && state.user?.id) {
        try {
          setLoadingCampaign(true);
          console.log("Fetching campaign info for:", state.selectedCampaign.id);

          const campaign = await getCampaignById(
            state.selectedCampaign.id,
            state.user.id
          );
          setCampaignInfo(campaign);
          console.log("Campaign info fetched:", campaign);

          // Update form data with campaign platforms if user hasn't selected any yet
          if (
            campaign.platforms &&
            (!formData.selectedPlatforms ||
              formData.selectedPlatforms.length === 0)
          ) {
            setFormData((prev) => ({
              ...prev,
              selectedPlatforms: campaign.platforms,
            }));
          }
        } catch (error) {
          console.error("Error fetching campaign info:", error);
          setCampaignInfo(null);
        } finally {
          setLoadingCampaign(false);
        }
      } else {
        setCampaignInfo(null);
      }
    };

    fetchCampaignInfo();
  }, [state.selectedCampaign, state.user?.id]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };
  console.log("formData.mediaUrl", formData.mediaUrl);

  const handleFileUpload = async (file: File) => {
    currentFileRef.current = file;

    setTemplatedImageUrl("");
    setSelectedTemplate(undefined);
    setImageAnalysis("");
    setVideoThumbnailUrl("");
    setOriginalVideoFile(null);
    setVideoAspectRatio(null);

    const previewUrl = URL.createObjectURL(file);

    setFormData((prev) => {
      if (prev.mediaUrl && prev.mediaUrl.startsWith("blob:")) {
        URL.revokeObjectURL(prev.mediaUrl);
      }
      const newData = { ...prev, media: file, mediaUrl: previewUrl };

      return newData;
    });

    if (isVideoFile(file)) {
      try {
        setOriginalVideoFile(file);

        const aspectRatio = await getVideoAspectRatio(file);
        setVideoAspectRatio(aspectRatio);

        console.log("✅ Video aspect ratio detected:", aspectRatio);
      } catch (error) {
        console.log("⚠️ Could not detect aspect ratio:", error);
      }
    }

    showLoading(`Uploading ${file.name}...`, { canCancel: true });

    try {
      const userResult = await getCurrentUser();

      if (!userResult || !userResult.user) {
        hideLoading();
        return;
      }

      const abortController = new AbortController();
      uploadAbortControllerRef.current = abortController;
      currentFileRef.current = file;

      try {
        const mediaUrl = await executeFileUpload(
          async () => {
            return await uploadMedia(file, userResult.user.id);
          },
          file.name,
          file.size,
          {
            canCancel: true,
            abortSignal: abortController.signal,
            onCancel: () => {
              console.log("🛑 File upload cancelled by user");
              uploadAbortControllerRef.current = null;
              // Optionally clean up the preview if user cancels
              setFormData((prev) => {
                if (prev.mediaUrl && prev.mediaUrl.startsWith("blob:")) {
                  URL.revokeObjectURL(prev.mediaUrl);
                }
                return {
                  ...prev,
                  media: undefined,
                  mediaUrl: undefined,
                  serverUrl: undefined,
                };
              });
              // Clear related state
              setTemplatedImageUrl("");
              setSelectedTemplate(undefined);
              setImageAnalysis("");
              setVideoThumbnailUrl("");
              setOriginalVideoFile(null);
              setVideoAspectRatio(null);
            },
          }
        );

        // If mediaUrl is null, upload was aborted - don't proceed
        if (!mediaUrl) {
          console.log("📛 Upload was aborted, skipping further processing");
          uploadAbortControllerRef.current = null;
          return;
        }

        // Double-check: if abort controller was cleared (mode was switched), don't add the image
        if (!uploadAbortControllerRef.current) {
          console.log(
            "📛 Upload was aborted before completion, skipping image addition"
          );
          return;
        }

        // Triple-check: verify this is still the current file being processed
        if (currentFileRef.current !== file) {
          console.log(
            "📛 A different file is now being processed, skipping old file update"
          );
          return;
        }

        console.log("✅ Upload successful, URL:", mediaUrl);
        uploadAbortControllerRef.current = null; // Clear abort controller after successful upload
        currentFileRef.current = null; // Clear current file ref

        setFormData((prev) => {
          if (prev.mediaUrl && prev.mediaUrl.startsWith("blob:")) {
            URL.revokeObjectURL(prev.mediaUrl);
            console.log("🗑️ Cleaned up previous blob URL");
          }

          const newData = {
            ...prev,
            media: file,
            mediaUrl: mediaUrl,
            serverUrl: mediaUrl,
          };
          console.log("Final formData with server URL:", {
            media: !!newData.media,
            mediaUrl: !!newData.mediaUrl,
            serverUrl: !!newData.serverUrl,
          });
          return newData;
        });

        // Final state check
        console.log("Final state after upload process:", {
          media: !!formData.media,
          mediaUrl: !!formData.mediaUrl,
          templatedImageUrl: !!templatedImageUrl,
          videoThumbnailUrl: !!videoThumbnailUrl,
          isVideo: isVideoFile(file),
          showPreview: !!(formData.media || formData.mediaUrl),
        });

        // Upload complete - no further actions until user clicks Generate Post
        if (file.type.startsWith("image/")) {
          console.log("✅ Image uploaded successfully");
        } else if (isVideoFile(file)) {
          console.log("✅ Video uploaded successfully");
        }
      } catch (error) {
        console.error("❌ Error uploading file:", error);
        if (error instanceof Error) {
          console.log(
            "📱 File should still be set for local preview, error was:",
            error.message
          );
        } else {
          console.log(
            "📱 File should still be set for local preview, unknown error:",
            error
          );
        }
      }
    } catch (error) {
      console.error("❌ Unexpected error in handleFileUpload:", error);
    }
  };

  const analyzeImage = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    setAnalyzingImage(true);
    try {
      const base64 = await fileToBase64(file);

      console.log("Analyzing image with Gemini API...");

      // Call the Gemini analysis API with proper data URL format
      const dataUrl = `data:${file.type};base64,${base64}`;

      const apiUrl =
        import.meta.env.VITE_API_URL ||
        (typeof window !== "undefined"
          ? `${window.location.protocol}//${window.location.host}`
          : "http://localhost:5000/api");
      const response = await fetch(`${apiUrl}/ai/analyze-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: dataUrl,
          mimeType: file.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Analysis API error:", errorData);
        throw new Error(errorData.error || "Failed to analyze image");
      }

      const result = await response.json();
      console.log("Analysis result:", result);

      if (result.success && result.analysis) {
        setImageAnalysis(result.analysis);
        console.log("Image analysis completed successfully");
      } else {
        console.log("No analysis in result:", result);
        setImageAnalysis(
          "Image uploaded successfully. Add a description for better content generation."
        );
      }
    } catch (error: any) {
      console.error("Error analyzing image:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      setImageAnalysis(
        `Image uploaded successfully. ${
          error.message?.includes("quota")
            ? "AI analysis quota exceeded."
            : "Add a description for better content generation."
        }`
      );
    } finally {
      setAnalyzingImage(false);
    }
  };

  const analyzeImageFromUrl = async (imageUrl: string) => {
    setAnalyzingImage(true);
    try {
      console.log("Analyzing AI-generated image from URL with Gemini API...");

      // Fetch the image and convert to base64
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error("Failed to fetch image from URL");
      }

      const blob = await imageResponse.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === "string") {
            resolve(result.split(",")[1]); // Get base64 part
          } else {
            reject(new Error("FileReader result is not a string"));
          }
        };
        reader.onerror = (error) => reject(error);
      });

      const dataUrl = `data:${blob.type};base64,${base64}`;

      const apiUrl =
        import.meta.env.VITE_API_URL ||
        (typeof window !== "undefined"
          ? `${window.location.protocol}//${window.location.host}`
          : "http://localhost:5000/api");
      const response = await fetch(`${apiUrl}/ai/analyze-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: dataUrl,
          mimeType: blob.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze image");
      }

      const result = await response.json();
      console.log("Analysis result:", result);

      if (result.success && result.analysis) {
        setImageAnalysis(result.analysis);
      } else {
        setImageAnalysis(
          "AI-generated image analyzed. Add a description for better content generation."
        );
      }
    } catch (error: any) {
      setImageAnalysis(
        `AI-generated image loaded successfully. ${
          error.message?.includes("quota")
            ? "AI analysis quota exceeded."
            : "Add a description for better content generation."
        }`
      );
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // const cost = getCost();

    // if (balance < cost) {
    //   navigate("/pricing");
    //   return;
    // }
    console.log("formData.generateImageWithPost", formData.mediaUrl);
    console.log("generateImageWithPost", selectedImageMode);
    console.log("generateImageWithPost", generateImageWithPost);
    if (formData?.prompt?.trim()) {
      if (
        selectedImageMode === "textToImage" &&
        generateImageWithPost &&
        !formData.mediaUrl
      ) {
        await handleRegenerate(formData.prompt);

        return;
      }

      if (
        selectedImageMode === "textToImage" &&
        !generateImageWithPost &&
        !formData.mediaUrl
      ) {
        console.log("🎯 Image generation required - no image found");
        notify("error", t("generate_image_first"));
        return;
      }

      // For upload mode, check if image is uploaded
      if (
        selectedImageMode === "upload" &&
        !formData.mediaUrl &&
        !formData.media
      ) {
        console.log("🎯 Image upload required");
        notify("error", t("upload_image_first"));
        return;
      }

      // For uploaded images, open regeneration modal
      if (
        selectedImageMode === "upload" &&
        (formData.media || formData.mediaUrl)
      ) {
        console.log("📷 Upload mode: Opening regeneration modal with uploaded image");
        
        const imageUrl = formData.mediaUrl || (formData.media ? URL.createObjectURL(formData.media) : "");
        
        // Clear selectedFile so onFileSave won't upload it when Continue is clicked
        setSelectedFile(null);
        
        await handleRegenerate(formData.prompt, imageUrl);
        return;
      }

      // NEW: For uploaded videos, either generate thumbnail with AI or
      // allow using an uploaded custom thumbnail. This only runs for
      // aspect ratios that support thumbnails (not 9:16 stories).
      if (
        (selectedVideoMode === "upload" ||
          selectedVideoMode === "uploadShorts") &&
        originalVideoFile &&
        !is9x16Video(videoAspectRatio || 0)
      ) {
        // If user opted to generate thumbnail via AI, use existing flow
        if (generateVideoThumbnailAI) {
          console.log(
            "🎥 Generating video thumbnail from content description, then opening template editor..."
          );

          // Generate thumbnail using content description and aspect ratio
          const generatedThumbnailUrl = await generateThumbnailForPost(
            formData.prompt,
            videoAspectRatio
          );

          if (generatedThumbnailUrl) {
            console.log(
              "✅ Video thumbnail generated successfully, opening regeneration modal for editing"
            );

            // Show regeneration modal for user to edit/regenerate the video thumbnail
            setVideoThumbnailForRegeneration(generatedThumbnailUrl);
            setVideoThumbnailGenerations([generatedThumbnailUrl]); // Initialize with the first generated image
            setShowVideoThumbnailModal(true);
            return; // Exit here to wait for user confirmation in regeneration modal
          } else {
            console.error(
              "❌ Failed to generate video thumbnail, proceeding with normal flow without thumbnail"
            );
            // Continue with normal flow - video posts can work without thumbnails
          }
        } else {
          // User chose to upload a custom thumbnail instead of AI generation.
          // If a custom thumbnail URL already exists, open the template editor
          // immediately using that image.
          if (videoThumbnailUrl) {
            const blankTemplate = getTemplateById("blank-template");
            if (blankTemplate) {
              setSelectedTemplate(blankTemplate);
              setShowTemplateEditor(true);

              const currentCampaignInfo = campaignInfo || {
                name: "Default Campaign",
                industry: "General",
                brand_tone: "professional",
                target_audience: "General",
                description:
                  "General content generation without specific campaign context",
              };

              const postGenerationData = {
                prompt: formData.prompt,
                originalImageUrl: videoThumbnailUrl,
                originalVideoUrl: formData.mediaUrl,
                originalVideoFile: originalVideoFile,
                videoAspectRatio: videoAspectRatio,
                isVideoContent: true,
                campaignInfo: currentCampaignInfo,
                selectedPlatforms: formData.selectedPlatforms,
                imageAnalysis: `Custom thumbnail uploaded for video`,
                formData,
              };

              setPendingPostGeneration(postGenerationData);
              return;
            }
          }
        }
      }

      const currentFormData = formData; // Track the current form data state

      // Use fetched campaign info if available, otherwise use default values
      const currentCampaignInfo = campaignInfo || {
        name: "Default Campaign",
        industry: "General",
        brand_tone: "professional",
        target_audience: "General",
        description:
          "General content generation without specific campaign context",
      };

      console.log("Using campaign info:", {
        hasCampaign: !!campaignInfo,
        campaignInfo: currentCampaignInfo,
        fromContext: !!state.selectedCampaign,
      });

      // Use the current form data (which should include the generated image)
      // For videos, ensure we use the server URL if available, not blob URLs
      const isVideoContent = !!(
        originalVideoFile ||
        (currentFormData.media && isVideoFile(currentFormData.media))
      );

      console.log("🔍 Media URL determination debug:", {
        isVideoContent,
        hasServerUrl: !!currentFormData.serverUrl,
        hasMediaUrl: !!currentFormData.mediaUrl,
        hasTemplatedImage: !!templatedImageUrl,
        serverUrl: currentFormData.serverUrl?.substring(0, 80) + "...",
        mediaUrl: currentFormData.mediaUrl?.substring(0, 80) + "...",
        templatedImageUrl: templatedImageUrl?.substring(0, 80) + "...",
        shouldUseServerUrl: isVideoContent && currentFormData.serverUrl,
      });

      // Prioritize templated image URL (from template editor) over other URLs
      const finalMediaUrlForAssets =
        templatedImageUrl ||
        (isVideoContent && currentFormData.serverUrl
          ? currentFormData.serverUrl
          : currentFormData.mediaUrl);

      const mediaAssets = finalMediaUrlForAssets
        ? [
            {
              url: finalMediaUrlForAssets,
              type: isVideoContent
                ? "video"
                : currentFormData.media?.type || "image",
            },
          ]
        : [];

      console.log("📋 Final media assets for post data:", {
        mediaAssets,
        finalUrl: finalMediaUrlForAssets?.startsWith("blob:")
          ? "blob URL (WRONG!)"
          : "server URL (CORRECT)",
        fullUrl: finalMediaUrlForAssets?.substring(0, 80) + "...",
      });

      // For video content, ensure we override the mediaUrl with the server URL
      // For template-edited content, prioritize the templated image URL
      let finalPostData;
      if (templatedImageUrl) {
        // Use templated image URL (from template editor)
        finalPostData = {
          ...currentFormData,
          mediaUrl: templatedImageUrl,
          imageUrl: templatedImageUrl,
          serverUrl: templatedImageUrl, // Ensure compatibility with publishing
        };
      } else if (isVideoContent && currentFormData.serverUrl) {
        finalPostData = {
          ...currentFormData,
          mediaUrl: currentFormData.serverUrl, // Override with server URL for videos
          imageUrl: currentFormData.serverUrl, // Also set imageUrl for compatibility
          videoUrl: currentFormData.serverUrl, // Also set videoUrl for video posts
        };
      } else {
        finalPostData = currentFormData;
      }

      const postData = {
        ...finalPostData, // Use the updated form data with proper URLs
        prompt: formData.prompt,
        selectedPlatforms: formData.selectedPlatforms,
        platforms: formData.selectedPlatforms,
        campaignName: currentCampaignInfo.name,
        campaignInfo: currentCampaignInfo,
        mediaAssets,
        analysisResults: imageAnalysis,
        industry: currentCampaignInfo.industry,
        tone: currentCampaignInfo.brand_tone || currentCampaignInfo.brandTone,
        targetAudience:
          currentCampaignInfo.target_audience ||
          currentCampaignInfo.targetAudience,
        description: currentCampaignInfo.description,
        imageAnalysis: imageAnalysis,
        // Include thumbnailUrl for video posts
        thumbnailUrl:
          templatedImageUrl || videoThumbnailUrl || finalPostData.thumbnailUrl,
        // Additional campaign fields if available
        website: currentCampaignInfo.website,
        objective: currentCampaignInfo.objective,
        goals: currentCampaignInfo.goals,
        keywords: currentCampaignInfo.keywords,
        hashtags: currentCampaignInfo.hashtags,
      };

      console.log("📤 Final postData debug:", {
        mediaUrl: postData.mediaUrl?.startsWith("blob:")
          ? "blob URL (WRONG!)"
          : "server URL (CORRECT)",
        imageUrl: postData.imageUrl?.startsWith("blob:")
          ? "blob URL (WRONG!)"
          : "server URL (CORRECT)",
        videoUrl: postData.videoUrl?.startsWith("blob:")
          ? "blob URL (WRONG!)"
          : "server URL (CORRECT)",
        mediaUrlFull: postData.mediaUrl?.substring(0, 80) + "...",
        hasMediaAssets: mediaAssets.length > 0,
      });

      console.log("📤 Final post data being sent:", {
        hasMediaAssets: mediaAssets.length > 0,
        mediaAssetsCount: mediaAssets.length,
        prompt: postData.prompt?.substring(0, 50) + "...",
      });

      // If onNext callback is provided, use it
      if (onNext && typeof onNext === "function") {
        onNext(postData);
      } else {
        // Otherwise, simulate generation for preview
        // For videos, ensure we use the server URL if available, not blob URLs
        // For template-edited content, prioritize the templated image URL
        const isVideoContent = !!(
          originalVideoFile ||
          (formData.media && isVideoFile(formData.media))
        );
        const finalMediaUrl =
          templatedImageUrl ||
          (isVideoContent && formData.serverUrl
            ? formData.serverUrl
            : formData.mediaUrl);

        const simulatedGeneratedPosts = [
          {
            platform:
              (formData.selectedPlatforms && formData.selectedPlatforms[0]) ||
              "linkedin",
            content: formData.prompt,
            caption: formData.prompt,
            hashtags: formData.tags,
            mediaUrl: finalMediaUrl,
            imageUrl: finalMediaUrl,
            videoUrl: isVideoContent ? finalMediaUrl : undefined, // Add explicit videoUrl for video content
            thumbnailUrl:
              templatedImageUrl || videoThumbnailUrl || (currentFormData as any).thumbnailUrl, // Use templated image or videoThumbnailUrl as poster for videos
            isVideoContent: isVideoContent,
            videoAspectRatio: videoAspectRatio,
            engagement: Math.floor(Math.random() * 1000),
          },
        ];
        setGeneratedResults(simulatedGeneratedPosts);
        setShowPreview(true);
      }
    }
  };

  const togglePlatform = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms?.includes(platform as Platform)
        ? prev.selectedPlatforms.filter((p) => p !== platform)
        : [...(prev.selectedPlatforms || []), platform as Platform],
    }));
  };

  const useImageAnalysis = () => {
    setFormData((prev) => ({
      ...prev,
      prompt:
        prev.prompt +
        (prev.prompt ? "\n\n" : "") +
        `Image Analysis: ${imageAnalysis}`,
    }));
    setImageAnalysis("");
  };

  const performAIAnalysis = async () => {
    if (formData.media && formData.media.type.startsWith("image/")) {
      // Analyze uploaded image file
      await analyzeImage(formData.media);
    } else if (
      formData.mediaUrl &&
      !formData.media &&
      !formData.mediaUrl.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv|m4v)$/i)
    ) {
      // Analyze AI-generated image from URL
      await analyzeImageFromUrl(formData.mediaUrl);
    }
  };

  const [modelImage, setModelImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // For actual upload
  const [allGeneration, setAllGeneration] = useState<any>([]);
  const MAX_IMAGES = 3;

  const saveGeneratedImage = (imageUrl: string) => {
    let images: string[] = [];

    try {
      images = JSON.parse(localStorage.getItem("ai-generated-image") || "[]");
    } catch {
      images = [];
    }

    // Add new image at start
    images.unshift(imageUrl);

    // Keep only last N images
    images = images.slice(0, MAX_IMAGES);

    try {
      localStorage.setItem("ai-generated-image", JSON.stringify(images));
    } catch (err) {
      console.error("Storage full, clearing old images");
      localStorage.removeItem("ai-generated-image");
      localStorage.setItem("ai-generated-image", JSON.stringify([imageUrl]));
    }

    return images;
  };

  const handleAIImageGenerated = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "ai-generated-image.png", {
        type: "image/png",
      });
      setAllGeneration([...allGeneration, imageUrl]);

      if (selectedFile) {
        return;
      }
      setFormData((prev) => {
        const newData = {
          ...prev,
          media: file,
          mediaUrl: imageUrl,
          serverUrl: imageUrl,
        };

        return newData;
      });
    } catch (error) {
      console.log("error", error);
      setFormData((prev) => {
        const newData = { ...prev, mediaUrl: imageUrl };

        return newData;
      });

      // // Auto-open template editor with blank template only if requested
      // if (shouldAutoOpenTemplate) {
      //   console.log(
      //     "🎨 Auto-opening template editor with blank template for fallback image"
      //   );
      //   // Get blank template
      //   const blankTemplate = getTemplateById("blank-template");
      //   if (blankTemplate) {
      //     console.log(
      //       "📋 Setting blank template and opening editor for fallback image"
      //     );
      //     setTimeout(() => {
      //       setSelectedTemplate(blankTemplate);
      //       setShowTemplateEditor(true);
      //     }, 500); // Small delay to ensure state is updated
      //   } else {
      //     console.error(
      //       "❌ Blank template not found for fallback image - this should not happen!"
      //     );
      //     // Don't open anything if blank template is missing - this is a critical error
      //   }
      // }
    }
  };

  // Template handler functions
  const handleTemplateSelect = (template: Template) => {
    console.log("Template selected:", template.name);
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
    setShowTemplateEditor(true);
  };

  const handleTemplateEditorSave = async (imageUrl: string) => {
    console.log("Template editor saved with image URL:", imageUrl);

    // Ensure templated image has a stable, publishable server URL
    let finalTemplatedUrl = imageUrl;
    try {
      const needsUpload =
        !imageUrl ||
        imageUrl.startsWith("data:") ||
        imageUrl.startsWith("blob:");
      if (needsUpload) {
        console.log(
          "🆙 Templated image appears to be a local/data URL, uploading to storage..."
        );
        const user = await getCurrentUser();
        if (user?.user?.id) {
          // Fetch the image data and create a File for upload
          const resp = await fetch(imageUrl);
          const blob = await resp.blob();
          const ext =
            blob.type && blob.type.includes("png")
              ? "png"
              : blob.type && blob.type.includes("jpeg")
              ? "jpg"
              : "png";
          const file = new File(
            [blob],
            `templated-image-${Date.now()}.${ext}`,
            { type: blob.type || "image/png" }
          );
          const uploadedUrl = await uploadMedia(file, user.user.id);
          if (uploadedUrl) {
            console.log(
              "✅ Templated image uploaded. Server URL:",
              uploadedUrl
            );
            finalTemplatedUrl = uploadedUrl;
          } else {
          }
        } else {
        }
      } else {
      }
    } catch (uploadErr) {}

    setTemplatedImageUrl(finalTemplatedUrl);
    setFormData((prev) => ({
      ...prev,
      mediaUrl: finalTemplatedUrl,
      imageUrl: finalTemplatedUrl,
      serverUrl: finalTemplatedUrl,
    }));
    
    // Update videoThumbnailUrl if this is video content
    if (pendingPostGeneration?.isVideoContent) {
      setVideoThumbnailUrl(finalTemplatedUrl);
    }
    
    setShowTemplateEditor(false);

    if (pendingPostGeneration) {
      const {
        prompt,
        campaignInfo: currentCampaignInfo,
        selectedPlatforms,
        imageAnalysis,
        formData: originalFormData,
        isVideoContent,
        originalVideoUrl,
        originalVideoFile,
        videoAspectRatio,
      } = pendingPostGeneration;

      let currentFormData;
      let mediaAssets;

      if (isVideoContent && originalVideoUrl) {
        currentFormData = {
          ...originalFormData,
          mediaUrl: originalVideoUrl,
          thumbnailUrl: finalTemplatedUrl,
          videoFile: originalVideoFile,
          videoAspectRatio: videoAspectRatio,
        };

        mediaAssets = [
          {
            url: originalVideoUrl,
            type: "video",
            thumbnailUrl: finalTemplatedUrl,
            aspectRatio: videoAspectRatio,
          },
        ];
      } else {
        currentFormData = {
          ...originalFormData,
          mediaUrl: finalTemplatedUrl, // Use the templated image server URL
          imageUrl: finalTemplatedUrl,
          serverUrl: finalTemplatedUrl,
        };

        mediaAssets = [{ url: finalTemplatedUrl, type: "image" }];
      }

      const postData = {
        ...currentFormData,
        prompt: prompt,
        selectedPlatforms: selectedPlatforms,
        platforms: selectedPlatforms,
        campaignName: currentCampaignInfo?.name || "",
        campaignInfo: currentCampaignInfo,
        mediaAssets,
        analysisResults: imageAnalysis,
        industry: currentCampaignInfo?.industry || "",
        tone: currentCampaignInfo?.brand_tone || currentCampaignInfo?.brandTone,
        targetAudience:
          currentCampaignInfo?.target_audience ||
          currentCampaignInfo?.targetAudience ||
          "General",
        description: currentCampaignInfo?.description || "something nice",
        imageAnalysis: imageAnalysis,
        website: currentCampaignInfo?.website || "",
        objective: currentCampaignInfo?.objective || "",
        goals: currentCampaignInfo?.goals || "",
        keywords: currentCampaignInfo?.keywords || "interesting , modern",
        hashtags: currentCampaignInfo?.hashtags,
        // Add video-specific metadata if applicable
        ...(isVideoContent && {
          isVideoContent: true,
          videoAspectRatio: videoAspectRatio,
          originalVideoFile: originalVideoFile,
        }),
      };

      console.log("📤 Final post data:", {
        hasMediaAssets: mediaAssets.length > 0,
        mediaAssetsCount: mediaAssets.length,
        isVideo: isVideoContent,
        prompt: postData.prompt?.substring(0, 50) + "...",
      });

      // Clear pending post generation
      setPendingPostGeneration(null);
      setIsGeneratingBoth(false);

      // Proceed with post generation
      if (onNext && typeof onNext === "function") {
        console.log("✅ Final step: Calling onNext with final post data...");
        onNext(postData);
        console.log("✅ Template editing completed!");
      } else {
        console.log("⚠️ No onNext function provided, showing preview instead");
        // Fallback: simulate generation for preview
        const simulatedGeneratedPosts = [
          {
            platform: (selectedPlatforms && selectedPlatforms[0]) || "linkedin",
            content: prompt,
            caption: prompt,
            hashtags: originalFormData.tags,
            engagement: Math.floor(Math.random() * 1000),
          },
        ];
        setGeneratedResults(simulatedGeneratedPosts);
        setShowPreview(true);
      }
    } else {
      // Standalone template application - navigate to generation screen if user has content
      console.log(
        "🎯 Standalone template applied. Checking if user has content to proceed..."
      );

      if (formData?.prompt && formData?.prompt?.trim()) {
        console.log(
          "✅ User has content, proceeding to post generation after template application"
        );

        // Prepare the post data with the templated image
        const currentCampaignInfo = campaignInfo || {
          name: "Default Campaign",
          industry: "General",
          brand_tone: "professional",
          target_audience: "General",
          description:
            "General content generation without specific campaign context",
        };

        // Check if this is video content (based on current video state)
        const isCurrentVideoContent = originalVideoFile && videoThumbnailUrl;

        let postData;
        if (isCurrentVideoContent) {
          // For video content, use original video URL but edited thumbnail
          postData = {
            ...formData,
            mediaUrl: formData.mediaUrl, // Keep original video URL
            thumbnailUrl: finalTemplatedUrl, // Use edited thumbnail
            videoFile: originalVideoFile,
            videoAspectRatio: videoAspectRatio,
            isVideoContent: true,
            campaignName: currentCampaignInfo.name,
            campaignInfo: currentCampaignInfo,
            mediaAssets: [
              {
                url: formData.mediaUrl,
                type: "video",
                thumbnailUrl: finalTemplatedUrl,
                aspectRatio: videoAspectRatio,
              },
            ],
            industry: currentCampaignInfo.industry,
            tone:
              currentCampaignInfo.brand_tone || currentCampaignInfo.brandTone,
            targetAudience:
              currentCampaignInfo.target_audience ||
              currentCampaignInfo.targetAudience,
            description: currentCampaignInfo.description,
            imageAnalysis: imageAnalysis,
            website: currentCampaignInfo.website,
            objective: currentCampaignInfo.objective,
            goals: currentCampaignInfo.goals,
            keywords: currentCampaignInfo.keywords,
            hashtags: currentCampaignInfo.hashtags,
          };
        } else {
          // For image content, use templated image
          postData = {
            ...formData,
            mediaUrl: finalTemplatedUrl, // Use the templated image server URL
            imageUrl: finalTemplatedUrl,
            serverUrl: finalTemplatedUrl,
            campaignName: currentCampaignInfo.name,
            campaignInfo: currentCampaignInfo,
            mediaAssets: [{ url: finalTemplatedUrl, type: "image" }],
            industry: currentCampaignInfo.industry,
            tone:
              currentCampaignInfo.brand_tone || currentCampaignInfo.brandTone,
            targetAudience:
              currentCampaignInfo.target_audience ||
              currentCampaignInfo.targetAudience,
            description: currentCampaignInfo.description,
            imageAnalysis: imageAnalysis,
            website: currentCampaignInfo.website,
            objective: currentCampaignInfo.objective,
            goals: currentCampaignInfo.goals,
            keywords: currentCampaignInfo.keywords,
            hashtags: currentCampaignInfo.hashtags,
          };
        }

        console.log("🚀 Navigating to post generation with templated content");

        // Navigate to the generation screen
        if (onNext && typeof onNext === "function") {
          onNext(postData);
        }
      } else {
        console.log(
          "⚠️ No content provided - template applied but staying on current screen"
        );
      }
    }
  };
  const handleTemplateEditorCancel = () => {
    setShowTemplateEditor(false);
    setSelectedTemplate(undefined);

    // Clear all media when canceling from template editor
    console.log("🗑️ Clearing all media when canceling from template editor");

    // Clean up blob URLs if they exist
    if (formData.mediaUrl && formData.mediaUrl.startsWith("blob:")) {
      URL.revokeObjectURL(formData.mediaUrl);
      console.log("🗑️ Cleaned up blob URL during template editor cancel");
    }

    setFormData((prev) => ({
      ...prev,
      media: undefined,
      mediaUrl: undefined,
      serverUrl: undefined,
      imageUrl: undefined,
      videoUrl: undefined,
      thumbnailUrl: undefined,
    }));

    setTemplatedImageUrl("");
    setImageAnalysis("");
    setVideoThumbnailUrl("");
    setOriginalVideoFile(null);
    setVideoAspectRatio(null);

    if (pendingPostGeneration) {
      console.log("❌ Template editor cancelled, aborting post generation");
      setPendingPostGeneration(null);
      setIsGeneratingBoth(false);
    }
  };

  const handleTemplateSelectorCancel = () => {
    setShowTemplateSelector(false);

    if (pendingPostGeneration) {
      console.log("❌ Template selector cancelled, aborting post generation");
      setPendingPostGeneration(null);
      setIsGeneratingBoth(false);
    }
  };

  const handleEditTemplate = () => {
    if (templatedImageUrl && selectedTemplate) {
      setShowTemplateEditor(true);
    }
  };

  const handleDeleteTemplate = () => {
    setTemplatedImageUrl("");
    setSelectedTemplate(undefined);
    setFormData((prev) => ({
      ...prev,
      mediaUrl: prev.media ? URL.createObjectURL(prev.media) : undefined,
    }));
  };

  const handleAspectRatioChange = (newAspectRatio: string) => {
    setAspectRatio(newAspectRatio);
  };

  const generateThumbnailForPost = async (
    contentDescription: string,
    aspectRatio: number | null
  ): Promise<string | null> => {
    setIsGeneratingThumbnail(true);
    try {
      return await executeVideoThumbnailGeneration(async () => {
        console.log(
          "🎨 Generating video thumbnail from content description:",
          contentDescription.substring(0, 100) + "..."
        );
        console.log("📐 Input video aspect ratio:", aspectRatio);

        const apiUrl =
          import.meta.env.VITE_API_URL ||
          (typeof window !== "undefined"
            ? `${window.location.protocol}//${window.location.host}`
            : "http://localhost:5000/api");

        const targetAspectRatio = "16:9";
        const aspectRatioDescription =
          "16:9 horizontal/landscape format (forced)";
        console.log("📐 Forcing thumbnail aspect ratio to 16:9");

        const thumbnailPrompt = `Create a compelling video thumbnail for ${aspectRatioDescription} video about: ${contentDescription.trim()}. Make it eye-catching, professional, and suitable for social media platforms. Include relevant visual elements that represent the content. Do not include any text, words, letters, numbers, captions, watermarks, logos, or typography. Pure imagery only.`;

        console.log("📝 Thumbnail prompt:", thumbnailPrompt);
        console.log(
          "📐 Final target aspect ratio:",
          targetAspectRatio,
          "(" + aspectRatioDescription + ")"
        );

        const requestBody = {
          prompt: thumbnailPrompt,
          style: "professional",
          aspectRatio: targetAspectRatio,
        };

        console.log("📋 Request body for thumbnail generation:", requestBody);

        const response = await API.generateImage(requestBody);

        const result = await response.data;
        if (!result.success || !result.imageUrl) {
          throw new Error(result.error || "Video thumbnail generation failed");
        }

        console.log("✅ Video thumbnail generated successfully");

        // Try to upload generated thumbnail to our storage for a stable URL
        try {
          const user = await getCurrentUser();
          if (user?.user?.id) {
            const imgResp = await fetch(result.imageUrl);
            const blob = await imgResp.blob();
            const file = new File([blob], `video-thumbnail-${Date.now()}.png`, {
              type: "image/png",
            });
            const uploadedUrl = await uploadMedia(file, user.user.id);
            console.log("📤 Video thumbnail uploaded to storage:", uploadedUrl);
            setVideoThumbnailUrl(uploadedUrl);
            return uploadedUrl;
          }
        } catch (uploadErr) {
          console.warn(
            "Failed to upload video thumbnail, using direct URL:",
            uploadErr
          );
        }

        setVideoThumbnailUrl(result.imageUrl);
        return result.imageUrl;
      }, "Generating video thumbnail from content description");
    } catch (error) {
      console.error("❌ Error in generateThumbnailForPost:", error);
      return null;
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  // Handle user-uploaded custom thumbnail for video posts
  const handleCustomThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomThumbnailUploading(true);
    try {
      const userResult = await getCurrentUser();
      if (!userResult?.user) {
        notify("error", t("must_be_signed_in_upload_thumbnail"));
        return;
      }

      // Create abort controller for custom thumbnail upload
      const thumbnailAbortController = new AbortController();
      uploadAbortControllerRef.current = thumbnailAbortController;

      const mediaUrl = await executeFileUpload(
        async () => await uploadMedia(file, userResult.user.id),
        file.name,
        file.size,
        {
          canCancel: true,
          abortSignal: thumbnailAbortController.signal,
          onCancel: () => {
            console.log("Custom thumbnail upload cancelled");
            uploadAbortControllerRef.current = null;
          },
        }
      );

      // If upload was aborted, don't proceed
      if (!mediaUrl || !uploadAbortControllerRef.current) {
        console.log("📛 Custom thumbnail upload was aborted");
        uploadAbortControllerRef.current = null;
        return;
      }

      console.log("✅ Custom thumbnail uploaded:", mediaUrl);
      uploadAbortControllerRef.current = null;
      setVideoThumbnailUrl(mediaUrl);

      // Immediately open template editor for uploaded thumbnail
      const blankTemplate = getTemplateById("blank-template");
      if (blankTemplate) {
        setSelectedTemplate(blankTemplate);
        setShowTemplateEditor(true);

        const currentCampaignInfo = campaignInfo || {
          name: "Default Campaign",
          industry: "General",
          brand_tone: "professional",
          target_audience: "General",
          description:
            "General content generation without specific campaign context",
        };

        const postGenerationData = {
          prompt: formData.prompt,
          originalImageUrl: mediaUrl,
          originalVideoUrl: formData.mediaUrl,
          originalVideoFile: originalVideoFile,
          videoAspectRatio: videoAspectRatio,
          isVideoContent: true,
          campaignInfo: currentCampaignInfo,
          selectedPlatforms: formData.selectedPlatforms,
          imageAnalysis: `Custom thumbnail uploaded for video`,
          formData,
        };

        setPendingPostGeneration(postGenerationData);
      }
    } catch (err) {
      console.error("Failed to upload custom thumbnail:", err);
      notify("error", t("failed_upload_thumbnail"));
    } finally {
      setCustomThumbnailUploading(false);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    }
  };

  // Inline image generation function
  const handleGenerateImage = async () => {
    if (!imageDescription.trim()) return;

    setIsGeneratingImage(true);
    try {
      await executeImageGeneration(async () => {
        const response = await API.generateImage({
          prompt: `${imageDescription.trim()}. Do not include any text, words, letters, numbers, captions, watermarks, logos, or typography. Pure imagery only.`,
          style: "professional",
          aspectRatio: aspectRatio,
          quality: "standard",
          model: "gemini-2.5-flash-image-preview",
        });

        const result = await response.data;
        console.log("🎨 Image generation API response:", result);
        if (result.success && result.imageUrl) {
          await handleAIImageGenerated(result.imageUrl);
          setImageDescription(""); // Clear the description field
          return result;
        } else {
          throw new Error(result.error || "Image generation failed");
        }
      }, "Creating your custom image");
    } catch (error) {
      console.error("❌ Error in handleGenerateImage:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };
  const [modifyMode, setModify] = useState(false);
  // Combined generation function - generates both post and image from main prompt
  const handleCombinedGeneration = async (
    prompt: string,
    image?: any
  ): Promise<string | null> => {
    return await executeImageGeneration(async () => {
      const response = await API.generateImage({
        prompt: `${prompt.trim()}. Do not include any text, words, letters, numbers, captions, watermarks, logos, or typography. Pure imagery only.`,
        style: "professional",
        ...(image && modifyMode === true && { imageUrl: image }),
        aspectRatio: String(aspectRatio),
        ...(image && modifyMode === true && { modifyMode: true }),
      });

      const result = response.data;
      if (result.success && result.imageUrl) {
        await handleAIImageGenerated(result.imageUrl);
        setImageDescription("");
        return result;
      } else {
        throw new Error(result.error || "Image generation failed");
      }
    }, "Creating your custom image");
  };
  const [isGeneratingImageUpload, setIsGeneratingImageUpload] = useState("");
  const isUrl = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const urlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  const handleRegenerate = async (newPrompt: string, Url?: string) => {
    try {
      setIsGeneratingBoth(true);

      const currentCampaignInfo = campaignInfo || {
        name: "Default Campaign",
        industry: "General",
        brand_tone: "professional",
        target_audience: "General",
        description:
          "General content generation without specific campaign context",
      };

      let finalImageUrl: string | null = null;

      // Determine which image to use: provided URL (upload), or generatedImage (modify mode), or none (textToImage)
      const imageToModify = Url || generatedImage;

      if (modifyMode && imageToModify) {
        // Modify mode: Regenerate with existing image as base
        console.log("🔄 Modify mode: Regenerating with existing image as base");
        const result: any = await handleCombinedGeneration(newPrompt, imageToModify);
        finalImageUrl = result.imageUrl;
        setGeneratedImage(finalImageUrl);
        setAllGeneration([...allGeneration, finalImageUrl]);
      } else if (Url && !modifyMode) {
        // Upload mode without modify: Use uploaded image directly, no generation
        finalImageUrl = Url;
        console.log("📷 Upload mode: Using selected image directly, no AI generation");
        setGeneratedImage(finalImageUrl);
        setAllGeneration([finalImageUrl]);
      } else {
        // TextToImage mode: Generate image from prompt
        console.log("🎨 TextToImage mode: Generating image from prompt");
        const result: any = await handleCombinedGeneration(newPrompt);
        finalImageUrl = result.imageUrl;
        setGeneratedImage(finalImageUrl);
        setAllGeneration([finalImageUrl]);
      }

      // Open the modal with the image (generated or selected)
      setModelImage(true);

      // Store post generation data for template editor
      const postGenerationData = {
        prompt: newPrompt,
        originalImageUrl: finalImageUrl,
        campaignInfo: currentCampaignInfo,
        selectedPlatforms: formData.selectedPlatforms,
        imageAnalysis,
        formData,
      };
      setPendingPostGeneration(postGenerationData);
      setIsGeneratingBoth(false);
    } catch (error) {
      setFormData((prev) => {
        const newData = {
          ...prev,
          mediaUrl: undefined,
          serverUrl: undefined,
        };

        return newData;
      });
      setIsGeneratingBoth(true);
      setGeneratedImage(null);
      setPendingPostGeneration({});
      setModelImage(false);
      setIsGeneratingBoth(false);
      setIsGeneratingThumbnail(false);
    }
  };

  const handleVideoThumbnailRegenerate = async (
    newPrompt: string,
    Url?: string
  ) => {
    try {
      console.log(
        "🎥 Regenerating video thumbnail with new prompt:",
        newPrompt
      );

      let isModifyMode = Url !== null && Url !== undefined;
      let imageToProcess = isModifyMode ? Url : videoThumbnailForRegeneration;

      // Convert URL to Base64 if needed
      if (imageToProcess && isUrl(imageToProcess)) {
        imageToProcess = await urlToBase64(imageToProcess);
      }

      // Build payload matching the structure
      const payload = {
        prompt: newPrompt,
        style: "professional",
        imageUrl: imageToProcess || undefined,
        aspectRatio: String(videoAspectRatio || "16:9"),
        modifyMode: isModifyMode,
      };

      console.log("📤 Video thumbnail regeneration payload:", payload);

      // Call API with the payload structure
      return await executeImageGeneration(async () => {
        const response = await API.generateImage({
          prompt: `${newPrompt.trim()}. Do not include any text, words, letters, numbers, captions, watermarks, logos, or typography. Pure imagery only.`,
          style: "professional",
          ...(imageToProcess && { imageUrl: imageToProcess }),
          aspectRatio: String(videoAspectRatio || "16:9"),
          ...(isModifyMode && { modifyMode: true }),
        });

        const result = response.data;
        if (result.success && result.imageUrl) {
          console.log("✅ Video thumbnail regenerated successfully");
          setVideoThumbnailForRegeneration(result.imageUrl);
          setVideoThumbnailGenerations([
            ...videoThumbnailGenerations,
            result.imageUrl,
          ]);
          return result;
        } else {
          throw new Error(result.error || "Video thumbnail generation failed");
        }
      }, "Regenerating video thumbnail");
    } catch (error) {
      console.error("❌ Error regenerating video thumbnail:", error);
      if (error instanceof Error) {
        notify("error", `Failed to regenerate thumbnail: ${error.message}`);
      }
    }
  };

  const confirmImage = async () => {
    try {
      // Close the modal first
      setModelImage(false);
      
      // Small delay to ensure modal closes before opening template editor
      setTimeout(() => {
        const blankTemplate = getTemplateById("blank-template");
        if (blankTemplate) {
          setSelectedTemplate(blankTemplate);
          setShowTemplateEditor(true);
        }
      }, 200);
    } catch (error) {
      if (error instanceof Error) {
        notify("error", `Failed to confirm image: ${error.message}`);
      }
    }
  };

  const confirmVideoThumbnail = async () => {
    try {
      console.log("✅ Video thumbnail confirmed, opening template editor");
      setShowVideoThumbnailModal(false);
      const blankTemplate = getTemplateById("blank-template");
      if (blankTemplate) {
        setTimeout(() => {
          setSelectedTemplate(blankTemplate);
          setShowTemplateEditor(true);

          // Store post generation data for template editor
          const currentCampaignInfo = campaignInfo || {
            name: "Default Campaign",
            industry: "General",
            brand_tone: "professional",
            target_audience: "General",
            description:
              "General content generation without specific campaign context",
          };

          const postGenerationData = {
            prompt: formData.prompt,
            originalImageUrl: videoThumbnailForRegeneration, // Use confirmed video thumbnail
            originalVideoUrl: formData.mediaUrl,
            originalVideoFile: originalVideoFile,
            videoAspectRatio: videoAspectRatio,
            isVideoContent: true,
            campaignInfo: currentCampaignInfo,
            selectedPlatforms: formData.selectedPlatforms,
            imageAnalysis: `Video thumbnail for ${
              is16x9Video(videoAspectRatio || 0)
                ? "16:9 horizontal"
                : "custom aspect ratio"
            } video`,
            formData,
          };

          setPendingPostGeneration(postGenerationData);
        }, 500);
      }
    } catch (error) {
      if (error instanceof Error) {
        notify("error", `Failed to proceed: ${error.message}`);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplatedImageUrl("");
    setSelectedTemplate(undefined);
    setImageAnalysis("");
    setVideoThumbnailUrl("");
    setOriginalVideoFile(null);
    setVideoAspectRatio(null);

    const file = e.target.files?.[0];
    if (!file) return;

    // For videos, upload directly without modal
    if (file.type.startsWith("video/")) {
      console.log("🎥 Video file selected, uploading directly");
      handleFileUpload(file);
      return;
    }

    // For images, open the regeneration modal
    setGeneratedImage(null);
    setSelectedFile(file);
    setIsGeneratingImageUpload("");
    setModelImage(true);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setGeneratedImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const onFileSave = () => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        mediaUrl: undefined,
        serverUrl: undefined,
      };

      return newData;
    });
    if (isGeneratingImageUpload) {
      setFormData((prev) => {
        const newData = {
          ...prev,
          mediaUrl: isGeneratingImageUpload,
          serverUrl: isGeneratingImageUpload,
        };
        return newData;
      });
      setModelImage(false);
    } else if (selectedFile) {
      handleFileUpload(selectedFile);
      setModelImage(false);
    }
  };

  return (
    <div className="w-full mx-auto rounded-md border border-white/10  md:p-5 p-3 ">
      {modelImage && (
        <ImageRegenerationModal
          imageUrl={generatedImage}
          isLoading={isGeneratingBoth}
          allGeneration={allGeneration}
          setAllGeneration={setAllGeneration}
          setModify={setModify}
          modifyMode={modifyMode}
          generationAmounts={generationAmounts["image"]}
          onClose={() => {
            setModelImage(false);
            setSelectedFile(null);
            setGeneratedImage(null);
            setIsGeneratingImageUpload("");
            setAllGeneration([]);
            setFormData((prev) => {
              const newData = {
                ...prev,
                mediaUrl: undefined,
                serverUrl: undefined,
              };

              return newData;
            });
          }}
          onRegenerate={handleRegenerate}
          confirmImage={confirmImage}
          onFileSave={onFileSave}
          selectedFile={selectedFile}
        />
      )}
      {showVideoThumbnailModal && videoThumbnailForRegeneration && (
        <ImageRegenerationModal
          imageUrl={videoThumbnailForRegeneration}
          isLoading={false}
          allGeneration={videoThumbnailGenerations}
          setAllGeneration={setVideoThumbnailGenerations}
          setModify={setVideoModify}
          modifyMode={videoModifyMode}
          generationAmounts={generationAmounts["image"]}
          onClose={() => {
            setShowVideoThumbnailModal(false);
            setVideoThumbnailForRegeneration("");
            setVideoThumbnailGenerations([]);
            setVideoModify(false);
          }}
          onRegenerate={handleVideoThumbnailRegenerate}
          confirmImage={confirmVideoThumbnail}
          onFileSave={() => {}}
          selectedFile={null}
        />
      )}
      {!showTemplateEditor && (
        <>
          <div className="text-left mb-4">
            <h2 className="text-3xl md:font-bold font-semibold theme-text-primary mb-2  ">
              {t("create_auto_optimize")}
            </h2>
            <p className="text-sm text-gray-500 font-medium md:font-semibold ">
              {t("generate_on_brand")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 ">
              <div className="z-10">
                <label className="block text-sm font-semibold theme-text-primary mb-2 ">
                  {t("select_post_type")}
                </label>
                <div className="grid grid-cols-3 gap-4 text-sm md:text-base">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedPostType !== "text") {
                        setFormData((prev) => ({
                          ...prev,
                          media: undefined,
                          mediaUrl: undefined,
                        }));
                        setTemplatedImageUrl("");
                        setSelectedTemplate(undefined);
                        setImageAnalysis("");
                        setVideoThumbnailUrl("");
                        setOriginalVideoFile(null);
                        setVideoAspectRatio(null);
                        setSelectedImageMode("");
                        setSelectedVideoMode("");
                        currentFileRef.current = null;
                      }
                      setSelectedPostType(
                        selectedPostType === "text" ? "" : "text"
                      );
                    }}
                    className={`  border  duration-200 text-center px-2 py-3 rounded-md  ${
                      selectedPostType === "text"
                        ? "selected-main-button"
                        : "unselected-main-button"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`  `}>
                        <img
                          src={TextPostIcon}
                          alt=""
                          className={`  md:w-[44px] md:h-[44px] w-[38px] h-[38px] `}
                        />
                      </div>
                      <div>
                        <h3 className={`font-semibold leading-[1.2rem] mt-1  `}>
                          {t("create")}
                          <br />
                          {t("text_post")}
                        </h3>
                      </div>
                    </div>
                  </button>

                  {/* Image Post */}
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedPostType !== "image") {
                        setSelectedFile(null);
                        setShowImageMenu(true);
                      } else {
                        setSelectedFile(null);

                        setShowImageMenu(!showImageMenu);
                      }

                      setSelectedPostType("image");
                    }}
                    className={` relative  border shadow-md backdrop-blur-md border-slate-200/70 transition-all duration-200  text-center px-2 py-3 rounded-md ${
                      selectedPostType === "image"
                        ? "selected-main-button"
                        : "unselected-main-button"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`   `}>
                        <img
                          src={ImagePostIcon}
                          alt=""
                          className={`md:w-[48px] md:h-[48px] w-[38px] h-[38px] `}
                        />
                      </div>
                      <div>
                        <h3
                          className={`font-semibold text-md leading-[1.2rem] mt-1 text p-0 `}
                        >
                          {t("create")}
                          <br />
                          {t("image_post")}
                        </h3>
                      </div>
                    </div>
                    <div
                      className={`absolute w-full left-0 mt-3 z-10 ${
                        showImageMenu ? "" : "hidden"
                      }`}
                    >
                      <div
                        className={`grid grid-cols-1 gap-[1px] pt-[1px] ${
                          showImageMenu ? "" : "hidden"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            // Abort any in-progress upload
                            if (uploadAbortControllerRef.current) {
                              uploadAbortControllerRef.current.abort();
                              uploadAbortControllerRef.current = null;
                            }
                            // Clear the current file being processed
                            currentFileRef.current = null;
                            // Close the upload progress modal
                            hideLoading();
                            setShowImageMenu(false);
                            // Clear any previously selected/generated image when switching modes

                            setSelectedFile(null);

                            setFormData((prev) => ({
                              ...prev,
                              media: undefined,
                              mediaUrl: undefined,
                            }));

                            setOriginalVideoFile(null);
                            setVideoAspectRatio(null);
                            setVideoThumbnailUrl("");
                            setVideoAspectRatioWarning("");
                            setSelectedVideoMode("");
                            currentFileRef.current = null;
                            setTemplatedImageUrl("");
                            setSelectedTemplate(undefined);
                            setImageAnalysis("");
                            setSelectedImageMode("upload");
                          }}
                          className={`p-3 rounded-md border transition shadow-md backdrop-blur-md border-slate-200/70 transition-all duration-200 text-center 
                        ${selectedPostType === "image" ? "" : "hidden"}
                        ${
                          selectedImageMode === "upload"
                            ? "selected-sub-button "
                            : "unselected-sub-button"
                        }`}
                        >
                          <div className="flex flex-col items-center space-y-0">
                            <div>
                              <Icon name="upload" size={40} />
                            </div>
                            <div>
                              <h3
                                className={`font-semibold text-sm leading-[1.2rem] mt-1 text
                        
                       `}
                              >
                                {t("upload")}
                                <br />
                                {t("image")}
                              </h3>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (uploadAbortControllerRef.current) {
                              uploadAbortControllerRef.current.abort();
                              uploadAbortControllerRef.current = null;
                            }
                            hideLoading();
                            setSelectedFile(null);

                            setSelectedImageMode("textToImage");
                            setShowImageMenu(false);
                            setFormData((prev) => ({
                              ...prev,
                              media: undefined,
                              mediaUrl: undefined,
                            }));
                            setTemplatedImageUrl("");
                            setSelectedTemplate(undefined);
                            setImageAnalysis("");
                            setOriginalVideoFile(null);
                            setVideoAspectRatio(null);
                            setVideoThumbnailUrl("");
                            setVideoAspectRatioWarning("");
                            setSelectedVideoMode("");
                          }}
                          className={`p-3   border rounded-md transition-all duration-200 text-center 
                        ${selectedPostType === "image" ? "" : "hidden"}
                        ${
                          selectedImageMode === "textToImage"
                            ? "selected-sub-button "
                            : "unselected-sub-button"
                        }`}
                        >
                          <div className="flex flex-col items-center space-y-0 ">
                            <div>
                              <Icon
                                name="text-to-image"
                                size={44}
                                className={``}
                              />
                            </div>
                            <div>
                              <h3
                                className={`font-semibold text-sm leading-[1.2rem] mt-1 text`}
                              >
                                {t("text")}
                                <br /> {t("to_image")}
                              </h3>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </button>

                  {/* Video Post */}
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedPostType !== "video") {
                        setShowVideoMenu(true);
                        setSelectedPostType("video");
                      } else {
                        setShowVideoMenu(!showVideoMenu);
                      }
                    }}
                    className={`relative border shadow-md backdrop-blur-md border-slate-200/70 transition-all duration-200 text-center px-2 py-3 rounded-md ${
                      selectedPostType === "video"
                        ? "selected-main-button"
                        : "unselected-main-button"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div>
                        <img
                          src={VideoPostIcon}
                          alt=""
                          className={` md:w-[48px] md:h-[48px] w-[38px] h-[38px] `}
                        />
                      </div>
                      <div>
                        <h3
                          className={`font-semibold text-md leading-[1.2rem] mt-1 text p-0 `}
                        >
                          {t("create")}
                          <br />
                          {t("video_post")}
                        </h3>
                      </div>
                    </div>
                    <div
                      className={`absolute w-full left-0 mt-3 z-10 ${
                        showVideoMenu ? "" : "hidden"
                      }`}
                    >
                      <div
                        className={`grid grid-cols-1 gap-[1px] pt-[1px] ${
                          showVideoMenu ? "" : "hidden"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedVideoMode !== "upload") {
                              setFormData((prev) => ({
                                ...prev,
                                media: undefined,
                                mediaUrl: undefined,
                              }));
                              setOriginalVideoFile(null);
                              setVideoAspectRatio(null);
                              setVideoThumbnailUrl("");
                              setVideoAspectRatioWarning("");

                              currentFileRef.current = null;
                            }
                            setSelectedVideoMode("upload");
                            setShowVideoMenu(false);
                            setTemplatedImageUrl("");
                            setSelectedTemplate(undefined);
                            setImageAnalysis("");
                            setSelectedImageMode("");
                          }}
                          className={`p-3 border transition rounded-md duration-200 text-center
                            ${selectedPostType === "video" ? "" : "hidden"}
                            ${
                              selectedVideoMode === "upload"
                                ? "selected-sub-button "
                                : "unselected-sub-button"
                            }
                          `}
                        >
                          <div className="flex flex-col items-center space-y-0">
                            <div>
                              <div
                                className={`w-10 h-6 border mx-auto mb-2  video-icon `}
                              ></div>
                            </div>
                            <div>
                              <h3
                                className={`font-semibold text-sm leading-[1.2rem] mt-1 text `}
                              >
                                {t("upload")}
                                <br />
                                {t("video")} (16:9)
                              </h3>
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedVideoMode !== "uploadShorts") {
                              setFormData((prev) => ({
                                ...prev,
                                media: undefined,
                                mediaUrl: undefined,
                              }));
                              setOriginalVideoFile(null);
                              setVideoAspectRatio(null);
                              setVideoThumbnailUrl("");
                              setVideoAspectRatioWarning("");
                              currentFileRef.current = null;
                            }
                            setSelectedVideoMode("uploadShorts");
                            setShowVideoMenu(false);
                            setTemplatedImageUrl("");
                            setSelectedTemplate(undefined);
                            setImageAnalysis("");
                            setSelectedImageMode("");
                          }}
                          className={`p-3 border transition rounded-md duration-200 text-center
                            ${selectedPostType === "video" ? "" : "hidden"}
                            ${
                              selectedVideoMode === "uploadShorts"
                                ? "selected-sub-button"
                                : "unselected-sub-button"
                            }
                          `}
                        >
                          <div className="flex flex-col items-center space-y-0">
                            <div>
                              <div
                                className={`w-6 h-10 border mx-auto mb-2 video-icon `}
                              ></div>
                            </div>
                            <div>
                              <h3
                                className={`font-semibold text-sm leading-[1.2rem] mt-1 text `}
                              >
                                {t("upload")}
                                <br />
                                {t("short")} (9:16)
                              </h3>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {selectedImageMode === "upload" && (
                <>
                  {selectedImageMode === "upload" && (
                    <div>
                      <h4 className="text-sm font-medium theme-text-primary  mb-2 flex items-center">
                        {t("upload_image")}
                      </h4>

                      {/* Upload Area */}
                      <div className=" theme-bg-primary  border border-slate-200/70 backdrop-blur-sm rounded-md shadow-md p-6">
                        <div
                          className={`  text-center transition-all duration-200 cursor-pointer ${
                            dragActive
                              ? "border-blue-400/50 bg-blue-500/10"
                              : "border-white/20 hover:border-white/30"
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept={
                              selectedVideoMode === "uploadShorts" ||
                              selectedVideoMode === "upload"
                                ? "video/*"
                                : "image/*,video/*"
                            }
                            onChange={handleFileChange}
                            className="hidden"
                          />

                          {formData.media || formData.mediaUrl ? (
                            <div className="space-y-4">
                              <div className="relative">
                                {/* Debug info for upload preview */}
                                {(() => {
                                  const imageSrc =
                                    templatedImageUrl ||
                                    formData.mediaUrl ||
                                    (formData.media
                                      ? URL.createObjectURL(formData.media)
                                      : "");

                                  return (
                                    <img
                                      src={imageSrc}
                                      alt="Preview"
                                      className="max-h-32 mx-auto  shadow-md"
                                      onLoad={() => {
                                        console.log(
                                          "✅ Upload preview image loaded successfully:",
                                          imageSrc.substring(0, 30) + "..."
                                        );
                                      }}
                                      onError={(e) => {
                                        console.error(
                                          "❌ Upload preview image failed to load:",
                                          imageSrc
                                        );
                                        console.error("❌ Error details:", e);
                                      }}
                                    />
                                  );
                                })()}
                              </div>
                              <div className="flex items-center justify-center flex-col space-y-1">
                                <p className="text-xs theme-text-secondary">
                                  {formData.media?.name || "Uploaded Image"}
                                </p>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFormData((prev) => ({
                                      ...prev,
                                      media: undefined,
                                      mediaUrl: undefined,
                                    }));
                                    setTemplatedImageUrl("");
                                    setSelectedTemplate(undefined);
                                    setImageAnalysis("");
                                  }}
                                  className="text-red-400 hover:text-red-300 text-xs font-medium flex items-center space-x-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>{t("remove")}</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="">
                              <Icon name="upload" size={44} />
                              <div>
                                <p className="font-medium theme-text-primary text-sm mb-1">
                                  {t("click_browse_image")}
                                </p>
                                <p className="theme-text-secondary text-xs"></p>
                              </div>
                            </div>
                          )}

                          {/* Upload preloader is now handled by enhanced preloader overlay */}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedImageMode === "textToImage" && (
                    <>
                      <div
                        className={`space-y-4 ${
                          generateImageWithPost ? "hidden" : "hidden"
                        }`}
                      >
                        <div className="p-3 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-400/20 rounded-md">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="generateImageWithPostTextToImage"
                              checked={generateImageWithPost}
                              onChange={(e) =>
                                setGenerateImageWithPost(e.target.checked)
                              }
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <div className="flex-1">
                              <label
                                htmlFor="generateImageWithPostTextToImage"
                                className="flex items-center cursor-pointer"
                              >
                                <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
                                <span className="text-sm font-medium theme-text-primary ">
                                  Use main content description as image prompt
                                </span>
                              </label>
                              <p className="text-xs theme-text-secondary mt-1">
                                Instead of using the image description below,
                                use your main post content to generate the image
                              </p>
                            </div>
                          </div>
                        </div>

                        {!generateImageWithPost && (
                          <div>
                            <label className="text-sm font-medium theme-text-primary  mb-2 flex items-center">
                              Image Description *
                            </label>
                            <textarea
                              value={imageDescription}
                              onChange={(e) =>
                                setImageDescription(e.target.value)
                              }
                              className="w-full px-3 py-2.5 theme-bg-primary/20 border border-grey/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 min-h-[40px] text-sm placeholder-gray-400"
                              placeholder="Describe the image you want to generate... (e.g., 'A professional product photo of eco-friendly water bottles')"
                              required
                            />
                          </div>
                        )}

                        {/* Generate Button - Only show when combined generation is NOT checked */}
                        {!generateImageWithPost && (
                          <button
                            type="button"
                            onClick={handleGenerateImage}
                            disabled={
                              isGeneratingImage || !imageDescription.trim()
                            }
                            className="w-full bg-gradient-to-r from-blue-500/80 to-indigo-500/80 text-white py-3 px-4 rounded font-medium hover:from-blue-600/80 hover:to-indigo-600/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            {isGeneratingImage ? (
                              <>
                                <Loader className="w-4 h-4 animate-spin" />
                                <span>Generating Image...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                <span>Generate Image</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Generate Image from Main Content - Only show when combined generation is checked */}
                        {generateImageWithPost && (
                          <div className="space-y-4">
                            <div className="p-3 bg-green-500/10 border border-green-400/20 rounded-md">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-sm font-medium text-green-300">
                                  Using your main content description to
                                  generate the image
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRegenerate(formData.prompt)}
                              disabled={
                                isGeneratingBoth || !formData.prompt.trim()
                              }
                              className="w-full bg-gradient-to-r from-green-500/80 to-teal-500/80 text-white py-3 px-4 rounded font-medium hover:from-green-600/80 hover:to-teal-600/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                              {isGeneratingBoth ? (
                                <>
                                  <Loader className="w-4 h-4 animate-spin" />
                                  <span>Generating Image & Post...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4" />
                                  <span>Generate Image & Post</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      {(formData.media || formData.mediaUrl) && (
                        <div className="mt-4">
                          <div className="border border-white/20 rounded p-4">
                            <div className="relative">
                              {(() => {
                                const imageSrc =
                                  templatedImageUrl ||
                                  formData.mediaUrl ||
                                  (formData.media
                                    ? URL.createObjectURL(formData.media)
                                    : "");
                                console.log(
                                  "🎨 Text-to-image preview rendering with:",
                                  {
                                    templatedImageUrl:
                                      templatedImageUrl?.substring(0, 50) +
                                      "...",
                                    mediaUrl:
                                      formData.mediaUrl?.substring(0, 50) +
                                      "...",
                                    hasMedia: !!formData.media,
                                    mediaType: formData.media?.type,
                                    finalSrc: imageSrc.substring(0, 50) + "...",
                                  }
                                );
                                return (
                                  <img
                                    src={imageSrc}
                                    alt="Generated Image"
                                    className="max-h-32 mx-auto shadow-md rounded"
                                  />
                                );
                              })()}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    media: undefined,
                                    mediaUrl: undefined,
                                  }));
                                  setTemplatedImageUrl("");
                                  setSelectedTemplate(undefined);
                                  setImageAnalysis("");
                                }}
                                className="absolute top-2 right-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md p-1.5 shadow-md transition-colors duration-200"
                                title="Remove image"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs theme-text-secondary">
                                {formData.media?.name || "AI Generated Image"}
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    media: undefined,
                                    mediaUrl: undefined,
                                  }));
                                  setTemplatedImageUrl("");
                                  setSelectedTemplate(undefined);
                                  setImageAnalysis("");
                                }}
                                className="text-red-400 hover:text-red-300 text-xs font-medium flex items-center space-x-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>{t("remove")}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {selectedVideoMode !== "" && (
                <div>
                  <label className="block text-sm font-medium theme-text-primary  mb-2">
                    {selectedVideoMode === "uploadShorts" ? (
                      <span>{t("upload_shorts_video")}</span>
                    ) : (
                      <span>{t("upload_video")}</span>
                    )}
                  </label>
                  <div className="  theme-bg-primary  border border-slate-200/70 backdrop-blur-sm rounded-md shadow-md p-6">
                    <div
                      className={` border-2 border-dashed  p-0 text-center transition-all duration-200 ${
                        dragActive
                          ? "border-blue-400/50 bg-blue-500/10"
                          : "border-white/20 hover:border-white/30"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={
                          selectedPostType === "image"
                            ? "image/*"
                            : selectedPostType === "video"
                            ? "video/*"
                            : "image/*,video/*"
                        }
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>

                    {formData.media || formData.mediaUrl ? (
                      <div className="space-y-4">
                        <div className="relative">
                          {formData.media?.type.startsWith("image/") ||
                          (formData.mediaUrl &&
                            !formData.media &&
                            !formData.mediaUrl.match(
                              /\.(mp4|mov|avi|wmv|flv|webm|mkv|m4v)$/i
                            )) ? (
                            <div className="relative">
                              <img
                                src={
                                  templatedImageUrl ||
                                  formData.mediaUrl ||
                                  (formData.media
                                    ? URL.createObjectURL(formData.media)
                                    : "")
                                }
                                alt="Preview"
                                className="max-h-40 mx-auto  shadow-md"
                                onError={(e) => {
                                  console.error(
                                    "Image failed to load:",
                                    templatedImageUrl ||
                                      formData.mediaUrl ||
                                      formData.media?.name
                                  );
                                }}
                              />
                              <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center">
                                <Icon
                                  name="image-post"
                                  size={12}
                                  className="mr-1"
                                />
                                Image
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <video
                                src={
                                  formData.mediaUrl
                                    ? formData.mediaUrl
                                    : formData.media
                                    ? URL.createObjectURL(formData.media)
                                    : undefined
                                }
                                className="max-h-40 mx-auto shadow-md rounded"
                                controls
                                preload="metadata"
                              >
                                {t("browser_no_video_support")}
                              </video>
                            </div>
                          )}
                        </div>
                        <div className="text-sm theme-text-secondary space-y-2 text-center">
                          <div>
                            <p className="font-medium theme-text-primary text-sm">
                              {formData.media?.name || "Uploaded Media"}
                            </p>
                            {formData.media && (
                              <p className="text-xs">
                                {(formData.media.size / 1024 / 1024).toFixed(2)}{" "}
                                MB{" "}
                              </p>
                            )}
                          </div>

                          {analyzingImage && (
                            <div className="flex items-center justify-center p-2 bg-blue-500/10 border border-blue-400/20 rounded text-xs">
                              <Loader className="w-3 h-3 animate-spin mr-2 text-blue-400" />
                              <span className="text-blue-300">
                                {t("ai_analyzing")}
                              </span>
                            </div>
                          )}
                          {videoAspectRatioWarning ? (
                            <div className="flex items-center justify-start p-3 bg-red-500/10 border border-red-400/20 rounded text-xs">
                              <AlertCircle className="w-4 h-4 mr-2 text-red-400 flex-shrink-0" />
                              <div className="text-left">
                                <div className="font-medium text-red-300 mb-1">
                                  {t("aspect_ratio_warning")}
                                </div>
                                <div className="text-red-200">
                                  {videoAspectRatioWarning}
                                </div>
                              </div>
                            </div>
                          ) : videoAspectRatio ? (
                            <div className="flex items-center justify-center p-2 bg-green-500/10 border border-green-400/20 rounded text-xs">
                              <CheckCircle className="w-3 h-3 mr-2 text-green-400" />
                              <span className="text-green-300">
                                {is9x16Video(videoAspectRatio)
                                  ? t(
                                      "vertical_video_ready_stories_format_no_thumbnail_needed"
                                    )
                                  : is16x9Video(videoAspectRatio)
                                  ? t(
                                      "horizontal_video_ready_thumbnail_generated_when_click_generate_post"
                                    )
                                  : t(
                                      "video_processed_ready_thumbnail_generated_when_click_generate_post"
                                    )}
                              </span>
                            </div>
                          ) : null}

                          {!is9x16Video(videoAspectRatio || 0) && (
                            <div className="mt-2 flex items-center justify-center gap-3">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={generateVideoThumbnailAI}
                                  onChange={(e) =>
                                    setGenerateVideoThumbnailAI(
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4"
                                />
                                <span className="text-sm theme-text-secondary">
                                  {t("generate_thumbnail_with_ai")}
                                </span>
                              </label>

                              {!generateVideoThumbnailAI && (
                                <>
                                  <input
                                    ref={thumbnailInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCustomThumbnailChange}
                                    className="hidden"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      thumbnailInputRef.current?.click()
                                    }
                                    className="px-3 py-1 border rounded text-sm"
                                  >
                                    {t("upload_custom_thumbnail")}
                                  </button>
                                  {customThumbnailUploading && (
                                    <span className="text-xs text-blue-300 ml-2">
                                      {t("uploading")}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          )}

                          {(formData.media || formData.mediaUrl) &&
                            (formData.media?.type.startsWith("image/") ||
                              (formData.mediaUrl &&
                                !formData.media &&
                                !formData.mediaUrl.match(
                                  /\.(mp4|mov|avi|wmv|flv|webm|mkv|m4v)$/i
                                ))) &&
                            !analyzingImage && <></>}

                          {templatedImageUrl && selectedTemplate && (
                            <div className="bg-purple-500/10 border border-purple-400/20  p-2">
                              <div className="flex justify-between mb-2">
                                <h4 className="font-medium text-purple-300 flex  text-xs">
                                  <Palette className="w-3 h-3 mr-1" />
                                  {t("image_updated")}: {selectedTemplate.name}
                                </h4>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={handleEditTemplate}
                                  className="flex-1 bg-purple-500/80 text-white px-3 py-1.5 rounded text-xs hover:bg-purple-600/80 transition-colors flex items-center justify-center space-x-1"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>{t("edit")}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleDeleteTemplate}
                                  className="flex-1 bg-red-500/80 text-white px-3 py-1.5 rounded text-xs hover:bg-red-600/80 transition-colors flex items-center justify-center space-x-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>{t("remove")}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              media: undefined,
                              mediaUrl: undefined,
                            }));
                            setTemplatedImageUrl("");
                            setSelectedTemplate(undefined);
                            setImageAnalysis("");
                          }}
                          className="text-red-400 hover:text-red-300 text-xs font-medium text-center w-full flex items-center justify-center space-x-1  "
                        >
                          {t("remove")}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div
                          className={`${
                            selectedVideoMode
                              ? ""
                              : "filter grayscale opacity-50"
                          } flex gap-2 justify-center`}
                        >
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-transparent"
                            disabled={!selectedVideoMode}
                          >
                            <div className="">
                              <Icon name="upload-video" size={44} />
                              <div>
                                <p className="font-medium theme-text-primary text-sm mb-1">
                                  {t("click_browse_video")}
                                </p>
                                <p className="theme-text-secondary text-xs">
                                  {!selectedVideoMode &&
                                    "Select a video mode above first"}
                                </p>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {videoAspectRatioWarning && (
                    <div className="flex items-center justify-start p-3 theme-bg-danger border rounded-md text-xs mb-1 theme-text-light">
                      <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />{" "}
                      {videoAspectRatioWarning}
                    </div>
                  )}

                  {imageAnalysis && (
                    <div className="bg-blue-500/10 border border-blue-400/20  p-3">
                      <div className="space-y-2">
                        <h4 className="font-medium text-blue-300 flex items-center text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          {t("ai_analysis_complete")}
                        </h4>
                        <div className="max-h-24 overflow-y-auto">
                          <p className="text-blue-200 text-xs leading-[1.05rem]elaxed">
                            {imageAnalysis}
                          </p>
                        </div>
                        <button
                          onClick={useImageAnalysis}
                          className="bg-gradient-to-r from-blue-500/80 to-indigo-500/80 text-white px-3 py-1.5 rounded text-xs hover:from-blue-600/80 hover:to-indigo-600/80 transition-all duration-200 flex items-center space-x-1"
                        >
                          <span>{t("add_to_description")}</span>
                          <Sparkles className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedPostType !== "" &&
              (selectedImageMode !== "" ||
                selectedVideoMode !== "" ||
                selectedPostType === "text") ? (
                <>
                  <>
                    <div className="flex-1">
                      <label className=" text-sm font-medium theme-text-primary  mb-2  flex items-center">
                        {selectedImageMode === "textToImage"
                          ? t("generate_image_post_ai")
                          : t("content_description")}
                      </label>

                      <textarea
                        value={formData.prompt}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            prompt: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2.5  theme-bg-primary transition-all duration-200 min-h-[160px] lg:min-h-[180px] text-sm  rounded-md placeholder-gray-500 bg-white"
                        placeholder={t("describe_placeholder")}
                        required
                      />
                    </div>

                    {(selectedImageMode === "textToImage" ||
                      selectedImageMode === "upload") && (
                      <div className="">
                        <label className="text-sm font-medium theme-text-primary  mb-2 flex items-center">
                          {t("image_dimensions")}
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { label: "1:1", value: "1:1", icon: "⬜" },
                            { label: "16:9", value: "16:9", icon: "▬" },
                            { label: "9:16", value: "9:16", icon: "▫" },
                          ].map((ratio) => (
                            <button
                              key={ratio.value}
                              type="button"
                              onClick={() =>
                                handleAspectRatioChange(ratio.value)
                              }
                              className={`w-full h-24 p-2 border transition-all rounded-md duration-200 flex flex-col items-center justify-center ${
                                aspectRatio === ratio.value
                                  ? "theme-bg-quaternary shadow-md theme-text-secondary"
                                  : "theme-bg-primary hover:theme-bg-primary/50"
                              }`}
                            >
                              <div
                                className={`border mx-auto mb-1  ${
                                  ratio.value === "1:1"
                                    ? "w-8 h-8 border-1 border-purple-600 "
                                    : ratio.value === "16:9"
                                    ? "w-10 h-6 border-1"
                                    : ratio.value === "9:16"
                                    ? "w-6 h-10 border-1 border-purple-600"
                                    : "w-8 h-8 border-1"
                                } ${
                                  aspectRatio === ratio.value
                                    ? "border-purple-600 border-2"
                                    : "theme-border-dark border-1"
                                }`}
                              ></div>
                              <div className="text-md font-medium whitespace-pre-line ">
                                {ratio.label}
                              </div>
                            </button>
                          ))}{" "}
                        </div>
                      </div>
                    )}
                  </>
                  <div className="hidden">
                    <label className="block text-sm font-medium theme-text-primary  mb-3">
                      {t("target_platforms")}
                    </label>
                    <div className="grid lg:grid-cols-1 gap-2 grid-cols-2">
                      {platformOptions.map((platform) => {
                        const IconComponent = platform.icon;
                        const isSelected = formData.selectedPlatforms?.includes(
                          platform.id
                        );
                        return (
                          <button
                            key={platform.id}
                            type="button"
                            onClick={() => togglePlatform(platform.id)}
                            className={`p-2  border transition-all duration-200 flex items-center space-x-2 text-sm ${
                              isSelected
                                ? `bg-[#fff] ${platform.borderColor}/50 border`
                                : "border-white/10 hover:border-white/20 theme-bg-primary/10"
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded flex items-center justify-center text-white ${getPlatformColors(
                                platform.id
                              )}`}
                            >
                              <IconComponent className="w-3 h-3" />
                            </div>
                            <span
                              className={`font-medium ${
                                isSelected
                                  ? platform.color
                                  : "theme-text-secondary"
                              }`}
                            >
                              {platform.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex gap-4  -mt-[2px] border-t border-white/10">
                    <button
                      type="button"
                      onClick={onBack}
                      className="hidden flex-1 theme-bg-primary theme-text-secondary py-3 px-6  font-medium hover:theme-bg-primary/30 transition-colors duration-200 text-sm"
                    >
                      {t("back")}
                    </button>
                    <button
                      type="submit"
                      disabled={
                        getCost() === 0 ||
                        !formData.prompt.trim() ||
                        !formData.selectedPlatforms?.length ||
                        isGeneratingBoth
                      }
                      className=" group rounded-md flex-1 flex items-center justify-between theme-bg-trinary theme-text-light border border-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] transition-colors duration-200 py-2.5 px-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm
"
                    >
                      {isGeneratingBoth ? (
                        <div className="flex items-center">
                          <Loader className="w-5 h-5 mr-2 animate-spin" />
                          {t("generating_post_and_image")}
                        </div>
                      ) : isGeneratingThumbnail ? (
                        <div className="flex items-center">
                          <Loader className="w-5 h-5 mr-2 animate-spin" />
                          {t("generating_thumbnail")}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Wand2 className="w-[23px] h-[23px] mr-1" />
                          {t("generate_post")}
                        </div>
                      )}

                      <div className="px-2.5 py-1.5 flex items-center gap-2">
                        <Icon
                          name="spiral-logo"
                          size={20}
                          className="brightness-[1000%] transition group-hover:brightness-100"
                        />
                        {getCost()}
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                <></>
              )}
              {selectedImageMode === "" &&
                selectedVideoMode === "" &&
                selectedPostType !== "text" && (
                  <motion.div
                    className="flex-1 w-full"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{
                      duration: 0.6,
                      type: "spring",
                      stiffness: 80,
                    }}
                  >
                    <div className="relative  rounded-md overflow-hidden shadow-md aspect-video w-full">
                      <motion.video
                        src={IntroVideo}
                        muted
                        loop
                        playsInline
                        controls
                        preload="none"
                        poster={VideoPoster}
                        className="absolute w-full h-full object-cover"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: 0.6,
                          type: "spring",
                          stiffness: 80,
                        }}
                      />
                    </div>
                  </motion.div>
                )}
            </div>
          </form>
        </>
      )}

      {showTemplateSelector && (
        <TemplateSelector
          onSelectTemplate={handleTemplateSelect}
          onCancel={handleTemplateSelectorCancel}
        />
      )}

      {showTemplateEditor &&
        selectedTemplate &&
        (formData.media || formData.mediaUrl || videoThumbnailUrl) && (
          <ImageTemplateEditor
            imageUrl={
              templatedImageUrl ||
              videoThumbnailUrl ||
              (formData.media
                ? URL.createObjectURL(formData.media)
                : formData.mediaUrl!)
            }
            selectedTemplate={selectedTemplate}
            onSave={handleTemplateEditorSave}
            onCancel={handleTemplateEditorCancel}
            isVideoThumbnail={selectedPostType === "video"}
            aspectRatio={aspectRatio}
          />
        )}

      {showPreview && generatedResults && generatedResults.length > 0 && (
        <div className="mt-6">
          <PostPreview
            posts={generatedResults}
            onBack={() => setShowPreview(false)}
            onEdit={() => {}}
            onPostsUpdate={(updatedPosts) => setGeneratedResults(updatedPosts)}
          />
        </div>
      )}
    </div>
  );
};
