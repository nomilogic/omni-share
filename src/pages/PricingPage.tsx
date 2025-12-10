"use client";

import type React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Check } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import API from "../services/api";
import { Link, useSearchParams } from "react-router-dom";
import Icon from "../components/Icon";
import { useSubscriptionModal } from "../context/SubscriptionModalContext";
import { usePricingModal } from "../context/PricingModalContext";
import { notify } from "../utils/toast";
import { useTranslation } from "react-i18next";
import CustomCurrencySelector from "@/components/CustomCurrencySelector";

export const PricingPage: React.FC = () => {
  const { state, refreshUser, setProcessing, packages, addons, loader, user } =
    useAppContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as "" | "addons") || "";
  const sessionId = searchParams.get("session_id");

  const [activeTab, setActiveTab] = useState<"" | "addons">(initialTab);

  const [loadingPackage, setLoadingPackage] = useState(false);
  const [loadingAddon, setLoadingAddon] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<any | null>(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    console.log("sessionId", sessionId);
    if (sessionId !== null) {
      setProcessing(true);
      const timeoutId = setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("session_id");
        window.history.replaceState({}, "", url);
        setProcessing(false);
      }, 4000);
      return () => clearTimeout(timeoutId);
    } else {
      setProcessing(false);
    }
  }, [sessionId]);
  const {
    openConfirm,
    openDowngradeRequest,
    setConfirmHandler,
    setDowngradeHandler,
    openCancelDowngrade,
    setCancelDowngradeHandler,
  } = usePricingModal();

  const [downgradeLoading, setDowngradeLoading] = useState(false);

  const activePackage = state?.user?.wallet;

  useEffect(() => {
    if (initialTab === "addons") {
      setActiveTab("addons");
    } else {
      setActiveTab("");
    }
  }, [initialTab]);

  const getTierById = useCallback(
    (id: string) => packages.find((p: any) => p.id === id),
    [packages]
  );

  const currentTier = useMemo(() => {
    if (!activePackage?.packageId) return null;
    return getTierById(activePackage.packageId);
  }, [activePackage?.packageId, getTierById]);

  const hasPendingDowngrade = !!activePackage?.downgradeRequested;
  const pendingDowngradePackage = useMemo(() => {
    if (!hasPendingDowngrade) return null;
    return getTierById(activePackage?.downgradeRequested);
  }, [hasPendingDowngrade, activePackage?.downgradeRequested, getTierById]);

  const hasCancelRequested = !!activePackage?.cancelRequested;
  const langToCurrency: any = { en: "USD", es: "EUR", zh: "CNY" };

  const { openManageSubscription } = useSubscriptionModal();

  const handleTabChange = (tab: "" | "addons") => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleChoosePlan = (plan: any) => {
    if (loadingPackage) return;

    if (hasCancelRequested || hasPendingDowngrade) return;

    const nextAmount = Number(plan.amount ?? 0);
    const currentAmount = Number(currentTier?.amount ?? 0);
    const isUpgrade = nextAmount > currentAmount;

    const currentExpired =
      activePackage?.expiredAt &&
      new Date(activePackage.expiredAt) < new Date();

    // If it's a downgrade (lower price) on an active, not-expired plan, open downgrade modal
    if (currentTier && !isUpgrade && !currentExpired) {
      openDowngradeRequest(plan);
      setDowngradeHandler(async () => {
        await handleRequestDowngrade(plan);
      });
      return;
    }

    // Otherwise confirm flow: use buyPackage for free tier, upgrade endpoint for paid tiers
    openConfirm(plan);
    setConfirmHandler(async () => {
      if (activePackage?.package?.tier === "free") {
        await handleSubscribe(plan);
      } else {
        await handleUpdatePackage(plan);
      }
    });
  };

  const handleSubscribe = async (plan: any) => {
    setLoadingPackage(true);
    try {
      const language = localStorage.getItem("siteLang") ?? "en";
      const res = await API.buyPackage(plan.id, language);
      const redirectUrl = res?.data?.data?.url;
      if (redirectUrl) {
        window.location.href = redirectUrl; //window.open(redirectUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to buy package:", error);
      notify("error", t("buy_processing_error"));
    } finally {
      setLoadingPackage(false);
    }
  };

  const handleUpdatePackage = async (selectedPlan: any) => {
    setLoadingPackage(true);

    try {
      await API.requestUpgradePackage(selectedPlan.id);

      refreshUser();
    } catch (error) {
    } finally {
      setLoadingPackage(false);
    }
  };
  const handleRequestDowngrade = async (plan: any) => {
    setDowngradeLoading(true);

    try {
      await API.requestDowngrade(plan.id);

      refreshUser();
    } catch (error) {
      console.error("Request downgrade failed:", error);
      notify("error", t("failed_request_downgrade"));
    } finally {
      setDowngradeLoading(false);
    }
  };

  const handleCancelDowngradeRequest = async () => {
    setDowngradeLoading(true);
    try {
      await API.cancelDowngradeRequest();

      refreshUser();
    } catch (error) {
      console.error("Cancel downgrade failed:", error);
      notify("error", t("failed_cancel_downgrade"));
    } finally {
      setDowngradeLoading(false);
    }
  };

  const handleBuyAddon = async (addon: any) => {
    if (!addon) return;
    setLoadingAddon(true);
    setSelectedAddon(addon);

    const language = localStorage.getItem("siteLang") ?? "en";
    try {
      const res = await API.buyAddons(addon.id, language);
      const redirectUrl = res?.data?.data?.checkoutUrl;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (error) {
      notify("error", t("coin_limit_exceed"));
    } finally {
      setLoadingAddon(false);
      setSelectedAddon(null);
    }
  };

  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const apiKey = "80f18a670f8f17b074ee56f9";
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
    {}
  );
  const [convertedAmounts, setConvertedAmounts] = useState<
    Record<string, number>
  >({});
  const [convertedAddonAmounts, setConvertedAddonAmounts] = useState<
    Record<string, number>
  >({});
  const fetchExchangeRates = async () => {
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.result === "success") {
        setExchangeRates(data.conversion_rates);
      }
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
    }
  };
  const convertAmount = (baseAmount: number, currencyCode: string) => {
    if (!exchangeRates || !exchangeRates[currencyCode]) return baseAmount;
    return Number((baseAmount * exchangeRates[currencyCode]).toFixed(2));
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  useEffect(() => {
    if (!exchangeRates) return;

    packages.forEach((pkg) => {
      setConvertedAmounts((prev) => ({
        ...prev,
        [pkg.id]: convertAmount(pkg.amount, selectedCurrency),
      }));
    });

    addons?.forEach((addon) => {
      setConvertedAddonAmounts((prev) => ({
        ...prev,
        [addon.id]: convertAmount(addon.amount, selectedCurrency),
      }));
    });
  }, [exchangeRates, packages, addons, selectedCurrency]);

  const langToCurrencySymbol: Record<string, string> = {
    USD: "$",
    EUR: "€",
    CNY: "¥",
    GBP: "£",
    AUD: "A$",
  };

  return (
    <div className="w-full h-full rounded-md mb-10 md:px-4 px-3 py-5 min-h-screen transition-colors ">
      <h2 className="text-3xl font-bold theme-text-primary mb-8">
        Chose your plan
      </h2>
      <div className="flex justify-between items-center mb-5 border-b border-gray-200 ">
        <div className="flex flex-1">
          <button
            onClick={() => handleTabChange("")}
            className={`px-5 pb-2  font-semibold transition-all border-b-2 rounded-t-lg  ${
              activeTab === ""
                ? "border-purple-600 border-b text-purple-600"
                : ""
            }`}
          >
            {t("plans")}
          </button>
          <button
            onClick={() => handleTabChange("addons")}
            className={`px-5 pb-2  font-semibold transition-all border-b-2 rounded-t-lg ${
              activeTab === "addons"
                ? "border-purple-600 border-b  text-purple-600"
                : ""
            }`}
          >
            {t("buy_omni_coins")}
          </button>
        </div>
        <div className="pb-1">
          <CustomCurrencySelector
            selectedCurrency={selectedCurrency}
            setSelectedCurrency={setSelectedCurrency}
          />
        </div>
      </div>

      {activeTab === "" && (
        <>
          {loader ? (
            <div className=" flex flex-col justify-center items-center min-h-[40vh]">
              <Icon name="spiral-logo" size={45} className="animate-spin" />

              <p className="mt-1 text-base font-medium text-gray-500">
                {t("loading_packages")}
              </p>
            </div>
          ) : (
            <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-5 mx-auto order-2 md:order-1">
              {packages.map((tier: any, index: any) => {
                const mobileOrder =
                  index === 0 ? "order-3" : index === 1 ? "order-2" : "order-1";

                const desktopOrder =
                  index === 0
                    ? "md:order-1"
                    : index === 1
                    ? "md:order-2"
                    : "md:order-3";
                const isCurrentPlan =
                  activePackage?.packageId === tier.id &&
                  activePackage?.isActive;
                const isPendingDowngradePackage =
                  activePackage?.downgradeRequested === tier.id;

                const nextAmount = Number(tier.amount ?? 0);
                const currentAmount = Number(currentTier?.amount ?? 0);
                const isLowerPlan = nextAmount < currentAmount;

                const isLockedByCancel = hasCancelRequested && !isCurrentPlan;
                const isLockedByDowngrade =
                  hasPendingDowngrade &&
                  !isCurrentPlan &&
                  !isPendingDowngradePackage;

                const isFree = tier.amount === 0;
                if (Number(tier.amount) < Number(currentTier?.amount))
                  return null;

                return (
                  <div
                    key={tier.id}
                    className={`rounded-md bg-white overflow-hidden shadow-md transition-transform duration-300 ${
                      !isLockedByCancel && !isLockedByDowngrade
                        ? "hover:shadow-md hover:-translate-y-2"
                        : ""
                    } ${
                      isLockedByCancel || isLockedByDowngrade
                        ? "opacity-60 cursor-not-allowed"
                        : "opacity-100"
                    } relative       ${mobileOrder} ${desktopOrder}`}
                  >
                    <div className="bg-gradient-to-br from-[#c7bdef] to-[#c7bdef] px-6  flex flex-col justify-start items-center min-h-56 pt-7 text-center relative">
                      <h3 className="text-[#7650e3] text-2xl font-bold -mb-1">
                        {tier.name}
                      </h3>
                      <div className="flex items-baseline justify-center gap-1 mb-3">
                        <span className="text-[43px] text-purple-600 font-bold">
                          <span className="text-[#7650e3] font-bold text-2xl mr-1">
                            {langToCurrencySymbol[selectedCurrency] || ""}
                          </span>
                          {convertedAmounts[tier.id] ?? tier.amount}
                        </span>
                        <span className="text-2xl font-bold text-[#7650e3]">
                          / {isFree ? "Forever" : "Month"}
                        </span>
                      </div>

                      {/* CTA Button */}
                      {!isFree && (
                        <button
                          onClick={() => {
                            if (hasCancelRequested && isCurrentPlan)
                              openManageSubscription();
                            else if (isPendingDowngradePackage) {
                              openCancelDowngrade({
                                currentPlanName: currentTier?.name ?? "",
                                currentPlanAmount: Number(
                                  currentTier?.amount ?? 0
                                ),
                                downgradePlanName:
                                  pendingDowngradePackage?.name ?? "",
                              });
                              setCancelDowngradeHandler(async () => {
                                await handleCancelDowngradeRequest();
                              });
                            } else if (isCurrentPlan) openManageSubscription();
                            else if (isCurrentPlan && !hasPendingDowngrade)
                              openManageSubscription();
                            else handleChoosePlan(tier);
                          }}
                          disabled={
                            loadingPackage ||
                            isLockedByCancel ||
                            isLockedByDowngrade
                          }
                          className={`w-full py-3 px-6 rounded-md font-semibold transition-all text-base bg-[#7650e3] text-white hover:bg-[#7650e3] disabled:opacity-50 ${
                            isLockedByCancel || isLockedByDowngrade
                              ? "cursor-not-allowed opacity-60"
                              : "cursor-pointer"
                          }`}
                        >
                          {loadingPackage
                            ? "Processing..."
                            : isCurrentPlan && hasCancelRequested
                            ? t("manage")
                            : isCurrentPlan && !hasPendingDowngrade
                            ? t("manage")
                            : isCurrentPlan
                            ? t("manage")
                            : isPendingDowngradePackage
                            ? t("cancel_request")
                            : isLowerPlan
                            ? t("upgrade")
                            : t("upgrade")}
                        </button>
                      )}
                    </div>

                    <div className=" px-6 py-4">
                      <div className="mb-5 border-b-2 border-purple-600  h-[130px] text-center">
                        <p className=" text-purple-600 font-bold text-2xl mb-1 ">
                          {t("ideal_for")}
                        </p>
                        <p className="text-lg text-slate-800 font-medium">
                          {t("free_ideal_rest")}
                        </p>
                      </div>

                      <ul className="space-y-3 pb-2">
                        {tier.features?.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-800">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
      {activeTab === "addons" && (
        <>
          {user?.wallet?.package.tier === "free" ? (
            <div className="**w-full h-full** **flex items-center justify-center** ">
              {/* The content card - added max-w-sm to control the inner card size */}
              <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
                {/* Information Icon */}
                <div className="mb-2 p-4 rounded-full border-4 border-[#7650e3]">
                  {/* Assuming you are using an 'i' or 'Info' icon component, replace with your actual icon */}
                  <div className="text-[#7650e3] text-4xl font-bold flex items-center justify-center h-12 w-12">
                    i
                  </div>
                </div>

                {/* Message */}
                <p className="text-sm font-medium text-gray-800 mb-2 mt-2">
                  To buy Omni Coins,
                  <br />
                  you must have an active Standard or Pro plan.
                </p>

                {/* Upgrade Button */}
                <Link
                  to="/pricing"
                  onClick={() => setShowPackage(false)}
                  className="w-full mt-2 px-3 py-2.5 border text-md font-semibold rounded-md group flex items-center justify-center gap-2 text-white bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] border-[#7650e3]"
                >
                  <div className="group-hover:filter-omni h-full w-full text-center">
                    <Icon name="white-diamond" size={20} className="mr-2" />
                    {t("upgrade")}
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-5">
              {addons?.length === 0 ? (
                <p className="col-span-3 text-center text-[#7650e3]">
                  No credits available
                </p>
              ) : loader ? (
                <div className="flex flex-col justify-center items-center min-h-[40vh]">
                  <Icon name="spiral-logo" size={45} className="animate-spin" />
                  <p className="mt-1 text-base font-medium text-gray-500">
                    Loading Omnicoins....
                  </p>
                </div>
              ) : (
                addons?.map((addon) => {
                  const hasSale = addon.isSale;
                  const bonusAmount = addon.bonus || 0;
                  const totalCoins = addon.coins + bonusAmount;

                  return (
                    <div
                      key={addon.id}
                      className="rounded-md border-3 border-gray-200 shadow-md bg-white transform transition-all relative w-full pt-3"
                    >
                      <div className="text-left font-medium text-3xl px-5 py-2.5 pb-[4rem]">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="text-[22px] font-semibold text-slate-900">
                            {totalCoins?.toLocaleString()}
                          </div>

                          {addon.isSale && (
                            <span className="bg-[#7650e3] text-white px-2 py-0.5 rounded text-xs font-semibold">
                              {t("flash_sale")}
                            </span>
                          )}
                        </div>

                        <div className="text-[0.8rem] text-slate-800 -mt-[18px] w-full">
                          {hasSale ? (
                            <>
                              {t("total")}: {addon.coins.toLocaleString()}
                              <span className="mx-1">+</span>
                              <span className="text-[#7650e3] inline-block">
                                {bonusAmount.toLocaleString()} {t("bonus")}
                              </span>
                            </>
                          ) : (
                            <>Total: {totalCoins.toLocaleString()}</>
                          )}
                        </div>

                        <Icon
                          name="spiral-grey"
                          className="absolute -z-10 top-3 right-2"
                          size={120}
                        />
                      </div>

                      <div className="flex justify-between bg-purple-100 items-center px-5 py-2.5 rounded-b-md">
                        <p className="text-center text-2xl text-purple-600 font-semibold">
                          {langToCurrencySymbol[selectedCurrency] || ""}
                          {convertedAddonAmounts[addon.id] ?? addon.amount}
                        </p>

                        <button
                          disabled={
                            user?.wallet?.package.tier === "free" ||
                            selectedAddon?.id === addon.id ||
                            loadingAddon
                          }
                          onClick={() => {
                            setSelectedAddon(addon);
                            handleBuyAddon(addon);
                          }}
                          className="rounded-md theme-bg-light w-fit px-3 disabled:cursor-not-allowed font-bold text-base py-1 border border-[#7650e3] text-[#7650e3] hover:bg-[#d7d7fc] transition hover:text-purple-600"
                        >
                          {selectedAddon?.id === addon.id
                            ? "Buying...."
                            : t("buy_now")}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
