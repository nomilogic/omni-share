"use client";

import type React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Check, AlertTriangle, Gift, Loader2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import API from "../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";

export const PricingPage: React.FC = () => {
  const { state } = useAppContext();

  const [packages, setPackages] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as "" | "addons") || "";

  const [activeTab, setActiveTab] = useState<"" | "addons">(initialTab);

  const [loadingPackage, setLoadingPackage] = useState(false);
  const [loadingAddon, setLoadingAddon] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [addonConfirmOpen, setAddonConfirmOpen] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [selectedAddon, setSelectedAddon] = useState<any | null>(null);

  const [isDowngradeBlocked, setIsDowngradeBlocked] = useState(false);

  const activePackage = state?.user?.wallet;

  const handleTabChange = (tab: "" | "addons") => {
    setActiveTab(tab);
    setSearchParams({ tab }); // updates URL query
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const packagesRes = await API.listPackages();
        setPackages(packagesRes.data.data);

        const addonsRes = await API.listAddons();
        setAddons(addonsRes.data.data);
      } catch (error) {
        console.error(error);
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

  const handleChoosePlan = (plan: any) => {
    if (loadingPackage) return;

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
      setIsDowngradeBlocked(true);
      return;
    }

    setSelectedPlan(plan);
    setConfirmOpen(true);
  };

  const handleSelectPlan = async (plan: any) => {
    setLoadingPackage(true);
    try {
      const res = await API.buyPackage(plan.id);
      const redirectUrl = res?.data?.data?.url;
      if (redirectUrl) window.location.href = redirectUrl;
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPackage(false);
      setConfirmOpen(false);
      setSelectedPlan(null);
    }
  };

  const handleBuyAddon = async () => {
    if (!selectedAddon) return;
    setLoadingAddon(true);
    try {
      const res = await API.buyAddons(selectedAddon.id);
      const redirectUrl = res?.data?.data?.checkoutUrl;
      if (redirectUrl) window.location.href = redirectUrl;
    } catch (error) {
      console.error(error);
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
    setSelectedPlan(null);
    setSelectedAddon(null);
    setIsDowngradeBlocked(false);
  };

  return (
    <div className="bg-white w-full h-full rounded-xl shadow-md px-8 py-10 min-h-[70vh] transition-colors">
      <div className="flex justify-center mb-10 border-b border-gray-200">
        <button
          onClick={() => handleTabChange("")}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === ""
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
        >
          Packages
        </button>
        <button
          onClick={() => handleTabChange("addons")}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === "addons"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
        >
          Add-ons
        </button>
      </div>

      {activeTab === "" && (
        <>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold theme-text-primary mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg theme-text-secondary max-w-2xl mx-auto">
              Select the perfect plan to supercharge your social media content
              creation with AI
            </p>
          </div>

          <div className="grid xl:grid-cols-3 lg:grid-cols-2  gap-8 mx-auto">
            {packages.map((tier: any) => {
              const isCurrentPlan =
                activePackage?.packageId === tier.id && activePackage?.isActive;

              const nextAmount = Number(tier.amount ?? 0);
              const currentAmount = Number(currentTier?.amount ?? 0);
              const isLowerPlan = nextAmount < currentAmount;
              const currentExpired =
                activePackage?.expiredAt &&
                new Date(activePackage.expiredAt) < new Date();
              const disableDowngrade = isLowerPlan && !currentExpired;

              return (
                <div
                  key={tier.id}
                  className={`bg-gradient-to-br from-[#7650e3] to-[#6366F1] rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-all relative ${
                    isCurrentPlan ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  {isCurrentPlan && (
                    <div className="absolute flex justify-center top-[-10px] left-0 right-0">
                      <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold ">
                        Current Plan
                      </span>
                    </div>
                  )}
                  <h3 className="text-3xl font-bold mb-2 text-center text-yellow-400">
                    {tier.name}
                  </h3>
                  <p className="text-center text-2xl font-bold mb-5 text-white">
                    ${tier.amount}/month
                  </p>
                  <button
                    onClick={() => handleChoosePlan(tier)}
                    disabled={
                      loadingPackage || isCurrentPlan || disableDowngrade
                    }
                    className={`w-full bg-white text-[#7650e3] py-3 my-3 rounded-full transition-all font-semibold ${
                      isCurrentPlan || disableDowngrade
                        ? " bg-white text-[#7650e3] opacity-50 cursor-not-allowed"
                        : " bg-[white] text-[#7650e3]"
                    }`}
                  >
                    {loadingPackage && selectedPlan?.id === tier.id ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      "Active"
                    ) : disableDowngrade ? (
                      "Locked"
                    ) : (
                      "Upgrade"
                    )}
                  </button>
                  <ul className="space-y-3 mb-6 min-h-56">
                    {tier.features?.map((f: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <Check className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                        <span className="text-white">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === "addons" && (
        <div className="grid md:grid-cols-2 gap-8">
          {addons.length === 0 ? (
            <p className="col-span-3 text-center text-gray-500">
              No add-ons available
            </p>
          ) : (
            addons.map((addon) => (
              <div
                key={addon.id}
                className="bg-gradient-to-br from-[#7650e3] to-[#6366F1] rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-all relative"
              >
                <div className="flex justify-center mb-4">
                  <Gift className="w-10 h-10 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-semibold text-center mb-2 text-white">
                  {addon.title}
                </h3>
                <p className="text-center mb-3 text-yellow-400 font-bold text-3xl">
                  {addon.coins} Coins
                </p>
                <p className="text-center text-2xl font-bold mb-6 text-white">
                  ${addon.amount}
                </p>
                <button
                  onClick={() => {
                    setSelectedAddon(addon);
                    setAddonConfirmOpen(true);
                  }}
                  className="w-full py-3 rounded-lg theme-button-trinary font-semibold hover:brightness-110 transition-all"
                >
                  Buy Add-on
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {isDowngradeBlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="theme-bg-quaternary border theme-border rounded-2xl shadow-2xl w-full max-w-md p-8">
            <AlertTriangle className="w-10 h-10 text-yellow-500 mb-4 mx-auto" />
            <h2 className="text-2xl font-semibold theme-text-primary mb-3 text-center">
              Downgrade Unavailable
            </h2>
            <p className="theme-text-secondary text-center mb-6">
              You can only downgrade after your current plan expires.
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleClosePopup}
                className="px-5 py-2 rounded-lg theme-button-primary"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Upgrade Popup */}
      {confirmOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="theme-bg-quaternary border theme-border rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-semibold theme-text-primary mb-3 text-center">
              Confirm Upgrade
            </h2>
            <p className="theme-text-secondary text-center mb-6">
              You are about to upgrade to <strong>{selectedPlan.name}</strong>{" "}
              for <strong>${selectedPlan.amount}</strong> per month.
            </p>

            <div className="theme-bg-light p-4 rounded-lg text-sm theme-text-secondary mb-6">
              <p className="mb-2 font-semibold theme-text-primary">
                Important Information:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Upgrades take effect immediately after payment.</li>
                <li>Remaining time from your current plan will be adjusted.</li>
                <li>
                  Billing renews automatically every month unless canceled.
                </li>
                <li>
                  By proceeding, you agree to our Terms of Service and Billing
                  Policy.
                </li>
              </ul>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleClosePopup}
                className="px-4 py-2 rounded-lg bg-gray-200 theme-text-primary hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSelectPlan(selectedPlan)}
                disabled={loadingPackage}
                className="px-5 py-2 rounded-lg theme-button-primary hover:brightness-110 flex items-center gap-2"
              >
                {loadingPackage ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Confirm Upgrade"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add-on Purchase Popup */}
      {addonConfirmOpen && selectedAddon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="theme-bg-quaternary border theme-border rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-semibold theme-text-primary mb-3 text-center">
              Confirm Add-on
            </h2>
            <p className="theme-text-secondary text-center mb-6">
              You are about to buy <strong>{selectedAddon.title}</strong> for{" "}
              <strong>${selectedAddon.amount}</strong>.
            </p>

            <div className="theme-bg-light p-4 rounded-lg text-sm theme-text-secondary mb-6">
              <p className="mb-2 font-semibold theme-text-primary">
                Important Information:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Purchase takes effect immediately after payment.</li>
                <li>Coins/benefits will be added instantly to your account.</li>
                <li>
                  By proceeding, you agree to our Terms of Service and Billing
                  Policy.
                </li>
              </ul>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleClosePopup}
                className="px-4 py-2 rounded-lg bg-gray-200 theme-text-primary hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleBuyAddon}
                disabled={loadingAddon}
                className="px-5 py-2 rounded-lg theme-button-primary hover:brightness-110 flex items-center gap-2"
              >
                {loadingAddon ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Confirm Purchase"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
