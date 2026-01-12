"use client";

import React, { FC, useMemo, useState, useEffect } from "react";
import { Share2, Copy, X, Link as LinkIcon } from "lucide-react";
import Referal from "../../assets/referal.png";
import { useAppContext } from "@/context/AppContext";
import { useTranslation } from "react-i18next";
import Icon from "../Icon";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../context2/ModalContext";

type Props = {
  close?: () => void;
  className?: string;
};

const ReferralSection: FC<Props> = ({ close, className = "" }) => {
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { user } = useAppContext();
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { openModal } = useModal();

  const referralLink = `http://omnishare.ai/auth?referralId=${user.id}`;

  const shareText = useMemo(() => {
    return `Join me on OmniShare! Use my referral link:`;
  }, []);

  // ✅ detect mobile screen (<= md)
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ✅ native share (works mostly on mobile)
  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "OmniShare",
          text: shareText,
          url: referralLink,
        });
        return true;
      }
      return false;
    } catch (err: any) {
      if (err?.name === "AbortError") return true; // cancelled
      return false;
    }
  };

  // ✅ Inline share:
  // - Desktop: open modal
  // - Mobile: native share (fallback copy)
  const handleInlineShareClick = async () => {
    if (!isMobile) {
      openModal(ReferralSection as any, {});
      return;
    }

    const didNative = await handleNativeShare();
    if (!didNative) await copyToClipboard(referralLink);
  };

  // -------------------- MODAL VERSION --------------------
  if (close) {
    const handleTermsClick = (e: React.MouseEvent) => {
      e.preventDefault();
      close?.(); // ✅ close modal
      navigate("/conditions"); // ✅ then navigate
    };

    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1001,
          maxWidth: "1000px",
          width: "100%",
        }}
        className="max-w-2xl mx-auto w-full px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full bg-white rounded-md relative md:w-[60.666667%] mx-auto flex flex-col pt-4 pb- 1 overflow-hidden border border-black/50 shadow-md">
          <button
            onClick={close}
            aria-label={t("close") || "Close"}
            className="absolute right-3 top-3 w-6 h-6 z-10 rounded-full border-[#7650e3] flex items-center justify-center text-[#7650e3] bg-[#F7F5FB] md:bg-inherit transition-shadow border-[2px]"
          >
            <X className="w-4 h-4 stroke-[#7650e3] stroke-[3]" />
          </button>

          <div className="w-full flex justify-center items-center px-4">
            <img
              src={Referal}
              className="object-contain max-h-[220px] md:max-h-[260px] w-full"
              alt="Referral"
            />
          </div>

          <div className="w-full px-5 md:px-10 py-6 overflow-y-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[#7650e3] mb-3">
              {t("refer_earn")}
            </h2>

            <p className="text-black text-sm font-medium leading-relaxed flex gap-2 items-start mb-1">
              <Share2 className="w-[18px] h-[18px] text-[#7650e3]" />
              Share your invite link with friends.
            </p>
            <p className="text-black text-sm font-medium leading-relaxed flex gap-2 items-start mb-1">
              <Icon name="manage-subs" size={18} />
              They sign up and receive 10 Omni Coins.
            </p>
            <p className="text-black text-sm font-medium leading-relaxed flex gap-2 items-start mb-3">
              <Icon name="crown" size={18} />
              When they purchase a package using your referral link, you both
              earn 100 Omni Coins.
            </p>

            {/* Conditionally render the input box or Share button based on screen size */}
            {isMobile ? (
              // Mobile view: Share button for native share
              <div className="mb-3">
                <button
                  onClick={handleNativeShare}
                  className="flex w-full items-center justify-center rounded-md gap-2 font-bold transition-colors text-md font-semiboldtransition-all border-2 text-white border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] py-2 px-3"
                  title="Share referral link"
                >
                  <Share2 className="w-[18px] h-[18px]" />
                  Share
                </button>
              </div>
            ) : (
              // Desktop view: Show the link and copy button
              <div className="mb-3">
                <label className="text-xs text-gray-500 mb-2 block font-medium">
                  Copy and share your referral link:
                </label>

                <div className="flex items-center gap-2 w-full border border-purple-600 bg-white rounded-md overflow-hidden pl-2">
                  <LinkIcon className="w-4 h-4 text-purple-600 " />
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="px-1 p-2.5 w-full text-xs text-slate-700 font-mono outline-none"
                  />
                </div>

                {copied && (
                  <p className="text-xs text-green-600 mt-2">
                    {t("copied_to_clipboard") || "Copied to clipboard!"}
                  </p>
                )}
              </div>
            )}

            {/* Copy button (same for both mobile and desktop) */}
            {!isMobile && (
              <button
                onClick={() => copyToClipboard(referralLink)}
                className="flex w-full items-center justify-center rounded-md gap-2 font-bold transition-colors text-md font-semiboldtransition-all border-2 text-white border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] py-2 px-3"
                title="Copy referral link"
              >
                <Copy className="w-[18px] h-[18px]" />
                Copy Link
              </button>
            )}

            <div className="flex justify-center mt-4">
              <a
                href="/conditions"
                onClick={handleTermsClick}
                className="text-[#7650e3] "
              >
                View terms and conditions
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------- DASHBOARD / INLINE VERSION --------------------
  return (
    <div
      className={`bg-purple-600 rounded-md px-4 sm:px-5 py-4 overflow-hidden ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-5 items-center">
        <div className="md:col-span-2 w-full flex flex-col order-2 md:order-1">
          <h2 className="text-3xl sm:text-4xl leading-tight text-white">
            {t("refer_earn")}
          </h2>

          <div className="mt-2">
            <p className="text-white text-sm  leading-relaxed flex gap-2 items-start mb-1">
              <Share2 className="w-[18px] h-[18px]" />
              Share your invite link with friends.
            </p>
            <p className="text-white text-sm  leading-relaxed flex gap-2 items-start mb-1">
              <Icon
                name="manage-subs"
                size={18}
                className="brightness-[1000]"
              />
              They sign up and receive 10 Omni Coins.
            </p>
            <p className="text-white text-sm  leading-relaxed flex gap-2 items-start mb-2">
              <Icon name="crown" size={18} className="brightness-[1000]" />
              When they purchase a package using your referral link, you both
              earn 100 Omni Coins.
            </p>

            {/* ✅ Desktop only: show link input */}
            {!isMobile && (
              <div className="mt-3">
                <div className="flex items-center gap-2 w-full border border-purple-600 bg-white rounded-md overflow-hidden">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="px-3 py-2.5 w-full text-xs text-slate-700 font-mono outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(referralLink)}
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
            )}
          </div>

          {/* ✅ Share: Desktop modal / Mobile native */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-5 items-center">
          <button
            onClick={handleInlineShareClick}
            className="mt-3 flex w-full sm:w-fit items-center justify-center rounded-md gap-2 transition-colors text-md font-semibold text-[#7650e3] border-2 border-[#7650e3] bg-white hover:bg-[#d7d7fc] py-2 px-3"
          >
            <Share2 className="w-[18px] h-[18px]" />
            {t("share")}
          </button>
          <div className=" text-sm mt-4  md:mt-2 flex justify-center md:justify-end ">
              <a
                href="/conditions"
                
                className="text-white "
              >
                View terms and conditions
              </a>
            </div>
            </div>
        
        </div>
        

        {/* ✅ Image fully contained inside card (no overflow) */}
        <div className="w-full flex justify-center md:justify-end order-1 md:order-2">
          <div className="w-full max-w-[340px] md:max-w-none  overflow-hidden rounded-md -mt-2 md:mt-0">
            <img
              src={Referal}
              alt="Referral"
              className="w-full h-[220px] sm:h-[210px] md:h-[220px] object-contain md:object-cover object-center"
      />

          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralSection;
