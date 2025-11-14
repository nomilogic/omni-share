import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  Users,
  BarChart3,
  Calendar,
  Zap,
  Brain,
  Camera,
  Video,
  MessageSquare,
  TrendingUp,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  bgGradient: string;
  iconColor: string;
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: 1,
    title: "Omni Share",
    subtitle: "AI-Powered Social Media Management",
    description:
      "Create, schedule, and optimize content across all major platforms with advanced AI technology.",
    icon: Sparkles,
    features: [
      "AI content generation with 15+ models",
      "Multi-platform posting & scheduling",
      "Advanced analytics & optimization",
      "Professional media management",
    ],
    bgGradient: "from-blue-600 via-purple-600 to-indigo-700",
    iconColor: "text-yellow-300",
  },
  {
    id: 2,
    title: "Start Creating Today",
    subtitle: "Get Started in Under 2 Minutes",
    description:
      "Join thousands of creators and businesses who trust Omni Share to transform their social media presence.",
    icon: Zap,
    features: [
      "Quick setup & onboarding",
      "Connect your social accounts",
      "Start posting immediately",
      "Free plan available",
    ],
    bgGradient: "from-emerald-500 via-teal-600 to-cyan-700",
    iconColor: "text-orange-300",
  },
];

interface OnboardingCarouselProps {
  onGetStarted: () => void;
}

export const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({
  onGetStarted,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % onboardingSlides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % onboardingSlides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + onboardingSlides.length) % onboardingSlides.length
    );
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const currentSlideData = onboardingSlides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <div className="relative ">
      {/* Animated Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.bgGradient} transition-all duration-1000`}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-white/15 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen  x-2 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Icon */}
          <div className="mb-8 animate-in slide-in-from-top duration-700"></div>

          {/* Content */}
          <div className="space-y-6 animate-in slide-in-from-bottom duration-700">
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              {currentSlideData.title}
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium text-white/90">
              {currentSlideData.subtitle}
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              {currentSlideData.description}
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mt-8">
              {currentSlideData.features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-md p-4 border border-white/20 hover:bg-white/20 transition-colors duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-white font-medium">{feature}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center space-x-4 mt-6">
            <button
              onClick={prevSlide}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 hover:bg-white/30 transition-colors duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            {/* Dots */}
            <div className="flex space-x-2">
              {onboardingSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-white scale-125"
                      : "bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 hover:bg-white/30 transition-colors duration-300"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Get Started Button */}
          <div className="mt-6">
            <button
              onClick={onGetStarted}
              className="bg-white text-slate-900 px-12 py-4 rounded-2xl font-bold text-xl hover:bg-gray-100 transition-colors duration-300 shadow-md hover:shadow-3xl transform hover:scale-105"
            >
              Get Started Free
            </button>
            <p className="text-white/70 mt-4">
              Join thousands of creators and businesses already using Omni Share
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}

      {/* Progress Bar */}
    </div>
  );
};
