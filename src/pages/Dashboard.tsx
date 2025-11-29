import { Crown, Coins, Share2 } from "lucide-react";
import ProfileCard from "../components/dashboard/ProfileCard";
import StatsCard from "../components/dashboard/StatsCard";
import RecentPosts from "../components/dashboard/RecentPosts";
import Analytics from "../components/dashboard/Analytics";
import NewsUpdates from "../components/dashboard/NewsUpdates";
import ReferralSection from "../components/dashboard/ReferralSection";
import { useAppContext } from "../context/AppContext";
import { useTranslation } from "react-i18next";

function Dashboard() {
  const { state } = useAppContext();
  const { t, i18n } = useTranslation();
  const changeLanguage = (lang: any) => i18n.changeLanguage(lang);

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-white border-b border-stone-200 py-6 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-wide">
            OMNI<span className="font-normal">SHARE</span>
          </h1>
          <div className="flex items-center gap-2 bg-stone-100 px-4 py-2.5 rounded-md">
            <Crown className="w-5 h-5 text-indigo-600" />
            <span className="text-gray-700 font-semibold text-sm">
              {Math.floor(state?.balance || 0)}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <ProfileCard />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatsCard
            icon={<Crown className="w-6 h-6" />}
            title={t("my_plan")}
            badge={state?.userPlan?.toUpperCase() || "FREE"}
            subtitle="Renewing on: 30 Nov 2025"
            buttonText={t("upgrade")}
          />

          <StatsCard
            icon={<Coins className="w-6 h-6" />}
            title="Omni Coins"
            stats={`${Math.floor(state?.balance || 0)}/25000`}
            subtitle={t("add_coins_message")}
            buttonText={t("add_coins")}
          />

          <StatsCard
            icon={<Share2 className="w-6 h-6" />}
            title={t("referral_coins")}
            stats="0/100"
            subtitle={t("referral_earn_message")}
            buttonText={t("refer_earn")}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <RecentPosts />
          <Analytics />
          <NewsUpdates />
        </div>

        <ReferralSection />
      </main>
    </div>
  );
}

export default Dashboard;
