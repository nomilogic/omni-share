"use client";

import type React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Check, Loader2, Calendar, X, Gift } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import API from "../services/api";
import { useSearchParams } from "react-router-dom";
import Icon from "../components/Icon";
import { useSubscriptionModal } from "../context/SubscriptionModalContext";

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
        window.open(redirectUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to buy package:", error);
      alert("Something went wrong while processing your purchase.");
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
      console.error("Buy addon failed:", error);
      alert("Something went wrong while buying add-on");
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

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white w-full h-full rounded-md shadow-md px-5 py-10 min-h-[70vh] transition-colors ">
      <div className="flex justify-between items-center mb-10 border-b border-gray-200 ">
        <div className="flex flex-1">
          <button
            onClick={() => handleTabChange("")}
            className={`px-5 py-2.5 font-semibold transition-all border-b-2 rounded-t-lg ${
              activeTab === ""
                ? "border-[#7650e3] text-white bg-[#7650e3]"
                : "border-transparent text-[#7650e3] hover:text-[#7650e3]"
            }`}
          >
            Packages
          </button>
          {activePackage?.package?.tier !== "free" && !hasCancelRequested && (
            <button
              onClick={() => handleTabChange("addons")}
              className={`px-5 py-2.5 font-semibold transition-all border-b-2 rounded-t-lg ${
                activeTab === "addons"
                  ? "border-[#7650e3] text-white bg-[#7650e3]"
                  : "border-transparent text-[#7650e3] hover:text-[#7650e3]"
              }`}
            >
              Credits
            </button>
          )}
        </div>

        {/* {hasCancelRequested && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-md px-5 py-2">
            <Calendar className="w-4 h-4 text-[#7650e3]" />
            <span className="text-sm font-medium text-red-900">
              Your subscription will be canceled on{" "}
              {formatDate(
                activePackage?.expiredAt
                  ? new Date(activePackage.expiredAt)
                  : null
              )}
            </span>
            <button
              onClick={() => setReactivateOpen(true)}
              className="ml-2 text-[#7650e3] hover:text-red-900 font-medium text-sm underline"
            >
              Reactivate
            </button>
          </div>
        )} */}
      </div>

      {activeTab === "" && (
        <>
          <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-5 mx-auto">
            {packages.map((tier: any) => {
              const isCurrentPlan =
                activePackage?.packageId === tier.id && activePackage?.isActive;
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
                  className={`rounded-2xl bg-gray-50 overflow-hidden shadow-lg transition-transform duration-300 ${
                    !isLockedByCancel && !isLockedByDowngrade
                      ? "hover:shadow-2xl hover:-translate-y-2"
                      : ""
                  } ${
                    isLockedByCancel || isLockedByDowngrade
                      ? "opacity-60 cursor-not-allowed"
                      : "opacity-100"
                  } relative`}
                >
                  <div className="bg-gradient-to-br from-[#c7bdef] to-[#c7bdef] px-10 py-10 h-64 text-center relative">
                    {/* Badges */}
                    {(isCurrentPlan ||
                      isPendingDowngradePackage ||
                      isLockedByCancel ||
                      isLockedByDowngrade) && (
                      <div className="absolute top-3 right-3 flex justify-center">
                        <span
                          className={`px-5 py-1.5 rounded-full text-xs font-semibold ${
                            isCurrentPlan
                              ? "bg-[#7650e3] text-white"
                              : isPendingDowngradePackage
                              ? "bg-red-400 text-[#7650e3]"
                              : "bg-gray-500 text-white"
                          }`}
                        >
                          {isCurrentPlan
                            ? "Current Plan"
                            : isPendingDowngradePackage
                            ? "Pending Downgrade"
                            : "Locked"}
                        </span>
                      </div>
                    )}

                    {/* Plan Name */}
                    <h3 className="text-[#7650e3] text-3xl font-semibold mb-3">
                      {tier.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline justify-center gap-1 mb-6">
                      <span className="text-[#7650e3] font-bold text-xl">
                        $
                      </span>
                      <span className="text-[40px] font-bold text-[#7650e3]">
                        {tier.amount}
                      </span>
                      <span className="text-3xl font-medium text-[#7650e3]">
                        / {isFree ? "Forever" : "Month"}
                      </span>
                    </div>

                    {/* CTA Button */}
                    {!isFree && (
                      <button
                        onClick={() => {
                          if (hasCancelRequested && isCurrentPlan)
                            setReactivateOpen(true);
                          else if (isPendingDowngradePackage)
                            setCancelDowngradeOpen(true);
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
                          ? "Reactivate"
                          : isCurrentPlan && !hasPendingDowngrade
                          ? "Manage"
                          : isCurrentPlan
                          ? "Active"
                          : isPendingDowngradePackage
                          ? "Cancel Downgrade"
                          : isLowerPlan
                          ? "Switch Plan"
                          : "Switch Plan"}
                      </button>
                    )}
                  </div>

                  <div className=" px-8 py-8">
                    <div className="mb-6 pb-6 border-b-2 border-purple-600  h-28 text-center">
                      <p className="text-xl font-bold text-[#7650e3] mb-2 ">
                        Ideal for:
                      </p>
                      <p className="text-lg text-slate-800 font-medium">
                        {tier.title ??
                          "Small agency, growing business, content team"}
                      </p>
                    </div>

                    <ul className="space-y-4">
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
          {addons.length === 0 ? (
            <p className="col-span-3 text-center text-[#7650e3]">
              No credits available
            </p>
          ) : (
            addons.map((addon) => {
              const hasSale = addon.isSale;
              const bonusAmount = addon.bonus || 0;
              const totalCoins = addon.coins + bonusAmount;

              return (
                <div
                  key={addon.id}
                  className="rounded-md border-3 border-gray-200 shadow-xl transform transition-all relative w-full pt-3"
                >
                  <div className="text-left font-medium text-3xl px-5 py-2  pb-[4rem]">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-[25px] font-semibold text-slate-900">
                        {addon.coins.toLocaleString()}
                      </div>
                      {addon.isSale && (
                        <span className="bg-[#7650e3] text-white px-2 py-0.5 rounded text-sm font-semibold">
                          Flash Sale
                        </span>
                      )}
                    </div>
                    <div className="text-[1.05rem] text-slate-800 -mt-[10px]  w-full">
                      {hasSale ? (
                        <>
                          Total: {addon.coins.toLocaleString()} +{" "}
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
                      className="absolute -z-10 top-5 right-5"
                      size={120}
                    />
                  </div>

                  <div className="flex justify-between theme-bg-quaternary items-center px-5  py-2 rounded-b-xl">
                    <p className="text-center text-2xl font-bold text-[#7650e3] ">
                      ${addon.amount.toLocaleString()}
                    </p>
                    <button
                      disabled={selectedAddon?.id === addon?.id || loadingAddon}
                      onClick={() => {
                        setSelectedAddon(addon);
                        handleBuyAddon(addon);
                      }}
                      className="rounded-md theme-bg-light  w-fit  px-3 disabled:cursor-not-allowed  font-bold text-base py-1  border-2 border-[#7650e3] text-[#7650e3] hover:bg-[#7650e3] hover:text-white"
                    >
                      {selectedAddon?.id === addon?.id
                        ? "Purchasing..."
                        : "Purchase"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {reactivateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#7650e3]">
                Reactivate Your Subscription
              </h2>
              <button
                onClick={handleClosePopup}
                className="p-1 hover:bg-gray-100 mt-1  rounded-full border border-purple-600 transition-colors"
              >
                <X className="w-4 h-4 text-[#7650e3]" />
              </button>
            </div>

            {/* Description */}
            <p className="text-[#7650e3] mb-4">
              Are you sure you want to reactivate your subscription? Your{" "}
              <span className="font-semibold">{currentTier?.name}</span> plan
              will continue to be billed.
            </p>

            {/* Plan Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <p className="text-sm text-[#7650e3]">
                <span className="font-semibold">Plan:</span>{" "}
                <span className="font-semibold">{currentTier?.name}</span>
              </p>
              <p className="text-sm text-[#7650e3] mt-2">
                <span className="font-semibold">Monthly Cost:</span>{" "}
                <span className="font-semibold">
                  ${currentTier?.amount}/month
                </span>
              </p>
            </div>

            {/* What happens */}
            <div className="bg-gray-50 rounded-md p-4 mb-6">
              <p className="text-xs text-[#7650e3] leading-relaxed">
                <span className="font-semibold block mb-2">What happens:</span>•
                Your {currentTier?.name} plan will continue to be active
                <br />• Billing will resume at ${currentTier?.amount}/month
                <br />• You will have full access to all plan features
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={handleClosePopup}
                className="px-6 py-3 border border-gray-300 rounded-md font-semibold text-[#7650e3] hover:bg-gray-50 transition-colors"
              >
                Keep Canceled
              </button>
              <button
                onClick={reactivateSubscription}
                disabled={isCanceled}
                className="px-6 py-3 bg-[#7650e3] text-white rounded-md font-semibold hover:bg-[#5a3dc9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCanceled ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reactivating...
                  </>
                ) : (
                  "Yes, Reactivate"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelDowngradeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#7650e3]">
                Cancel Downgrade Request
              </h2>
              <button
                onClick={handleClosePopup}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-[#7650e3]" />
              </button>
            </div>

            <p className="text-[#7650e3] mb-4">
              Are you sure you want to cancel your downgrade request? You will{" "}
              <span className="font-semibold">
                continue with your current plan
              </span>{" "}
              after expiration.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <p className="text-sm text-[#7650e3]">
                <span className="font-semibold text-[#7650e3]">
                  Current Plan:
                </span>{" "}
                <span className="text-[#7650e3] font-semibold">
                  {currentTier?.name}
                </span>
              </p>
              <p className="text-sm text-[#7650e3] mt-2">
                <span className="font-semibold text-[#7650e3]">
                  Planned Downgrade:
                </span>{" "}
                <span className="text-purple-600 font-semibold">
                  {pendingDowngradePackage?.name}
                </span>
              </p>
              <p className="text-sm text-[#7650e3] mt-2">
                <span className="font-semibold text-[#7650e3]">
                  Current Monthly Cost:
                </span>{" "}
                <span className="text-[#7650e3] font-semibold">
                  ${currentTier?.amount}/month
                </span>
              </p>
            </div>

            <div className="bg-gray-50 rounded-md p-4 mb-6">
              <p className="text-xs text-[#7650e3] leading-relaxed">
                <span className="font-semibold block mb-2">What happens:</span>•
                Your current {currentTier?.name} plan will continue after{" "}
                {formatDate(
                  activePackage?.expiredAt
                    ? new Date(activePackage.expiredAt)
                    : null
                )}
                <br />• Billing will continue at ${currentTier?.amount}/month
                <br />• You can request downgrade again anytime
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleClosePopup}
                className="px-6 py-3 border border-gray-300 rounded-md font-semibold text-[#7650e3] hover:bg-gray-50 transition-colors"
              >
                Keep Downgrade
              </button>
              <button
                onClick={handleCancelDowngradeRequest}
                disabled={downgradeLoading}
                className="px-6 py-3 bg-purple-600 text-white rounded-md font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {downgradeLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  "Yes, Cancel Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {downgradeRequestOpen && selectedPlan && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center p-4 z-50 w-full h-full">
          <div className="bg-gray-50 p-6 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-2xl text-purple-600 font-semibold">
                Request Downgrade
              </h2>
              <button
                onClick={handleClosePopup}
                className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 mt-1 rounded-full border border-purple-600"
                aria-label="Close"
              >
                <X className="text-purple-600 w-4 h-4" />
              </button>
            </div>

            {/* Plan Info */}
            <div className="bg-white border border-purple-600 p-4 rounded-lg text-center mb-6">
              <p className="text-base text-purple-600 font-semibold mb-1">
                {selectedPlan.name}
              </p>
              <div className="flex justify-center items-end space-x-4">
                <span className="text-5xl text-purple-600">
                  ${selectedPlan.amount || "0.00"}
                </span>
                <div className="flex flex-col items-start justify-between h-10">
                  <span className="text-sm text-purple-600 font-normal">
                    USD
                  </span>
                  <span className="text-sm text-purple-600 font-normal">
                    Month
                  </span>
                </div>
              </div>
              <p className="text-xs mt-2">Includes GST of $0.00.</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 text-purple-700 text-sm rounded-md p-3 mb-6">
              <p className="font-semibold mb-1">Note:</p>
              <p>
                Downgrade will be scheduled at plan expiry. You can cancel it
                anytime before it is applied.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClosePopup}
                className="flex-1 py-2 border border-purple-300 text-purple-600 font-semibold rounded-md hover:bg-purple-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleRequestDowngrade}
                disabled={downgradeLoading}
                className="flex-1 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downgradeLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  "Confirm Downgrade"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && selectedPlan && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-75 flex items-center justify-center p-4 z-50 w-full h-full">
          <div className="bg-gray-50 p-6 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl text-purple-600 font-semibold">
                Confirm Plan
              </h2>
              <button
                onClick={handleClosePopup}
                className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 mb-0 mt-1 rounded-full border border-purple-600 "
                aria-label="Close"
              >
                <X className="text-purple-600 w-4 h-4" />
              </button>
            </div>

            <div className="bg-white border border-purple-600 p-4 rounded-lg text-center mb-6">
              <p className="text-base text-purple-600 font-semibold mb-1">
                {selectedPlan.name || "Standard"}
              </p>
              <div className="flex justify-center items-end space-x-4">
                <span className="text-5xl text-purple-600">
                  ${selectedPlan.amount || "25.00"}
                </span>
                <div className="flex flex-col items-start justify-between h-10">
                  <span className="text-sm text-purple-600 font-normal">
                    USD
                  </span>
                  <span className="text-sm text-purple-600 font-normal">
                    Month
                  </span>
                </div>
              </div>
              <p className="text-xs mt-2">Includes GST of $0.00.</p>
            </div>

            {selectedPlan.features?.length > 0 && (
              <ul className="mb-5 text-sm space-y-2">
                {selectedPlan.features.map((feature: any, index: any) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-[2px]" />
                    <span className="text-purple-600">{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            {activePackage?.package?.tier !== "free" ? (
              <div className="mb-6 text-sm rounded-md text-purple-600 p-3">
                <p>
                  You’re <strong>upgrading</strong> your current plan — you’ll
                  also receive your previous package coins with this upgrade.
                </p>
              </div>
            ) : (
              <div className="mb-6 bg-blue-50 border border-blue-200 text-purple-600 text-sm rounded-md p-3">
                <p>
                  You’re starting a <strong>new subscription</strong>. This plan
                  begins fresh with the listed features and coins.
                </p>
              </div>
            )}

            <button
              className="w-full py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-600/90 transition-colors shadow-md shadow-purple-600/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </div>
      )}

      {cancelPackageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#7650e3]">
                Cancel Your Subscription
              </h2>
              <button
                onClick={handleClosePopup}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-6 h-6 text-[#7650e3]" />
              </button>
            </div>

            <p className="text-[#7650e3] mb-4">
              We're sorry to see you go! Are you sure you want to cancel your{" "}
              <span className="font-semibold">{currentTier?.name}</span> plan?
            </p>

            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-sm text-[#7650e3]">
                <span className="font-semibold text-[#7650e3]">Plan:</span>{" "}
                <span className="text-[#7650e3] font-semibold">
                  {currentTier?.name}
                </span>
              </p>
              <p className="text-sm text-[#7650e3] mt-2">
                <span className="font-semibold text-[#7650e3]">
                  Monthly Cost:
                </span>{" "}
                <span className="text-[#7650e3] font-semibold">
                  ${currentTier?.amount}/month
                </span>
              </p>
            </div>

            <div className="bg-gray-50 rounded-md p-4 mb-6">
              <p className="text-xs text-[#7650e3] leading-relaxed">
                <span className="font-semibold block mb-2">What happens:</span>•
                Your {currentTier?.name} plan will be canceled
                <br />• You will lose access to premium features
                <br />• Your subscription will end at the next billing cycle
                <br />• You can reactivate anytime
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleClosePopup}
                className="px-6 py-3 border border-gray-300 rounded-md font-semibold text-[#7650e3] hover:bg-gray-50 transition-colors"
              >
                Keep Plan
              </button>
              <button
                onClick={cancelSubscription}
                disabled={isCanceled}
                className="px-6 py-3 bg-purple-600 text-white rounded-md font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
