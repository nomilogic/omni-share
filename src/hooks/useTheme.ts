
import { useState, useEffect } from 'react';
import { themeManager, ThemeColors } from '../lib/theme';

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeColors>(themeManager.getCurrentTheme());
  const [currentThemeKey, setCurrentThemeKey] = useState<string>(themeManager.getCurrentThemeKey());

  useEffect(() => {
    const unsubscribe = themeManager.subscribe((theme) => {
      setCurrentTheme(theme);
      setCurrentThemeKey(themeManager.getCurrentThemeKey());
    });
    return unsubscribe;
  }, []);

  const changeTheme = (themeName: string) => {
    themeManager.setTheme(themeName);
  };

  const availableThemes = themeManager.getAvailableThemes();

  return {
    currentTheme,
    currentThemeKey,
    changeTheme,
    availableThemes
  };
};
