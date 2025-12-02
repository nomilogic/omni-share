import React, { useEffect, useState } from "react";
import CloseIcon from "./icons/CloseIcon";
import FeatureLossItem from "./FeatureLossItem";
import ModalIllustration from "./ModalIllustration";
import videoIcon from "../assets/05-02.png";
import imageIcon from "../assets/05-01.png";
import textIcon from "../assets/05-03.png";
import coinIcon from "../assets/spiral-logo.svg";
import ArrowRightIcon from "./icons/ArrowRightIcon";
import { Check, X } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Wallet } from "./../lib/wallet";
import ModalIllustrationPng from "../assets/cancle-popup.png";
import { useTranslation } from "react-i18next";
import API from "@/services/api";
import { notify } from "@/utils/toast";
/**
 * A modal component that displays a message to the user when they
 * are about to cancel their subscription. The component provides
 * information about the benefits of not cancelling their subscription
 * and provides two buttons to either pause their subscription or
 * proceed with cancellation.
 *
 * @param {boolean} isVisible - Whether the modal is visible
 * @param {function} onClose - Callback to close the modal
 * @param {function} onPause - Callback to pause the subscription
 * @param {function} onCancel - Callback to proceed with cancellation
 */

const SubscriptionPauseModal = ({
  isVisible,
  onClose,
  onPause,
  onCancel,
  isCanceled,
  openDowngradeModel,
  downgradePackages,
  downgradeModal,
}: any) => {
  if (!isVisible) return null;
  const { user, refreshUser }: any = useAppContext();
  const { t, i18n } = useTranslation();
  const [downgradeLoading, setDowngradeLoading] = useState(false);

  const handleRequestDowngrade = async (plan: any) => {
    setDowngradeLoading(true);

    try {
      await API.requestDowngrade(plan.id);

      refreshUser();
    } catch (error) {
      console.error("Request downgrade failed:", error);
      notify("error", "Failed to request downgrade");
    } finally {
      setDowngradeLoading(false);
    }
  };

  const pendingDowngradeId = user.wallet.downgradeRequested;
  const handleCancelDowngradeRequest = async () => {
    setDowngradeLoading(true);
    try {
      await API.cancelDowngradeRequest();

      refreshUser();
    } catch (error) {
      console.error("Cancel downgrade failed:", error);
      notify("error", "Failed to cancel downgrade request");
    } finally {
      setDowngradeLoading(false);
    }
  };

  const downgradePackagesItem = downgradePackages.filter(
    (item: any) => item.id === user.wallet.downgradeRequested
  );
  return (
    <div className="relative w-full md:max-w-3xl lg:max-w-5xl  md:rounded-md  shadow-md overflow-hidden bg-white md:h-[600px] h-full ">
      <div className="flex  flex-col sm:grid sm:grid-cols-1 md:grid-cols-2 h-full ">
        <div className=" bg-purple-600 flex pl-6 md:pt-10  md:rounded-l-md w-full md:h-full h-[40%]">
          <img
            src={ModalIllustrationPng}
            alt="Pause Illustration"
            className="w-full h-full object-contain  md:object-center object-bottom  "
          />
        </div>

        {downgradePackagesItem.length > 0 &&
        pendingDowngradeId &&
        downgradeModal ? (
          <div className="w-full px-4 py-5 md:px-8 flex flex-col gap-3 overflow-y-auto">
            <h2 className="text-2xl font-semibold text-[#7650e3] text-center">
              Downgrade Request Pending
            </h2>

            <p className="text-sm text-gray-700 text-center">
              You have already requested a downgrade. It will be applied in your
              next billing cycle.
            </p>

            <ul className=" space-y-2">
              {downgradePackagesItem.length > 0 && (
                <div className="space-y-4">
                  {downgradePackagesItem.map((pkg: any) => (
                    <>
                      <div
                        key={pkg.id}
                        className="border border-purple-600 rounded-md p-4 bg-white hover:bg-[#f5f1ff] cursor-pointer transition"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-[#7650e3] text-2xl font-bold -mb-1">
                            {pkg.name}
                          </h3>
                          <span className="text-xl font-bold text-[#7650e3]">
                            ${pkg.amount} /{" "}
                            <span className="text-xl font-bold text-[#7650e3]">
                              {pkg?.tier == "free" ? "Forever" : "Month"}
                            </span>
                          </span>
                        </div>

                        <p className="text-sm text-gray-800 mt-2">
                          Coins: {pkg.coins} — Limit: {pkg.coinLimit}
                        </p>

                        <ul className="mt-3 space-y-2">
                          {pkg.features.map((feat: any, idx: number) => (
                            <li key={idx} className="flex items-start gap-3">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                              <span className="text-sm text-slate-800">
                                {feat}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ))}
                </div>
              )}
            </ul>

            <div className="flex gap-2">
              <button
                disabled={downgradeLoading}
                onClick={handleCancelDowngradeRequest}
                className="w-full bg-purple-600 disabled:cursor-not-allowed hover:bg-[#d7d7fc] hover:text-[#7650e3] 
          text-white font-semibold py-2.5 rounded-md border border-[#7F56D9] transition"
              >
                Cancel Request
              </button>

              <button
                onClick={openDowngradeModel}
                className="w-full   text-purple-600 hover:bg-[#d7d7fc] hover:text-[#7650e3] 
           font-semibold py-2.5 rounded-md border border-[#7F56D9] transition"
              >
                Back
              </button>
            </div>
          </div>
        ) : downgradePackages.length > 0 && downgradeModal ? (
          <div className="w-full px-4 py-5 md:px-8 flex flex-col gap-5 overflow-y-auto">
            <div className="flex items-center gap-1 relative">
              <h2 className="text-2xl font-semibold text-[#7650e3]">
                Downgrade Your Subscription
              </h2>
            </div>

            {downgradePackages.length === 0 && (
              <p className="text-sm text-gray-700">
                You are already on the lowest available package.
              </p>
            )}

            {downgradePackages.length > 0 && (
              <div className="space-y-4">
                {downgradePackages.map((pkg: any) => (
                  <>
                    <div
                      key={pkg.id}
                      className="border border-purple-600 rounded-md p-4 bg-white hover:bg-[#f5f1ff] cursor-pointer transition"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-[#7650e3] text-2xl font-bold -mb-1">
                          {pkg.name}
                        </h3>
                        <span className="text-xl font-bold text-[#7650e3]">
                          ${pkg.amount} /{" "}
                          <span className="text-xl font-bold text-[#7650e3]">
                            {pkg?.tier == "free" ? "Forever" : "Month"}
                          </span>
                        </span>
                      </div>

                      <p className="text-sm text-gray-800 mt-2">
                        Coins: {pkg.coins} — Limit: {pkg.coinLimit}
                      </p>

                      <ul className="mt-3 space-y-2">
                        {pkg.features.map((feat: any, idx: number) => (
                          <li key={idx} className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                            <span className="text-sm text-slate-800">
                              {feat}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2 justify-between">
                      <button
                        onClick={() => handleRequestDowngrade(pkg)}
                        disabled={downgradeLoading}
                        className="w-full mt-2 bg-purple-600 disabled:cursor-not-allowed hover:bg-[#d7d7fc] hover:text-[#7650e3] 
          text-white font-semibold py-2.5 rounded-md border border-[#7F56D9] transition"
                      >
                        Downgrade
                      </button>
                      <button
                        onClick={openDowngradeModel}
                        className="w-full mt-2  text-purple-600 hover:bg-[#d7d7fc] hover:text-[#7650e3] 
           font-semibold py-2.5 rounded-md border border-[#7F56D9] transition"
                      >
                        Back
                      </button>
                    </div>
                  </>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full  px-4 py-5 md:px-8  flex flex-col gap-4 overflow-y-auto">
            <div className="flex items-center gap-1  ">
              <h2 className="text-2xl font-semibold text-[#7650e3]">
                {t("consider_cancel_subscription")}
              </h2>
              <button
                onClick={onClose}
                className="absolute right-3 top-3 w-6 h-6 z-10 rounded-full border-[#7650e3] flex items-center justify-center text-[#7650e3] bg-[#F7F5FB] transition-shadow border-[2px]"
                aria-label="Close manage subscription dialog"
              >
                <X className="w-4 h-4 color-[#7650e3] stroke-[#7650e3] stroke-[3]" />
              </button>
            </div>

            <div className=" flex flex-col justify-center gap-3">
              <p className="text-sm  text-[#000000] ">
                {t("by_canceling_now_youll_lose")}{" "}
                <span className="font-medium text-[#7650e3]">
                  {user.walle}
                  {user.wallet.package.name}
                </span>{" "}
                {t("access_on_due_date")}{" "}
                <span className="font-medium text-[#7650e3]">
                  {user.wallet.expiresAt
                    ? new Date(user.wallet.expiresAt).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "N/A"}{" "}
                </span>
                , {t("forfeit_all_rollover_tokens_in_your_bank_and_lose_these")}{" "}
                <span className="font-medium text-[#7650e3]">
                  <span className="font-medium text-[#7650e3]">
                    {user.walle}
                    {user.wallet.package.name}
                  </span>{" "}
                </span>
                features :
              </p>

              <div className="flex gap-2 flex-col">
                <FeatureLossItem
                  label={t("video_post_generation")}
                  icon={videoIcon}
                />
                <FeatureLossItem
                  label={t("images_post_generation")}
                  icon={imageIcon}
                />
                <FeatureLossItem
                  label={t("text_post_generation")}
                  icon={textIcon}
                />
              </div>

              <div className="border border-purple-600 rounded-md px-5 py-4 bg-white flex justify-between items-start">
                <div className="flex  gap-2 items-center">
                  <div className="md:w-12 md:h-12 h-8 w-8  flex-shrink-0">
                    <img
                      src={coinIcon}
                      alt="Omni Coin"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {t("rollover_omni_coins")}
                    </p>
                    <p className="md:text-base text-sm font-semibold text-slate-800 leading-none">
                      {t("potential_coins_lost")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-[#000000] mb-1">
                    {t("current_excess")}
                  </p>
                  <p className="md:text-lg text-base font-medium text-slate-900 leading-none">
                    {user.wallet.coins}
                  </p>
                </div>
              </div>

              <p className="text-sm  text-black ">
                {t("proceed_cancel_message")}
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={onPause}
                className="w-full bg-purple-600 hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] text-white font-semibold py-2.5 disabled:cursor-not-allowed px-3 text-sm sm:text-base rounded-md transition-all duration-150 disabled:opacity-50 flex justify-between items-center border border-[#7F56D9]"
              >
                <span>{t("continue_subscription")}</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <button
                disabled={isCanceled}
                onClick={onCancel}
                className=" w-full hover:bg-[#d7d7fc] disabled:cursor-not-allowed hover:text-[#7650e3]  text-[#7650e3] font-semibold py-2.5  px-3  text-sm sm:text-base rounded-md transition disabled:opacity-50 flex justify-between items-center  border border-[#7F56D9]"
              >
                <span>
                  {isCanceled ? t("processing2") : t("proceed_cancellation")}
                </span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>

              <button
                onClick={openDowngradeModel}
                className=" w-full hover:bg-[#d7d7fc] disabled:cursor-not-allowed hover:text-[#7650e3]  text-[#7650e3] font-semibold py-2.5  px-3  text-sm sm:text-base rounded-md transition disabled:opacity-50 flex justify-between items-center  border border-[#7F56D9]"
              >
                <span>Downgrade Subscription</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPauseModal;
