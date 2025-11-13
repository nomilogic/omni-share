import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import ProfileCard from "../components/dashboard/ProfileCard";
import StatsCard from "../components/dashboard/StatsCard";
import RecentPosts from "../components/dashboard/RecentPosts";
import Analytics from "../components/dashboard/Analytics";
import NewsUpdates from "../components/dashboard/NewsUpdates";
import ReferralSection from "../components/dashboard/ReferralSection";

export const DashboardPage: React.FC = () => {
  const { state } = useAppContext();
  const navigate = useNavigate();

  // Get user plan and tier info
  const userPlan = state?.user?.wallet?.package?.tier || state?.userPlan || 'free';
  const planRenewalDate = state?.user?.wallet?.package?.renewalDate || '30 Nov 2025';
  const coinBalance = Math.floor(state?.user?.wallet?.balance || state?.balance || 0);
  const coinLimit = state?.user?.wallet?.package?.coinLimit || 25000;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-8 py-8">
        <ProfileCard />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <StatsCard
            iconName="crown"
            title="My Plan"
            badge={userPlan.toUpperCase()}
            subtitle={`Renewing on: ${planRenewalDate}`}
            buttonText="Switch Plan"
            onButtonClick={() => navigate("/pricing")}
            showicon2={true}
          />

          <StatsCard
            iconName="spiral-logo"
            title="Omni Coins"
            stats={`${coinBalance.toLocaleString()}/${coinLimit.toLocaleString()}`}
            subtitle="You can add coins to your package anytime."
            buttonText="Add Coins"
            onButtonClick={() => navigate("/pricing")}
          />

          <StatsCard
            iconName="share"
            title="Referral Coins"
            stats="0/100"
            subtitle="Earn 100 Omni Coins each per referral!"
            buttonText="Refer & Earn!"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <RecentPosts />
          <Analytics />
          <NewsUpdates />
        </div>

        <ReferralSection />
      </main>
    </div>
  );
};
