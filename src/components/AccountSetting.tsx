"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Shield, Lock, Key, Smartphone, Copy } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import API from "@/services/api";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { notify } from "@/utils/toast";
import { AuthenticatorModal } from "./AuthenticatorModal";

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
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

type PasswordFormType = z.infer<typeof passwordSchema>;

const securityQuestionsSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1, "Please select a question"),
        answer: z.string().trim().min(1, "Answer is required"),
      })
    )
    .min(2, "Please answer at least 2 security questions")
    .refine(
      (arr) => new Set(arr.map((a) => a.questionId)).size === arr.length,
      {
        message: "You cannot select the same question twice",
      }
    ),
});

type SecurityQuestionsFormType = z.infer<typeof securityQuestionsSchema>;

interface SecurityQuestion {
  id: string;
  question: string;
}

function AccountSecurityTabs() {
  const { setPasswordEditing, refreshUser, user }: any = useAppContext();

  const [activeTab, setActiveTab] = useState<"password" | "2fa" | "questions">(
    "password"
  );
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);
  const [twoFAModalOpen, setTwoFAModalOpen] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingPassword, setPendingPassword] =
    useState<PasswordFormType | null>(null);
  const [editingQuestions, setEditingQuestions] = useState(false);

  useEffect(() => {
    if (user && !user.isSecurityQuestions) {
      setEditingQuestions(true);
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const questionsRes = await API.securityQuestion();
        setQuestions(questionsRes.data.data || []);
      } catch (err) {
        notify("error", "Failed to load security settings");
      }
    };
    fetchData();
  }, []);

  const passwordForm = useForm<PasswordFormType>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const questionsForm = useForm<SecurityQuestionsFormType>({
    resolver: zodResolver(securityQuestionsSchema),
    defaultValues: {
      answers: [
        { questionId: "", answer: "" },
        { questionId: "", answer: "" },
      ],
    },
  });

  const { fields } = useFieldArray({
    control: questionsForm.control,
    name: "answers",
  });

  const onPasswordSubmit = (data: PasswordFormType) => {
    if (showAuth) return;
    setPendingPassword(data);
    setShowAuth(true);
  };

  const Resetpassword = async (data: any) => {
    await API.updatePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    notify("success", "Password updated successfully");
    refreshUser();
    passwordForm.reset();
    setPendingPassword(null);
    setShowAuth(false);
  };
  const verifyResetpassword = async (otp: any) => {
    if (!pendingPassword) return;

    let res = await API.updatePassword({
      currentPassword: pendingPassword.currentPassword,
      newPassword: pendingPassword.newPassword,
      otp,
    });

    return res.data;
  };
  const onSecurityQuestionsSubmit = async (data: SecurityQuestionsFormType) => {
    setLoading(true);
    try {
      const payload = {
        answers: data.answers.map((item) => ({
          questionId: item.questionId,
          answer: item.answer.trim(),
        })),
      };

      await API.securityAnswers(payload);
      notify("success", "Security Enable Successfully");
      refreshUser?.();
      setEditingQuestions(false);
    } catch (err: any) {
      notify(
        "error",
        err.response?.data?.message ||
          "Failed to save security answers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!confirm("Are you sure you want to disable two-factor authentication?"))
      return;

    setDisabling2FA(true);
    try {
      await API.disable2FA();
      notify("success", "Two-factor authentication disabled");
      refreshUser?.();
    } catch (err: any) {
      notify("error", err.response?.data?.message || "Failed to disable 2FA");
    } finally {
      setDisabling2FA(false);
    }
  };

  const handle2FASuccess = () => {
    refreshUser?.();
  };

  const tabs = [
    { id: "password", label: "Update Password", icon: Lock },
    { id: "questions", label: "Security Questions", icon: Key },
    { id: "2fa", label: "Two-Factor Authentication", icon: Smartphone },
  ];

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [error, setError] = useState("");

  const startSetup = async () => {
    setLoadingQr(true);
    setError("");
    try {
      const res = await API.enable2FA();
      setQrCodeUrl(res.data.qrCode);
      setManualCode(res.data.manualCode);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load setup");
    } finally {
      setLoadingQr(false);
    }
  };

  useEffect(() => {
    startSetup();
  }, []);

  return (
    <>
      {showAuth && (
        <AuthenticatorModal
          open={showAuth}
          isResetPassword={true}
          onClose={() => {
            setShowAuth(false);
          }}
          onSuccess={() => {
            notify("success", "Password updated successfully");
            refreshUser();
            passwordForm.reset();
            setPendingPassword(null);
            setShowAuth(false);
          }}
          verifyOtp={verifyResetpassword}
        />
      )}

      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-black flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#7650e3]" />
              Account Security
            </h1>
            <button
              onClick={() => setPasswordEditing?.(false)}
              className="flex items-center gap-2 text-[#7650e3] hover:text-[#6540cc] font-semibold text-sm hover:underline"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
          </div>
          <p className="text-gray-500">Manage your account security settings</p>
        </div>

        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2.5 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-[#7650e3] text-[#7650e3]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="min-h-[400px]">
          {activeTab === "password" && (
            <form
              onSubmit={passwordForm.handleSubmit(
                user?.twoFactorEnabled ? onPasswordSubmit : Resetpassword
              )}
              className="space-y-6"
            >
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    {...passwordForm.register("currentPassword")}
                    className="w-full px-4 py-2.5 border-2 border-purple-500 rounded-md focus:outline-none focus:border-purple-600"
                    placeholder="Enter current password"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    {...passwordForm.register("newPassword")}
                    className="w-full px-4 py-2.5 border-2 border-purple-500 rounded-md focus:outline-none focus:border-purple-600"
                    placeholder="Enter new password"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    {...passwordForm.register("confirmPassword")}
                    className="w-full px-4 py-2.5 border-2 border-purple-500 rounded-md focus:outline-none focus:border-purple-600"
                    placeholder="Confirm new password"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#7650e3] text-white font-semibold rounded-md hover:bg-[#6540cc] disabled:opacity-50 transition-all"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          {activeTab === "2fa" && (
            <div className="space-y-6 relative">
              {!user?.isSecurityQuestions && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 rounded-md">
                  <Lock className="w-10 h-10 text-gray-600" />
                  <p className="text-center text-gray-600 px-4">
                    Please add a{" "}
                    <span className="font-medium">security code</span> first to
                    enable Two-Factor Authentication.
                  </p>
                </div>
              )}
              <div className="bg-gray-100 p-6 rounded-md">
                <h3 className="text-lg font-semibold mb-3">
                  Two-Factor Authentication (2FA)
                </h3>
                <p className="text-gray-600 mb-6">
                  Add an extra layer of security by requiring a code from your
                  authenticator app.
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      Status:{" "}
                      <span
                        className={
                          user?.twoFactorEnabled
                            ? "text-green-600"
                            : "text-gray-600"
                        }
                      >
                        {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Authenticator app (TOTP)
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      user?.twoFactorEnabled
                        ? disable2FA()
                        : setTwoFAModalOpen(true)
                    }
                    disabled={disabling2FA}
                    className={`px-6 py-2.5 rounded-md font-medium transition-all ${
                      user?.twoFactorEnabled
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-[#7650e3] hover:bg-[#6540cc] text-white"
                    } disabled:opacity-50`}
                  >
                    {disabling2FA
                      ? "Processing..."
                      : user?.twoFactorEnabled
                      ? "Disable 2FA"
                      : "Enable 2FA"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "questions" && (
            <form
              onSubmit={questionsForm.handleSubmit(onSecurityQuestionsSubmit)}
              className="space-y-4"
            >
              <p className="text-gray-600">
                Set up security questions to help recover your account if
                needed.
              </p>

              <div className="flex items-center justify-between bg-gray-100  p-5 rounded-md ">
                <div>
                  <p className="font-medium">
                    Status:{" "}
                    <span
                      className={
                        user?.isSecurityQuestions
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      {user?.isSecurityQuestions ? "Enabled" : "Not Set"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Helps securely recover your account
                  </p>
                </div>

                {!editingQuestions ? (
                  <button
                    type="button"
                    onClick={() => setEditingQuestions(true)}
                    className=" px-3 py-2.5 bg-[#7650e3] hover:bg-[#6540cc] text-white font-medium rounded-md transition-all"
                  >
                    Update
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingQuestions(false)}
                    className=" px-3 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {editingQuestions && (
                <div className="space-y-8">
                  {fields.map((field, index) => {
                    const questionError =
                      questionsForm.formState.errors.answers?.[index]
                        ?.questionId;
                    const answerError =
                      questionsForm.formState.errors.answers?.[index]?.answer;

                    const currentValue = questionsForm.watch(
                      `answers.${index}.questionId`
                    );
                    const selectedQuestion = questions.find(
                      (q) => q.id === currentValue
                    );

                    const otherSelected = questionsForm
                      .getValues("answers")
                      .filter((_, i) => i !== index)
                      .map((a) => a.questionId)
                      .filter(Boolean) as string[];

                    const isDisabled =
                      user?.isSecurityQuestions && !editingQuestions;

                    return (
                      <div key={field.id} className="space-y-6">
                        {/* Custom Select for Question */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Question {index + 1}
                          </label>

                          <CustomSelect
                            value={currentValue}
                            onChange={(value) =>
                              questionsForm.setValue(
                                `answers.${index}.questionId`,
                                value,
                                {
                                  shouldValidate: true,
                                }
                              )
                            }
                            questions={questions}
                            otherSelected={otherSelected}
                            error={questionError?.message}
                            disabled={isDisabled}
                          />

                          {questionError && (
                            <p className="mt-2 text-sm text-red-600 font-medium">
                              {questionError.message}
                            </p>
                          )}
                        </div>

                        {/* Answer Input */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Your Answer
                          </label>
                          <input
                            type="text"
                            placeholder={
                              isDisabled
                                ? "Answer hidden for security"
                                : "Enter your answer"
                            }
                            disabled={isDisabled}
                            {...questionsForm.register(
                              `answers.${index}.answer`
                            )}
                            className={`w-full  px-3 py-2.5 rounded-md border-2 bg-white  transition-all focus:outline-none  ${
                              isDisabled
                                ? "bg-gray-100 cursor-not-allowed text-gray-500 border-gray-300"
                                : answerError
                                ? "border-red-400"
                                : "border-purple-600 "
                            }`}
                          />
                          {answerError && (
                            <p className="mt-2 text-sm text-red-600 font-medium">
                              {answerError.message}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Global duplicate error */}
                  {questionsForm.formState.errors.answers?.root && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-700 text-center font-medium">
                        {questionsForm.formState.errors.answers.root.message}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {editingQuestions && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#7650e3] hover:bg-[#6540cc] text-white font-semibold rounded-md disabled:opacity-50 transition-all"
                >
                  {loading
                    ? "Saving..."
                    : user?.isSecurityQuestions
                    ? "Update Security Questions"
                    : "Save Security Questions"}
                </button>
              )}
            </form>
          )}
        </div>
      </div>

      {user.isSecurityQuestions && twoFAModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/40 px-4 py-10">
          <TwoFAModal
            close={() => setTwoFAModalOpen(false)}
            onSuccess={handle2FASuccess}
            qrCodeUrl={qrCodeUrl}
            manualCode={manualCode}
            loadingQr={loadingQr}
            setError={setError}
            error={error}
          />
        </div>
      )}
    </>
  );
}

const TwoFAModal = ({
  close,
  onSuccess,
  qrCodeUrl,
  manualCode,
  loadingQr,
  setError,
  error,
}: any) => {
  const { refreshUser } = useAppContext();

  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  const verifySetup = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      await API.verify2FASetup({ token: otp });
      refreshUser?.();
      notify("success", "2FA enabled successfully");
      setOtp("");
      onSuccess?.();
      close();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid or expired code";
      setError(msg);
      notify("error", msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => {
    setOtp("");
    setError("");
    close();
  };

  const copyCode = () => {
    if (manualCode) {
      navigator.clipboard.writeText(manualCode);
      notify("success", "Code copied to clipboard");
    }
  };

  return (
    <div className="w-full max-w-md rounded-md bg-white shadow-xl">
      <div className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900 text-center">
          Enable Two-Factor Authentication
        </h2>
      </div>

      <div className="px-6 py-6">
        {loadingQr && !qrCodeUrl ? (
          <p className="text-center text-sm text-gray-500">
            Loading QR code...
          </p>
        ) : qrCodeUrl ? (
          <>
            <div className="text-center mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Scan this QR code with your authenticator app
              </p>
              <img
                src={qrCodeUrl}
                alt="2FA QR Code"
                className="mx-auto h-40 w-40 rounded-md border"
              />
            </div>

            <div className="mb-6 text-center">
              <p className="text-xs text-gray-500 mb-2">
                Or enter this code manually:
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="rounded-md bg-gray-100 px-3 py-2">
                  <code className="text-sm font-mono text-gray-800 break-all">
                    {manualCode}
                  </code>
                </div>
                <button
                  onClick={copyCode}
                  className="text-purple-600 hover:text-purple-700"
                  title="Copy code"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2 text-center">
                Enter the 6-digit code from your app
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full rounded-md border px-4 py-2 text-center text-lg font-mono tracking-widest focus:border-purple-600 focus:outline-none"
                placeholder="••••••"
                autoFocus
              />
              {error && (
                <p
                  className="mt-2 text-center text-xs text-red-500"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="text-center text-sm text-red-600">
            {error || "Failed to load setup"}
          </p>
        )}
      </div>

      <div className="flex gap-3 border-t px-6 py-4">
        <button
          onClick={handleClose}
          disabled={verifying}
          className="flex-1 rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={verifySetup}
          disabled={verifying || otp.length < 6 || !qrCodeUrl}
          className="flex-1 rounded-md bg-[#7650e3] px-4 py-2 text-sm font-medium text-white hover:bg-[#6540cc] disabled:opacity-50"
        >
          {verifying ? "Verifying..." : "Enable 2FA"}
        </button>
      </div>
    </div>
  );
};

export default AccountSecurityTabs;

export const CustomSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  questions: SecurityQuestion[];
  otherSelected: string[];
  error?: string;
  disabled?: boolean;
}> = ({
  value,
  onChange,
  questions,
  otherSelected,
  error,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedQuestion = questions.find((q) => q.id === value);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full  px-3 py-2.5 text-left bg-white rounded-md border-2 transition-all duration-200 flex items-center justify-between focus:outline-none ${
          disabled
            ? "bg-gray-100 cursor-not-allowed border-gray-300"
            : error
            ? "border-red-400"
            : value
            ? "border-purple-500 shadow-md"
            : "border-purple-600 "
        }`}
      >
        <span className={value ? "text-gray-900 font-medium" : "text-gray-500"}>
          {selectedQuestion?.question || "Select a security question..."}
        </span>
        {!disabled && (
          <svg
            className={`w-5 h-5 text-purple-600 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-md shadow-xl z-50 max-h-64 overflow-y-auto">
          {questions.map((q) => {
            const isSelected = value === q.id;
            const isDisabled = otherSelected.includes(q.id);

            return (
              <button
                key={q.id}
                type="button"
                disabled={isDisabled}
                onClick={() => {
                  onChange(q.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2.5 text-left transition-all ${
                  isSelected
                    ? "bg-purple-50 text-purple-700 font-semibold"
                    : isDisabled
                    ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                    : "hover:bg-gray-50 text-gray-900"
                }`}
              >
                {q.question}
                {isDisabled && (
                  <span className="ml-2 text-xs"> (already selected)</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
