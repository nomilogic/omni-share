import React, { useState } from "react";
import {
  Building2,
  User,
  Upload,
  MapPin,
  Globe,
  Users,
  Target,
  Briefcase,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import API from "../services/api";

interface ProfileSetupProps {
  userType: "individual" | "business";
  selectedPlan: "free" | "ipro" | "business";
  onComplete: () => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({
  userType,
  selectedPlan,
  onComplete,
}) => {
  const { state, dispatch } = useAppContext();
  const [formData, setFormData] = useState({
    // Common fields
    name: "",
    bio: "",
    location: "",
    website: "",
    profileImage: null as File | null,

    // Business-specific fields
    campaignSize: "",
    industry: "",
    targetAudience: "",
    brandVoice: "",
    businessGoals: [] as string[],

    // Individual-specific fields
    contentNiche: "",
    socialGoals: [] as string[],
    postingFrequency: "",
    preferredPlatforms: [] as string[],
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        profileImage: e.target.files![0],
      }));
    }
  };

  const handleArrayChange = (
    field: string,
    value: string,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter(
            (item) => item !== value
          ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create profile data based on user type
      const profileData = {
        type: userType,
        plan: selectedPlan,
        ...formData,
        userId: state.user?.id,
      };

      await API.updateProfile(profileData);

      dispatch({ type: "SET_ONBOARDING_COMPLETE", payload: true });
      dispatch({ type: "SET_SELECTED_PROFILE", payload: profileData as any });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Profile setup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const businessGoalOptions = [
    "Increase brand awareness",
    "Generate leads",
    "Drive website traffic",
    "Build community",
    "Customer support",
    "Thought leadership",
  ];

  const socialGoalOptions = [
    "Grow followers",
    "Increase engagement",
    "Build personal brand",
    "Share expertise",
    "Network with others",
    "Monetize content",
  ];

  const platformOptions = [
    "Instagram",
    "Facebook",
    "Twitter",
    "LinkedIn",
    "TikTok",
    "YouTube",
  ];

  const niches = [
    "Lifestyle",
    "Technology",
    "Business",
    "Health & Fitness",
    "Travel",
    "Food",
    "Fashion",
    "Education",
    "Entertainment",
    "Art & Design",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {userType === "business" ? (
            <Building2 className="w-8 h-8 text-blue-600" />
          ) : (
            <User className="w-8 h-8 text-blue-600" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {userType === "business" ? "Business Profile" : "Creator Profile"}
        </h2>
        <p className="text-gray-600 mt-2">
          {userType === "business"
            ? "Tell us about your business to personalize your AI content"
            : "Share your creator journey to get personalized AI assistance"}
        </p>
      </div>

      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {userType === "business" ? "Business Name" : "Your Name"}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                userType === "business"
                  ? "Enter business name"
                  : "Enter your name"
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="City, Country"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {userType === "business" ? "Business Description" : "Bio"}
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={
              userType === "business"
                ? "Describe your business and what you offer"
                : "Tell us about yourself and your content"
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-1" />
            Website
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>

      {/* Business-specific fields */}
      {userType === "business" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Business Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Campaign Size
              </label>
              <select
                name="campaignSize"
                value={formData.campaignSize}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Industry
              </label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Technology, Healthcare, Retail"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              Target Audience
            </label>
            <textarea
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your ideal customers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Business Goals
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {businessGoalOptions.map((goal) => (
                <label
                  key={goal}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.businessGoals.includes(goal)}
                    onChange={(e) =>
                      handleArrayChange("businessGoals", goal, e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{goal}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Individual-specific fields */}
      {userType === "individual" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Content Preferences
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Niche
              </label>
              <select
                name="contentNiche"
                value={formData.contentNiche}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select your niche</option>
                {niches.map((niche) => (
                  <option key={niche} value={niche}>
                    {niche}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posting Frequency
              </label>
              <select
                name="postingFrequency"
                value={formData.postingFrequency}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select frequency</option>
                <option value="daily">Daily</option>
                <option value="few-times-week">Few times a week</option>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Social Media Goals
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {socialGoalOptions.map((goal) => (
                <label
                  key={goal}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.socialGoals.includes(goal)}
                    onChange={(e) =>
                      handleArrayChange("socialGoals", goal, e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{goal}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Platforms
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {platformOptions.map((platform) => (
                <label
                  key={platform}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.preferredPlatforms.includes(platform)}
                    onChange={(e) =>
                      handleArrayChange(
                        "preferredPlatforms",
                        platform,
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{platform}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Setting up your profile..." : "Complete Setup"}
        </button>
      </div>
    </form>
  );
};
