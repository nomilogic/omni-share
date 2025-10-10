import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Star, Zap, Crown, ArrowLeft } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import ProfileSetupSinglePage from "../components/ProfileSetupSinglePage";
import API from "../services/api";

interface PricingTier {
  id: "free" | "ipro" | "business";
  name: string;
  price: string;
  description: string;
  features: string[];
  icon: React.ComponentType<any>;
  popular?: boolean;
  buttonText: string;
  buttonClass: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "aiFree",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "Basic content creation",
      "Limited AI generations (5/month)",
      "Manual posting only",
      "1 social platform",
      "Basic templates",
    ],
    icon: Star,
    buttonText: "Get Started Free",
    buttonClass: "bg-gray-600 hover:bg-gray-700 text-white",
  },
  {
    id: "ipro",
    name: "aiPRO",
    price: "$39.99",
    description: "Most popular for creators",
    features: [
      "1000 textual posts per month",
      "20 AI image generations",
      "ChatGPT-4 & Gemini Pro access",
      "Auto post scheduling",
      "Multi-platform support",
      "Advanced analytics",
      "Priority support",
    ],
    icon: Zap,
    popular: true,
    buttonText: "Start Pro Trial",
    buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  {
    id: "business",
    name: "aiBusiness",
    price: "$99.99",
    description: "For teams and businesses",
    features: [
      "Unlimited content creation",
      "Unlimited AI generations",
      "All AI models access",
      "Advanced scheduling",
      "Team collaboration",
      "White-label options",
      "Custom integrations",
      "Dedicated support",
    ],
    icon: Crown,
    buttonText: "Start Business Trial",
    buttonClass: "bg-purple-600 hover:bg-purple-700 text-white",
  },
];

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [selectedPlan, setSelectedPlan] = useState<
    "free" | "ipro" | "business" | null
  >(null);
  const [loading, setLoading] = useState(false);

  // Redirect users who have already completed onboarding
  useEffect(() => {
    if (state.hasCompletedOnboarding && state.selectedProfile) {
      console.log("✅ User has completed onboarding, redirecting to content");
      navigate("/content");
    }
  }, [state.hasCompletedOnboarding, state.selectedProfile, navigate]);

  const handleSelectPlan = async (planId: "free" | "ipro" | "business") => {
    setLoading(true);
    setSelectedPlan(planId);

    try {
      // Store the selected plan in context
      dispatch({ type: "SET_USER_PLAN", payload: planId });

      // Check if user already has a profile in the database
      if (state.user?.id) {
        // Get authentication token for API requests
        const token =
          localStorage.getItem("auth_token") ||
          sessionStorage.getItem("auth_token");

        if (!token) {
          console.warn("No authentication token found, skipping profile check");
        } else {
          try {
            const response = await API.getProfile();

            if (response.data) {
              const existingProfile = response.data.data;
              if (existingProfile && existingProfile.name) {
                const updatedProfile = { ...existingProfile, plan: planId };

                await API.updateProfile(updatedProfile);

                dispatch({
                  type: "SET_SELECTED_PROFILE",
                  payload: updatedProfile,
                });
                dispatch({ type: "SET_ONBOARDING_COMPLETE", payload: true });
                navigate("/dashboard");
                return;
              }
            } else if (response.status === 401) {
              console.warn("Authentication failed, user needs to log in again");
              // Could redirect to auth page here if needed
            } else if (response.status === 404) {
              console.log("No existing profile found, will show profile setup");
            }
          } catch (error) {
            console.error("Error checking existing profile:", error);
          }
        }
      }

      // No existing profile found, show the profile setup form
    } catch (error) {
      console.error("Error selecting plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPricing = () => {
    setSelectedPlan(null);
    dispatch({ type: "SET_USER_PLAN", payload: null });
  };

  const handleProfileComplete = async () => {
    // Mark onboarding as complete and navigate to content page
    dispatch({ type: "SET_ONBOARDING_COMPLETE", payload: true });
    dispatch({ type: "SET_PROFILE_SETUP", payload: true });
    dispatch({ type: "SET_TIER_SELECTED", payload: true });

    console.log("✅ Profile setup completed, navigating to content page");
    navigate("/content");
  };

  if (selectedPlan) {
    const selectedTier = pricingTiers.find((tier) => tier.id === selectedPlan);
    const userType = selectedPlan === "business" ? "business" : "individual";

    return (
      <div className="theme-bg-light py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <button
              onClick={handleBackToPricing}
              className="flex items-center theme-text-primary hover:opacity-75 mb-4 mx-auto transition-opacity"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pricing
            </button>
            <div className="mb-6">
              <div
                className={`inline-flex items-center px-6 py-3 rounded-full ${selectedTier?.buttonClass}`}
              >
                {selectedTier && <selectedTier.icon className="w-6 h-6 mr-2" />}
                <span className="font-semibold">
                  {selectedTier?.name} Plan Selected
                </span>
              </div>
            </div>
          </div>

          {/* Use the single-page profile form */}
          <ProfileSetupSinglePage />
        </div>
      </div>
    );
  }

  return (
    <div className="theme-bg-light py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold theme-text-primary mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg theme-text-secondary max-w-2xl mx-auto">
            Select the perfect plan to supercharge your social media content
            creation with AI
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className={`relative theme-bg-quaternary rounded-2xl shadow-xl p-2 transition-all duration-300 hover:scale-105 border ${
                  tier.popular
                    ? "border-2 border-blue-500 ring-2 ring-blue-200"
                    : "theme-border"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-2">
                  <Icon
                    className={`w-12 h-12 mx-auto mb-4 ${
                      tier.popular ? "text-blue-600" : "theme-text-primary"
                    }`}
                  />
                  <h3 className="text-2xl font-bold theme-text-primary mb-2">
                    {tier.name}
                  </h3>
                  <p className="theme-text-secondary mb-4">
                    {tier.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold theme-text-primary">
                      {tier.price}
                    </span>
                    {tier.price !== "$0" && (
                      <span className="theme-text-secondary ml-2">/month</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="theme-text-primary">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(tier.id)}
                  disabled={loading && selectedPlan === tier.id}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
                    tier.buttonClass
                  } ${
                    loading && selectedPlan === tier.id
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {loading && selectedPlan === tier.id
                    ? "Setting up..."
                    : tier.buttonText}
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="theme-text-secondary">
            All plans include a 14-day free trial. No credit card required for
            Free plan.
          </p>
        </div>
      </div>
    </div>
  );
};
