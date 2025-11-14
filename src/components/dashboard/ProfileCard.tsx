import { Settings, Edit } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

function ProfileCard() {
  const { state, dispatch, setProfileEditing} = useAppContext();

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
    <div className="flex items-center justify-between  ">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
          {initials || "U"}
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">{fullName}</h2>
          <p className="text-sm text-[#7650e3]">{email}</p>
        </div>
      </div>
      <div className="flex items-center gap-5">
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
          <Edit className="w-[17px] h-[17px]" />
          <span className="hover:underline text-decoration-line">Edit Profile</span>
        </button>
      </div>
    </div>
  );
}

export default ProfileCard;
