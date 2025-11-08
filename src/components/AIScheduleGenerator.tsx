import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Sparkles,
  Plus,
  RefreshCw,
  Send,
  Brain,
} from "lucide-react";
import { AIModelSelector } from "./AIModelSelector";
import { aiService } from "../lib/aiService";
import {
  platformOptions,
  getPlatformIcon,
  getPlatformDisplayName,
} from "../utils/platformIcons";

interface ScheduleRequest {
  prompt: string;
  category?: string;
  platforms: string[];
  timePreference?: "morning" | "afternoon" | "evening" | "custom";
  customTime?: string;
  keywords?: string[];
  preferredModel?: string;
}

interface GeneratedSchedule {
  id: string;
  date: string;
  time: string;
  content: string;
  imagePrompt?: string;
  platform: string[];
  category: string;
  isLive?: boolean;
  reasoning?: string;
}

interface AIScheduleGeneratorProps {
  onGenerateSchedule: (
    request: ScheduleRequest
  ) => Promise<GeneratedSchedule[]>;
  onApproveSchedule: (schedule: GeneratedSchedule[]) => void;
  campaignData?: any;
  isGenerating?: boolean;
}

const EXAMPLE_PROMPTS = [
  "Create tech posts every Friday until November 10th",
  "Daily motivational posts for the next 2 weeks at 9 AM",
  "Post about winter tech trends throughout December",
  "Weekly product updates every Monday and Thursday",
  "Share industry news 3 times per week for a month",
];

export const AIScheduleGenerator: React.FC<AIScheduleGeneratorProps> = ({
  onGenerateSchedule,
  onApproveSchedule,
  campaignData,
  isGenerating = false,
}) => {
  const [prompt, setPrompt] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "linkedin",
  ]);
  const [category, setCategory] = useState("");
  const [timePreference, setTimePreference] = useState<
    "morning" | "afternoon" | "evening" | "custom"
  >("morning");
  const [customTime, setCustomTime] = useState("09:00");
  const [keywords, setKeywords] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [generatedSchedule, setGeneratedSchedule] = useState<
    GeneratedSchedule[]
  >([]);
  const [showPreview, setShowPreview] = useState(false);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || selectedPlatforms.length === 0) return;

    const request: ScheduleRequest = {
      prompt: prompt.trim(),
      category: category || undefined,
      platforms: selectedPlatforms,
      timePreference,
      customTime: timePreference === "custom" ? customTime : undefined,
      keywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      preferredModel: selectedModel || undefined,
    };

    try {
      const schedule = await onGenerateSchedule(request);
      setGeneratedSchedule(schedule);
      setShowPreview(true);
    } catch (error) {
      console.error("Failed to generate schedule:", error);
    }
  };

  const handleApprove = () => {
    onApproveSchedule(generatedSchedule);
    setGeneratedSchedule([]);
    setShowPreview(false);
    setPrompt("");
  };

  const getTimeRangeDisplay = () => {
    switch (timePreference) {
      case "morning":
        return "8:00 AM - 10:00 AM";
      case "afternoon":
        return "1:00 PM - 3:00 PM";
      case "evening":
        return "6:00 PM - 8:00 PM";
      case "custom":
        return customTime;
      default:
        return "Flexible";
    }
  };

  const SchedulePreview = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Generated Schedule Preview
              </h3>
              <p className="text-gray-600">
                Review and approve your AI-generated posting schedule
              </p>
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="text-slate-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {generatedSchedule.map((item, index) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-md p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                      {item.time}
                    </div>
                    {item.isLive && (
                      <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        🔴 Live Content
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">#{index + 1}</div>
                </div>

                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-1">Content:</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {item.content}
                  </p>
                </div>

                {item.imagePrompt && (
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      AI Image Prompt:
                    </h4>
                    <p className="text-gray-600 italic bg-yellow-50 p-2 rounded text-sm">
                      {item.imagePrompt}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {item.platform.map((platform) => (
                      <span
                        key={platform}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                  {item.reasoning && (
                    <div className="text-xs text-slate-500 max-w-xs">
                      AI: {item.reasoning}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Approve & Add to Calendar ({generatedSchedule.length} posts)
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-md shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-md">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            AI Schedule Generator
          </h2>
          <p className="text-gray-600">
            Describe your posting schedule and let AI create the perfect content
            calendar
          </p>
        </div>
      </div>

      {/* Example Prompts */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Try these examples:
        </label>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-1 rounded-full transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Main Input */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your posting schedule:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Post tech tutorials every Tuesday and Thursday for the next month at 10 AM'"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Platforms:
          </label>
          <div className="flex flex-wrap gap-3">
            {platformOptions.map((platform) => {
              const IconComponent = platform.icon;
              const isSelected = selectedPlatforms.includes(platform.id);
              return (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformToggle(platform.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md border-2 transition-all ${
                    isSelected
                      ? `${platform.bgColor} ${platform.borderColor} ${platform.color}`
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <IconComponent
                    className={`w-4 h-4 ${
                      isSelected ? platform.color : "text-slate-500"
                    }`}
                  />
                  <span className="font-medium">{platform.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Model Selection */}
        <div className="mb-6">
          <AIModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            taskType="scheduling"
            showIcon={true}
          />
        </div>

        {/* Time Preference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Posting Time:
            </label>
            <div className="space-y-2">
              {[
                { value: "morning", label: "Morning (8-10 AM)" },
                { value: "afternoon", label: "Afternoon (1-3 PM)" },
                { value: "evening", label: "Evening (6-8 PM)" },
                { value: "custom", label: "Custom Time" },
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    value={option.value}
                    checked={timePreference === option.value}
                    onChange={(e) => setTimePreference(e.target.value as any)}
                    className="mr-3 text-blue-600"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>

            {timePreference === "custom" && (
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="mt-2 p-2 border border-gray-300 rounded-md"
              />
            )}
          </div>

          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category (optional):
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Tech, Marketing, Tips"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords (optional):
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., AI, development, trends (comma separated)"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={handleGenerate}
            disabled={
              !prompt.trim() || selectedPlatforms.length === 0 || isGenerating
            }
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-md font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating Schedule...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Generate AI Schedule
              </>
            )}
          </button>
        </div>

        {/* Current Settings Summary */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium text-gray-900 mb-2">Current Settings:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <strong>Platforms:</strong>{" "}
              {selectedPlatforms.join(", ") || "None selected"}
            </div>
            <div>
              <strong>Time:</strong> {getTimeRangeDisplay()}
            </div>
            <div>
              <strong>Category:</strong> {category || "General"}
            </div>
            <div>
              <strong>Keywords:</strong> {keywords || "None"}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Preview Modal */}
      {showPreview && <SchedulePreview />}
    </div>
  );
};
