import React, { useEffect, useState } from 'react';
import { Loader, X, Zap, Brain, Sparkles } from 'lucide-react';
import Icon from './Icon';
import { LoadingState } from '../context/LoadingContext';

interface PreloaderOverlayProps {
  loadingState: LoadingState;
}

export const PreloaderOverlay: React.FC<PreloaderOverlayProps> = ({ loadingState }) => {
  const [displayMessage, setDisplayMessage] = useState('');
  const [animationPhase, setAnimationPhase] = useState(0);

  // Update display message with typing effect
  useEffect(() => {
    if (!loadingState.message) {
      setDisplayMessage('');
      return;
    }

    const message = loadingState.message;
    let currentIndex = 0;
    setDisplayMessage('');

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

  // Animation phase cycling for visual interest
  useEffect(() => {
    if (!loadingState.isLoading) return;

    const phaseInterval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 3);
    }, 2000);

    return () => clearInterval(phaseInterval);
  }, [loadingState.isLoading]);

  if (!loadingState.isLoading) {
    return null;
  }

  const getAnimatedIcon = () => {
    switch (animationPhase) {
      case 0:
        return <Zap className="w-8 h-8 text-blue-400 animate-pulse" />;
      case 1:
        return <Brain className="w-8 h-8 text-purple-400 animate-pulse" />;
      case 2:
        return <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />;
      default:
        return <Loader className="w-8 h-8 text-blue-400 animate-spin" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" />
      
      {/* Loading container */}
      <div className="relative z-10 bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-slideUp">
        {/* Cancel button */}
        {loadingState.canCancel && loadingState.onCancel && (
          <button
            onClick={loadingState.onCancel}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors duration-200 rounded-full hover:bg-white/10"
            title="Cancel operation"
          >
            {/* <X className="w-5 h-5" /> */}
          </button>
        )}

        {/* Logo and branding */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Icon name="logo" size={60} className="animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">OMNI SHARE</h3>
          <p className="text-gray-400 text-sm">AI-Powered Content Creation</p>
        </div>

        {/* Animated loading indicator */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center space-x-3 mb-4">
            {getAnimatedIcon()}
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>

        {/* Loading message with typing effect */}
        <div className="text-center mb-6 min-h-[2.5rem]">
          <p className="text-white text-lg font-medium leading-tight">
            {displayMessage}
            <span className="animate-pulse">|</span>
          </p>
        </div>

        {/* Progress bar (if progress is provided) */}
        {typeof loadingState.progress === 'number' && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(loadingState.progress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingState.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-500/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-purple-500/10 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/5 rounded-full animate-pulse" style={{ animationDuration: '5s' }} />
        </div>

        {/* Loading tips or encouragement */}
        <div className="text-center">
          <p className="text-gray-500 text-xs">
            {loadingState.canCancel 
              ? 'You can cancel this operation at any time'
              : 'Please wait while we process your request'}
          </p>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
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
