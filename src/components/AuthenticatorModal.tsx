"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { notify } from "@/utils/toast";
import API from "@/services/api";
import { useForm, useFieldArray } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppContext } from "@/context/AppContext";

type AuthMethod = "totp" | "security";

interface SecurityQuestion {
  id: string;
  question: string;
}

interface SecurityAnswer {
  questionId: string;
  answer: string;
}

interface AuthenticatorModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data?: any) => void;
  verifyOtp: (payload: any) => Promise<any>;
  buttonText?: string;
}

// Custom Select Component (Hook-safe)
const CustomSelect: React.FC<{
  index: number;
  value: string;
  onChange: (value: string) => void;
  questions: SecurityQuestion[];
  otherSelected: string[];
  error?: string;
  label: string;
  disable: Boolean;
}> = ({
  index,
  value,
  onChange,
  questions,
  otherSelected,
  error,
  label,
  disable = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedQuestion = questions.find((q) => q.id === value);

  // Close on outside click
  useEffect(() => {
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
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-semibold text-gray-800 mb-2">
        {label}
      </label>

      <button
        type="button"
        disabled={disable === true}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2.5 text-left bg-white rounded-md border transition-all duration-200 flex items-center justify-between focus:outline-none focus:ring-4 focus:ring-purple-100 group ${
          error
            ? "border-red-400"
            : value
            ? "border-purple-500 shadow-md"
            : "border-purple-500 shadow-md"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={value ? "text-black " : "text-gray-600"}>
          {selectedQuestion?.question || "Select a security question..."}
        </span>
        {disable !== true && (
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform duration-200 group-hover:text-gray-700 ${
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

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-xl z-50 max-h-64 overflow-y-auto">
          {questions.map((q) => {
            const isSelected = value === q.id;
            const isDisabled = otherSelected.includes(q.id);

            return (
              <button
                key={q.id}
                type="button"
                disabled={isDisabled || disable === true}
                onClick={() => {
                  onChange(q.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-4 text-left transition-all first:rounded-t-md last:rounded-b-md ${
                  isSelected
                    ? "bg-purple-50 text-purple-700 font-semibold border-l-4 border-purple-500"
                    : isDisabled
                    ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                    : "hover:bg-gray-50 text-black"
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

      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

const securityQuestionsSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1, "Please select a question"),
        answer: z.string().trim().min(1, "Answer is required"),
      })
    )
    .length(2, "You must answer exactly 2 questions")
    .refine(
      (arr) => new Set(arr.map((a) => a.questionId)).size === arr.length,
      { message: "You cannot select the same question twice" }
    ),
});

type SecurityQuestionsFormType = z.infer<typeof securityQuestionsSchema>;

export const AuthenticatorModal = ({
  open,
  onClose,
  onSuccess,
  verifyOtp,
  buttonText,
  isResetPassword = false,
  pendingQuestions,
  pendingAction,
  question = [],
  passwordsValue,
}: any) => {
  console.log("passwordsValue", passwordsValue);
  const [authMethod, setAuthMethod] = useState<AuthMethod>("totp");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { security_question } = useAppContext();
  const questionsForm = useForm<SecurityQuestionsFormType>({
    resolver: zodResolver(securityQuestionsSchema),
    defaultValues: {
      answers: [
        { questionId: question[0]?.securityQuestionId || "", answer: "" },
        { questionId: question[1]?.securityQuestionId || "", answer: "" },
      ],
    },
  });
  useEffect(() => {
    if (!question || question.length === 0) return;

    questionsForm.setValue(
      "answers",
      question?.map((q: any) => ({
        questionId: q?.securityQuestionId,
        answer: "",
      }))
    );
  }, [open, question]);

  const { fields } = useFieldArray({
    control: questionsForm.control,
    name: "answers",
  });

  useEffect(() => {
    if (open) {
      setAuthMethod("totp");
      setOtp("");
    }
  }, [open, questionsForm]);

  const handleQuestionChange = useCallback(
    (index: number, questionId: string) => {
      questionsForm.setValue(`answers.${index}.questionId`, questionId, {
        shouldValidate: true,
      });
    },
    [questionsForm]
  );

  const handleVerify = async () => {
    const session = localStorage.getItem("mfa_session_token");

    if (!session && isResetPassword == false && pendingAction !== "disable-2fa")
      throw new Error("Session expired");

    setLoading(true);
    try {
      if (authMethod === "totp") {
        if (!/^\d{6}$/.test(otp)) {
          setLoading(false);
          return;
        }
        if (pendingAction === "update-questions") {
          const result = await verifyOtp(pendingQuestions, otp);
          onSuccess(result);
          onClose();
        } else {
          const result = await verifyOtp(otp, passwordsValue ?? passwordsValue);
          onSuccess(result);
          onClose();
        }
      } else {
        const formValues = questionsForm.getValues();

        const answers = formValues.answers;
        if (
          !answers ||
          answers.length < 2 ||
          answers.some((a) => !a.questionId || !a.answer.trim())
        ) {
          return;
        }

        const questionIds = answers.map((a) => a.questionId);
        if (new Set(questionIds).size !== questionIds.length) {
          return;
        }
        let result;
        if (pendingAction === "disable-2fa") {
          result = await API.securityQuestionDisable2FA({
            answers: formValues.answers,
          });
        } else {
          result = await API.verifySecretLogin({
            answers: formValues.answers,
            session,
          });
        }
        onSuccess(result.data);
        onClose();
      }
    } catch (err: any) {
      console.log("err", err);
      const message =
        err?.response?.data?.message || err?.message || "Verification failed.";
      notify("error", message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 ">
      <div className="w-full max-w-[460px] rounded-md bg-white px-6 py-10 shadow-md animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-black mb-2">
            Two-Factor Authentication
          </h2>
          <p className="text-sm text-gray-600">
            {authMethod === "totp"
              ? "Enter the code from your authenticator app"
              : "Answer your security questions to continue"}
          </p>
        </div>

        {authMethod === "totp" && (
          <>
            <div className="mb-6">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="••••••"
                className="w-full rounded-md border border-purple-600  px-6 py-3 text-center text-lg font-mono tracking-widest text-purple-600 focus:outline-none  transition-all"
              />
              {isResetPassword == false && (
                <button
                  type="button"
                  onClick={() => setAuthMethod("security")}
                  className="w-full text-sm text-purple-600 underline text-right mt-3 hover:text-purple-700 font-medium hover:underline transition-colors"
                >
                  Authenticator Unavailable?
                </button>
              )}
            </div>
          </>
        )}

        {authMethod === "security" && (
          <div className="space-y-6">
            {fields.map((field, index) => {
              const questionError =
                questionsForm.formState.errors.answers?.[index]?.questionId;
              const answerError =
                questionsForm.formState.errors.answers?.[index]?.answer;
              const currentValue = questionsForm.watch(
                `answers.${index}.questionId`
              );

              const otherSelected = questionsForm
                .getValues("answers")
                .filter((_, i) => i !== index)
                .map((a) => a.questionId)
                .filter(Boolean) as string[];

              return (
                <div key={field.id} className="space-y-4">
                  <CustomSelect
                    index={index}
                    value={currentValue}
                    disable={question.length ? true : false}
                    onChange={(value) => handleQuestionChange(index, value)}
                    questions={security_question}
                    otherSelected={otherSelected}
                    error={questionError?.message}
                    label={`Question ${index + 1}`}
                  />

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Your Answer
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your answer here..."
                      autoComplete="off"
                      {...questionsForm.register(`answers.${index}.answer`)}
                      className={`w-full px-3 py-2.5 rounded-md border bg-white placeholder-gray-600 text-black transition-all focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                        answerError
                          ? "border-red-400 focus:border-red-400"
                          : "border-gray-300 hover:border-gray-400 focus:border-purple-500"
                      }`}
                    />
                    {answerError && (
                      <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {answerError.message}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {questionsForm.formState.errors.answers?.root && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700 text-center font-medium">
                  {questionsForm.formState.errors.answers.root.message}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setAuthMethod("totp")}
              className="w-full flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors py-2.5"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to authenticator code
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleVerify}
            disabled={loading}
            className="flex-1 rounded-md bg-purple-600 text-white hover:text-[#7650e3] hover:bg-[#d7d7fc] border border-[#7650e3] py-2.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed  "
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Verifying...
              </span>
            ) : (
              buttonText || "Verify & Continue"
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 theme-bg-light text-base border border-[#7650e3] text-[#7650e3] transition-colors hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] font-semibold py-2.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed "
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
