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
import { analyzeImage as analyzeImageWithGemini } from "../lib/gemini"; // Renamed to avoid conflict
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

import API from "@/services/api";
import { useNavigate } from "react-router-dom";
import { notify } from "@/utils/toast";
import { useTranslation } from "react-i18next";

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

  // Thumbnail generation preference and custom thumbnail upload
  const [generateVideoThumbnailAI, setGenerateVideoThumbnailAI] =
    useState(true);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [customThumbnailUploading, setCustomThumbnailUploading] =
    useState(false);

  // Upload abort controller for cancelling in-progress uploads
  const uploadAbortControllerRef = useRef<AbortController | null>(null);

  // Track the current file being uploaded to prevent stale updates
  const currentFileRef = useRef<File | null>(null);

  // State to hold pending post generation data
  const [pendingPostGeneration, setPendingPostGeneration] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to get appropriate platforms based on content type
  const getAppropiatePlatforms = (
    postType: "text" | "image" | "video",
    imageMode?: string,
    videoMode?: string
  ): Platform[] => {
    switch (postType) {
      case "text":
        // Text post: all platforms except YouTube, TikTok, Instagram, and Twitter (disabled temporarily)
        return ["facebook", "linkedin"];
      case "image":
        // Image post: all platforms except TikTok, YouTube, and Twitter (disabled temporarily)
        return ["facebook", "instagram", "linkedin"];
      case "video":
        if (videoMode === "uploadShorts") {
          // 9:16 video (shorts): all platforms except Twitter (disabled temporarily)
          return ["facebook", "instagram", "linkedin", "tiktok", "youtube"];
        } else if (videoMode === "upload") {
          // 16:9 video: all platforms except Instagram, TikTok, and Twitter (disabled temporarily)
          return ["facebook", "linkedin", "youtube"];
        }
        // Default video: all platforms except Twitter (disabled temporarily)
        return ["facebook", "instagram", "linkedin", "tiktok", "youtube"];
      default:
        return ["linkedin", "facebook"]; // Default fallback
    }
  };

  // Auto-select platforms based on content type and modes
  // useEffect(() => {
  //   const appropriatePlatforms = getAppropiatePlatforms(
  //     selectedPostType?.toLowerCase() as "text" | "image" | "video",

  //   );

  //   // Clear aspect ratio warning when video mode changes or when correct video is uploaded
  //   if (selectedPostType === "video") {
  //     if (videoAspectRatio) {
  //       // If we have a video loaded, check if the mode now matches the aspect ratio
  //     console
  //       }
  //     } else {
  //       // If no video is loaded but there's a warning (from previous rejected upload), keep the warning
  //       // This ensures the warning persists until a correct video is uploaded or mode is switched
  //     }

  // }, [
  //   selectedPostType,

  // ]);
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

    // Clear aspect ratio warning when video mode changes or when correct video is uploaded
    if (selectedPostType === "video") {
      if (videoAspectRatio) {
        // If we have a video loaded, check if the mode now matches the aspect ratio
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
          // Clear timeout if it exists
          if (warningTimeoutId) {
            clearTimeout(warningTimeoutId);
            setWarningTimeoutId(null);
          }
          setVideoAspectRatioWarning("");
        }
      } else {
        // If no video is loaded but there's a warning (from previous rejected upload), keep the warning
        // This ensures the warning persists until a correct video is uploaded or mode is switched
      }
    } else {
      // Clear warning when switching away from video post type
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

  // Initialize with existing data when in edit mode
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

  // useEffect(() => {
  //  setShowImageMenu(selectedPostType === 'image');

  // }, [selectedPostType, selectedImageMode]);

  // Fetch campaign information when a campaign is selected in context
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    console.log("📁 File upload started:", file.name, file.type, file.size);

    // Set this file as the current file being processed
    currentFileRef.current = file;

    console.log("Current formData state BEFORE:", {
      media: !!formData.media,
      mediaUrl: !!formData.mediaUrl,
    });

    // Clear template-related state when uploading a new file
    setTemplatedImageUrl("");
    setSelectedTemplate(undefined);
    setImageAnalysis("");
    setVideoThumbnailUrl("");
    setOriginalVideoFile(null);
    setVideoAspectRatio(null);

    console.log("🔄 Setting file immediately for preview...");

    // Create immediate preview URL from the file
    const previewUrl = URL.createObjectURL(file);
    console.log("📷 Created preview URL:", previewUrl);

    setFormData((prev) => {
      console.log("Previous formData:", {
        media: !!prev.media,
        mediaUrl: !!prev.mediaUrl,
      });
      // Clean up previous blob URL if it exists
      if (prev.mediaUrl && prev.mediaUrl.startsWith("blob:")) {
        URL.revokeObjectURL(prev.mediaUrl);
        console.log("🗑️ Cleaned up previous blob URL during upload");
      }
      const newData = { ...prev, media: file, mediaUrl: previewUrl };
      console.log("New formData after setting file:", {
        media: !!newData.media,
        mediaUrl: !!newData.mediaUrl,
      });
      return newData;
    });

    // Handle video files - analyze aspect ratio only (no thumbnail generation yet)
    if (isVideoFile(file)) {
      console.log("🎥 Video file detected, analyzing aspect ratio...");
      try {
        // Store the original video file
        setOriginalVideoFile(file);

        // Get video aspect ratio
        const aspectRatio = await getVideoAspectRatio(file);
        setVideoAspectRatio(aspectRatio);
        console.log("📐 Video aspect ratio:", aspectRatio);
        console.log(
          "📝 Video thumbnail will be generated when Generate Post is clicked"
        );

        // Check for aspect ratio mismatch with selected video mode
        let warningMessage = "";
        let shouldRejectVideo = false;

        if (selectedVideoMode === "upload" && !is16x9Video(aspectRatio)) {
          // User selected normal video upload (16:9) but uploaded non-16:9 video
          shouldRejectVideo = true;
          if (is9x16Video(aspectRatio)) {
            warningMessage =
              'Aspect ratio mismatch: Please switch to "Upload Short (9:16)" mode or upload a 16:9 horizontal video.';
          } else {
            warningMessage = `Aspect ratio mismatch: Please switch to "Upload Short (9:16)" mode or upload a 16:9 horizontal video.`;
          }
        } else if (
          selectedVideoMode === "uploadShorts" &&
          !is9x16Video(aspectRatio)
        ) {
          // User selected shorts upload (9:16) but uploaded non-9:16 video
          shouldRejectVideo = true;
          if (is16x9Video(aspectRatio)) {
            warningMessage =
              'Aspect ratio mismatch: Please switch to "Upload Video (16:9)" mode or upload a 9:16 verical video.';
          } else {
            warningMessage = `Aspect ratio mismatch: Please switch to "Upload Video (16:9)" mode or upload a 9:16 verical video.`;
          }
        }

        if (shouldRejectVideo) {
          console.log(
            "🚫 Video rejected due to aspect ratio mismatch:",
            warningMessage
          );
          setVideoAspectRatioWarning(warningMessage);

          // Clear any existing timeout
          if (warningTimeoutId) {
            clearTimeout(warningTimeoutId);
          }

          // Set timeout to auto-dismiss warning after 4 seconds
          const timeoutId = setTimeout(() => {
            console.log("⏰ Auto-dismissing video warning after 4 seconds");
            setVideoAspectRatioWarning("");
            setWarningTimeoutId(null);
          }, 4000);

          setWarningTimeoutId(timeoutId);

          // Remove the video from formData immediately
          setFormData((prev) => {
            // Clean up the blob URL
            if (prev.mediaUrl && prev.mediaUrl.startsWith("blob:")) {
              URL.revokeObjectURL(prev.mediaUrl);
              console.log("🗑️ Cleaned up blob URL for rejected video");
            }
            return {
              ...prev,
              media: undefined,
              mediaUrl: undefined,
              serverUrl: undefined,
            };
          });

          // Clear video-related state but keep the warning
          setOriginalVideoFile(null);
          setVideoAspectRatio(null);
          setVideoThumbnailUrl("");

          // Stop the upload process by returning early
          return;
        } else {
          // Clear any previous warning and timeout if video is acceptable
          if (warningTimeoutId) {
            clearTimeout(warningTimeoutId);
            setWarningTimeoutId(null);
          }
          setVideoAspectRatioWarning("");
          console.log("✅ Video aspect ratio matches selected mode");
        }
      } catch (error) {
        console.error("❌ Error processing video:", error);
        // Continue with video upload even if aspect ratio detection fails
      }
    }

    // Force a re-render to ensure file preview shows
    console.log("🔄 File should be visible now with preview");

    // Show loading popup IMMEDIATELY to prevent mode switching during upload
    showLoading(`Uploading ${file.name}...`, { canCancel: true });

    try {
      const userResult = await getCurrentUser();
      console.log("👤 User check result:", {
        hasUser: !!userResult?.user,
        userId: userResult?.user?.id,
      });

      if (!userResult || !userResult.user) {
        console.warn("⚠️ User not authenticated, keeping local file only");
        hideLoading();
        return;
      }

      console.log("🌍 Starting upload to server with enhanced preloader...");

      // Create abort controller for this upload
      const abortController = new AbortController();
      uploadAbortControllerRef.current = abortController;
      currentFileRef.current = file;

      try {
        // Use the enhanced file upload preloader
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
          console.log("Adding URL to existing file. Previous:", {
            media: !!prev.media,
            mediaUrl: !!prev.mediaUrl,
          });

          // Clean up the previous blob URL if it exists
          if (prev.mediaUrl && prev.mediaUrl.startsWith("blob:")) {
            URL.revokeObjectURL(prev.mediaUrl);
            console.log("🗑️ Cleaned up previous blob URL");
          }

          // Always use server URL for media (for publishing compatibility)
          // Use server URL as both mediaUrl and serverUrl for consistent publishing
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

        // Note: Template editor will open when user clicks Generate Post
        if (file.type.startsWith("image/")) {
          console.log(
            "🖼️ Image uploaded successfully, template editor will open on Generate Post"
          );
        } else if (isVideoFile(file)) {
          console.log(
            "🎥 Video uploaded successfully, thumbnail generated, template editor will open on Generate Post"
          );
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

      // Call the Gemini analysis API with proper data URL format
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
          "AI-generated image analyzed. Add a description for better content generation."
        );
      }
    } catch (error: any) {
      console.error("Error analyzing AI-generated image:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
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

    if (formData.prompt.trim()) {
      // For text-to-image mode with combined generation enabled, do the combined generation
      if (
        selectedImageMode === "textToImage" &&
        generateImageWithPost &&
        !formData.mediaUrl
      ) {
        console.log(
          "🚀 Starting combined generation from Generate Post button..."
        );
        await handleCombinedGenerationWithPost(formData.prompt);
        return; // Exit here as handleCombinedGenerationWithPost handles the rest
      }

      // For text-to-image mode without combined generation, check if image exists
      if (
        selectedImageMode === "textToImage" &&
        !generateImageWithPost &&
        !formData.mediaUrl
      ) {
        console.log("🎯 Image generation required - no image found");
        notify(
          "error",
          'Please generate an image first using the "Generate Image" button, then generate the post.'
        );
        return;
      }

      // For upload mode, check if image is uploaded
      if (
        selectedImageMode === "upload" &&
        !formData.mediaUrl &&
        !formData.media
      ) {
        console.log("🎯 Image upload required");
        notify(
          "error",
          "Please upload an image first, then generate the post."
        );
        return;
      }

      // NEW: For uploaded images, open template editor directly with blank template
      if (
        selectedImageMode === "upload" &&
        (formData.media || formData.mediaUrl)
      ) {
        console.log(
          "🎨 Opening template editor for uploaded image with blank template..."
        );

        // Get blank template
        const blankTemplate = getTemplateById("blank-template");
        if (blankTemplate) {
          console.log("📋 Setting blank template and opening editor");
          setSelectedTemplate(blankTemplate);
          setShowTemplateEditor(true);

          // Store post generation data for later use (similar to combined generation)
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
            originalImageUrl: formData.mediaUrl,
            campaignInfo: currentCampaignInfo,
            selectedPlatforms: formData.selectedPlatforms,
            imageAnalysis,
            formData,
          };

          setPendingPostGeneration(postGenerationData);
          return; // Exit here to wait for template editor completion
        } else {
          console.error(
            "❌ Blank template not found, proceeding with normal flow"
          );
        }
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
              "✅ Video thumbnail generated successfully, opening template editor"
            );

            // Get blank template
            const blankTemplate = getTemplateById("blank-template");
            if (blankTemplate) {
              console.log(
                "📋 Setting blank template and opening editor for generated video thumbnail"
              );
              setSelectedTemplate(blankTemplate);
              setShowTemplateEditor(true);

              // Store post generation data for later use, including original video file
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
                originalImageUrl: generatedThumbnailUrl, // Use generated thumbnail for template editor
                originalVideoUrl: formData.mediaUrl, // Store original video URL
                originalVideoFile: originalVideoFile, // Store original video file
                videoAspectRatio: videoAspectRatio,
                isVideoContent: true, // Flag to indicate this is video content
                campaignInfo: currentCampaignInfo,
                selectedPlatforms: formData.selectedPlatforms,
                imageAnalysis: `Video thumbnail generated from content description for ${
                  is16x9Video(videoAspectRatio || 0)
                    ? "16:9 horizontal"
                    : "custom aspect ratio"
                } video`,
                formData,
              };

              setPendingPostGeneration(postGenerationData);
              return; // Exit here to wait for template editor completion
            } else {
              console.error(
                "❌ Blank template not found for video, proceeding with normal flow"
              );
            }
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

        console.log("🎬 Video preview generation:", {
          isVideoContent,
          hasServerUrl: !!formData.serverUrl,
          hasMediaUrl: !!formData.mediaUrl,
          hasTemplatedImage: !!templatedImageUrl,
          serverUrl: formData.serverUrl?.substring(0, 50) + "...",
          mediaUrl: formData.mediaUrl?.substring(0, 50) + "...",
          templatedImageUrl: templatedImageUrl?.substring(0, 50) + "...",
          finalUrl: finalMediaUrl?.startsWith("blob:")
            ? "blob URL (WRONG)"
            : "server URL (CORRECT)",
          videoAspectRatio,
        });

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
              templatedImageUrl || (currentFormData as any).thumbnailUrl, // Use templated image as poster for videos
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

  const handleAIImageGenerated = async (
    imageUrl: string,
    shouldAutoOpenTemplate: boolean = true
  ) => {
    console.log("🖼️ handleAIImageGenerated called with URL:", imageUrl);
    try {
      // Convert the AI generated image URL to a File object
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "ai-generated-image.png", {
        type: "image/png",
      });
      console.log("📋 Created File object:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      // Upload the AI generated image to our storage
      const user = await getCurrentUser();
      if (user && user.user?.id) {
        console.log("📤 Uploading to storage for user:", user.user.id);
        const mediaUrl = await uploadMedia(file, user.user.id);
        console.log("✅ Upload successful, server URL:", mediaUrl);

        setFormData((prev) => {
          console.log("🔄 Updating formData with server URL - before:", {
            hasMedia: !!prev.media,
            hasMediaUrl: !!prev.mediaUrl,
          });
          const newData = {
            ...prev,
            media: file,
            mediaUrl,
            serverUrl: mediaUrl,
          };
          console.log("🔄 Updating formData with server URL - after:", {
            hasMedia: !!newData.media,
            hasMediaUrl: !!newData.mediaUrl,
            hasServerUrl: !!newData.serverUrl,
            mediaUrl: newData.mediaUrl?.substring(0, 50) + "...",
          });
          return newData;
        });

        // Auto-open template editor with blank template only if requested
        if (shouldAutoOpenTemplate) {
          console.log(
            "🎨 Auto-opening template editor with blank template for AI generated image"
          );
          // Get blank template
          const blankTemplate = getTemplateById("blank-template");
          if (blankTemplate) {
            console.log(
              "📋 Setting blank template and opening editor for AI image"
            );
            setTimeout(() => {
              setSelectedTemplate(blankTemplate);
              setShowTemplateEditor(true);
            }, 500); // Small delay to ensure state is updated
          } else {
            console.error(
              "❌ Blank template not found for AI image - this should not happen!"
            );
            // Don't open anything if blank template is missing - this is a critical error
          }
        }
      } else {
        console.log("⚠️ No authenticated user, using direct URL");
        // If no user, just use the direct URL
        setFormData((prev) => {
          console.log("🔄 Updating formData with direct URL - before:", {
            hasMedia: !!prev.media,
            hasMediaUrl: !!prev.mediaUrl,
          });
          const newData = { ...prev, mediaUrl: imageUrl };
          console.log("🔄 Updating formData with direct URL - after:", {
            hasMedia: !!newData.media,
            hasMediaUrl: !!newData.mediaUrl,
            mediaUrl: newData.mediaUrl?.substring(0, 50) + "...",
          });
          return newData;
        });

        // Auto-open template editor with blank template only if requested
        if (shouldAutoOpenTemplate) {
          console.log(
            "🎨 Auto-opening template editor with blank template for AI generated image (no auth)"
          );
          // Get blank template
          const blankTemplate = getTemplateById("blank-template");
          if (blankTemplate) {
            console.log(
              "📋 Setting blank template and opening editor for AI image (no auth)"
            );
            setTimeout(() => {
              setSelectedTemplate(blankTemplate);
              setShowTemplateEditor(true);
            }, 500); // Small delay to ensure state is updated
          } else {
            console.error(
              "❌ Blank template not found for AI image (no auth) - this should not happen!"
            );
            // Don't open anything if blank template is missing - this is a critical error
          }
        }
      }
    } catch (error) {
      console.error("❌ Error handling AI generated image:", error);
      // Fallback: just use the URL directly
      console.log("🔄 Using fallback direct URL");
      setFormData((prev) => {
        console.log("🔄 Fallback update - before:", {
          hasMedia: !!prev.media,
          hasMediaUrl: !!prev.mediaUrl,
        });
        const newData = { ...prev, mediaUrl: imageUrl };
        console.log("🔄 Fallback update - after:", {
          hasMedia: !!newData.media,
          hasMediaUrl: !!newData.mediaUrl,
          mediaUrl: newData.mediaUrl?.substring(0, 50) + "...",
        });
        return newData;
      });

      // Auto-open template editor with blank template only if requested
      if (shouldAutoOpenTemplate) {
        console.log(
          "🎨 Auto-opening template editor with blank template for fallback image"
        );
        // Get blank template
        const blankTemplate = getTemplateById("blank-template");
        if (blankTemplate) {
          console.log(
            "📋 Setting blank template and opening editor for fallback image"
          );
          setTimeout(() => {
            setSelectedTemplate(blankTemplate);
            setShowTemplateEditor(true);
          }, 500); // Small delay to ensure state is updated
        } else {
          console.error(
            "❌ Blank template not found for fallback image - this should not happen!"
          );
          // Don't open anything if blank template is missing - this is a critical error
        }
      }
    }
  };

  const handleNext = () => {
    if (generatedResults && generatedResults.length > 0) {
      setShowPreview(true);
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
            console.warn(
              "⚠️ Upload returned no URL, falling back to provided imageUrl"
            );
          }
        } else {
          console.warn(
            "⚠️ No authenticated user; cannot upload templated image. Using provided URL as-is."
          );
        }
      } else {
        console.log(
          "🌐 Templated image already has a server URL. Skipping upload."
        );
      }
    } catch (uploadErr) {
      console.error(
        "❌ Failed to upload templated image, using provided URL:",
        uploadErr
      );
      // Keep finalTemplatedUrl as the original imageUrl
    }

    // Persist the templated image URL in component state and form data
    setTemplatedImageUrl(finalTemplatedUrl);
    setFormData((prev) => ({
      ...prev,
      mediaUrl: finalTemplatedUrl,
      imageUrl: finalTemplatedUrl,
      serverUrl: finalTemplatedUrl, // Ensure publishing flows use this stable URL
    }));
    setShowTemplateEditor(false);

    // Check if we have pending post generation (from combined generation workflow)
    if (pendingPostGeneration) {
      console.log("🚀 Continuing post generation with templated image...");

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

      // Prepare final form data
      let currentFormData;
      let mediaAssets;

      if (isVideoContent && originalVideoUrl) {
        console.log("📹 Processing video content with edited thumbnail...");
        // For video content, keep the original video URL but use the edited thumbnail
        currentFormData = {
          ...originalFormData,
          mediaUrl: originalVideoUrl, // Keep original video URL for publishing
          thumbnailUrl: finalTemplatedUrl, // Store edited thumbnail separately
          videoFile: originalVideoFile, // Keep original video file
          videoAspectRatio: videoAspectRatio,
        };

        // Create media assets with both video and thumbnail
        mediaAssets = [
          {
            url: originalVideoUrl,
            type: "video",
            thumbnailUrl: finalTemplatedUrl, // Edited thumbnail
            aspectRatio: videoAspectRatio,
          },
        ];

        console.log("📋 Video media assets prepared:", {
          videoUrl: originalVideoUrl?.substring(0, 50) + "...",
          thumbnailUrl: finalTemplatedUrl?.substring(0, 50) + "...",
          aspectRatio: videoAspectRatio,
        });
      } else {
        console.log("🖼️ Processing image content with templated image...");
        // For image content, use the templated image
        currentFormData = {
          ...originalFormData,
          mediaUrl: finalTemplatedUrl, // Use the templated image server URL
          imageUrl: finalTemplatedUrl,
          serverUrl: finalTemplatedUrl,
        };

        mediaAssets = [{ url: finalTemplatedUrl, type: "image" }];
      }

      console.log("📋 Preparing final post data:", {
        hasMediaAssets: mediaAssets.length > 0,
        mediaType: isVideoContent ? "video" : "image",
        prompt: prompt.substring(0, 50) + "...",
      });

      const postData = {
        ...currentFormData,
        prompt: prompt,
        selectedPlatforms: selectedPlatforms,
        platforms: selectedPlatforms,
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
        website: currentCampaignInfo.website,
        objective: currentCampaignInfo.objective,
        goals: currentCampaignInfo.goals,
        keywords: currentCampaignInfo.keywords,
        hashtags: currentCampaignInfo.hashtags,
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

      if (formData.prompt && formData.prompt.trim()) {
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

    // Reset form data media
    setFormData((prev) => ({
      ...prev,
      media: undefined,
      mediaUrl: undefined,
      serverUrl: undefined,
      imageUrl: undefined,
      videoUrl: undefined,
      thumbnailUrl: undefined,
    }));

    // Clear all template and media related state
    setTemplatedImageUrl("");
    setImageAnalysis("");
    setVideoThumbnailUrl("");
    setOriginalVideoFile(null);
    setVideoAspectRatio(null);

    // If we have pending post generation, cancel it and reset state
    if (pendingPostGeneration) {
      console.log("❌ Template editor cancelled, aborting post generation");
      setPendingPostGeneration(null);
      setIsGeneratingBoth(false);
    }

    console.log("✅ All media cleared - returning to empty state");
  };

  const handleTemplateSelectorCancel = () => {
    setShowTemplateSelector(false);

    // If we have pending post generation, cancel it and reset state
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
    // Reset to original image if available
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
        notify("error", "You must be signed in to upload a thumbnail");
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
      notify("error", "Failed to upload thumbnail");
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
      const result = await executeImageGeneration(async () => {
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

  // Combined generation function - generates both post and image from main prompt
  const handleCombinedGeneration = async (
    prompt: string,
    shouldAutoOpenTemplate: boolean = true
  ): Promise<string | null> => {
    return await executeImageGeneration(async () => {
      const response = await API.generateImage({
        prompt: `${prompt.trim()}. Do not include any text, words, letters, numbers, captions, watermarks, logos, or typography. Pure imagery only.`,
        style: "professional",
        aspectRatio: aspectRatio,
      });

      const result = response.data;
      console.log("🎨 Image generation API response:", result);
      if (result.success && result.imageUrl) {
        await handleAIImageGenerated(result.imageUrl);
        setImageDescription(""); // Clear the description field
        return result;
      } else {
        throw new Error(result.error || "Image generation failed");
      }
    }, "Creating your custom image");
  };

  // Enhanced combined generation function - generates image and waits for template editor completion
  const handleCombinedGenerationWithPost = async (prompt: string) => {
    setIsGeneratingBoth(true);
    try {
      console.log(
        "🚀 Starting combined generation with template editor workflow..."
      );
      console.log(
        "📝 Prompt for combined generation:",
        prompt.substring(0, 100) + "..."
      );

      // Step 1: Generate the image (but don't auto-open template selector yet)
      console.log("🖼️ Step 1: Generating image from content...");
      const imageUrl = await handleCombinedGeneration(prompt, false); // Don't auto-open template

      if (!imageUrl) {
        console.error(
          "❌ Image generation failed, cannot proceed with post generation"
        );
        throw new Error("Image generation failed");
      }

      console.log("✅ Step 1 completed: Image generated successfully");

      // Store the post generation data to be used after template editor
      const currentCampaignInfo = campaignInfo || {
        name: "Default Campaign",
        industry: "General",
        brand_tone: "professional",
        target_audience: "General",
        description:
          "General content generation without specific campaign context",
      };

      const postGenerationData = {
        prompt,
        originalImageUrl: imageUrl,
        campaignInfo: currentCampaignInfo,
        selectedPlatforms: formData.selectedPlatforms,
        imageAnalysis,
        formData,
      };

      console.log("💾 Storing post generation data for later use");
      setPendingPostGeneration(postGenerationData);

      // Step 2: Open template editor directly with blank template and wait for user to complete editing
      console.log(
        "🎨 Step 2: Opening template editor with blank template - waiting for user to complete editing..."
      );
      // Get blank template
      const blankTemplate = getTemplateById("blank-template");
      if (blankTemplate) {
        console.log(
          "📋 Setting blank template and opening editor for combined generation"
        );
        setTimeout(() => {
          setSelectedTemplate(blankTemplate);
          setShowTemplateEditor(true);
        }, 500);
      } else {
        console.error(
          "❌ Blank template not found for combined generation - this should not happen!"
        );
        // This is a critical error - the blank template should always exist
        setIsGeneratingBoth(false);
        throw new Error(
          "Blank template not found - cannot proceed with template editing"
        );
      }

      // The post generation will continue when handleTemplateEditorSave is called
    } catch (error) {
      console.error("❌ Error in combined generation with post:", error);
      if (error instanceof Error) {
        console.error("❌ Error details:", error.message, error.stack);
        notify("error", `Failed to generate image: ${error.message}`);
      }
      setIsGeneratingBoth(false);
    }
    // Don't set setIsGeneratingBoth(false) here - it will be set after template editor completion
  };

  return (
    <div className="w-full mx-auto rounded-md border border-white/10  md:p-5 p-3 ">
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
                      // Allow switching to text post - clear media
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
                      // Allow switching to image post - clear media if switching from other types
                      if (selectedPostType !== "image") {
                        // If switching from video/text, clear existing media

                        setShowImageMenu(true);
                      } else {
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
                            // Abort any in-progress upload
                            if (uploadAbortControllerRef.current) {
                              uploadAbortControllerRef.current.abort();
                              uploadAbortControllerRef.current = null;
                            }
                            // Close the upload progress modal
                            hideLoading();
                            setSelectedImageMode("textToImage");
                            setShowImageMenu(false);
                            // Clear any previously selected/generated image when switching modes
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
                      // Allow switching to video post - clear media if switching from other types
                      if (selectedPostType !== "video") {
                        // If switching from image/text, clear existing media
                        // if (selectedPostType !== "video" && formData.media) {
                        //   setFormData((prev) => ({
                        //     ...prev,
                        //     media: undefined,
                        //     mediaUrl: undefined,
                        //   }));
                        //   setTemplatedImageUrl("");
                        //   setSelectedTemplate(undefined);
                        //   setImageAnalysis("");
                        //   setVideoThumbnailUrl("");
                        //   setOriginalVideoFile(null);
                        //   setVideoAspectRatio(null);
                        //   currentFileRef.current = null;
                        // }
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
                            // Clear video when switching between video modes
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
                              {/* <p className={`text-xs mt-1 ${selectedVideoMode === 'upload' ? 'text-white/80' : 'theme-text-tertiary'}`}>
                              Horizontal format
                            </p> */}
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Clear video when switching between video modes
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
                              {/* Fallback to video-post icon if text-to-video is not available */}
                              {/* <Icon name="video-post" size={44} className={`${selectedVideoMode === 'uploadShorts' ? 'brightness-0 invert' : ''}`} /> */}

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
                              {/* <p className={`text-xs mt-1 ${selectedVideoMode === 'uploadShorts' ? 'text-white/80' : 'theme-text-tertiary'}`}>
                              Vertical format
                            </p> */}
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
                            accept="image/*"
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
                                  console.log(
                                    "🖼️ Upload preview rendering with:",
                                    {
                                      templatedImageUrl:
                                        templatedImageUrl?.substring(0, 50) +
                                        "...",
                                      mediaUrl:
                                        formData.mediaUrl?.substring(0, 50) +
                                        "...",
                                      hasMedia: !!formData.media,
                                      mediaType: formData.media?.type,
                                      finalSrc:
                                        imageSrc.substring(0, 50) + "...",
                                    }
                                  );
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
                                {/* Remove button overlay */}
                                {/* <button
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      media: undefined,
                                      mediaUrl: undefined,
                                    }));
                                    // Also clear template-related state
                                    setTemplatedImageUrl("");
                                    setSelectedTemplate(undefined);
                                    setImageAnalysis("");
                                  }}
                                  className="absolute top-2 right-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md p-1.5 shadow-md transition-colors duration-200"
                                  title="Remove image"
                                >
                                  <X className="w-3 h-3" />
                                </button> */}
                              </div>
                              <div className="flex items-center justify-center flex-col space-y-1">
                                <p className="text-xs theme-text-secondary">
                                  {formData.media?.name || "Uploaded Image"}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      media: undefined,
                                      mediaUrl: undefined,
                                    }));
                                    // Also clear template-related state
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
                      {" "}
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

                        {/* Image Description Field - Only show when combined generation is NOT checked */}
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
                              onClick={() =>
                                handleCombinedGenerationWithPost(
                                  formData.prompt
                                )
                              }
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
                      {/* Generated Image Preview */}
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
                                    onLoad={() => {
                                      console.log(
                                        "✅ Text-to-image preview loaded successfully:",
                                        imageSrc.substring(0, 30) + "..."
                                      );
                                    }}
                                    onError={(e) => {
                                      console.error(
                                        "❌ Text-to-image preview failed to load:",
                                        imageSrc
                                      );
                                      console.error("❌ Error details:", e);
                                    }}
                                  />
                                );
                              })()}
                              {/* Remove button overlay */}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    media: undefined,
                                    mediaUrl: undefined,
                                  }));
                                  // Also clear template-related state
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
                                  // Also clear template-related state
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

                    {/* Debug Info - Enhanced debugging */}
                    {/* <div className="mb-2 p-2 bg-yellow-500/10 border border-yellow-400/20 rounded text-xs text-yellow-200 space-y-1">
                <div><strong>Debug State:</strong></div>
                <div>• media: {formData.media ? `✅ ${formData.media.type} (${formData.media.name})` : '❌ null'}</div>
                <div>• mediaUrl: {formData.mediaUrl ? `✅ ${formData.mediaUrl.substring(0, 50)}...` : '❌ null'}</div>
                <div>• templatedImageUrl: {templatedImageUrl ? `✅ ${templatedImageUrl.substring(0, 30)}...` : '❌ null'}</div>
                <div>• uploading: {uploading ? '🔄 true' : '✅ false'}</div>
                <div>• Should show preview: {(formData.media || formData.mediaUrl) ? '✅ YES' : '❌ NO'}</div>
              </div> */}

                    {formData.media || formData.mediaUrl ? (
                      <div className="space-y-4">
                        <div className="relative">
                          {/* Check if it's an image */}
                          {formData.media?.type.startsWith("image/") ||
                          (formData.mediaUrl &&
                            !formData.media &&
                            !formData.mediaUrl.match(
                              /\.(mp4|mov|avi|wmv|flv|webm|mkv|m4v)$/i
                            )) ? (
                            <div className="relative">
                              <img
                                src={
                                  // Prioritize templated image if available, then uploaded file URL, then local file object
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
                                onError={(e) => {
                                  console.error(
                                    "Video failed to load:",
                                    formData.mediaUrl || formData.media?.name
                                  );
                                }}
                                onLoadStart={() => {
                                  console.log(
                                    "Video loading started:",
                                    formData.mediaUrl || formData.media?.name
                                  );
                                }}
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
                                MB
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

                          {/* Thumbnail preference: AI or custom upload (only for non-9:16 videos) */}
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

                          {/* AI Analysis Button */}
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
                            // Also clear template-related state
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

                  {/* Video Aspect Ratio Warning - Always visible when there's a warning */}
                  {videoAspectRatioWarning && (
                    <div className="flex items-center justify-start p-3 theme-bg-danger border rounded-md text-xs mb-1 theme-text-light">
                      <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />{" "}
                      {videoAspectRatioWarning}
                    </div>
                  )}

                  {/* Image Analysis Results */}
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
                      className="rounded-md flex-1 flex items-center justify-between theme-bg-trinary theme-text-light border border-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] transition-colors duration-200 py-2.5 px-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm
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

                      <div className="sm:inline-block rounded-md theme-bg-quaternary theme-text-secondary px-2 py-1">
                        <Icon
                          name="spiral-logo"
                          size={20}
                          className="inline mr-1 mt-[-1px]"
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
                    <div className="relative  rounded-md overflow-hidden shadow-md bg-gray-900 aspect-video w-full">
                      {/* VIDEO REPLACING SVG BUTTON */}
                      <motion.video
                        src={IntroVideo}
                        
                        muted
                        loop
                        playsInline
                        controls
                        preload="none"
                        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%23111827' width='1920' height='1080'/%3E%3C/svg%3E"
                        className="absolute w-full h-full object-cover"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: 0.6,
                          type: "spring",
                          stiffness: 80,
                        }}
                      />

                      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent pointer-events-none hidden sm:block">
                        <p className="text-white text-lg font-semibold">
                          {t("introduction_to_omnishare")}
                        </p>
                        <p className="text-white/80">
                          {t(
                            "learn_how_to_maximize_your_social_media_presence"
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
            </div>
          </form>
        </>
      )}

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          onSelectTemplate={handleTemplateSelect}
          onCancel={handleTemplateSelectorCancel}
        />
      )}

      {/* Template Editor Modal */}
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
