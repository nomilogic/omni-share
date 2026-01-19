import React, { useEffect, useState } from "react";
import { Loader, Zap, Brain, Sparkles } from "lucide-react";
import Icon from "./Icon";
import logoText from "../assets/logo-text.svg";
import { LoadingState } from "../context/LoadingContext";

interface PreloaderOverlayProps {
  loadingState: LoadingState;
}

export const PreloaderOverlay: React.FC<PreloaderOverlayProps> = ({
  loadingState,
}) => {
  const [displayMessage, setDisplayMessage] = useState("");
  const [animationPhase, setAnimationPhase] = useState(0);

  // Update display message with typing effect
  useEffect(() => {
    if (!loadingState.message) {
      setDisplayMessage("");
      return;
    }

    const message = loadingState.message;
    let currentIndex = 0;
    setDisplayMessage("");

    const typingInterval = setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayMessage(message.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [loadingState.message]);

  useEffect(() => {
    if (!loadingState.isLoading) return;
    const phaseInterval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(phaseInterval);
  }, [loadingState.isLoading]);

  const getAnimatedIcon = () => {
    switch (animationPhase) {
      case 0:
        return <Zap className="w-8 h-8 text-[#7650e3] animate-pulse" />;
      case 1:
        return <Brain className="w-8 h-8 text-purple-500 animate-pulse" />;
      case 2:
        return <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />;
      default:
        return <Loader className="w-8 h-8 text-[#7650e3] animate-spin" />;
    }
  };

  if (!loadingState.isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" />

      {/* Loading container */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md border border-purple-200 rounded-lg md:p-8 p-6 max-w-md w-full mx-4 shadow-lg animate-slideUp">
        {/* Logo and branding */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Icon name="spiral-logo" size={60} className="animate-pulse text-[#7650e3]" />
          </div>
          <div className="flex justify-center mb-3">
            <img src={logoText} alt="OmniShare" className="h-4" />
          </div>
          <p className="text-purple-600 text-sm font-medium">AI-Powered Content Creation</p>
        </div>

        {/* Animated loading indicator */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center space-x-3 mb-4">
            {getAnimatedIcon()}
            <div className="flex space-x-1">
              <div
                className="w-2 h-2 bg-[#7650e3] rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 bg-[#a78bfa] rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 bg-[#ddd6fe] rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        </div>

        {/* Loading message with typing effect */}
        <div className="text-center mb-6 min-h-[3.5rem] text-wrap">
          <p className="text-[#000] text-md font-medium leading-tight text-wrap overflow-hidden">
            {displayMessage}
            <span className="animate-pulse">|</span>
          </p>
        </div>

        {/* Progress bar (if progress is provided) */}
        {typeof loadingState.progress === "number" && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-purple-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(loadingState.progress)}%</span>
            </div>
            <div className="w-full bg-purple-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7650e3] to-[#a78bfa] rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingState.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          <div
            className="absolute -top-10 -right-10 w-20 h-20 bg-purple-300/10 rounded-full animate-ping"
            style={{ animationDuration: "3s" }}
          />
          <div
            className="absolute -bottom-10 -left-10 w-20 h-20 bg-purple-300/10 rounded-full animate-ping"
            style={{ animationDuration: "4s", animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-200/5 rounded-full animate-pulse"
            style={{ animationDuration: "5s" }}
          />
        </div>

        {/* Loading tips or encouragement */}
        <div className="text-center">
          <p className="text-purple-600 font-medium text-xs">
            {loadingState.canCancel
              ? "You can cancel this operation at any time"
              : "Please wait while we process your request"}
          </p>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PreloaderOverlay;