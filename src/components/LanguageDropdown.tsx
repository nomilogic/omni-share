import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

interface LanguageDropdownProps {
  className?: string;
  alignRight?: boolean;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  className,
  alignRight = true,
}) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const changeLang = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("siteLang", lng);
    setOpen(false);
  };

  const label = i18n.language?.startsWith("zh")
    ? "中文"
    : i18n.language?.startsWith("es")
    ? "ES"
    : "EN";

  return (
    <div
      ref={ref}
      className={`relative border border-purple-600 bg-white text-purple-600  rounded-md  md:block hidden mr-1 ${
        className
          ? className
          : " border border-purple-600 text-purple-600 rounded-md "
      }`}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`px-6 py-1 rounded-md text-sm bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-2 transition-all ${
          className ?? ""
        }`}
      >
        <span className="font-medium text-sm">{label}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <div
          role="menu"
          className={`mt-2 w-[88px] bg-white rounded-md shadow-lg z-50 overflow-hidden ${
            alignRight ? "right-0" : "left-0"
          } absolute `}
        >
          <button
            role="menuitem"
            onClick={() => changeLang("en")}
            className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 text-purple-600 text-gray-900 font-medium transition-colors"
          >
            EN
          </button>
          <button
            role="menuitem"
            onClick={() => changeLang("es")}
            className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 text-purple-600 text-gray-900 font-medium transition-colors"
          >
            ES
          </button>
          <button
            role="menuitem"
            onClick={() => changeLang("zh")}
            className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 text-purple-600 text-gray-900 font-medium transition-colors"
          >
            中文
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
