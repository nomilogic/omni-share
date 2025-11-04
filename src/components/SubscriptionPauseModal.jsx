import React from "react";
import CloseIcon from "./icons/CloseIcon";
import ArrowRightIcon from "./icons/ArrowRightIcon";
import FeatureLossItem from "./FeatureLossItem";
import ModalIllustration from "./ModalIllustration";
import videoIcon from "../assets/05-02.png";
import imageIcon from "../assets/05-01.png";
import textIcon from "../assets/05-03.png";
import coinIcon from "../assets/01-04.png";

const SubscriptionPauseModal = ({ isVisible, onClose, onPause, onCancel }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-50 transition-opacity duration-300 font-inter">
      <div className="bg-white rounded-[24px] shadow-2xl max-w-5xl w-full flex flex-col md:flex-row transform transition-all duration-300 scale-100">
        
        {/* Left Illustration Section */}
        <div className="hidden md:block w-full md:w-2/5 flex-shrink-0">
          <ModalIllustration />
        </div>

        {/* Right Content Section */}
        <div className="w-full md:w-3/5 p-8 sm:p-10 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#552fd2] leading-snug">
              Consider Pausing Your Subscription?
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition duration-150 p-1 rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-8 flex-grow">
            <p className="text-sm sm:text-base text-[#000000] mb-6 font-semibold">
              By canceling now, you'll lose{" "}
              <span className="font-bold text-[#552fd2]">premium access</span>{" "}
              on 20 November 2025, forfeit all rollover tokens in your bank and
              lose these{" "}
              <span className="font-bold text-[#552fd2]">
                premium features
              </span>
              :
            </p>

            <div className="mb-6 space-y-2">
              <FeatureLossItem label="Video Post Generation" icon={videoIcon} />
              <FeatureLossItem label="Images Post Generation" icon={imageIcon} />
              <FeatureLossItem label="Text Post Generation" icon={textIcon} />
            </div>

            <div className="border border-[#9F8CF0] rounded-xl p-4 bg-[#F9FAFB] flex justify-between items-start mb-6">
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
                  6,000
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#000000] mb-6 font-semibold">
              If you still want to cancel, select{" "}
              <span className="font-bold text-[#552fd2]">
                "Proceed with Cancelation"
              </span>
              . Alternatively, consider pausing your subscription for{" "}
              <span className="font-bold text-[#552fd2]">3 months</span> to
              save your current benefits.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-4">
            <button
              className="w-full py-4 px-4 flex justify-between items-center text-[#7F56D9] bg-white border-2 border-[#7F56D9] rounded-xl font-semibold text-base hover:bg-[#F9F5FF] transition duration-200 shadow-md"
              onClick={onPause}
            >
              <span>Pause for 31 June 2025</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>

            <button
              className="w-full py-4 px-4 flex justify-between items-center text-white bg-[#542ed2] rounded-xl font-semibold text-base hover:bg-[#6941C6] transition duration-200 shadow-lg"
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
