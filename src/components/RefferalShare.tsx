import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logoText from "../assets/logo-text.svg";

const ReferralRewards: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    // ✅ Best back behavior
    if (window.history.length > 1) navigate(-1);
    else navigate("/dashboard");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
        <div className="relative max-w-4xl mx-auto h-14 px-4 sm:px-6 lg:px-8 flex items-center">
          {/* Left: Back */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#7650e3] hover:text-[#6840c7] transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          {/* Center: Logo (true center) */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link to="/dashboard" aria-label="Go to dashboard">
              <img src={logoText} alt="Logo" className="h-4" />
            </Link>
          </div>

          {/* Right spacer (keeps center perfect) */}
          <div className="ml-auto w-[64px]" />
        </div>
      </header>

      {/* Page Content */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title block */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#7650e3] mb-2">
              Referral Rewards & General Guidelines
            </h1>
          </div>

          {/* Content */}
          <ul className="list-disc pl-6 space-y-3 text-gray-700">
            <li>Share your invite link with friends.</li>
            <li>
              Friend signs up + creates account + generates a post → they get 10
              Omni Coins.
            </li>
            <li>
              Referred user purchases a package → both get 100 Omni Coins.
            </li>
            <li>Coins credited after purchase is completed and verified.</li>
            <li>
              Only new users signing up via your referral link are eligible.
            </li>
            <li>
              No disposable/high-risk emails; verified by third-party reputation
              service.
            </li>
            <li>Only one (1) referral reward per new user.</li>
            <li>Referral coins are non-transferable.</li>
            <li>No spamming; suspicious behavior is monitored.</li>
            <li>Misuse may remove rewards or disable referral link.</li>
            <li>OmniShare can update/pause/discontinue anytime.</li>
            <li>
              For full rules, see{" "}
              <Link to="/terms" className="text-[#7650e3] hover:underline">
                OmniShare Terms
              </Link>
              .
            </li>
          </ul>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium text-sm">
              This Referral Program is effective as of{" "}
              {new Date().toLocaleDateString()} and applies to all users of
              OmniShare.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralRewards;
