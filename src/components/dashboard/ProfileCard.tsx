import { Settings, Edit } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

function ProfileCard() {
  const { state } = useAppContext();

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
          <p className="text-gray-600 text-sm">{email}</p>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <button
          className="flex items-center rounded-md gap-1.5 transition-colors text-sm font-semibold"
          style={{
            color: "#7650e3",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#d7d7fc";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <Settings className="w-5 h-5" />
          <span>Setting</span>
        </button>
        <button
          className="flex items-center rounded-md gap-2 transition-colors text-sm font-semibold"
          style={{
            color: "#7650e3",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#d7d7fc";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <Edit className="w-5 h-5" />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
}

export default ProfileCard;
