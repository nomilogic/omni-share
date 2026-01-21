import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoText from "../assets/logo-text.svg";

const ReferralRewards: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBack = () => {
    // ✅ Best back behavior
    if (window.history.length > 1) navigate(-1);
    else navigate("/dashboard");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
        <div className="relative max-w-4xl mx-auto h-14 px-4 sm:px-6 lg:px-8 flex items-center">
          {/* Left: Back */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#7650e3] hover:text-[#6840c7] transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{t("back_button")}</span>
          </button>

          {/* Center: Logo (true center) */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link to="/dashboard" aria-label="Go to dashboard">
              <img src={logoText} alt="Logo" className="h-4" />
            </Link>
          </div>

          {/* Right spacer (keeps center perfect) */}
          <div className="ml-auto w-[64px]" />
        </div>
      </header>

      {/* Page Content */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title block */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#7650e3] mb-2">
              {t("referral_rewards_title")}
            </h1>
          </div>

          {/* Content */}
          <ul className="list-disc pl-6 space-y-3 text-gray-700">
            <li>{t("referral_guideline_1")}</li>
            <li>{t("referral_guideline_2")}</li>
            <li>{t("referral_guideline_3")}</li>
            <li>{t("referral_guideline_4")}</li>
            <li>{t("referral_guideline_5")}</li>
            <li>{t("referral_guideline_6")}</li>
            <li>{t("referral_guideline_7")}</li>
            <li>{t("referral_guideline_8")}</li>
            <li>{t("referral_guideline_9")}</li>
            <li>{t("referral_guideline_10")}</li>
            <li>{t("referral_guideline_11")}</li>
            <li>
              {t("referral_guideline_12_part1")}{" "}
              <Link to="/terms" className="text-[#7650e3] hover:underline">
                {t("omnishare_terms")}
              </Link>
              .
            </li>
          </ul>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium text-sm">
              {t("referral_program_effective")} {new Date().toLocaleDateString()} {t("and_applies_to_omnishare")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralRewards;
