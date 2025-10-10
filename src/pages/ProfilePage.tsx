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
import { useAppContext } from "../context/AppContext";
import API from "../services/api";
import { response } from "express";

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
  const [profile, setProfile] = useState<UserProfile>({
    id: state.user?.id || "",
    name: state.user?.user_metadata?.name || "",
    email: state.user?.email || "",
    bio: "",
    website: "",
    location: "",
    userType: "individual",
    plan: state.userPlan || "free",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await API.getProfile();

      const profileData = response.data.data;
      setProfile((prev) => ({ ...prev, ...profileData }));
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

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
    setProfile((prev) => ({
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
    <div className="h-full-dec-hf  x-2 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.name || "Your Profile"}
                </h1>
                <p className="text-gray-600">{profile.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      profile.plan === "business"
                        ? "bg-purple-100 text-purple-700"
                        : profile.plan === "ipro"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {profile.plan.toUpperCase()} Plan
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      profile.userType === "business"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-teal-100 text-teal-700"
                    }`}
                  >
                    {profile.userType === "business" ? "Business" : "Creator"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      loadProfile();
                    }}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {profile.userType === "business"
                  ? "Business Name"
                  : "Display Name"}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg">
                  {profile.name || "Not set"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City, Country"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg">
                  {profile.location || "Not set"}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {profile.userType === "business"
                  ? "Business Description"
                  : "Bio"}
              </label>
              {isEditing ? (
                <textarea
                  value={profile.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={
                    profile.userType === "business"
                      ? "Describe your business..."
                      : "Tell us about yourself..."
                  }
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg min-h-[80px]">
                  {profile.bio || "Not set"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Website
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://yourwebsite.com"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg">
                  {profile.website ? (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {profile.website}
                    </a>
                  ) : (
                    "Not set"
                  )}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Member Since
              </label>
              <p className="px-4 py-2 bg-gray-50 rounded-lg">
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Create New Campaign
              </button>
              <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Generate Content
              </button>
              <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Schedule Posts
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Posts</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Campaigns</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Scheduled</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Recent Activity
            </h3>
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">No recent activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
