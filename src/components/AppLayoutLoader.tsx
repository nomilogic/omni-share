import React, { useEffect, useState } from "react";
import Icon from "./Icon";
import logoText from "../assets/logo-text.svg";
import { useAppContext } from "@/context/AppContext";

export const AppInitializer = () => {
  const { loader } = useAppContext();

  if (loader) document.body.style.overflow = "hidden";
  else document.body.style.overflow = "auto";

  const [visible, setVisible] = useState(loader);

  useEffect(() => {
    if (!loader) {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
    }
  }, [loader]);

  if (!visible) return null;
  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-400 ${loader ? "opacity-100" : "opacity-0"} bg-gradient-to-br bg-black/50 backdrop-blur-sm`}
    >
      <div className="relative flex flex-col items-center gap-6 px-10 py-9 bg-white backdrop-blur-lg border border-purple-300 rounded-md shadow-xl">
        <div className="flex flex-col items-center gap-3">
          <Icon
            name="spiral-logo"
            size={50}
            className="text-purple-600 drop-shadow-[0_0_18px_rgba(124,58,237,0.35)] animate-spin transition-all duration-500"
          />

          <img src={logoText} alt="App Name" className="h-4 opacity-95" />

          <p className="text-gray-600 text-sm font-medium tracking-wide">
            Setting up your workspace...
          </p>
        </div>

        {/* Loader Bar */}
        <div className="w-56 h-[4px] bg-purple-100 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-purple-500 to-purple-700 animate-loading" />
        </div>

        {/* Footer */}
        <div className="text-purple-400/60 text-xs mt-1">
          v{import.meta.env.VITE_APP_VERSION || "1.0.0"} • ©{" "}
          {new Date().getFullYear()}
        </div>

        <style>{`
          @keyframes loading {
            0% { transform: translateX(-120%); }
            100% { transform: translateX(320%); }
          }
          .animate-loading {
            animation: loading 1.3s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AppInitializer;
