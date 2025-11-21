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

const features: Feature[] = [
  {
    id: 1,
    title: "Post Automation",
    description: (
      <p className="text-gray-500 text-lg leading-relaxed md:w-full">
        Publish seamlessly across{" "}
        <span className="text-purple-600 text-xl font-medium">
          Facebook, Instagram, YouTube, LinkedIn, and TikTok
        </span>{" "}
        with a single click. Omni Share automatically generates{" "}
        <span className="text-purple-600 text-xl font-medium">
          AI-powered text and image posts
        </span>
        , ensuring your content reaches every platform quickly and efficiently.
      </p>
    ),
    icon: <Sparkles className="w-6 h-6" />,
    mobileImage: pic,
    desktopMain: pic,
    desktopFloat: [pic2, pic10],
  },
  {
    id: 2,
    title: "Media Optimization",
    description: (
      <p className="text-gray-500 text-lg leading-relaxed md:w-full">
        Automatically{" "}
        <span className="text-purple-600 text-xl font-medium">resize posts</span>{" "}
        for each platform and create{" "}
        <span className="text-purple-600 text-xl font-medium">
          striking video thumbnails
        </span>{" "}
        for YouTube uploads. All this happens within an{" "}
        <span className="text-purple-600 text-xl font-medium">
          intuitive editing suite
        </span>
        , allowing{" "}
        <span className="text-purple-600 text-xl font-medium">
          fast, seamless customization
        </span>{" "}
        so your content looks perfect every time.
      </p>
    ),
    icon: <TvMinimalPlay className="w-6 h-6" />,
    mobileImage: pic3,
    desktopMain: pic3,
    desktopFloat: [pic4],
  },
  {
    id: 3,
    title: "Smart Insights",
    description: (
      <p className="text-gray-500 text-lg leading-relaxed md:w-full">
        Get{" "}
        <span className="text-purple-600 text-xl font-medium">
          clear, actionable insights
        </span>{" "}
        on your content performance across all platforms. Track{" "}
        <span className="text-purple-600 text-xl font-medium">engagement</span>{" "}
        and <span className="text-purple-600 text-xl font-medium">reach</span>{" "}
        to make smarter decisions and continuously improve your social media
        strategy.
      </p>
    ),
    icon: <BarChart3 className="w-6 h-6" />,
    mobileImage: pic5,
    desktopMain: pic5,
    desktopFloat: [pic6],
  },
  {
    id: 4,
    title: "Instant Publishing",
    description: (
      <p className="text-gray-500 text-lg leading-relaxed md:w-full">
        Publish your content{" "}
        <span className="text-purple-600 text-xl font-medium">instantly</span>{" "}
        with our lightning-fast, reliable system. Reach your audience at the{" "}
        <span className="text-purple-600 text-xl font-medium">right moment</span>
        , every time, ensuring{" "}
        <span className="text-purple-600 text-xl font-medium">
          maximum engagement and impact.
        </span>
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
    if (id === 2) return { bottom: "-10%", right: "-15%", width: "40%", height: "70%" };
    if (id === 3) return { top: "60%", right: "-9%", width: "40%" };
    if (id === 4) return { bottom: "35%", right: "-19%", width: "27%", height: "50%" };
    return { bottom: "-5%", left: "-4%", width: "29.5%" };
  }
  if (floatIndex === 1) {
    if (id === 1) return { bottom: "-20%", left: "-10%", width: "40%" };
    if (id === 4) return { bottom: "-20%", right: "-20%", width: "28%", height: "53%" };
    return { bottom: "18%", right: "-12%", width: "31%" };
  }
  return {};
};

const imageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.3, ease: "easeIn" } },
};

const floatVariants = {
  initial: { opacity: 0, y: 5, scale: 0.8 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -5, scale: 0.8, transition: { duration: 0.3, ease: "easeIn" } },
};

const FeaturesPage: React.FC = () => {
  const [activeId, setActiveId] = useState<number>(1);
  const activeFeature = features.find((f) => f.id === activeId) || features[0];
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
        <div className="relative max-w-7xl mx-auto px-6 md:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            <span className="font-bold">
              A Complete Suite for Social Success
              <br className="hidden md:inline" />
              OmniShare – AI-Powered Content Creation
            </span>
          </h2>
          <p className="hidden md:block text-xl text-gray-500 font-medium mx-auto max-w-[900px] text-center">
            Leverage advanced AI technology to generate highly engaging posts
            tailored to your brand and each social media platform. Craft content
            that resonates, drives interaction, and amplifies your online
            presence effortlessly.
          </p>
          <div className="mt-12 grid md:grid-cols-2 md:gap-12 items-start">
            {/* Feature List */}
            <div className="relative" ref={listRef}>
              {/* Static Vertical Line */}
              <div
                className="absolute left-8 w-px bg-gray-300 z-0 hidden md:block"
                style={{ top: staticTop, height: staticHeight }}
              />
              <div className="space-y-4">
                {features.map((item) => {
                  const isActive = activeId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`cursor-pointer transition-all p-4 rounded-xl ${
                        isActive ? "bg-gray-200" : "bg-gray-100 hover:bg-gray-200"
                      } md:p-2 md:bg-transparent md:hover:bg-transparent`}
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
                            {React.cloneElement(item.icon as React.ReactElement, {
                              className: "w-6 h-6 text-white",
                            })}
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
                      <img src={floatImages[0]} className="w-full h-full rounded-lg" />
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
                      <img src={floatImages[1]} className="w-full h-full rounded-lg" />
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
