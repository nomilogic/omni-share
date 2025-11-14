import React, { useState } from "react";
import { PostPreview } from "./PostPreview";
import { SocialMediaManager } from "./SocialMediaManager";
import { Platform } from "../types";

// Sample data for testing
const samplePosts = [
  {
    platform: "facebook" as Platform,
    caption: "Exciting news about our new product launch! 🚀",
    hashtags: ["#ProductLaunch", "#Innovation", "#TechNews"],
    characterCount: 67,
    engagement: "high",
    mediaUrl: "https://example.com/image.jpg",
  },
  {
    platform: "twitter" as Platform,
    caption: "Breaking: Revolutionary AI breakthrough changes everything",
    hashtags: ["#AI", "#Tech", "#Innovation"],
    characterCount: 58,
    engagement: "medium",
    mediaUrl: "https://example.com/video.mp4",
  },
  {
    platform: "linkedin" as Platform,
    caption: "Professional insights on industry trends and market analysis",
    hashtags: ["#Business", "#MarketAnalysis", "#Growth"],
    characterCount: 71,
    engagement: "high",
    mediaUrl: "https://example.com/chart.png",
  },
];

export const TestFeatures: React.FC = () => {
  const [view, setView] = useState<"social-manager" | "post-preview">(
    "social-manager"
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "facebook",
    "twitter",
  ]);

  // Handler for individual platform regeneration
  const handleRegeneratePlatform = (platform: Platform) => {
    console.log(`🔄 Regenerating content for ${platform}`);
    alert(
      `Regenerating content for ${
        platform.charAt(0).toUpperCase() + platform.slice(1)
      }!`
    );
    // In a real app, this would trigger API call to regenerate content for just this platform
  };

  const handleBack = () => {
    console.log("🔄 Regenerating all posts");
    alert("Regenerating all posts!");
  };

  const handleEdit = () => {
    console.log("✏️ Edit mode activated");
    alert("Edit mode activated!");
  };

  const handlePublish = () => {
    console.log("📤 Publishing posts");
    alert("Publishing posts to all platforms!");
  };

  return (
    <div className="h-full-dec-hf  x-2 bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Feature Testing</h1>

        {/* View Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-md p-1 shadow-md">
            <button
              onClick={() => setView("social-manager")}
              className={`px-4 py-2.5 rounded-md font-medium transition-colors ${
                view === "social-manager"
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 hover:bg-gray-100"
              }`}
            >
              Social Media Manager
            </button>
            <button
              onClick={() => setView("post-preview")}
              className={`px-4 py-2.5 rounded-md font-medium transition-colors ${
                view === "post-preview"
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 hover:bg-gray-100"
              }`}
            >
              Post Preview
            </button>
          </div>
        </div>

        {view === "social-manager" ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Testing SocialMediaManager with selectedPlatforms
            </h2>
            <div className="mb-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Testing:</strong> SocialMediaManager should only show
                platforms: {selectedPlatforms.join(", ")}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPlatforms(["facebook", "twitter"])}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                >
                  Show Facebook + Twitter
                </button>
                <button
                  onClick={() =>
                    setSelectedPlatforms(["linkedin", "instagram"])
                  }
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                >
                  Show LinkedIn + Instagram
                </button>
                <button
                  onClick={() =>
                    setSelectedPlatforms([
                      "facebook",
                      "twitter",
                      "linkedin",
                      "instagram",
                      "tiktok",
                      "youtube",
                    ])
                  }
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                >
                  Show All
                </button>
              </div>
            </div>
            <SocialMediaManager
              userId="test-user"
              selectedPlatforms={selectedPlatforms}
              onCredentialsUpdate={() => console.log("Credentials updated")}
            />
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Testing PostPreview with Individual Regenerate Buttons
            </h2>
            <div className="mb-4 p-4 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">
                <strong>Testing:</strong> Each platform should have its own
                "Regenerate" button. Click any regenerate button to test
                individual platform regeneration.
              </p>
            </div>
            <PostPreview
              posts={samplePosts}
              onBack={handleBack}
              onEdit={handleEdit}
              onPublish={handlePublish}
              onRegeneratePlatform={handleRegeneratePlatform}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TestFeatures;
