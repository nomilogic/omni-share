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
  const { state, dispatch } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>({});

  useEffect(() => {
    if (state?.user) {
      const merged = { ...state.user, ...(state.user.profile || {}) };
      setProfile(merged);
    }
  }, [state?.user]);
  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await API.getProfile();
      if (res?.data?.data) {
        const apiProfile = res.data.data;
        const merged = { ...state.user, ...(state.user?.profile || {}), ...apiProfile };
        setProfile(merged);
        dispatch({ type: "SET_SELECTED_PROFILE", payload: apiProfile });
      }
    } catch (err) {
      console.debug("Profile load failed, using available user state", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await API.updateProfile(profile);

      const updatedProfile = await response.data.data;
      setProfile(updatedProfile);
      setIsEditing(false);

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
      <div className="h-full-dec-hf  x-2 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="  x-2 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="w-full mx-auto">
        {!isEditing && (
          <>
            {/* Header */}
            <div className="/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-white" />
                      )}
                    </div>
                    <button className="absolute -bottom-1 -right-1  rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{profile.name || "Your Profile"}</h1>
                    <p className="text-gray-600">{profile.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${profile.wallet?.package?.tier === "business" ? "bg-purple-100 text-purple-700" : profile.wallet?.package?.tier === "ipro" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                        {String(profile.wallet?.package?.tier || profile.plan || "free").toUpperCase()} Plan
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${profile.profileType === "business" || profile.userType === "business" ? "bg-indigo-100 text-indigo-700" : "bg-teal-100 text-teal-700"}`}>
                        {(profile.profileType === "business" || profile.userType === "business") ? "Business" : "Creator"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setIsEditing(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <div className=" rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">About</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.fullName || profile.name || profile.brandName || "Not set"}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2"><MapPin className="w-4 h-4 inline mr-1" />Location</label>
                      <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.location || profile.profileLocation || "Not set"}</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio / Description</label>
                      <p className="px-4 py-2 bg-gray-50 rounded-lg min-h-[80px]">{profile.profileDescription || profile.bio || profile.brandDescription || "Not set"}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2"><Globe className="w-4 h-4 inline mr-1" />Public URL</label>
                      <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.publicUrl ? (<a href={profile.publicUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{profile.publicUrl}</a>) : ("Not set")}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brand Tone</label>
                      <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.brandTone || "Not set"}</p>
                    </div>
                  </div>
                </div>

                <div className=" rounded-lg p-4 mt-4">
                  <h3 className="text-lg font-semibold mb-3">Audience</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Age Ranges</div>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(profile.audienceAgeRange) ? profile.audienceAgeRange : []).map((a: string) => (
                          <span key={a} className="px-2 py-1 bg-gray-100 rounded-full text-sm">{a}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Gender</div>
                      <div className="px-2 py-1 bg-gray-100 rounded-full inline-block">{profile.audienceGender || "Not set"}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Regions</div>
                      <div className="flex flex-wrap gap-2">{(Array.isArray(profile.audienceRegions) ? profile.audienceRegions : []).map((r: string) => (<span key={r} className="px-2 py-1 bg-gray-100 rounded-full text-sm">{r}</span>))}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Interests</div>
                      <div className="flex flex-wrap gap-2">{(Array.isArray(profile.audienceInterests) ? profile.audienceInterests : []).map((i: string) => (<span key={i} className="px-2 py-1 bg-gray-100 rounded-full text-sm">{i}</span>))}</div>
                    </div>
                  </div>
                </div>

                <div className=" rounded-lg p-4 mt-4">
                  <h3 className="text-lg font-semibold mb-3">Content & Goals</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Preferred Platforms</div>
                      <div className="flex flex-wrap gap-2">{(Array.isArray(profile.preferredPlatforms) ? profile.preferredPlatforms : []).map((p: string) => (<span key={p} className="px-2 py-1 bg-blue-50 rounded-full text-sm">{p}</span>))}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Content Categories</div>
                      <div className="flex flex-wrap gap-2">{(Array.isArray(profile.contentCategories) ? profile.contentCategories : []).map((c: string) => (<span key={c} className="px-2 py-1 bg-gray-100 rounded-full text-sm">{c}</span>))}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Primary Purposes</div>
                      <div className="flex flex-wrap gap-2">{(Array.isArray(profile.primaryPurpose) ? profile.primaryPurpose : []).map((g: string) => (<span key={g} className="px-2 py-1 bg-green-50 rounded-full text-sm">{g}</span>))}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Key Outcomes</div>
                      <div className="flex flex-wrap gap-2">{(Array.isArray(profile.keyOutcomes) ? profile.keyOutcomes : []).map((k: string) => (<span key={k} className="px-2 py-1 bg-yellow-50 rounded-full text-sm">{k}</span>))}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Posting Style</div>
                      <div className="px-2 py-1 bg-gray-100 rounded-full inline-block">{profile.postingStyle || "Not set"}</div>
                    </div>
                  </div>
                </div>
                 <div className="flex flex-row w-full mt-4 gap-6 justify-between">
                <div className=" rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Brand</h4>
                  </div>
                  <div className="flex items-center space-x-3">
                    {profile.brandLogo ? (<img src={profile.brandLogo} alt="brand" className="w-16 h-16 rounded-md object-cover" />) : (<div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center"><Tag className="w-6 h-6 text-gray-400" /></div>)}
                    <div>
                      <div className="font-medium">{profile.brandName || "Not set"}</div>
                      <div className="text-sm text-gray-500">{profile.brandTone || "Tone not set"}</div>
                      <div className="text-sm mt-2"><a href={profile.publicUrl || "#"} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{profile.publicUrl || "Add public URL"}</a></div>
                    </div>
                  </div>
                </div>

                <div className=" rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Wallet</h4>
                  <div className="text-sm text-gray-600">Coins: <span className="font-medium">{profile.wallet?.coins ?? profile.coins ?? 0}</span></div>
                  <div className="text-sm text-gray-600">Package: <span className="font-medium">{profile.wallet?.package?.name ?? profile.wallet?.packageId ?? "Free"}</span></div>
                  <div className="text-sm text-gray-600">Expires: <span className="font-medium">{profile.wallet?.expiresAt ? new Date(profile.wallet.expiresAt).toLocaleDateString() : (profile.wallet?.createdAt ? new Date(profile.wallet.createdAt).toLocaleDateString() : "-")}</span></div>
                </div>

                <div className=" rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Meta</h4>
                  <div className="text-sm text-gray-600">Onboarding: <span className="font-medium">{profile.isOnboarding ? "In Progress" : "Completed"}</span></div>
                  <div className="text-sm text-gray-600">Joined: <span className="font-medium">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "-"}</span></div>
                </div>
              </div>
              </div>

             
            </div>
          </>
        )}

        {/* Inline editor: reuse ProfileSetupSinglePage elements for editing */}
        {isEditing ? (
          <div>
            <div className="flex items-center justify-end mb-4">
              <button onClick={() => setIsEditing(false)} className="flex items-center px-3 py-1 bg-gray-100 rounded-md text-sm hover:bg-gray-200">
                <X className="w-4 h-4 mr-2" />
                Close
              </button>
            </div>
            <div className="mt-0 /80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <ProfileSetupSinglePage />
            </div>
          </div>
        ) : null}

    
      </div>
    </div>
  );
};
