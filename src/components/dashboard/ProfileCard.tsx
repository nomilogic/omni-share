import { PenLine, Lock, Settings } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { useTranslation } from "react-i18next";
import { AvatarWithProgress } from "../AvatarWithProgress";
import { useModal } from "../../context2/ModalContext";

function ProfileCard() {
  const { state, setProfileEditing, setPasswordEditing } = useAppContext();
  const { t } = useTranslation();
  const { openModal } = useModal();

  const fullName =
    state?.user?.profile?.fullName ||
    state?.user?.user_metadata?.name ||
    "User";
  const email = state?.user?.email || "user@example.com";

  return (
    <div className="flex md:flex-row flex-col-reverse md:items-center gap-5 md:justify-between">
      <div className="flex items-center gap-2">
        <div className="mr-2 py-2">
          <AvatarWithProgress state={state.user} />
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900">{fullName}</div>
          <div className="text-sm text-[#7650e3] -mt-1">{email}</div>
        </div>
      </div>

      <div className="flex items-center lg:gap-5 gap-2 md:justify-center justify-end">
        <button
          className="flex items-center hover:underline rounded-md gap-1 transition-colors text-sm font-semibold"
          style={{ color: "#7650e3" }}
          onClick={() => setProfileEditing(true)}
        >
          <PenLine className="w-[14px] h-[14px]" />
          <span>{t("edit_profile")}</span>
        </button>

        <button
          className="flex items-center hover:underline rounded-md gap-1 transition-colors text-sm font-semibold"
          style={{ color: "#7650e3" }}
          onClick={() => setPasswordEditing(true)}
        >
          <Settings className="w-[15px] h-[15px]" />
          <span>{t("account_setting")}</span>
        </button>
      </div>
    </div>
  );
}

export default ProfileCard;
