import { themes } from "./theme";

(function initTheme() {
  const savedTheme = localStorage.getItem("app-theme") || "omni-share";
  const theme = themes[savedTheme];

  if (!theme) return;

  const root = document.documentElement;

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
})();
