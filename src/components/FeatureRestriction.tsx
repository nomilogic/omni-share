import React, { useState } from "react";
import { Lock, Zap, Crown, X } from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface FeatureRestrictionProps {
  feature: string;
  requiredPlan: "free" | "ipro" | "business";
  children: React.ReactNode;
  onUpgrade?: () => void;
}

export const FeatureRestriction: React.FC<FeatureRestrictionProps> = ({
  feature,
  requiredPlan,
  children,
  onUpgrade,
}) => {
  const { state } = useAppContext();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isBusinessAccount =
    state.selectedProfile?.type === "business" || state.userPlan === "business";

  const currentPlan = isBusinessAccount ? "business" : state.userPlan || "free";

  const hasAccess = () => {
    // Business accounts always have access to all features
    if (isBusinessAccount) return true;

    if (requiredPlan === "ipro") {
      return currentPlan === "ipro" || currentPlan === "business";
    }
    return currentPlan === "business";
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case "free":
        return "aiFree";
      case "ipro":
        return "aiPRO";
      case "business":
        return "aiBusiness";
      default:
        return plan;
    }
  };

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case "ipro":
        return "$39.99/month";
      case "business":
        return "$99.99/month";
      default:
        return "Free";
    }
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="relative h-full-dec-hf ">
        <div className="opacity-50 pointer-events-none">{children}</div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-md flex items-center justify-center backdrop-blur-sm ">
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="bg-white shadow-lg rounded-md px-6 py-3 flex items-center space-x-3 hover:shadow-xl transition-all duration-200"
          >
            <Lock className="w-5 h-5 text-gray-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Upgrade Required</p>
              <p className="text-sm text-gray-600">
                {feature} requires {getPlanName(requiredPlan)}
              </p>
            </div>
            {requiredPlan === "ipro" ? (
              <Zap className="w-5 h-5 text-blue-600" />
            ) : (
              <Crown className="w-5 h-5 text-purple-600" />
            )}
          </button>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Upgrade Required
              </h3>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                {requiredPlan === "ipro" ? (
                  <Zap className="w-8 h-8 text-white" />
                ) : (
                  <Crown className="w-8 h-8 text-white" />
                )}
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {feature} is available with {getPlanName(requiredPlan)}
              </h4>
              <p className="text-gray-600">
                You're currently on {getPlanName(currentPlan)}. Upgrade to
                unlock this feature.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Current Plan:</span>
                <span className="font-medium">{getPlanName(currentPlan)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Required Plan:</span>
                <span className="font-medium">{getPlanName(requiredPlan)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Price:</span>
                <span className="font-medium">
                  {getPlanPrice(requiredPlan)}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  if (onUpgrade) {
                    onUpgrade();
                  } else {
                    // Default upgrade action - redirect to pricing
                    window.location.href = "/pricing";
                  }
                }}
                className={`flex-1 px-4 py-2 rounded-md text-white transition-colors duration-200 ${
                  requiredPlan === "ipro"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
