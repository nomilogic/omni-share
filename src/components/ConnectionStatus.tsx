import { useTranslation } from "react-i18next";
import React from "react";

interface ConnectionStatusProps {
  isConnected: boolean;
  label: string;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  label,
  className = "",
  
}) => {
  const { t, i18n } = useTranslation();
  const changeLanguage = (lang: any) => i18n.changeLanguage(lang);
  return (
    <div
      className={`theme-bg-quaternary rounded-md p-4 border border-purple-200 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="theme-text-secondary font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span
            className={`text-sm font-semibold ${
              isConnected ? "text-green-500" : "text-red-500"
            }`}
          >
            {isConnected ? t("connected") : t("not_connected")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
