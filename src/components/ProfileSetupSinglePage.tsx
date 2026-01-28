"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  X,
  ArrowLeft,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import API from "../services/api";
import { useProfileFormSchema, ProfileFormData } from "./profileFormSchema";
import { useAppContext } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import { useUser } from "@/store/useUser";

const STORAGE_KEY = "profile_form_data";

// Configuration generator function
const getProfileFormConfig = (t: (key: string) => string) => {
  // Predefined options for form fields
  const businessAdjectives = [
    t("brand_creative"),
    t("brand_nextGen"),
    t("brand_dynamic"),
    t("brand_global"),
    t("brand_smart"),
    t("brand_prime"),
  ];

  const businessNouns = [
    t("suffix_solutions"),
    t("suffix_studios"),
    t("suffix_tech"),
    t("suffix_hub"),
    t("suffix_works"),
    t("suffix_agency"),
    t("suffix_labs"),
  ];

  // Social media platforms - not translated as per requirements
  const platforms = ["Instagram", "LinkedIn", "TikTok", "YouTube", "Facebook"];

  const categories = [
    t("category_technology"),
    t("category_lifestyle"),
    t("category_fashion"),
    t("category_travel"),
    t("category_food_beverage"),
    t("category_finance"),
    t("category_health_wellness"),
    t("category_education"),
    t("category_entertainment"),
    t("category_art_design"),
  ];

  const profileFormConfig = [
    {
      id: "personalInfo",
      title: t("personal_information"),
      subtext: t("profile_basics"),
      icon: User,
      fields: [
        {
          name: "fullName",
          label: t("full_name"),
          type: "text",
          placeholder: "e.g. Sarah Ahmed",
          required: true,
        },
        {
          name: "email",
          label: t("email_address"),
          type: "email",
          placeholder: "e.g. sarah@brandstudio.com",
          required: false,
        },
        {
          name: "phoneNumber",
          label: t("phone_number_optional"),
          type: "tel",
          placeholder: "e.g. +971 50 123 4567",
          required: false,
        },
      ],
    },
    {
      id: "brandSetup",
      title: t("brand_setup"),
      subtext: t("brand_setup_message"),
      icon: Building,
      fields: [
        {
          name: "publicUrl",
          label: t("public_url"),
          type: "text",
          placeholder: t("audience_type_example1"),
          required: false,
          helperText: t("brand_setup_hint"),
        },
        {
          name: "brandName",
          label: t("brand_name"),
          type: "text",
          placeholder: `e.g. ${businessAdjectives[0]} ${businessNouns[0]}`,
          required: false,
        },
        {
          name: "brandLogo",
          label: t("brand_logo"),
          type: "file",
          placeholder: t("profileFields.brandLogo.placeholder"),
          required: false,
        },
        {
          name: "brandTone",
          label: t("brand_tone"),
          type: "select",
          options: [
            t("tone_professional"),
            t("tone_casual"),
            t("tone_friendly"),
            t("tone_formal"),
            t("tone_playful"),
            t("tone_innovative"),
            t("tone_trustworthy"),
            t("tone_luxurious"),
          ],
          required: false,
        },
        {
          name: "isBrandLogo",
          label: "Brand Logo",
          type: "checkbox",
          required: false,
          helperText: t("enable_logo_for_posts"),
        },
        {
          name: "isBrandTheme",
          label: "Brand Theme ",
          type: "checkbox",
          required: false,
          helperText: t("enable_theme_colors_for_posts"),
        },
      ],
    },
    {
      id: "targetAudience",
      title: t("target_audience"),
      subtext: t("audience_message"),
      icon: Target,
      fields: [
        {
          name: "audienceAgeRange",
          label: t("audience_age_range"),
          type: "checkbox-group",
          options: ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"],
          required: false,
        },
        {
          name: "audienceGender",
          label: t("audience_gender"),
          type: "radio-group",
          options: [
            t("all_genders"),
            t("primarily_male"),
            t("primarily_female"),
            t("non_binary_focused"),
          ],
          required: false,
        },
        {
          name: "audienceRegions",
          label: t("audience_location"),
          type: "tags",
          placeholder: t("audience_location_example"),
          required: false,
        },
        {
          name: "audienceInterests",
          label: t("audience_interests"),
          type: "tags",
          placeholder: t("audience_interests_example"),
          required: false,
        },
        {
          name: "audienceSegments",
          label: t("audience_type"),
          type: "checkbox-group",
          options: [
            t("audience_segment_students"),
            t("audience_segment_professionals"),
            t("audience_segment_parents"),
            t("audience_segment_entrepreneurs"),
            t("audience_segment_retirees"),
            t("audience_segment_digital_natives"),
          ],
          required: false,
        },
      ],
    },
    {
      id: "content",
      title: t("content_preferences"),
      subtext: t("content_preferences_message"),
      icon: Share2,
      fields: [
        {
          name: "preferredPlatforms",
          label: t("primary_platforms"),
          type: "checkbox-group",
          options: platforms,
          required: false,
        },
        {
          name: "contentCategories",
          label: t("content_categories"),
          type: "tags",
          placeholder: `e.g. ${categories.slice(0, 3).join(", ")}`,
          required: false,
        },
      ],
    },
    {
      id: "goals",
      title: t("goals_objectives"),
      subtext: t("goals_message"),
      icon: Flag,
      fields: [
        {
          name: "primaryPurpose",
          label: t("primary_purpose"),
          type: "checkbox-group",
          options: [
            t("purpose_brand_awareness"),
            t("purpose_lead_generation"),
            t("purpose_sales_increase"),
            t("purpose_customer_engagement"),
            t("purpose_community_building"),
            t("purpose_thought_leadership"),
          ],
          required: false,
        },
        {
          name: "keyOutcomes",
          label: t("key_outcomes"),
          type: "checkbox-group",
          options: [
            t("outcome_followers"),
            t("outcome_engagement"),
            t("outcome_traffic"),
            t("outcome_leads"),
            t("outcome_brand_image"),
            t("outcome_sales"),
          ],
          required: false,
        },
        {
          name: "postingStyle",
          label: t("posting_style"),
          type: "select",
          options: [
            t("tone_professional_formal"),
            t("tone_casual_friendly"),
            t("tone_humorous_light"),
            t("tone_educational_informative"),
            t("tone_inspirational_motivating"),
            t("tone_narrative_storytelling"),
          ],
          required: false,
        },
      ],
    },
  ];

  return {
    profileFormConfig,
    businessAdjectives,
    businessNouns,
    platforms,
    categories,
  };
};

const ProfileSetupSinglePage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlAnalysisLoading, setUrlAnalysisLoading] = useState(false);
  const [urlAnalysisError, setUrlAnalysisError] = useState<string | null>(null);
  const { setProfileEditing, refreshUser } = useAppContext();
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const schema = useProfileFormSchema();
  const logoUrl = user?.profile?.brandLogo || "";
  const themeUrl = user?.profile?.publicUrl || "";

  const { profileFormConfig } = useMemo(() => getProfileFormConfig(t), [t]);
  const isValidUrlP = (u?: string | null) => {
    if (!u) return false;
    const s = u.trim();
    return true;
  };

  const hasLogo = isValidUrlP(logoUrl);
  const hasTheme = isValidUrlP(themeUrl);
  const getDefaultValues = (): ProfileFormData => {
    // Prefer live user profile first
    if (user?.profile) {
      const profile = user.profile;

      return {
        email: profile.email || user.email || "",
        isBrandTheme: profile.isBrandTheme || false,
        isBrandLogo: profile.isBrandLogo || false,
        fullName: profile.fullName || user.full_name || "",
        phoneNumber: profile.phoneNumber || "",
        publicUrl: profile.publicUrl || "",
        brandName: profile.brandName || "",
        brandLogo: profile.brandLogo || "",
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
    resolver: zodResolver(schema),
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
    navigate("/dashboard");
  };

  const handleArrayChange = (fieldName: string, option: string) => {
    const currentArray = (formData as any)[fieldName] || [];
    const newArray = currentArray.includes(option)
      ? currentArray.filter((i: string) => i !== option)
      : [...currentArray, option];
    setValue(fieldName as keyof ProfileFormData, newArray as any);
  };
  const isValidUrl = (url: string) => {
    if (!url) return true; // allow empty string
    if (url.trim() === "") return true; // allow empty string
    const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}.*$/;
    return urlPattern.test(url);
  };
  const checkUrlExists = async (url: string): Promise<boolean> => {
    if (!url || url.trim() === "") return true;

    try {
      const normalized = url.startsWith("http") ? url : `https://${url}`;

      const res = await fetch(normalized, {
        method: "HEAD",
        mode: "no-cors",
      });

      return true;
    } catch {
      return false;
    }
  };

  const handleUrlAnalysis = async (url: string) => {
    setUrlAnalysisError(null);
    setUrlAnalysisLoading(true);
    if (!isValidUrl(url)) {
      return;
    }

    const exists = await checkUrlExists(url);

    if (!exists) {
      setUrlAnalysisLoading(false);
      return setUrlAnalysisError("Invalid URL");
    }

    try {
      console.log("Starting URL analysis for:", url);
      const response = await API.scrapeProfileData({ url });
      console.log("Scraper response:", response);

      if (response?.data?.success && response?.data?.profile) {
        const profile = response.data.profile;
        console.log("Profile data:", profile);

        const updatedData: ProfileFormData = {
          email: formData.email,
          fullName: profile.fullName?.trim() || formData.fullName,

          phoneNumber: formData.phoneNumber,
          publicUrl: url,
          brandName: profile.brandName || formData.brandName,
          brandLogo: profile.brandLogo || formData.brandLogo,
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
    } finally {
      setUrlAnalysisLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);

    try {
      const submitData = { ...data };

      const fileBase64 = await convertFileToBase64(submitData.brandLogo);
      console.log("submitData.brandLogo ", fileBase64);
      if (fileBase64) {
        submitData.brandLogo = fileBase64 as any;
      }

      const cleanData = {
        ...submitData,
      };
      const { email, ...all } = cleanData;

      await API.updateProfileData(all);
      localStorage.removeItem(STORAGE_KEY);
      setProfileEditing(false);
      refreshUser();

      navigate("/content");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const convertFileToBase64 = async (input: any): Promise<string | null> => {
    if (!input) return null;

    if (typeof input === "string" && input.startsWith("data:image")) {
      return input;
    }

    if (typeof input === "string" && input.startsWith("http")) {
      const response = await fetch(input);
      const blob = await response.blob();
      return await blobToBase64(blob);
    }

    if (input instanceof File || input instanceof Blob) {
      return await blobToBase64(input);
    }

    return null;
  };

  const blobToBase64 = (blob: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const PROFILE_PROGRESS_FIELDS: (keyof ProfileFormData)[] = [
    "fullName",
    "phoneNumber",
    "publicUrl",
    "brandName",
    "brandLogo",
    "brandTone",
    "audienceGender",
    "audienceAgeRange",
    "audienceRegions",
    "audienceInterests",
    "audienceSegments",
    "preferredPlatforms",
    "primaryPurpose",
    "keyOutcomes",
    "contentCategories",
    "postingStyle",
  ];

  const calculateFormProgress = (data: ProfileFormData) => {
    const total = PROFILE_PROGRESS_FIELDS.length;
    let filled = 0;

    PROFILE_PROGRESS_FIELDS.forEach((key) => {
      const value = data[key];

      if (Array.isArray(value)) {
        if (value.length > 0) filled++;
      } else if (typeof value === "string") {
        if (value.trim() !== "") filled++;
      }
    });

    return Math.round((filled / total) * 100);
  };

  const getProgressTitle = (progress: number) => {
    if (progress < 30) return "Let's get started on your profile";
    if (progress < 60) return "Great progress so far";
    if (progress < 90) return "You're almost there";
    if (progress < 100) return "Just a few final details";
    return "Profile complete";
  };
  const progress = useMemo(() => calculateFormProgress(formData), [formData]);
  const getProgressColor = (progress: number) => {
    if (progress < 50) {
      const ratio = progress / 50;

      const red = 255;
      const green = Math.floor(80 + ratio * 120);
      const blue = 0;

      return `rgb(${red}, ${green}, ${blue})`;
    } else {
      const ratio = (progress - 50) / 50;

      const red = Math.floor(255 - ratio * 200);
      const green = Math.floor(200 - ratio * 40);
      const blue = 0;

      return `rgb(${red}, ${green}, ${blue})`;
    }
  };

  const publicUrl = watch("publicUrl");
  const brandLogo = watch("brandLogo");

  useEffect(() => {
    if (!publicUrl?.trim()) {
      setValue("isBrandTheme", false);
    } else {
      setValue("isBrandTheme", true);
    }
  }, [publicUrl, setValue]);

  useEffect(() => {
    if (!brandLogo) {
      setValue("isBrandLogo", false);
    } else {
      setValue("isBrandLogo", true);
    }
  }, [brandLogo, setValue]);
  return (
    <div className="bg-transparent md:px-0">
      <div className="flex flex-col md:flex-row-reverse justify-between items-between md:pb-4 pb-3">
        <div className="w-full mb-5">
          <div className="flex md:justify-between md:flex-row flex-col-reverse items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-black w-full">
              {t("complete_profile")}
            </h1>
            <button
              onClick={handleSkip}
              className="flex gap-2 top-5 text-[#7650e3] hover:text-[#6540cc] font-semibold transition-colors w-full justify-end text-sm hover:underline"
            >
              <ArrowLeft className="w-5 h-5" />
              {t("back_to_dashboard")}
            </button>
          </div>
          <p className="text-gray-500 mb-2">{t("profile_intro")}</p>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto bg-white rounded-md px-4 py-4 transition-shadow duration-300">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-semibold text-gray-900">
            {getProgressTitle(progress)}
          </h3>
          <span className="text-base font-semibold text-gray-700">
            {progress}%
          </span>
        </div>

        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out shadow-inner"
            style={{
              width: `${progress}%`,
              backgroundColor: getProgressColor(progress),
            }}
          />
        </div>

        {progress < 100 && (
          <p className="mt-4 text-sm text-gray-500 leading-relaxed">
            Complete your profile for better, personalized recommendations.
          </p>
        )}

        {progress === 100 && (
          <p className="mt-4 text-sm font-medium text-purple-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Profile completed — thank you!
          </p>
        )}
      </div>

      <div className="w-full max-w-5xl mx-auto">
        <div className="bg-transparent overflow-hidden relative">
          <div className="py-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {profileFormConfig.map((section) => (
                <section
                  key={section.id}
                  className="space-y-4 bg-gray-100 p-4 rounded-lg shadow-md"
                >
                  <div className="flex lg:items-center space-x-3 mb-2">
                    <div>
                      {section.icon && (
                        <div className="theme-bg-quaternary p-2 rounded-md">
                          {React.createElement(section.icon, {
                            className: "w-6 h-6 theme-text-secondary",
                          })}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold theme-text-secondary">
                        {section.title}
                      </h2>
                      {section.subtext && (
                        <p className="mt-1 text-sm text-gray-500 font-medium">
                          {section.subtext}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.fields.map((field) => {
                      const fieldName = field.name;
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
                                disabled={field.type === "email"}
                                {...register(fieldName)}
                                className={`w-full px-4 py-2.5 text-sm border border-purple-500 bg-gray-100 rounded-md focus:outline-none focus:border-purple-600 transition ${
                                  fieldError
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }
                                ${
                                  field.type == "email"
                                    ? "disabled text-gray-500 border-gray-300 border"
                                    : ""
                                }`}
                                placeholder={field.placeholder || ""}
                              />
                              {field.helperText && (
                                <p className="mt-1 text-sm text-gray-500 font-medium">
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
                                          {t("url_analyzing")}
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
                                        className="flex items-center gap-2 w-full md:w-fit   theme-bg-trinary text-white py-2 px-6 rounded-md text-lg font-semibold shadow-md disabled:opacity-50 border border-transparent hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] transition-colors"
                                        title="Auto-fill from URL"
                                      >
                                        <Wand2 className="h-5 w-5" />
                                        <span className="text-sm">
                                          {t("auto_fill_url")}
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
                                className={`w-full px-4 py-2.5 text-sm border border-purple-500 bg-gray-100 rounded-md focus:outline-none focus:border-purple-600 transition ${
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
                                <p className="mt-1 text-sm text-gray-500 font-medium">
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
                                <p className="mt-1 text-sm text-gray-500 font-medium">
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
                                      className={`flex items-center p-2 border rounded-md cursor-pointer ${
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
                            <div key={field.name} className="">
                              <label className="block text-sm font-medium theme-text-primary mb-2">
                                {field.label} {field.required && "*"}
                              </label>

                              <div className="mt-1 flex flex-col items-center justify-center md:p-4 p-3 border border-gray-300 border-dashed rounded-md relative overflow-hidden">
                                {formData[fieldName] ? (
                                  <div className="flex flex-col items-center space-y-2">
                                    <img
                                      src={formData[fieldName]} // URL or base64 preview
                                      alt="Uploaded logo preview"
                                      className="w-full object-cover rounded-md shadow-md border h-[150px] border-gray-200"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setValue(fieldName, "" as any);
                                        if (
                                          fileInputRef &&
                                          fileInputRef.current
                                        )
                                          fileInputRef.current.value = "";
                                      }}
                                      className="text-xs text-red-500 hover:underline"
                                    >
                                      {t("remove")}
                                    </button>
                                  </div>
                                ) : (
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
                                      {t("click_to_upload")}
                                    </span>
                                    <p className="text-xs text-gray-500 font-medium">
                                      {t("file_formats")}
                                    </p>
                                  </label>
                                )}

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
                        case "checkbox": {
                          const isChecked = watch(fieldName) as boolean;
                          const isDisabled =
                            (field.name === "isBrandTheme" &&
                              !formData.publicUrl?.trim()) ||
                            (field.name === "isBrandLogo" &&
                              !formData.brandLogo);

                          return (
                            <div key={field.name}>
                              <label
                                className={`flex items-center gap-2 p-2 border rounded-md transition-all
          ${
            isChecked && !isDisabled
              ? "theme-border-trinary theme-text-secondary"
              : "border-gray-200"
          }
          ${
            isDisabled
              ? "opacity-50 cursor-not-allowed pointer-events-none"
              : "cursor-pointer"
          }`}
                              >
                                <input
                                  type="checkbox"
                                  {...register(fieldName)}
                                  disabled={isDisabled}
                                  className="h-4 w-4 border-slate-300 rounded theme-checkbox"
                                />
                                <span className="text-sm font-medium theme-text-primary">
                                  {field.label} {field.required && "*"}
                                </span>
                              </label>

                              {fieldError && (
                                <p className="mt-1 text-sm text-red-600">
                                  {String(fieldError.message || "")}
                                </p>
                              )}
                            </div>
                          );
                        }

                        case "tags":
                          return (
                            <div
                              key={field.name}
                              className="col-span-1 md:col-span-2"
                            >
                              <label className="block text-sm font-medium theme-text-primary mb-2">
                                {field.label} {field.required && "*"}
                              </label>

                              <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-md px-3 py-2.5 min-h-[44px]">
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
                                            setValue(fieldName, updated as any);
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
                                    !formData[fieldName].length &&
                                    field.placeholder
                                  }
                                  enterKeyHint="done"
                                  className="flex-grow border-none focus:ring-0 text-sm outline-none min-w-[120px] bg-transparent"
                                  onKeyDown={(e) => {
                                    const input = e.target as HTMLInputElement;
                                    const value = input.value.trim();

                                    if (e.key === "Enter" && value) {
                                      e.preventDefault();
                                      const existing =
                                        (formData[fieldName] as string[]) || [];
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
                                  }}
                                  onPaste={(e) => {
                                    const input = e.target as HTMLInputElement;
                                    const pasted = e.clipboardData
                                      .getData("text")
                                      .trim();
                                    if (pasted) {
                                      e.preventDefault();
                                      const existing =
                                        (formData[fieldName] as string[]) || [];
                                      const newTags = pasted
                                        .split(/\s|,/)
                                        .map((v) =>
                                          v.replace(/[^\w\s&,-]/g, "")
                                        )
                                        .filter(
                                          (v) => v && !existing.includes(v)
                                        );
                                      if (newTags.length) {
                                        setValue(fieldName, [
                                          ...existing,
                                          ...newTags,
                                        ] as any);
                                      }
                                      input.value = "";
                                    }
                                  }}
                                />
                              </div>

                              {field.helperText && (
                                <p className="mt-1 text-sm text-gray-500 font-medium">
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
              ))}

              <button
                type="submit"
                disabled={loading}
                className="w-full theme-bg-trinary disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white py-2.5 px-6 rounded-md text-base font-semibold shadow-md disabled:opacity-50 border border-transparent hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] transition-colors"
              >
                {loading ? t("saving") : t("save_and_continue")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileSetupSinglePage;
