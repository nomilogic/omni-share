import React, { useEffect, useMemo, useState } from "react";
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
import { notify } from "@/utils/toast";
import { ProfileFormData } from "@/components/profileFormSchema";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, user }: any = useAppContext();
  const profileParam = searchParams.get("profile") === "true";
  const isEditing = profileParam || state?.isProfileEditing || false;
  const isPasswordEditing = state?.isPasswordEditing || false;
  const { t } = useTranslation();

  const { openModal } = useModal();
  const handleReferralClick = () => {
    openModal(ReferralSection, {});
  };

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

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startSetup = async () => {
    setLoading(true);

    try {
      const res = await API.enable2FA();
      setQrCodeUrl(res.data.qrCode);
      setManualCode(res.data.manualCode);
    } catch (err: any) {
      console.log("err", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!qrCodeUrl && !user?.twoFactorEnabled) {
      startSetup();
    }
  }, [qrCodeUrl, user?.twoFactorEnabled]);
  const isFreePlan = userPlan?.toLowerCase() === "free";
  const hasLowCoins = (user.wallet?.coins ?? 0) < 6;
  const shouldShowUpgrade = isFreePlan || hasLowCoins;

  const getProgressTitle = (progress: number) => {
    if (progress < 30) return "Let's get started on your profile";
    if (progress < 60) return "Great progress so far";
    if (progress < 90) return "You're almost there";
    if (progress < 100) return "Just a few final details";
    return "Profile complete";
  };

  const PROFILE_PROGRESS_FIELDS: (keyof ProfileFormData)[] = [
    "fullName",
    "phoneNumber",
    "publicUrl",
    "brandName",
    "brandLogo",
    "brandTone",
    "audienceGender",
    "audienceAgeRange",
    "audienceRegions",
    "audienceInterests",
    "audienceSegments",
    "preferredPlatforms",
    "primaryPurpose",
    "keyOutcomes",
    "contentCategories",
    "postingStyle",
  ];
  const calculateProfileProgress = (profile: any) => {
    if (!profile) return 0;

    const totalFields = PROFILE_PROGRESS_FIELDS.length;

    const filledFields = PROFILE_PROGRESS_FIELDS.filter((key) => {
      const value = profile[key];

      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "string") return value.trim() !== "";
      return Boolean(value);
    }).length;

    return Math.round((filledFields / totalFields) * 100);
  };

  const progress = useMemo(
    () => calculateProfileProgress(state?.user?.profile),
    [state?.user]
  );

  const getProgressColor = (progress: number) => {
    if (progress < 50) {
      const ratio = progress / 50;

      const red = 255;
      const green = Math.floor(80 + ratio * 120);
      const blue = 0;

      return `rgb(${red}, ${green}, ${blue})`;
    } else {
      // Orange → Dark Green
      const ratio = (progress - 50) / 50;

      const red = Math.floor(255 - ratio * 200);
      const green = Math.floor(200 - ratio * 40);
      const blue = 0;

      return `rgb(${red}, ${green}, ${blue})`;
    }
  };

  return (
    <>
      {user && !user?.twoFactorEnabled && (
        <TwoFASetupModal
          open={isTwoFactor}
          onClose={() => setTwoFactor(false)}
          onSuccess={() => setTwoFactor(false)}
          qrCodeUrl={qrCodeUrl}
          manualCode={manualCode}
          loading={loading}
          setQrCodeUrl={setQrCodeUrl}
          setManualCode={setManualCode}
        />
      )}

      {!isEditing && !isPasswordEditing && (
        <div className="min-h-screen my-10">
          <main className="max-w-8xl mx-auto  flex flex-col gap-y-8 ">
            <div className=" w-full max-w-5xl  mx-auto bg-white rounded-2xl px-4 py-4   transition-shadow duration-300">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-gray-900">
                  {getProgressTitle(progress)}
                </h3>
                <span className="text-base font-semibold text-gray-700">
                  {progress}%
                </span>
              </div>

              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out shadow-inner"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: getProgressColor(progress),
                  }}
                />
              </div>

              {progress < 100 && (
                <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                  Complete your profile for better, personalized
                  recommendations.
                </p>
              )}

              {progress === 100 && (
                <p className="mt-4 text-sm font-medium text-purple-700 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Profile completed — thank you!
                </p>
              )}
            </div>
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
                  showicon2={true}
                  // pass buttonText and onButtonClick only when condition is true,
                  // otherwise pass an empty string so StatsCard won't render the button
                  {...(shouldShowUpgrade
                    ? {
                        buttonText: t("upgrade"),
                        onButtonClick: () => navigate("/pricing"),
                      }
                    : { buttonText: "" })}
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
