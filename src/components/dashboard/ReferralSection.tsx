// ReferralSection.tsx

import React, { FC, useState } from "react";
import { Share2, Copy, X } from "lucide-react";
import Referal from "../../assets/referal.png";
import { useAppContext } from "@/context/AppContext";
import { useTranslation } from "react-i18next";

type Props = {
  close?: () => void;
  className?: string; // ✅ allow dashboard to pass h-full etc.
};

const ReferralSection: FC<Props> = ({ close, className = "" }) => {
  const [copied, setCopied] = useState(false);
  const { user } = useAppContext();
  const referralLink = `http://omnishare.ai/auth?referralId=${user.id}`;
  const { t } = useTranslation();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modalPositioningStyles: React.CSSProperties = close
    ? {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1001,
        maxWidth: "1000px",
        width: "100%",
      }
    : {};

  // -------------------- MODAL VERSION (unchanged) --------------------
  if (close) {
    return (
      <div
        style={modalPositioningStyles}
        className="max-w-2xl mx-auto w-full px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className=" w-full bg-white rounded-md relative md:w-[60.666667%] mx-auto flex flex-col py-4 overflow-hidden border border-black/50 shadow-md">
          {close && (
            <button
              onClick={close}
              aria-label={t("close") || "Close"}
              className="absolute right-3 top-3 w-6 h-6 z-10 rounded-full border-[#7650e3] flex items-center justify-center text-[#7650e3] bg-[#F7F5FB] md:bg-inherit transition-shadow border-[2px]"
            >
              <X className="w-4 h-4 color-[#7650e3] stroke-[#7650e3] stroke-[3]" />
            </button>
          )}

          <div className="h-[50%] w-[70%] flex justify-center items-center mx-auto">
            <img src={Referal} className=" object-cover object-center" alt="" />
          </div>

          <div className="h-[50%] w-[80%] py-10 mx-auto overflow-y-auto">
            <h2 className="text-4xl font-bold text-[#7650e3] mb-1">
              {t("refer_earn")}
            </h2>
            <p className="text-black mb-3 text-sm font-medium leading-relaxed">
              {t("referral_bonus_message")}
            </p>

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

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied!");
              }}
              className="flex w-fit items-center rounded-md gap-2 transition-colors text-md font-semibold text-[#7650e3] border-2 border-[#7650e3] bg-white hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] py-2 px-3"
            >
              <Share2 className="w-[18px] h-[18px]" />
              {t("share")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------- DASHBOARD / INLINE VERSION (FIXED) --------------------
  return (
    <div className={`bg-purple-600 rounded-md  px-5 py-4 relative ${className}`}>
      {/* ✅ mobile: 1 col, md+: 3 cols */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center h-full ">
        {/* ✅ Left content fills height so it doesn't look weird on 321-767 widths */}
        <div className="md:col-span-2 w-full flex flex-col h-full mt-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">
              {t("refer_earn")}
            </h2>

            <p className="text-white mb-5 text-sm font-medium leading-relaxed">
              {t("referral_bonus_message")}
            </p>

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
                <p className="text-xs text-green-200 mt-2">
                  {t("copied_to_clipboard")}
                </p>
              )}
            </div>
          </div>

          {/* ✅ pushes button down when there is extra height (fixes 321-767 ugly spacing) */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied!");
            }}
            className=" flex w-fit items-center rounded-md gap-2 transition-colors text-md font-semibold text-[#7650e3] border-2 border-[#7650e3] bg-white hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] py-2 px-3"
          >
            <Share2 className="w-[18px] h-[18px]" />
            {t("share")}
          </button>
        </div>

        {/* ✅ Image: no crop on mobile, original crop style on md+ */}
        <div className="w-full">
          <img
            src={Referal}
            alt=""
            className="
              w-full
              h-[180px] md:h-full
              object-contain md:object-cover
              object-center
              rounded-md
            "
          />
        </div>
      </div>
    </div>
  );
};

export default ReferralSection;
