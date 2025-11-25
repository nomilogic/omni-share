import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../public/locales/en/translation.json";
import es from "../public/locales/es/translation.json";
import zh from "../public/locales/zh/translation.json";

i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  resources: {
    en: { translation: en },
    es: { translation: es },
    zh: { translation: zh },
  },
});

export default i18n;
