import React from "react";
import mainImage from "../assets/omni.jpg";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const TwoColumnSection: React.FC = () => {
  const { t, i18n } = useTranslation();
    const changeLanguage = (lang: any) => i18n.changeLanguage(lang);
    const navigate = useNavigate();
  return (
    <section
      className="relative w-full max-w-full mx-auto px-4 sm:px-6 lg:px-[10%]      grid md:grid-cols-2  gap-10             items-center   bg-white
      "
    >
      {/* Left Side - Image */}
      <div className="flex justify-center w-full ml-auto">
        <img src={mainImage} className="rounded-lg max-w-full h-auto" />
      </div>
      <div className="w-full flex flex-col gap-4 ">
        <h2 className=" font-bold text-4xl sm:text-5xl   text-black">
          {t("line_01")} <span className="text-purple-600">{t("line_02")}</span> {t("line_03")}
        </h2>
        <p className="leading-relaxed text-base sm:text-lg text-gray-500                 ">
          {t("line_04")}{" "}
          <strong>
            {t("line_05")}
          </strong>
        </p>
        <div>
          <button
          onClick={() => navigate("/auth")}
            className=" 
            group px-6 py-2.5 border border-purple-600 
            text-purple-600 font-semibold rounded-md 
            hover:bg-purple-100 transition 
          "
          >
            {t("get_started")}{" "}
            <span className="inline-block transform transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TwoColumnSection;
