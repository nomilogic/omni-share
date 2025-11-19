import { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useSpring,
} from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Play,
  Check,
  Share2,
  Zap,
  BarChart3,
  Calendar,
  Video,
  Sparkles,
  Star,
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp,
} from "lucide-react";
import Icon from "../components/Icon";
import { Link, useNavigate } from "react-router-dom";
import LogoWhiteText from "../assets/logo-white-text.svg";
import API from "@/services/api";
import { Counter } from "./counter";
import TwoColumnSection2 from "@/components/TwoColumnSection2";
import FeaturesPage from "@/components/FeaturesPage";
import TwoColumnSection from "@/components/TwoColumnSection";
import IntroVideo from "../assets/OMNISHARE.00.mp4";
import { Platform } from "@/types";
import {
  getPlatformIcon,
  getPlatformIconBackgroundColors,
} from "../utils/platformIcons";

function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null
  );
  const [showContactForm, setShowContactForm] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const isInitialMount = useRef(true);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  const socialPlatforms: Platform[] = [
    "linkedin",
    "facebook",
    "instagram",
    "youtube",
    "tiktok",
  ];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const packagesRes = await API.listPackages();
        setPackages(packagesRes.data.data || []);
      } catch (error) {
        console.error("Failed to load packages/addons:", error);
      }
    };
    fetchData();
  }, []);
  console.log("packages", packages);

  const allFeatures = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI-Powered Content",
      description:
        "Generate engaging posts automatically using advanced AI technology tailored for each platform.",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Smart Scheduling",
      description:
        "Schedule your posts across all platforms at optimal times for maximum engagement.",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Dashboard",
      description:
        "Track performance metrics and insights across all your social media platforms in real-time.",
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: "Multi-Platform Sync",
      description:
        "Post simultaneously to Facebook, Instagram, YouTube, LinkedIn, and TikTok with one click.",
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Media Optimization",
      description:
        "Automatically resize and optimize images and videos for each platform's requirements.",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Publishing",
      description:
        "Publish your content instantly or schedule it for later with our lightning-fast system.",
    },
  ];

  const displayedFeatures = showAllFeatures
    ? allFeatures
    : allFeatures.slice(0, 3);

  const reviews = [
    {
      name: "Sarah Johnson",
      role: "Social Media Manager",
      company: "TechFlow Inc",
      rating: 5,
      text: "Omnishare has completely transformed how we manage our social media presence. The AI-powered content generation saves us hours every week, and the multi-platform scheduling is seamless.",
      avatar: "SJ",
    },
    {
      name: "Michael Chen",
      role: "Marketing Director",
      company: "GrowthLabs",
      rating: 5,
      text: "The analytics dashboard is incredibly powerful. We've seen a 300% increase in engagement since switching to Omnishare. The platform pays for itself within the first month.",
      avatar: "MC",
    },
    {
      name: "Emily Rodriguez",
      role: "Content Creator",
      company: "Creative Studio",
      rating: 5,
      text: "As a solo creator managing multiple client accounts, Omnishare is a lifesaver. The AI understands each platform's nuances and creates perfectly optimized content every time.",
      avatar: "ER",
    },
    {
      name: "David Thompson",
      role: "CEO",
      company: "StartupHub",
      rating: 5,
      text: "Best investment we've made for our marketing stack. The time saved on content creation allows us to focus on strategy and growth. Highly recommend for any business.",
      avatar: "DT",
    },
    {
      name: "Lisa Martinez",
      role: "Brand Manager",
      company: "Fashion Forward",
      rating: 5,
      text: "The media optimization feature is fantastic. Our posts look professional across all platforms, and the scheduling ensures we post at optimal times for maximum reach.",
      avatar: "LM",
    },
  ];

  const faqs = [
    {
      question: "What is OmniShare?",
      answer:
        "Yes! You can create one post and publish it across Facebook, Instagram, YouTube, LinkedIn, and TikTok simultaneously, or schedule them at different optimal times for each platform.",
    },
    {
      question: "How does OmniShare's AI-powered content creation work?",
      answer:
        "Our AI analyzes your brand voice, industry trends, and platform requirements to generate high-quality posts, captions, descriptions, and hashtags. You get ready-to-publish content tailored for each social platform.",
    },

    {
      question: "Which social media platforms does OmniShare support?",
      answer:
        "You can manage Facebook, Instagram, YouTube, LinkedIn, and TikTok — all through one centralized system.",
    },
    {
      question: "Can I publish on multiple platforms at once?",
      answer:
        "Yes. With one click, OmniShare lets you publish your content across all connected platforms. The system also auto-generates AI text and images when needed.",
    },
    {
      question: "Does OmniShare optimize media for each platform?",
      answer:
        "Absolutely. OmniShare automatically resizes your images and videos, creates YouTube thumbnails, and ensures every post meets the exact platform specifications.",
    },
    {
      question: "What kind of insights does OmniShare provide?",
      answer:
        "You get clear, actionable analytics on engagement, reach, performance trends, and audience behavior — helping you make smarter decisions to improve your social strategy.",
    },
    {
      question: "How fast is OmniShare's publishing system?",
      answer:
        "Our instant publishing engine ensures your posts go live immediately and reliably — so you can reach your audience at the perfect moment.",
    },
    {
      question: "Can OmniShare help with trend-based content?",
      answer:
        "Yes! OmniShare scans real-time trends and transforms them into powerful captions, descriptions, and viral hashtags tailored to each platform.",
    },
    {
      question: "Is OmniShare suitable for businesses and teams?",
      answer:
        "Definitely. OmniShare is built for individuals, agencies, brands, and teams managing content across different platforms, regions, or client accounts.",
    },
    {
      question: "Do you offer demos or product walkthroughs?",
      answer:
        "Yes! You can explore the full potential of OmniShare with a personalized product demo to see how it can elevate your social growth.",
    },
  ];

  const nextReview = () => {
    setSlideDirection("left");
    setTimeout(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
      setSlideDirection(null);
    }, 300);
  };

  const prevReview = () => {
    setSlideDirection("right");
    setTimeout(() => {
      setCurrentReviewIndex(
        (prev) => (prev - 1 + reviews.length) % reviews.length
      );
      setSlideDirection(null);
    }, 300);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  // Professional animation variants with proper typing
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrollY > 50
            ? "bg-[#7650e3] shadow-lg backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-[10%]">
          <div className="flex justify-between items-center h-20 flex-row-reverse md:flex-row">
            <div className="lg:hidden"></div>
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Icon
                name="spiral-logo"
                size={35}
                className="ml-0 lg:ml-0 mt-1 lg:scale-100 brightness-[1000%]"
              />
              <span className="text-white text-2xl lg:text-[1.6rem] tracking-tight">
                <img src={LogoWhiteText} alt="Logo" className="h-5" />
              </span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {["home", "features", "FAQ", "contact"].map((section, index) => (
                <motion.button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`transition-colors relative ${
                    scrollY > 50 ? "text-white" : "text-white"
                  } capitalize font-medium`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100,
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {section}
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-white origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  />
                </motion.button>
              ))}
              <motion.button
                onClick={() => navigate("/auth")}
                className="bg-white text-[#7650e3] px-6 py-2.5 rounded-full font-semibold shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                whileHover={{
                  scale: 1.08,
                  boxShadow: "0 10px 30px rgba(118, 80, 227, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className={`md:hidden transition-colors ${
                scrollY > 50 ? "text-white" : "text-white"
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.9, rotate: 90 }}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden bg-white border-t overflow-hidden"
              >
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {["home", "features", "video", "contact"].map(
                    (section, index) => (
                      <motion.button
                        key={section}
                        onClick={() => scrollToSection(section)}
                        className="block w-full text-left px-3 py-2.5 text-slate-700 hover:bg-gray-100 rounded-md capitalize"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {section}
                      </motion.button>
                    )
                  )}
                  <motion.button
                    onClick={() => navigate("/auth")}
                    className="block w-full text-left px-3 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #7650e3 0%, #6366F1 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />

        <motion.div
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              type: "spring",
              stiffness: 80,
            }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            AI-Powered Social Media
            <br />
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
              className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent"
            >
              Made Simple
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              type: "spring",
              stiffness: 80,
            }}
            className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Create, schedule, and publish stunning content across Facebook,
            Instagram, YouTube, LinkedIn, and TikTok - all from one powerful
            platform powered by AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center  mb-8"
          >
            <div className="flex gap-3 mb-5 scale-[1.4] justify-center items-center">
              {[
                {
                  name: "facebook",
                  url: "https://www.facebook.com/share/1H74CpLTCK/",
                  index: 0,
                },
                {
                  name: "instagram",
                  url: "https://omnishare.ai/",
                  index: 1,
                },
                {
                  name: "youtube",
                  url: "https://www.youtube.com/@OmniShare-ai",
                  index: 2,
                },
                {
                  name: "linkedin",
                  url: "https://www.linkedin.com/company/omnishare-ai",
                  index: 3,
                },
                {
                  name: "tiktok",
                  url: "https://www.tiktok.com/@omnishare",
                  index: 4,
                },
              ].map((icons) => (
                <button onClick={() => window.open(icons.url, "_blank")}>
                  <motion.svg
                    key={icons.index}
                    className="w-10 h-10 text-white/80 hover:text-white transition-colors"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                      delay: isInitialMount.current ? 0.8 + icons.index * 0.1 : 0,
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                    }}
                    whileHover={{ scale: 1.3, rotate: 10, y: -5, transition: { delay: 0 } }}
                  >
                    {icons.index === 0 && (
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    )}
                    {icons.index === 1 && (
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    )}
                    {icons.index === 2 && (
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    )}
                    {icons.index === 3 && (
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    )}
                    {icons.index === 4 && (
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    )}
                  </motion.svg>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.8,
              type: "spring",
              stiffness: 100,
            }}
            onClick={() => navigate("/auth")}
            className="bg-white text-[#7650e3] px-8 py-4 rounded-full text-lg font-semibold shadow-2xl inline-flex items-center space-x-2"
            whileHover={{
              scale: 1.08,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
              y: -5,
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Get Started Free</span>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8 text-white" />
        </motion.div>
      </section>
      <motion.div
        id="features"
            initial={{ opacity: 0, y: 130,}}
            whileInView={{ opacity: 1, y: 0,  }}
            viewport={{ once: true, margin: "-300px" }}
            transition={{ duration: 1.6, type: "spring", stiffness: 80 }}
      >
        <FeaturesPage />
      </motion.div>
      <TwoColumnSection />
      <TwoColumnSection2 />
      {/* Active Users Stats Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {[
              { icon: Users, end: 1000, suffix: "+", label: "Active Users" },
              {
                icon: TrendingUp,
                end: 99.9,
                suffix: "+",
                label: "Posts Created",
              },
              {
                icon: Share2,
                end: 5,
                suffix: "",
                label: "Platforms Supported",
              },
              { icon: Sparkles, end: 99.9, suffix: "%", label: "Uptime" },
            ].map((stat, index) => (
              <motion.div key={index} className="group" variants={itemVariants}>
                <motion.div
                  className="flex items-center justify-center mb-3"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <stat.icon className="w-8 h-8 text-[#7650e3]" />
                </motion.div>
                <div className="text-4xl md:text-5xl font-bold text-[#000] mb-2">
                  <Counter end={stat.end} suffix={stat.suffix} />
                </div>
                <div className="text-gray-500 font-medium font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className=" bg-gray-50 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{ y: useTransform(smoothProgress, [0, 1], [0, -200]) }}
        >
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#7650e3] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#6366F1] rounded-full blur-3xl"></div>
        </motion.div>

        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
              Everything you need to dominate social media marketing in one
              place
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {displayedFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white p-8 rounded-md shadow-md border border-gray-100 cursor-pointer group"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="text-[#7650e3] mb-4"
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#7650e3] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {feature.description}
                </p>
                <motion.div
                  className="mt-4 h-1 bg-gradient-to-r from-[#7650e3] to-[#6366F1] rounded-full"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ transformOrigin: "left" }}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.button
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="bg-[#7650e3] text-white px-8 py-3 rounded-full shadow-lg inline-flex items-center space-x-2"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 30px rgba(118, 80, 227, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{showAllFeatures ? "Show Less" : "View All Features"}</span>
              <motion.div
                animate={{ rotate: showAllFeatures ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </motion.button>
          </motion.div>
        </div> */}
      </section>

      {/* Video Section */}
      <section id="video" className="py-20 bg-white relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{ y: useTransform(smoothProgress, [0.3, 0.6], [100, -100]) }}
        >
          <div className="absolute top-40 right-20 w-80 h-80 bg-[#7650e3] rounded-full blur-3xl"></div>
        </motion.div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              See Omnishare in Action
            </h2>
            <p className="text-xl text-gray-500 font-medium">
              Watch how easy it is to create and schedule content across all
              platforms
            </p>
          </motion.div>

          <motion.div
            className="relative rounded-md overflow-hidden shadow-2xl bg-gray-900 aspect-video"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          >
            {/* 🎥 Actual Video Layer */}
            <video
              src={IntroVideo}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* 🔮 Overlay Button */}
            {/* <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#7650e3] to-[#6366F1]">
    <motion.button
      className="bg-white rounded-full p-6 shadow-2xl relative"
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <motion.div
        className="absolute inset-0 bg-white rounded-full"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <Play className="w-12 h-12 text-[#7650e3] ml-1 relative z-10" />
    </motion.button>
  </div> */}

            {/* 📝 Text Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-white text-lg font-semibold">
                Introduction to Omnishare
              </p>
              <p className="text-white/80">
                Learn how to maximize your social media presence
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section
        id="pricing"
        className="py-20 bg-gray-50 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#7650e3] mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-500 font-medium">
              Choose the plan that's right for your business
            </p>
          </motion.div>

          <motion.div
            className="grid xl:grid-cols-3 lg:grid-cols-2 gap-5 mx-auto"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {packages.map((tier: any, tierIndex: number) => {
              const isFree = tier.amount === 0;

              return (
                <motion.div
                  key={tier.id}
                  variants={itemVariants}
                  className="rounded-md bg-gray-100 overflow-hidden shadow-md relative group"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div className="absolute inset-0 bg-gradient-to-br from-[#7650e3]/5 to-[#6366F1]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="bg-gradient-to-br from-[#c7bdef] to-[#c7bdef] px-6 py-10 h-64 text-center relative">
                    <motion.h3
                      className="text-[#7650e3] text-3xl font-semibold mb-3"
                      whileHover={{ y: -5 }}
                    >
                      {tier.name}
                    </motion.h3>

                    <motion.div
                      className="flex items-baseline justify-center gap-3 mb-6"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="text-[40px] text-purple-600 font-semibold">
                        <span className="text-[#7650e3] font-semibold text-2xl mr-1">
                          $
                        </span>
                        {tier.amount}
                      </span>
                      <span className="text-2xl font-medium text-[#7650e3]">
                        /{isFree ? "Forever" : "Month"}
                      </span>
                    </motion.div>

                    {!isFree && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          to="/auth"
                          className="w-full py-3 px-6 rounded-md font-semibold transition-all text-base bg-[#7650e3] text-white hover:bg-[#5d3ccc] inline-block shadow-lg"
                        >
                          Choose Plan
                        </Link>
                      </motion.div>
                    )}
                  </div>

                  <div className="px-6 py-4 relative z-10">
                    <div className="mb-5 border-b-2 border-purple-600 h-[120px] text-center">
                      <p className="text-xl text-purple-600 font-semibold mb-2">
                        Ideal for:
                      </p>
                      <p className="text-lg text-slate-800 font-medium">
                        Small agency, growing business, content team
                      </p>
                    </div>

                    <ul className="space-y-4">
                      {tier.features?.map((feature: string, idx: number) => (
                        <motion.li
                          key={idx}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            delay: tierIndex * 0.1 + idx * 0.05,
                            type: "spring",
                          }}
                        >
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-800">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section> */}

      {/* Reviews Section */}
      <section className="py-20 bg-gradient-to-br from-[#d7d7fc] to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <motion.div
            className="absolute top-20 left-20 w-96 h-96 bg-[#7650e3] rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 bg-[#6366F1] rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], x: [0, -50, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Creators Worldwide
            </h2>
            <p className="text-xl text-gray-500 font-medium">
              See what our customers have to say about Omnishare
            </p>
          </motion.div>

          <div className="relative pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentReviewIndex}
                initial={{
                  opacity: 0,
                  x: slideDirection === "left" ? 100 : -100,
                  scale: 0.9,
                }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  x: slideDirection === "left" ? -100 : 100,
                  scale: 0.9,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="bg-white rounded-md shadow-2xl p-8 md:p-12 max-w-4xl mx-auto"
              >
                <div className="flex items-center justify-center mb-6">
                  {[...Array(reviews[currentReviewIndex].rating)].map(
                    (_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{
                          delay: i * 0.1,
                          type: "spring",
                          stiffness: 200,
                        }}
                      >
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      </motion.div>
                    )
                  )}
                </div>

                <p className="text-xl md:text-2xl text-slate-700 text-center mb-8 leading-relaxed italic">
                  "{reviews[currentReviewIndex].text}"
                </p>

                <div className="flex items-center justify-center space-x-4">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-[#7650e3] to-[#6366F1] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {reviews[currentReviewIndex].avatar}
                  </motion.div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 text-lg">
                      {reviews[currentReviewIndex].name}
                    </p>
                    <p className="text-gray-500 font-medium">
                      {reviews[currentReviewIndex].role}
                    </p>
                    <p className="text-gray-500 font-medium text-sm">
                      {reviews[currentReviewIndex].company}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <motion.button
              onClick={prevReview}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white rounded-full p-3 shadow-xl"
              whileHover={{
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
              }}
              aria-label="Previous review"
            >
              <ChevronLeft className="w-6 h-6 text-slate-700" />
            </motion.button>

            <motion.button
              onClick={nextReview}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white rounded-full p-3 shadow-xl"
              aria-label="Next review"
            >
              <ChevronRight className="w-6 h-6 text-slate-700" />
            </motion.button>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {reviews.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  if (index > currentReviewIndex) {
                    setSlideDirection("left");
                  } else if (index < currentReviewIndex) {
                    setSlideDirection("right");
                  }
                  setTimeout(() => {
                    setCurrentReviewIndex(index);
                    setSlideDirection(null);
                  }, 300);
                }}
                className={`rounded-full transition-all duration-300 ${
                  index === currentReviewIndex
                    ? "bg-[#7650e3] w-8 h-3"
                    : "bg-gray-300 hover:bg-gray-400 w-3 h-3"
                }`}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}

      {/* FAQ Section */}
      <section id="FAQ" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-500 font-medium">
              Everything you need to know about Omnishare
            </p>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-md shadow-md overflow-hidden transition-all hover:shadow-lg"
                whileHover={{ x: 5 }}
              >
                <motion.button
                  onClick={() =>
                    setExpandedFaqIndex(
                      expandedFaqIndex === index ? null : index
                    )
                  }
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-lg pr-8">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: expandedFaqIndex === index ? 180 : 0 }}
                    transition={{
                      duration: 0.3,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    <ChevronDown className="w-6 h-6 text-[#7650e3] flex-shrink-0" />
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {expandedFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-gray-500 font-medium leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-gray-500 font-medium">
              Still have questions? Scroll up to contact us.
            </p>
          </motion.div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-xl text-gray-500 font-medium mb-8">
              Have questions? We'd love to hear from you.
            </p>
            <motion.button
              onClick={() => setShowContactForm(!showContactForm)}
              className="bg-[#7650e3] text-white px-8 py-3 rounded-full shadow-lg inline-flex items-center space-x-2"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 30px rgba(118, 80, 227, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{showContactForm ? "Hide Form" : "Get in Touch"}</span>
              <motion.div
                animate={{ rotate: showContactForm ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {showContactForm && (
              <motion.form
                className="space-y-6 pt-8"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, type: "spring" }}
                  >
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7650e3] focus:border-transparent transition-all"
                      placeholder="John"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, type: "spring" }}
                  >
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7650e3] focus:border-transparent transition-all"
                      placeholder="Doe"
                    />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7650e3] focus:border-transparent transition-all"
                    placeholder="john@example.com"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7650e3] focus:border-transparent transition-all"
                    placeholder="Tell us about your needs..."
                  />
                </motion.div>

                <motion.button
                  type="submit"
                  className="w-full bg-[#7650e3] text-white py-4 rounded-md font-semibold text-lg shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 30px rgba(118, 80, 227, 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send Message
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      <div className="relative pt-16 bg-theme-secondary ">
        <motion.footer
          className="w-full  px-4 py-4 text-center text-sm theme-text-light absolute bottom-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="w-full mx-auto flex md:flex-row items-center gap-2 md:justify-between justify-center flex-col px-[10%]">
            <span>© {new Date().getFullYear()} OMNISHARE</span>
            <div className="flex justify-center space-x-1 text-sm theme-text-light mb-1">
              <Link
                to="/privacy"
                className=" transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Privacy Policy
              </Link>
              <span className="text-white/20">•</span>
              <Link to="/terms" className=" transition-colors duration-200">
                Terms of Service
              </Link>
              <span className="text-white/20">•</span>
              <Link to="/support" className=" transition-colors duration-200">
                Support
              </Link>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}

export default HomePage;
