"use client";

import type React from "react";
import { useState, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  initiateGoogleOAuth,
  initiateFacebookOAuth,
  initiateLinkedInOAuth,
  isOAuthConfigured,
} from "../utils/authOAuth";

import API from "../services/api";
import { OtpModal } from "./OtpModal";
import { Mail } from "lucide-react";
import logoText from "../assets/logo-text.svg";
import backArrow from "../assets/back-arrow.png";
import { notify } from "@/utils/toast";
import Icon from "./Icon";
import { useTranslation } from "react-i18next";
import { AuthenticatorModal } from "./AuthenticatorModal";
import Cookies from "js-cookie";
interface AuthFormProps {
  onAuthSuccess: (user: any) => void;
  onForgetPassword?: (email: string) => Promise<void>;
  onResetPassword?: (token: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

type AuthMode = "login" | "signup" | "forgotPassword" | "resetPassword";

const loginSchema = (t: any) =>
  z.object({
    email: z.string().email(t("please_enter_valid_email")),
    password: z.string().min(6, t("password_min_length")),
  });

const signupSchema = (t: any) =>
  z.object({
    name: z.string().min(2, t("name_min_length")),
    email: z.string().email(t("please_enter_valid_email")),
    password: z.string().min(6, t("password_min_length")),
  });

const forgotPasswordSchema = (t: any) =>
  z.object({
    email: z.string().email(t("please_enter_valid_email")),
  });

const resetPasswordSchema = (t: any) =>
  z
    .object({
      password: z.string().min(6, t("password_min_length")),
      confirmPassword: z.string().min(6, t("password_min_length")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

type LoginFormData = z.infer<ReturnType<typeof loginSchema>>;
type SignupFormData = z.infer<ReturnType<typeof signupSchema>>;
type ForgotPasswordFormData = z.infer<ReturnType<typeof forgotPasswordSchema>>;
type ResetPasswordFormData = z.infer<ReturnType<typeof resetPasswordSchema>>;

export const AuthForm: React.FC<AuthFormProps> = ({
  onAuthSuccess,
  loading: externalLoading,
  error: externalError,
}) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtpPopup, setShowOtpPopup] = useState<boolean>(false);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { t } = useTranslation();

  const params = new URLSearchParams(window.location.search);
  const referralId: any = params.get("referralId");
  const isVerification = params.get("isVerification");

  const isCookieAccepted = () => {
    return Cookies.get("cookie-consent") === "accepted";
  };

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema(t)),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema(t)),
    defaultValues: { name: "", email: "", password: "" },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema(t)),
    defaultValues: { email: "" },
  });

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema(t)),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useLayoutEffect(() => {
    if (isVerification === "true" || isVerification === "1") {
      const emailToken = localStorage.getItem("email_token");
      if (emailToken) {
        setShowOtpPopup(true);
      }
    }
  }, [isVerification]);

  const onForgetPassword = async (email: string) => {
    if (!isCookieAccepted()) {
      return notify("error", "Please accept cookies first.");
    }

    setLoading(true);
    try {
      const res = await API.generateForgetLink({ email });

      localStorage.setItem("forgot_token", res.data.data.accessToken);
      localStorage.setItem("forgot_token_time", Date.now().toString());
      notify("success", t("email_sent_lowercase"));
    } catch (err: any) {
      notify(
        "error",
        err.response?.data?.message || t("failed_send_reset_link")
      );
    } finally {
      setLoading(false);
    }
  };
  const [question, setQuestion] = useState([]);
  const handleLoginSubmit = async (data: LoginFormData) => {
    if (!isCookieAccepted()) {
      return notify("error", "Please accept cookies first.");
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await API.login({
        email: data.email,
        password: data.password,
      });

      const result = response.data.data;
      if (
        response?.data?.challengeName === "SOFTWARE_TOKEN_MFA" &&
        response?.data?.session
      ) {
        setQuestion(response?.data?.question);
        localStorage.setItem("mfa_session_token", response.data.session);
        setLoading(false);
        setShowAuth(true);
        return;
      }

      if (!result.accessToken || !result.user) {
        return notify("error", t("invalid_response_server"));
      }

      notify("success", t("login_successful"));

      Cookies.set("auth_token", result.accessToken, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      });
      Cookies.set("refresh_token", result.accessToken, {
        expires: 14,
        secure: true,
        sameSite: "strict",
      });

      localStorage.removeItem("forgot_token");
      localStorage.removeItem("forgot_token_time");

      onAuthSuccess(result.user);

      try {
        const profile = result.user?.profile;
        if (profile && (profile as any).isOnboarding === false) {
          import("../lib/navigation")
            .then(({ navigateOnce }) => {
              navigateOnce(navigate, "/dashboard?profile=true", {
                replace: true,
              });
            })
            .catch((err) => {
              console.error("failed to load navigation helper", err);
              navigate("/dashboard?profile=true", { replace: true });
            });
          return;
        }
      } catch (e) {}
    } catch (error: any) {
      console.log("error312321312", error);
      const message =
        error.response?.data?.message || t("authentication_failed");
      notify("error", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (data: SignupFormData) => {
    if (!isCookieAccepted()) {
      return notify("error", "Please accept cookies first.");
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await API.registerUser({
        email: data.email,
        password: data.password,
        name: data.name,
        ...(referralId !== "" && {
          referralId: referralId ? referralId : "",
        }),
      });

      setShowOtpPopup(true);
      const result = await response.data.data;
      localStorage.setItem("email_token", result.accessToken);
      const url = new URL(window.location.href);
      url.searchParams.set("isVerification", "true");
      window.history.pushState({}, "", url.toString());
      notify("success", t("email_sent"));
    } catch (error: any) {
      notify(
        "error",
        error.response?.data?.message || t("authentication_failed")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    if (!isCookieAccepted()) {
      return notify("error", "Please accept cookies first.");
    }
    setLoading(true);
    setError("");

    try {
      const result: any = await initiateGoogleOAuth(referralId);
      if (result?.challengeName === "SOFTWARE_TOKEN_MFA" && result?.session) {
        setQuestion(result?.question);
        setShowAuth(true);
        localStorage.setItem("mfa_session_token", result?.session);
        setLoading(false);
        return;
      }
      console.log("result1212312321", result);
      if (result.accessToken) {
        Cookies.set("auth_token", result.accessToken, {
          expires: 1,
          secure: true,
          sameSite: "strict",
        });
        Cookies.set("refresh_token", result.accessToken, {
          expires: 14,
          secure: true,
          sameSite: "strict",
        });

        localStorage.removeItem("forgot_token");
        localStorage.removeItem("forgot_token_time");
        onAuthSuccess(result.user);

        setTimeout(() => {
          navigate("/content");
        }, 0);
      }
    } catch (error: any) {
      setError(error.message || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookOAuth = async () => {
    if (!isCookieAccepted()) {
      return notify("error", "Please accept cookies first.");
    }
    setLoading(true);
    setError("");

    try {
      const result: any = await initiateFacebookOAuth();

      if (result?.challengeName === "SOFTWARE_TOKEN_MFA" && result?.session) {
        setQuestion(result?.question);

        setShowAuth(true);
        localStorage.setItem("mfa_session_token", result?.session);
        setLoading(false);
        return;
      }
      Cookies.set("auth_token", result.accessToken, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      });
      Cookies.set("refresh_token", result.accessToken, {
        expires: 14,
        secure: true,
        sameSite: "strict",
      });

      localStorage.removeItem("forgot_token");
      localStorage.removeItem("forgot_token_time");
      onAuthSuccess(result.user);
      try {
        const profile = result.user?.profile;
        if (profile && (profile as any).isOnboarding === false) {
          import("../lib/navigation")
            .then(({ navigateOnce }) => {
              navigateOnce(navigate, "/dashboard?profile=true", {
                replace: true,
              });
            })
            .catch((err) => {
              console.error("failed to load navigation helper", err);
              navigate("/dashboard?profile=true", { replace: true });
            });
          return;
        }
      } catch (e) {
        notify("error", t("authform_facebook_fallback_failed"));
      }
    } catch (error: any) {
      notify(
        "error",
        error.response?.data?.message || t("facebook_auth_failed")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInOAuth = async () => {
    if (!isCookieAccepted()) {
      return notify("error", "Please accept cookies first.");
    }
    setLoading(true);
    setError("");

    try {
      const result: any = await initiateLinkedInOAuth(referralId);
      console.log("result", result);
      if (result?.challengeName === "SOFTWARE_TOKEN_MFA" && result?.session) {
        setQuestion(result?.question);

        setShowAuth(true);
        localStorage.setItem("mfa_session_token", result?.session);
        setLoading(false);
        return;
      }

      if (result.accessToken) {
        Cookies.set("auth_token", result.accessToken, {
          expires: 1,
          secure: true,
          sameSite: "strict",
        });
        Cookies.set("refresh_token", result.accessToken, {
          expires: 14,
          secure: true,
          sameSite: "strict",
        });

        localStorage.removeItem("forgot_token");
        localStorage.removeItem("forgot_token_time");
        onAuthSuccess(result.user);

        const profile = result.user?.profile;
        if (profile && (profile as any).isOnboarding === false) {
          import("../lib/navigation")
            .then(({ navigateOnce }) => {
              navigateOnce(navigate, "/dashboard?profile=true", {
                replace: true,
              });
            })
            .catch(() => {
              navigate("/dashboard?profile=true", { replace: true });
            });
          return;
        }

        navigate("/content");
      }
    } catch (error: any) {
      console.log("error", error);
      notify(
        "error",
        error.response?.data?.message || t("linkedin_auth_failed")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (data: ForgotPasswordFormData) => {
    if (!isCookieAccepted()) {
      return notify("error", "Please accept cookies first.");
    }
    await onForgetPassword(data.email);
  };

  const handleResetPasswordSubmit = async (data: ResetPasswordFormData) => {
    if (!isCookieAccepted()) {
      return notify("error", "Please accept cookies first.");
    }
    setSuccessMessage("Password successfully reset.");
    resetPasswordForm.reset();
    setMode("login");
  };

  return (
    <div className="w-full flex md:items-center justify-center bg-white px-3 py-4  sm:py-6 md:py-8 h-screen">
      {!showOtpPopup && (
        <div
          className={`z-10  md:max-w-md md:bg-gray-50 flex items-center flex-col w-full justify-start md:shadow-md rounded-md py-6 ${
            mode !== "login" && mode !== "signup" ? "h-[480px]" : "h-[780px]"
          } md:py-10  sm:px-6 md:px-10  md:border md:border-slate-200/70 md:backdrop-blur-sm`}
        >
          <div className="flex relative items-center justify-center mb-4 sm:mb-4 w-full ">
            <div className="mb-8">
              <button
                onClick={() => {
                  if (mode == "login") {
                    navigate("/home");
                  } else {
                    setMode("login");
                  }
                }}
                className="group"
              >
                <img src={backArrow} className="absolute left-0 " alt="" />
              </button>
            </div>

            <div
              className={`flex items-center  relative ${
                mode !== "login" ? "" : "mx-auto"
              }`}
            >
              <div className="text-center flex gap-2 items-center">
                <Icon name="spiral-logo" size={50} />
                <span className="theme-text-primary text-xl md:text-2xl tracking-tight">
                  <img
                    src={logoText || "/placeholder.svg"}
                    alt="Logo"
                    className="h-4 sm:h-5 md:h-5"
                  />
                </span>
              </div>
            </div>
          </div>

          {mode === "login" && (
            <div className="space-y-4 w-full">
              <h2 className="text-center text-base font-medium text-black">
                {t("sign_up_or_login_with")}
              </h2>
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={handleGoogleOAuth}
                  disabled={loading}
                  className="w-full border border-purple-600 rounded-md py-2.5  flex items-center justify-start bg-white px-4 gap-2 hover:bg-purple-50 transition font-medium text-base text-slate-700 disabled:opacity-50"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="hidden sm:inline">Google</span>
                  <span className="sm:hidden ">Google</span>
                </button>

                {isOAuthConfigured("facebook") && (
                  <button
                    onClick={handleFacebookOAuth}
                    disabled={loading}
                    className="w-full border border-purple-600 rounded-md py-2.5  flex items-center justify-start bg-white px-4 gap-2 hover:bg-purple-50 transition font-medium text-base text-slate-700 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="hidden sm:inline">Facebook</span>
                    <span className="sm:hidden ">Facebook</span>
                  </button>
                )}

                <button
                  onClick={handleLinkedInOAuth}
                  disabled={loading}
                  className="w-full border border-purple-600 rounded-md py-2.5  flex items-center justify-start bg-white px-4 gap-2 hover:bg-purple-50 transition font-medium text-base text-slate-700 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
                    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.2 8.98h4.6V24H.2V8.98zM9.98 8.98h4.4v2.06h.06c.61-1.16 2.1-2.38 4.32-2.38 4.62 0 5.47 3.04 5.47 6.99V24h-4.6v-6.92c0-1.65-.03-3.78-2.3-3.78-2.31 0-2.66 1.8-2.66 3.67V24h-4.6V8.98z" />
                  </svg>
                  <span className="hidden sm:inline ">LinkedIn</span>
                  <span className="sm:hidden ">LinkedIn</span>
                </button>

                <button
                  onClick={() => setMode("signup")}
                  disabled={loading}
                  className="w-full border border-purple-600 rounded-md py-2.5  flex items-center justify-start bg-white px-4 gap-2 hover:bg-purple-50 transition font-medium text-base text-slate-700 disabled:opacity-50"
                >
                  <Mail className="w-5 h-5" />
                  <span className="hidden sm:inline">
                    {t("continue_with_email")}
                  </span>
                  <span className="sm:hidden ">{t("email")}</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="w-8 h-8 p-1 flex border border-slate-300 justify-center items-center rounded-full md:bg-gray-50 bg-white text-gray-500 font-medium font-medium">
                    OR
                  </span>
                </div>
              </div>
              <form
                onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
                className="flex flex-col gap-y-3 sm:gap-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("email")}
                  </label>
                  <input
                    type="email"
                    placeholder={t("enter_your_email")}
                    {...loginForm.register("email")}
                    className="w-full px-4 py-2.5  text-sm border border-purple-500 bg-white rounded-md focus:outline-none focus:border-purple-600 transition"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("password")}
                  </label>
                  <input
                    type="password"
                    placeholder={t("enter_your_password")}
                    {...loginForm.register("password")}
                    className="w-full px-4 py-2.5  text-sm border border-purple-500 bg-white rounded-md focus:outline-none focus:border-purple-600 transition"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3]  border border-[#7650e3] text-white font-semibold py-2 text-base rounded-md transition disabled:opacity-50"
                >
                  {loading ? t("signing_in") : t("sign_in")}
                </button>
              </form>

              <div className="flex    items-center justify-end text-sm">
                <button
                  onClick={() => {
                    setMode("forgotPassword");
                    setError("");
                  }}
                  className="text-purple-600 hover:underline font-medium text-sm text-left sm:text-right"
                >
                  {t("forgot_password")}
                </button>
              </div>
            </div>
          )}

          {mode === "signup" && (
            <form
              onSubmit={signupForm.handleSubmit(handleSignupSubmit)}
              className="space-y-3 sm:space-y-4 w-full"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("name")}
                </label>
                <input
                  type="text"
                  placeholder={t("enter_your_full_name")}
                  {...signupForm.register("name")}
                  className="w-full px-4 py-2.5  text-sm border border-purple-500 bg-white rounded-md focus:outline-none focus:border-purple-600 transition"
                />
                {signupForm.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {signupForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("email")}
                </label>
                <input
                  type="email"
                  placeholder={t("enter_your_email")}
                  {...signupForm.register("email")}
                  className="w-full px-4 py-2.5  text-sm border border-purple-500 bg-white rounded-md focus:outline-none focus:border-purple-600 transition"
                />
                {signupForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("password")}
                </label>
                <input
                  type="password"
                  placeholder={t("enter_your_password")}
                  {...signupForm.register("password")}
                  className="w-full px-4 py-2.5  text-sm border border-purple-500 bg-white rounded-md focus:outline-none focus:border-purple-600 transition"
                />
                {signupForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {referralId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("referral_id")}
                  </label>
                  <input
                    type="text"
                    value={referralId}
                    disabled
                    className="w-full px-4 py-2.5  text-sm border border-purple-500 bg-white rounded-md disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full  text-white bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] border-[#7650e3] border font-semibold py-2  text-base rounded-md transition disabled:opacity-50"
              >
                {loading ? t("creating_account") : t("register")}
              </button>

              {(error || externalError) && (
                <p className="text-red-500 text-sm text-center">
                  {error || externalError}
                </p>
              )}
            </form>
          )}

          {mode === "forgotPassword" && (
            <form
              onSubmit={forgotPasswordForm.handleSubmit(
                handleForgotPasswordSubmit
              )}
              className=" w-full"
            >
              <div className="mb-10">
                <h2 className="text-center text-base font-medium text-black">
                  {t("forgot_password")}
                </h2>
                <p className="text-center text-sm  text-gray-500 font-medium">
                  {t("enter_registered_email")}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("email")}
                </label>
                <input
                  type="email"
                  placeholder={t("enter_your_email")}
                  {...forgotPasswordForm.register("email")}
                  className="w-full px-4 py-2.5  text-sm border border-purple-500 bg-white rounded-md focus:outline-none focus:border-purple-600 transition"
                />
                {forgotPasswordForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {forgotPasswordForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3]  border border-[#7650e3] text-white font-semibold py-2 mb-4 text-base rounded-md transition disabled:opacity-50"
                >
                  {loading ? t("sending") : t("forgot_password")}
                </button>
              </div>
            </form>
          )}

          {mode === "resetPassword" && (
            <form
              onSubmit={resetPasswordForm.handleSubmit(
                handleResetPasswordSubmit
              )}
              className="space-y-4 sm:space-y-5 w-full"
            >
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 sm:mb-6">
                {t("reset_your_password")}
              </h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("new_password")}
                </label>
                <input
                  type="password"
                  placeholder={t("enter_your_password")}
                  {...resetPasswordForm.register("password")}
                  className="w-full px-4 py-2.5  text-sm border border-purple-500 bg-white rounded-md focus:outline-none focus:border-purple-600 transition"
                />
                {resetPasswordForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {resetPasswordForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("confirm_password")}
                </label>
                <input
                  type="password"
                  placeholder="Re-enter your Password"
                  {...resetPasswordForm.register("confirmPassword")}
                  className="w-full px-4 py-2.5  text-sm border border-purple-500 bg-white rounded-md focus:outline-none focus:border-purple-600 transition"
                />
                {resetPasswordForm.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {resetPasswordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2  text-base rounded-md transition disabled:opacity-50"
              >
                {loading ? t("resetting") : t("set_new_password")}
              </button>

              {successMessage && (
                <p className="text-sm text-green-600 text-center">
                  {successMessage}
                </p>
              )}

              {(error || externalError) && (
                <p className="text-red-500 text-sm text-center">
                  {error || externalError}
                </p>
              )}
            </form>
          )}
        </div>
      )}

      {showOtpPopup && (
        <>
          {localStorage.getItem("email_token") &&
            !localStorage.getItem("mfa_session_token") && (
              <OtpModal
                open={showOtpPopup}
                onClose={() => {
                  setShowOtpPopup(false);
                  localStorage.removeItem("email_token");
                }}
                emailHint={loginForm.getValues("email") || "user@example.com"}
                onSuccess={(data: any) => onAuthSuccess(data)}
                verifyOtp={async (otp) => {
                  const res = await API.otpVerification({ otp });
                  return res.data.data;
                }}
                resendOtp={API.resendOtp}
              />
            )}
        </>
      )}

      {showAuth && localStorage.getItem("mfa_session_token") && (
        <AuthenticatorModal
          open={showAuth}
          onClose={() => {
            setShowAuth(false);
            localStorage.removeItem("mfa_session_token");
          }}
          question={question}
          onSuccess={(data: any) => {
            notify("success", t("login_successful"));

            localStorage.setItem("auth_token", data.accessToken);
            localStorage.setItem("refresh_token", data.refreshToken);

            onAuthSuccess(data.user);

            try {
              const profile = data.user?.profile;
              if (profile && (profile as any).isOnboarding === false) {
                import("../lib/navigation")
                  .then(({ navigateOnce }) => {
                    navigateOnce(navigate, "/dashboard?profile=true", {
                      replace: true,
                    });
                  })
                  .catch((err) => {
                    console.error("failed to load navigation helper", err);
                    navigate("/dashboard?profile=true", { replace: true });
                  });
                return;
              }
            } catch (e) {}
          }}
          verifyOtp={async (otp: any) => {
            const session = localStorage.getItem("mfa_session_token");
            if (!session) throw new Error("Session expired");
            const res = await API.verifyLogin2FA({ session, otp });
            return res.data;
          }}
        />
      )}
    </div>
  );
};
