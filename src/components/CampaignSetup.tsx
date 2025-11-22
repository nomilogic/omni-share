import React, { useState } from "react";
import {
  Target,
  Globe,
  Palette,
  Goal,
  FileText,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Music,
  Youtube,
  Calendar,
  DollarSign,
} from "lucide-react";
import { CampaignInfo } from "../types";
import { notify } from "@/utils/toast";

interface CampaignSetupProps {
  onNext: (data: CampaignInfo) => void;
  onBack?: () => void;
  initialData?: Partial<CampaignInfo> | null;
}

export const CampaignSetup: React.FC<CampaignSetupProps> = ({
  onNext,
  onBack,
  initialData,
}) => {
  const [formData, setFormData] = useState<CampaignInfo>({
    name: initialData?.name || "",
    website: initialData?.website || "",
    industry: initialData?.industry || "",
    description: initialData?.description || "",
    targetAudience: initialData?.targetAudience || "",
    brandTone: initialData?.brandTone || "professional",
    goals: initialData?.goals || [],
    platforms: initialData?.platforms || [],
    objective: initialData?.objective || "awareness",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    budget: initialData?.budget || 0,
    status: initialData?.status || "draft",
    keywords: initialData?.keywords || [],
    hashtags: initialData?.hashtags || [],
  });

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "E-commerce",
    "Education",
    "Food & Beverage",
    "Fashion",
    "Real Estate",
    "Automotive",
    "Entertainment",
    "Non-profit",
    "Other",
  ];

  const toneOptions = [
    {
      value: "professional",
      label: "Professional",
      description: "Formal and authoritative",
    },
    { value: "playful", label: "Playful", description: "Fun and energetic" },
    {
      value: "motivational",
      label: "Motivational",
      description: "Inspiring and uplifting",
    },
    { value: "casual", label: "Casual", description: "Relaxed and friendly" },
    {
      value: "authoritative",
      label: "Authoritative",
      description: "Expert and trustworthy",
    },
  ];

  const goalOptions = [
    "Brand Awareness",
    "Lead Generation",
    "Customer Engagement",
    "Sales Conversion",
    "Community Building",
    "Thought Leadership",
    "Product Launch",
    "Event Promotion",
  ];

  const platformOptions = [
    {
      id: "facebook",
      name: "Facebook",
      icon: Facebook,
      color: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-200",
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: Instagram,
      color: "text-pink-600",
      bgColor: "bg-pink-50 border-pink-200",
    },
    {
      id: "twitter",
      name: "Twitter/X",
      icon: Twitter,
      color: "text-sky-600",
      bgColor: "bg-sky-50 border-sky-200",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: Linkedin,
      color: "text-blue-700",
      bgColor: "bg-blue-50 border-blue-300",
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: Music,
      color: "text-black",
      bgColor: "bg-gray-50 border-gray-300",
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: Youtube,
      color: "text-red-600",
      bgColor: "bg-red-50 border-red-200",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("CampaignSetup form submitted with data:", formData);

    // Validate required fields
    if (!formData.name || formData.name.trim() === "") {
      notify("error", "Please enter a campaign name");
      return;
    }

    if (!formData.platforms || formData.platforms.length === 0) {
      notify("error", "Please select at least one platform");
      return;
    }

    console.log("Form validation passed, calling onNext with:", formData);
    onNext(formData);
  };

  const toggleGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals?.includes(goal)
        ? prev.goals?.filter((g) => g !== goal)
        : [...(prev.goals ?? []), goal],
    }));
  };

  const togglePlatform = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform as any)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform as any],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-md shadow-md p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-md flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Campaign Setup
        </h2>
        <p className="text-gray-500 font-medium">
          Create your marketing campaign with targeted content strategy
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Campaign Information */}
        <div className="bg-gray-50 rounded-md p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Campaign Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Target className="w-4 h-4 inline mr-2" />
                Campaign Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your campaign name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, website: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, industry: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select your industry</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Campaign Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                rows={3}
                placeholder="Describe what your campaign does, your mission, and values"
              />
            </div>
          </div>
        </div>

        {/* Target Audience */}
        <div className="bg-gray-50 rounded-md p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Target Audience
          </h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Target className="w-4 h-4 inline mr-2" />
              Audience Description
            </label>
            <textarea
              value={formData.targetAudience}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  targetAudience: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              rows={3}
              placeholder="Describe your target audience (age, interests, demographics, pain points)"
            />
          </div>
        </div>

        {/* Brand Voice */}
        <div className="bg-gray-50 rounded-md p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            <Palette className="w-5 h-5 inline mr-2" />
            Brand Voice & Tone
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {toneOptions.map((tone) => (
              <div
                key={tone.value}
                className={`p-4 border-2 rounded-md cursor-pointer transition-all duration-200 hover:shadow-md ${
                  formData.brandTone === tone.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    brandTone: tone.value as any,
                  }))
                }
              >
                <h3 className="font-medium text-slate-900">{tone.label}</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  {tone.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Marketing Goals */}
        <div className="bg-gray-50 rounded-md p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            <Goal className="w-5 h-5 inline mr-2" />
            Marketing Goals
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {goalOptions.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => toggleGoal(goal)}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  formData.goals?.includes(goal)
                    ? "bg-blue-500 text-white border-2 border-blue-500 shadow-md"
                    : "bg-white text-slate-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        {/* Social Media Platforms */}
        <div className="bg-gray-50 rounded-md p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Target Platforms *
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformOptions.map((platform) => {
              const IconComponent = platform.icon;
              const isSelected = formData.platforms.includes(
                platform.id as any
              );

              return (
                <div
                  key={platform.id}
                  className={`p-4 border-2 rounded-md cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected
                      ? `border-blue-500 bg-blue-50 shadow-md`
                      : `border-gray-200 hover:border-gray-300 bg-white ${platform.bgColor}`
                  }`}
                  onClick={() => togglePlatform(platform.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-md ${
                        isSelected ? "bg-blue-100" : "bg-white"
                      }`}
                    >
                      <IconComponent
                        className={`w-6 h-6 ${
                          isSelected ? "text-blue-600" : platform.color
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">
                        {platform.name}
                      </h3>
                      <div
                        className={`w-2 h-2 rounded-full mt-1 ${
                          isSelected ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {formData.platforms.length === 0 && (
            <p className="text-sm text-red-600 mt-2">
              Please select at least one platform
            </p>
          )}
        </div>

        {/* Campaign Settings */}
        <div className="bg-gray-50 rounded-md p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            <Calendar className="w-5 h-5 inline mr-2" />
            Campaign Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Campaign Objective
              </label>
              <select
                value={formData.objective}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    objective: e.target.value as any,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="awareness">Brand Awareness</option>
                <option value="engagement">Engagement</option>
                <option value="conversions">Conversions</option>
                <option value="leads">Lead Generation</option>
                <option value="sales">Sales</option>
                <option value="brand_building">Brand Building</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Budget (optional)
              </label>
              <input
                type="number"
                value={formData.budget || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    budget: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter campaign budget"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Date (optional)
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Date (optional)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-gray-100 text-slate-700 py-4 px-8 rounded-md font-medium hover:bg-gray-200 transition-colors duration-200"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={!formData.name || formData.platforms.length === 0}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-md font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-md"
          >
            {initialData?.name ? "Update Campaign" : "Create Campaign"}
          </button>
        </div>
      </form>
    </div>
  );
};
