import React from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
import { usePricingModal } from "../context/PricingModalContext";
import Icon from "./Icon";
import { useAppContext } from "@/context/AppContext";
import { useTranslation } from "react-i18next";

export const PricingModals: React.FC = () => {
  const { t, i18n } = useTranslation();
  const changeLanguage = (lang: any) => i18n.changeLanguage(lang);
  const {
    confirmOpen,
    selectedPlan,
    loadingPackage,
    closeConfirm,
    runConfirmHandler,

    downgradeRequestOpen,
    downgradeLoading,
    downgradeReason,
    setDowngradeReason,
    closeDowngradeRequest,
    runDowngradeHandler,

    cancelDowngradeOpen,
    cancelDowngradeData,
    closeCancelDowngrade,
    runCancelDowngradeHandler,
  } = usePricingModal();
  const { paymentProcessing } = useAppContext();
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const originalOverflow = document.body.style.overflow;
    const anyOpen = confirmOpen || downgradeRequestOpen || cancelDowngradeOpen;

    if (anyOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow || "";
    }

    return () => {
      document.body.style.overflow = originalOverflow || "";
    };
  }, [confirmOpen, downgradeRequestOpen, cancelDowngradeOpen]);

  const modalContent = (
    <>
      {paymentProcessing ? (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex lg:items-center justify-center p-4 z-50">
          <div className="bg-gray-50 rounded-md shadow-md w-full max-w-md px-6 py-10 h-fit relative">
            <div className="flex justify-center items-center mb-4">
              <Icon name="spiral-logo" size={45} className="animate-spin " />
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 text-center">
              Processing your payment
            </h2>

            <p className="text-gray-600 text-sm text-center mt-2 leading-relaxed">
              Hold tight while we complete your secure transaction.
            </p>

            <div className="w-full mt-6 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-purple-500 animate-pulse rounded-full"></div>
            </div>
          </div>
        </div>
      ) : null}
      {confirmOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex lg:items-center justify-center p-4 z-50">
          <div className="bg-gray-50 rounded-md shadow-md w-full max-w-md px-8 py-6 h-fit relative">
            <button
              onClick={closeConfirm}
              className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center border border-purple-700 rounded-full hover:bg-purple-50"
            >
              <X className="w-4 h-4 text-purple-700 stroke-[3px]" />
            </button>

            <div className="flex justify-between items-center mb-3">
              <h2 className="text-2xl font-bold text-purple-700">
                Confirm Plan
              </h2>
            </div>

            {/* Price Box */}
            <div className="border border-purple-600 bg-white rounded-md px-4 text-center">
              <p className="text-2xl font-bold text-purple-700 mb-1 mt-2">
                {selectedPlan.name || "Standard"}
              </p>

              <div className="flex justify-center items-end gap-4">
                <span className="text-[45px] text-purple-600 font-bold leading-none">
                  ${selectedPlan.amount + ".00" || "25.00"}
                </span>

                <div className="flex flex-col items-start leading-none font-semibold">
                  <span className="text-sm font-bold text-purple-700">USD</span>
                  <span className="text-sm font-bold text-purple-700">
                    Month
                  </span>
                </div>
              </div>

              <p className="text-[12px] font-semibold text-black mt-2 mb-3">
                Includes GST of $0.00.
              </p>
            </div>

            <div className="text-center text-[13px] text-gray-500 font-medium my-6">
              We are committed to secure payments for businesses and service
              providers without any limitations.
            </div>

            <div>
              <button
                className="w-full py-2.5 border border-purple-600 bg-purple-600 text-white text-[15px] font-semibold rounded-md hover:bg-purple-700 transition shadow-md flex items-center justify-center gap-2"
                onClick={runConfirmHandler}
                disabled={loadingPackage}
              >
                {loadingPackage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Proceed to Checkout"
                )}
              </button>
              <button
                onClick={closeConfirm}
                className="flex-1 py-2.5 w-full mt-2 border border-purple-600 text-purple-600 font-semibold rounded-md 
           hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] transition"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Addon Confirm Modal removed - Omni Coins purchase goes directly to Stripe */}

      {/* Downgrade Request Modal */}
      {downgradeRequestOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex lg:items-center justify-center p-4 z-50">
          <div className="bg-gray-50 rounded-md shadow-md w-full max-w-md px-8 py-6 max-h-[80vh] h-fit overflow-auto relative">
            <button
              onClick={closeDowngradeRequest}
              className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center border border-purple-700 rounded-full hover:bg-purple-50"
            >
              <X className="w-4 h-4 text-purple-700 stroke-[3px]" />
            </button>

            <div className="flex justify-between items-center mb-3">
              <h2 className="text-2xl font-bold text-purple-700">
                {t("request_downgrade_to")}
              </h2>
            </div>

            {/* Price Box */}
            <div className="border border-purple-600 bg-white rounded-md px-4 text-center mb-6">
              <p className="text-2xl font-bold text-purple-700 mb-1 mt-2">
                {selectedPlan.name}
              </p>

              <div className="flex justify-center items-end gap-4">
                <span className="text-[45px] text-purple-600 font-bold leading-none">
                  ${selectedPlan.amount || "0.00"}
                </span>

                <div className="flex flex-col items-start leading-none font-semibold">
                  <span className="text-sm font-bold text-purple-700">USD</span>
                  <span className="text-sm font-bold text-purple-700">
                    {t("month")}
                  </span>
                </div>
              </div>
              <hr className="h-[1px] bg-gray-100 my-2" />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeDowngradeRequest}
                className="flex-1 py-2.5 border border-purple-600 text-purple-600 font-semibold rounded-md hover:bg-purple-50 transition"
              >
                {t("back")}
              </button>

              <button
                onClick={runDowngradeHandler}
                disabled={downgradeLoading}
                className="flex-1 py-2.5 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downgradeLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  t("confirm")
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Downgrade Modal */}
      {cancelDowngradeOpen && cancelDowngradeData && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-50 rounded-md shadow-md w-full max-w-md px-8 py-6 relative h-fit">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-2xl font-bold text-purple-700">
                {t("cancel_downgrade_request")}
              </h2>
            </div>

            <p className="text-gray-500 text-sm mb-4">
              {t("cancel_downgrade_message")}
            </p>

            <div className="bg-white border text-gray-500 border-purple-600 rounded-md p-4 mb-6">
              <p className="text-sm font-semibold ">
                <span className="">{t("active_plan")}</span> <span className="text-purple-600">
                  {cancelDowngradeData.currentPlanName}
                </span>
              </p>

              <p className="text-sm font-semibold mt-2 border-b pb-3">
                <span className="">{t("monthly_cost")}</span> <span className=" text-purple-600 ">
                  ${cancelDowngradeData.currentPlanAmount}/month
                </span> </p>

              <p className="text-sm  font-semibold mt-2">
                <span className="">{t("planned_downgrade")}</span> <span className=" text-purple-600 ">
                  {cancelDowngradeData.downgradePlanName}
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeCancelDowngrade}
                className="flex-1 py-2.5 border border-purple-600 text-purple-600 font-semibold rounded-md hover:bg-purple-50 transition"
              >
                {t("back")}
              </button>

              <button
                onClick={runCancelDowngradeHandler}
                disabled={downgradeLoading}
                className="flex-1 py-2.5 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downgradeLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("canceling")}
                  </>
                ) : (
                  t("confirm")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (typeof document === "undefined") return null;

  return createPortal(modalContent, document.body);
};
