"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Shield, Lock, Copy } from "lucide-react";
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

  const [activeTab, setActiveTab] = useState<"password" | "security">(
    "password"
  );
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);
  const [twoFAModalOpen, setTwoFAModalOpen] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingPassword, setPendingPassword] =
    useState<PasswordFormType | null>(null);
  const [pendingAction, setPendingAction] = useState<"update-questions" | null>(
    null
  );
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
        notify("error", "Failed to load security questions");
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
  };

  const verifyResetpassword = async (otp: string) => {
    if (!pendingPassword) return;
    const res = await API.updatePassword({
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
      notify("success", "Security questions saved successfully");
      refreshUser();
      setEditingQuestions(false);
    } catch (err: any) {
      notify(
        "error",
        err.response?.data?.message || "Failed to save security questions"
      );
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!confirm("Are you sure you want to disable 2FA?")) return;
    setDisabling2FA(true);
    try {
      await API.disable2FA();
      notify("success", "Two-factor authentication disabled");
      refreshUser();
    } catch (err: any) {
      notify("error", err.response?.data?.message || "Failed to disable 2FA");
    } finally {
      setDisabling2FA(false);
    }
  };

  const handle2FASuccess = () => {
    refreshUser();
    setTwoFAModalOpen(false);
  };

  const handleAuthSuccess = () => {
    if (pendingAction === "update-questions") {
      setEditingQuestions(true);
      notify(
        "success",
        "Authenticated → now you can update security questions"
      );
    }
    setShowAuth(false);
    setPendingAction(null);
  };

  const tabs = [
    { id: "password", label: "Update Password", icon: Lock },
    { id: "security", label: "Security & 2FA", icon: Shield },
  ];

  // 2FA Setup Data
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [error, setError] = useState("");

  const start2FASetup = async () => {
    setLoadingQr(true);
    setError("");
    try {
      const res = await API.enable2FA();
      setQrCodeUrl(res.data.qrCode);
      setManualCode(res.data.manualCode);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to prepare 2FA setup");
    } finally {
      setLoadingQr(false);
    }
  };

  useEffect(() => {
    if (user?.isSecurityQuestions && !user?.twoFactorEnabled && !qrCodeUrl) {
      start2FASetup();
    }
  }, [user?.isSecurityQuestions, user?.twoFactorEnabled, qrCodeUrl]);

  return (
    <>
      {showAuth && (
        <AuthenticatorModal
          open={showAuth}
          isResetPassword={pendingAction}
          onClose={() => {
            setShowAuth(false);
            setPendingAction(null);
          }}
          onSuccess={handleAuthSuccess}
          verifyOtp={
            pendingAction === "update-questions"
              ? undefined
              : verifyResetpassword
          }
        />
      )}

      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
                          onClick={() => setPasswordEditing?.(false)}
                          className="flex  gap-2 top-5 text-[#7650e3] hover:text-[#6540cc] font-semibold transition-colors w-full justify-end text-sm hover:underline"
                        >
                          <ArrowLeft className="w-5 h-5" />
                          Back to Dashboard
                        </button>
            
          </div>
            <h1 className="text-3xl font-bold text-black flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#7650e3]" />
              Account Security
            </h1>
            
          <p className="text-gray-500">
            Protect your account with strong security settings
          </p>
        </div>

        {/* Tabs */}
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

        <div className="min-h-[500px]">
          {/* ── PASSWORD TAB ── */}
          {activeTab === "password" && (
            <form
              onSubmit={passwordForm.handleSubmit(
                user?.twoFactorEnabled ? onPasswordSubmit : Resetpassword
              )}
              className="space-y-6 max-w-lg"
            >
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  {...passwordForm.register("currentPassword")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="••••••••"
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  {...passwordForm.register("newPassword")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="••••••••"
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  {...passwordForm.register("confirmPassword")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="••••••••"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#7650e3] text-white font-semibold rounded-lg hover:bg-[#6540cc] transition disabled:opacity-60"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          {/* ── SECURITY & 2FA TAB ── */}
          {activeTab === "security" && (
            <div className="space-y-8">
              {/* Status Overview */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-purple-700" />
                  Security Status
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-5 rounded-lg border shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">Security Questions</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Account recovery
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user?.isSecurityQuestions
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {user?.isSecurityQuestions ? "SET" : "NOT SET"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg border shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">
                          Two-Factor Authentication
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Authenticator App
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user?.twoFactorEnabled
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user?.twoFactorEnabled ? "ENABLED" : "DISABLED"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Questions Section */}
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Security Questions
                  </h3>
                  {user?.isSecurityQuestions ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuestions(true);
                      }}
                      className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm font-medium"
                    >
                      Update Questions
                    </button>
                  ) : (
                    <span className="text-amber-600 font-medium">Required</span>
                  )}
                </div>

                {editingQuestions ? (
                  <form
                    onSubmit={questionsForm.handleSubmit(
                      onSecurityQuestionsSubmit
                    )}
                    className="space-y-8"
                  >
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
                        .filter(Boolean);

                      return (
                        <div key={field.id} className="space-y-6">
                          {/* Question Select */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            />
                            {questionError && (
                              <p className="mt-1 text-sm text-red-600">
                                {questionError.message}
                              </p>
                            )}
                          </div>

                          {/* Answer */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Your Answer
                            </label>
                            <input
                              type="text"
                              {...questionsForm.register(
                                `answers.${index}.answer`
                              )}
                              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                                answerError
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="Enter your answer"
                            />
                            {answerError && (
                              <p className="mt-1 text-sm text-red-600">
                                {answerError.message}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex gap-4 pt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg disabled:opacity-60 font-medium"
                      >
                        {loading ? "Saving..." : "Save Security Questions"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingQuestions(false)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-12 text-gray-600">
                    {user?.isSecurityQuestions
                      ? "Security questions are protected"
                      : "Please set up security questions first"}
                  </div>
                )}
              </div>

              {/* 2FA Section */}
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Two-Factor Authentication
                  </h3>

                  <button
                    onClick={() => {
                      if (!user?.isSecurityQuestions) {
                        notify(
                          "warning",
                          "Please set security questions first"
                        );
                        return;
                      }
                      if (user?.twoFactorEnabled) {
                        disable2FA();
                      } else {
                        setTwoFAModalOpen(true);
                      }
                    }}
                    disabled={disabling2FA || !user?.isSecurityQuestions}
                    className={`px-6 py-2.5 rounded-lg font-medium transition ${
                      user?.twoFactorEnabled
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {disabling2FA
                      ? "Processing..."
                      : user?.twoFactorEnabled
                      ? "Disable 2FA"
                      : "Enable 2FA"}
                  </button>
                </div>

                {!user?.isSecurityQuestions && (
                  <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg text-amber-800">
                    You must set up security questions before enabling
                    two-factor authentication.
                  </div>
                )}

                {user?.twoFactorEnabled && (
                  <p className="text-sm text-gray-600 mt-4">
                    2FA is active. You will be asked for a code when:
                    <br />• Logging in from new devices
                    <br />• Changing password
                    <br />• Updating security questions
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {twoFAModalOpen && user?.isSecurityQuestions && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/50 px-4 py-10 overflow-y-auto">
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

/* ── TwoFAModal Component (unchanged from your original) ── */
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

  const copyCode = () => {
    if (manualCode) {
      navigator.clipboard.writeText(manualCode);
      notify("success", "Code copied!");
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
      <div className="px-6 py-5 border-b bg-gray-50">
        <h2 className="text-xl font-bold text-center text-gray-900">
          Enable Two-Factor Authentication
        </h2>
      </div>

      <div className="p-6">
        {loadingQr && !qrCodeUrl ? (
          <p className="text-center text-gray-500">Loading QR code...</p>
        ) : qrCodeUrl ? (
          <>
            <div className="text-center mb-6">
              <p className="text-sm font-medium text-gray-700 mb-4">
                Scan with your authenticator app
              </p>
              <img
                src={qrCodeUrl}
                alt="2FA QR Code"
                className="mx-auto w-48 h-48 rounded-lg border shadow-sm"
              />
            </div>

            <div className="mb-6 text-center">
              <p className="text-xs text-gray-500 mb-2">Or enter manually:</p>
              <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                <code className="font-mono text-sm">{manualCode}</code>
                <button
                  onClick={copyCode}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Enter 6-digit code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="000000"
                autoFocus
              />
              {error && (
                <p className="mt-3 text-center text-red-600 text-sm">{error}</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-center text-red-600">
            {error || "Failed to load 2FA setup"}
          </p>
        )}
      </div>

      <div className="flex border-t px-6 py-4 gap-3 bg-gray-50">
        <button
          onClick={close}
          disabled={verifying}
          className="flex-1 py-3 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={verifySetup}
          disabled={verifying || otp.length !== 6 || !qrCodeUrl}
          className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
        >
          {verifying ? "Verifying..." : "Enable 2FA"}
        </button>
      </div>
    </div>
  );
};

/* ── CustomSelect Component (unchanged) ── */
export const CustomSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  questions: SecurityQuestion[];
  otherSelected: string[];
  error?: string;
}> = ({ value, onChange, questions, otherSelected, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const selectedQuestion = questions.find((q) => q.id === value);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 text-left bg-white border rounded-lg flex items-center justify-between transition ${
          error
            ? "border-red-500"
            : value
            ? "border-purple-500"
            : "border-gray-300"
        }`}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {selectedQuestion?.question || "Select a question..."}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${
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
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          {questions.map((q) => {
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
                className={`w-full px-4 py-3 text-left transition ${
                  value === q.id
                    ? "bg-purple-50 text-purple-700 font-medium"
                    : isDisabled
                    ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
              >
                {q.question}
                {isDisabled && (
                  <span className="ml-2 text-xs text-gray-400">
                    (already selected)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default AccountSecurityTabs;
