import { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
const PROFILE_FIELDS = [
  "fullName",
  "phoneNumber",
  "publicUrl",
  "brandName",
  "brandLogo",
  "brandTone",
  "audienceAgeRange",
  "audienceGender",
  "audienceRegions",
  "audienceInterests",
  "audienceSegments",
  "preferredPlatforms",
  "primaryPurpose",
  "contentCategories",
  "keyOutcomes",
  "postingStyle",
];




const getProgressColor = (progress: number) => {
  if (progress < 50) {
    const ratio = progress / 50;

    const red = 255;
    const green = Math.floor(80 + ratio * 120); // 80 → 200
    const blue = 0;

    return `rgb(${red}, ${green}, ${blue})`;
  } else {
    // Orange → Dark Green
    const ratio = (progress - 50) / 50;

    const red = Math.floor(255 - ratio * 200); // 255 → 55
    const green = Math.floor(200 - ratio * 40); // 200 → 160
    const blue = 0;

    return `rgb(${red}, ${green}, ${blue})`;
  }
};

const calculateProfileProgress = (profile: any) => {
  if (!profile) return 0;

  const totalFields = PROFILE_FIELDS.length;

  const filledFields = PROFILE_FIELDS.filter((key) => {
    const value = profile[key];

    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim() !== "";
    return Boolean(value);
  }).length;

  return Math.round((filledFields / totalFields) * 100);
};

export function AvatarWithProgress({
  state,
  size = 65,
  className = "w-12 h-12",
}: any) {
  const profile = state?.profile;

  const progress = useMemo(() => calculateProfileProgress(profile), [profile]);

  const color = getProgressColor(progress);
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const [isHovered, setIsHovered] = useState(false);
  const {  setProfileEditing } = useAppContext();

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setProfileEditing(true)}
    >
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute -top-5 left-6 z-10 px-2 py-1 text-xs font-medium text-purple-700 bg-slate-50 border rounded shadow-lg whitespace-nowrap">
          Profile completion: {progress}%
        </div>
      )}
{progress < 100 && (
      <svg width={size} height={size} className="-rotate-90 absolute">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
)}
      <div
        className={`rounded-full overflow-hidden bg-purple-700 flex items-center justify-center ${className}`}
      >
        <img
          className="w-full h-full object-cover rounded-full"
          src={
            state?.user?.avatarUrl
              ? state.user.avatarUrl
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  profile?.fullName || state?.user?.email || "U"
                )}&background=00000000&color=fff`
          }
          alt={profile?.fullName}
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              profile?.fullName || state?.user?.email || "U"
            )}&background=00000000&color=fff`;
          }}
        />
      </div>
{progress < 100 && (
      <div
        className="absolute -bottom-[17px] px-2 py-[2px] text-[10px] font-semibold text-white rounded-full shadow"
        style={{ backgroundColor: color }}
      >
        {progress}%
      </div>
       )}
    </div>
  );
}
