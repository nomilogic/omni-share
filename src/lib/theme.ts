export interface ThemeColors {
  name: string;
  bgGradient: string;
  primary: string;
  secondary: string;
  trinary : string;
    quaternary : string;
    pantary : string;
  accent: string;
  text: {
    primary: string;
    secondary: string;
    trinary : string;
    quaternary : string;
    pantary : string;
    light: string;
    dark: string;
  };
  background: {
    primary: string;
    secondary: string;
    trinary : string;
    quaternary : string;
    pantary : string;
  
    card: string;
    light: string;
    dark: string;
  };
  border: {
    primary: string;
    secondary: string;
    trinary : string;
        quaternary : string;
    pantary : string;
    card: string;
    light: string;
    dark: string;
  };
  button: {
    primary: string;
    secondary: string;
    trinary : string;
    quaternary : string;
    pantary : string;
    hover: string;
    dark: string;
    light: string;
  };
}

// ...existing code...
export const themes: Record<string, ThemeColors> = {
  "omni-share": {
    name: "Omni Share",
    bgGradient: "from-white to-grey-200",
    primary: "#3B82F6",
    secondary: "#8B5CF6",
    trinary: "#6366F1",
    quaternary: "#FBBF24",
    pantary: "#F472B6",
    accent: "#6366F1",
    text: {
      primary: "#000",
      secondary: "#7650e3",
      trinary: "#8B5CF6",
      quaternary: "#d7d7fc",
      pantary: "#633cd3",
      light: "rgba(255, 255, 255, 0.99)",
      dark: "rgba(0, 0, 0, 0.7)",
    },
    background: {
      primary: "rgb(255 255 255)",
      secondary: "rgb(168 85 247 / 0.2)",
      trinary: "#7650e3",
      quaternary: "#d7d7fc",
      pantary: "#633cd3",
      card: "#fafafa",
      light: "rgba(255, 255, 255, 1)",
      dark: "rgba(0, 0, 0, 0.95)",
    },
    border: {
      primary: "rgb(255 255 255)",
      secondary: "rgb(168 85 247 / 0.2)",
      trinary: "#7650e3",
      quaternary: "#d7d7fc",
      pantary: "#F472B6",
      card: "#fafafa",
      light: "rgba(255, 255, 255, 0.95)",
      dark: "#000",
    },
    button: {
      primary: "#FFFFFF",
      secondary: "rgba(255, 255, 255, 0.2)",
      trinary: "#6366F1",
      quaternary: "#FBBF24",
      pantary: "#633cd3",
      hover: "rgba(255, 255, 255, 0.9)",
      dark: "rgba(0, 0, 0, 0.9)",
      light: "rgba(255, 255, 255, 0.9)",
    },
  },
  
  // ...repeat for other themes, adding trinary, quaternary, pantary to each section...
};
// ...existing code...

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: string = "omni-share"; // Default to first onboarding theme
  private listeners: ((theme: ThemeColors) => void)[] = [];

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  getCurrentTheme(): ThemeColors {
    return themes[this.currentTheme];
  }

  getCurrentThemeKey(): string {
    return this.currentTheme;
  }

  setTheme(themeName: string) {
    if (themes[themeName]) {
      this.currentTheme = themeName;
      this.applyTheme();
      this.notifyListeners();
      localStorage.setItem("app-theme", themeName);
    }
  }

  private applyTheme() {
    const theme = this.getCurrentTheme();
    const root = document.documentElement;

    // Apply CSS custom properties for all theme colors
    root.style.setProperty("--theme-primary", theme.primary);
    root.style.setProperty("--theme-secondary", theme.secondary);
    root.style.setProperty("--theme-trinary", theme.trinary);
    root.style.setProperty("--theme-quaternary", theme.quaternary);
    root.style.setProperty("--theme-pantary", theme.pantary);
    root.style.setProperty("--theme-accent", theme.accent);

    root.style.setProperty("--theme-text-primary", theme.text.primary);
    root.style.setProperty("--theme-text-secondary", theme.text.secondary);
    root.style.setProperty("--theme-text-trinary", theme.text.trinary);
    root.style.setProperty("--theme-text-quaternary", theme.text.quaternary);
    root.style.setProperty("--theme-text-pantary", theme.text.pantary);
    root.style.setProperty("--theme-text-light", theme.text.light);
    root.style.setProperty("--theme-text-dark", theme.text.dark);

    root.style.setProperty("--theme-bg-primary", theme.background.primary);
    root.style.setProperty("--theme-bg-secondary", theme.background.secondary);
    root.style.setProperty("--theme-bg-trinary", theme.background.trinary);
    root.style.setProperty("--theme-bg-quaternary", theme.background.quaternary);
    root.style.setProperty("--theme-bg-pantary", theme.background.pantary);
    root.style.setProperty("--theme-bg-card", theme.background.card);
    root.style.setProperty("--theme-bg-light", theme.background.light);
    root.style.setProperty("--theme-bg-dark", theme.background.dark);

    root.style.setProperty("--theme-border-primary", theme.border.primary);
    root.style.setProperty("--theme-border-secondary", theme.border.secondary);
    root.style.setProperty("--theme-border-trinary", theme.border.trinary);
    root.style.setProperty("--theme-border-quaternary", theme.border.quaternary);
    root.style.setProperty("--theme-border-pantary", theme.border.pantary);
    root.style.setProperty("--theme-border-card", theme.border.card);
    root.style.setProperty("--theme-border-light", theme.border.light);
    root.style.setProperty("--theme-border-dark", theme.border.dark);

    root.style.setProperty("--theme-button-primary", theme.button.primary);
    root.style.setProperty("--theme-button-secondary", theme.button.secondary);
    root.style.setProperty("--theme-button-trinary", theme.button.trinary);
    root.style.setProperty("--theme-button-quaternary", theme.button.quaternary);
    root.style.setProperty("--theme-button-pantary", theme.button.pantary);
    root.style.setProperty("--theme-button-hover", theme.button.hover);
    root.style.setProperty("--theme-button-dark", theme.button.dark);
    root.style.setProperty("--theme-button-light", theme.button.light);
  }

  subscribe(callback: (theme: ThemeColors) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(
        (listener) => listener !== callback,
      );
    };
  }

  private notifyListeners() {
    const theme = this.getCurrentTheme();
    this.listeners.forEach((listener) => listener(theme));
  }

  initialize() {
    const savedTheme = localStorage.getItem("app-theme");
    if (savedTheme && themes[savedTheme]) {
      this.currentTheme = savedTheme;
    }
    this.applyTheme();
  }

  getAvailableThemes() {
    return Object.keys(themes).map((key) => ({
      key,
      ...themes[key],
    }));
  }

  getThemeByKey(key: string): ThemeColors | null {
    return themes[key] || null;
  }

  // Utility methods for getting gradient class
  getCurrentGradientClass(): string {
    return this.getCurrentTheme().bgGradient;
  }
}

export const themeManager = ThemeManager.getInstance();
