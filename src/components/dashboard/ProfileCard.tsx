import { Settings, Edit, User, PenLine } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

function ProfileCard() {
  const {  state, dispatch, setProfileEditing} = useAppContext();

  const navigate = useNavigate();

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
    <div className="flex lg:flex-row flex-col md:justify-between  ">
      <div className="flex items-center gap-2">
        <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
          
          <img
            className=" rounded-full object-cover theme-bg-trinary"
            src={
              state?.user?.avatarUrl
                ? state?.user?.avatarUrl
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    state?.user?.profile?.fullName ||
                      state?.user?.email ||  "U"
                    
                  )}&background=00000000&color=fff`
          }
            alt={state?.user?.profile?.fullName}
          />
        </div>
        <div>
          <div className="text-base font-bold text-gray-900">{fullName}</div>
          <div className="text-sm text-[#7650e3]">{email}</div>
        </div>
      </div>
      <div className="flex items-center gap-5 justify-end">
        <button
          className="flex items-center rounded-md gap-1.5 transition-colors text-[13px] font-semibold"
          style={{
            color: "#7650e3",
          }}
          onClick={() => navigate("/settings")}
        >
          <Settings className="w-[18px] h-[18px]" />
          <span className="hover:underline text-decoration-line">Setting</span>
        </button>
        <button
          className="flex items-center rounded-md gap-2 transition-colors text-[13px] font-semibold "
          style={{
            color: "#7650e3",
          }}
          onClick={() => setProfileEditing(true)}
        >
          <PenLine className="w-[14px] h-[14px]" />
          <span className="hover:underline text-decoration-line">
            Edit Profile
          </span>
        </button>
      </div>
    </div>
  );
}

export default ProfileCard;
