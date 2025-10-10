import React, { useState } from "react";
import { User, MapPin, Globe } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { FeatureRestriction } from "./FeatureRestriction";
import API from "../services/api";

interface ProfileSetupFreeProps {
  onComplete: () => void;
}

export const ProfileSetupFree: React.FC<ProfileSetupFreeProps> = ({
  onComplete,
}) => {
  const { state, dispatch } = useAppContext();
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    bio: "",
    location: "",
    website: "",
    contentNiche: "",
    targetAudience: "",
    socialGoals: [] as string[],
    postingFrequency: "",
    brandVoice: "",
    campaignType: "",
    campaignGoals: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

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

    // Clear previous errors
    setError("");

    // Validate required fields
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);

    try {
      const profileData = {
        type: "individual",
        plan: "free",
        ...formData,
        userId: state.user?.id,
      };

      const response = await API.updateProfile(profileData);

      const result = response.data.data;

      const savedProfile = {
        ...profileData,
        id: result.id,
        userId: state.user?.id,
      };

      dispatch({ type: "SET_SELECTED_PROFILE", payload: savedProfile as any });
      dispatch({ type: "SET_USER_PLAN", payload: "free" });
      dispatch({ type: "SET_TIER_SELECTED", payload: true });
      dispatch({ type: "SET_PROFILE_SETUP", payload: true });
      dispatch({ type: "SET_ONBOARDING_COMPLETE", payload: true });

      console.log("✅ Free profile setup completed successfully");

      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      console.error("Profile setup error:", error);
      setError(error.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const platformOptions = ["Instagram", "Facebook", "Twitter", "LinkedIn"];

  const niches = [
    "Lifestyle",
    "Technology",
    "Business",
    "Health & Fitness",
    "Travel",
    "Food",
    "Fashion",
    "Education",
  ];

  const professionOptions = [
    "Content Creator",
    "Freelancer",
    "Artist",
    "Writer",
    "Photographer",
    "Designer",
    "Blogger",
    "Influencer",
    "Student",
    "Small Business Owner",
    "Consultant",
    "Coach",
    "Teacher",
    "Entrepreneur",
    "Other",
  ];

  const postsTypes = [
    "Personal Brand Building",
    "Content Portfolio",
    "Small Business Promotion",
    "Creative Showcase",
    "Educational Content",
    "Community Building",
    "Product Launch",
    "Other",
  ];

  const postsGoalOptions = [
    "Increase followers",
    "Build brand awareness",
    "Showcase work/portfolio",
    "Connect with audience",
    "Share knowledge",
    "Promote products/services",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Free Creator Profile
        </h2>
        <p className="text-gray-600 mt-2">
          Set up your basic profile to get started with AI content creation
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">Error</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profession
            </label>
            <select
              name="profession"
              value={formData.profession}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select your profession</option>
              {professionOptions.map((profession) => (
                <option key={profession} value={profession}>
                  {profession}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="City, Country"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Tell us about yourself and your content"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Niche
          </label>
          <select
            name="contentNiche"
            value={formData.contentNiche}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            Target Audience
          </label>
          <textarea
            name="targetAudience"
            value={formData.targetAudience}
            onChange={handleInputChange}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Describe your ideal audience (e.g., young professionals, tech enthusiasts, small business owners)"
          />
        </div>

        {/* Advanced Posts Configuration - Upgrade Required */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Posts Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Posts Type
            </label>
            <select
              name="campaignType"
              value={formData.campaignType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select posts type</option>
              {postsTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Posts Goals (select up to 5 for Pro plan)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {postsGoalOptions.map((goal) => (
                <label
                  key={goal}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.campaignGoals.includes(goal)}
                    onChange={(e) => {
                      if (
                        e.target.checked &&
                        formData.campaignGoals.length < 5
                      ) {
                        handleArrayChange("campaignGoals", goal, true);
                      } else if (!e.target.checked) {
                        handleArrayChange("campaignGoals", goal, false);
                      }
                    }}
                    disabled={
                      !formData.campaignGoals.includes(goal) &&
                      formData.campaignGoals.length >= 5
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{goal}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Setting up your profile..." : "Complete Free Setup"}
        </button>
      </div>
    </form>
  );
};
