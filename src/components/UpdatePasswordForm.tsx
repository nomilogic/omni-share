import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import API from "@/services/api";
import Dashboard from './../pages/Dashboard';

function UpdatePasswordForm() {
  const { setPasswordEditing } = useAppContext();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setError("Current password is required");
      return false;
    }
    if (!formData.newPassword) {
      setError("New password is required");
      return false;
    }
    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from current password");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await API.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (response.data.success) {
        setSuccess("Password updated successfully!");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          setPasswordEditing(false);
        }, 1500);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to update password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto p-4 ">
      {/* Header */}

      {/* Form Container */}

      <div className=" flex flex-col md:flex-row-reverse jusitify-between items-between w-full">
        <button
          onClick={() => setPasswordEditing(false)}
          className="flex items-center gap-2 text-[#7650e3] hover:text-[#6540cc] font-semibold transition-colors w-full justify-end text-sm hover:underline"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        <div className="mb-8 w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Update Password
          </h1>
          <p className="text-gray-600">
            Change your password to keep your account secure
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            placeholder="Enter your current password"
            className={`w-full px-4 py-2.5  text-sm border-2 border-purple-500 bg-white rounded-md focus:outline-none focus:border-purple-600 transition  ${
              formData.newPassword !== formData.confirmPassword
                ? "border-red-500"
                : ""
            }`}

          />
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            placeholder="Enter your new password"
            className="w-full px-4 py-2.5  text-sm border-2 border-purple-500 bg-white rounded-md focus:outline-none focus:border-purple-600 transition"
          />
          <p className="text-xs text-gray-500 mt-2">
            Must be at least 8 characters long
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your new password"
            className={`w-full px-4 py-2.5  text-sm border-2 border-purple-500 bg-white rounded-md focus:outline-none focus:border-purple-600 transition ${
              formData.newPassword !== formData.confirmPassword
                ? "border-red-500"
                : ""
            }`}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4  justify-end">
          <button
            type="button"
            onClick={() => setPasswordEditing(false)}
            className="px-8 py-3 border theme-border-trinary min-w-[180px] text-[#7650e3] rounded-lg font-semibold hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 theme-bg-trinary disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white rounded-lg font-semibold shadow-md disabled:opacity-50 border border-transparent hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] transition-colors min-w-[180px]"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdatePasswordForm;
