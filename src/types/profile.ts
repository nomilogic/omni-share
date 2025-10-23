export interface ProfileFormData {
  // Personal and Business Information
  fullName: string;
  email: string;
  phoneNumber: string;

  // Brand Information
  brandName: string;
  brandTone: string;
  brandLogo: File | string | null;
  publicUrl: string;

  // Audience Information
  audienceGender: string;      // Example: "Primarily Female"
  audienceAgeRange: string[];  // Example: ["13-17", "35-44"]
  audienceRegions: string[];   // Example: ["North America", "Oceania"]
  audienceInterests: string[]; // Example: ["Technology", "Fashion", "Food"]
  audienceSegments: string[];  // Example: ["Retirees"]

  // Purpose and Outcomes
  primaryPurpose: string[];    // Example: ["Thought Leadership", "Community Building"]
  keyOutcomes: string[];      // Example: ["Increased Followers", "Higher Engagement"]
  postingStyle: string;       // Example: "Narrative & Storytelling"

  // Platform and Content
  preferredPlatforms: string[];  // Example: ["LinkedIn", "Instagram", "Pinterest"]
  contentCategories: string[]; // Example: ["Health & Wellness", "Lifestyle"]

  // Additional fields (if needed by the form but not in scraper)
}

export interface SmartPrefillData {
  brandInfo: {
    brandName: string;
    brandLogo: string;
    brandTone: string;
  };
  audienceInsights: {
    audienceAgeRange: string[];
    audienceGender: string;
    audienceRegions: string[];
    audienceInterests: string[];
    audienceSegments: string[];
  };
  contentStrategy: {
    preferredPlatforms: string[];
    contentCategories: string[];
    postingStyle: string;
  };
  goalInsights: {
    primaryPurpose: string[];
    keyOutcomes: string[];
  };
}