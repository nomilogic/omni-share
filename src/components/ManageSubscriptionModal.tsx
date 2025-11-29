import React, { useEffect, useState } from "react";
import { X, FileText, ChevronRight, PlusCircle } from "lucide-react";
import Illustration from "../assets/manarge-subscription-img.png";
import Transactions from "../assets/transactions.png";
import SubscriptionPauseModal from "./SubscriptionPauseModal";
import TransactionHistory from "@/pages/TransectionHistory";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import API from "@/services/api";
import { notify } from "@/utils/toast";
import { useTranslation } from "react-i18next";

export const ManageSubscriptionModal: React.FC<any> = ({
  isOpen,
  onClose,
  onCancelSubscription,
  onAddCoins,
  isCanceled,
  isModalOpen,
  setIsModalOpen,
}) => {
  const { t, i18n } = useTranslation();
    const changeLanguage = (lang: any) => i18n.changeLanguage(lang);
  const [showTransactions, setShowTransactions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReactive, setIsReactive] = useState(false);
  const { user, refreshUser } = useAppContext();

  useEffect(() => {
    if (isReactive || isOpen || isModalOpen || showTransactions) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isReactive, isOpen, isModalOpen, showTransactions]);

  if (!isOpen) return null;

  const handleAction = async (action: () => void | Promise<void>) => {
    try {
      setIsLoading(true);
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  const onViewInvoices = () => {
    setShowTransactions(true);
  };

  const _onClose = () => {
    setShowTransactions(false);
    onClose();
    setIsModalOpen(false);
  };

  const reactivateSubscription = async () => {
    try {
      setIsReactive(true);
      await API.reactivatePackage();
      refreshUser();
      setTimeout(() => {
        _onClose();
      }, 50);
    } catch (error) {
      console.error("Reactivation failed:", error);
      notify("error", "Unable to reactivate subscription");
    } finally {
      setIsReactive(false);
    }
  };
  const getCustomerPortal = async () => {
    setIsReactive(true);
    try {
      const response = await API.getCustomerPortal();
      if (response?.data?.data?.portalUrl) {
        window.location.href = response?.data?.data?.portalUrl;
      } else {
        console.error("No portal URL returned from API.");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
    } finally {
      setIsReactive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center p-0">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <SubscriptionPauseModal
        isVisible={isModalOpen}
        onClose={_onClose}
        isCanceled={isCanceled}
        onCancel={onCancelSubscription}
        onPause={_onClose}
      />

      <div
        className={`relative w-full md:max-w-3xl lg:max-w-5xl md:rounded-md shadow-md overflow-hidden bg-white md:h-[600px] h-full transition-all ${
          !showTransactions && !isModalOpen ? "block" : "hidden"
        }`}
      >
        <div className="flex flex-col sm:grid sm:grid-cols-1 md:grid-cols-2 h-full">
          <div className="bg-purple-600 md:py-8 px-5 flex items-center justify-center md:rounded-l-md w-full md:h-full h-[40%]">
            <img
              src={Illustration}
              alt="Manage subscription illustration"
              className="w-full h-full object-contain object-center"
            />
          </div>
          <div className="px-4 py-5 md:px-8  bg-gray-50 h-full">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-semibold text-[#7650e3]">
                {t("manage_subscription")}
              </h3>
              <button
                onClick={_onClose}
                className="absolute right-3 top-3 w-6 h-6 z-10 rounded-full border-[#7650e3] flex items-center justify-center text-[#7650e3] bg-[#F7F5FB] transition-shadow border-[2px]"
                aria-label="Close manage subscription dialog"
                disabled={isLoading}
              >
                <X className="w-4 h-4 color-[#7650e3] stroke-[#7650e3] stroke-[3]" />
              </button>
            </div>

            <div className="md:w-full z-10 flex flex-col justify-center h-full md:-mt-8">
              <div className="">
                <div className="text-lg font-medium text-gray-500 mb-4">
                  {t("help_today")}
                </div>
                <div className="space-y-3">
                  {[
                    {
                      key: "update",
                      label: t("update_payment_method"),
                      icon: <FileText className="w-4 h-4 text-white" />,
                    },
                    {
                      key: "invoices",
                      label: t("view_invoices"),
                      icon: <FileText className="w-4 h-4 text-white" />,
                    },
                    ...(user?.wallet?.downgradeRequested !== null
                      ? []
                      : user?.wallet?.cancelRequested === false
                      ? [
                          {
                            key: "cancel",
                            label: t("cancel_subscription"),
                            icon: <ChevronRight />,
                          },
                        ]
                      : [
                          {
                            key: "reactive",
                            label: t("reactive_your_subscription"),
                            icon: <ChevronRight />,
                          },
                        ]),
                    {
                      key: "coins",
                      label: t("add_omni_coins"),
                      icon: <PlusCircle className="w-4 h-4" />,
                    },
                  ].map((action) => {
                    const commonClasses =
                      "w-full flex items-center justify-between py-2.5 px-3 rounded-md text-md font-medium transition-all hover:bg-[#d7d7fc] text-[#7650e3]";
                    const buttonClass =
                      "bg-white border border-[#7650e3] text-[#7650e3] hover:shadow-md";

                    return (
                      <button
                        key={action.key}
                        disabled={isReactive}
                        onClick={async () => {
                          let actionFn: () => void | Promise<void>;

                          switch (action.key) {
                            case "update":
                              actionFn = () => getCustomerPortal();
                              break;
                            case "invoices":
                              actionFn = onViewInvoices;
                              break;
                            case "cancel":
                              actionFn = () => setIsModalOpen(true);
                              break;
                            case "reactive":
                              actionFn = () => reactivateSubscription();
                              break;
                            case "coins":
                              actionFn = () => onAddCoins?.();
                              break;
                            default:
                              return;
                          }

                          await handleAction(actionFn);
                        }}
                        className={`${commonClasses} ${buttonClass} bg-white disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-center gap-1">
                          {action.label}
                        </div>
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`relative w-full md:max-w-3xl lg:max-w-5xl  md:rounded-md  shadow-md overflow-hidden bg-white md:h-[600px] h-full  ${
          showTransactions ? "block" : "hidden"
        }`}
      >
        <div className="flex  flex-col sm:grid sm:grid-cols-1 md:grid-cols-2 h-full ">
          <div className="bg-[#7650e3] flex items-center  justify-center w-full md:h-full h-[40%]">
            <img
              src={Transactions}
              alt="Manage subscription illustration"
              className="w-full h-full object-contain  md:object-center object-bottom  "
            />
          </div>

          <div className="w-full px-4 py-5 md:px-8  z-10 flex bg-gray-100 flex-grow flex-col">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-semibold text-[#7650e3]">
                {t("view_invoices")}
              </h3>
              <button
                onClick={_onClose}
                className="absolute right-3 top-3 w-6 h-6 z-10 rounded-full border-[#7650e3] flex items-center justify-center text-[#7650e3] bg-[#F7F5FB] transition-shadow border-[2px]"
                aria-label="Close manage subscription dialog"
                disabled={isLoading}
              >
                <X className="w-4 h-4 color-[#7650e3] stroke-[#7650e3] stroke-[3]" />
              </button>
            </div>

            <div className="space-y-3 mt-4 h-[58vh] overflow-y-auto pb-20">
              <TransactionHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
