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
  const { user } = useAppContext();
  const navigate = useNavigate();

  // Get user plan and tier info
  const userPlan = user?.wallet?.package?.tier || "free";
  const planRenewalDate = user?.wallet?.package?.renewalDate || "No Expire";
  const coinBalance = Math.floor(user?.wallet?.balance || 0);
  const coinLimit = user?.wallet?.package?.coinLimit || 0;
  const referralCoin = user?.wallet?.referralCoin || 0;

  return (
    <div className="min-h-screen ">
      <main className="max-w-8xl mx-auto  flex flex-col gap-y-8 ">
        <div className="bg-slate-100  px-5 py-4 rounded-2xl flex flex-col gap-4">
          <ProfileCard />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              stats={referralCoin}
              subtitle="Earn 100 Omni Coins each per referral!"
              buttonText="Refer & Earn!"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RecentPosts />
          <Analytics />
          <NewsUpdates />
        </div>
        <div>
          <ReferralSection />
        </div>
      </main>
    </div>
  );
};
