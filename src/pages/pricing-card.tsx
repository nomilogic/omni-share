"use client";

interface PricingCardProps {
  name: string;
  price: number;
  period: string;
  buttonLabel: string;
  features: string[];
  idealFor: string;
  isCurrentPlan?: boolean;
  isPending?: boolean;
  isLocked?: boolean;
  isLoading?: boolean;
  onButtonClick: () => void;
}

export function PricingCard({
  name,
  price,
  period,
  buttonLabel,
  features,
  idealFor,
  isCurrentPlan,
  isPending,
  isLocked,
  isLoading,
  onButtonClick,
}: PricingCardProps) {
  const isFree = price === 0;

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-lg transition-transform duration-300  ${
        !isLocked ? "hover:shadow-2xl hover:-translate-y-2" : ""
      } ${isLocked ? "opacity-60" : "opacity-100"}`}
    >
      <div className="bg-gradient-to-br from-[#c7bdef] to-[#c7bdef] px-10 py-10 h-64 text-center relative">
        {(isCurrentPlan || isPending) && (
          <div className="absolute top-3  right-3 flex justify-center">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                isCurrentPlan
                  ? "bg-[#542ed2] text-white"
                  : "bg-orange-400 text-gray-900"
              }`}
            >
              {isCurrentPlan ? "Current Plan" : "Pending Downgrade"}
            </span>
          </div>
        )}

        <h3 className={`text-[#542ed2] text-3xl font-semibold mb-3`}>{name}</h3>

        {/* Pricing */}
        <div className="flex items-baseline justify-center gap-1 mb-6   ">
          <span className="text-[#542ed2] font-bold text-xl">$ </span>
          <span
            className={`text-[40px] font-bold ${
              isFree ? "text-[#542ed2]" : "text-[#542ed2]"
            }`}
          >
            {price}
          </span>
          <span
            className={`text-3xl font-medium ${
              isFree ? "text-[#542ed2]" : "text-[#542ed2]"
            }`}
          >
            /{isFree ? " Forever" : " Month"}
          </span>
        </div>

        {/* CTA Button */}
        {!isFree && (
          <button
            onClick={onButtonClick}
            disabled={isLocked || isLoading}
            className={`w-full py-3 px-6 rounded-md font-semibold transition-all text-base ${
              isFree
                ? "bg-[#542ed2] text-white hover:bg-[#542ed2] disabled:opacity-50"
                : "bg-[#542ed2] text-white hover:bg-[#542ed2] disabled:opacity-50"
            } ${
              isLocked || isLoading
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              buttonLabel
            )}
          </button>
        )}
      </div>

      <div className="bg-gray-50 px-8 py-8">
        <div className="mb-6 pb-6 border-b-2 border-purple-600 text-center">
          <p className="text-xl font-bold text-[#542ed2] mb-2">Ideal for:</p>
          <p className="text-lg text-gray-800 font-medium">
            {idealFor ?? "Small agency, growing business, content team"}
          </p>
        </div>

        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-800">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
