import { Settings, Edit, User, PenLine, Lock } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function ProfileCard() {
  const { state, setProfileEditing, setPasswordEditing } = useAppContext();
  const { t, i18n } = useTranslation();
  const changeLanguage = (lang: any) => i18n.changeLanguage(lang);

  // Extract user information
  const fullName =
    state?.user?.profile?.fullName ||
    state?.user?.user_metadata?.name ||
    "User";
  const email = state?.user?.email || "user@example.com";

  // Get initials from full name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(fullName);

  return (
    <div className="flex md:flex-row flex-col-reverse md:items-center gap-5  md:justify-between   ">
      <div className="flex items-center gap-2">
        <div className="lg:w-14 lg:h-14 w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
          <img
            className=" rounded-full object-cover theme-bg-trinary"
            src={
              state?.user?.avatarUrl
                ? state?.user?.avatarUrl
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    state?.user?.profile?.fullName || state?.user?.email || "U"
                  )}&background=00000000&color=fff`
            }
            alt={state?.user?.profile?.fullName}
            onError={(e) => {
              const target = e.currentTarget;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                state?.user?.profile?.fullName || state?.user?.email || "U"
              )}&background=00000000&color=fff`;
            }}
          />
        </div>
        <div>
          <div className="text-lg font-semibold  text-gray-900 ">
            {fullName}
          </div>
          <div className="text-sm text-[#7650e3] -mt-1">{email}</div>
        </div>
      </div>
      <div className="flex  items-center  lg:gap-5 gap-2 md:justify-center justify-end ">
        <button
          className="flex items-center rounded-md gap-2 transition-colors text-sm font-semibold "
          style={{
            color: "#7650e3",
          }}
          onClick={() => setProfileEditing(true)}
        >
          <PenLine className="w-[14px] h-[14px]" />
          <span className="hover:underline text-decoration-line">
            {t("edit_profile")}
          </span>
        </button>
        <button
          className="flex items-center rounded-md gap-2 transition-colors text-sm font-semibold "
          style={{
            color: "#7650e3",
          }}
          onClick={() => setPasswordEditing(true)}
        >
          <Lock className="w-[14px] h-[14px]" />
          <span className="hover:underline text-decoration-line">
            {t("update_password")}
          </span>
        </button>
      </div>
    </div>
  );
}

export default ProfileCard;
