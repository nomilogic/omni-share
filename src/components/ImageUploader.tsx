import React, { useState, useRef } from 'react';
import {
  Upload,
  Eye,
  Loader,
  Sparkles,
  Image as ImageIcon,
  Video,
  Brain,
  Target,
  Palette,
  Edit3,
  Trash2,
} from 'lucide-react';

interface ImageUploaderProps {
  /** The type of media to accept: 'image', 'video', or 'both' */
  acceptType?: 'image' | 'video' | 'both';
  /** Current file object */
  file?: File;
  /** Current media URL */
  mediaUrl?: string;
  /** Whether the upload is in progress */
  uploading?: boolean;
  /** Whether AI analysis is in progress */
  analyzingImage?: boolean;
  /** AI analysis results */
  imageAnalysis?: string;
  /** Whether to show AI analysis button */
  showAIAnalysis?: boolean;
  /** Whether to show template selector */
  showTemplateSelector?: boolean;
  /** Whether to show the checkboxes for AI reference and use in post */
  showCheckboxes?: boolean;
  /** Current values for the checkboxes */
  useForAIReference?: boolean;
  useInPost?: boolean;
  /** Template related state */
  templatedImageUrl?: string;
  selectedTemplate?: any;
  /** Event handlers */
  onFileUpload?: (file: File) => void;
  onAIAnalysis?: () => void;
  onTemplateSelector?: () => void;
  onEditTemplate?: () => void;
  onDeleteTemplate?: () => void;
  onRemoveMedia?: () => void;
  onUseImageAnalysis?: () => void;
  onUseForAIReferenceChange?: (value: boolean) => void;
  onUseInPostChange?: (value: boolean) => void;
  onAIImageGenerate?: () => void;
  /** Custom styling */
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  acceptType = 'both',
  file,
  mediaUrl,
  uploading = false,
  analyzingImage = false,
  imageAnalysis,
  showAIAnalysis = true,
  showTemplateSelector = true,
  showCheckboxes = true,
  useForAIReference = true,
  useInPost = true,
  templatedImageUrl,
  selectedTemplate,
  onFileUpload,
  onAIAnalysis,
  onTemplateSelector,
  onEditTemplate,
  onDeleteTemplate,
  onRemoveMedia,
  onUseImageAnalysis,
  onUseForAIReferenceChange,
  onUseInPostChange,
  onAIImageGenerate,
  className = '',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get accept attribute based on acceptType
  const getAcceptAttribute = () => {
    switch (acceptType) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'both':
      default:
        return 'image/*,video/*';
    }
  };

  // Get file type text for display
  const getFileTypeText = () => {
    switch (acceptType) {
      case 'image':
        return 'Images up to 50MB';
      case 'video':
        return 'Videos up to 50MB';
      case 'both':
      default:
        return 'Images, videos up to 50MB';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0] && onFileUpload) {
      onFileUpload(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0] && onFileUpload) {
      onFileUpload(files[0]);
    }
  };

  const isImage = (file?.type.startsWith('image/')) || 
    (mediaUrl && !file && !mediaUrl.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv|m4v)$/i));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          dragActive
            ? 'border-blue-400/50 bg-blue-500/10'
            : 'border-white/20 hover:border-white/30'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptAttribute()}
          onChange={handleFileChange}
          className="hidden"
        />

        {file || mediaUrl ? (
          <div className="space-y-3">
            {/* Media Preview */}
            <div className="relative">
              {isImage ? (
                <div className="relative">
                  <img
                    src={
                      templatedImageUrl ||
                      mediaUrl ||
                      (file ? URL.createObjectURL(file) : '')
                    }
                    alt="Preview"
                    className="max-h-40 mx-auto rounded-lg shadow-sm"
                    onError={(e) => {
                      console.error('Image failed to load:', templatedImageUrl || mediaUrl || file?.name);
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Image
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <video
                    src={mediaUrl ? mediaUrl : file ? URL.createObjectURL(file) : ''}
                    className="max-h-40 mx-auto rounded-lg shadow-sm"
                    controls
                    onError={(e) => {
                      console.error('Video failed to load:', mediaUrl || file?.name);
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center">
                    <Video className="w-3 h-3 mr-1" />
                    Video
                  </div>
                </div>
              )}
            </div>

            {/* File Info and Controls */}
            <div className="text-sm theme-text-secondary space-y-2">
              <div>
                <p className="font-medium theme-text-primary text-sm">
                  {file?.name || 'Uploaded Media'}
                </p>
                {file && (
                  <p className="text-xs">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>

              {/* Checkboxes */}
              {showCheckboxes && (
                <div className="flex gap-2">
                  <div className="flex items-center space-x-1 p-2 theme-bg-primary/20 rounded text-xs">
                    <input
                      type="checkbox"
                      id="useForAI"
                      checked={useForAIReference}
                      onChange={(e) => onUseForAIReferenceChange?.(e.target.checked)}
                      className="w-3 h-3 text-blue-600"
                    />
                    <Brain className="w-3 h-3 text-blue-400" />
                    <label
                      htmlFor="useForAI"
                      className="theme-text-secondary cursor-pointer"
                    >
                      AI Reference
                    </label>
                  </div>

                  <div className="flex items-center space-x-1 p-2 theme-bg-primary/20 rounded text-xs">
                    <input
                      type="checkbox"
                      id="useInPost"
                      checked={useInPost}
                      onChange={(e) => onUseInPostChange?.(e.target.checked)}
                      className="w-3 h-3 text-green-600"
                    />
                    <Target className="w-3 h-3 text-green-400" />
                    <label
                      htmlFor="useInPost"
                      className="theme-text-secondary cursor-pointer"
                    >
                      Use in Post
                    </label>
                  </div>
                </div>
              )}

              {/* Status Indicators */}
              {analyzingImage && (
                <div className="flex items-center justify-center p-2 bg-blue-500/10 border border-blue-400/20 rounded text-xs">
                  <Loader className="w-3 h-3 animate-spin mr-2 text-blue-400" />
                  <span className="text-blue-300">AI analyzing...</span>
                </div>
              )}
              {uploading && (
                <div className="flex items-center justify-center p-2 bg-amber-500/10 border border-amber-400/20 rounded text-xs">
                  <Loader className="w-3 h-3 animate-spin mr-2 text-amber-400" />
                  <span className="text-amber-300">Uploading...</span>
                </div>
              )}

              {/* Action Buttons */}
              {(file || mediaUrl) && isImage && !analyzingImage && showAIAnalysis && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onAIAnalysis}
                    disabled={analyzingImage}
                    className="flex-1 bg-gradient-to-r from-blue-500/80 to-indigo-500/80 text-white px-3 py-2 rounded text-xs hover:from-blue-600/80 hover:to-indigo-600/80 transition-all duration-200 flex items-center justify-center space-x-1 disabled:opacity-50"
                  >
                    <Eye className="w-3 h-3" />
                    <span>AI Analysis</span>
                  </button>
                  {showTemplateSelector && (
                    <button
                      type="button"
                      onClick={onTemplateSelector}
                      className="flex-1 bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white px-3 py-2 rounded text-xs hover:from-purple-600/80 hover:to-pink-600/80 transition-all duration-200 flex items-center justify-center space-x-1"
                    >
                      <Palette className="w-3 h-3" />
                      <span>Apply Template</span>
                    </button>
                  )}
                </div>
              )}

              {/* Template Applied UI */}
              {templatedImageUrl && selectedTemplate && (
                <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-2">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium text-purple-300 flex text-xs">
                      <Palette className="w-3 h-3 mr-1" />
                      Template Applied: {selectedTemplate.name}
                    </h4>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onEditTemplate}
                      className="flex-1 bg-purple-500/80 text-white px-3 py-1.5 rounded text-xs hover:bg-purple-600/80 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={onDeleteTemplate}
                      className="flex-1 bg-red-500/80 text-white px-3 py-1.5 rounded text-xs hover:bg-red-600/80 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onRemoveMedia}
              className="text-red-400 hover:text-red-300 text-xs font-medium"
            >
              Remove
            </button>
          </div>
        ) : (
          /* Empty State */
          <div className="space-y-3">
            <Upload className="w-8 h-8 theme-text-secondary mx-auto" />
            <div>
              <p className="font-medium theme-text-primary text-sm">
                Drop files here
              </p>
              <p className="theme-text-secondary text-xs mt-1">
                or click to browse
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500/80 text-white px-4 py-2 rounded text-xs hover:bg-blue-600/80 transition-colors duration-200 flex items-center space-x-1"
              >
                <Upload className="w-3 h-3" />
                <span>Choose Files</span>
              </button>
              {acceptType !== 'video' && onAIImageGenerate && (
                <button
                  type="button"
                  onClick={onAIImageGenerate}
                  className="bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white px-4 py-2 rounded text-xs hover:from-purple-600/80 hover:to-pink-600/80 transition-all duration-200 flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate AI</span>
                </button>
              )}
            </div>
            <p className="text-xs theme-text-secondary">
              {getFileTypeText()}
            </p>
          </div>
        )}
      </div>

      {/* AI Analysis Results */}
      {imageAnalysis && (
        <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-300 flex items-center text-xs">
              <Eye className="w-3 h-3 mr-1" />
              AI Analysis Complete
            </h4>
            <div className="max-h-24 overflow-y-auto">
              <p className="text-blue-200 text-xs leading-relaxed">
                {imageAnalysis}
              </p>
            </div>
            <button
              onClick={onUseImageAnalysis}
              className="bg-gradient-to-r from-blue-500/80 to-indigo-500/80 text-white px-3 py-1.5 rounded text-xs hover:from-blue-600/80 hover:to-indigo-600/80 transition-all duration-200 flex items-center space-x-1"
            >
              <span>Add to Description</span>
              <Sparkles className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
