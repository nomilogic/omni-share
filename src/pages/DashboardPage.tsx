import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import ProfileCard from "../components/dashboard/ProfileCard";
import StatsCard from "../components/dashboard/StatsCard";
import RecentPosts from "../components/dashboard/RecentPosts";
import Analytics from "../components/dashboard/Analytics";
import NewsUpdates from "../components/dashboard/NewsUpdates";
import ReferralSection from "../components/dashboard/ReferralSection";
import ProfileSetupSinglePage from "@/components/ProfileSetupSinglePage";
import UpdatePasswordForm from "@/components/UpdatePasswordForm";
import { useTranslation } from "react-i18next";
import API from "@/services/api";
import { useModal } from "../context2/ModalContext";
import { TwoFASetupModal } from "@/components/TwoFASetupModal";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, user } = useAppContext();
  const profileParam = searchParams.get("profile") === "true";
  const isEditing = profileParam || state?.isProfileEditing || false;
  const isPasswordEditing = state?.isPasswordEditing || false;
  const { t } = useTranslation();

  const { openModal } = useModal();
  const handleReferralClick = () => {
    openModal(ReferralSection, {});
  };

  // Get user plan and tier info
  const userPlan = user?.wallet?.package?.tier || "free";
  const planRenewalDate = user?.wallet?.expiresAt
    ? new Date(user.wallet.expiresAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No Expire";
  const coinBalance = Math.floor(user?.wallet?.coins || 0);
  const coinLimit = user?.wallet?.package?.coinLimit || 0;
  const referralCoin = user?.wallet?.referralCoin || 0;

  const [post, setPosts] = useState([]);
  const fetchPostHistory = async () => {
    try {
      const response = await API.getHistory();
      const data = response?.data?.data || [];
      setPosts(data);
    } catch (err: any) {
      console.error("Failed to fetch posts:", err);
    } finally {
    }
  };

  useEffect(() => {
    fetchPostHistory();
  }, []);
  const [isTwoFactor, setTwoFactor] = useState(false);
  return (
    <>
      {user && !user?.twoFactorEnabled && (
        <TwoFASetupModal
          open={isTwoFactor}
          onClose={() => setTwoFactor(false)}
          onSuccess={() => setTwoFactor(false)}
        />
      )}
      {!isEditing && !isPasswordEditing && (
        <div className="min-h-screen my-10">
          <main className="max-w-8xl mx-auto  flex flex-col gap-y-8 ">
            <div className="bg-gray-100  lg:px-4 px-3 py-4 rounded-md flex flex-col gap-4">
              <ProfileCard
                setTwoFactor={setTwoFactor}
                isTwoFactor={isTwoFactor}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                  iconName="crown"
                  title={t("my_plan")}
                  badge={userPlan}
                  subtitle={`Renewing on: ${planRenewalDate}`}
                  buttonText={t("upgrade")}
                  onButtonClick={() => navigate("/pricing")}
                  showicon2={true}
                />

                <StatsCard
                  iconName="spiral-logo"
                  title="Omni Coins"
                  stats={`${coinBalance.toLocaleString()}/${coinLimit.toLocaleString()}`}
                  subtitle={t("add_coins_message")}
                  buttonText={userPlan == "free" ? "" : t("add_coins")}
                  onButtonClick={() => navigate("/pricing?tab=addons")}
                />

                <StatsCard
                  iconName="share"
                  title={t("referral_coins")}
                  stats={referralCoin.toLocaleString()}
                  subtitle={t("referral_earn_message")}
                  buttonText={t("refer_earn")}
                  // open referral modal when button clicked
                  onButtonClick={handleReferralClick}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <RecentPosts post={post} />
              <Analytics />
              <NewsUpdates />
            </div>
            <div>
              <ReferralSection />
            </div>
          </main>
        </div>
      )}
      {isEditing && (
        <div className="relative w-full">
          <div className="p-0 w-full">
            <ProfileSetupSinglePage />
          </div>
        </div>
      )}
      {isPasswordEditing && (
        <div className="relative w-full">
          <div className="p-0 w-full">
            <UpdatePasswordForm />
          </div>
        </div>
      )}
    </>
  );
};
