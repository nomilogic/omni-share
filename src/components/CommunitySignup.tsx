import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = (t: any) =>
  z.object({
    email: z
      .string()
      .min(1, t("please_enter_email_address"))
      .email(t("please_enter_valid_email")),
  });

type FormData = {
  email: string;
};

const CommunitySignup: React.FC = () => {
  const changeLanguage = (lang: any) => i18n.changeLanguage(lang);
  const [loading, setLoading] = useState(false);

  const { t, i18n } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema(t)),
  });

  const onSubmit = (data: FormData) => {
    setLoading(true);
    setTimeout(() => {
      console.log("Form submitted:", data);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="relative bg-gray-50 pt-8 md:pt-14 pb-8 md:pb-14 overflow-hidden">
      {/* Floating Decorative Dots/Shapes (Mimicking the image) */}
      {/* Top Left - Small Blue Dot */}
      <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60 hidden sm:block"></div>

      {/* Mid Left - Larger Dark Blue Dot */}
      <div className="absolute top-1/3 left-[20%] w-2 h-2 bg-indigo-900 rounded-full hidden sm:block"></div>

      {/* Top Left - Large Purple Dot */}

      {/* Mid Center - Small Diamond */}

      {/* Top Right - Diamond */}

      {/* Mid Right - Dark Blue Dot */}
      <div className="absolute top-1/2 right-[25%] w-3 h-3 bg-indigo-900 rounded-full hidden sm:block"></div>

      {/* Bottom Right - Small Blue Dot */}
      <div className="absolute bottom-[25%] right-[20%] w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60 hidden sm:block"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t("join_our_community_today_and")}
            <br />
            {t("never_miss_an_update")}
          </h2>

          {/* Email Signup Form/Input Area */}
          <form
            className="mt-4 md:mt-5 max-w-sm mx-auto sm:flex sm:justify-center sm:gap-3"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="min-w-0 flex-1">
              <label htmlFor="email-address" className="sr-only ">
                Email Address
              </label>
              <input
                id="email-address"
                type="text"
                autoComplete="email"
                className="px-3 py-2 w-64 rounded-md bg-white border border-purple-600 text-black placeholder-black-600/80 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
                placeholder={t("email_address")}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 text-left w-64 mx-auto sm:mx-0">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="mt-3 sm:mt-0 sm:ml-4">
              <button
                type="submit"
                className={`
    transition font-semibold shadow-lg inline-flex items-center justify-center space-x-2

    /* MOBILE (<640px) style */
    bg-[#7650e3] text-white px-8 py-3 rounded-full text-base

    /* DESKTOP (>=640px) — KEEP EXACTLY ORIGINAL */
    sm:px-4 sm:py-2 sm:w-[110px] sm:rounded-md sm:border
    ${
      loading
        ? "sm:bg-purple-600 sm:text-white sm:border-purple-600 sm:cursor-not-allowed"
        : "sm:bg-white sm:text-theme-secondary sm:border-purple-600"
    }
  `}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 01-8-8z"
                      ></path>
                    </svg>
                    {t("joining")}...
                  </div>
                ) : (
                  t("join_now")
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommunitySignup;
