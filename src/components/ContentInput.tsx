import React, { useState, useRef, useEffect, useCallback } from "react";
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

import {
  isVideoFile,
  getVideoAspectRatio,
  is16x9Video,
  is9x16Video,
} from "../utils/videoUtils";
import { useLoadingAPI } from "../hooks/useLoadingAPI";
import API from "@/services/api";
import { notify } from "@/utils/toast";
import { useTranslation } from "react-i18next";
import ImageRegenerationModal from "./ImageRegenerationModal";
import { Link, useNavigate } from "react-router-dom";
import { useConfirmDialog } from "../context/ConfirmDialogContext";
import { useNavigationGuard } from "../hooks/useNavigationGuard";
import { useUser } from "@/store/useUser";

interface ContentInputProps {
  onNext: (data: PostContent) => void;
  onBack: () => void;
  setDiscardFn?: (fn: () => void) => void;
  initialData?: Partial<PostContent>;
  selectedPlatforms?: Platform[];
  editMode?: boolean;
  setShowGenerateModal: any;
  setShowPublishModal: any;
}

export const ContentInput: React.FC<ContentInputProps> = ({
  onNext,
  onBack,
  initialData,
  setDiscardFn,
  selectedPlatforms,
  editMode,
  setShowPublishModal,
}) => {
  const {
    state,
    generationAmounts,
    setCost,
    cost,
    setUseLogo,
    useLogo,
    setUseTheme,
    useTheme,
  }: any = useAppContext();
  const { user } = useUser();
  const {
    executeVideoThumbnailGeneration,
    executeImageGeneration,
    executeFileUpload,
    showLoading,
    hideLoading,
  } = useLoadingAPI();
  const { t } = useTranslation();

  const { showConfirm, closeConfirm } = useConfirmDialog();

  const [formData, setFormData] = useState<any>({
    prompt: initialData?.prompt || "",
    tags: [],
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

  type VideoMode = "upload" | "uploadShorts" | "";

  const VIDEO_DIMENSIONS = {
    upload: {
      ratios: ["16:9", "1:1"],
      minWidth: 640,
      minHeight: 360,
    },
    uploadShorts: {
      ratios: ["9:16"],
      minWidth: 720,
      minHeight: 1280,
    },
  };

  const getVideoDimensions = (
    file: File
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
        });
        URL.revokeObjectURL(video.src);
      };

      video.onerror = reject;
      video.src = URL.createObjectURL(file);
    });
  };

  const getRatio = (w: number, h: number) => {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const d = gcd(w, h);
    return `${w / d}:${h / d}`;
  };

  const validateVideo = async (file: File, selectedVideoMode: VideoMode) => {
    if (!selectedVideoMode) return { valid: true };

    const { width, height } = await getVideoDimensions(file);
    const ratio = getRatio(width, height);

    const rules = VIDEO_DIMENSIONS[selectedVideoMode];

    const validRatio = rules.ratios.includes(ratio);
    const validSize = width >= rules.minWidth && height >= rules.minHeight;

    if (!validRatio || !validSize) {
      return {
        valid: false,
        message:
          selectedVideoMode === "uploadShorts"
            ? `❌ Shorts must be vertical (9:16). Your video: ${ratio}`
            : `❌ Upload videos must be landscape (16:9) or square (1:1). Your video: ${ratio}`,
      };
    }

    return { valid: true, ratio };
  };

  const [selectedVideoMode, setSelectedVideoMode] = useState<
    "upload" | "uploadShorts" | ""
  >("");

  const [selectedPostType, setSelectedPostType] = useState<
    "text" | "image" | "video" | ""
  >("image");

  const [selectedImageMode, setSelectedImageMode] = useState<
    "upload" | "textToImage" | ""
  >("textToImage");

  const getAcceptType = () => {
    if (selectedPostType === "image") return "image/*";

    if (selectedPostType === "video") {
      if (selectedVideoMode === "uploadShorts") {
        return "video/mp4,video/webm"; // restrict shorts formats
      }
      return "video/*";
    }

    return undefined; // 👈 important (not "")
  };

  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState<string>("");
  const [originalVideoFile, setOriginalVideoFile] = useState<File | null>(null);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null);
  const [videoAspectRatioWarning, setVideoAspectRatioWarning] =
    useState<string>("");
  const [warningTimeoutId, setWarningTimeoutId] = useState<any | null>(null);

  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [imageDescription, setImageDescription] = useState<string>("");
  const [generateImageWithPost, setGenerateImageWithPost] = useState(true);
  const [isGeneratingBoth, setIsGeneratingBoth] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Guard navigation when there are unsaved changes or active generation
  const hasUnsavedChanges =
    formData.prompt.trim() || formData.media || formData.mediaUrl;
  const isProcessing =
    isGeneratingBoth || isGeneratingThumbnail || isGeneratingImage;

  // Check if there's unsaved content (moved before useNavigationGuard)

  const checkUnsavedContent = useCallback(() => {
    return (
      (formData?.prompt?.trim?.()?.length ?? 0) > 0 ||
      !!formData?.media ||
      !!formData?.mediaUrl ||
      (generatedResults?.length ?? 0) > 0 ||
      showPreview
    );
  }, [
    formData?.prompt,
    formData?.media,
    formData?.mediaUrl,
    generatedResults?.length,
    showPreview,
  ]);

  useNavigationGuard({
    isActive: isProcessing || checkUnsavedContent(),
    onConfirm: () => {
      // optional: agar upload/generation chal rahi ho to abort bhi yahan kar sakte ho
      // uploadAbortControllerRef.current?.abort();
      // hideLoading();

      handleTemplateEditorCancel(); // ✅ tumhara proven discard/reset
    },
  });

  const logoUrl = user?.profile?.brandLogo || "";
  const themeUrl = user?.profile?.publicUrl || "";

  // Video thumbnail specific logo and theme states
  const [videoUseLogo, setVideoUseLogo] = useState(false);
  const [videoUseTheme, setVideoUseTheme] = useState(false);

  const [generateVideoThumbnailAI, setGenerateVideoThumbnailAI] =
    useState(true);
  const [showVideoThumbnailModal, setShowVideoThumbnailModal] = useState(false);
  const [videoThumbnailForRegeneration, setVideoThumbnailForRegeneration] =
    useState<string>("");
  const [videoThumbnailGenerations, setVideoThumbnailGenerations] = useState<
    string[]
  >([]);
  const [videoThumbnailPrompt, setVideoThumbnailPrompt] = useState("");
  const [videoModifyMode, setVideoModify] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [customThumbnailUploading, setCustomThumbnailUploading] =
    useState(false);

  const uploadAbortControllerRef = useRef<AbortController | null>(null);

  const currentFileRef = useRef<File | null>(null);

  const [pendingPostGeneration, setPendingPostGeneration] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const isValidUrl = (u?: string | null) => {
    if (!u) return false;
    const s = u.trim();
    return true;
  };

  const hasLogo = isValidUrl(logoUrl);
  const hasTheme = isValidUrl(themeUrl);

  useEffect(() => {
    if (!hasLogo && useLogo) setUseLogo(false);
  }, [hasLogo, useLogo, setUseLogo]);

  useEffect(() => {
    if (!hasTheme && useTheme) setUseTheme(false);
  }, [hasTheme, useTheme, setUseTheme]);

  // Check if there's unsaved content
  // const hasUnsavedContent = () => {
  //   return (
  //     (formData?.prompt?.trim?.()?.length ?? 0) > 0 ||
  //     !!formData?.media ||
  //     !!formData?.mediaUrl ||
  //     (generatedResults?.length ?? 0) > 0 ||
  //     showPreview
  //   );
  // };

  // Helper to show confirm dialog and navigate
  const showConfirmAndNavigate = useCallback(
    (path: string, isDangerous = false) => {
      if (checkUnsavedContent()) {
        showConfirm(
          t("confirm_navigation") || "Confirm",
          t("unsaved_changes_warning") ||
            "You have unsaved changes. Are you sure you want to leave?",
          () => {
            closeConfirm();
            navigate(path); // setTimeout ki zaroorat nahi
          },
          isDangerous
        );
      } else {
        navigate(path);
      }
    },
    [checkUnsavedContent, showConfirm, closeConfirm, navigate, t]
  );

  useEffect(() => {
    const handleClickCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement;

      if (link && checkUnsavedContent()) {
        const href = link.getAttribute("href");
        if (
          href &&
          !href.includes("://") &&
          !href.startsWith("mailto:") &&
          !link.download
        ) {
          e.preventDefault();
          e.stopPropagation();
          showConfirmAndNavigate(href);
        }
      }
    };

    document.addEventListener("click", handleClickCapture, true);
    return () =>
      document.removeEventListener("click", handleClickCapture, true);
  }, [checkUnsavedContent, showConfirmAndNavigate]);

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
    if (formData.media && formData.media.type.startsWith("video/")) {
      validateVideo(formData.media, selectedVideoMode).then((res: any) => {
        setVideoAspectRatioWarning(res.valid ? "" : res.message);
      });
    }
  }, [selectedVideoMode]);

  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      selectedPlatforms: initialData?.selectedPlatforms ||
        selectedPlatforms || ["linkedin"],
    }));
    const appropriatePlatforms = getAppropiatePlatforms(
      selectedPostType?.toLowerCase() as "text" | "image" | "video",
      selectedImageMode,
      selectedVideoMode
    );
    setFormData((prev: any) => ({
      ...prev,
      selectedPlatforms: appropriatePlatforms,
    }));
    setShowPublishModal(false);
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
          if (warningTimeoutId) {
            clearTimeout(warningTimeoutId);
            setWarningTimeoutId(null);
          }
          setVideoAspectRatioWarning("");
        }
      }
    } else {
      if (videoAspectRatioWarning) {
        setVideoAspectRatioWarning("");
      }
    }
  }, [
    formData.prompt,
    selectedPostType,
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
      if (state.selectedCampaign && user?.id) {
        try {
          setLoadingCampaign(true);

          const campaign = await getCampaignById(
            state.selectedCampaign.id,
            user.id
          );
          setCampaignInfo(campaign);

          if (
            campaign.platforms &&
            (!formData.selectedPlatforms ||
              formData.selectedPlatforms.length === 0)
          ) {
            setFormData((prev: any) => ({
              ...prev,
              selectedPlatforms: campaign.platforms,
            }));
          }
        } catch (error) {
          setCampaignInfo(null);
        } finally {
          setLoadingCampaign(false);
        }
      } else {
        setCampaignInfo(null);
      }
    };

    fetchCampaignInfo();
  }, [state.selectedCampaign, user?.id]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  const warningTimeoutRef = useRef<any>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    currentFileRef.current = file;
    setTemplatedImageUrl("");
    setSelectedTemplate(undefined);
    setImageAnalysis("");
    setVideoThumbnailUrl("");
    setOriginalVideoFile(null);
    setVideoAspectRatio(null);

    const previewUrl = URL.createObjectURL(file);

    if (file.type.startsWith("video/")) {
      const result: any = await validateVideo(file, selectedVideoMode);

      if (!result.valid) {
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

        setVideoAspectRatioWarning("");
        setTimeout(() => {
          setVideoAspectRatioWarning(result.message);

          warningTimeoutRef.current = setTimeout(() => {
            setVideoAspectRatioWarning("");
            warningTimeoutRef.current = null;
          }, 2500);
        }, 50);

        return;
      }

      setVideoAspectRatioWarning("");
    }

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
      } catch (error) {}
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
              uploadAbortControllerRef.current = null;
              // Optionally clean up the preview if user cancels
              setFormData((prev) => {
                if (prev.mediaUrl && prev.mediaUrl.startsWith("blob:")) {
                  URL.revokeObjectURL(prev.mediaUrl);
                }
                return {
                  ...prev,
                  media: undefined,
                  selectedPlatforms: [],
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
          uploadAbortControllerRef.current = null;
          return;
        }

        // Double-check: if abort controller was cleared (mode was switched), don't add the image
        if (!uploadAbortControllerRef.current) {
          return;
        }

        // Triple-check: verify this is still the current file being processed
        if (currentFileRef.current !== file) {
          return;
        }

        uploadAbortControllerRef.current = null; // Clear abort controller after successful upload
        currentFileRef.current = null; // Clear current file ref

        setFormData((prev) => {
          if (prev.mediaUrl && prev.mediaUrl.startsWith("blob:")) {
            URL.revokeObjectURL(prev.mediaUrl);
          }

          const newData = {
            ...prev,
            media: file,
            mediaUrl: mediaUrl,
            serverUrl: mediaUrl,
          };

          return newData;
        });
      } catch (error) {
        if (error instanceof Error) {
        } else {
        }
      }
    } catch (error) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (user?.balance < cost) {
    //   navigate("/pricing");
    //   return;
    // }

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
        notify("error", t("generate_image_first"));
        return;
      }

      if (
        selectedImageMode === "upload" &&
        !formData.mediaUrl &&
        !formData.media
      ) {
        notify("error", t("upload_image_first"));
        return;
      }

      if (
        selectedImageMode === "upload" &&
        (formData.media || formData.mediaUrl)
      ) {
        const imageUrl =
          formData.mediaUrl ||
          (formData.media ? URL.createObjectURL(formData.media) : "");

        setSelectedFile(null);

        await handleRegenerate(formData.prompt, imageUrl);
        return;
      }

      if (
        (selectedVideoMode === "upload" ||
          selectedVideoMode === "uploadShorts") &&
        !formData.mediaUrl &&
        !formData.media
      ) {
        notify("error", t("upload_video_first"));
        return;
      }

      // Proceed only if we have a video (either uploaded file or URL)
      if (
        (selectedVideoMode === "upload" ||
          selectedVideoMode === "uploadShorts") &&
        (originalVideoFile || formData.mediaUrl) &&
        !is9x16Video(videoAspectRatio || 0)
      ) {
        if (generateVideoThumbnailAI) {
          try {
            const generatedThumbnailUrl = await generateThumbnailForPost(
              formData.prompt,
              videoAspectRatio
            );

            if (generatedThumbnailUrl) {
              setVideoThumbnailForRegeneration(generatedThumbnailUrl);
              setVideoThumbnailGenerations([generatedThumbnailUrl]);
              setShowVideoThumbnailModal(true);
              return;
            } else {
            }
          } catch (err) {}
        } else {
          if (videoThumbnailUrl) {
            const blankTemplate = getTemplateById("blank-template");
            if (blankTemplate) {
              setVideoThumbnailForRegeneration(videoThumbnailUrl);
              setVideoThumbnailGenerations([videoThumbnailUrl]);
              setShowVideoThumbnailModal(true);

              const currentCampaignInfo = campaignInfo || {
                name: "",
                industry: t("general"),
                brand_tone: "professional",
                target_audience: t("general"),
                description: t("general_content_generation"),
              };

              const postGenerationData = {
                prompt: formData.prompt,
                basePrompt: basePrompt,
                originalImageUrl: videoThumbnailUrl,
                originalVideoUrl: formData.mediaUrl,
                originalVideoFile: originalVideoFile,
                videoAspectRatio: videoAspectRatio,
                isVideoContent: true,
                currentCampaignInfo: currentCampaignInfo,
                selectedPlatforms: formData.selectedPlatforms,
                imageAnalysis: `Custom thumbnail uploaded for video`,
                formData,
              };

              setPendingPostGeneration(postGenerationData);
              // Clear the main post prompt after image generation to keep modal prompt separate
              setFormData((prev: any) => ({ ...prev, prompt: "" }));
              return;
            }
          }
        }
      }

      const currentFormData: any = formData;

      const currentCampaignInfo = campaignInfo || {
        name: "",
        industry: t("general"),
        brand_tone: "professional",
        target_audience: t("general"),
        description: t("general_content_generation"),
      };

      const isVideoContent = !!(
        originalVideoFile ||
        (currentFormData.media && isVideoFile(currentFormData.media))
      );

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

      let finalPostData;
      if (templatedImageUrl) {
        finalPostData = {
          ...currentFormData,
          mediaUrl: templatedImageUrl,
          imageUrl: templatedImageUrl,
          serverUrl: templatedImageUrl,
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
        thumbnailUrl:
          templatedImageUrl || videoThumbnailUrl || finalPostData.thumbnailUrl,
        website: currentCampaignInfo.website,
        objective: currentCampaignInfo.objective,
        goals: currentCampaignInfo.goals,
        keywords: currentCampaignInfo.keywords,
        hashtags: currentCampaignInfo.hashtags,
      };

      if (onNext && typeof onNext === "function") {
        onNext(postData);
      } else {
        setShowPreview(true);

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
              templatedImageUrl || (currentFormData as any).thumbnailUrl, // Use templated image as poster for videos
            isVideoContent: isVideoContent,
            videoAspectRatio: videoAspectRatio,
            engagement: Math.floor(Math.random() * 1000),
          },
        ];
        setGeneratedResults(simulatedGeneratedPosts);
      }
    }
  };

  const togglePlatform = (platform: string) => {
    setFormData((prev: any) => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms?.includes(platform as Platform)
        ? prev.selectedPlatforms.filter((p) => p !== platform)
        : [...(prev.selectedPlatforms || []), platform as Platform],
    }));
  };

  const useImageAnalysis = () => {
    setFormData((prev: any) => ({
      ...prev,
      prompt:
        prev.prompt +
        (prev.prompt ? "\n\n" : "") +
        `Image Analysis: ${imageAnalysis}`,
    }));
    setImageAnalysis("");
  };

  const [modelImage, setModelImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedConfirmedImage, setSelectedConfirmedImage] = useState<
    string | null
  >(null);
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
      setFormData((prev) => {
        const newData = { ...prev, mediaUrl: imageUrl };

        return newData;
      });
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
    setShowTemplateEditor(true);
  };

  const handleTemplateEditorSave = async (imageUrl: string) => {
    let finalTemplatedUrl = imageUrl;
    try {
      const needsUpload =
        !imageUrl ||
        imageUrl.startsWith("data:") ||
        imageUrl.startsWith("blob:");
      if (needsUpload) {
        const user = await getCurrentUser();
        if (user?.user?.id) {
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
            finalTemplatedUrl = uploadedUrl;
          }
        }
      }
    } catch (uploadErr) {}

    setTemplatedImageUrl(finalTemplatedUrl);
    setSelectedConfirmedImage(null);
    setFormData((prev) => ({
      ...prev,
      mediaUrl: finalTemplatedUrl,
      imageUrl: finalTemplatedUrl,
      serverUrl: finalTemplatedUrl,
    }));

    if (pendingPostGeneration?.isVideoContent) {
      setVideoThumbnailUrl(finalTemplatedUrl);
    }
    setShowTemplateEditor(false);

    if (pendingPostGeneration) {
      const {
        prompt,
        basePrompt,
        campaignInfo: currentCampaignInfo,
        selectedPlatforms,
        imageAnalysis,
        formData: originalFormData,
        isVideoContent,
        originalVideoUrl,
        originalVideoFile,
        videoAspectRatio,
      } = pendingPostGeneration;

      // Use the original base prompt for post generation; ignore regeneration prompt.
      const base = basePrompt || originalFormData?.prompt || "";
      const regen = prompt || "";
      const finalPrompt = base || regen;

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
          mediaUrl: finalTemplatedUrl,
          imageUrl: finalTemplatedUrl,
          serverUrl: finalTemplatedUrl,
        };

        mediaAssets = [{ url: finalTemplatedUrl, type: "image" }];
      }

      const postData = {
        ...currentFormData,
        prompt: finalPrompt,
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
          t("general"),
        description: currentCampaignInfo?.description || "something nice",
        imageAnalysis: imageAnalysis,
        website: currentCampaignInfo?.website || "",
        objective: currentCampaignInfo?.objective || "",
        goals: currentCampaignInfo?.goals || "",
        keywords: currentCampaignInfo?.keywords || "interesting , modern",
        hashtags: currentCampaignInfo?.hashtags,
        ...(isVideoContent && {
          isVideoContent: true,
          videoAspectRatio: videoAspectRatio,
          originalVideoFile: originalVideoFile,
        }),
      };

      setPendingPostGeneration(null);
      setIsGeneratingBoth(false);
      setAllGeneration([]);
      if (onNext && typeof onNext === "function") {
        onNext(postData);
      } else {
        setShowPreview(true);
        const simulatedGeneratedPosts = [
          {
            platform: (selectedPlatforms && selectedPlatforms[0]) || "linkedin",
            content: finalPrompt,
            caption: finalPrompt,
            hashtags: originalFormData.tags,
            engagement: Math.floor(Math.random() * 1000),
          },
        ];
        setGeneratedResults(simulatedGeneratedPosts);
      }
    } else {
      if (formData?.prompt && formData?.prompt?.trim()) {
        const currentCampaignInfo = campaignInfo || {
          name: "",
          industry: t("general"),
          brand_tone: "professional",
          target_audience: t("general"),
          description: t("general_content_generation"),
        };

        const isCurrentVideoContent = originalVideoFile && videoThumbnailUrl;

        let postData;
        if (isCurrentVideoContent) {
          postData = {
            ...formData,
            mediaUrl: formData.mediaUrl, // Keep original video URL
            thumbnailUrl: videoThumbnailUrl, // Use videoThumbnailUrl state which has the uploaded URL
            videoFile: originalVideoFile,
            videoAspectRatio: videoAspectRatio,
            isVideoContent: true,
            campaignName: currentCampaignInfo.name,
            campaignInfo: currentCampaignInfo,
            mediaAssets: [
              {
                url: formData.mediaUrl,
                type: "video",
                thumbnailUrl: videoThumbnailUrl,
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
          postData = {
            ...formData,
            mediaUrl: templatedImageUrl, // Use templatedImageUrl state which has the uploaded URL
            imageUrl: templatedImageUrl,
            serverUrl: templatedImageUrl,
            campaignName: currentCampaignInfo.name,
            campaignInfo: currentCampaignInfo,
            mediaAssets: [{ url: templatedImageUrl, type: "image" }],
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

        if (onNext && typeof onNext === "function") {
          onNext(postData);
        }
      } else {
      }
    }
    setTimeout(() => {
      setShowTemplateEditor(false);
    }, 500);
  };
  const handleTemplateEditorCancel = () => {
    setImageDescription("");
    setGeneratedImage(null);
    setSelectedConfirmedImage(null);
    setModify(false);
    setAllGeneration([]);
    setPendingPostGeneration(null);
    setIsGeneratingBoth(false);
    setShowTemplateEditor(false);
    setSelectedTemplate(undefined);
    setModelImage(false);
    setAllGeneration([]);
    setFormData((prev) => ({
      ...prev,
      prompt: "",
      media: undefined,
      selectedPlatforms: [],
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
    setShowPreview(false);
    setPendingPostGeneration(null);
    setIsGeneratingBoth(false);
    setSelectedFile(null);
    setGeneratedImage(null);
  };
  useEffect(() => {
    // ✅ expose the exact reset function to parent
    setDiscardFn?.(handleTemplateEditorCancel);
  }, [setDiscardFn, handleTemplateEditorCancel]);

  const handleTemplateSelectorCancel = () => {
    setShowTemplateSelector(false);

    if (pendingPostGeneration) {
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
        const targetAspectRatio = "16:9";
        const aspectRatioDescription =
          "16:9 horizontal/landscape format (forced)";

        const thumbnailPrompt = `Create a compelling video thumbnail for ${aspectRatioDescription} video about: ${contentDescription.trim()}. Make it eye-catching, professional, and suitable for social media platforms. Include relevant visual elements that represent the content. Do not include any text, words, letters, numbers, captions, watermarks, logos, or typography. Pure imagery only.`;

        const requestBody = {
          prompt: thumbnailPrompt,
          style: "professional",
          aspectRatio: targetAspectRatio,
        };

        const response = await API.generateImage(requestBody);

        const result = await response.data;
        if (!result.success || !result.imageUrl) {
          throw new Error(result.error || "Video thumbnail generation failed");
        }

        try {
          const user = await getCurrentUser();
          if (user?.user?.id) {
            const imgResp = await fetch(result.imageUrl);
            const blob = await imgResp.blob();
            const file = new File([blob], `video-thumbnail-${Date.now()}.png`, {
              type: "image/png",
            });
            const uploadedUrl = await uploadMedia(file, user.user.id);
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
            uploadAbortControllerRef.current = null;
          },
        }
      );

      if (!mediaUrl || !uploadAbortControllerRef.current) {
        uploadAbortControllerRef.current = null;
        return;
      }

      uploadAbortControllerRef.current = null;
      setVideoThumbnailUrl(mediaUrl);

      const blankTemplate = getTemplateById("blank-template");
      setVideoThumbnailForRegeneration(mediaUrl);
      setVideoThumbnailGenerations([...videoThumbnailGenerations, mediaUrl]);
      if (blankTemplate) {
        //   setSelectedTemplate(blankTemplate);
        //setShowTemplateEditor(true);

        const currentCampaignInfo = campaignInfo || {
          name: "",
          industry: t("general"),
          brand_tone: "professional",
          target_audience: t("general"),
          description: t("general_content_generation"),
        };

        const postGenerationData = {
          prompt: formData.prompt,
          basePrompt: basePrompt,
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
        // Clear the main post prompt since we've captured it as basePrompt
        setFormData((prev: any) => ({ ...prev, prompt: "" }));
      }
    } catch (err) {
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
        if (result.success && result.imageUrl) {
          await handleAIImageGenerated(result.imageUrl);
          setImageDescription("");
          return result;
        } else {
          throw new Error(result.error || "Image generation failed");
        }
      }, "Creating your custom image");
    } catch (error) {
    } finally {
      setIsGeneratingImage(false);
    }
  };
  const [modifyMode, setModify] = useState(false);
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
        ...(user?.profile?.isBrandLogo &&
          logoUrl && {
            logoUrl,
            useLogo: true,
          }),

        ...(user?.profile?.isBrandTheme &&
          themeUrl && {
            themeUrl,
            useTheme: true,
          }),
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
  const [prompt, setPrompt] = useState("");
  // basePrompt holds the original post prompt when opening regeneration modal
  const [basePrompt, setBasePrompt] = useState("");

  // When opening the image regeneration modal, initialize the modal prompt
  // with the base post prompt so users see and can edit it while regenerating.
  useEffect(() => {
    if (modelImage) {
      const base = formData?.prompt || "";
      setBasePrompt(base);
      if (!prompt || prompt.trim() === "") {
        setPrompt(base);
      } else if (base && !prompt.includes(base)) {
        setPrompt(`${base} ${prompt}`);
      }
    }
  }, [modelImage, formData?.prompt]);

  // Same behavior for video thumbnail regeneration modal
  useEffect(() => {
    if (showVideoThumbnailModal) {
      const base = formData?.prompt || "";
      if (!videoThumbnailPrompt || videoThumbnailPrompt.trim() === "") {
        setVideoThumbnailPrompt(base);
      } else if (base && !videoThumbnailPrompt.includes(base)) {
        setVideoThumbnailPrompt(`${base} ${videoThumbnailPrompt}`);
      }
    }
  }, [showVideoThumbnailModal, formData?.prompt]);

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
      setGeneratedImage(null);

      const currentCampaignInfo = campaignInfo || {
        name: "",
        industry: t("general"),
        brand_tone: "professional",
        target_audience: t("general"),
        description: t("general_content_generation"),
      };

      let finalImageUrl: string | null = null;

      // Determine which image to use: provided URL (upload), or generatedImage (modify mode), or none (textToImage)
      const imageToModify = Url || generatedImage;

      if (modifyMode && imageToModify) {
        const result: any = await handleCombinedGeneration(
          newPrompt,
          imageToModify
        );
        finalImageUrl = result.imageUrl;
        setGeneratedImage(finalImageUrl);
        setAllGeneration([...allGeneration, finalImageUrl]);
      } else if (Url && !modifyMode) {
        finalImageUrl = Url;

        setGeneratedImage(finalImageUrl);
        setAllGeneration([...allGeneration, finalImageUrl]);
      } else {
        const result: any = await handleCombinedGeneration(newPrompt);
        finalImageUrl = result.imageUrl;
        setGeneratedImage(finalImageUrl);
        setAllGeneration([...allGeneration, finalImageUrl]);
      }

      setModelImage(true);

      const postGenerationData = {
        prompt: newPrompt,
        basePrompt: basePrompt,
        originalImageUrl: finalImageUrl,
        campaignInfo: currentCampaignInfo,
        selectedPlatforms: formData.selectedPlatforms,
        imageAnalysis,
        formData,
      };
      setPendingPostGeneration(postGenerationData);
      // Clear the main post prompt to avoid using regen prompt for post generation
      setFormData((prev: any) => ({ ...prev, prompt: "" }));
      setIsGeneratingBoth(false);
      setPrompt("");
    } catch (error) {
      setFormData((prev) => {
        const newData = {
          ...prev,
          mediaUrl: undefined,
          serverUrl: undefined,
        };

        return newData;
      });
      notify("error", "We couldn’t generate the image.");
      setIsGeneratingBoth(false);
      setPrompt("");
    }
  };

  const handleVideoThumbnailRegenerate = async (
    newPrompt: string,
    Url?: string
  ) => {
    try {
      let isModifyMode = Url !== null && Url !== undefined;
      let imageToProcess = isModifyMode ? Url : videoThumbnailForRegeneration;

      if (imageToProcess && isUrl(imageToProcess)) {
        imageToProcess = await urlToBase64(imageToProcess);
      }

      const payload = {
        prompt: newPrompt,
        style: "professional",
        imageUrl: imageToProcess || undefined,
        aspectRatio: String(videoAspectRatio || "16:9"),
        modifyMode: isModifyMode,
      };

      return await executeImageGeneration(async () => {
        const response = await API.generateImage({
          prompt: `${newPrompt.trim()}. Do not include any text, words, letters, numbers, captions, watermarks, logos, or typography. Pure imagery only.`,
          style: "professional",
          ...(imageToProcess && { imageUrl: imageToProcess }),
          aspectRatio: String(videoAspectRatio || "16:9"),
          ...(isModifyMode && { modifyMode: true }),
          ...(videoUseLogo && logoUrl && { logoUrl: logoUrl }),
          ...(videoUseTheme && themeUrl && { useTheme: videoUseTheme }),
          ...(videoUseLogo && logoUrl && { useLogo: videoUseLogo }),
          ...(videoUseTheme && themeUrl && { themeUrl: themeUrl }),
        });

        const result = response.data;
        if (result.success && result.imageUrl) {
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
      if (error instanceof Error) {
        notify("error", `Failed to regenerate thumbnail: ${error.message}`);
      }
    }
  };

  const confirmImage = async (selectedImageUrl?: string) => {
    try {
      // Use the selected image if provided, otherwise fall back to generatedImage
      const imageToUse = selectedImageUrl || generatedImage;

      if (imageToUse) {
        setGeneratedImage(imageToUse);
        setSelectedConfirmedImage(imageToUse); // Store the confirmed image separately
      }

      const blankTemplate = getTemplateById("blank-template");
      if (blankTemplate) {
        setSelectedTemplate(blankTemplate);
        setTimeout(() => {
          setShowTemplateEditor(true);
        }, 200);
      }
    } catch (error) {
      if (error instanceof Error) {
        notify("error", `Failed to open template editor: ${error.message}`);
      }
    }
  };

  const confirmVideoThumbnail = async (selectedImageUrl?: string) => {
    try {
      // Use the selected image if provided, otherwise fall back to videoThumbnailForRegeneration
      const thumbnailToUse = selectedImageUrl || videoThumbnailForRegeneration;

      setVideoThumbnailUrl(thumbnailToUse);
      setSelectedConfirmedImage(thumbnailToUse); // Store the confirmed image separately

      setShowVideoThumbnailModal(false);
      const blankTemplate = getTemplateById("blank-template");
      if (blankTemplate) {
        setTimeout(() => {
          setSelectedTemplate(blankTemplate);
          setShowTemplateEditor(true);

          // Store post generation data for template editor
          const currentCampaignInfo = campaignInfo || {
            name: "",
            industry: t("general"),
            brand_tone: "professional",
            target_audience: t("general"),
            description: t("general_content_generation"),
          };

          const postGenerationData = {
            prompt: formData.prompt,
            basePrompt: basePrompt,
            originalImageUrl: thumbnailToUse, // Use confirmed video thumbnail
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
          // Clear the main post prompt after scheduling post generation
          setFormData((prev: any) => ({ ...prev, prompt: "" }));
        }, 500);
      }
    } catch (error) {
      if (error instanceof Error) {
        notify("error", `Failed to proceed: ${error.message}`);
      }
    }
  };
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.currentTarget.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > MAX_FILE_SIZE) {
      notify("error", "File size must be less than 50MB.");
      event.target.value = ""; // reset input
      return;
    }

    // Reset image-related state
    setTemplatedImageUrl("");
    setSelectedTemplate(undefined);
    setImageAnalysis("");

    if (isVideoFile(file)) {
      handleFileUpload(file);
      return;
    }

    setSelectedFile(file);
    setAllGeneration([]); // Reset previous generations
    setIsGeneratingImageUpload(""); // Clear any previous generation URL
    setModelImage(false); // Don't open modal yet

    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      media: file,
      mediaUrl: previewUrl,
    }));

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setGeneratedImage(base64String);
        // setAllGeneration([base64String]);
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
    } else if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  const calculateCost = () => {
    if (!selectedPostType || !generationAmounts) return 0;

    const textPrice = Number(generationAmounts?.text || 0);
    const imagePrice = Number(generationAmounts?.image || 0);
    const videoPrice = Number(generationAmounts?.video || 0);

    switch (selectedPostType) {
      case "text":
        return textPrice * 2;

      case "image":
        return selectedImageMode === "textToImage"
          ? imagePrice + textPrice * 3
          : textPrice * 3;

      case "video":
        if (selectedVideoMode === "uploadShorts") return textPrice * 5;
        if (selectedVideoMode === "upload")
          return generateVideoThumbnailAI
            ? imagePrice + textPrice * 3
            : textPrice * 3;
        return videoPrice + textPrice * 5;

      default:
        return textPrice;
    }
  };

  useEffect(() => {
    setCost(calculateCost());
  }, [
    selectedPostType,
    selectedImageMode,
    selectedVideoMode,
    generateVideoThumbnailAI,
    generationAmounts,
  ]);
  console.log("cost", cost);
  const resetAll = () => {
    if (uploadAbortControllerRef.current) {
      uploadAbortControllerRef.current.abort();
      uploadAbortControllerRef.current = null;
    }

    hideLoading();

    // File & refs
    setSelectedFile(null);
    setOriginalVideoFile(null);
    currentFileRef.current = null;

    // UI states
    setShowPreview(false);
    setShowImageMenu(false);
    setShowVideoMenu(false);
    // setSelectedVideoMode("");

    // Image states
    setGeneratedImage(null);
    setTemplatedImageUrl("");
    setSelectedTemplate(undefined);
    setImageAnalysis("");

    // Video states
    setVideoAspectRatio(null);
    setVideoThumbnailUrl("");
    setVideoAspectRatioWarning("");

    // Form data (single update 👇)
    setFormData((prev) => ({
      ...prev,
      media: undefined,
      mediaUrl: undefined,
      selectedPlatforms: [],
      prompt: "",
    }));
    setModelImage(false);
    setAllGeneration([]);
  };

  return (
    <div className="w-full mx-auto rounded-md border border-white/10  md:p-5 p-3 ">
      {modelImage && (
        <ImageRegenerationModal
          imageUrl={generatedImage}
          prompt={prompt}
          setPrompt={setPrompt}
          isLoading={isGeneratingBoth}
          allGeneration={allGeneration}
          setAllGeneration={setAllGeneration}
          setModify={setModify}
          modifyMode={modifyMode}
          generationAmounts={generationAmounts["image"]}
          onClose={handleTemplateEditorCancel}
          onRegenerate={handleRegenerate}
          confirmImage={confirmImage}
          onFileSave={onFileSave}
          selectedFile={selectedFile}
          useLogo={useLogo}
          setUseLogo={setUseLogo}
          useTheme={useTheme}
          setUseTheme={setUseTheme}
          logoUrl={logoUrl}
          themeUrl={themeUrl}
          hasOutput={Boolean(generatedImage)}
        />
      )}
      {showVideoThumbnailModal && videoThumbnailForRegeneration && (
        <ImageRegenerationModal
          user={user}
          imageUrl={videoThumbnailForRegeneration}
          isLoading={isGeneratingThumbnail}
          allGeneration={videoThumbnailGenerations}
          setAllGeneration={setVideoThumbnailGenerations}
          setModify={setVideoModify}
          modifyMode={videoModifyMode}
          generationAmounts={generationAmounts["image"]}
          prompt={videoThumbnailPrompt}
          setPrompt={setVideoThumbnailPrompt}
          onClose={() => {
            setShowVideoThumbnailModal(false);
            setVideoThumbnailForRegeneration("");
            setVideoThumbnailGenerations([]);
            setVideoModify(false);
            setVideoUseLogo(false);
            setVideoUseTheme(false);
            setVideoThumbnailPrompt("");
          }}
          onRegenerate={handleVideoThumbnailRegenerate}
          confirmImage={confirmVideoThumbnail}
          onFileSave={() => {}}
          selectedFile={null}
          useLogo={videoUseLogo}
          setUseLogo={setVideoUseLogo}
          useTheme={videoUseTheme}
          setUseTheme={setVideoUseTheme}
          logoUrl={logoUrl}
          themeUrl={themeUrl}
          hasOutput={Boolean(videoThumbnailForRegeneration)}
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
                          selectedPlatforms: [],
                          prompt: "",
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
                        setShowPreview(false);
                        currentFileRef.current = null;
                      }
                      setSelectedPostType("text");
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
                        <h3
                          className={` font-semibold text-xs md:text-base  md:leading-[1.2rem] mt-1  `}
                        >
                          {t("create")}
                          <br />
                          {t("text_post")}
                        </h3>
                      </div>
                    </div>
                  </button>

                  {/* Image Post */}
                  <div
                    onClick={() => {
                      setSelectedVideoMode("");
                      setShowPreview(false);
                      if (selectedPostType !== "image") {
                        if (uploadAbortControllerRef.current) {
                          uploadAbortControllerRef.current.abort();
                          uploadAbortControllerRef.current = null;
                        }
                        resetAll();
                        setSelectedPostType("image");
                        setSelectedImageMode("textToImage");
                        setSelectedFile(null);
                      } else {
                        setShowImageMenu(true);
                        setSelectedFile(null);
                        setShowImageMenu(!showImageMenu);
                      }
                    }}
                    className={` relative cursor-pointer border shadow-md backdrop-blur-md border-slate-200/70 transition-all duration-200  text-center px-2 py-3 rounded-md ${
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
                          className={`font-semibold text-xs md:text-base  md:leading-[1.2rem] mt-1 text p-0 `}
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
                            resetAll();
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
                                className={`font-semibold text-xs md:text-base  md:leading-[1.2rem] mt-1 text
                        
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
                            resetAll();
                            setSelectedImageMode("textToImage");
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
                                className={`font-semibold text-xs md:text-base  md:leading-[1.2rem] mt-1 text`}
                              >
                                {t("text")}
                                <br /> {t("to_image")}
                              </h3>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      if (selectedPostType !== "video") {
                        setFormData((prev) => ({
                          ...prev,
                          media: undefined,
                          selectedPlatforms: [],
                          prompt: "",
                          mediaUrl: undefined,
                        }));
                        setSelectedFile(null);
                        currentFileRef.current = null;
                        setShowVideoMenu(true);
                        setTemplatedImageUrl("");
                        setSelectedTemplate(undefined);
                        setSelectedPostType("video");
                        setSelectedVideoMode("uploadShorts");
                        setShowVideoMenu(false);
                        setTemplatedImageUrl("");
                        setSelectedTemplate(undefined);
                        setImageAnalysis("");
                        setSelectedImageMode("");
                      } else {
                        setShowVideoMenu(!showVideoMenu);
                      }
                      setShowPreview(false);
                    }}
                    className={`relative cursor-pointer border shadow-md backdrop-blur-md border-slate-200/70 transition-all duration-200 text-center px-2 py-3 rounded-md ${
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
                          className={`font-semibold text-xs md:text-base  md:leading-[1.2rem] mt-1 text p-0 `}
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
                                selectedPlatforms: [],
                                mediaUrl: undefined,
                              }));
                              setOriginalVideoFile(null);
                              setVideoAspectRatio(null);
                              setVideoThumbnailUrl("");
                              setVideoAspectRatioWarning("");
                              setSelectedFile(null);
                              setGeneratedImage(null);
                              currentFileRef.current = null;
                            }
                            setSelectedVideoMode("upload");
                            setShowVideoMenu(false);
                            setTemplatedImageUrl("");
                            setSelectedTemplate(undefined);
                            setImageAnalysis("");
                            // setSelectedImageMode("");
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
                                className={`w-10 h-6 border mx-auto md:mb-2  video-icon `}
                              ></div>
                            </div>
                            <div>
                              <h3
                                className={`font-semibold text-xs md:text-base  md:leading-[1.2rem] mt-0.5 md:mt-1 text `}
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
                                selectedPlatforms: [],
                                mediaUrl: undefined,
                              }));
                              setOriginalVideoFile(null);
                              setVideoAspectRatio(null);
                              setVideoThumbnailUrl("");
                              setVideoAspectRatioWarning("");

                              setSelectedFile(null);
                              currentFileRef.current = null;
                              setTemplatedImageUrl("");
                              setSelectedTemplate(undefined);
                              setSelectedFile(null);
                              setGeneratedImage(null);
                              currentFileRef.current = null;
                            }
                            setSelectedVideoMode("uploadShorts");
                            setShowVideoMenu(false);
                            setTemplatedImageUrl("");
                            setSelectedTemplate(undefined);
                            setImageAnalysis("");
                            // setSelectedImageMode("");
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
                                className={`w-6 h-10 border mx-auto md:mb-2 video-icon `}
                              ></div>
                            </div>
                            <div>
                              <h3
                                className={`font-semibold text-xs md:text-base  md:leading-[1.2rem] mt-0.5 md:mt-1 text `}
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
                  </div>
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
                            accept={getAcceptType()}
                            onChange={handleFileChange}
                            className="hidden"
                          />

                          {formData.media ||
                          formData.mediaUrl ||
                          selectedFile ||
                          generatedImage ? (
                            <div className="space-y-4">
                              <div className="relative">
                                {(() => {
                                  const imageSrc =
                                    templatedImageUrl ||
                                    formData.mediaUrl ||
                                    generatedImage ||
                                    (formData.media
                                      ? URL.createObjectURL(formData.media)
                                      : selectedFile
                                        ? URL.createObjectURL(selectedFile)
                                        : "");
                                  console.log(
                                    "formData.mediaUrl",
                                    formData.mediaUrl,
                                    "generatedImage",
                                    generatedImage,
                                    "formData.media",
                                    formData.media,
                                    "selectedFile",
                                    selectedFile,
                                    imageSrc,
                                    "imageSrc"
                                  );
                                  return (
                                    <img
                                      src={imageSrc}
                                      alt="Preview"
                                      className="max-h-32 mx-auto  shadow-md"
                                    />
                                  );
                                })()}
                              </div>
                              <div className="flex items-center justify-center flex-col space-y-1">
                                <p className="text-xs theme-text-secondary">
                                  {formData.media?.name ||
                                    selectedFile?.name ||
                                    "Uploaded Image"}
                                </p>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFormData((prev) => ({
                                      ...prev,
                                      media: undefined,
                                      selectedPlatforms: [],
                                      mediaUrl: undefined,
                                    }));
                                    if (fileInputRef && fileInputRef.current)
                                      fileInputRef.current.value = "";
                                    setSelectedFile(null);
                                    setGeneratedImage(null);
                                    setAllGeneration([]);
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
                            <div className="p-3 bg-green-500/10 border border-purple-400/20 rounded-md">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-purple-400" />
                                <span className="text-sm font-medium text-purple-600">
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
                                    selectedPlatforms: [],
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
                                    selectedPlatforms: [],
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
                      className={` border border-dashed  p-0 text-center transition-all duration-200 ${
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
                        accept={getAcceptType()}
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
                            <div className="flex md:items-center justify-center p-2 bg-purple-500/10 border border-purple-400/20 rounded text-xs">
                              <div>
                                <CheckCircle className="w-3 h-3 mr-1 mt-1 text-purple-600" />
                              </div>
                              <span className="text-purple-600 md:text-center text-left">
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
                            <div className="mt-2 flex md:items-center md:justify-center gap-3">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={generateVideoThumbnailAI}
                                  onChange={(e) =>
                                    setGenerateVideoThumbnailAI(
                                      e.target.checked
                                    )
                                  }
                                  className="md:w-4 md:h-4 w-3 h-3"
                                />
                                <span className="md:text-sm text-xs theme-text-secondary">
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
                              selectedPlatforms: [],
                              mediaUrl: undefined,
                            }));
                            setTemplatedImageUrl("");
                            setSelectedTemplate(undefined);
                            setImageAnalysis("");
                            if (fileInputRef && fileInputRef.current)
                              fileInputRef.current.value = "";
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
                        className="w-full px-3   shadow-md backdrop-blur-md py-2.5 bg-white text-sm rounded-md placeholder-gray-500
             min-h-[160px] lg:min-h-[180px]
             border-0 outline-none ring-0
             focus:border-0 focus:outline-none focus:ring-0
             focus-visible:border-0 focus-visible:outline-none focus-v  isible:ring-0
             transition-all duration-200"
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
                              className={`w-full h-24 p-2 border transition-all   theme-bg-primary shadow-md  rounded-md duration-200 flex flex-col items-center justify-center ${
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
                                    ? "border-purple-600 border"
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
                    <div className="flex w-full">
                      {user?.wallet?.coins + user?.wallet?.referralCoin < 6 ? (
                        <Link
                          to="/pricing"
                          className="group flex-1 min-w-0 rounded-md px-3 py-2.5 font-semibold text-md flex items-center justify-center gap-2 text-white bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] border border-[#7650e3]"
                        >
                          <div className="flex items-center">
                            <Icon
                              name="white-diamond"
                              size={20}
                              className="mr-2"
                            />
                            {t("upgrade")}
                          </div>
                        </Link>
                      ) : (
                        <button
                          type="submit"
                          disabled={
                            cost === 0 ||
                            !formData.prompt.trim() ||
                            !formData.selectedPlatforms?.length ||
                            isGeneratingBoth ||
                            (selectedPostType == "video" && !formData.mediaUrl)
                              ? true
                              : false ||
                                  (selectedImageMode === "upload" &&
                                    !formData.mediaUrl)
                                ? true
                                : false
                          }
                          className="group flex-1 py-2.5 font-semibold text-base  min-w-0 rounded-md flex items-center justify-between theme-bg-trinary theme-text-light border border-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] transition-colors duration-200  px-3  disabled:opacity-50 disabled:cursor-not-allowed "
                        >
                          <div className="flex items-center">
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
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <></>
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
              selectedConfirmedImage ||
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
            onPostsUpdate={(updatedPosts: any) =>
              setGeneratedResults(updatedPosts)
            }
          />
        </div>
      )}
    </div>
  );
};
