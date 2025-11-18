"use client";

import type React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Check, Loader2, Calendar, X, Gift } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import API from "../services/api";
import { useSearchParams } from "react-router-dom";
import Icon from "../components/Icon";
import { useSubscriptionModal } from "../context/SubscriptionModalContext";
import { notify } from "../utils/toast";

export const PricingPage: React.FC = () => {
  const { state, refreshUser } = useAppContext();

  const [packages, setPackages] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as "" | "addons") || "";

  const [activeTab, setActiveTab] = useState<"" | "addons">(initialTab);

  const [loadingPackage, setLoadingPackage] = useState(false);
  const [loadingAddon, setLoadingAddon] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [addonConfirmOpen, setAddonConfirmOpen] = useState(false);

  const [downgradeRequestOpen, setDowngradeRequestOpen] = useState(false);
  const [cancelDowngradeOpen, setCancelDowngradeOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [cancelPackageOpen, setCancelPackageOpen] = useState(false);

  const [downgradeLoading, setDowngradeLoading] = useState(false);
  const [downgradeReason, setDowngradeReason] = useState("");

  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [selectedAddon, setSelectedAddon] = useState<any | null>(null);

  const [isDowngradeBlocked, setIsDowngradeBlocked] = useState(false);

  const [isCanceled, setIsCanceled] = useState(false);

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

    if (!currentTier) {
      setSelectedPlan(plan);
      setConfirmOpen(true);
      return;
    }

    const nextAmount = Number(plan.amount ?? 0);
    const currentAmount = Number(currentTier?.amount ?? 0);
    const isUpgrade = nextAmount > currentAmount;

    const currentExpired =
      activePackage?.expiredAt &&
      new Date(activePackage.expiredAt) < new Date();

    if (!isUpgrade && !currentExpired) {
      setSelectedPlan(plan);
      setDowngradeRequestOpen(true);
      return;
    }

    setSelectedPlan(plan);
    setConfirmOpen(true);
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
      setConfirmOpen(false);
      setSelectedPlan(null);
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
      setConfirmOpen(false);
      setSelectedPlan(null);
    }
  };
  const handleRequestDowngrade = async () => {
    if (!selectedPlan) return;
    setDowngradeLoading(true);
    try {
      await API.requestDowngrade(selectedPlan.id);
      setDowngradeRequestOpen(false);
      setDowngradeReason("");
      setSelectedPlan(null);
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
      setCancelDowngradeOpen(false);
      setTimeout(() => refreshUser(), 50);
    } catch (error) {
      console.error("Cancel downgrade failed:", error);
      alert("Failed to cancel downgrade request");
    } finally {
      setDowngradeLoading(false);
      setCancelDowngradeOpen(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      setIsCanceled(true);
      await API.cancelPackage();
      setTimeout(() => refreshUser(), 50);
    } catch (error) {
      console.error("Cancel subscription failed:", error);
      alert("Unable to cancel subscription");
    } finally {
      setIsCanceled(false);
      setCancelPackageOpen(false);
    }
  };

  const reactivateSubscription = async () => {
    try {
      setIsCanceled(true);
      await API.reactivatePackage();
      setTimeout(() => refreshUser(), 50);
    } catch (error) {
      console.error("Reactivation failed:", error);
      alert("Unable to reactivate subscription");
    } finally {
      setIsCanceled(false);
      setReactivateOpen(false);
    }
  };

  const handleBuyAddon = async (selectedAddon: any) => {
    setLoadingAddon(true);
    if (!selectedAddon) return;
    try {
      const res = await API.buyAddons(selectedAddon.id);
      const redirectUrl = res?.data?.data?.checkoutUrl;
      if (redirectUrl) {
        window.location.href = redirectUrl;
        setLoadingAddon(false);
        setSelectedAddon(null);
      }
    } catch (error) {
      notify("error", "Something went wrong while buying add-on");
    } finally {
      setLoadingAddon(false);
      setAddonConfirmOpen(false);
      setSelectedAddon(null);
    }
  };

  const handleClosePopup = () => {
    setConfirmOpen(false);
    setAddonConfirmOpen(false);
    setDowngradeRequestOpen(false);
    setCancelDowngradeOpen(false);
    setReactivateOpen(false);
    setCancelPackageOpen(false);
    setSelectedPlan(null);
    setSelectedAddon(null);
    setIsDowngradeBlocked(false);
    setDowngradeReason("");
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
              Planes
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
                            else if (isPendingDowngradePackage)
                              setCancelDowngradeOpen(true);
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
                          {loadingPackage && selectedPlan?.id === tier.id
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
                        disabled={
                          selectedAddon?.id === addon?.id || loadingAddon
                        }
                        onClick={() => {
                          setSelectedAddon(addon);
                          handleBuyAddon(addon);
                        }}
                        className="rounded-md theme-bg-light  w-fit  px-3 disabled:cursor-not-allowed  font-bold text-base py-1  border-2 border-[#7650e3] text-[#7650e3] hover:bg-[#7650e3] hover:text-white"
                      >
                        {selectedAddon?.id === addon?.id
                          ? "Buying...."
                          : "Buy Now"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      {reactivateOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-50 rounded-md shadow-md w-full max-w-md px-8 py-6 relative h-fit">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-2xl font-bold text-purple-700">
                Reactivate Your Subscription
              </h2>
            </div>

            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to reactivate your subscription? Your{" "}
              <span className="font-semibold mr-1 text-purple-600">
                {currentTier?.name} Plan
              </span>
              will continue.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClosePopup}
                className="flex-1 py-2.5 border border-purple-600 text-purple-600 font-semibold rounded-md hover:bg-purple-50 transition"
              >
                Back
              </button>

              <button
                onClick={reactivateSubscription}
                disabled={isCanceled}
                className="flex-1 py-2.5 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCanceled ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  "Confirm "
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelDowngradeOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-50 rounded-md shadow-md w-full max-w-md px-8 py-6 relative h-fit">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-2xl font-bold text-purple-700">
                Cancel Downgrade Request
              </h2>
            </div>

            <p className="text-gray-500 text-sm mb-4">
              Are you sure you want to cancel your downgrade request? You will{" "}
              continue with your current plan after expiration.
            </p>

            {/* Info Box */}
            <div className="bg-white border text-gray-500 border-purple-600 rounded-md p-4 mb-6">
              <p className="text-sm font-semibold ">
                <span className="">Active Plan:</span>{" "}
                <span className="text-purple-600">{currentTier?.name}</span>
              </p>

              <p className="text-sm font-semibold mt-2 border-b pb-3">
                <span className=""> Monthly Cost:</span>{" "}
                <span className=" text-purple-600 ">
                  ${currentTier?.amount}/month
                </span>{" "}
              </p>

              <p className="text-sm  font-semibold mt-2">
                <span className="">Planned Downgrade:</span>{" "}
                <span className=" text-purple-600 ">
                  {pendingDowngradePackage?.name}
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClosePopup}
                className="flex-1 py-2.5 border border-purple-600 text-purple-600 font-semibold rounded-md hover:bg-purple-50 transition"
              >
                Back
              </button>

              <button
                onClick={handleCancelDowngradeRequest}
                disabled={downgradeLoading}
                className="flex-1 py-2.5 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downgradeLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* done */}
      {downgradeRequestOpen && selectedPlan && (
        <div className="fixed  inset-0 bg-black/30 backdrop-blur-sm flex lg:items-center justify-center p-4 z-50">
          <div className="bg-gray-50 rounded-md shadow-md w-full max-w-md px-8 py-6 max-h-[80vh] h-fit overflow-auto relative">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-2xl font-bold text-purple-700">
                Request Downgrade To
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
                    Month
                  </span>
                </div>
              </div>
              <hr className="h-[1px] bg-gray-100 my-2 " />
              <p className="text-[12px]  font-semibold text-black  mb-3">
                Includes GST of $0.00.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClosePopup}
                className="flex-1 py-2.5 border border-purple-600 text-purple-600 font-semibold rounded-md hover:bg-purple-50 transition"
              >
                Back
              </button>

              <button
                onClick={handleRequestDowngrade}
                disabled={downgradeLoading}
                className="flex-1 py-2.5 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downgradeLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* done */}
      {confirmOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex lg:items-center justify-center p-4 z-50">
          <div className="bg-gray-50 rounded-md shadow-md w-full max-w-md px-8 py-6 h-fit relative">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-2xl font-bold text-purple-700 ">
                Confirm Plan
              </h2>
            </div>

            {/* Price Box */}
            <div className="border border-purple-600 bg-white rounded-md  px-4 text-center ">
              <p className="text-2xl font-bold text-purple-700 mb-1 mt-2">
                {selectedPlan.name || "Standard"}
              </p>

              <div className="flex justify-center items-end gap-4">
                <span className="text-[45px]   text-purple-600 font-bold leading-none">
                  ${selectedPlan.amount + ".00" || "25.00"}
                </span>

                <div className="flex flex-col items-start leading-none  font-semibold">
                  <span className="text-sm font-bold text-purple-700">USD</span>
                  <span className="text-sm font-bold text-purple-700">
                    Month
                  </span>
                </div>
              </div>

              <p className="text-[12px] font-semibold  text-black mt-2 mb-3">
                Includes GST of $0.00.
              </p>
            </div>

            <div className="text-center text-[13px] text-gray-500 font-medium my-6">
              We are committed to secure payments for businesses and service
              providers without any limitations.
            </div>
            <div>
              <button
                className="w-full py-2.5 border border-purple-600  bg-purple-600 text-white text-[15px] font-semibold rounded-md 
                 hover:bg-purple-700 transition shadow-md flex items-center justify-center gap-2"
                onClick={() => {
                  if (activePackage?.package?.tier === "free") {
                    handleSubscribe(selectedPlan);
                  } else {
                    handleUpdatePackage(selectedPlan);
                  }
                }}
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
                onClick={handleClosePopup}
                className="flex-1 py-2.5 w-full mt-2 border border-purple-600 text-purple-600 font-semibold rounded-md hover:bg-purple-50 transition"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
      {/* done */}
      {cancelPackageOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-50 rounded-md shadow-md w-full max-w-md px-8 py-6 relative h-fit ">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-2xl font-bold text-purple-700">
                Cancel Your Subscription
              </h2>

              <button
                onClick={handleClosePopup}
                className="w-6 h-6 flex items-center justify-center border border-purple-700 rounded-full"
              >
                <X className="w-4 h-4 text-purple-700 stroke-[3px]" />
              </button>
            </div>

            {/* Message */}
            <p className="text-purple-700 font-medium mb-4">
              We're sorry to see you go! Are you sure you want to cancel your{" "}
              <span className="font-semibold">{currentTier?.name}</span> plan?
            </p>

            {/* Plan Info Box */}
            <div className="bg-purple-50 border border-purple-200 rounded-md p-4 mb-6">
              <p className="text-sm text-purple-700">
                <span className="font-semibold text-purple-700">Plan:</span>{" "}
                {currentTier?.name}
              </p>
              <p className="text-sm text-purple-700 mt-2">
                <span className="font-semibold text-purple-700">
                  Monthly Cost:
                </span>{" "}
                ${currentTier?.amount}/month
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClosePopup}
                className="flex-1 py-2.5 border border-purple-600 text-purple-600 font-semibold rounded-md hover:bg-purple-50 transition"
              >
                Keep Plan
              </button>

              <button
                onClick={cancelSubscription}
                disabled={isCanceled}
                className="flex-1 py-2.5 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCanceled ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  "Yes, Cancel Plan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
