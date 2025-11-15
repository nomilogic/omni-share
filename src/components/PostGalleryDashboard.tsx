import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Heart,
  Archive,
  Copy,
  Play,
  Image,
  Video,
  Eye,
  Download,
  Share2,
  Star,
  Calendar,
  TrendingUp,
  Repeat,
  Settings,
  Plus,
  Upload,
  Palette,
  Wand2,
  RefreshCw,
  ChevronDown,
  Trash2,
  Edit,
  MoreHorizontal,
} from "lucide-react";

import {
  postHistoryService,
  PostGalleryItem,
  ContentTemplate,
  PostContent,
} from "../lib/postHistoryService";
import { mediaAssetService, MediaAsset } from "../lib/mediaAssetService";
import { AIModelSelector } from "./AIModelSelector";
import { MediaDetailModal } from "./MediaDetailModal";
import { VideoPlayerModal } from "./VideoPlayerModal";
import { ContentInput } from "./ContentInput"; // Assuming ContentInput is in this path

interface PostGalleryDashboardProps {
  campaignId: string;
  onSelectPost?: (post: PostGalleryItem) => void;
  onReusePost?: (postId: string) => void;
  onCreateTemplate?: (postId: string) => void;
}

type ViewMode = "gallery" | "list" | "media" | "templates" | "analytics";
type MediaType = "all" | "image" | "video" | "audio";
type SortBy = "date" | "performance" | "popularity";

export const PostGalleryDashboard: React.FC<PostGalleryDashboardProps> = ({
  campaignId,
  onSelectPost,
  onReusePost,
  onCreateTemplate,
}) => {
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const [posts, setPosts] = useState<PostGalleryItem[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [editingPost, setEditingPost] = useState<PostGalleryItem | null>(null); // State to manage editing

  // Filters
  const [filters, setFilters] = useState({
    platforms: [] as string[],
    categories: [] as string[],
    status: [] as string[],
    favorites: false,
    canReuse: false,
    mediaType: "all" as MediaType,
    sortBy: "date" as SortBy,
    dateRange: { start: "", end: "" },
  });

  // Video generation
  const [showVideoGenerator, setShowVideoGenerator] = useState(false);
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [selectedAiModel, setSelectedAiModel] = useState("runway-gen-2");
  const [showFilters, setShowFilters] = useState(false);

  // Media detail modal
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [showMediaDetail, setShowMediaDetail] = useState(false);

  useEffect(() => {
    loadContent();
  }, [campaignId, viewMode, filters]);

  const loadContent = async () => {
    setLoading(true);
    try {
      switch (viewMode) {
        case "gallery":
        case "list":
          const { items } = await postHistoryService.getPostGallery(
            campaignId,
            {
              categories: filters.categories,
              platforms: filters.platforms,
              status: filters.status as any[],
              favorites: filters.favorites || undefined,
              canReuse: filters.canReuse || undefined,
              sortBy: filters.sortBy,
              limit: 50,
            }
          );
          setPosts(items);
          break;

        case "media":
          const { assets } = await mediaAssetService.getMediaAssets(
            campaignId,
            {
              type: filters.mediaType === "all" ? undefined : filters.mediaType,
              limit: 50,
            }
          );
          setMediaAssets(assets);
          break;

        case "templates":
          const templateList = await postHistoryService.getContentTemplates(
            campaignId
          );
          setTemplates(templateList);
          break;
      }
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadContent();
      return;
    }

    setLoading(true);
    try {
      if (viewMode === "media") {
        const results = await mediaAssetService.searchMediaAssets(
          campaignId,
          searchQuery,
          {
            type: filters.mediaType === "all" ? undefined : filters.mediaType,
          }
        );
        setMediaAssets(results);
      } else {
        const results = await postHistoryService.searchPosts(
          campaignId,
          searchQuery,
          {
            platforms: filters.platforms,
            categories: filters.categories,
          }
        );
        setPosts(results);
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleFavorite = async (postId: string) => {
    try {
      const post = posts.find((p) => p.id === postId);
      if (post) {
        await postHistoryService.toggleFavorite(postId, !post.isFavorite);
        loadContent();
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const generateVideo = async (prompt: string, sourceImage?: string) => {
    setVideoGenerating(true);
    try {
      const response = await mediaAssetService.generateVideo({
        model: selectedAiModel,
        prompt,
        sourceImage,
        aspectRatio: "16:9",
        duration: 10,
      });

      // Refresh media assets
      if (viewMode === "media") {
        loadContent();
      }
    } catch (error) {
      console.error("Error generating video:", error);
    } finally {
      setVideoGenerating(false);
      setShowVideoGenerator(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    try {
      const uploadPromises = Array.from(files).map((file) =>
        mediaAssetService.uploadMedia(file, campaignId, {
          source: "uploaded",
          altText: file.name,
        })
      );

      await Promise.all(uploadPromises);

      if (viewMode === "media") {
        loadContent();
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleAssetClick = (asset: MediaAsset) => {
    setSelectedAsset(asset);
    setShowMediaDetail(true);
  };

  const handleAssetUpdate = (updatedAsset: MediaAsset) => {
    setMediaAssets((prev) =>
      prev.map((asset) => (asset.id === updatedAsset.id ? updatedAsset : asset))
    );
  };

  const handleAssetDelete = (assetId: string) => {
    setMediaAssets((prev) => prev.filter((asset) => asset.id !== assetId));
  };

  // Handler for editing a post
  const handleEditPost = async (updatedData: PostContent) => {
    if (!editingPost) return;

    try {
      // Ensure images are properly maintained
      const updatedPost = {
        ...editingPost,
        content: updatedData.content,
        platforms: updatedData.selectedPlatforms,
        images: updatedData.images || editingPost.images || [],
        imageAnalysis: updatedData.imageAnalysis || editingPost.imageAnalysis,
        updatedAt: new Date().toISOString(),
      };

      // Update the posts array
      setPosts(
        posts.map((post) => (post.id === editingPost.id ? updatedPost : post))
      );

      // Also update in persistent storage if you have that implemented
      // await postHistoryService.updatePost(editingPost.id, updatedPost);

      setEditingPost(null);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  // Function to open the edit modal for a post
  const openEditModal = (post: PostGalleryItem) => {
    setEditingPost(post);
  };

  const TabNavigation = () => (
    <div className="flex space-x-1 bg-gray-100 rounded-md p-1 mb-6">
      {[
        {
          id: "gallery",
          label: "Post Gallery",
          icon: Grid3X3,
          count: posts.length,
        },
        {
          id: "media",
          label: "Media Assets",
          icon: Image,
          count: mediaAssets.length,
        },
        {
          id: "templates",
          label: "Templates",
          icon: Palette,
          count: templates.length,
        },
        { id: "analytics", label: "Analytics", icon: TrendingUp },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setViewMode(tab.id as ViewMode)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
            viewMode === tab.id
              ? "bg-white text-blue-600 shadow-md"
              : "text-gray-500 font-medium hover:text-slate-900"
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                viewMode === tab.id
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-200 text-gray-500 font-medium"
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );

  const FilterPanel = () => (
    <div className="bg-white rounded-md shadow-md border p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${
                viewMode === "media" ? "media" : "posts"
              }...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
          >
            <Filter className="w-4 h-4 text-gray-400" />
            Filters
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sortBy: e.target.value as SortBy,
              }))
            }
            className="border border-gray-300 rounded-md px-3 py-2.5 text-sm"
          >
            <option value="date">Latest First</option>
            <option value="performance">Best Performance</option>
            <option value="popularity">Most Popular</option>
          </select>

          <div className="flex items-center bg-gray-100 rounded-md p-1">
            <button
              onClick={() =>
                setViewMode(viewMode === "list" ? "gallery" : "gallery")
              }
              className={`p-2 rounded ${
                viewMode === "gallery"
                  ? "bg-white shadow-md"
                  : "text-gray-500 font-medium"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${
                viewMode === "list"
                  ? "bg-white shadow-md"
                  : "text-gray-500 font-medium"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Platforms
              </label>
              <div className="space-y-1">
                {["LinkedIn", "Twitter", "Instagram", "Facebook"].map(
                  (platform) => (
                    <label key={platform} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.platforms.includes(
                          platform.toLowerCase()
                        )}
                        onChange={(e) => {
                          const platformId = platform.toLowerCase();
                          setFilters((prev) => ({
                            ...prev,
                            platforms: e.target.checked
                              ? [...prev.platforms, platformId]
                              : prev.platforms.filter((p) => p !== platformId),
                          }));
                        }}
                        className="mr-2 text-blue-600 rounded"
                      />
                      <span className="text-sm text-slate-700">{platform}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            {viewMode === "media" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Media Type
                </label>
                <select
                  value={filters.mediaType}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      mediaType: e.target.value as MediaType,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm"
                >
                  <option value="all">All Media</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <div className="space-y-1">
                {["Published", "Scheduled", "Draft"].map((status) => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status.toLowerCase())}
                      onChange={(e) => {
                        const statusId = status.toLowerCase();
                        setFilters((prev) => ({
                          ...prev,
                          status: e.target.checked
                            ? [...prev.status, statusId]
                            : prev.status.filter((s) => s !== statusId),
                        }));
                      }}
                      className="mr-2 text-blue-600 rounded"
                    />
                    <span className="text-sm text-slate-700">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Special
              </label>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.favorites}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        favorites: e.target.checked,
                      }))
                    }
                    className="mr-2 text-blue-600 rounded"
                  />
                  <span className="text-sm text-slate-700">Favorites Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.canReuse}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        canReuse: e.target.checked,
                      }))
                    }
                    className="mr-2 text-blue-600 rounded"
                  />
                  <span className="text-sm text-slate-700">Reusable</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value },
                    }))
                  }
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value },
                    }))
                  }
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const PostGalleryView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-md shadow-md border overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => openEditModal(post)} // Changed to open edit modal
        >
          <div className="relative aspect-video bg-gray-100">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all">
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(post.id);
                  }}
                  className={`p-1.5 rounded-full shadow-md transition-colors ${
                    post.isFavorite
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-white text-gray-500 font-medium hover:bg-gray-50"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      post.isFavorite ? "fill-current" : ""
                    }`}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReusePost?.(post.id);
                  }}
                  className="p-1.5 bg-white text-gray-500 font-medium rounded-full shadow-md hover:bg-gray-50 transition-colors"
                >
                  <Repeat className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateTemplate?.(post.id);
                  }}
                  className="p-1.5 bg-white text-gray-500 font-medium rounded-full shadow-md hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {post.mediaCount > 1 && (
                <div className="absolute bottom-2 right-2">
                  <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full">
                    +{post.mediaCount - 1} media
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-gray-500 font-medium mb-3 line-clamp-2">
              {post.preview}
            </p>

            <div className="flex flex-wrap gap-1 mb-3">
              {post.platforms.map((platform) => (
                <span
                  key={platform}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {platform}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.performance.reach.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {post.performance.engagement.toLocaleString()}
                </span>
              </div>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const MediaGalleryView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {mediaAssets.map((asset) => (
        <div
          key={asset.id}
          className="bg-white rounded-md shadow-md border overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
          onClick={() => handleAssetClick(asset)}
        >
          <div className="relative aspect-square bg-gray-100">
            {asset.type === "video" ? (
              <div className="relative w-full h-full">
                <img
                  src={asset.thumbnailUrl || asset.url}
                  alt={asset.filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-50 rounded-full p-3">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
                {asset.duration && (
                  <div className="absolute bottom-2 left-2">
                    <span className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {Math.floor(asset.duration / 60)}:
                      {(asset.duration % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <img
                src={asset.url}
                alt={asset.filename}
                className="w-full h-full object-cover"
              />
            )}

            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all">
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const link = document.createElement("a");
                    link.href = asset.url;
                    link.download = asset.filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="p-1.5 bg-white text-gray-500 font-medium rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(asset.url);
                  }}
                  className="p-1.5 bg-white text-gray-500 font-medium rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  title="Copy URL"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAssetClick(asset);
                  }}
                  className="p-1.5 bg-white text-gray-500 font-medium rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  title="View Details"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="absolute bottom-2 left-2">
              <div className="flex items-center gap-1">
                {asset.type === "video" && (
                  <Video className="w-4 h-4 text-white" />
                )}
                {asset.type === "image" && (
                  <Image className="w-4 h-4 text-white" />
                )}
                <span className="text-white text-xs bg-black bg-opacity-75 px-2 py-1 rounded-full">
                  {asset.format.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3">
            <h3
              className="font-medium text-slate-900 text-sm mb-1 truncate"
              title={asset.filename}
            >
              {asset.filename}
            </h3>
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-2">
              <span>{(asset.size / 1024 / 1024).toFixed(1)} MB</span>
              <span>Used {asset.usage.totalUsed} times</span>
            </div>
            {asset.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {asset.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-500 font-medium text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {asset.tags.length > 2 && (
                  <span className="text-gray-400 text-xs">
                    +{asset.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add New Media Button */}
      <div className="bg-white rounded-md shadow-md border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors group cursor-pointer flex flex-col items-center justify-center aspect-square">
        <div className="text-center p-6">
          <div className="flex gap-2 mb-4 justify-center">
            <button
              onClick={() => document.getElementById("file-upload")?.click()}
              className="p-3 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
            >
              <Upload className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowVideoGenerator(true)}
              className="p-3 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200 transition-colors"
            >
              <Wand2 className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">
            Upload or Generate
          </p>
          <p className="text-xs text-gray-400">Media Assets</p>
        </div>
        <input
          id="file-upload"
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              handleFileUpload(e.target.files);
            }
          }}
        />
      </div>
    </div>
  );

  const VideoGeneratorModal = () =>
    showVideoGenerator && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-md max-w-md w-full mx-4 p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            Generate AI Video
          </h3>

          <div className="space-y-4">
            <AIModelSelector
              selectedModel={selectedAiModel}
              onModelChange={setSelectedAiModel}
              taskType="video-generation"
              showIcon={true}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Video Description
              </label>
              <textarea
                id="video-prompt"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the video you want to generate..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Source Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Aspect Ratio
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm">
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Portrait)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="4:3">4:3 (Standard)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Duration
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm">
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                const prompt = (
                  document.getElementById("video-prompt") as HTMLTextAreaElement
                )?.value;
                if (prompt) generateVideo(prompt);
              }}
              disabled={videoGenerating}
              className="flex-1 bg-purple-600 text-white py-2.5 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {videoGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Video
                </>
              )}
            </button>
            <button
              onClick={() => setShowVideoGenerator(false)}
              className="px-4 py-2.5 border border-gray-300 text-slate-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Content Gallery</h1>
          <p className="text-gray-500 font-medium">
            Manage, reuse, and organize your content assets
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-md px-3 py-2.5">
              <span className="text-sm text-blue-700">
                {selectedItems.size} selected
              </span>
              <button className="text-blue-600 hover:text-blue-700 transition-colors">
                <Archive className="w-4 h-4" />
              </button>
              <button className="text-blue-600 hover:text-blue-700 transition-colors">
                <Copy className="w-4 h-4" />
              </button>
              <button className="text-blue-600 hover:text-blue-700 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={loadContent}
            className="p-2 text-gray-500 font-medium hover:text-slate-900 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button className="bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" />
            Create New
          </button>
        </div>
      </div>

      <TabNavigation />
      <FilterPanel />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {(viewMode === "gallery" || viewMode === "list") && (
            <PostGalleryView />
          )}
          {viewMode === "media" && <MediaGalleryView />}
          {viewMode === "templates" && (
            <div className="text-center py-12">
              <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Content Templates
              </h3>
              <p className="text-gray-500 font-medium mb-4">
                Create reusable templates from your best performing posts
              </p>
              <button className="bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700 flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" />
                Create Template
              </button>
            </div>
          )}
          {viewMode === "analytics" && (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Content Analytics
              </h3>
              <p className="text-gray-500 font-medium mb-4">
                Track performance and discover insights about your content
              </p>
              <button className="bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700 flex items-center gap-2 mx-auto">
                <TrendingUp className="w-4 h-4" />
                View Analytics
              </button>
            </div>
          )}
        </>
      )}

      <VideoGeneratorModal />

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Post</h2>
              <button
                onClick={() => setEditingPost(null)}
                className="text-gray-500 font-medium hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <ContentInput
              onNext={handleEditPost}
              editMode={true} // Pass editMode as true
              initialData={{
                content: editingPost.content,
                selectedPlatforms: editingPost.platforms || [],
                images: editingPost.images || [],
                imageAnalysis: editingPost.imageAnalysis, // Pass imageAnalysis
              }}
            />
          </div>
        </div>
      )}

      {/* Media Detail Modal */}
      <MediaDetailModal
        isOpen={showMediaDetail}
        onClose={() => {
          setShowMediaDetail(false);
          setSelectedAsset(null);
        }}
        asset={selectedAsset}
        onUpdate={handleAssetUpdate}
        onDelete={handleAssetDelete}
      />

      {posts.length === 0 &&
        !loading &&
        (viewMode === "gallery" || viewMode === "list") && (
          <div className="text-center py-12">
            <Grid3X3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No posts found
            </h3>
            <p className="text-gray-500 font-medium mb-4">
              Start creating content to see your gallery
            </p>
            <button className="bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700">
              Create Your First Post
            </button>
          </div>
        )}

      {mediaAssets.length === 0 && !loading && viewMode === "media" && (
        <div className="text-center py-12">
          <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No media assets found
          </h3>
          <p className="text-gray-500 font-medium mb-4">
            Upload images, videos, or generate AI content
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => document.getElementById("file-upload")?.click()}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Media
            </button>
            <button
              onClick={() => setShowVideoGenerator(true)}
              className="bg-purple-600 text-white px-4 py-2.5 rounded-md hover:bg-purple-700 flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              Generate Video
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
