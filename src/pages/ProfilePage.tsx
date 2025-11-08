import React, { useState, useEffect } from "react";
import {
  User,
  Edit3,
  Save,
  X,
  Camera,
  Globe,
  MapPin,
  Calendar,
  Zap,
  Target,
  Clock,
} from "lucide-react";
import { Tag } from "lucide-react";
import ProfileSetupSinglePage from "../components/ProfileSetupSinglePage";
import { useAppContext } from "../context/AppContext";
import API from "../services/api";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  website: string;
  location: string;
  avatar?: string;
  userType: "individual" | "business";
  plan: "free" | "ipro" | "business";
  createdAt: string;
  updatedAt: string;
}

export const ProfilePage: React.FC = () => {
  const { state, dispatch, setProfileEditing } = useAppContext();
  const isEditing = !!state.isProfileEditing;
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>({});

  useEffect(() => {
    if (state?.user) {
      const merged = { ...state.user, ...(state.user.profile || {}) };
      setProfile(merged);
    }
  }, [state?.user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await API.updateProfile(profile);

      const updatedProfile = await response.data.data;
      setProfile(updatedProfile);
      setProfileEditing(false);

      if (!state.hasCompletedOnboarding) {
        dispatch({ type: "SET_ONBOARDING_COMPLETE", payload: true });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile((prev: any) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  if (loading && !profile.name) {
    return (
      <div className="h-full-dec-hf  x-2 bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br p-0 w-full ">
      <div className="w-full mx-auto">
        {!isEditing && (
          <>
            <div className=" backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/80 p-0 mb-6 w-full my-10">
              <div className="flex items-center justify-between  px-4 py-6">
                <div className="flex items space-x-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profile.name || "Your Profile"}
                    </h1>
                    <p className="text-gray-600">{profile.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          state.user.wallet?.package?.tier === "business"
                            ? "bg-purple-100 text-purple-700"
                            : state.user.wallet?.package?.tier === "ipro"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-purple-600 text-white"
                        }`}
                      >
                        {String(
                          state.user.wallet?.package?.tier ||
                            profile.plan ||
                            "free"
                        ).toUpperCase()}{" "}
                        Plan
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          profile.profileType === "business" ||
                          profile.userType === "business"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {profile.profileType === "business" ||
                        profile.userType === "business"
                          ? "Business"
                          : "Creator"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setProfileEditing(true)}
                    className="flex items-center px-2 py-2 text-purple-700 text-underline rounded-md hover:bg-purple-50 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-2">
                <div className="group relative overflow-hidden rounded-md border border-border/50 bg-card/50 backdrop-blur-xl p-6 hover:border-purple/50 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center gap-4">
                    <div className="p-3 rounded-md bg-purple/20 text-purple">
                      <Zap className="w-6 h-6 theme-text-secondary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold theme-text-secondary">
                        {state.user.wallet?.coins ?? profile.coins ?? 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Coins Available
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-md border border-border/50 bg-card/50 backdrop-blur-xl p-6 hover:border-secondary/50 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center gap-4">
                    <div className="p-3 rounded-md bg-secondary/20 theme-text-secondary">
                      <Target className="w-6 h-6 theme-text-secondary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold theme-text-secondary">
                        {state.user.wallet?.package?.name || "Free"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Current Package
                      </div>
                    </div>
                  </div>
                </div>

                {
                  <div className="group relative overflow-hidden rounded-md border border-border/50 bg-card/50 backdrop-blur-xl p-6 hover:border-accent/50 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center gap-4">
                      <div className="p-3 rounded-md bg-accent/20 text-accent">
                        <Clock className="w-6 h-6 theme-text-secondary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold theme-text-secondary">
                          {state?.user?.wallet?.package?.tier == "free"
                            ? "No Expire"
                            : state.user.wallet?.expiresAt
                            ? new Date(
                                state.user.wallet.expiresAt
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "-"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Package Expires
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
              <div className=" rounded-md  mt-2 col-span-2 flex flex-col">
                <div className="flex items-center space-x-3 mb-4">
                  {profile.brandLogo ? (
                    <img
                      src={profile.brandLogo}
                      alt="brand"
                      className="w-16 h-16 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 theme-bg-trinary theme-text-light  rounded-md flex items-center justify-center">
                      <Tag className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">
                      {profile.brandName || "Not set"}
                    </div>
                    <div className="text-sm text-slate-500">
                      {profile.brandTone || "Tone not set"}
                    </div>
                    <div className="text-sm mt-2">
                      <a
                        href={profile?.publicUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 hover:underline"
                      >
                        {profile.publicUrl || "Add public URL"}
                      </a>
                    </div>
                  </div>
                </div>
                {
                  <div>
                    <label className=" text-lg font-medium theme-text-secondary mt-3 ">
                      Invite Friends for Rewards
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/auth?referralId=${state.user.id}`}
                        className="w-full px-4 py-2 border border-white/20 rounded-md theme-bg-primary theme-text-primary font-mono"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/auth?referralId=${state.user.id}`
                          );
                        }}
                        className="px-3 py-2 bg-purple-600 text-white rounded-md"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => {
                          // lazy import to avoid bundling modal everywhere
                          import("../components/InviteShare").then((m) => {
                            m.openInviteModal(
                              `${window.location.origin}/auth?referralId=${state.user.id}`,
                              {
                                title: "Invite a friend",
                                description:
                                  "Join me on OmniShare using this invite link",
                              }
                            );
                          });
                        }}
                        className="ml-2 px-3 py-2 bg-purple-600 text-white rounded-md"
                      >
                        Share
                      </button>
                    </div>
                    <p className="text-xs theme-text-light mt-1">
                      Share this link to invite others and earn rewards.
                    </p>
                  </div>
                }
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className=" rounded-md px-4">
                  <h3 className="text-2xl font-semibold text-purple-600 mb-3">
                    Audience
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-md text-black-600 font-bold mb-1 theme-bg-quant">
                        Age Ranges
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(profile.audienceAgeRange)
                          ? profile.audienceAgeRange
                          : []
                        ).map((a: string) => (
                          <span
                            key={a}
                            className="px-2 py-1 theme-bg-trinary theme-text-light  rounded-full text-sm"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-md text-black-600 font-bold mb-1">
                        Gender
                      </div>
                      <div className="px-2 py-1  bg-purple-200 text-md text-purple-700  rounded-full inline-block">
                        {profile.audienceGender || "Not set"}
                      </div>
                    </div>

                    <div>
                      <div className="text-md text-black-600 font-bold mb-1">
                        Regions
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(profile.audienceRegions)
                          ? profile.audienceRegions
                          : []
                        ).map((r: string) => (
                          <span
                            key={r}
                            className="px-2 py-1  bg-yellow-200 text-md text-purple-700  rounded-full text-sm"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-md text-black-600 font-bold mb-1">
                        Interests
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(profile.audienceInterests)
                          ? profile.audienceInterests
                          : []
                        ).map((i: string) => (
                          <span
                            key={i}
                            className="px-2 py-1  bg-red-200 text-md text-purple-700 rounded-full text-sm"
                          >
                            {i}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className=" rounded-md p-4 mt-4">
                  <h3 className="text-2xl font-semibold text-purple-600 mb-3">
                    Content & Goals
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-md text-black-600 font-bold mb-1">
                        Preferred Platforms
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(profile.preferredPlatforms)
                          ? profile.preferredPlatforms
                          : []
                        ).map((p: string) => (
                          <span
                            key={p}
                            className="px-2 py-1 bg-purple-200 rounded-full text-md text-purple-700"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-md text-black-600 font-bold mb-1">
                        Content Categories
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(profile.contentCategories)
                          ? profile.contentCategories
                          : []
                        ).map((c: string) => (
                          <span
                            key={c}
                            className="px-2 py-1 theme-bg-trinary theme-text-light  rounded-full text-sm"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-md text-black-600 font-bold mb-1">
                        Primary Purposes
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(profile.primaryPurpose)
                          ? profile.primaryPurpose
                          : []
                        ).map((g: string) => (
                          <span
                            key={g}
                            className="px-2 py-1 bg-yellow-200 text-md text-purple-700 rounded-full text-sm"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-md text-black-600 font-bold mb-1">
                        Key Outcomes
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(profile.keyOutcomes)
                          ? profile.keyOutcomes
                          : []
                        ).map((k: string) => (
                          <span
                            key={k}
                            className="px-2 py-1 bg-red-200 rounded-full text-md text-purple-700 rounded-full text-sm"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-md text-black-600 font-bold mb-1">
                        Posting Style
                      </div>
                      <div className="px-2 py-1 theme-bg-trinary theme-text-light  rounded-full inline-block">
                        {profile.postingStyle || "Not set"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {isEditing && (
          <div className="relative w-full">
            <div className="p-0 w-full">
              <ProfileSetupSinglePage />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
