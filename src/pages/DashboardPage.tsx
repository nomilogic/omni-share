import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  TrendingUp,
  Calendar,
  Settings,
  ArrowRight,
  Sparkles,
  Target,
  Users,
  BarChart3,
  FileText,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

export const DashboardPage: React.FC = () => {
  const { dispatch } = useAppContext();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showTierModal, setShowTierModal] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [tierLoading, setTierLoading] = useState(false);

  // Real stats - will be loaded from API
  const stats = {
    totalPosts: 0,
    scheduledPosts: 0,
    publishedPosts: 0,
    totalEngagement: 0,
  };

  // Real recent posts - will be loaded from API
  const recentPosts: any[] = [];

  // Check if user needs tier selection or profile setup - HIDDEN FOR NOW
  // useEffect(() => {
  //   if (state.user && !state.loading) {
  //     console.log('Dashboard setup check:', {
  //       hasTierSelected: state.hasTierSelected,
  //       userPlan: state.userPlan,
  //       hasProfileSetup: state.hasProfileSetup,
  //       selectedProfile: !!state.selectedProfile,
  //       hasCompletedOnboarding: state.hasCompletedOnboarding
  //     });
  //
  //     // Show tier modal if user hasn't selected a tier yet
  //     if (!state.hasTierSelected && !state.userPlan) {
  //       console.log('Showing tier modal - no tier selected');
  //       setShowTierModal(true);
  //       setShowProfileForm(false);
  //     }
  //     // Show profile form if user has tier selected but no profile setup
  //     else if (state.hasTierSelected && state.userPlan && !state.hasProfileSetup) {
  //       console.log('Showing profile form - tier selected but no profile setup');
  //       setShowTierModal(false);
  //       setShowProfileForm(true);
  //     }
  //     // Close all modals if user is fully set up
  //     else if (state.hasTierSelected && state.userPlan && state.hasProfileSetup && state.selectedProfile) {
  //       console.log('User is fully set up - closing all modals');
  //       setShowTierModal(false);
  //       setShowProfileForm(false);
  //       setShowOnboarding(false);
  //     }
  //     // Show onboarding if user has no profile at all (fallback)
  //     else if (!state.selectedProfile && !state.hasCompletedOnboarding) {
  //       console.log('Showing onboarding - no profile and not completed onboarding');
  //       setShowOnboarding(true);
  //       setShowTierModal(false);
  //       setShowProfileForm(false);
  //     }
  //   }
  // }, [state.user, state.loading, state.hasTierSelected, state.userPlan, state.hasProfileSetup, state.selectedProfile, state.hasCompletedOnboarding]);

  const onboardingSteps = [
    {
      title: "Welcome to Omni Share!",
      description: "Your AI-powered social media content creation platform",
      icon: Sparkles,
      content:
        "Transform your social media presence with AI-generated content tailored to your brand. Let's get you started in just a few simple steps.",
    },
    {
      title: "Create Your Profile",
      description: "Set up your brand identity and voice",
      icon: Target,
      content:
        "First, we'll create your profile. This helps our AI understand your brand voice, target audience, and content preferences.",
    },
    {
      title: "Generate Your First Content",
      description: "Let AI create engaging posts for you",
      icon: Users,
      content:
        "Once your profile is ready, you can start generating AI-powered content. Our system creates posts optimized for different social media platforms.",
    },
    {
      title: "Publish & Schedule",
      description: "Share your content across platforms",
      icon: BarChart3,
      content:
        "Review, edit, and publish your content directly to your social media accounts or schedule them for optimal engagement times.",
    },
  ];

  const handleStartOnboarding = () => {
    navigate("/content");
  };

  const nextOnboardingStep = () => {
    if (onboardingStep < onboardingSteps.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      handleStartOnboarding();
    }
  };

  const skipOnboarding = () => {
    setShowOnboarding(false);
  };

  // Handler for tier selection
  const handleTierSelection = async (planId: "free" | "ipro" | "business") => {
    setTierLoading(true);
    try {
      // Update context with selected plan
      dispatch({ type: "SET_USER_PLAN", payload: planId });
      dispatch({ type: "SET_TIER_SELECTED", payload: true });

      // Close tier modal and show profile form
      setShowTierModal(false);
      setShowProfileForm(true);

      console.log("Tier selected:", planId);
    } catch (error) {
      console.error("Error selecting tier:", error);
    } finally {
      setTierLoading(false);
    }
  };

  // Handler for profile completion
  const handleProfileComplete = () => {
    dispatch({ type: "SET_PROFILE_SETUP", payload: true });
    dispatch({ type: "SET_ONBOARDING_COMPLETE", payload: true });
    setShowProfileForm(false);
  };

  // Handler to skip tier selection temporarily
  const handleSkipTierSelection = () => {
    setShowTierModal(false);
    // User can still access tier selection from settings later
  };

  if (showOnboarding) {
    const currentStep = onboardingSteps[onboardingStep];
    const Icon = currentStep.icon;

    return (
      <div className="min-h-[50vh] flex items-center justify-center theme-card-bg">
        <div className="w-full mx-auto text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 theme-bg-card rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon className="w-8 h-8 theme-text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 theme-bg-secondary theme-text-primary text-xs font-semibold px-2 py-1 rounded-full">
              {onboardingStep + 1}/{onboardingSteps.length}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-lg theme-text-secondary">
              {currentStep.description}
            </p>
            <p className="theme-text-light text-sm leading-relaxed max-w-md mx-auto">
              {currentStep.content}
            </p>
          </div>

          <div className="flex justify-center space-x-3">
            <button
              onClick={skipOnboarding}
              className="px-4 py-2 text-sm theme-text-secondary hover:theme-text-primary transition-colors duration-200"
            >
              Skip for now
            </button>
            <button
              onClick={nextOnboardingStep}
              className="flex items-center space-x-2 theme-button-primary text-white px-6 py-2 text-sm rounded-lg hover:theme-button-hover transition-colors duration-200"
            >
              <span>
                {onboardingStep === onboardingSteps.length - 1
                  ? "Get Started"
                  : "Next"}
              </span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center space-x-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === onboardingStep
                    ? "theme-bg-primary"
                    : "theme-bg-light"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: "Create Content",
      description: "Generate AI-powered social media posts",
      icon: Plus,
      color: "theme-bg-primary",
      action: () => navigate("/content"),
    },
    // {
    //   title: "My Campaigns",
    //   description: "View and manage your campaigns",
    //   icon: Target,
    //   color: "theme-bg-secondary",
    //   action: () => navigate("/campaigns"),
    // },
    {
      title: "Schedule Posts",
      description: "Plan and schedule your content",
      icon: Calendar,
      color: "theme-bg-primary",
      action: () => navigate("/schedule"),
    },
    {
      title: "Settings",
      description: "Configure your preferences",
      icon: Settings,
      color: "theme-bg-light",
      action: () => navigate("/settings"),
    },
  ];

  return (
    <div className="theme-card-bg">
      <div className="mx-auto px-4 py-4 space-y-4">
        {/* Create Content Button - Centered */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/content")}
            className="flex items-center gap-2 theme-button-secondary text-white px-6 py-3 rounded-lg hover:theme-button-hover transition-all duration-200 pulse-glow border border-white/20 w-full"
          >
            <Plus className="w-5 h-5" />
            <span className="text-base font-medium">Create Content</span>
          </button>
        </div>

        {/* Stats Overview - 2 Columns Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-white/20 p-4 floating-element">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm  font-medium theme-text-light text-white">
                  Total Posts
                </h3>
                <p className="text-2xl font-bold theme-text-primary mt-1 drop-shadow">
                  {stats.totalPosts}
                </p>
                <p className=" text-xs text-slate-600">
                  Get started by creating content
                </p>
              </div>
              <div className="theme-bg-light p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 theme-text-primary" />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl border border-white/20 p-4 floating-element"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium theme-text-light text-white">
                  Scheduled
                </h3>
                <p className="text-2xl font-bold theme-text-primary mt-1 drop-shadow">
                  {stats.scheduledPosts}
                </p>
                <p className="text-xs text-slate-600">
                  Schedule your first post
                </p>
              </div>
              <div className="theme-bg-light p-2 rounded-lg">
                <Calendar className="w-5 h-5 theme-text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={index}
                onClick={action.action}
                className="theme-bg-trinary rounded-xl shadow-sm border border-white/20 p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 floating-element"
              >
                <div
                  className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mb-3`}
                >
                  <Icon className="w-4 h-4 " />
                </div>
                <h3 className="text-sm text-white font-semibold mb-1">
                  {action.title}
                </h3>
                <p className="theme-text-light text-xs leading-tight">
                  {action.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="theme-bg-card p-6 rounded-lg backdrop-blur-lg">
            <h2 className="text-xl font-semibold theme-text-primary mb-4">
              Recent Posts
            </h2>
            <div className="space-y-4">
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start space-x-3 p-3 theme-bg-primary rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 theme-bg-secondary rounded-lg flex items-center justify-center">
                        <FileText
                          className="w-5 h-5"
                          style={{ color: "var(--theme-primary)" }}
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium theme-text-primary truncate">
                        {post.content}
                      </p>
                      <p className="text-sm theme-text-light">
                        {post.platform} • {post.date}
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        post.status === "published"
                          ? "theme-bg-primary theme-text-primary"
                          : post.status === "scheduled"
                          ? "theme-bg-secondary theme-text-secondary"
                          : "theme-bg-primary theme-text-light"
                      }`}
                    >
                      {post.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 theme-text-light mx-auto mb-3" />
                  <p className="theme-text-secondary text-sm mb-2">
                    No posts yet
                  </p>
                  <p className="theme-text-light text-xs mb-4">
                    Create your first post to see it here
                  </p>
                  <button
                    onClick={() => navigate("/content")}
                    className="text-xs theme-button-primary text-white px-4 py-2 rounded-lg hover:theme-button-hover transition-colors"
                  >
                    Create Content
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="theme-bg-card p-6 rounded-lg backdrop-blur-lg">
            <h2 className="text-xl font-semibold theme-text-primary mb-4">
              Analytics Overview
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 theme-bg-primary rounded-lg">
                <span className="text-sm font-medium theme-text-secondary">
                  Impressions
                </span>
                <span className="text-sm font-bold theme-text-primary">0</span>
              </div>
              <div className="flex justify-between items-center p-3 theme-bg-primary rounded-lg">
                <span className="text-sm font-medium theme-text-secondary">
                  Clicks
                </span>
                <span className="text-sm font-bold theme-text-primary">0</span>
              </div>
              <div className="flex justify-between items-center p-3 theme-bg-primary rounded-lg">
                <span className="text-sm font-medium theme-text-secondary">
                  Engagement Rate
                </span>
                <span className="text-sm font-bold theme-text-primary">0%</span>
              </div>
              <div className="flex justify-between items-center p-3 theme-bg-primary rounded-lg">
                <span className="text-sm font-medium theme-text-secondary">
                  Followers Growth
                </span>
                <span className="text-sm font-bold theme-text-primary">0</span>
              </div>
              <div className="text-center py-4">
                <p className="theme-text-light text-xs">
                  Analytics will appear here once you start publishing content
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Show onboarding again button if user needs tier selection or profile setup - HIDDEN FOR NOW */}
        {/* {!state.selectedProfile && !state.hasTierSelected && !state.hasProfileSetup && (
          <div className="theme-bg-card rounded-xl shadow-sm border border-white/20 p-4 text-center floating-element">
            <h2 className="text-lg font-bold theme-text-primary mb-2">
              Get Started with Your First Content
            </h2>
            <p className="theme-text-light text-sm mb-4">
              Create your profile to unlock AI-powered content
              generation tailored to your brand.
            </p>
            <button
              onClick={() => setShowTierModal(true)}
              className="theme-button-secondary text-white px-6 py-2 text-sm rounded-lg hover:theme-button-hover transition-colors duration-200 border border-white/20"
            >
              Choose Your Plan
            </button>
          </div>
        )} */}
      </div>

      {/* Tier Selection Modal - HIDDEN FOR NOW */}
      {/* <TierSelectionModal
        isOpen={showTierModal}
        onClose={handleSkipTierSelection}
        onSelectPlan={handleTierSelection}
        loading={tierLoading}
      /> */}

      {/* Profile Setup Forms - HIDDEN FOR NOW */}
      {/* {showProfileForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {state.userPlan === 'free' && (
              <ProfileSetupFree onComplete={handleProfileComplete} />
            )}
            {state.userPlan === 'ipro' && (
              <ProfileSetupPro onComplete={handleProfileComplete} />
            )}
            {state.userPlan === 'business' && (
              <ProfileSetupBusiness onComplete={handleProfileComplete} />
            )}
          </div>
        </div>
      )} */}
    </div>
  );
};
