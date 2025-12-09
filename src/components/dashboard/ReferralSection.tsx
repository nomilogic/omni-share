// ReferralSection.tsx

import React, { FC, useState } from "react";
import { Share2, Copy, X } from "lucide-react";
import Referal from "../../assets/referal.png";
import { useAppContext } from "@/context/AppContext";
import { useTranslation } from "react-i18next";

type Props = {
  close?: () => void;
};

const ReferralSection: FC<Props> = ({ close }) => {
  const [copied, setCopied] = useState(false);
  const { user } = useAppContext();
  const referralLink = `http://omnishare.ai/auth?referralId=${user.id}`;
  const { t } = useTranslation();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ✅ CSS IN JSX: Modal positioning styles ko define karein
  const modalPositioningStyles: React.CSSProperties = close
    ? {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1001,
        // Max-width aur width ko hum Tailwind classes se ya toh manage kar chuke hain
        // ya phir ek single max-width de sakte hain
        maxWidth: "1000px", // Example Max Width (Aap apne design ke hisaab se set karein)
        width: "100%", // Example Width
      }
    : {};

  // Agar 'close' prop available hai, toh hume usko modal wrapper mein lagana hai.
  // Hum ReferralSection ke content ko ek naye div mein wrap karenge.

  // NOTE: Agar aapka puraana modal wrapper max-w-4xl MX-AUTO tha,
  // toh hum isko bhi is component mein add karenge.

  // Agar component modal ki tarah open ho raha hai, toh yeh outer structure use hoga:
  if (close) {
    return (
      <div
        style={modalPositioningStyles} // 👈 Positioning styles yahan lagao
        className="max-w-2xl mx-auto w-full px-4" // Puraani sizing classes (max-w-4xl)
        // Click ko rokein taake modal ke andar click karne se band na ho jaaye
        onClick={(e) => e.stopPropagation()}
      >
        {/* Inner Content Box (Jo pehle apka root div tha) */}
        <div className="bg-white rounded-md relative w-[60.666667%] mx-auto flex flex-col py-4 overflow-hidden border border-black/50 shadow-md">
          {/* Close button top-right - Keep it absolute relative to the new container */}
          {close && (
            <button
              onClick={close}
              aria-label={t("close") || "Close"}
              className="absolute right-3 top-3 w-6 h-6 z-10 rounded-full border-[#7650e3] flex items-center justify-center text-[#7650e3] bg-[#F7F5FB] md:bg-inherit transition-shadow border-[2px]"
            >
              <X className="w-4 h-4 color-[#7650e3] stroke-[#7650e3] stroke-[3]" />
            </button>
          )}

          {/* 1. Picture Section (Top 60%) */}
          <div className="h-[50%] w-[70%] flex justify-center items-center mx-auto">
            <img
              src={Referal}
              className=" object-cover object-center"
              alt=""
            />
          </div>

          {/* 2. Remaining Content Section (Bottom 40%) */}
          {/* Add padding here for the content, and use flex-grow for full height */}
          <div className="h-[50%] w-[80%] py-10 mx-auto overflow-y-auto">
            {/* The grid layout (md:grid-cols-3) that previously contained the image needs to be removed/modified */}
            {/* The content that was previously in md:col-span-2 now just sits directly here */}
            <h2 className="text-4xl font-bold text-[#7650e3] mb-1">
              {t("refer_earn")}
            </h2>
            <p className="text-black mb-3 text-sm font-medium leading-relaxed">
              {t("referral_bonus_message")}
            </p>

            {/* ... link copying section ... */}
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-2 block font-medium">
                {t("copy_link_share")}
              </label>
              <div className="flex items-center gap-2 w-full border border-purple-600 bg-white rounded-md overflow-hidden">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="px-3 py-2.5 w-full text-xs text-slate-700 font-mono outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2.5 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4 text-purple-600" />
                </button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 mt-2">
                  {t("copied_to_clipboard")}
                </p>
              )}
            </div>

            <button className="flex items-center rounded-md gap-2 transition-colors text-sm font-semibold text-white border-2 border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] py-2 px-3 ">
              <Share2 className="w-[16px] h-[16px]" />
              {t("share")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Agar 'close' prop available nahi hai, toh yeh content wala version hai.
  // Wahi puraana JSX wapas return karein, koi positioning nahi
  return (
    <div className="bg-purple-600 rounded-md px-5 py-4 relative">
      <div className="grid md:grid-cols-3 gap-5 items-center">
        <div className="md:col-span-2 w-full">
          {/* Heading, message, link, buttons */}
          <h2 className="text-3xl font-bold text-white mb-1">
            {t("refer_earn")}
          </h2>
          <p className="text-white mb-5 text-sm font-medium leading-relaxed">
            {t("referral_bonus_message")}
          </p>
          {/* ... link copying section ... */}
          <div className="mb-4">
            <label className="text-xs text-white mb-2 block font-medium">
              {t("copy_link_share")}
            </label>
            <div className="flex items-center gap-2 w-full border border-purple-600 bg-white rounded-md overflow-hidden">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="px-3 py-2.5 w-full text-xs text-slate-700 font-mono outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-2.5 transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4 text-purple-600" />
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-2">
                {t("copied_to_clipboard")}
              </p>
            )}
          </div>
          <button className="flex items-center rounded-md gap-2 transition-colors text-md font-semibold text-white border-2 border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] py-2 px-3 ">
            <Share2 className="w-[18px] h-[18px]" />
            {t("share")}
          </button>
        </div>
        {/* Image section */}
        <img
          src={Referal}
          className="w-full h-full object-cover object-center"
          alt=""
        />
      </div>
    </div>
  );
};

export default ReferralSection;
