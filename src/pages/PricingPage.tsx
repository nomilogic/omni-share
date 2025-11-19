"use client";

import type React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Check, Loader2, Calendar, X, Gift } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import API from "../services/api";
import { useSearchParams } from "react-router-dom";
import Icon from "../components/Icon";
import { useSubscriptionModal } from "../context/SubscriptionModalContext";
import { usePricingModal } from "../context/PricingModalContext";
import { notify } from "../utils/toast";

export const PricingPage: React.FC = () => {
  const { state, refreshUser } = useAppContext();

  const [packages, setPackages] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as "" | "addons") || "";

  const [activeTab, setActiveTab] = useState<"" | "addons">(initialTab);

  // Local loading flags for actions initiated from this page
  const [loadingPackage, setLoadingPackage] = useState(false);
  const [loadingAddon, setLoadingAddon] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<any | null>(null);

  // Pricing modals are controlled by shared context rendered inside AppLayout
  const {
    openConfirm,
    openAddonConfirm,
    openDowngradeRequest,
    setConfirmHandler,
    setAddonHandler,
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const packagesRes = await API.listPackages();
        setPackages(packagesRes.data.data || []);

        const addonsRes = await API.listAddons();
        setAddons(addonsRes.data.data || []);
      } catch (error) {
        console.error("Failed to load packages/addons:", error);
      }
    };
    fetchData();
  }, []);

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
      const res = await API.buyPackage(plan.id);
      const redirectUrl = res?.data?.data?.url;
      if (redirectUrl) {
        window.location.href = redirectUrl; //window.open(redirectUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to buy package:", error);
      alert("Something went wrong while processing your Buy.");
    } finally {
      setLoadingPackage(false);
    }
  };

  const handleUpdatePackage = async (selectedPlan: any) => {
    setLoadingPackage(true);
    try {
      await API.requestUpgradePackage(selectedPlan.id);
      setTimeout(() => refreshUser(), 50);
    } catch (error) {
    } finally {
      setLoadingPackage(false);
    }
  };
  const handleRequestDowngrade = async (plan: any) => {
    setDowngradeLoading(true);
    try {
      await API.requestDowngrade(plan.id);
      setTimeout(() => refreshUser(), 50);
    } catch (error) {
      console.error("Request downgrade failed:", error);
      alert("Failed to request downgrade");
    } finally {
      setDowngradeLoading(false);
    }
  };

  const handleCancelDowngradeRequest = async () => {
    setDowngradeLoading(true);
    try {
      await API.cancelDowngradeRequest();
      setTimeout(() => refreshUser(), 50);
    } catch (error) {
      console.error("Cancel downgrade failed:", error);
      alert("Failed to cancel downgrade request");
    } finally {
      setDowngradeLoading(false);
    }
  };

  const handleBuyAddon = async (addon: any) => {
    if (!addon) return;
    setLoadingAddon(true);
    setSelectedAddon(addon);
    try {
      const res = await API.buyAddons(addon.id);
      const redirectUrl = res?.data?.data?.checkoutUrl;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (error) {
      notify("error", "Something went wrong while buying add-on");
    } finally {
      setLoadingAddon(false);
      setSelectedAddon(null);
    }
  };

  return (
    <div>
      <div className="w-full h-full rounded-md mb-10 md:px-4 px-3 py-5 min-h-screen transition-colors ">
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
              Plans
            </button>
            {activePackage?.package?.tier !== "free" && !hasCancelRequested && (
              <button
                onClick={() => handleTabChange("addons")}
                className={`px-5 pb-2  font-semibold transition-all border-b-2 rounded-t-lg ${
                  activeTab === "addons"
                    ? "border-purple-600 border-b  text-purple-600"
                    : ""
                }`}
              >
                Buy Omni Coins
              </button>
            )}
          </div>
        </div>
        {activeTab === "" && (
          <>
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
                        <span className="text-[50px]   text-purple-600 font-bold">
                          <span className="text-[#7650e3] font-bold text-2xl mr-1">
                            $
                          </span>
                          {tier.amount}
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
                                currentPlanAmount: Number(currentTier?.amount ?? 0),
                                downgradePlanName: pendingDowngradePackage?.name ?? "",
                              });
                              setCancelDowngradeHandler(async () => {
                                await handleCancelDowngradeRequest();
                              });
                            }
                            else if (isCurrentPlan) openManageSubscription();
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
                            ? "Manage"
                            : isCurrentPlan && !hasPendingDowngrade
                            ? "Manage"
                            : isCurrentPlan
                            ? "Manage"
                            : isPendingDowngradePackage
                            ? "Cancel Request"
                            : isLowerPlan
                            ? "Switch Plan"
                            : "Switch Plan"}
                        </button>
                      )}
                    </div>

                    <div className=" px-6 py-4">
                      <div className="mb-4 border-b-2 border-purple-600  h-[115px] text-center">
                        <p className=" text-purple-600 font-bold text-2xl mb-2 ">
                          Ideal for:
                        </p>
                        <p className="text-lg text-slate-800 font-medium">
                          {"Small agency, growing business, content team"}
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
          </>
        )}
        {activePackage?.package?.tier !== "free" && activeTab === "addons" && (
          <div className="grid xl:grid-cols-3  md:grid-cols-2 gap-5">
            {addons?.length === 0 ? (
              <p className="col-span-3 text-center text-[#7650e3]">
                No credits available
              </p>
            ) : (
              addons?.map((addon) => {
                const hasSale = addon.isSale;
                const bonusAmount = addon.bonus || 0;
                const totalCoins = addon.coins + bonusAmount;

                return (
                  <div
                    key={addon.id}
                    className="rounded-md border-3 border-gray-200 shadow-md  bg-white transform transition-all relative w-full pt-3"
                  >
                    <div className="text-left font-medium text-3xl px-5 py-2.5  pb-[4rem]">
                      <div className="flex items-center gap-1 mb-1">
                        <div className="text-[22px] font-semibold text-slate-900">
                          {totalCoins?.toLocaleString()}
                        </div>
                        {addon.isSale && (
                          <span className="bg-[#7650e3] text-white px-2 py-0.5 rounded text-xs font-semibold">
                            Flash Sale
                          </span>
                        )}
                      </div>
                      <div className="text-[0.8rem] text-slate-800 -mt-[18px]  w-full">
                        {hasSale ? (
                          <>
                            Total: {addon.coins.toLocaleString()}{" "}
                            <span className="mx-1">+</span>
                            <span className="text-[#7650e3] inline-block">
                              {bonusAmount.toLocaleString()} Bonus
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

                    <div className="flex justify-between bg-purple-100 items-center px-5  py-2.5 rounded-b-md">
                      <p className="text-center text-2xl text-purple-600 font-semibold ">
                        ${addon.amount.toLocaleString()}
                      </p>
                      <button
                        disabled={selectedAddon?.id === addon.id || loadingAddon}
                        onClick={() => {
                          setSelectedAddon(addon);
                          handleBuyAddon(addon);
                        }}
                        className="rounded-md theme-bg-light  w-fit  px-3 disabled:cursor-not-allowed  font-bold text-base py-1  border-2 border-[#7650e3] text-[#7650e3] hover:bg-[#7650e3] hover:text-white"
                      >
                        {selectedAddon?.id === addon.id ? "Buying...." : "Buy Now"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
