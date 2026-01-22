import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Mail,
  Globe,
  MapPin,
  Clock,
  MessageCircle,
  Lightbulb,
} from "lucide-react";
import logoText from ".././assets/logo-text.svg"; // ✅ apne path ke hisaab se change

const Support: React.FC = () => {
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
            <h1 className="text-3xl font-bold text-[#7650e3] mb-2">{t("support_title")}</h1>
            <p className="text-gray-500 font-medium">
              <strong>OmniShare</strong> – {t("support_subtitle")}
            </p>
            <p className="text-gray-500 font-medium">
              <strong>{t("support_last_updated")}:</strong> {t("support_date")}
            </p>
            <p className="text-gray-500 font-medium">
              <strong>{t("support_company_location")}:</strong> {t("support_location_uae")}
            </p>
          </div>

          {/* Content */}
          <section>
            <p className="mb-4">
              {t("support_welcome_intro")}
            </p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              1. {t("support_section_1_title")}
            </h2>
            <p className="mb-2">
              <strong>{t("support_section_1_subtitle")}:</strong> {t("support_section_1_content")}
            </p>
            <p>
              <strong>{t("support_response_time")}:</strong> {t("support_response_time_content")}
            </p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              2. {t("support_section_2_title")}
            </h2>
            <p className="mb-2">{t("support_section_2_intro")}:</p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("support_section_2_item_1")}:</strong> {t("support_section_2_item_1_desc")}</li>
              <li><strong>{t("support_section_2_item_2")}:</strong> {t("support_section_2_item_2_desc")}</li>
              <li><strong>{t("support_section_2_item_3")}:</strong> {t("support_section_2_item_3_desc")}</li>
              <li><strong>{t("support_section_2_item_4")}:</strong> {t("support_section_2_item_4_desc")}</li>
              <li><strong>{t("support_section_2_item_5")}:</strong> {t("support_section_2_item_5_desc")}</li>
              <li><strong>{t("support_section_2_item_6")}:</strong> {t("support_section_2_item_6_desc")}</li>
            </ul>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">3. {t("support_section_3_title")}</h2>
            <p className="mb-2">{t("support_section_3_intro")}:</p>
            <ul className="list-disc pl-6 mb-3">
              <li><strong>{t("support_section_3_item_1")}:</strong> {t("support_section_3_item_1_desc")}</li>
              <li><strong>{t("support_section_3_item_2")}:</strong> {t("support_section_3_item_2_desc")}</li>
              <li><strong>{t("support_section_3_item_3")}:</strong> {t("support_section_3_item_3_desc")}</li>
              <li><strong>{t("support_section_3_item_4")}:</strong> {t("support_section_3_item_4_desc")}</li>
            </ul>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">4. {t("support_section_4_title")}</h2>
            <p className="mb-2">{t("support_section_4_intro")}:</p>
            <ul className="space-y-2">
              <li>
                <Mail className="w-4 h-4 inline mr-2 text-[#7650e3]" />
                <strong className="text-black">{t("email")}:</strong>{" "}
                <a href="mailto:support@omnishare.ai" className="text-[#7650e3] hover:underline">
                  support@omnishare.ai
                </a>
              </li>
              <li>
                <MessageCircle className="w-4 h-4 inline mr-2 text-[#7650e3]" />
                <strong className="text-black">{t("support_live_chat")}:</strong>{" "}
                <span className="text-gray-700">{t("support_live_chat_desc")}</span>
              </li>
            </ul>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              5. {t("support_section_5_title")}
            </h2>

            <h3 className="font-semibold mb-2">5.1 {t("support_section_5_1_title")}</h3>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("support_section_5_1_item_1")}:</strong> {t("support_section_5_1_item_1_desc")}</li>
              <li><strong>{t("support_section_5_1_item_2")}:</strong> {t("support_section_5_1_item_2_desc")}</li>
              <li><strong>{t("support_section_5_1_item_3")}:</strong> {t("support_section_5_1_item_3_desc")}</li>
            </ul>

            <h3 className="font-semibold mb-2">5.2 {t("support_section_5_2_title")}</h3>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("support_section_5_2_item_1")}:</strong> {t("support_section_5_2_item_1_desc")}</li>
              <li><strong>{t("support_section_5_2_item_2")}:</strong> {t("support_section_5_2_item_2_desc")}</li>
              <li><strong>{t("support_section_5_2_item_3")}:</strong> {t("support_section_5_2_item_3_desc")}</li>
            </ul>

            <h3 className="font-semibold mb-2">5.3 {t("support_section_5_3_title")}</h3>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("support_section_5_3_item_1")}:</strong> {t("support_section_5_3_item_1_desc")}</li>
              <li><strong>{t("support_section_5_3_item_2")}:</strong> {t("support_section_5_3_item_2_desc")}</li>
              <li><strong>{t("support_section_5_3_item_3")}:</strong> {t("support_section_5_3_item_3_desc")}</li>
            </ul>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              6. {t("support_section_6_title")}
            </h2>
            <p className="mb-2">{t("support_section_6_intro")}:</p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("support_section_6_item_1")}:</strong> {t("support_section_6_item_1_desc")}</li>
              <li><strong>{t("support_section_6_item_2")}:</strong> {t("support_section_6_item_2_desc")}</li>
              <li><strong>{t("support_section_6_item_3")}:</strong> {t("support_section_6_item_3_desc")}</li>
              <li><strong>{t("support_section_6_item_4")}:</strong> {t("support_section_6_item_4_desc")}</li>
            </ul>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              7. {t("support_section_7_title")}
            </h2>
            <p className="mb-2">
              {t("support_section_7_intro")}{" "}
              <a href="mailto:feedback@omnishare.ai" className="text-[#7650e3] hover:underline">
                <Lightbulb className="w-4 h-4 inline mr-2" />
                feedback@omnishare.ai
              </a>
            </p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("support_section_7_item_1")}:</strong> {t("support_section_7_item_1_desc")}</li>
              <li><strong>{t("support_section_7_item_2")}:</strong> {t("support_section_7_item_2_desc")}</li>
              <li><strong>{t("support_section_7_item_3")}:</strong> {t("support_section_7_item_3_desc")}</li>
            </ul>
            <p>{t("support_section_7_outro")} 💡 feedback@omnishare.ai</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              8. {t("support_section_8_title")}
            </h2>
            <p className="mb-2">{t("support_section_8_intro")}:</p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("support_section_8_item_1")}:</strong> {t("support_section_8_item_1_desc")}</li>
              <li><strong>{t("support_section_8_item_2")}:</strong> {t("support_section_8_item_2_desc")}</li>
              <li>
                <strong>{t("support_section_8_item_3")}:</strong>{" "}
                <a href="mailto:security@omnishare.ai" className="text-[#7650e3] hover:underline">
                  security@omnishare.ai
                </a>
              </li>
            </ul>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              9. {t("support_section_9_title")}
            </h2>
            <p className="mb-2">{t("support_section_9_intro")}:</p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("support_section_9_item_1")}:</strong> {t("support_section_9_item_1_desc")}</li>
              <li><strong>{t("support_section_9_item_2")}:</strong> {t("support_section_9_item_2_desc")}</li>
              <li><strong>{t("support_section_9_item_3")}:</strong> {t("support_section_9_item_3_desc")}</li>
            </ul>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              10. {t("support_section_10_title")}
            </h2>
            <p className="mb-2">{t("support_section_10_intro")}:</p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>{t("support_section_10_item_1")}:</strong> {t("support_section_10_item_1_desc")}</li>
              <li><strong>{t("support_section_10_item_2")}:</strong> {t("support_section_10_item_2_desc")}</li>
            </ul>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              11. {t("support_section_11_title")}
            </h2>
            <p className="mb-2">{t("support_section_11_intro")}:</p>
            <ul className="list-disc pl-6 mb-2">
              <li>
                <strong className="text-black">{t("support_section_11_item_1")}:</strong>{" "}
                <span className="text-gray-700">{t("support_section_11_item_1_prefix")} </span>
                <a
                  href="https://www.linkedin.com/company/omnishare-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7650e3] hover:underline"
                >
                  LinkedIn
                </a>
                <span className="text-gray-700">, </span>
                <a
                  href="https://www.facebook.com/share/1H74CpLTCK/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7650e3] hover:underline"
                >
                  Facebook
                </a>
                <span className="text-gray-700"> {t("support_section_11_item_1_and")} </span>
                <a
                  href="https://www.instagram.com/omnishare.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7650e3] hover:underline"
                >
                  Instagram
                </a>
                <span className="text-gray-700"> {t("support_section_11_item_1_suffix")}</span>
              </li>

              <li>
                <strong>{t("support_section_11_item_2")}:</strong> {t("support_section_11_item_2_desc")}
              </li>
            </ul>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              12. {t("support_section_12_title")}
            </h2>
            <p className="mb-3">{t("support_section_12_intro")}:</p>
            <ul className="space-y-2">
              <li>
                <Mail className="w-4 h-4 inline mr-2 text-[#7650e3]" />
                <strong className="text-black">{t("email")}:</strong>{" "}
                <a href="mailto:support@omnishare.ai" className="text-[#7650e3] hover:underline">
                  support@omnishare.ai
                </a>
              </li>
              <li>
                <Globe className="w-4 h-4 inline mr-2 text-[#7650e3]" />
                <strong className="text-black">{t("support_website")}:</strong>{" "}
                <a
                  href="https://www.omnishare.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7650e3] hover:underline"
                >
                  www.omnishare.ai
                </a>
              </li>
              <li>
                <MessageCircle className="w-4 h-4 inline mr-2 text-[#7650e3]" />
                <strong className="text-black">{t("support_live_chat")}:</strong>{" "}
                <span className="text-gray-700">{t("support_live_chat_available")}</span>
              </li>
              <li>
                <MapPin className="w-4 h-4 inline mr-2 text-[#7650e3]" />
                <strong className="text-black">{t("location")}:</strong>{" "}
                <a
                  href="https://maps.google.com/?q=United+Arab+Emirates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7650e3] hover:underline"
                >
                  {t("support_location_uae")}
                </a>
              </li>
              <li>
                <Clock className="w-4 h-4 inline mr-2 text-[#7650e3]" />
                <strong className="text-black">{t("support_business_hours")}:</strong>{" "}
                <span className="text-gray-700">
                  {t("support_business_hours_content")}
                </span>
              </li>
            </ul>
          </section>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium text-sm">
              {t("support_footer_text")}{" "}
              {new Date().toLocaleDateString()} {t("support_footer_suffix")}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
