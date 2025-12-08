import React, { useState, useEffect } from "react";
import {
  Wand2,
  Loader,
  Download,
  Sparkles,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  generateImage,
  generateImageVariations,
  getPlatformImageSuggestions,
  type ImageGenerationRequest,
  type GeneratedImage,
} from "../lib/imageGeneration";
import { Platform } from "../types";

interface AIImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void;
  contentText?: string;
  selectedPlatforms?: Platform[];
  campaignInfo?: any;
  onClose: () => void;
}

interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  isAvailable?: boolean;
}

export const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({
  onImageGenerated,
  contentText = "",
  selectedPlatforms = [],
  campaignInfo,
  onClose,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [hasError, setHasError] = useState(false);
  const [imageRequest, setImageRequest] = useState<ImageGenerationRequest>({
    prompt: "",
    style: "professional",
    aspectRatio: "1:1",
    quality: "standard",
  });
  console.log("imageRequest", imageRequest);
  const [selectedModel, setSelectedModel] = useState(
    "stabilityai/stable-diffusion-xl-base-1.0"
  );
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Fetch available models from API
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoadingModels(true);
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:5000/api"
          }/ai/image-models`
        );
        const data = await response.json();

        if (data.success && data.models) {
          setAvailableModels(data.models);
          // Set default model if current selection is not available
          if (
            data.defaultModel &&
            !data.models.find((m: AIModel) => m.id === selectedModel)
          ) {
            setSelectedModel(data.defaultModel);
          }
        } else {
          console.error("Failed to fetch image models:", data.error);
          // Fallback to hardcoded models if API fails
          setAvailableModels([
            {
              id: "default",
              name: "🌸 Pollinations AI",
              description: "Free, fast, creative generation",
              provider: "pollinations",
              isAvailable: true,
            },
            {
              id: "stabilityai/stable-diffusion-xl-base-1.0",
              name: "Stable Diffusion XL",
              description: "High quality, detailed images",
              provider: "huggingface",
              isAvailable: false,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching image models:", error);
        // Fallback to basic models
        setAvailableModels([
          {
            id: "default",
            name: "🌸 Pollinations AI",
            description: "Free, fast, creative generation",
            provider: "pollinations",
            isAvailable: true,
          },
        ]);
        setSelectedModel("default");
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, [selectedModel]);

  const handleGenerateImage = async () => {
    if (!imageRequest.prompt.trim()) return;

    setIsGenerating(true);
    setHasError(false);
    try {
      const image = await generateImage({
        ...imageRequest,
        model: selectedModel,
      });
      setCurrentImage(image);
    } catch (error) {
      setHasError(true);
      setCurrentImage(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetryGeneration = async () => {
    await handleGenerateImage();
  };

  const handleGetSuggestions = async () => {
    if (!contentText.trim()) return;

    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/suggest-image-prompts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contentText,
            platforms: selectedPlatforms,
            industry: campaignInfo?.industry || "",
            brandTone: campaignInfo?.brandTone || "professional",
          }),
        }
      );

      const data = await response.json();
      if (data.prompts) {
        setSuggestedPrompts(data.prompts);
      }
    } catch (error) {
      console.error("Failed to get suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleUseSuggestion = (prompt: string) => {
    setImageRequest((prev) => ({ ...prev, prompt }));
  };

  const handleUseImage = (imageUrl: string) => {
    onImageGenerated(imageUrl);
    onClose();
  };

  const platformOptimizedSettings =
    getPlatformImageSuggestions(selectedPlatforms);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-md w-full max-h-[90vh] overflow-auto ">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-md flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  AI Image Generator
                </h2>
                <p className="text-gray-500 font-medium">
                  Create stunning visuals for your social media posts
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 font-medium text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Generated Image Panel */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Generated Image
              </h3>

              {!currentImage && !hasError && !isGenerating && (
                <div className="text-center py-12 text-gray-500 font-medium">
                  <Wand2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No image generated yet</p>
                  <p className="text-sm">
                    Start by describing your desired image
                  </p>
                </div>
              )}

              {hasError && !isGenerating && (
                <div className="text-center py-12 text-red-500">
                  <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-md flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-red-600" />
                  </div>
                  <p>Failed to generate image</p>
                  <p className="text-sm text-gray-500 font-medium mb-4">
                    Please try again with a different prompt or model
                  </p>
                  <button
                    onClick={handleRetryGeneration}
                    className="bg-red-600 text-white px-4 py-2.5 rounded-md text-sm hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1 mx-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              {isGenerating && (
                <div className="text-center py-12 text-purple-500">
                  <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-md flex items-center justify-center">
                    <Loader className="w-6 h-6 text-purple-600 animate-spin" />
                  </div>
                  <p>Generating image...</p>
                  <p className="text-sm text-gray-500 font-medium">
                    This may take a few moments
                  </p>
                </div>
              )}

              {currentImage && !isGenerating && (
                <div className="border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow">
                  <img
                    src={currentImage.url}
                    alt={currentImage.prompt}
                    className="w-full h-64 object-contain rounded-md mb-3"
                    onError={() => {
                      setHasError(true);
                      setCurrentImage(null);
                    }}
                  />
                  <p className="text-sm text-gray-500 font-medium mb-3 line-clamp-2">
                    {currentImage.prompt}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleUseImage(currentImage.url)}
                      className="flex-1 bg-purple-600 text-white px-3 py-2.5 rounded-md text-sm hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Use This Image</span>
                    </button>

                    <button
                      onClick={handleRetryGeneration}
                      disabled={isGenerating}
                      className="bg-gray-100 text-slate-700 px-3 py-2.5 rounded-md text-sm hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Generate New</span>
                    </button>

                    {currentImage.url && (
                      <a
                        href={currentImage.url}
                        download="ai-generated-image.png"
                        className="bg-gray-100 text-slate-700 px-3 py-2.5 rounded-md text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Generation Panel */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Image Description
                </label>
                <textarea
                  value={imageRequest.prompt}
                  onChange={(e) =>
                    setImageRequest((prev) => ({
                      ...prev,
                      prompt: e.target.value,
                    }))
                  }
                  placeholder="Describe the image you want to generate..."
                  className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-24"
                />
              </div>

              {/* Suggested Prompts */}
              {contentText && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-700">
                      AI Suggestions Based on Your Content
                    </label>
                    <button
                      onClick={handleGetSuggestions}
                      disabled={loadingSuggestions}
                      className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700"
                    >
                      {loadingSuggestions ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      <span>
                        {loadingSuggestions
                          ? "Getting suggestions..."
                          : "Get AI Suggestions"}
                      </span>
                    </button>
                  </div>

                  {suggestedPrompts.length > 0 && (
                    <div className="space-y-2">
                      {suggestedPrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => handleUseSuggestion(prompt)}
                          className="w-full p-3 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <div className="flex items-start space-x-2">
                            <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-800">{prompt}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* AI Model Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  AI Model {loadingModels && (
                    <span className="text-xs text-gray-500 font-medium">
                      (Loading...)
                    </span>
                  )}
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={loadingModels}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                >
                  {loadingModels ? (
                    <option>Loading models...</option>
                  ) : (
                    <>
                      {availableModels.filter(
                        (model) => model.provider === "gemini"
                      ).length > 0 && (
                        <optgroup label="🔮 Gemini AI (Google)">
                          {availableModels
                            .filter((model) => model.provider === "gemini")
                            .map((model) => (
                              <option
                                key={model.id}
                                value={model.id}
                                disabled={!model.isAvailable}
                              >
                                {model.name} - {model.description} {!model.isAvailable && "(API Key Required)"}
                              </option>
                            ))}
                        </optgroup>
                      )}
                      {availableModels.filter(
                        (model) => model.provider === "pollinations"
                      ).length > 0 && (
                        <optgroup label="🚀 Pollinations (Free & Fast)">
                          {availableModels
                            .filter(
                              (model) => model.provider === "pollinations"
                            )
                            .map((model) => (
                              <option key={model.id} value={model.id}>
                                {model.name} - {model.description}
                              </option>
                            ))}
                        </optgroup>
                      )}
                      {availableModels.filter(
                        (model) => model.provider === "huggingface"
                      ).length > 0 && (
                        <optgroup label="🔬 Hugging Face (High Quality)">
                          {availableModels
                            .filter((model) => model.provider === "huggingface")
                            .map((model) => (
                              <option
                                key={model.id}
                                value={model.id}
                                disabled={!model.isAvailable}
                              >
                                {model.name} - {model.description} {!model.isAvailable && "(API Key Required)"}
                              </option>
                            ))}
                        </optgroup>
                      )}
                    </>
                  )}
                </select>

                {/* Provider Info */}
                <div className="mt-2 text-xs text-gray-500 font-medium">
                  {(() => {
                    const selectedModelData = availableModels.find(
                      (m) => m.id === selectedModel
                    );
                    switch (selectedModelData?.provider) {
                      case "gemini":
                        return (
                          <span className="flex items-center space-x-1">
                            <span>🔮</span>
                            <span>
                              Using Gemini AI - {selectedModelData.isAvailable
                                ? "Google Gemini image generation"
                                : "API Key Required"}
                            </span>
                          </span>
                        );
                      case "pollinations":
                        return (
                          <span className="flex items-center space-x-1">
                            <span>🚀</span>
                            <span>
                              Using Pollinations AI - Free & Fast generation
                            </span>
                          </span>
                        );
                      case "huggingface":
                        return (
                          <span className="flex items-center space-x-1">
                            <span>🔬</span>
                            <span>
                              Using Hugging Face - {selectedModelData.isAvailable
                                ? "High quality generation"
                                : "API Key Required"}
                            </span>
                          </span>
                        );
                      default:
                        return (
                          <span className="flex items-center space-x-1">
                            <span>🤖</span>
                            <span>AI Image Generation</span>
                          </span>
                        );
                    }
                  })()}
                </div>
              </div>

              {/* Style Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Style
                  </label>
                  <select
                    value={imageRequest.style}
                    onChange={(e) =>
                      setImageRequest((prev) => ({
                        ...prev,
                        style: e.target.value as any,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="professional">Professional</option>
                    <option value="realistic">Realistic</option>
                    <option value="artistic">Artistic</option>
                    <option value="cartoon">Cartoon</option>
                    <option value="minimalist">Minimalist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Aspect Ratio
                  </label>
                  <select
                    value={imageRequest.aspectRatio}
                    onChange={(e) =>
                      setImageRequest((prev) => ({
                        ...prev,
                        aspectRatio: e.target.value as any,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="1:1">
                      Square (1:1) - Instagram, Facebook
                    </option>
                    <option value="16:9">
                      Landscape (16:9) - LinkedIn, Twitter
                    </option>
                    <option value="9:16">
                      Portrait (9:16) - TikTok, Stories
                    </option>
                    <option value="4:3">Standard (4:3) - General</option>
                  </select>
                </div>
              </div>

              {/* Quality */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quality
                </label>
                <div className="flex space-x-4">
                  {["standard", "hd"].map((quality) => (
                    <label key={quality} className="flex items-center">
                      <input
                        type="radio"
                        name="quality"
                        value={quality}
                        checked={imageRequest.quality === quality}
                        onChange={(e) =>
                          setImageRequest((prev) => ({
                            ...prev,
                            quality: e.target.value as any,
                          }))
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-slate-700 ">{quality}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateImage}
                disabled={isGenerating || !imageRequest.prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-md font-medium hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    <span>Generate Image</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
