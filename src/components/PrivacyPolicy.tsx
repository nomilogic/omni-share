import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Globe, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import logoText from ".././assets/logo-text.svg"; // ✅ apne path ke hisaab se change

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/dashboard");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ✅ Page Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
        <div className="relative max-w-4xl mx-auto h-14 px-4 sm:px-6 lg:px-8 flex items-center">
          {/* Left: Back */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#7650e3] hover:text-[#6840c7] transition-colors font-semibold"
            title={t("tooltip_back_button")}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{t("back") || "Back"}</span>
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
            <h1 className="text-3xl font-bold text-[#7650e3] mb-2">
              {t("privacy_policy_title")}
            </h1>
            <p className="text-gray-500 font-medium">
              <strong>OmniShare</strong> – {t("privacy_policy_subtitle")}
            </p>
            <p className="text-gray-500 font-medium">
              <strong>{t("privacy_policy_last_updated")}:</strong> {t("privacy_policy_date")}
            </p>
            <p className="text-gray-500 font-medium">
              <strong>{t("privacy_policy_location")}:</strong> {t("privacy_policy_location_uae")}
            </p>
          </div>

          {/* Content */}
          <section>
            <p className="mb-4">
              {t("privacy_intro")}
            </p>
            <p className="mb-4">
              {t("privacy_agreement")}
            </p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              1. {t("privacy_section_1_title")}
            </h2>

            <h3 className="font-semibold mb-1">{t("privacy_section_1_1")}</h3>
            <ul className="list-disc pl-6 mb-2">
              <li>
                <strong>{t("privacy_account_details")}:</strong>
              </li>
              <li>
                <strong>{t("privacy_business_info")}:</strong>
              </li>
              <li>
                <strong>{t("privacy_content")}:</strong>
              </li>
              <li>
                <strong>{t("privacy_payment_details")}:</strong>
              </li>
            </ul>

            <h3 className="font-semibold mb-1">{t("privacy_section_1_2")}</h3>
            <ul className="list-disc pl-6 mb-2">
              <li>
                <strong>{t("privacy_device_info")}</strong>
              </li>
              <li>
                <strong>{t("privacy_ip_location")}</strong>
              </li>
              <li>
                <strong>{t("privacy_usage_data")}</strong>
              </li>
              <li>
                <strong>{t("privacy_cookies")}</strong>
              </li>
            </ul>

            <h3 className="font-semibold mb-1">{t("privacy_section_1_3")}</h3>
            <p>
              {t("privacy_integration_intro")}
            </p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("privacy_profile_id")}</strong></li>
              <li><strong>{t("privacy_permissions")}</strong></li>
              <li><strong>{t("privacy_publishing_access")}</strong></li>
              <li><strong>{t("privacy_analytics_metrics")}</strong></li>
            </ul>
            <p>{t("privacy_minimal_access")}</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              2. {t("privacy_section_2_title")}
            </h2>
            <p>{t("privacy_section_2_intro")}:</p>
            <ul className="list-disc pl-6 mb-2">
              <li>{t("privacy_section_2_item_1")}</li>
              <li>{t("privacy_section_2_item_2")}</li>
              <li>{t("privacy_section_2_item_3")}</li>
              <li>{t("privacy_section_2_item_4")}</li>
              <li>{t("privacy_section_2_item_5")}</li>
              <li>{t("privacy_section_2_item_6")}</li>
              <li>{t("privacy_section_2_item_7")}</li>
              <li>{t("privacy_section_2_item_8")}</li>
              <li>{t("privacy_section_2_item_9")}</li>
            </ul>
            <p>{t("privacy_section_2_disclaimer")}</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              3. {t("privacy_section_3_title")}
            </h2>
            <p>{t("privacy_section_3_intro")}:</p>

            <h3 className="font-semibold mb-1">{t("privacy_section_3_1_title")}</h3>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("privacy_section_3_1_item_1")}</strong></li>
              <li><strong>{t("privacy_section_3_1_item_2")}</strong></li>
              <li><strong>{t("privacy_section_3_1_item_3")}</strong></li>
              <li><strong>{t("privacy_section_3_1_item_4")}</strong></li>
            </ul>

            <h3 className="font-semibold mb-1">{t("privacy_section_3_2_title")}</h3>
            <p>
              {t("privacy_section_3_2_content")}
            </p>

            <h3 className="font-semibold mb-1">{t("privacy_section_3_3_title")}</h3>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("privacy_section_3_3_item_1")}</strong></li>
              <li><strong>{t("privacy_section_3_3_item_2")}</strong></li>
              <li><strong>{t("privacy_section_3_3_item_3")}</strong></li>
            </ul>
            <p>{t("privacy_section_3_3_disclaimer")}</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              4. {t("privacy_section_4_title")}
            </h2>
            <p>{t("privacy_section_4_intro")}</p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("privacy_section_4_item_1")}</strong></li>
              <li><strong>{t("privacy_section_4_item_2")}</strong></li>
              <li><strong>{t("privacy_section_4_item_3")}</strong></li>
            </ul>
            <p>{t("privacy_section_4_disclaimer")}</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              5. {t("privacy_section_5_title")}
            </h2>
            <p>{t("privacy_section_5_intro")}:</p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("privacy_section_5_item_1")}:</strong> {t("privacy_section_5_item_1_desc")}</li>
              <li><strong>{t("privacy_section_5_item_2")}:</strong> {t("privacy_section_5_item_2_desc")}</li>
              <li><strong>{t("privacy_section_5_item_3")}:</strong> {t("privacy_section_5_item_3_desc")}</li>
              <li><strong>{t("privacy_section_5_item_4")}:</strong> {t("privacy_section_5_item_4_desc")}</li>
              <li><strong>{t("privacy_section_5_item_5")}:</strong> {t("privacy_section_5_item_5_desc")}</li>
            </ul>
            <p>{t("privacy_section_5_contact_intro")}:</p>
            <p className="font-medium">support@omnishare.ai</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              6. {t("privacy_section_6_title")}
            </h2>
            <p>{t("privacy_section_6_intro")}:</p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("privacy_section_6_item_1")}</strong></li>
              <li><strong>{t("privacy_section_6_item_2")}</strong></li>
              <li><strong>{t("privacy_section_6_item_3")}</strong></li>
              <li><strong>{t("privacy_section_6_item_4")}</strong></li>
            </ul>
            <p>{t("privacy_section_6_disclaimer")}</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              7. {t("privacy_section_7_title")}
            </h2>
            <p>{t("privacy_section_7_intro")}:</p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("privacy_section_7_item_1")}</strong></li>
              <li><strong>{t("privacy_section_7_item_2")}</strong></li>
              <li><strong>{t("privacy_section_7_item_3")}</strong></li>
            </ul>
            <p>{t("privacy_section_7_disclaimer")}</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              8. {t("privacy_section_8_title")}
            </h2>
            <p>{t("privacy_section_8_intro")}</p>
            <p>{t("privacy_section_8_content")}</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              9. {t("privacy_section_9_title")}
            </h2>
            <p>{t("privacy_section_9_content_1")}</p>
            <p>{t("privacy_section_9_content_2")}</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              10. {t("privacy_section_10_title")}
            </h2>
            <p>{t("privacy_section_10_content_1")}</p>
            <p>{t("privacy_section_10_content_2")}</p>
            <p>{t("privacy_section_10_content_3")}</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              11. {t("privacy_section_11_title")}
            </h2>
            <p>{t("privacy_section_11_intro")}:</p>

            <ul className="mt-3 space-y-2">
              <li>
                <a href="mailto:support@omnishare.ai" className="text-[#7650e3] hover:underline">
                  <Mail className="w-4 h-4 inline mr-2" />
                  support@omnishare.ai
                </a>
              </li>
              <li>
                <a
                  href="https://www.omnishare.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7650e3] hover:underline"
                >
                  <Globe className="w-4 h-4 inline mr-2" />
                  www.omnishare.ai
                </a>
              </li>
              <li>
                <a
                  href="https://maps.google.com/?q=United+Arab+Emirates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7650e3] hover:underline"
                >
                  <MapPin className="w-4 h-4 inline mr-2" />
                  {t("privacy_policy_location_uae")}
                </a>
              </li>
            </ul>
          </section>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium text-sm">
              {t("privacy_policy_footer_text")} {new Date().toLocaleDateString()} {t("privacy_policy_footer_suffix")}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
