import React, { useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { t, i18n } = useTranslation();
  const changeLanguage = (lang: any) => i18n.changeLanguage(lang);

  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: t("what_is_omnishare"),
      answer: t("create_publish_message"),
    },
    {
      id: 2,
      question: t("ai_content_creation"),
      answer: t("ai_content_creation_message"),
    },

    {
      id: 3,
      question: t("platform_support"),
      answer: t("platform_support_message"),
    },
    { id: 4, question: t("multi_publish"), answer: t("multi_publish_message") },
    {
      id: 5,
      question: t("faq_security_audits"),
      answer: t("faq_security_audits_answer"),
    },
    {
      id: 6,
      question: t("does_omnishare_optimize_media_for_each_platform"),
      answer: t("omnishare_auto_resizes_description"),
    },
    { id: 7, question: t("insights"), answer: t("insights_message") },
    {
      id: 8,
      question: t("publishing_speed"),
      answer: t("publishing_speed_message"),
    },
    { id: 9, question: t("trend_content"), answer: t("trend_content_message") },
    {
      id: 10,
      question: t("business_suitability"),
      answer: t("business_suitability_message"),
    },
    { id: 11, question: t("demos"), answer: t("demos_message") },
    {
      id: 12,
      question: t("faq_how_is_my_data_protected"),
      answer: t("faq_how_is_my_data_protected_answer"),
    },
    {
      id: 13,
      question: t("faq_does_omnishare_store_credentials"),
      answer: t("faq_does_omnishare_store_credentials_answer"),
    },
    {
      id: 14,
      question: t("faq_can_multiple_team_members_access"),
      answer: t("faq_can_multiple_team_members_access_answer"),
    },
    {
      id: 15,
      question: t("faq_prevent_unauthorized_access"),
      answer: t("faq_prevent_unauthorized_access_answer"),
    },
    {
      id: 16,
      question: t("faq_privacy_compliance"),
      answer: t("faq_privacy_compliance_answer"),
    },
    {
      id: 17,
      question: t("faq_security_issue"),
      answer: t("faq_security_issue_answer"),
    },
  ];

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="  x-2 bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[#7650e3] hover:text-[#6840c7] mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("back")}
          </button>
          <h1 className="text-3xl font-bold text-[#7650e3] mb-2">{t("FAQ")}</h1>
          <p className="text-gray-500 font-medium">
            <Trans i18nKey="omnishare_suite">
              <strong>OmniShare</strong>
            </Trans>
          </p>
          <p className="text-gray-500 font-medium">
            <strong>{t("last_updated")}</strong> November 17, 2025
          </p>
          <p className="text-gray-500 font-medium">
            <strong>{t("company_location")}</strong> United Arab Emirates (UAE)
          </p>
        </div>

        {/* Content */}

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
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#7650e3] transition-colors"
            >
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-left font-semibold text-gray-800 flex-1">
                  {item.id}. {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#7650e3] transition-transform flex-shrink-0 ml-4 ${
                    expandedId === item.id ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {expandedId === item.id && (
                <div className="px-6 py-4 bg-white border-t border-gray-200">
                  <p className="text-gray-700">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
  <p className="text-gray-500 font-medium text-sm">
    {t("contact_support")} <a
      href="mailto:support@omnishare.ai"
      className="text-[#7650e3] hover:text-[#6840c7] font-medium"
    >
      {t("support_email")}
    </a>
  </p>
</div>

      </div>
      {/* <div className="relative ">
              <motion.footer
                className="w-full   text-center text-sm theme-text-dark"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <div className=" w-full mx-auto md:px-[10%] px-3 flex flex-col justify-between sm:flex-row items-center md:justify-between ">
                  <span className="">© {new Date().getFullYear()} OmniShare</span>
      
                  <div className="hidden lg:flex flex-row gap-4 justify-center lg:-mr-36">
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#d7d7fc] transition-colors"
                      href="https://www.instagram.com/omnishare.ai/"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_367_3134)">
                          <path
                            d="M12.625 2.2896C15.8313 2.2896 16.2109 2.30366 17.4719 2.35991C18.6438 2.41147 19.2766 2.60835 19.6984 2.77241C20.2563 2.98804 20.6594 3.25054 21.0766 3.66772C21.4984 4.0896 21.7563 4.48804 21.9719 5.04585C22.1359 5.46772 22.3328 6.10522 22.3844 7.27241C22.4406 8.53804 22.4547 8.91772 22.4547 12.1193C22.4547 15.3255 22.4406 15.7052 22.3844 16.9662C22.3328 18.138 22.1359 18.7709 21.9719 19.1927C21.7563 19.7505 21.4938 20.1537 21.0766 20.5709C20.6547 20.9927 20.2563 21.2505 19.6984 21.4662C19.2766 21.6302 18.6391 21.8271 17.4719 21.8787C16.2063 21.9349 15.8266 21.949 12.625 21.949C9.41875 21.949 9.03906 21.9349 7.77813 21.8787C6.60625 21.8271 5.97344 21.6302 5.55156 21.4662C4.99375 21.2505 4.59063 20.988 4.17344 20.5709C3.75156 20.149 3.49375 19.7505 3.27813 19.1927C3.11406 18.7709 2.91719 18.1334 2.86563 16.9662C2.80938 15.7005 2.79531 15.3209 2.79531 12.1193C2.79531 8.91304 2.80938 8.53335 2.86563 7.27241C2.91719 6.10054 3.11406 5.46772 3.27813 5.04585C3.49375 4.48804 3.75625 4.08491 4.17344 3.66772C4.59531 3.24585 4.99375 2.98804 5.55156 2.77241C5.97344 2.60835 6.61094 2.41147 7.77813 2.35991C9.03906 2.30366 9.41875 2.2896 12.625 2.2896ZM12.625 0.128662C9.36719 0.128662 8.95938 0.142725 7.67969 0.198975C6.40469 0.255225 5.52813 0.461475 4.76875 0.756787C3.97656 1.06616 3.30625 1.47397 2.64063 2.14429C1.97031 2.80991 1.5625 3.48023 1.25313 4.26772C0.957812 5.03179 0.751563 5.90366 0.695313 7.17866C0.639063 8.46304 0.625 8.87085 0.625 12.1287C0.625 15.3865 0.639063 15.7943 0.695313 17.074C0.751563 18.349 0.957812 19.2255 1.25313 19.9849C1.5625 20.7771 1.97031 21.4474 2.64063 22.113C3.30625 22.7787 3.97656 23.1912 4.76406 23.4958C5.52813 23.7912 6.4 23.9974 7.675 24.0537C8.95469 24.1099 9.3625 24.124 12.6203 24.124C15.8781 24.124 16.2859 24.1099 17.5656 24.0537C18.8406 23.9974 19.7172 23.7912 20.4766 23.4958C21.2641 23.1912 21.9344 22.7787 22.6 22.113C23.2656 21.4474 23.6781 20.7771 23.9828 19.9896C24.2781 19.2255 24.4844 18.3537 24.5406 17.0787C24.5969 15.799 24.6109 15.3912 24.6109 12.1334C24.6109 8.87554 24.5969 8.46772 24.5406 7.18804C24.4844 5.91304 24.2781 5.03647 23.9828 4.2771C23.6875 3.48022 23.2797 2.80991 22.6094 2.14429C21.9438 1.47866 21.2734 1.06616 20.4859 0.761475C19.7219 0.466162 18.85 0.259912 17.575 0.203662C16.2906 0.142725 15.8828 0.128662 12.625 0.128662Z"
                            fill= "#7650e3"
                          />
      
                          <path
                            d="M12.625 5.9646C9.22188 5.9646 6.46094 8.72554 6.46094 12.1287C6.46094 15.5318 9.22188 18.2927 12.625 18.2927C16.0281 18.2927 18.7891 15.5318 18.7891 12.1287C18.7891 8.72554 16.0281 5.9646 12.625 5.9646ZM12.625 16.1271C10.4172 16.1271 8.62656 14.3365 8.62656 12.1287C8.62656 9.92085 10.4172 8.13022 12.625 8.13022C14.8328 8.13022 16.6234 9.92085 16.6234 12.1287C16.6234 14.3365 14.8328 16.1271 12.625 16.1271Z"
                            fill="#7650e3"
                          />
      
                          <path
                            d="M20.4719 5.7208C20.4719 6.51768 19.825 7.15987 19.0328 7.15987C18.2359 7.15987 17.5938 6.51299 17.5938 5.7208C17.5938 4.92393 18.2406 4.28174 19.0328 4.28174C19.825 4.28174 20.4719 4.92861 20.4719 5.7208Z"
                            fill="#7650e3"
                          />
                        </g>
      
                        <defs>
                          <clipPath id="clip0_367_3134">
                            <rect
                              width="24"
                              height="24"
                              fill="white"
                              transform="translate(0.625 0.128662)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                    </a>
      
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#d7d7fc] transition-colors"
                      href="https://www.linkedin.com/company/omnishare-ai"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        width="20"
                        height="20"
                        viewBox="0 0 24 25"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_749_992)">
                          <path
                            d="M22.2283 0.528564H1.77167C1.30179 0.528564 0.851161 0.715222 0.518909 1.04747C0.186657 1.37973 0 1.83036 0 2.30023V22.7569C0 23.2268 0.186657 23.6774 0.518909 24.0097C0.851161 24.3419 1.30179 24.5286 1.77167 24.5286H22.2283C22.6982 24.5286 23.1488 24.3419 23.4811 24.0097C23.8133 23.6774 24 23.2268 24 22.7569V2.30023C24 1.83036 23.8133 1.37973 23.4811 1.04747C23.1488 0.715222 22.6982 0.528564 22.2283 0.528564ZM7.15333 20.9736H3.545V9.5119H7.15333V20.9736ZM5.34667 7.92356C4.93736 7.92126 4.53792 7.79776 4.19873 7.56865C3.85955 7.33954 3.59584 7.0151 3.44088 6.63625C3.28591 6.25741 3.24665 5.84116 3.32803 5.44002C3.40941 5.03888 3.6078 4.67084 3.89816 4.38235C4.18851 4.09385 4.55782 3.89783 4.95947 3.81903C5.36112 3.74022 5.77711 3.78216 6.15495 3.93955C6.53279 4.09694 6.85554 4.36273 7.08247 4.70338C7.30939 5.04402 7.43032 5.44426 7.43 5.85357C7.43386 6.1276 7.38251 6.3996 7.27901 6.65337C7.17551 6.90713 7.02198 7.13746 6.82757 7.33063C6.63316 7.5238 6.40185 7.67585 6.14742 7.77772C5.893 7.87958 5.62067 7.92919 5.34667 7.92356ZM20.4533 20.9836H16.8467V14.7219C16.8467 12.8752 16.0617 12.3052 15.0483 12.3052C13.9783 12.3052 12.9283 13.1119 12.9283 14.7686V20.9836H9.32V9.52023H12.79V11.1086H12.8367C13.185 10.4036 14.405 9.19857 16.2667 9.19857C18.28 9.19857 20.455 10.3936 20.455 13.8936L20.4533 20.9836Z"
                            fill="#7650e3"
                          />
                        </g>
      
                        <defs>
                          <clipPath id="clip0_749_992">
                            <rect
                              width="24"
                              height="24"
                              fill="white"
                              transform="translate(0 0.528564)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                    </a>
      
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#d7d7fc] transition-colors"
                      href="https://www.youtube.com/@OmniShare-ai"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        width="20"
                        height="20"
                        viewBox="0 0 25 25"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_367_3138)">
                          <path
                            d="M24.3859 7.32871C24.3859 7.32871 24.1516 5.67402 23.4297 4.94746C22.5156 3.99121 21.4938 3.98652 21.025 3.93027C17.6688 3.68652 12.6297 3.68652 12.6297 3.68652H12.6203C12.6203 3.68652 7.58125 3.68652 4.225 3.93027C3.75625 3.98652 2.73438 3.99121 1.82031 4.94746C1.09844 5.67402 0.86875 7.32871 0.86875 7.32871C0.86875 7.32871 0.625 9.27402 0.625 11.2146V13.0334C0.625 14.974 0.864062 16.9193 0.864062 16.9193C0.864062 16.9193 1.09844 18.574 1.81562 19.3006C2.72969 20.2568 3.92969 20.224 4.46406 20.3271C6.38594 20.51 12.625 20.5662 12.625 20.5662C12.625 20.5662 17.6688 20.5568 21.025 20.3178C21.4938 20.2615 22.5156 20.2568 23.4297 19.3006C24.1516 18.574 24.3859 16.9193 24.3859 16.9193C24.3859 16.9193 24.625 14.9787 24.625 13.0334V11.2146C24.625 9.27402 24.3859 7.32871 24.3859 7.32871ZM10.1453 15.2412V8.4959L16.6281 11.8803L10.1453 15.2412Z"
                            fill="#7650e3"
                          />
                        </g>
      
                        <defs>
                          <clipPath id="clip0_367_3138">
                            <rect
                              width="24"
                              height="24"
                              fill="white"
                              transform="translate(0.625 0.128662)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                    </a>
      
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#d7d7fc] transition-colors"
                      href="https://www.tiktok.com/@omnishare.ai?is_from_webapp=1&sender_device=pc"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_tiktok)">
                          <path
                            d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.68v12.7a2.85 2.85 0 1 1-5.92-2.86 2.85 2.85 0 0 1 2.31 1.09V9.4a6.53 6.53 0 1 0 5.63 5.63V8.13a8.34 8.34 0 0 0 5.81 2.32v-3.7a4.5 4.5 0 0 1-.54-.06z"
                            fill="#7650e3"
                          />
                        </g>
      
                        <defs>
                          <clipPath id="clip0_tiktok">
                            <rect width="24" height="24" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </a>
      
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#d7d7fc] transition-colors"
                      href="https://www.facebook.com/share/1H74CpLTCK/"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_fb)">
                          <path
                            d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07813V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z"
                            fill="#7650e3"
                          />
                        </g>
      
                        <defs>
                          <clipPath id="clip0_fb">
                            <rect width="24" height="24" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </a>
                  </div>
      
                  <div className="flex flex-wrap justify-center space-x-3 text-sm theme-text-dark">
                    <Link
                      to="/privacy"
                      onClick={() => window.scrollTo(0, 0)}
                      className="transition-colors duration-200 underline"
                    >
                      {t("privacy_policy")}
                    </Link>
      
                    <Link
                      to="/terms"
                      onClick={() => window.scrollTo(0, 0)}
                      className="transition-colors duration-200 underline "
                    >
                      {t("terms_service")}
                    </Link>
      
                    <Link
                      to="/support"
                      onClick={() => window.scrollTo(0, 0)}
                      className="transition-colors duration-200 underline"
                    >
                      {t("support")}
                    </Link>
                  </div>
                </div>
              </motion.footer>
            </div> */}
    </div>
  );
};

export default FAQ;
