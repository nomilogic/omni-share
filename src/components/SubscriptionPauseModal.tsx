import React, { useEffect } from "react";
import CloseIcon from "./icons/CloseIcon";
import FeatureLossItem from "./FeatureLossItem";
import ModalIllustration from "./ModalIllustration";
import videoIcon from "../assets/05-02.png";
import imageIcon from "../assets/05-01.png";
import textIcon from "../assets/05-03.png";
import coinIcon from "../assets/spiral-logo.svg";
import ArrowRightIcon from "./icons/ArrowRightIcon";
import { X } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Wallet } from "./../lib/wallet";
import ModalIllustrationPng from "../assets/cancle-popup.png";
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
}: any) => {
  if (!isVisible) return null;
  const { user } = useAppContext();

  return (
    <div className=" flex md:items-center justify-center p-0 z-50 transition-opacity duration-300 font-inter top-0 overflow-hidden">
      <div className="relative w-full md:max-w-3xl lg:max-w-5xl rounded-2xl shadow-md overflow-hidden bg-slate-100  ">
        <div className="grid grid-cols-1 md:grid-cols-2 ">
          <div className=" bg-purple-600 flex pl-6 pt-10 rounded-l-xl w-full ">
            <img
              src={ModalIllustrationPng}
              alt="Pause Illustration"
              className="w-full h-full object-center  "
            />
          </div>

          <div className="w-full  p-6 flex flex-col gap-5 overflow-y-auto">
            <div className="flex items-center gap-1  ">
              <h2 className="text-2xl font-semibold text-[#7650e3]">
                Consider Canceling Your Subscription?
              </h2>
              <button
                onClick={onClose}
                className="absolute right-4 top-7 w-6 h-6 z-10 rounded-full border-[#7650e3] flex items-center justify-center text-[#7650e3] bg-[#F7F5FB] transition-shadow border-[2px]"
                aria-label="Close manage subscription dialog"
              >
                <X className="w-4 h-4 color-[#7650e3] stroke-[#7650e3] stroke-[3]" />
              </button>
            </div>

            <div className=" flex flex-col justify-center gap-4">
              <p className="text-sm sm:text-base text-[#000000] ">
                By canceling now, you'll lose{" "}
                <span className="font-medium text-[#7650e3]">
                  {user.walle}
                  {user.wallet.package.name}
                </span>{" "}
                access on due date{" "}
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
                , forfeit all rollover tokens in your bank and lose these{" "}
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
                  label="Video Post Generation"
                  icon={videoIcon}
                />
                <FeatureLossItem
                  label="Images Post Generation"
                  icon={imageIcon}
                />
                <FeatureLossItem label="Text Post Generation" icon={textIcon} />
              </div>

              <div className="border border-purple-600 rounded-md px-5 py-4 bg-white flex justify-between items-start">
                <div className="flex  gap-2 items-center">
                  <div className="w-12 h-12  flex-shrink-0">
                    <img
                      src={coinIcon}
                      alt="Omni Coin"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Rollover Omni Coins
                    </p>
                    <p className="text-base font-semibold text-slate-800 leading-none">
                      Potential Coins Lost
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-[#000000] mb-1">
                    Current Excess
                  </p>
                  <p className="text-lg font-medium text-slate-900 leading-none">
                    {user.wallet.coins}
                  </p>
                </div>
              </div>

              <p className="text-sm  text-black ">
                If you still want to cancel, select "Proceed with Cancelation".
                Alternatively, consider pausing your subscription for 3 months
                to save your current benefits.
              </p>
            </div>

            <div className="space-y-2">
              <button
                className=" w-full hover:bg-[#d7d7fc] disabled:cursor-not-allowed hover:text-[#7650e3]  text-[#7650e3] font-semibold py-2.5  px-3  text-sm sm:text-base rounded-md transition disabled:opacity-50 flex justify-between items-center  border border-[#7F56D9]"
                onClick={onPause}
              >
                <span>Continue with Subscription</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>

              <button
                disabled={isCanceled}
                onClick={onCancel}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5  px-3 text-sm sm:text-base rounded-md transition disabled:opacity-50 flex justify-between items-center border   border-[#7F56D9]"
              >
                <span>Proceed with Cancellation</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPauseModal;
