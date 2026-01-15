import React from "react";
import mainImage from "../assets/omni.jpg";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";

const TwoColumnSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const changeLanguage = (lang: any) => i18n.changeLanguage(lang);
  const navigate = useNavigate();
  const { user } = useAppContext();
  return (
    <section
      className="relative w-full max-w-full mx-auto px-4 sm:px-6 lg:px-[10%]
    grid md:grid-cols-2 gap-4 md:gap-10 lg:gap-10 items-center 
    text-center md:text-left
  "
    >
      {/* Left Side - Image */}
      <div className="flex justify-center md:justify-start w-full">
        <img src={mainImage} className="rounded-lg max-w-full h-auto" />
      </div>

      {/* Right Side - Text + Button */}
      <div className="w-full flex flex-col gap-3 md:gap-4 items-center md:items-start">
        <h2 className="font-bold text-4xl sm:text-5xl text-black">
          {t("line_01")} <span className="text-purple-600">{t("line_02")}</span>{" "}
          {t("line_03")}
        </h2>
        <p className="leading-relaxed text-lg text-gray-500">
          {t("line_04")}{" "}
          <span className="text-xl font-medium">{t("line_05")}</span>
        </p>
        <div className="flex justify-center md:justify-start w-full">
          <button
            onClick={() => {
              if (user) {
                navigate("/content");
              } else {
                navigate("/auth");
              }
            }}
            className="group px-6 py-2.5 border border-purple-600 text-purple-600 font-semibold rounded-md hover:bg-purple-100 transition"
          >
            <span>{user ? "Create Post" : t("get_started_free")}</span>&nbsp;
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
