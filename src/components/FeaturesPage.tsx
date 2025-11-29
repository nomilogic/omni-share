import React, { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  TvMinimalPlay,
  BarChart3,
  Star,
  Plus,
  Minus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

import pic from "../assets/Post Automtaion.jpg";
import pic10 from "../assets/Post Automtaion (post).jpg";
import pic3 from "../assets/Media Optimization.jpg";
import pic4 from "../assets/Media Optimization (post).jpg";
import pic5 from "../assets/Smart Insights.jpg";
import pic6 from "../assets/Smart Insights (post).jpg";
import pic7 from "../assets/Instant Publishing.jpg";
import pic8 from "../assets/Instant Publishing(instagram).jpg";
import pic9 from "../assets/Instant Publishing (facebook).jpg";
import pic2 from "../assets/Post Automtaion (post02).jpg";

type Feature = {
  id: number;
  title: string;
  description: React.ReactNode;
  icon: React.ReactNode;
  mobileImage: string;
  desktopMain: string;
  desktopFloat: string[];
};

const getFeatures = (t: any): Feature[] => [
  {
    id: 1,
    title: t("post_automation"),
    description: (
      <p className="text-gray-500 text-lg leading-relaxed md:w-full">
        {t("line_32")}{" "}
        <span className="text-purple-600 text-xl font-medium">
          {t("line_33")}
        </span>{" "}
        {t("line_36")}
      </p>
    ),
    icon: <Sparkles className="w-6 h-6" />,
    mobileImage: pic,
    desktopMain: pic,
    desktopFloat: [pic2, pic10],
  },

  {
    id: 2,
    title: t("media_optimization"),
    description: (
      <p className="text-gray-500 text-lg leading-relaxed md:w-full">
        {t("line_10")}{" "}
        <span className="text-purple-600 text-xl font-medium">
          {t("line_11")}
        </span>{" "}
        {t("line_12")}{" "}
        <span className="text-purple-600 text-xl font-medium">
          {t("line_13")}
        </span>{" "}
        {t("line_14")}{" "}
        <span className="text-purple-600 text-xl font-medium">
          {t("line_15")}
        </span>{" "}
        {t("line_16")}{" "}
        <span className="text-purple-600 text-xl font-medium">
          {t("line_17")}
        </span>
        {t("line_18")}
      </p>
    ),
    icon: <TvMinimalPlay className="w-6 h-6" />,
    mobileImage: pic3,
    desktopMain: pic3,
    desktopFloat: [pic4],
  },

  {
    id: 3,
    title: t("smart_insights"),
    description: (
      <p className="text-gray-500 text-lg leading-relaxed md:w-full">
        {t("line_19")}{" "}
        <span className="text-purple-600 text-xl font-medium">
          {t("line_20")}
        </span>{" "}
        {t("line_21")}{" "}
        <span className="text-purple-600 text-xl font-medium">
          {t("line_22")}
        </span>{" "}
          {t("line_23")} {" "}
          <span className="text-purple-600 text-xl font-medium"> 
        {t("line_24")} {" "}
        </span>
        {t("line_25")}
      </p>
    ),
    icon: <BarChart3 className="w-6 h-6" />,
    mobileImage: pic5,
    desktopMain: pic5,
    desktopFloat: [pic6],
  },

  {
    id: 4,
    title: t("instant_publishing"),
    description: (
      <p className="text-gray-500 text-lg leading-relaxed md:w-full">
        {t("line_26")}{" "}
        <span className="text-purple-600 text-xl font-medium">
          {t("line_27")}
        </span>{" "}
        {t("line_28")}{" "}
        <span className="text-purple-600 text-xl font-medium">
          {t("line_29")}
        </span>{" "}
        {t("line_30")}{" "}
        <span className="text-purple-600 text-xl font-medium">
          {t("line_31")}
        </span>
        .
      </p>
    ),
    icon: <Star className="w-6 h-6" />,
    mobileImage: pic7,
    desktopMain: pic7,
    desktopFloat: [pic8, pic9],
  },
];

const getFloatStyles = (id: number, floatIndex: number) => {
  if (floatIndex === 0) {
    if (id === 1) return { bottom: "47%", right: "-20%", width: "40%" };
    if (id === 2)
      return { bottom: "-10%", right: "-15%", width: "40%", height: "70%" };
    if (id === 3) return { top: "60%", right: "-9%", width: "40%" };
    if (id === 4)
      return { bottom: "35%", right: "-19%", width: "27%", height: "50%" };
    return { bottom: "-5%", left: "-4%", width: "29.5%" };
  }
  if (floatIndex === 1) {
    if (id === 1) return { bottom: "-20%", left: "-10%", width: "40%" };
    if (id === 4)
      return { bottom: "-20%", right: "-20%", width: "28%", height: "53%" };
    return { bottom: "18%", right: "-12%", width: "31%" };
  }
  return {};
};

const imageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

const floatVariants = {
  initial: { opacity: 0, y: 5, scale: 0.8 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -5,
    scale: 0.8,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

const FeaturesPage: React.FC = () => {
  const [activeId, setActiveId] = useState<number>(1);
   const { t, i18n } = useTranslation();
  const changeLanguage = (lang: any) => i18n.changeLanguage(lang);

  const features = getFeatures(t);
  const activeFeature = features.find(f => f.id === activeId) || features[0];
  const floatImages = activeFeature.desktopFloat || [];

  const listRef = useRef<HTMLDivElement | null>(null);
  const iconRefs: any = useRef<Record<number, HTMLDivElement | null>>({});
  const [staticTop, setStaticTop] = useState(0);
  const [staticHeight, setStaticHeight] = useState(0);

  useEffect(() => {
    if (!listRef.current) return;

    const observer = new ResizeObserver(() => {
      updateStaticLine();
    });

    observer.observe(listRef.current);
    return () => observer.disconnect();
  }, []);

  const updateStaticLine = () => {
    const container = listRef.current;
    const activeIcon = iconRefs.current[activeId];
    const lastIcon = iconRefs.current[4];

    if (!container || !activeIcon || !lastIcon) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeIcon.getBoundingClientRect();
    const lastRect = lastIcon.getBoundingClientRect();

    const start = activeRect.bottom - containerRect.top;
    const end = lastRect.top - containerRect.top;

    setStaticTop(start);
    setStaticHeight(end - start);
  };

  const handleItemClick = (id: number) => {
    if (window.innerWidth < 768) setActiveId(activeId === id ? 0 : id);
    else setActiveId(id);
  };

 

  return (
    <div className="w-full">
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="relative w-full max-w-full mx-auto px-4 sm:px-6 lg:px-[10%]">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            <span className="font-bold">
              {t("suite_social_success")}
              <br className="hidden md:block" />
              {t("omni_content_creation")}
            </span>
          </h2>
          <p className="hidden md:block text-xl text-gray-500 font-medium mx-auto max-w-[900px] text-center">
            {t("omni_content_message")}
          </p>
          <div className="mt-12 grid md:grid-cols-2 md:gap-12 items-start">
            {/* Feature List */}
            <div className="relative" ref={listRef}>
              {/* Static Vertical Line */}
              <div
                className="absolute left-6 w-px bg-gray-300 z-0 hidden md:block"
                style={{ top: staticTop, height: staticHeight }}
              />
              <div className="space-y-4">
                {features.map((item) => {
                  const isActive = activeId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`cursor-pointer transition-all p-4 rounded-xl ${
                        isActive
                          ? "bg-gray-200"
                          : "bg-gray-100 hover:bg-gray-200"
                      } md:p-0 md:bg-transparent md:hover:bg-transparent`}
                      onClick={() => handleItemClick(item.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="grid grid-cols-[40px_1fr] gap-3 items-start flex-grow">
                          <div
                            className={`relative z-20 flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-300 ${
                              isActive ? "bg-purple-700" : "bg-gray-400"
                            }`}
                            ref={(el) => (iconRefs.current[item.id] = el)}
                          >
                            {React.cloneElement(
                              item.icon as React.ReactElement,
                              {
                                className: "w-6 h-6 text-white",
                              }
                            )}
                          </div>
                          <div className="mt-3 ml-2 md:mt-2 md:ml-4">
                            <h3
                              className={`text-lg md:text-2xl font-semibold md:font-bold transition-colors duration-300 ${
                                isActive ? "text-purple-700" : "text-gray-900"
                              }`}
                            >
                              {item.title}
                            </h3>
                          </div>
                        </div>
                        <div className="md:hidden mt-2 ml-4">
                          {isActive ? (
                            <Minus className="w-6 h-6 text-gray-700" />
                          ) : (
                            <Plus className="w-6 h-6 text-gray-700" />
                          )}
                        </div>
                      </div>
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 md:ml-6 md:pl-8 md:pr-2">
                              <div className="text-gray-500 text-lg md:w-full md:ml-3">
                                {item.description}
                              </div>
                              <div className="md:hidden mt-4">
                                <img
                                  src={activeFeature.mobileImage}
                                  alt={activeFeature.title}
                                  className="w-full h-auto rounded-xl shadow-lg"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Image Display */}
            <div className="hidden md:block md:col-span-1 w-full h-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.id}
                  className="relative w-full"
                  variants={imageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <div className="relative w-full bg-white rounded-xl shadow-2xl">
                    <img
                      src={activeFeature.desktopMain}
                      alt={activeFeature.title}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>

                  {floatImages[0] && (
                    <motion.div
                      className="absolute bg-white rounded-xl shadow-xl z-10"
                      style={getFloatStyles(activeFeature.id, 0)}
                      variants={floatVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <img
                        src={floatImages[0]}
                        className="w-full h-full rounded-lg"
                      />
                    </motion.div>
                  )}

                  {floatImages[1] && (
                    <motion.div
                      className="absolute p-2 bg-white rounded-xl shadow-xl z-10"
                      style={getFloatStyles(activeFeature.id, 1)}
                      variants={floatVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <img
                        src={floatImages[1]}
                        className="w-full h-full rounded-lg"
                      />
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
