import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import API from "@/services/api";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { notify } from "@/utils/toast";
import { div } from "framer-motion/client";
import { useTranslation } from "react-i18next";

// Zod Schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different",
    path: ["newPassword"],
  });

type PasswordFormType = z.infer<typeof passwordSchema>;

function UpdatePasswordForm() {
  const { setPasswordEditing } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const { t, i18n } = useTranslation();
  const changeLanguage = (lang: any) => i18n.changeLanguage(lang);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormType>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormType) => {
    setLoading(true);
    try {
      await API.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      notify("success", t("password_updated_successfully"));
      reset();

      setTimeout(() => {
        setPasswordEditing(false);
      }, 1500);
    } catch (err: any) {
      notify(
        "error",
        err.response?.data?.message ||
          t("failed_update_password")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 relative">
      <div className="mb-8 w-full">
        <div className="flex justify-between items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold text-black  w-full">
            {t("update_password")}
          </h1>
          <button
            onClick={() => setPasswordEditing(false)}
            className="flex  gap-2 top-5 text-[#7650e3] hover:text-[#6540cc] font-semibold transition-colors w-full justify-end text-sm hover:underline"
          >
            <ArrowLeft className="w-5 h-5" />
            {t("back_to_dashboard")}
          </button>
        </div>
        <p className="text-gray-500 ">
          {t("update_password_message")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col gap-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              {t("current_password")}
            </label>
            <input
              type="password"
              placeholder={t("enter_current_password")}
              {...register("currentPassword")}
              className="w-full px-4 py-2.5  text-sm border-2 border-purple-500 bg-white rounded-md focus:outline-none focus:border-purple-600 "
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              {t("new_password")}
            </label>
            <input
              type="password"
              placeholder={t("enter_new_password")}
              {...register("newPassword")}
              className="w-full px-4 py-2.5  text-sm border-2 border-purple-500 bg-white rounded-md focus:outline-none focus:border-purple-600 "
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              {t("confirm_password")}
            </label>
            <input
              type="password"
              placeholder={t("confirm_new_password")}
              {...register("confirmPassword")}
              className="w-full px-4 py-2.5  text-sm border-2 border-purple-500 bg-white rounded-md focus:outline-none focus:border-purple-600 "
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 w-full theme-bg-trinary disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white rounded-md font-semibold shadow-md disabled:opacity-50 border border-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] transition-colors min-w-[180px]"
        >
          {loading ? t("updating") : t("update_password")}
        </button>
      </form>
    </div>
  );
}

export default UpdatePasswordForm;
