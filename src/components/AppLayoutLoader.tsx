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
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-400 ${loader ? "opacity-100" : "opacity-0"} bg-gradient-to-br bg-black/70 backdrop-blur-sm`}
    >
      <div className="relative flex flex-col items-center gap-6 px-12 py-10 bg-white/90 border border-purple-100 backdrop-blur-sm  rounded-md shadow-md">
        <div className="flex flex-col items-center gap-3">
          <Icon
            name="spiral-logo"
            size={45}
            className="text-purple-600 mb-2  animate-spin transition-all duration-500"
          />

          <img src={logoText} alt="App Name" className="h-4 opacity-95" />

          <p className="text-gray-600 text-sm font-medium tracking-wide">
            Setting up your workspace...
          </p>
        </div>

        <div className="w-60 h-[4px] bg-purple-100 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-purple-500 to-purple-700 animate-loading" />
        </div>

        <div className="text-purple-400/80 text-xs mt-1">
          {import.meta.env.VITE_API_URL_FRONT || "1.0.0"} • ©{" "}
          {new Date().getFullYear()}
        </div>

        <style>{`
          @keyframes loading {
            0% { transform: translateX(-120%); }
            100% { transform: translateX(320%); }
          }
          .animate-loading {
            animation: loading 1.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AppInitializer;
