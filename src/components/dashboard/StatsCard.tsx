import { ReactNode } from "react";
import Icon from "../Icon";

interface StatsCardProps {
  icon?: ReactNode;
  iconName?: string;
  title: string;
  badge?: string;
  stats?: string;
  subtitle: string;
  buttonText: string;
  showicon2?: boolean;
  onButtonClick?: () => void;
}

function StatsCard({
  icon,
  iconName,
  title,
  badge,
  stats,
  subtitle,
  buttonText,
  showicon2,
  onButtonClick,
}: StatsCardProps) {
  return (
    <div className="rounded-md border border-[#7650e3] bg-white  px-4 py-4">
      <div className="flex items-start justify-between ">
        <div className="flex items-center gap-2">
          {(icon || iconName) && (
            <>
              {icon ? (
                icon
              ) : iconName ? (
                <Icon name={iconName as any} size={22} />
              ) : null}
            </>
          )}
          <h3 className="text-lg font-semibold ">
            {title}
            {showicon2 && (
              <Icon name="question-mark" size={18} className="ml-2" />
            )}
          </h3>
        </div>
        <>
          {stats && (
            <p className="text-base font-semibold text-[#7650e3] ">{stats}</p>
          )}
          {badge && (
            <span className="text-[#7650e3] rounded text-md font-bold inline-block">
              {badge}
            </span>
          )}
        </>
      </div>

      <div className="text-sm text-slate-600  h-8">{subtitle}</div>

      <button
        onClick={onButtonClick}
        className="rounded-md theme-bg-light px-3 disabled:cursor-not-allowed font-semibold text-base py-1 border w-[130px] border-[#7650e3] text-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3]"
      >
        {buttonText}
      </button>
    </div>
  );
}

export default StatsCard;
