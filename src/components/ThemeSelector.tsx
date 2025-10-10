import React from "react";
import { Palette, Check } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { themes } from "../lib/theme";

export const ThemeSelector: React.FC = () => {
  const { currentTheme, changeTheme, availableThemes, currentThemeKey } = useTheme();

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2  px-0 py-0 rounded-lg transition-colors theme-bg-card ">
        <div
          className={`w-4 h-4 border border-white rounded-full bg-gradient-to-r ${currentTheme.bgGradient}`}
        ></div>
        {/* <Palette className="w-5 h-5 theme-text-primary" /> */}
        <span className=" hidden theme-text-primary font-medium">
          {currentTheme.name}
        </span>
      </button>

      <div className="absolute top-full right-0 mt-2 w-72 theme-bg-card rounded-xl shadow-2xl opacity-50 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        <div className="p-4">
          <h3 className="theme-text-primary font-semibold mb-3 theme-bg-card p-2 rounded-lg">
            Choose App Theme
          </h3>
          <div className="grid grid-cols-1 gap-2 theme-bg-card ">
            {availableThemes.map((theme) => (
              <button
                key={theme.key}
                onClick={() => changeTheme(theme.key)}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors hover:theme-bg-primary group ${
                  currentThemeKey === theme.key ? "theme-bg-primary" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.bgGradient}`}
                  ></div>
                  <span className="theme-text-primary font-medium">
                    {theme.name}
                  </span>
                </div>
                {currentThemeKey === theme.key && (
                  <Check className="w-4 h-4 theme-text-primary" />
                )}
              </button>
            ))}
          </div>
          <div className="mt-3 p-2 theme-bg-primary rounded-lg">
            <p className="text-xs theme-text-light">
              Themes are based on the onboarding carousel color schemes. Changes
              apply instantly across the entire app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
