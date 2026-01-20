import React, { useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import logoText from ".././assets/logo-text.svg"; // ✅ same import as PrivacyPolicy

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { t } = useTranslation();

  // ✅ same back handler as PrivacyPolicy
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/dashboard");
  };

  const faqItems: FAQItem[] = [
    { id: 1, question: t("what_is_omnishare"), answer: t("create_publish_message") },
    { id: 2, question: t("ai_content_creation"), answer: t("ai_content_creation_message") },
    { id: 3, question: t("platform_support"), answer: t("platform_support_message") },
    { id: 4, question: t("multi_publish"), answer: t("multi_publish_message") },
    { id: 5, question: t("faq_security_audits"), answer: t("faq_security_audits_answer") },
    {
      id: 6,
      question: t("does_omnishare_optimize_media_for_each_platform"),
      answer: t("omnishare_auto_resizes_description"),
    },
    { id: 7, question: t("insights"), answer: t("insights_message") },
    { id: 8, question: t("publishing_speed"), answer: t("publishing_speed_message") },
    { id: 9, question: t("trend_content"), answer: t("trend_content_message") },
    { id: 10, question: t("business_suitability"), answer: t("business_suitability_message") },
    { id: 11, question: t("demos"), answer: t("demos_message") },
    { id: 12, question: t("faq_how_is_my_data_protected"), answer: t("faq_how_is_my_data_protected_answer") },
    { id: 13, question: t("faq_does_omnishare_store_credentials"), answer: t("faq_does_omnishare_store_credentials_answer") },
    { id: 14, question: t("faq_can_multiple_team_members_access"), answer: t("faq_can_multiple_team_members_access_answer") },
    { id: 15, question: t("faq_prevent_unauthorized_access"), answer: t("faq_prevent_unauthorized_access_answer") },
    { id: 16, question: t("faq_privacy_compliance"), answer: t("faq_privacy_compliance_answer") },
    { id: 17, question: t("faq_security_issue"), answer: t("faq_security_issue_answer") },
  ];

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ✅ SAME Page Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
        <div className="relative max-w-4xl mx-auto h-14 px-4 sm:px-6 lg:px-8 flex items-center">
          {/* Left: Back */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#7650e3] hover:text-[#6840c7] transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{t("back")}</span>
          </button>

          {/* Center: Logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link to="/dashboard" aria-label="Go to dashboard">
              <img src={logoText} alt="Logo" className="h-4" />
            </Link>
          </div>

          {/* Right spacer */}
          <div className="ml-auto w-[64px]" />
        </div>
      </header>

      {/* ✅ Page Content */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#7650e3] mb-2">{t("FAQ")}</h1>
            <p className="text-gray-500 font-medium">
              <Trans i18nKey="omnishare_suite">
                <strong>OmniShare</strong>
              </Trans>
            </p>
            <p className="text-gray-500 font-medium">
              <strong>{t("last_updated")}</strong>{" "}
              <time dateTime="2025-11-17">November 17, 2025</time>
            </p>
            <p className="text-gray-500 font-medium">
              <strong>{t("company_location")}</strong> United Arab Emirates (UAE)
            </p>
          </div>

          {/* Intro */}
          <section>
            <p className="mb-6 text-gray-700">
              <Trans i18nKey="faq_intro">
                <strong>OmniShare</strong>
              </Trans>
            </p>
          </section>

          {/* FAQ Items */}
          <div className="space-y-3">
            {faqItems.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-md overflow-hidden hover:border-[#7650e3] transition-colors"
              >
                <button
                  onClick={() => toggleExpand(item.id)}
                  aria-expanded={expandedId === item.id}
                  aria-controls={`faq-answer-${item.id}`}
                  className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-left font-semibold text-gray-800 flex-1">
                    {item.id}. {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#7650e3] transition-transform duration-300 flex-shrink-0 ml-4 ${
                      expandedId === item.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  id={`faq-answer-${item.id}`}
                  className={`grid transition-all duration-300 ease-in-out ${
                    expandedId === item.id
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 py-4 bg-white border-t border-gray-200">
                      <p className="text-gray-700">{item.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium text-sm">
              {t("contact_support")}{" "}
              <a
                href="mailto:support@omnishare.ai"
                className="text-[#7650e3] hover:text-[#6840c7] hover:underline font-medium"
              >
                {t("support_email")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
