import { ReactNode } from 'react';
import Icon from '../Icon';

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
    <div className="rounded-lg border-2 border-[#7650e3] bg-white shadow-md p-3">
      {/* TOP ROW - Title/Icon on left, Stats/Badge on right */}
      <div className="flex items-start justify-between mb-0">
        <div className="flex items-center gap-2">
          {(icon || iconName) && (
            <div className="w-6 h-6">
              {icon ? (
                icon
              ) : iconName ? (
                <Icon name={iconName as any} size={24} />
              ) : null}
            </div>
          )}
          <h3 className="text-xl font-semibold ">
            {title}
            {showicon2 && (<Icon name="question-mark" size={18} className='ml-2' />)}
          </h3>
        </div>
        <div className="text-right">
          {stats && (
            <p className="text-lg font-bold text-[#7650e3] mb-1">{stats}</p>
          )}
          {badge && (
            <span className="text-[#7650e3] px-0 py-1 rounded text-md font-bold inline-block">
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* SUBTITLE */}
      <p className="text-sm text-slate-600 mb-4">{subtitle}</p>

      {/* BUTTON */}
      <button
        onClick={onButtonClick}
        className="rounded-md theme-bg-light w-fit px-3 disabled:cursor-not-allowed font-bold text-base py-1 border-2 border-[#7650e3] text-[#7650e3] hover:bg-[#7650e3] hover:text-white"
      >
        {buttonText}
      </button>
    </div>
  );
}

export default StatsCard;
