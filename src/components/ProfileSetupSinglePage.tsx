import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Globe,
  Loader2,
  Wand2,
  File,
  Building,
  User,
  Target,
  Share2,
  Flag,
} from "lucide-react";
import API from "../services/api";
import type { ProfileFormData } from "../types/profile";
import { useAppContext } from "../context/AppContext";

const STORAGE_KEY = "profile_form_data";

// Predefined options for form fields
const businessAdjectives = [
  "Creative",
  "NextGen",
  "Dynamic",
  "Global",
  "Smart",
  "Prime",
];

const businessNouns = [
  "Solutions",
  "Studios",
  "Tech",
  "Hub",
  "Works",
  "Agency",
  "Labs",
];

const platforms = ["Instagram", "LinkedIn", "TikTok", "YouTube", "Facebook"];

const categories = [
  "Technology",
  "Lifestyle",
  "Fashion",
  "Travel",
  "Food & Beverage",
  "Finance",
  "Health & Wellness",
  "Education",
  "Entertainment",
  "Art & Design",
];

const profileFormConfig = [
  {
    id: "personalInfo",
    title: "Personal Information",
    subtext:
      "Let’s start with the basics — tell us a bit about yourself so we can personalize your experience.",
    icon: User,
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
        required: false,
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
    id: "brandSetup",
    title: "Brand Setup",
    subtext:
      "Share a link to your public profile or website — OmniShare will use it to understand your brand and audience.",
    icon: Building,
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
        placeholder: `e.g. ${businessAdjectives[0]} ${businessNouns[0]}`,
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
        name: "brandTone",
        label: "Brand Tone",
        type: "select",
        options: [
          "Professional",
          "Casual",
          "Friendly",
          "Formal",
          "Playful",
          "Innovative",
          "Trustworthy",
          "Luxurious",
        ],
        required: false,
      },
    ],
  },
  {
    id: "targetAudience",
    title: "Target Audience",
    subtext:
      "Based on your public profile, we’ll suggest an audience — you can review or update it.",
    icon: Target,
    fields: [
      {
        name: "audienceAgeRange",

        label: "Audience Age Range",
        type: "checkbox-group",
        options: ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"],
        required: false,
      },
      {
        name: "audienceGender",
        label: "Audience Gender",
        type: "radio-group",
        options: [
          "All Genders",
          "Primarily Male",
          "Primarily Female",
          "Non-Binary Focused",
        ],

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
          "Students",
          "Professionals",
          "Parents",
          "Entrepreneurs",
          "Retirees",
          "Digital Natives",
        ],
        required: false,
      },
    ],
  },
  {
    id: "content",
    title: "Content Preferences",
    subtext:
      "Tell us what kind of content you create and where you publish — OmniShare will optimize for those platforms.",
    icon: Share2,
    fields: [
      {
        name: "preferredPlatforms",
        label: "Primary Platforms",
        type: "checkbox-group",
        options: platforms,
        required: false,
      },
      {
        name: "contentCategories",
        label: "Content Categories",
        type: "tags",
        placeholder: `e.g. ${categories.slice(0, 3).join(", ")}`,
        required: false,
      },
    ],
  },
  {
    id: "goals",
    title: "Goals & Objectives",
    subtext:
      "Why do you post on social platforms? This helps OmniShare personalize your content and recommendations.",
    icon: Flag,
    fields: [
      {
        name: "primaryPurpose",
        label: "Primary Purpose of Posting",
        type: "checkbox-group",
        options: [
          "Brand Awareness",
          "Lead Generation",
          "Sales Increase",
          "Customer Engagement",
          "Community Building",
          "Thought Leadership",
        ],
        required: false,
      },
      {
        name: "keyOutcomes",
        label: "Key Outcomes Expected",
        type: "checkbox-group",
        options: [
          "Increased Followers",
          "Higher Engagement",
          "More Website Traffic",
          "Better Lead Quality",
          "Improved Brand Image",
          "Increased Sales",
        ],
        required: false,
      },
      {
        name: "postingStyle",
        label: "Posting Style Preference (optional)",
        type: "select",
        options: [
          "Professional & Formal",
          "Casual & Friendly",
          "Humorous & Light",
          "Educational & Informative",
          "Inspirational & Motivating",
          "Narrative & Storytelling",
        ],
        required: false,
      },
    ],
  },
];

const ProfileSetupSinglePage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlAnalysisLoading, setUrlAnalysisLoading] = useState(false);
  const [urlAnalysisError, setUrlAnalysisError] = useState<string | null>(null);
  const { user, updateProfile } = useAuth();
  const { setProfileEditing } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Required field validation
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name is required (minimum 2 characters)";
    }

    // Email format validation (if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone number format validation (if provided)
    if (
      formData.phoneNumber &&
      !/^[+\d\s-()]{10,}$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    // URL format validation (if provided)
    if (
      formData.publicUrl &&
      !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(
        formData.publicUrl
      )
    ) {
      newErrors.publicUrl = "Please enter a valid URL";
    }

    // Brand name validation (if provided)
    if (formData.brandName && formData.brandName.trim().length < 2) {
      newErrors.brandName = "Brand name must be at least 2 characters";
    }

    // Audience validation
    if (formData.audienceAgeRange && formData.audienceAgeRange.length === 0) {
      newErrors.audienceAgeRange = "Please select at least one age range";
    }

    if (
      formData.preferredPlatforms &&
      formData.preferredPlatforms.length === 0
    ) {
      newErrors.preferredPlatforms = "Please select at least one platform";
    }

    if (formData.primaryPurpose && formData.primaryPurpose.length === 0) {
      newErrors.primaryPurpose = "Please select at least one primary purpose";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Initialize form data state
  const [formData, setFormData] = useState<ProfileFormData>(() => {
    console.log("Initializing form data...");
    let savedData = localStorage.getItem(STORAGE_KEY);

    console.log("Saved data from localStorage:", savedData);

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        console.log("Parsed saved data:", parsed);
        return parsed;
      } catch (e) {
        console.error("Error parsing saved data:", e);
      }
    }

    const initialData: ProfileFormData = {
      fullName: user?.full_name || "",
      email: user?.email || "",
      phoneNumber: "",
      publicUrl: "",
      brandName: "",
      brandLogo: null,
      brandTone: "",
      audienceGender: "",
      audienceAgeRange: [],
      audienceRegions: [],
      audienceInterests: [],
      audienceSegments: [],
      contentCategories: [],
      preferredPlatforms: [],
      primaryPurpose: [],
      keyOutcomes: [],
      postingStyle: "",
    };
    return initialData;
  });

  // Listen for storage changes
  useEffect(() => {
    loadProfile(user.profile?.publicUrl || "");
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        console.log("Storage changed, new value:", e.newValue);
        try {
          const newData = JSON.parse(e.newValue);
          console.log("Setting form data from storage:", newData);
          setFormData(newData);
        } catch (err) {
          console.error("Error parsing storage data:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Save to localStorage when form data changes
  useEffect(() => {
    console.log("Saving form data to localStorage:", formData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Force re-render when formData changes
  useEffect(() => {
    console.log("Form data changed:", formData);
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      // Update all form inputs with current values
      const form = document.querySelector("form");
      if (form) {
        // Update text inputs, selects, and textareas
        form
          .querySelectorAll(
            'input[type="text"], input[type="email"], input[type="tel"], input[type="url"], select, textarea'
          )
          .forEach((element) => {
            const input = element as
              | HTMLInputElement
              | HTMLSelectElement
              | HTMLTextAreaElement;
            const name = input.name;
            if (name && name in formData) {
              input.value = (formData as any)[name] || "";
            }
          });

        // Update checkboxes
        form.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
          const input = checkbox as HTMLInputElement;
          const name = input.getAttribute("aria-label");
          const fieldName = input
            .closest("[data-field-name]")
            ?.getAttribute("data-field-name");
          if (
            fieldName &&
            name &&
            Array.isArray((formData as any)[fieldName])
          ) {
            input.checked = ((formData as any)[fieldName] as string[]).includes(
              name
            );
          }
        });

        // Update radio buttons
        form.querySelectorAll('input[type="radio"]').forEach((radio) => {
          const input = radio as HTMLInputElement;
          const name = input.name;
          if (name && name in formData) {
            input.checked = input.value === (formData as any)[name];
          }
        });

        // Dispatch events to trigger any listeners
        form.dispatchEvent(new Event("reset"));
        form.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
  }, [formData]);

  const handleSkip = () => {
    // if (
    //   window.confirm(
    //     "Are you sure you want to skip profile setup? You can complete it later from your settings."
    //   )
    // ) {

    //  // navigate("/content");
    // }
    localStorage.removeItem(STORAGE_KEY);
    // close the editor via context and navigate to content
    setProfileEditing(false);
  };
  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    console.log(`Setting ${field} to:`, value);
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof ProfileFormData, option: string) => {
    setFormData((prev: ProfileFormData) => {
      const currentArray = Array.isArray(prev[field])
        ? (prev[field] as string[])
        : [];
      const newArray = currentArray.includes(option)
        ? currentArray.filter((i) => i !== option)
        : [...currentArray, option];
      console.log(`Setting ${field} array to:`, newArray);
      const updatedData = { ...prev, [field]: newArray };
      return updatedData;
    });
  };

  const resetForm = () => {
    // Clear localStorage and form state
    localStorage.removeItem(STORAGE_KEY);
    const emptyForm: ProfileFormData = {
      fullName: "",
      email: "",
      phoneNumber: "",
      publicUrl: "",
      brandName: "",
      brandLogo: null,
      brandTone: "",
      audienceGender: "",
      audienceAgeRange: [],
      audienceRegions: [],
      audienceInterests: [],
      audienceSegments: [],
      preferredPlatforms: [],
      primaryPurpose: [],
      keyOutcomes: [],
      contentCategories: [],
      postingStyle: "",
    };
    setFormData(emptyForm);
  };

  const handleUrlAnalysis = async (url: string) => {
    if (!url) {
      setUrlAnalysisError("Please enter a valid URL.");
      return;
    }
    setUrlAnalysisError(null);
    setUrlAnalysisLoading(true);
    try {
      console.log("Starting URL analysis for:", url);
      const response = await API.scrapeProfileData({ url });
      console.log("Scraper response:", response);

      if (response?.data?.success && response?.data?.profile) {
        // Get the profile data from the response
        const profile = response.data.profile;
        //const profile=user.profile || {};
        console.log("Profile data:", profile);

        // Get current form data from localStorage
        const savedData = localStorage.getItem(STORAGE_KEY);
        console.log("Current localStorage data:", savedData);

        // Parse current data or use formData as fallback
        const currentData = savedData ? JSON.parse(savedData) : formData;

        // Map the scraped data exactly as it comes from the API
        const updatedData = {
          ...currentData, // Keep existing data as base

          // Map fields exactly as they come from the scraper
          fullName: profile.fullName?.trim() || currentData.fullName,
          // email: profile.email || currentData.email,
          // phoneNumber: profile.phoneNumber || currentData.phoneNumber,
          // businessName: profile.businessName || '',
          publicUrl: url,
          // brandName: profile.brandName || '',
          // brandLogo: profile.brandLogo || null,
          brandTone: profile.brandTone || "",

          // Audience fields
          audienceGender: profile.audienceGender || "",
          audienceAgeRange: profile.audienceAgeRange || [],
          audienceRegions: profile.audienceRegions || [],
          audienceInterests: profile.audienceInterests || [],
          audienceSegments: profile.audienceSegments || [],

          // Platform and content
          preferredPlatforms: profile.preferredPlatforms || [],
          contentCategories: profile.contentCategories || [],
          postingStyle: profile.postingStyle || "",

          // Purpose and outcomes
          primaryPurpose: profile.primaryPurpose || [],
          keyOutcomes: profile.keyOutcomes || [],

          // Keep posting frequency if it exists
        };

        console.log("Updated form data to save:", updatedData);

        // Update both localStorage and form state
        try {
          // Update localStorage first
          const dataToStore = JSON.stringify(updatedData);
          localStorage.setItem(STORAGE_KEY, dataToStore);

          // Verify the data was stored correctly
          const storedData = localStorage.getItem(STORAGE_KEY);
          console.log("Stored data verification:", storedData);

          if (storedData !== dataToStore) {
            console.error("Storage verification failed");
            throw new Error("Storage verification failed");
          }

          // If storage was successful, update the form state
          console.log("Storage successful, updating form state");
          setFormData(updatedData);
        } catch (error) {
          console.error("Error updating localStorage:", error);
        }

        // Force form fields to update
        requestAnimationFrame(() => {
          const form = document.querySelector("form");
          if (form) {
            form.dispatchEvent(new Event("reset"));
            form.dispatchEvent(new Event("input", { bubbles: true }));
          }
        });
        console.log("Updated form data:", formData);
      }
    } catch (err: any) {
      console.error("URL analysis failed:", err);
      setUrlAnalysisError(
        err?.response?.data?.message || "Failed to analyze URL"
      );
    } finally {
      setUrlAnalysisLoading(false);
    }
  };

  const loadProfile = async (url: string) => {
    if (!user.profile.isOnboarding) {
      //setUrlAnalysisError("Please enter a valid URL.");
      return;
    }
    try {
      // Get the profile data from the response
      // const profile = response.data.profile;

      const profile = user.profile || {};

      console.log("Profile data:", profile);

      // Get current form data from localStorage
      const savedData = localStorage.getItem(STORAGE_KEY);
      console.log("Current localStorage data:", savedData);

      // Parse current data or use formData as fallback
      const currentData = savedData ? JSON.parse(savedData) : formData;

      // Map the scraped data exactly as it comes from the API
      const updatedData = {
        ...currentData, // Keep existing data as base

        // Map fields exactly as they come from the scraper
        fullName: profile.fullName?.trim() || currentData.fullName,
        email: profile.email || currentData.email,
        phoneNumber: profile.phoneNumber || currentData.phoneNumber,
        businessName: profile.businessName || "",
        publicUrl: profile.publicUrl || "",
        brandName: profile.brandName || "",
        brandLogo: profile.brandLogo || null,
        brandTone: profile.brandTone || "",

        // Audience fields
        audienceGender: profile.audienceGender || "",
        audienceAgeRange: profile.audienceAgeRange || [],
        audienceRegions: profile.audienceRegions || [],
        audienceInterests: profile.audienceInterests || [],
        audienceSegments: profile.audienceSegments || [],

        // Platform and content
        preferredPlatforms: profile.preferredPlatforms || [],
        contentCategories: profile.contentCategories || [],
        postingStyle: profile.postingStyle || "",

        // Purpose and outcomes
        primaryPurpose: profile.primaryPurpose || [],
        keyOutcomes: profile.keyOutcomes || [],

        // Keep posting frequency if it exists
      };

      console.log("Updated form data to save:", updatedData);

      // Update both localStorage and form state
      try {
        // Update localStorage first
        const dataToStore = JSON.stringify(updatedData);
        localStorage.setItem(STORAGE_KEY, dataToStore);

        // Verify the data was stored correctly
        const storedData = localStorage.getItem(STORAGE_KEY);
        console.log("Stored data verification:", storedData);

        if (storedData !== dataToStore) {
          console.error("Storage verification failed");
          throw new Error("Storage verification failed");
        }

        // If storage was successful, update the form state
        console.log("Storage successful, updating form state");
        setFormData(updatedData);
      } catch (error) {
        console.error("Error updating localStorage:", error);
      }

      // Force form fields to update
      requestAnimationFrame(() => {
        const form = document.querySelector("form");
        if (form) {
          form.dispatchEvent(new Event("reset"));
          form.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });
      console.log("Updated form data:", formData);
    } catch (err: any) {
      console.error("Load profile failed:", err);
    } finally {
      // setUrlAnalysisLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstError}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setLoading(true);
    try {
      const submitData = { ...formData };
      const form = document.querySelector("form");
      const formD = new FormData(form as HTMLFormElement);
      const fileBase64 = await convertFileToBase64(formD.get("brandLogo"));
      submitData.brandLogo = fileBase64 as string;

      // Create a clean copy without email and optional fields
      const cleanData = {
        ...submitData,
        email: undefined,
        businessName: undefined,
      };
      delete cleanData.email;
      delete (cleanData as any).businessName;

      await API.updateProfileData(cleanData);
      localStorage.removeItem(STORAGE_KEY);
      setProfileEditing(false);
      navigate("/content");
    } catch (err) {
      console.error(err);
      // alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const convertFileToBase64 = async (file: any) => {
    return new Promise((resolve, reject) => {
      const reader: any = new FileReader();
      console.log("Converting file to base64:", reader.result);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="px-0 py-0 md:px-0">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl overflow-hidden relative">
          {/* Header */}
          <div className="theme-bg-gradient px-4 pt-6 pb-2 text-white relative">
            <h1 className="text-3xl font-bold">Complete Your Profile</h1>
            <p className="text-blue-100">
              Tell us about yourself to personalize your experience
            </p>

            <div className=" top-4 right-4 flex justify-end">
              <button
                onClick={handleSkip}
                type="button"
                className="text-sm font-medium theme-text-light underline hover:opacity-90"
              >
                Skip
              </button>
            </div>
          </div>

          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-8">
              {profileFormConfig.map((section) => {
                return (
                  <section key={section.id} className="space-y-4">
                    <div className="flex items-center space-x-3 mb-2">
                      {section.icon && (
                        <div className="theme-bg-quaternary p-2 rounded-lg">
                          {React.createElement(section.icon, {
                            className: "w-6 h-6 theme-text-secondary",
                          })}
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-semibold theme-text-secondary">
                          {section.title}
                        </h2>
                        {section.subtext && (
                          <p className="mt-1 text-sm text-gray-500">
                            {section.subtext}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.fields.map((field) => {
                        switch (field.type) {
                          case "text":
                          case "email":
                          case "tel":
                          case "url":
                            return (
                              <div key={field.name}>
                                <label className="block text-sm font-medium theme-text-primary mb-2">
                                  {field.label} {field.required && "*"}
                                </label>
                                <input
                                  type={field.type}
                                  value={(formData as any)[field.name] ?? ""}
                                  onChange={(e) =>
                                    handleInputChange(
                                      field.name as any,
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                  placeholder={field.placeholder || ""}
                                  required={field.required}
                                />
                                {field.helperText && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    {field.helperText}
                                  </p>
                                )}

                                {field.name === "publicUrl" && (
                                  <>
                                    <div className="flex items-center mt-2 gap-2">
                                      {urlAnalysisLoading ? (
                                        <div className="flex items-center gap-2 theme-text-secondary">
                                          <Loader2 className="h-5 w-5 animate-spin" />
                                          <span className="text-sm">
                                            Analyzing your URL...
                                          </span>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleUrlAnalysis(
                                              formData.publicUrl
                                            )
                                          }
                                          className="flex items-center gap-2 theme-text-secondary hover:theme-text-secondary"
                                          title="Auto-fill from URL"
                                        >
                                          <Wand2 className="h-5 w-5" />
                                          <span className="text-sm">
                                            Auto-fill from URL
                                          </span>
                                        </button>
                                      )}
                                    </div>
                                    {urlAnalysisError && (
                                      <p className="mt-2 text-sm text-red-600">
                                        {urlAnalysisError}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            );

                          case "select":
                            return (
                              <div key={field.name} className="w-full">
                                <label className="block text-sm font-medium theme-text-primary mb-2">
                                  {field.label} {field.required && "*"}
                                </label>
                                <select
                                  value={(formData as any)[field.name] ?? ""}
                                  onChange={(e) =>
                                    handleInputChange(
                                      field.name as any,
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                  required={field.required}
                                >
                                  <option value="">{`Select ${field.label}`}</option>
                                  {field.options?.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                                {field.helperText && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    {field.helperText}
                                  </p>
                                )}
                              </div>
                            );

                          case "checkbox-group":
                            return (
                              <div
                                key={field.name}
                                className="col-span-1 md:col-span-2"
                              >
                                <label className="block text-sm font-medium theme-text-primary mb-2">
                                  {field.label} {field.required && "*"}
                                </label>
                                {field.helperText && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    {field.helperText}
                                  </p>
                                )}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                  {field.options?.map((opt) => (
                                    <div
                                      key={opt}
                                      data-field-name={field.name}
                                      className={`flex items-center p-2 border-2 rounded-lg cursor-pointer ${
                                        Array.isArray(
                                          (formData as any)[field.name]
                                        ) &&
                                        (
                                          (formData as any)[
                                            field.name
                                          ] as string[]
                                        ).includes(opt)
                                          ? "theme-border-trinary theme-text-secondary"
                                          : "border-gray-200"
                                      }`}
                                      onClick={() =>
                                        handleArrayChange(
                                          field.name as any,
                                          opt
                                        )
                                      }
                                    >
                                      <input
                                        type="checkbox"
                                        checked={
                                          Array.isArray(
                                            (formData as any)[field.name]
                                          ) &&
                                          (
                                            (formData as any)[
                                              field.name
                                            ] as string[]
                                          ).includes(opt)
                                        }
                                        onChange={() =>
                                          handleArrayChange(
                                            field.name as any,
                                            opt
                                          )
                                        }
                                        className="h-4 w-4 theme-checkbox rounded mr-2"
                                        aria-label={opt}
                                      />
                                      <span className="text-sm font-medium">
                                        {opt}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );

                          case "file":
                            return (
                              <div key={field.name}>
                                <label className="block text-sm font-medium theme-text-primary mb-2">
                                  {field.label} {field.required && "*"}
                                </label>

                                <label
                                  htmlFor={`file-upload-${field.name}`}
                                  className="block cursor-pointer"
                                >
                                  <div className="mt-1 flex justify-center p-3 border-2 border-gray-300 border-dashed rounded-lg">
                                    <div className="space-y-1 justify-center text-center">
                                      {selectedFileName ? (
                                        <div className="flex items-center justify-center space-x-2">
                                          <File className="w-4 h-4 theme-text-secondary" />
                                          <span className="text-sm theme-text-secondary">
                                            {selectedFileName}
                                          </span>
                                        </div>
                                      ) : (
                                        <>
                                          <svg
                                            className="mx-auto h-6 w-6 text-gray-400"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                            aria-hidden="true"
                                          >
                                            <path
                                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                              strokeWidth={2}
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                          <div className="flex text-sm text-gray-600 justify-center">
                                            <span className="relative bg-white rounded-md font-medium theme-text-secondary">
                                              Upload a file
                                            </span>
                                          </div>
                                        </>
                                      )}

                                      <input
                                        id={`file-upload-${field.name}`}
                                        name={field.name}
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          setSelectedFileName(
                                            file ? file.name : ""
                                          );
                                          handleInputChange(
                                            field.name as any,
                                            file || null
                                          );
                                        }}
                                        className="sr-only"
                                        required={field.required}
                                      />
                                      <p className="text-xs text-gray-500">
                                        PNG, JPG, GIF up to 10MB
                                      </p>
                                    </div>
                                  </div>
                                </label>
                              </div>
                            );

                          case "radio-group":
                            return (
                              <div
                                key={field.name}
                                className="col-span-1 md:col-span-2"
                              >
                                <label className="block text-sm font-medium theme-text-primary mb-2">
                                  {field.label} {field.required && "*"}
                                </label>
                                <div className="flex flex-wrap gap-4 mt-2">
                                  {field.options?.map((opt) => (
                                    <label
                                      key={opt}
                                      className="flex items-center space-x-2 cursor-pointer"
                                    >
                                      <input
                                        type="radio"
                                        name={field.name}
                                        value={opt}
                                        checked={
                                          (formData as any)[field.name] === opt
                                        }
                                        onChange={() =>
                                          handleInputChange(
                                            field.name as any,
                                            opt
                                          )
                                        }
                                        className="h-4 w-4 theme-radio"
                                      />
                                      <span className="text-sm font-medium">
                                        {opt}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            );
                          case "tags":
                            return (
                              <div
                                key={field.name}
                                className="col-span-1 md:col-span-2"
                              >
                                <label className="block text-sm font-medium theme-text-primary mb-2">
                                  {field.label} {field.required && "*"}
                                </label>

                                <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-md px-3 py-2 min-h-[44px]">
                                  {(formData as any)[field.name]?.map(
                                    (tag: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="flex items-center theme-bg-trinary theme-text-light px-2 py-1 rounded-full text-sm"
                                      >
                                        {tag}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleInputChange(
                                              field.name as any,
                                              (formData as any)[
                                                field.name
                                              ].filter(
                                                (_: string, i: number) =>
                                                  i !== idx
                                              )
                                            )
                                          }
                                          className="ml-1 theme-text-light"
                                          title="Remove tag"
                                        >
                                          ×
                                        </button>
                                      </span>
                                    )
                                  )}

                                  <input
                                    type="text"
                                    placeholder={
                                      field.placeholder ||
                                      "Add a tag and press Space or Enter"
                                    }
                                    className="flex-grow border-none focus:ring-0 text-sm outline-none min-w-[120px]"
                                    onKeyDown={(e) => {
                                      const input =
                                        e.target as HTMLInputElement;
                                      const value = input.value.trim();

                                      // Create tag on Enter or Space
                                      if (
                                        (e.key === "Enter" || e.key === " ") &&
                                        value
                                      ) {
                                        e.preventDefault();
                                        const existing =
                                          (formData as any)[field.name] || [];
                                        const normalized = value.replace(
                                          /[^\w\s&,-]/g,
                                          ""
                                        ); // optional clean-up
                                        if (
                                          normalized &&
                                          !existing.includes(normalized)
                                        ) {
                                          handleInputChange(field.name as any, [
                                            ...existing,
                                            normalized,
                                          ]);
                                        }
                                        input.value = "";
                                      }

                                      // Handle backspace to remove last tag when input is empty
                                      if (
                                        e.key === "Backspace" &&
                                        !input.value &&
                                        (formData as any)[field.name]?.length
                                      ) {
                                        e.preventDefault();
                                        const updated = (formData as any)[
                                          field.name
                                        ].slice(0, -1);
                                        handleInputChange(
                                          field.name as any,
                                          updated
                                        );
                                      }
                                    }}
                                  />
                                </div>

                                {field.helperText && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    {field.helperText}
                                  </p>
                                )}
                              </div>
                            );

                          default:
                            return null;
                        }
                      })}
                    </div>
                  </section>
                );
              })}

              <button
                type="submit"
                disabled={loading}
                className="w-full theme-bg-gradient text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-sm"
              >
                {loading ? "Saving..." : "Complete Profile Setup"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupSinglePage;
