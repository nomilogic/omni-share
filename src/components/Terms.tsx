import React from "react";
import { ArrowLeft, Mail, Globe, MapPin } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoText from ".././assets/logo-text.svg";
const Terms: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // ✅ best back behavior:
    // - agar user kisi page se aaya hai, back
    // - warna direct open hua hai, dashboard
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

      {/* ✅ Page Content */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title block */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#7650e3] mb-2">
              {t("terms_of_service_title")}
            </h1>
            <p className="text-gray-500 font-medium">
              <strong>OmniShare</strong> – {t("terms_subtitle")}
            </p>
            <p className="text-gray-500 font-medium">
              <strong>{t("terms_last_updated")}:</strong> {t("terms_date")}
            </p>
            <p className="text-gray-500 font-medium">
              <strong>{t("terms_company_location")}:</strong> {t("terms_location_uae")}
            </p>
          </div>

          {/* Content */}
          <section>
            <p className="mb-4">
              {t("terms_welcome_intro")}
            </p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              1. {t("terms_section_1_title")}
            </h2>
            <ul className="list-disc pl-6 mb-2">
              <li>
                <strong>{t("terms_section_1_item_1")}:</strong> {t("terms_section_1_item_1_desc")}
              </li>
              <li>
                <strong>{t("terms_section_1_item_2")}:</strong> {t("terms_section_1_item_2_desc")}
              </li>
              <li>
                <strong>{t("terms_section_1_item_3")}:</strong> {t("terms_section_1_item_3_desc")}
              </li>
              <li>
                <strong>{t("terms_section_1_item_4")}:</strong> {t("terms_section_1_item_4_desc")}
              </li>
            </ul>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              2. {t("terms_section_2_title")}
            </h2>
            <p className="mb-2">{t("terms_section_2_intro")}:</p>
            <ul className="list-disc pl-6">
              <li><strong>{t("terms_section_2_item_1")}:</strong> {t("terms_section_2_item_1_desc")}</li>
              <li><strong>{t("terms_section_2_item_2")}:</strong> {t("terms_section_2_item_2_desc")}</li>
              <li><strong>{t("terms_section_2_item_3")}:</strong> {t("terms_section_2_item_3_desc")}</li>
            </ul>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              3. {t("terms_section_3_title")}
            </h2>
            <p className="mb-2">{t("terms_section_3_intro")}:</p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("terms_section_3_item_1")}:</strong> {t("terms_section_3_item_1_desc")}</li>
              <li><strong>{t("terms_section_3_item_2")}:</strong> {t("terms_section_3_item_2_desc")}</li>
              <li><strong>{t("terms_section_3_item_3")}:</strong> {t("terms_section_3_item_3_desc")}</li>
              <li><strong>{t("terms_section_3_item_4")}:</strong> {t("terms_section_3_item_4_desc")}</li>
            </ul>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              4. {t("terms_section_4_title")}
            </h2>
            <p className="mb-2">{t("terms_section_4_intro")}:</p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("terms_section_4_item_1")}:</strong> {t("terms_section_4_item_1_desc")}</li>
              <li><strong>{t("terms_section_4_item_2")}:</strong> {t("terms_section_4_item_2_desc")}</li>
              <li><strong>{t("terms_section_4_item_3")}:</strong> {t("terms_section_4_item_3_desc")}</li>
              <li><strong>{t("terms_section_4_item_4")}:</strong> {t("terms_section_4_item_4_desc")}</li>
              <li><strong>{t("terms_section_4_item_5")}:</strong> {t("terms_section_4_item_5_desc")}</li>
              <li><strong>{t("terms_section_4_item_6")}:</strong> {t("terms_section_4_item_6_desc")}</li>
            </ul>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              5. {t("terms_section_5_title")}
            </h2>
            <p className="mb-2">
              <strong>{t("terms_section_5_your_content")}:</strong> {t("terms_section_5_your_content_desc")}
            </p>
            <p className="mb-2">
              <strong>{t("terms_section_5_our_content")}:</strong> {t("terms_section_5_our_content_desc")}
            </p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              6. {t("terms_section_6_title")}
            </h2>
            <p className="mb-2">{t("terms_section_6_intro")}:</p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("terms_section_6_item_1")}:</strong> {t("terms_section_6_item_1_desc")}</li>
              <li><strong>{t("terms_section_6_item_2")}:</strong> {t("terms_section_6_item_2_desc")}</li>
              <li><strong>{t("terms_section_6_item_3")}:</strong> {t("terms_section_6_item_3_desc")}</li>
            </ul>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              7. {t("terms_section_7_title")}
            </h2>
            <p className="mb-2"><strong>{t("terms_section_7_billing")}</strong> {t("terms_section_7_billing_desc")}</p>
            <p className="mb-2"><strong>{t("terms_section_7_renewal")}</strong> {t("terms_section_7_renewal_desc")}</p>
            <p className="mb-2"><strong>{t("terms_section_7_cancel")}</strong> {t("terms_section_7_cancel_desc")}</p>
            <p className="mb-2"><strong>{t("terms_section_7_security")}</strong> {t("terms_section_7_security_desc")}</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              8. {t("terms_section_8_title")}
            </h2>
            <p className="mb-2">
              {t("terms_section_8_intro")}
            </p>
            <p className="mb-2">{t("terms_section_8_not_liable")}:</p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("terms_section_8_item_1")}</strong></li>
              <li><strong>{t("terms_section_8_item_2")}</strong></li>
              <li><strong>{t("terms_section_8_item_3")}</strong></li>
              <li><strong>{t("terms_section_8_item_4")}</strong></li>
            </ul>
            <p>{t("terms_section_8_total_liability")}</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              9. {t("terms_section_9_title")}
            </h2>
            <p>{t("terms_section_9_intro")}:</p>
            <ul className="list-disc pl-6">
              <li><strong>{t("terms_section_9_item_1")}</strong></li>
              <li><strong>{t("terms_section_9_item_2")}</strong></li>
              <li><strong>{t("terms_section_9_item_3")}</strong></li>
            </ul>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              10. {t("terms_section_10_title")}
            </h2>
            <p className="mb-2">{t("terms_section_10_intro")}:</p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("terms_section_10_item_1")}</strong> {t("terms_section_10_item_1_desc")}</li>
              <li><strong>{t("terms_section_10_item_2")}</strong> {t("terms_section_10_item_2_desc")}</li>
              <li><strong>{t("terms_section_10_item_3")}</strong> {t("terms_section_10_item_3_desc")}</li>
              <li><strong>{t("terms_section_10_item_4")}</strong> {t("terms_section_10_item_4_desc")}</li>
            </ul>
            <p>{t("terms_section_10_upon_termination")}</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              11. {t("terms_section_11_title")}
            </h2>
            <p>{t("terms_section_11_content")}</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              12. {t("terms_section_12_title")}
            </h2>
            <p>{t("terms_section_12_content")}</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              13. {t("terms_section_13_title")}
            </h2>
            <p className="mb-2">{t("terms_section_13_intro")}:</p>
            <ul className="space-y-2">
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
                  {t("terms_location_uae")}
                </a>
              </li>
            </ul>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              14. {t("terms_section_14_title")}
            </h2>
            <p>
              {t("terms_section_14_content")}
            </p>
          </section>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium text-sm">
              {t("terms_footer_text")}{" "}
              {new Date().toLocaleDateString()} {t("terms_footer_suffix")}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
