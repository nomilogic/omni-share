import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  BarChart3,
  Star,
  MessageSquare,
  Plus,
  Minus,
} from "lucide-react";
import pic from "../assets/choco.png";
import pic2 from "../assets/conn.png";
import pic3 from "../assets/dash.png";
import pic4 from "../assets/full.png";
import pic5 from "../assets/invoi.png";
import pic6 from "../assets/omni home.png";
import pic7 from "../assets/manage subs.png";
import pic8 from "../assets/preview.png";

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
    title: "Multi-Platform Management & Automation",
    description: (
      <>
        Publish seamlessly across{" "}
        <strong className="text-purple-600">
          Facebook, Instagram, YouTube, LinkedIn, and TikTok
        </strong>{" "}
        with a single click. Omni Share automatically generates{" "}
        <strong className="text-purple-600">
          AI-powered text and image posts
        </strong>
        , ensuring your content reaches every platform quickly and efficiently.
      </>
    ),
    icon: <Search className="w-6 h-6" />,
    mobileImage: pic,
    desktopMain: pic,
    desktopFloat: [pic],
  },
  {
    id: 2,
    title: "Media Optimization",
    description: (
      <>
        Automatically <strong className="text-purple-600">resize posts</strong>{" "}
        for each platform and create{" "}
        <strong className="text-purple-600">striking video thumbnails</strong>{" "}
        for YouTube uploads. All this happens within an{" "}
        <strong className="text-purple-600">intuitive editing suite</strong>,
        allowing{" "}
        <strong className="text-purple-600">
          fast, seamless customization
        </strong>{" "}
        so your content looks perfect every time.
      </>
    ),
    icon: <BarChart3 className="w-6 h-6" />,
    mobileImage: pic2,
    desktopMain: pic3,
    desktopFloat: [pic5, pic7],
  },
  {
    id: 3,
    title: "Smart Insights",
    description: (
      <>
        Get{" "}
        <strong className="text-purple-600">clear, actionable insights</strong>{" "}
        on your content performance across all platforms. Track{" "}
        <strong className="text-purple-600">engagement</strong> and{" "}
        <strong className="text-purple-600">reach</strong> to make smarter
        decisions and continuously improve your social media strategy.
      </>
    ),
    icon: <Star className="w-6 h-6" />,
    mobileImage: pic4,
    desktopMain: pic5,
    desktopFloat: [pic6],
  },
  {
    id: 4,
    title: "Instant Publishing",
    description: (
      <>
        Publish your content{" "}
        <strong className="text-purple-600">instantly</strong> with our
        lightning-fast, reliable system. Reach your audience at the{" "}
        <strong className="text-purple-600">right moment</strong>, every time,
        ensuring{" "}
        <strong className="text-purple-600">
          maximum engagement and impact.
        </strong>
      </>
    ),
    icon: <MessageSquare className="w-6 h-6" />,
    mobileImage: pic8,
    desktopMain: pic4,
    desktopFloat: [pic, pic6],
  },
];

const getFloatStyles = (id: number, floatIndex: number) => {
  if (floatIndex === 0) {
    if (id === 1)
      return {
        bottom: "-20%",
        right: "-5%",
        width: "40%",
        height: "80%",
        transitionDelay: "2s",
      };
    if (id === 2)
      return {
        bottom: "15%",
        right: "-15%",
        width: "40%",
        height: "50%",
        transitionDelay: "2s",
      };
    if (id === 3)
      return {
        top: "10%",
        right: "-10%",
        width: "30%",
        height: "80%",
        transitionDelay: "2s",
      };
    if (id === 4)
      return {
        bottom: "25%",
        right: "3%",
        width: "60%",
        height: "60%",
        transitionDelay: "2s",
      };
    return {
      bottom: "-5%",
      left: "-4%",
      width: "29.5%",
      transitionDelay: "10s",
    };
  }
  if (floatIndex === 1) {
    if (id === 2)
      return {
        bottom: "-5%",
        left: "-5%",
        width: "40%",
        height: "60%",
        transitionDelay: "0.135s",
      };
    if (id === 4)
      return {
        bottom: "3%",
        right: "-10%",
        width: "25%",
        height: "55%",
        transitionDelay: "0.135s",
      };
    return {
      bottom: "18%",
      right: "-12%",
      width: "31%",
      transitionDelay: "0.135s",
    };
  }
  return {};
};

const FeaturesPage: React.FC = () => {
  const [activeId, setActiveId] = useState<number>(1);
  const activeFeature = features.find((f) => f.id === activeId) || features[0];
  const floatImages = activeFeature.desktopFloat || [];

  const listRef = useRef<HTMLDivElement | null>(null);
  const iconRefs: any = useRef<Record<number, HTMLDivElement | null>>({});
  const [progressTop, setProgressTop] = useState(0);
  const [progressHeight, setProgressHeight] = useState(0);

  useEffect(() => {
    const container = listRef.current;
    const firstIcon = iconRefs.current[1];
    const lastIcon = iconRefs.current[4];
    if (!container || !firstIcon || !lastIcon) return;

    const containerRect = container.getBoundingClientRect();
    const firstRect = firstIcon.getBoundingClientRect();
    const lastRect = lastIcon.getBoundingClientRect();

    const start = firstRect.bottom - containerRect.top;
    const end = lastRect.top - containerRect.top;

    setProgressTop(start);
    setProgressHeight(end - start);
  }, [activeId]);

  const handleItemClick = (id: number) => {
    if (window.innerWidth < 768) setActiveId(activeId === id ? 0 : id);
    else setActiveId(id);
  };

  return (
    <div className=" w-full">
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
            <div className="relative" ref={listRef}>
              <div
                className="absolute left-8 w-px bg-purple-600 transition-all duration-300 z-0 hidden md:block"
                style={{
                  top: `${progressTop}px`,
                  height: `${progressHeight}px`,
                }}
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
                      } md:p-2 md:bg-transparent md:hover:bg-transparent`}
                      onClick={() => handleItemClick(item.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="grid grid-cols-[40px_1fr] gap-3 items-start flex-grow">
                          <div
                            className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-purple-700"
                            ref={(el) => (iconRefs.current[item.id] = el)}
                          >
                            {React.cloneElement(
                              item.icon as React.ReactElement,
                              { className: "w-6 h-6 text-white" }
                            )}
                          </div>
                          <div className="mt-3 ml-2 md:mt-2 md:ml-4">
                            <h3 className="text-lg md:text-2xl font-semibold md:font-bold">
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
                      {isActive && (
                        <div className="mt-2 md:ml-6 md:pl-8 md:pr-2">
                          <div className="text-gray-500 text-sm md:max-w-[350px] md:ml-3">
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
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="hidden md:block md:col-span-1 w-full h-auto">
              <div
                key={activeFeature.id}
                className="relative w-full t-fade-in t-height-auto"
              >
                <div className="relative w-full p-4 bg-white rounded-xl shadow-2xl transition-opacity-transform-200 t-scale-94-100 tff-translate3d-000">
                  <img
                    src={activeFeature.desktopMain}
                    alt={activeFeature.title}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                {floatImages[0] && (
                  <div
                    className="absolute p-2 bg-white rounded-xl shadow-xl transition-opacity-transform-300 t-scale-94-100 tff-translate3d-000 z-10"
                    style={getFloatStyles(activeFeature.id, 0)}
                  >
                    <img
                      src={floatImages[0]}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}
                {floatImages[1] && (
                  <div
                    className="absolute p-2 bg-white rounded-xl shadow-xl transition-opacity-transform-300 t-scale-94-100 tff-translate3d-000 z-10"
                    style={getFloatStyles(activeFeature.id, 1)}
                  >
                    <img
                      src={floatImages[1]}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
