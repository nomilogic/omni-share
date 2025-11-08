import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  Share2,
  Edit,
  Trash2,
  Copy,
  Tag,
  Calendar,
  FileText,
  Image,
  Video,
  Music,
  Eye,
  Heart,
  Repeat,
  BarChart3,
  Plus,
  Check,
  AlertTriangle,
} from "lucide-react";

import { MediaAsset, mediaAssetService } from "../lib/mediaAssetService";
import { VideoPlayerModal } from "./VideoPlayerModal";

interface MediaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: MediaAsset | null;
  onUpdate?: (updatedAsset: MediaAsset) => void;
  onDelete?: (assetId: string) => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  isOpen,
  onClose,
  asset,
  onUpdate,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<"details" | "usage" | "analytics">(
    "details"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedAsset, setEditedAsset] = useState<Partial<MediaAsset>>({});
  const [newTag, setNewTag] = useState("");
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (asset) {
      setEditedAsset({
        altText: asset.altText,
        tags: [...asset.tags],
        description: asset.description,
      });
    }
  }, [asset]);

  if (!isOpen || !asset) return null;

  const handleSave = async () => {
    if (!asset || !onUpdate) return;

    setLoading(true);
    try {
      const updatedAsset = await mediaAssetService.updateMediaAsset(asset.id, {
        altText: editedAsset.altText,
        tags: editedAsset.tags,
        description: editedAsset.description,
      });

      onUpdate(updatedAsset);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating asset:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!asset || !onDelete) return;

    setLoading(true);
    try {
      await mediaAssetService.deleteMediaAsset(asset.id);
      onDelete(asset.id);
      onClose();
    } catch (error) {
      console.error("Error deleting asset:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = asset.url;
    link.download = asset.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addTag = () => {
    if (
      newTag.trim() &&
      editedAsset.tags &&
      !editedAsset.tags.includes(newTag.trim())
    ) {
      setEditedAsset((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditedAsset((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "audio":
        return <Music className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const TabButton = ({
    id,
    label,
    icon,
  }: {
    id: string;
    label: string;
    icon: React.ReactNode;
  }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        activeTab === id
          ? "bg-blue-100 text-blue-700"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-md max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              {getFileIcon(asset.type)}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {asset.filename}
                </h2>
                <p className="text-sm text-gray-600">
                  {asset.format.toUpperCase()} • {formatFileSize(asset.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedAsset({
                        altText: asset.altText,
                        tags: [...asset.tags],
                        description: asset.description,
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </>
              )}

              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex">
            {/* Media Preview */}
            <div className="flex-1 p-6">
              <div
                className="bg-gray-100 rounded-md overflow-hidden mb-6"
                style={{ aspectRatio: "16/9" }}
              >
                {asset.type === "video" ? (
                  <div
                    className="relative w-full h-full bg-gray-900 flex items-center justify-center cursor-pointer group"
                    onClick={() => setShowVideoPlayer(true)}
                  >
                    <img
                      src={asset.thumbnailUrl || asset.url}
                      alt={asset.altText}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                      <div className="bg-white bg-opacity-90 rounded-full p-4">
                        <Video className="w-8 h-8 text-gray-900" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={asset.url}
                    alt={asset.altText}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-6">
                <TabButton
                  id="details"
                  label="Details"
                  icon={<FileText className="w-4 h-4" />}
                />
                <TabButton
                  id="usage"
                  label="Usage"
                  icon={<Eye className="w-4 h-4" />}
                />
                <TabButton
                  id="analytics"
                  label="Analytics"
                  icon={<BarChart3 className="w-4 h-4" />}
                />
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === "details" && (
                  <div className="space-y-4">
                    {/* Alt Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alt Text
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedAsset.altText || ""}
                          onChange={(e) =>
                            setEditedAsset((prev) => ({
                              ...prev,
                              altText: e.target.value,
                            }))
                          }
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Describe this media for accessibility..."
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                          {asset.altText || "No alt text provided"}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      {isEditing ? (
                        <textarea
                          value={editedAsset.description || ""}
                          onChange={(e) =>
                            setEditedAsset((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Optional description..."
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                          {asset.description || "No description provided"}
                        </p>
                      )}
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {(isEditing ? editedAsset.tags : asset.tags)?.map(
                            (tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
                              >
                                <Tag className="w-3 h-3" />
                                {tag}
                                {isEditing && (
                                  <button
                                    onClick={() => removeTag(tag)}
                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </span>
                            )
                          )}
                        </div>

                        {isEditing && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && addTag()}
                              className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                              placeholder="Add a tag..."
                            />
                            <button
                              onClick={addTag}
                              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* File Info */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Created
                        </div>
                        <div className="text-sm text-gray-900">
                          {new Date(asset.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Source
                        </div>
                        <div className="text-sm text-gray-900 capitalize">
                          {asset.metadata.source}
                        </div>
                      </div>
                      {asset.dimensions && (
                        <div>
                          <div className="text-sm font-medium text-gray-700">
                            Dimensions
                          </div>
                          <div className="text-sm text-gray-900">
                            {asset.dimensions.width} × {asset.dimensions.height}
                            px
                          </div>
                        </div>
                      )}
                      {asset.duration && (
                        <div>
                          <div className="text-sm font-medium text-gray-700">
                            Duration
                          </div>
                          <div className="text-sm text-gray-900">
                            {Math.floor(asset.duration / 60)}:
                            {(asset.duration % 60).toString().padStart(2, "0")}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "usage" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-md text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {asset.usage.totalUsed}
                        </div>
                        <div className="text-sm text-blue-800">Total Uses</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-md text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {asset.usage.postsUsedIn.length}
                        </div>
                        <div className="text-sm text-green-800">Posts</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-md text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {asset.usage.campaignsUsedIn.length}
                        </div>
                        <div className="text-sm text-purple-800">Campaigns</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Recent Posts
                      </h3>
                      <div className="space-y-2">
                        {asset.usage.postsUsedIn
                          .slice(0, 5)
                          .map((postId, index) => (
                            <div
                              key={postId}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                            >
                              <div>
                                <div className="font-medium text-gray-900">
                                  Post #{index + 1}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Used in post {postId}
                                </div>
                              </div>
                              <div className="text-sm text-slate-500">
                                {new Date().toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "analytics" && (
                  <div className="space-y-6">
                    <div className="text-center py-12">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Media Analytics
                      </h3>
                      <p className="text-gray-600">
                        Detailed analytics for this media asset will be
                        available soon.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
          <div className="bg-white rounded-md max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Media Asset
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "{asset.filename}"? This will
              remove it from all posts and campaigns where it's currently used.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {asset.type === "video" && (
        <VideoPlayerModal
          isOpen={showVideoPlayer}
          onClose={() => setShowVideoPlayer(false)}
          videoUrl={asset.url}
          title={asset.filename}
          description={asset.description}
          thumbnail={asset.thumbnailUrl}
          duration={asset.duration}
          onDownload={handleDownload}
        />
      )}
    </>
  );
};
