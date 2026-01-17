"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Shield,
  Lock,
  Key,
  Smartphone,
  Copy,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useModal } from "../context2/ModalContext";
import API from "@/services/api";
import { useForm, useFieldArray } from "react-hook-form";
import { maxLength, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { notify } from "@/utils/toast";
import { AuthenticatorModal } from "./AuthenticatorModal";
import { FC } from "react";

const AuthenticatorModalWrapper: FC<any> = ({
  close,
  isResetPassword,
  pendingQuestions,
  onSuccess,
  pendingAction,
  verifyOtp,
  passwordsValue,
}) => {
  return (
    <AuthenticatorModal
      open={true}
      onClose={close}
      isResetPassword={isResetPassword}
      pendingQuestions={pendingQuestions}
      onSuccess={onSuccess}
      pendingAction={pendingAction}
      verifyOtp={verifyOtp}
      passwordsValue={passwordsValue}
    />
  );
};

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
  const { setPasswordEditing, refreshUser, user, security_question }: any =
    useAppContext();
  const { openModal } = useModal();

  const [activeTab, setActiveTab] = useState<"password" | "security">(
    "password"
  );
  const [loading, setLoading] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);

  const [pendingAction, setPendingAction] = useState<any>(null);
  const [editingQuestions, setEditingQuestions] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);

  const [pendingQuestions, setPendingQuestions] =
    useState<SecurityQuestionsFormType | null>(null);

  useEffect(() => {
    if (user && !user.isSecurityQuestions) {
      setEditingQuestions(true);
    }
  }, [user]);

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
        { questionId: "", answer: "" },
        { questionId: "", answer: "" },
      ],
    },
  });

  const { fields } = useFieldArray({
    control: questionsForm.control,
    name: "answers",
  });
  const openAuthModal = (action: any, passwordsValue?: any) => {
    console.log("action", action);
    openModal(AuthenticatorModalWrapper, {
      isResetPassword: action == "disable-2fa" ? false : true,
      pendingQuestions: pendingQuestions,
      onSuccess: handleAuthSuccess,
      pendingAction: action,
      passwordsValue: passwordsValue,
      verifyOtp:
        action == "disable-2fa"
          ? disable2FAConfirm
          : action == "update-questions"
          ? saveSecurityQuestions
          : action == null
          ? verifyResetpassword
          : null,
    });
  };

  const onPasswordSubmit = (data: PasswordFormType) => {
    openAuthModal(null, data);
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

  const verifyResetpassword = async (otp: string, password: any) => {
    const res = await API.updatePassword({
      currentPassword: password?.currentPassword,
      newPassword: password?.newPassword,
      otp,
    });
    notify("success", "Password updated successfully");
    passwordForm.reset();
    return res.data;
  };

  const onSecurityQuestionsSubmit = async (data: SecurityQuestionsFormType) => {
    if (user?.twoFactorEnabled) {
      setPendingQuestions(data);
      setPendingAction("update-questions");
      openAuthModal("update-questions");
      return;
    }

    await saveSecurityQuestions(data);
  };

  const saveSecurityQuestions = async (
    data: SecurityQuestionsFormType,
    otp?: string
  ) => {
    setLoading(true);
    try {
      const payload = {
        answers: data.answers.map((item) => ({
          questionId: item.questionId,
          answer: item.answer.trim(),
        })),
        ...(otp && { otp }),
      };

      await API.securityAnswers(payload);

      notify("success", "Security questions saved ");
      refreshUser();
      setEditingQuestions(false);
      questionsForm.reset();
      setPendingQuestions(null);
    } catch (err: any) {
      notify(
        "error",
        err.response?.data?.message || "Failed to save security questions"
      );
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = () => {
    setPendingAction("disable-2fa");
    openAuthModal("disable-2fa");
  };

  const disable2FAConfirm = async (otp: any) => {
    setDisabling2FA(true);
    try {
      await API.disable2FA(otp);
    } catch (err: any) {
      notify("error", err.response?.data?.message || "Failed to disable 2FA");
    } finally {
      setDisabling2FA(false);
    }
  };

  const handle2FASuccess = () => {
    refreshUser();
  };

  const handleAuthSuccess = () => {
    if (pendingAction === "disable-2fa") {
      notify("success", "Two-factor authentication disabled");
    }
    refreshUser();
  };

  const tabs = [
    { id: "password", label: "Update Password", icon: Lock },
    { id: "security", label: "Security & 2FA", icon: Shield },
  ];

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
    if (!qrCodeUrl && !user?.twoFactorEnabled) {
      start2FASetup();
    }
  }, [qrCodeUrl, user?.twoFactorEnabled]);

  const handleContinueTo2FA = async () => {
    const isValid = await questionsForm.trigger();

    if (!isValid) {
      return;
    }

    setStep(2);
  };

  const handleConfirmAndSecure = async () => {
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return;
    }

    setLoading(true);

    try {
      await API.verify2FASetup({ token: otp });

      const payload = {
        otp,
        answers: questionsForm.getValues("answers").map((item) => ({
          questionId: item.questionId,
          answer: item.answer.trim(),
        })),
      };

      await API.securityAnswers(payload);

      notify(
        "success",
        "Security questions and 2FA have been successfully set up!"
      );
      refreshUser();

      questionsForm.reset();
      setStep(1);
      setOtp("");
      setQrCodeUrl(null);
      setManualCode(null);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Setup failed. Please try again.";
      notify("error", message);
    } finally {
      setLoading(false);
    }
  };

  const resetAllStates = () => {
    setLoading(false);
    setDisabling2FA(false);
    setPendingAction(null);
    setEditingQuestions(false);
    questionsForm.reset();
    passwordForm.reset();
    setError("");
    setOtp("");
    setStep(1);
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="mb-5 w-full">
          <div className="flex md:justify-between md:flex-row flex-col-reverse items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-black w-full">
              Account Security
            </h1>
            <button
              onClick={() => setPasswordEditing?.(false)}
              className="flex gap-2 top-5 text-[#7650e3] hover:text-[#6540cc] font-semibold transition-colors w-full justify-end text-sm hover:underline"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-3 ">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);

                    resetAllStates();
                  }}
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
          {activeTab === "password" && (
            <form
              onSubmit={passwordForm.handleSubmit(
                user?.twoFactorEnabled ? onPasswordSubmit : Resetpassword
              )}
              className="space-y-3 "
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  {...passwordForm.register("currentPassword")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="••••••••"
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">
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
                  {...passwordForm.register("newPassword")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="••••••••"
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">
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
                  {...passwordForm.register("confirmPassword")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                className="w-full py-3  text-white px-4 rounded-md font-semibold text-md  border border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] transition disabled:opacity-60"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          {activeTab === "security" && (
            <div className="space-y-3">
              <div className="bg-white p-5 rounded-md border ">
                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-purple-700" />
                  Security Status
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                  <div className="p-5 rounded-md border shadow-sm ">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">Security Questions</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Account recovery
                        </p>
                      </div>
                      <span
                        className= "px-3 py-1 rounded-md text-xs font-medium bg-purple-100 "
                          
                      >
                        {user?.isSecurityQuestions ? "SET" : "NOT SET"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-md border shadow-sm ">
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
                        className="px-3 py-1 rounded-md bg-purple-100 text-xs font-medium" 
                      >
                        {user?.twoFactorEnabled ? "ENABLED" : "DISABLED"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {user.isSecurityQuestions === false &&
              user.twoFactorEnabled === false ? (
                <div className="bg-white p-5 rounded-md shadow-sm border  mx-auto ">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {step === 1
                        ? "Set Security Questions"
                        : "Enable Two-Factor Authentication"}
                    </h2>
                    <p className="mt-2 text-gray-600">
                      {step === 1
                        ? "Choose two security questions — these help recover your account"
                        : "Scan the QR code with your authenticator app"}
                    </p>
                  </div>

                  {/* Step 1: Security Questions */}
                  {step === 1 && (
                    <div className="space-y-3">
                      {questionsForm.watch("answers").map((_, index) => {
                        const questionError =
                          questionsForm.formState.errors.answers?.[index]
                            ?.questionId;
                        const answerError =
                          questionsForm.formState.errors.answers?.[index]
                            ?.answer;

                        return (
                          <div key={index} className="space-y-3 ">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5  ">
                                Question {index + 1}
                              </label>
                              <CustomSelect
                                value={questionsForm.watch(
                                  `answers.${index}.questionId`
                                )}
                                onChange={(value) =>
                                  questionsForm.setValue(
                                    `answers.${index}.questionId`,
                                    value,
                                    { shouldValidate: true }
                                  )
                                }
                                questions={security_question} // ← assume this comes from props or context
                                otherSelected={questionsForm
                                  .getValues("answers")
                                  .filter((_, i) => i !== index)
                                  .map((a) => a.questionId)}
                                error={questionError?.message}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Your Answer
                              </label>
                              <input
                                {...questionsForm.register(
                                  `answers.${index}.answer`
                                )}
                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition ${
                                  answerError
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                placeholder="Enter your answer here..."
                              />
                              {answerError && (
                                <p className="mt-1.5 text-sm text-red-600">
                                  {answerError.message}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Step 2: 2FA Setup */}
                  {step === 2 && (
                    <div className="space-y-8">
                      {loading && !qrCodeUrl ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-4" />
                          <p className="text-gray-600">
                            Preparing 2FA setup...
                          </p>
                        </div>
                      ) : qrCodeUrl ? (
                        <>
                          {/* QR Code */}
                          <div className="text-center space-y-3">
                            <p className="text-sm text-gray-600">
                              Scan this QR code with your authenticator app
                              (Google Authenticator, Authy, etc.)
                            </p>
                            <div className="inline-block p-4 bg-white rounded-xl shadow-inner border">
                              <img
                                src={qrCodeUrl}
                                alt="2FA QR Code"
                                className="w-48 h-48 mx-auto"
                              />
                            </div>
                          </div>

                          {/* Manual code */}
                          {manualCode && (
                            <div className="text-center">
                              <p className="text-sm text-gray-500 mb-2">
                                Can't scan? Use this manual code:
                              </p>
                              <div className="font-mono bg-gray-100 px-6 py-3 rounded-lg inline-block text-lg tracking-wider">
                                {manualCode}
                              </div>
                            </div>
                          )}

                          {/* OTP Input */}
                          <div className="space-y-3">
                            <label className="block text-center text-sm font-medium text-gray-700">
                              Enter 6-digit code from your authenticator app
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              value={otp}
                              onChange={(e) => {
                                const val = e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 6);
                                setOtp(val);
                              }}
                              className="w-full max-w-xs mx-auto block text-center text-3xl font-mono tracking-widest py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                              placeholder="000000"
                            />
                          </div>
                        </>
                      ) : (
                        <p className="text-center text-red-600 py-8">
                          Failed to load QR code. Please try again.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 mt-10">
                    {step === 2 && (
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        disabled={loading}
                        className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                      >
                        Back
                      </button>
                    )}

                    {step === 1 ? (
                      <button
                        type="button"
                        onClick={handleContinueTo2FA}
                        disabled={
                          loading || questionsForm.formState.isSubmitting
                        }
                        className="flex-1 py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-60 font-medium flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : null}
                        Continue
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConfirmAndSecure}
                        disabled={loading || otp.length !== 6}
                        className="flex-1 py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-60 font-medium flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : null}
                        Confirm & Secure Account
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white p-5 rounded-md border shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800">
                        Security Questions
                      </h3>
                      {user?.isSecurityQuestions ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingQuestions(true);
                          }}
                          className="px-2 py-2 w-28 rounded-md font-medium transition  text-white  border border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Update
                        </button>
                      ) : (
                        <span className="text-amber-600 font-medium">
                          Required
                        </span>
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
                            questionsForm.formState.errors.answers?.[index]
                              ?.answer;
                          const currentValue = questionsForm.watch(
                            `answers.${index}.questionId`
                          );

                          const otherSelected = questionsForm
                            .getValues("answers")
                            .filter((_, i) => i !== index)
                            .map((a) => a.questionId)
                            .filter(Boolean);

                          return (
                            <div key={field.id} className="space-y-3">
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
                                  
                                  questions={security_question}
                                  otherSelected={otherSelected}
                                  error={questionError?.message}
                                  
                                />
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
                                  className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
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

                        <div className="flex gap-3  md:flex-row flex-col">
                          <button
                            type="button"
                            onClick={() => setEditingQuestions(false)}
                            className="flex-1 bg-transparent border-purple-600 border text-purple-600 hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] py-3 rounded-md font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 text-white text-md transition-all border border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] py-3 rounded-md disabled:opacity-60 font-medium"
                          >
                            {loading ? "Saving..." : "Save Security Questions"}
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

                  <div className="bg-white p-5 rounded-md border shadow-sm">
                    <div className="flex-1 flex-row md:flex items-center justify-between">
                      <h3 className="  text-xl font-bold text-gray-800  mb-2 ">
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
                            openModal(TwoFAModal, {
                              onSuccess: handle2FASuccess,
                              qrCodeUrl,
                              manualCode,
                              loadingQr,
                              setError,
                              error,
                            });
                          }
                        }}
                        disabled={disabling2FA || !user?.isSecurityQuestions}
                        className={`px-2 py-2 w-full md:w-28 rounded-md font-medium transition ${
                          user?.twoFactorEnabled
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "text-white text-md transition-all border border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3]"
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
                      <div className="bg-amber-50 mt-5 border border-amber-200 p-5 rounded-md text-amber-800">
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
          )}
        </div>
      </div>
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

  const copyCode = () => {
    if (manualCode) {
      navigator.clipboard.writeText(manualCode);
      notify("success", "Code copied!");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1001,
      }}
      className="bg-white p-5 rounded-md border shadow-sm max-w-md w-full mx-auto"
    >
      <h2 className="text-xl font-bold text-gray-800 text-center mb-3">
        Enable Two-Factor Authentication
      </h2>

      {loadingQr && !qrCodeUrl ? (
        <p className="text-center text-gray-500">Loading QR code...</p>
      ) : qrCodeUrl ? (
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code using Authenticator app
            </p>
            <img
              src={qrCodeUrl}
              className="mx-auto w-44 h-44 rounded-md border shadow-sm"
            />
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Manual Code</p>
            <div className="mt-2 inline-flex items-center gap-2    font-mono bg-gray-100 px-4 py-2 rounded-md">
              {manualCode}
              <button
                onClick={copyCode}
                className="text-purple-600 hover:text-purple-800"
              >
                <Copy size={18} />
              </button>
            </div>
          </div>

          <input
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="000000"
            className="w-full text-center tracking-widest text-2xl font-mono
                   border border-gray-300 px-4 py-2 rounded-md
                   focus:outline-none focus:ring-2 focus:ring-purple-500 outline-none"
          />

          {error && <p className="text-center text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-4">
            <button
              onClick={close}
              disabled={verifying}
              className="flex-1 rounded-md theme-bg-light text-base border border-[#7650e3] text-[#7650e3] transition-colors hover:bg-[#d7d7fc] theme-bg-light  py-2  hover:bg-[#d7d7fc]t-[#7650e3] hover:border-[#7650e3]"
            >
              Cancel
            </button>

            <button
              onClick={verifySetup}
              disabled={verifying || otp.length !== 6}
              className="flex-1 py-2 rounded-md text-white text-md transiton-all border border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3]disabled:opacity-50  "
            >
              {verifying ? "Verifying..." : "Enable 2FA"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-red-600">
          {error || "Failed to load 2FA setup"}
        </p>
      )}
    </div>
  );
};

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
        className={`w-full px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-left bg-white border rounded-md flex items-center justify-between transition ${
          error
            ? "border-red-500"
            : value
            ? "border-purple-500"
            : "border-gray-300"
        }`}
      >
        <span className={value ?  "text-gray-900" : "text-gray-500"}>
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
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-xl z-50 max-h-64 overflow-y-auto">
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
                <br />
                {isDisabled && (
                  <span className=" text-xs bg-gray-200 px-2 py-1 rounded-full">
                    Already selected
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AccountSecurityTabs;
