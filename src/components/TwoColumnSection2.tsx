import React from "react";
import mainImage from "../assets/Omni sshare-layout-02.png";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const TwoColumnSection2 = () => {
  const { t, i18n } = useTranslation();
    const changeLanguage = (lang: any) => i18n.changeLanguage(lang);
    const navigate = useNavigate();
  return (
    <section
      className=" pt-14 relative  max-w-full mx-auto px-4 sm:px-6 lg:px-[10%]
        grid md:grid-cols-2  gap-10
        
        items-center w-full  bg-white
      "
    >
      <div className="flex flex-col gap-4">
        <h2
          className="
            font-bold 
            text-4xl sm:text-5xl 
          text-black
          "
        >
          <span className="text-purple-600">{t("line_06")}</span> {t("line_07")}
        </h2>

        <p
          className="
            text-base sm:text-lg text-gray-500"
        >
          {t("line_08")}{" "}
          <strong>
            {t("line_09")}
          </strong>
        </p>
        <div className="flex justify-center sm:justify-start">
          <button
          onClick={() => navigate("/auth")}
            className="
            group px-6 py-2.5 border border-purple-600 
            text-purple-600 font-semibold rounded-md 
            hover:bg-purple-100 transition 
          "
          >
            {t("get_started_free")}{" "}
            <span className="inline-block transform transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </div>

      <div
        className="
   w-full 
   h-full
   
  "
      >
        <img
          src={mainImage}
          className="
            w-full h-full object-cover rounded-lg
          "
        />
      </div>
    </section>
  );
};

export default TwoColumnSection2;
