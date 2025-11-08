import React, { useState } from "react";
import { X, Star, Zap, Crown, Check } from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface PricingTier {
  id: "free" | "ipro" | "business";
  name: string;
  price: string;
  description: string;
  features: string[];
  icon: React.ComponentType<any>;
  popular?: boolean;
  buttonText: string;
  buttonClass: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "aiFree",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "Basic content creation",
      "Limited AI generations (5/month)",
      "Manual posting only",
      "1 social platform",
      "Basic templates",
    ],
    icon: Star,
    buttonText: "Get Started Free",
    buttonClass: "bg-gray-600 hover:bg-gray-700 text-white",
  },
  {
    id: "ipro",
    name: "aiPRO",
    price: "$39.99",
    description: "Most popular for creators",
    features: [
      "1000 textual posts per month",
      "20 AI image generations",
      "ChatGPT-4 & Gemini Pro access",
      "Auto post scheduling",
      "Multi-platform support",
      "Advanced analytics",
      "Priority support",
    ],
    icon: Zap,
    popular: true,
    buttonText: "Start Pro Trial",
    buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  {
    id: "business",
    name: "aiBusiness",
    price: "$99.99",
    description: "For teams and businesses",
    features: [
      "Unlimited content creation",
      "Unlimited AI generations",
      "All AI models access",
      "Advanced scheduling",
      "Team collaboration",
      "White-label options",
      "Custom integrations",
      "Dedicated support",
    ],
    icon: Crown,
    buttonText: "Start Business Trial",
    buttonClass: "bg-purple-600 hover:bg-purple-700 text-white",
  },
];

interface TierSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: "free" | "ipro" | "business") => void;
  loading?: boolean;
}

export const TierSelectionModal: React.FC<TierSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  loading = false,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<
    "free" | "ipro" | "business" | null
  >(null);

  if (!isOpen) return null;

  const handleSelectPlan = (planId: "free" | "ipro" | "business") => {
    setSelectedPlan(planId);
    onSelectPlan(planId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Choose Your Plan
            </h2>
            <p className="text-gray-600 mt-1">
              Select the plan that best fits your needs
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Pricing Tiers */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.id}
                  className={`relative bg-gray-50 rounded-md p-6 transition-all duration-300 hover:shadow-lg ${
                    tier.popular
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <Icon
                      className={`w-10 h-10 mx-auto mb-3 ${
                        tier.popular ? "text-blue-600" : "text-gray-600"
                      }`}
                    />
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {tier.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {tier.description}
                    </p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold text-gray-900">
                        {tier.price}
                      </span>
                      {tier.price !== "$0" && (
                        <span className="text-gray-600 ml-1 text-sm">
                          /month
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(tier.id)}
                    disabled={loading && selectedPlan === tier.id}
                    className={`w-full py-2.5 px-4 rounded-md font-medium transition-colors duration-200 text-sm ${
                      tier.buttonClass
                    } ${
                      loading && selectedPlan === tier.id
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {loading && selectedPlan === tier.id
                      ? "Setting up..."
                      : tier.buttonText}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              All plans include a 14-day free trial. No credit card required for
              Free plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
