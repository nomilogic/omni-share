import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Form data types matching Profile schema
interface FormData {
  // Section 1: Personal Information
  fullName: string;
  email: string;
  phoneNumber?: string;  // optional

  // Section 2: Brand Setup
  publicUrl: string;
  brandName: string;
  brandLogo: string | null;
  brandTone: string;

  // Target Audience
  audienceAgeRange: string[];
  audienceGender: string;
  audienceRegions: string[];
  audienceInterests: string[];
  audienceSegments: string[];

  // Section 3: Content Preferences
  primaryPlatforms: string[];
  contentCategories: string[];

  // Section 4: Goals & Objectives
  primaryPurpose: string[];
  keyOutcomes: string[];
  postingStyle?: string;  // optional
}

// Smart prefill data structure from AI analysis
interface SmartPrefillData {
  // Brand Identity (auto-detected from URL)
  brandInfo: {
    brandName: string;
    brandLogo: string;
    brandTone: string;
  };

  // Audience Analysis (from social profile/website)
  audienceInsights: {
    audienceAgeRange: string[];
    audienceGender: string;
    audienceRegions: string[];
    audienceInterests: string[];
    audienceSegments: string[];
  };

  // Content & Platform Analysis
  contentStrategy: {
    primaryPlatforms: string[];
    contentCategories: string[];
    postingStyle: string;
  };

  // Goals Detection (from bio/content analysis)
  goalInsights: {
    primaryPurpose: string[];
    keyOutcomes: string[];
  };
}

// Example AI response format
const EXAMPLE_AI_RESPONSE = {
  brandInfo: {
    brandName: "Tech Innovators",
    brandLogo: "https://example.com/logo.png",
    brandTone: "Professional"
  },
  audienceInsights: {
    audienceAgeRange: ["25-34", "35-44"],
    audienceGender: "All",
    audienceRegions: ["UAE", "Saudi Arabia"],
    audienceInterests: ["Technology", "Innovation"],
    audienceSegments: ["Professionals", "Entrepreneurs"]
  },
  contentStrategy: {
    primaryPlatforms: ["LinkedIn", "Instagram", "Twitter"],
    contentCategories: ["Technology", "Business"],
    postingStyle: "Informative"
  },
  goalInsights: {
    primaryPurpose: ["Build personal brand", "Share expertise"],
    keyOutcomes: ["Generate leads/sales", "Build community"]
  }
};

// Form section configuration type
interface Section {
  title: string;
  subtext: string;
  helperText?: string;
}

// Form section configuration
const SECTIONS: Section[] = [
  {
    title: "Personal Information",
    subtext: "Let's start with the basics — tell us a bit about yourself so we can personalize your experience."
  },
  {
    title: "Brand Setup",
    subtext: "Share a link to your public profile or website — OmniShare will use it to understand your brand and audience.",
    helperText: "You can add a website, Instagram, LinkedIn, TikTok, Behance, YouTube, or any other public link."
  },
  {
    title: "Target Audience",
    subtext: "Based on your public profile, we'll suggest an audience — you can review or update it."
  },
  {
    title: "Content Preferences",
    subtext: "Tell us what kind of content you create and where you publish — OmniShare will optimize for those platforms."
  },
  {
    title: "Goals & Objectives",
    subtext: "Why do you post on social platforms? This helps OmniShare personalize your content and recommendations."
  }
];

// Form options constants
// Brand & Tone Options
const BRAND_TONES = ["Professional", "Playful", "Inspirational", "Casual"];

// Audience Options
const AGE_RANGES = ["18-24", "25-34", "35-44", "45-54", "55+"];
const GENDER_OPTIONS = ["Male", "Female", "All", "Prefer not to say"];
const AUDIENCE_SEGMENTS = ["Professionals", "Students", "Entrepreneurs", "Families", "Influencers"];

// Content & Platform Options
const PRIMARY_PLATFORMS = ["Instagram", "LinkedIn", "TikTok", "YouTube", "Facebook", "Pinterest"];
const CONTENT_CATEGORIES = ["Technology", "Lifestyle", "Fashion", "Travel", "Food & Beverage", "Business", "Education", "Entertainment", "Health & Wellness", "Sports"];
const POSTING_STYLES = ["Informative", "Entertaining", "Inspirational", "Conversational", "Mixed"];

// Goals and Outcomes
const PRIMARY_PURPOSES = [
  "Build personal brand",
  "Promote business", 
  "Share expertise",
  "Showcase work",
  "Sell products/services",
  "Stay connected"
];
const KEY_OUTCOMES = [
  "Increase followers",
  "Drive website traffic", 
  "Generate leads/sales",
  "Boost engagement",
  "Build community",
  "Gain credibility"
];

// Form options constants
// Form options constants - defining them once
const SOCIAL_GOALS = [
  "Build personal brand",
  "Promote business",
  "Share expertise",
  "Showcase work", 
  "Sell products/services",
  "Stay connected"
];



// Constants for form sections and options
const FORM_SECTIONS: Section[] = [
  {
    title: "Personal Information",
    subtext: "Let's start with the basics — tell us a bit about yourself so we can personalize your experience."
  },
  {
    title: "Brand Setup",
    subtext: "Share a link to your public profile or website — OmniShare will use it to understand your brand and audience.",
    helperText: "You can add a website, Instagram, LinkedIn, TikTok, Behance, YouTube, or any other public link."
  },
  {
    title: "Target Audience",
    subtext: "Based on your public profile, we'll suggest an audience — you can review or update it."
  },
  {
    title: "Content Preferences",
    subtext: "Tell us what kind of content you create and where you publish — OmniShare will optimize for those platforms."
  },
  {
    title: "Goals & Objectives",
    subtext: "Why do you post on social platforms? This helps OmniShare personalize your content and recommendations."
  }
];

const OnboardingForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    // Section 1: Personal Information
    fullName: '',
    email: '',
    phoneNumber: '',

    // Section 2: Brand Setup
    publicUrl: '',
    brandName: '',
    brandLogo: null,
    brandTone: '',

    // Target Audience
    audienceAgeRange: [],
    audienceGender: '',
    audienceRegions: [],
    audienceInterests: [],
    audienceSegments: [],

    // Section 3: Content Preferences
    primaryPlatforms: [],
    contentCategories: [],

    // Section 4: Goals & Objectives
    primaryPurpose: [],
    keyOutcomes: [],
    postingStyle: ''
  });

  // Smart prefill logic

  // Smart prefill logic
  const handleUrlAnalysis = async (url: string) => {
    setIsLoading(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // This would be an API call to the AI service in production
      const smartData: SmartPrefillData = EXAMPLE_AI_RESPONSE;

      // Update form data with AI insights
      setFormData(prev => ({
        ...prev,
        // Brand Setup
        brandName: smartData.brandInfo.brandName,
        brandLogo: smartData.brandInfo.brandLogo,
        brandTone: smartData.brandInfo.brandTone,

        // Audience Targeting
        audienceAgeRange: smartData.audienceInsights.audienceAgeRange,
        audienceGender: smartData.audienceInsights.audienceGender,
        audienceRegions: smartData.audienceInsights.audienceRegions,
        audienceInterests: smartData.audienceInsights.audienceInterests,
        audienceSegments: smartData.audienceInsights.audienceSegments,

        // Content Preferences
        primaryPlatforms: smartData.contentStrategy.primaryPlatforms,
        contentCategories: smartData.contentStrategy.contentCategories,
        postingStyle: smartData.contentStrategy.postingStyle,

        // Goals & Objectives
        primaryPurpose: smartData.goalInsights.primaryPurpose,
        keyOutcomes: smartData.goalInsights.keyOutcomes
      }));

      // Show success message with details
      alert('Successfully analyzed your profile!\n\nWe detected:\n' +
        `• Brand: ${smartData.brandInfo.brandName}\n` +
        `• Brand Tone: ${smartData.brandInfo.brandTone}\n` +
        `• Main Platform: ${smartData.contentStrategy.primaryPlatforms[0]}\n` +
        `• Audience: ${smartData.audienceInsights.audienceSegments.join(', ')}\n\n` +
        'Please review the pre-filled information and adjust if needed.');
    } catch (error) {
      console.error('Error analyzing URL:', error);
      alert('Could not analyze the URL. Please fill in the information manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const arrayField = formData[name as keyof FormData] as string[];
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
          ? [...arrayField, value]
          : arrayField.filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Trigger URL analysis when public URL is entered
    if (name === 'publicUrl' && value) {
      handleUrlAnalysis(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    // Navigate to next step or dashboard
    navigate('/dashboard');
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Personal Information</h2>
      <p className="text-gray-600">Let's start with the basics — tell us a bit about yourself so we can personalize your experience.</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="e.g. Sarah Ahmed"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="e.g. sarah@brandstudio.com"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number (optional)</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="e.g. +971 50 123 4567"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{FORM_SECTIONS[1].title}</h2>
      <p className="text-gray-600">{FORM_SECTIONS[1].subtext}</p>
      <p className="text-sm text-gray-500">You can add a website, Instagram, LinkedIn, TikTok, Behance, YouTube, or any other public link.</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Public URL</label>
          <input
            type="url"
            name="publicUrl"
            value={formData.publicUrl}
            onChange={handleInputChange}
            placeholder="e.g. https://instagram.com/brandstudio or https://yourbrand.com"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {isLoading && (
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-blue-700 font-semibold">🧠 OmniShare AI is learning from your link...</h3>
            <p className="text-blue-600">We're gathering your brand insights, tone, and audience details — your form will be pre-filled for you to review. ✨</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Brand Name</label>
          <input
            type="text"
            name="brandName"
            value={formData.brandName}
            onChange={handleInputChange}
            placeholder="e.g. Brand Studio"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Brand Logo / Profile Image</label>
          <div className="mt-1 flex items-center">
            <input
              type="file"
              name="brandLogo"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const imageUrl = e.target?.result as string;
                    setFormData(prev => ({ ...prev, brandLogo: imageUrl }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Brand Tone</label>
          <select
            name="brandTone"
            value={formData.brandTone}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select tone</option>
            {BRAND_TONES.map(tone => (
              <option key={tone} value={tone}>{tone}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{FORM_SECTIONS[2].title}</h2>
      <p className="text-gray-600">{FORM_SECTIONS[2].subtext}</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Audience Age Range</label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AGE_RANGES.map(age => (
              <label key={age} className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="audienceAge"
                  value={age}
                  checked={formData.audienceAgeRange.includes(age)}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">{age}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Audience Gender</label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {GENDER_OPTIONS.map(gender => (
              <label key={gender} className="inline-flex items-center">
                <input
                  type="radio"
                  name="audienceGender"
                  value={gender}
                  checked={formData.audienceGender === gender}
                  onChange={handleInputChange}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">{gender}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Audience Location / Region</label>
          <select
            multiple
            name="audienceLocation"
            value={formData.audienceRegions}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
              setFormData(prev => ({ ...prev, audienceRegions: selected }));
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="UAE">UAE</option>
            <option value="Saudi Arabia">Saudi Arabia</option>
            <option value="Germany">Germany</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Global">Global</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Audience Type / Segment</label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AUDIENCE_SEGMENTS.map((segment: string) => (
              <label key={segment} className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="audienceSegments"
                  value={segment}
                  checked={formData.audienceSegments.includes(segment)}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">{segment}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <>
      {/* Content Preferences */}
      <div className="space-y-6 mb-12">
        <h2 className="text-2xl font-bold">{FORM_SECTIONS[3].title}</h2>
        <p className="text-gray-600">{FORM_SECTIONS[3].subtext}</p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Primary Platforms</label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PRIMARY_PLATFORMS.map((platform: string) => (
                <label key={platform} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="primaryPlatforms"
                    value={platform}
                    checked={formData.primaryPlatforms.includes(platform)}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Content Categories</label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CONTENT_CATEGORIES.map(category => (
                <label key={category} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="contentCategories"
                    value={category}
                    checked={formData.contentCategories.includes(category)}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{category}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Goals & Objectives */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{FORM_SECTIONS[4].title}</h2>
        <p className="text-gray-600">{FORM_SECTIONS[4].subtext}</p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Primary Purpose of Posting</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {PRIMARY_PURPOSES.map((goal: string) => (
                <label key={goal} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="primaryPurpose"
                    value={goal}
                    checked={formData.primaryPurpose.includes(goal)}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{goal}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Key Outcomes Expected</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {KEY_OUTCOMES.map(outcome => (
                <label key={outcome} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="keyOutcomes"
                    value={outcome}
                    checked={formData.keyOutcomes.includes(outcome)}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{outcome}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Posting Style Preference</label>
            <select
              name="postingStyle"
              value={formData.postingStyle}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select style</option>
              {POSTING_STYLES.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <form onSubmit={handleSubmit} className="space-y-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        <div className="flex justify-between pt-6">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
          )}
          
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="ml-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="ml-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Complete Setup
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default OnboardingForm;