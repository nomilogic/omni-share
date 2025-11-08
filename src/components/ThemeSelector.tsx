// ...existing code...

// Add or replace the profileFormConfig used by the form.
// This configuration includes section titles and the exact subtexts/helper text from the specification.
const profileFormConfig = [
  {
    id: "personal",
    title: "SECTION 1: Personal Information",
    subtext:
      "Let’s start with the basics — tell us a bit about yourself so we can personalize your experience.",
    fields: [
      {
        name: "fullName",
        label: "Full Name",
        type: "text",
        placeholder: "e.g. Sarah Ahmed",
        required: true,
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "e.g. sarah@brandstudio.com",
        required: true,
      },
      {
        name: "phoneNumber",
        label: "Phone Number (optional)",
        type: "tel",
        placeholder: "e.g. +971 50 123 4567",
        required: false,
      },
    ],
  },
  {
    id: "brand",
    title: "SECTION 2: Brand Setup",
    subtext:
      "Share a link to your public profile or website — OmniShare will use it to understand your brand and audience.",
    fields: [
      {
        name: "publicUrl",
        label: "Public URL (Website or Social Link)",
        type: "url",
        placeholder:
          "e.g. https://instagram.com/brandstudio or https://yourbrand.com",
        required: false,
        helperText:
          "You can add a website, Instagram, LinkedIn, TikTok, Behance, YouTube, or any other public link.",
      },
      {
        name: "brandName",
        label: "Brand Name",
        type: "text",
        placeholder: "e.g. Brand Studio",
        required: false,
      },
      {
        name: "brandLogo",
        label: "Brand Logo / Profile Image",
        type: "file",
        placeholder: "Upload or confirm your logo/profile image",
        required: false,
      },
      {
        name: "tone",
        label: "Brand Tone",
        type: "select",
        options: ["Professional", "Playful", "Inspirational", "Casual"],
        placeholder: "Professional / Playful / Inspirational / Casual",
        required: false,
      },
    ],
  },
  {
    id: "audience",
    title: "Target Audience",
    subtext:
      "Based on your public profile, we’ll suggest an audience — you can review or update it.",
    fields: [
      {
        name: "audienceAgeRange",
        label: "Audience Age Range",
        type: "checkbox-group",
        options: ["18–24", "25–34", "35–44", "45–54", "55+"],
        required: false,
      },
      {
        name: "audienceGender",
        label: "Audience Gender",
        type: "radio",
        options: ["Male", "Female", "All", "Prefer not to say"],
        required: false,
      },
      {
        name: "audienceRegions",
        label: "Audience Location / Region",
        type: "tags",
        placeholder: "e.g. UAE, Saudi Arabia, Germany, United Kingdom, Global",
        required: false,
      },
      {
        name: "audienceInterests",
        label: "Audience Interests / Industry",
        type: "tags",
        placeholder: "e.g. Technology, Fashion, Travel, Food",
        required: false,
      },
      {
        name: "audienceSegments",
        label: "Audience Type / Segment",
        type: "checkbox-group",
        options: [
          "Professionals",
          "Students",
          "Entrepreneurs",
          "Families",
          "Influencers",
        ],
        required: false,
      },
    ],
  },
  {
    id: "content",
    title: "SECTION 3: Content Preferences",
    subtext:
      "Tell us what kind of content you create and where you publish — OmniShare will optimize for those platforms.",
    fields: [
      {
        name: "preferredPlatforms",
        label: "Primary Platforms",
        type: "checkbox-group",
        options: [
          "Instagram",
          "LinkedIn",
          "TikTok",
          "YouTube",
          "Facebook",
          "Pinterest",
        ],
        required: false,
      },
      {
        name: "contentCategories",
        label: "Content Categories",
        type: "tags",
        placeholder:
          "e.g. Technology, Lifestyle, Fashion, Travel, Food & Beverage",
        required: false,
      },
    ],
  },
  {
    id: "goals",
    title: "SECTION 4: Goals & Objectives",
    subtext:
      "Why do you post on social platforms? This helps OmniShare personalize your content and recommendations.",
    fields: [
      {
        name: "socialGoals",
        label: "Primary Purpose of Posting",
        type: "checkbox-group",
        options: [
          "Build personal brand",
          "Promote business",
          "Share expertise",
          "Showcase work",
          "Sell products/services",
          "Stay connected",
        ],
        required: false,
      },
      {
        name: "keyOutcomes",
        label: "Key Outcomes Expected",
        type: "checkbox-group",
        options: [
          "Increase followers",
          "Drive website traffic",
          "Generate leads/sales",
          "Boost engagement",
          "Build community",
          "Gain credibility",
        ],
        required: false,
      },
      {
        name: "postingStyle",
        label: "Posting Style Preference (optional)",
        type: "select",
        options: [
          "Informative",
          "Entertaining",
          "Inspirational",
          "Conversational",
          "Mixed",
        ],
        required: false,
      },
    ],
  },
];

// ...existing code...import React from "react";
import { Palette, Check } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { themes } from "../lib/theme";

export const ThemeSelector: React.FC = () => {
  const { currentTheme, changeTheme, availableThemes, currentThemeKey } =
    useTheme();

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2  px-0 py-0 rounded-md transition-colors theme-bg-card ">
        <div
          className={`w-4 h-4 border border-white rounded-full bg-gradient-to-r ${currentTheme.bgGradient}`}
        ></div>
        {/* <Palette className="w-5 h-5 theme-text-primary" /> */}
        <span className=" hidden theme-text-primary font-medium">
          {currentTheme.name}
        </span>
      </button>

      <div className="absolute top-full right-0 mt-2 w-72 theme-bg-card rounded-md shadow-2xl opacity-50 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        <div className="p-4">
          <h3 className="theme-text-primary font-semibold mb-3 theme-bg-card p-2 rounded-md">
            Choose App Theme
          </h3>
          <div className="grid grid-cols-1 gap-2 theme-bg-card ">
            {availableThemes.map((theme) => (
              <button
                key={theme.key}
                onClick={() => changeTheme(theme.key)}
                className={`flex items-center justify-between p-3 rounded-md transition-colors hover:theme-bg-primary group ${
                  currentThemeKey === theme.key ? "theme-bg-primary" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.bgGradient}`}
                  ></div>
                  <span className="theme-text-primary font-medium">
                    {theme.name}
                  </span>
                </div>
                {currentThemeKey === theme.key && (
                  <Check className="w-4 h-4 theme-text-primary" />
                )}
              </button>
            ))}
          </div>
          <div className="mt-3 p-2 theme-bg-primary rounded-md">
            <p className="text-xs theme-text-light">
              Themes are based on the onboarding carousel color schemes. Changes
              apply instantly across the entire app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
