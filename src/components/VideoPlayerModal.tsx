import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  X,
  SkipBack,
  SkipForward,
  Download,
  Share2,
  Heart,
  Repeat,
  Settings,
} from "lucide-react";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  onFavorite?: () => void;
  onReuse?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  isFavorite?: boolean;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  title,
  description,
  thumbnail,
  duration = 0,
  onFavorite,
  onReuse,
  onDownload,
  onShare,
  isFavorite = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoDuration, setVideoDuration] = useState(duration);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setVideoDuration(video.duration);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("ended", () => setIsPlaying(false));
    };
  }, [isOpen]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * videoDuration;

    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(0, Math.min(videoDuration, currentTime + seconds));
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      video.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercent =
    videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-opacity"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Video Container */}
        <div
          className="relative w-full h-full bg-black rounded-md overflow-hidden"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            poster={thumbnail}
            className="w-full h-full object-contain"
            onClick={togglePlay}
          />

          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="p-4 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-opacity"
              >
                <Play className="w-12 h-12" />
              </button>
            </div>
          )}

          {/* Controls */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Progress Bar */}
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="w-full h-2 bg-gray-600 rounded-full cursor-pointer mb-4 relative"
            >
              <div
                className="h-full bg-red-500 rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full"></div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => skip(-10)}
                  className="text-white hover:text-red-400 transition-colors"
                >
                  <SkipBack className="w-6 h-6" />
                </button>

                <button
                  onClick={togglePlay}
                  className="text-white hover:text-red-400 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={() => skip(10)}
                  className="text-white hover:text-red-400 transition-colors"
                >
                  <SkipForward className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-red-400 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer slider"
                  />
                </div>

                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(videoDuration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {onFavorite && (
                  <button
                    onClick={onFavorite}
                    className={`p-2 rounded-full transition-colors ${
                      isFavorite
                        ? "text-red-500 hover:text-red-400"
                        : "text-white hover:text-red-400"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                    />
                  </button>
                )}

                {onReuse && (
                  <button
                    onClick={onReuse}
                    className="p-2 text-white hover:text-red-400 rounded-full transition-colors"
                  >
                    <Repeat className="w-5 h-5" />
                  </button>
                )}

                {onDownload && (
                  <button
                    onClick={onDownload}
                    className="p-2 text-white hover:text-red-400 rounded-full transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                )}

                {onShare && (
                  <button
                    onClick={onShare}
                    className="p-2 text-white hover:text-red-400 rounded-full transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-white hover:text-red-400 rounded-full transition-colors"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Info Panel */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded-md max-w-md">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          {description && (
            <p className="text-sm text-gray-300">{description}</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};
