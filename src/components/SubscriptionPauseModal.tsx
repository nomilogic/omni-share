import React, { useEffect } from "react";
import CloseIcon from "./icons/CloseIcon";
import FeatureLossItem from "./FeatureLossItem";
import ModalIllustration from "./ModalIllustration";
import videoIcon from "../assets/05-02.png";
import imageIcon from "../assets/05-01.png";
import textIcon from "../assets/05-03.png";
import coinIcon from "../assets/01-04.png";
import ArrowRightIcon from "./icons/ArrowRightIcon";
import { X } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Wallet } from './../lib/wallet';

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

const SubscriptionPauseModal = ({ isVisible, onClose, onPause, onCancel }) => {
  if (!isVisible) return null;
  const { user, logout, balance } = useAppContext();
  useEffect(() => {
    console.log(user, "user");
  })

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex md:items-center justify-center p-0 z-50 transition-opacity duration-300 font-inter top-0 overflow-hidden">
      <div className="bg-white md:rounded-[24px] shadow-2xl md:max-w-3xl lg:max-w-5xl w-full flex flex-col md:flex-row transform transition-all duration-300 scale-100 h-[100vh] overflow-hidden no-scroll md:h-[60vh] ">
        {/* Left Illustration Section */}
        <div className=" w-full md:w-2/5 h-[30vh] md:h-full">
          <ModalIllustration />
        </div>

        {/* Right Content Section */}
        <div className="w-full md:w-3/5 p-4 flex flex-col gap-0 overflow-y-auto">
          <div className="flex items-center gap-1 mb-2 md:mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#7650e3] leading-snug">
              Consider Canceling Your Subscription?
            </h2>
            <button
              onClick={onClose}
              className="absolute right-4 top-4 w-7 h-7 rounded-full border border-[#7650e3] flex items-center justify-center text-[#7650e3] bg-[#F7F5FB] transition-shadow "
              aria-label="Close manage subscription dialog"
            >
              <X className="w-5 h-5  color-[#7650e3] stroke-[#7650e3] stroke-[3] " />
            </button>
          </div>

          <div className="mb-2 flex-grow">
            <p className="text-sm sm:text-base text-[#000000] mb-2 md:mb-2 font-semibold">
              By canceling now, you'll lose{" "}
              <span className="font-bold text-[#7650e3]">
                {user.walle}
                {user.wallet.package.name}
              </span>{" "}
              access on due date{" "}
              <span className="font-bold text-[#7650e3]">
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
              of your next billing cycle, forfeit all rollover tokens in your
              bank and lose these{" "}
              <span className="font-bold text-[#7650e3]">
                <span className="font-bold text-[#7650e3]">
                  {user.walle}
                  {user.wallet.package.name}
                </span>{" "}
              </span>
              features :
            </p>

            <div className="mb-2 md:mb-2 space-y-1">
              <FeatureLossItem label="Video Post Generation" icon={videoIcon} />
              <FeatureLossItem
                label="Images Post Generation"
                icon={imageIcon}
              />
              <FeatureLossItem label="Text Post Generation" icon={textIcon} />
            </div>

            <div className="border border-[#9F8CF0] rounded-xl p-4 bg-[#F9FAFB] flex justify-between items-start mb-2 md:mb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 mr-3 flex-shrink-0">
                  <img
                    src={coinIcon}
                    alt="Omni Coin"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Rollover Omni Coins
                  </p>
                  <p className="text-lg font-bold text-gray-800 leading-none">
                    Potential Coins Lost
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-[#000000] mt-1">
                  Current Excess
                </p>
                <p className="text-lg font-bold text-gray-900 leading-none">
                  {user.wallet.coins}
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#000000] mb-2 md:mb-2 font-semibold">
              If you still want to cancel, select{" "}
              <span className="font-bold text-[#7650e3]">
                "Proceed with Cancelation"
              </span>
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold p-2.5 text-sm sm:text-base rounded-lg transition disabled:opacity-50 flex justify-between items-center border-2 border-[#7F56D9]"
              onClick={onPause}
            >
              <span>Continue with Subscription</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>

            <button
              className=" w-full hover:bg-[#d7d7fc] hover:text-[#7650e3]  text-[#7650e3] font-semibold p-2.5  text-sm sm:text-base rounded-lg transition disabled:opacity-50 flex justify-between items-center  border-2 border-[#7F56D9]"
              onClick={onCancel}
            >
              <span>Proceed with Cancelation</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPauseModal;
