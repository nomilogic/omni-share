import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import {
  motion,
} from "framer-motion";

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
      className={`relative text-purple-600 mr-1 ${
        className
          ? className
          : "  text-purple-600   "
      }`}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`px-2 w-[70px] p-1 text-purple-600 text-sm flex justify-center items-center  transition-all ${
          className ?? ""
        }`}
      >
        <span className="font-medium text-sm">{label}</span>
        <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className=" h-5 pl-1" />
              </motion.div>
      </button>

      {open && (
        <div
          role="menu"
          className={`mt-2 w-[80px] bg-white rounded-md shadow-lg z-50 overflow-hidden ${"left-0"} absolute `}
        >
          <button
            role="menuitem"
            onClick={() => changeLang("en")}
            className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 text-purple-600  font-medium transition-colors"
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
