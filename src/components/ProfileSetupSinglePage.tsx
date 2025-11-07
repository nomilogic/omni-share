"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Wand2,
  File,
  Building,
  User,
  Target,
  Share2,
  Flag,
} from "lucide-react";
import { FieldName, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import API from "../services/api";
import { profileFormSchema, ProfileFormData } from "./profileFormSchema";
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
      "Let's start with the basics — tell us a bit about yourself so we can personalize your experience.",
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
      "Based on your public profile, we'll suggest an audience — you can review or update it.",
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
  const { user } = useAuth();
  const { setProfileEditing, refreshUser } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");

  console.log("updateProfile", user);
  const getDefaultValues = (): ProfileFormData => {
    // Prefer live user profile first
    if (user?.profile) {
      const profile = user.profile;

      return {
        fullName: profile.fullName || user.full_name || "",
        phoneNumber: profile.phoneNumber || "",
        publicUrl: profile.publicUrl || "",
        brandName: profile.brandName || "",
        brandLogo: profile.brandLogo || null,
        brandTone: profile.brandTone || "",
        audienceGender: profile.audienceGender || "",
        audienceAgeRange: profile.audienceAgeRange || [],
        audienceRegions: profile.audienceRegions || [],
        audienceInterests: profile.audienceInterests || [],
        audienceSegments: profile.audienceSegments || [],
        preferredPlatforms: profile.preferredPlatforms || [],
        primaryPurpose: profile.primaryPurpose || [],
        keyOutcomes: profile.keyOutcomes || [],
        contentCategories: profile.contentCategories || [],
        postingStyle: profile.postingStyle || "",
      };
    }

    // Fallback to localStorage
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        return {
          ...parsed,
          audienceAgeRange: parsed.audienceAgeRange || [],
          audienceRegions: parsed.audienceRegions || [],
          audienceInterests: parsed.audienceInterests || [],
          audienceSegments: parsed.audienceSegments || [],
          contentCategories: parsed.contentCategories || [],
          preferredPlatforms: parsed.preferredPlatforms || [],
          primaryPurpose: parsed.primaryPurpose || [],
          keyOutcomes: parsed.keyOutcomes || [],
        };
      } catch (e) {
        console.error("Error parsing saved data:", e);
      }
    }

    return {
      fullName: user?.full_name || "",
      email: user?.email || "",
      phoneNumber: "",
      publicUrl: "",
      brandName: "",
      brandLogo: "",
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
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    mode: "onBlur",
    defaultValues: getDefaultValues(),
  });

  const formData = watch();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleSkip = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfileEditing(false);
    navigate("/profile");
  };

  const handleArrayChange = (fieldName: string, option: string) => {
    const currentArray = (formData as any)[fieldName] || [];
    const newArray = currentArray.includes(option)
      ? currentArray.filter((i: string) => i !== option)
      : [...currentArray, option];
    setValue(fieldName as keyof ProfileFormData, newArray as any);
  };

  const resetForm = () => {
    localStorage.removeItem(STORAGE_KEY);
    const emptyForm: ProfileFormData = {
      fullName: "",
      email: "",
      phoneNumber: "",
      publicUrl: "",
      brandName: "",
      brandLogo: "",
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
    Object.keys(emptyForm).forEach((key) => {
      setValue(key as keyof ProfileFormData, (emptyForm as any)[key]);
    });
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
        const profile = response.data.profile;
        console.log("Profile data:", profile);

        // FIX 4: Ensure arrays are never undefined
        const updatedData: ProfileFormData = {
          fullName: profile.fullName?.trim() || formData.fullName,
          phoneNumber: formData.phoneNumber,
          publicUrl: url,
          brandName: formData.brandName,
          brandLogo: formData.brandLogo,
          brandTone: profile.brandTone || formData.brandTone,
          audienceGender: profile.audienceGender || formData.audienceGender,
          audienceAgeRange:
            profile.audienceAgeRange || formData.audienceAgeRange || [],
          audienceRegions:
            profile.audienceRegions || formData.audienceRegions || [],
          audienceInterests:
            profile.audienceInterests || formData.audienceInterests || [],
          audienceSegments:
            profile.audienceSegments || formData.audienceSegments || [],
          preferredPlatforms:
            profile.preferredPlatforms || formData.preferredPlatforms || [],
          contentCategories:
            profile.contentCategories || formData.contentCategories || [],
          postingStyle: profile.postingStyle || formData.postingStyle,
          primaryPurpose:
            profile.primaryPurpose || formData.primaryPurpose || [],
          keyOutcomes: profile.keyOutcomes || formData.keyOutcomes || [],
        };

        Object.keys(updatedData).forEach((key) => {
          setValue(key as keyof ProfileFormData, (updatedData as any)[key]);
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
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

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      const submitData = { ...data };
      const form = document.querySelector("form");
      const formD = new FormData(form as HTMLFormElement);
      const fileBase64 = await convertFileToBase64(formD.get("brandLogo"));
      if (fileBase64) {
        submitData.brandLogo = fileBase64 as any;
      }

      const cleanData = {
        ...submitData,
      };

      await API.updateProfileData(cleanData);
      localStorage.removeItem(STORAGE_KEY);
      setProfileEditing(false);
      refreshUser();

      navigate("/content");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const convertFileToBase64 = async (file: any) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  return (
    <div className="px-0 py-0 md:px-0 bg-transparent">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl overflow-hidden relative">
          {/* Header */}
          <div className="theme-bg-gradient px-4 pt-6 pb-2 text-white relative">
            <h1 className="text-3xl font-bold">Complete Your Profile</h1>
            <p className="text-blue-100">
              Tell us about yourself to personalize your experience
            </p>

            <div className="top-4 right-4 flex justify-end">
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                        const fieldName = field.name as FieldName;
                        const fieldError = errors[fieldName];

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
                                  {...register(fieldName)}
                                  className={`w-full px-3 py-2 border rounded-md ${
                                    fieldError
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  }`}
                                  placeholder={field.placeholder || ""}
                                />
                                {field.helperText && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    {field.helperText}
                                  </p>
                                )}

                                {fieldError && (
                                  <p className="mt-1 text-sm text-red-600">
                                    {String(fieldError.message || "")}
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
                                              formData.publicUrl || ""
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
                                  {...register(fieldName)}
                                  className={`w-full px-3 py-2 border rounded-md ${
                                    fieldError
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  }`}
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
                                {fieldError && (
                                  <p className="mt-1 text-sm text-red-600">
                                    {String(fieldError.message || "")}
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
                                  {field.options?.map((opt) => {
                                    const fieldValue = formData[fieldName];
                                    const isChecked =
                                      Array.isArray(fieldValue) &&
                                      fieldValue.includes(opt);

                                    return (
                                      <div
                                        key={opt}
                                        data-field-name={field.name}
                                        className={`flex items-center p-2 border-2 rounded-lg cursor-pointer ${
                                          isChecked
                                            ? "theme-border-trinary theme-text-secondary"
                                            : "border-gray-200"
                                        }`}
                                        onClick={() =>
                                          handleArrayChange(field.name, opt)
                                        }
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() =>
                                            handleArrayChange(field.name, opt)
                                          }
                                          className="h-4 w-4 theme-checkbox rounded mr-2"
                                          aria-label={opt}
                                        />
                                        <span className="text-sm font-medium">
                                          {opt}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                                {fieldError && (
                                  <p className="mt-2 text-sm text-red-600">
                                    {String(fieldError.message || "")}
                                  </p>
                                )}
                              </div>
                            );

                          case "file":
                            return (
                              <div key={field.name}>
                                <label className="block text-sm font-medium theme-text-primary mb-2">
                                  {field.label} {field.required && "*"}
                                </label>

                                <div className="mt-1 flex flex-col items-center justify-center p-4 border-2 border-gray-300 border-dashed rounded-lg relative overflow-hidden">
                                  {/* Preview if exists */}
                                  {formData[fieldName] ? (
                                    <div className="flex flex-col items-center space-y-2">
                                      <img
                                        src={formData[fieldName]} // URL or base64 preview
                                        alt="Uploaded logo preview"
                                        className="w-full h-full object-cover rounded-md shadow-md border border-gray-200"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setValue(fieldName, null as any);
                                          setSelectedFileName("");
                                        }}
                                        className="text-xs text-red-500 hover:underline"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ) : (
                                    // Placeholder
                                    <label
                                      htmlFor={`file-upload-${field.name}`}
                                      className="flex flex-col items-center justify-center cursor-pointer"
                                    >
                                      <svg
                                        className="mx-auto h-8 w-8 text-gray-400"
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
                                      <span className="mt-2 text-sm theme-text-secondary">
                                        Click to upload
                                      </span>
                                      <p className="text-xs text-gray-500">
                                        PNG, JPG, GIF up to 10MB
                                      </p>
                                    </label>
                                  )}

                                  {/* Hidden file input */}
                                  <input
                                    id={`file-upload-${field.name}`}
                                    {...register(fieldName)}
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;

                                      setSelectedFileName(file.name);

                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        const base64String =
                                          reader.result as string;
                                        setValue(fieldName, base64String); // set base64 preview
                                      };
                                      reader.readAsDataURL(file);
                                    }}
                                  />
                                </div>

                                {fieldError && (
                                  <p className="mt-2 text-sm text-red-600">
                                    {String(fieldError.message || "")}
                                  </p>
                                )}
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
                                        {...register(fieldName)}
                                        value={opt}
                                        className="h-4 w-4 theme-radio"
                                      />
                                      <span className="text-sm font-medium">
                                        {opt}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                                {fieldError && (
                                  <p className="mt-2 text-sm text-red-600">
                                    {String(fieldError.message || "")}
                                  </p>
                                )}
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
                                  {Array.isArray(formData[fieldName]) &&
                                    (formData[fieldName] as string[]).map(
                                      (tag: string, idx: number) => (
                                        <span
                                          key={idx}
                                          className="flex items-center theme-bg-trinary theme-text-light px-2 py-1 rounded-full text-sm"
                                        >
                                          {tag}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const current = formData[
                                                fieldName
                                              ] as string[];
                                              const updated = current.filter(
                                                (_: string, i: number) =>
                                                  i !== idx
                                              );
                                              setValue(
                                                fieldName,
                                                updated as any
                                              );
                                            }}
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

                                      if (
                                        (e.key === "Enter" || e.key === " ") &&
                                        value
                                      ) {
                                        e.preventDefault();
                                        const existing =
                                          (formData[fieldName] as string[]) ||
                                          [];
                                        const normalized = value.replace(
                                          /[^\w\s&,-]/g,
                                          ""
                                        );
                                        if (
                                          normalized &&
                                          !existing.includes(normalized)
                                        ) {
                                          setValue(fieldName, [
                                            ...existing,
                                            normalized,
                                          ] as any);
                                        }
                                        input.value = "";
                                      }

                                      if (
                                        e.key === "Backspace" &&
                                        !input.value &&
                                        Array.isArray(formData[fieldName]) &&
                                        (formData[fieldName] as string[]).length
                                      ) {
                                        e.preventDefault();
                                        const current = formData[
                                          fieldName
                                        ] as string[];
                                        const updated = current.slice(0, -1);
                                        setValue(fieldName, updated as any);
                                      }
                                    }}
                                  />
                                </div>

                                {field.helperText && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    {field.helperText}
                                  </p>
                                )}
                                {fieldError && (
                                  <p className="mt-2 text-sm text-red-600">
                                    {String(fieldError.message || "")}
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
                className="w-full theme-bg-gradient disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-sm disabled:opacity-50"
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
