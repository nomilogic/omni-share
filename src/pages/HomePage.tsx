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
  Share2,
  Zap,
  BarChart3,
  Calendar,
  Sparkles,
  Star,
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp,
  Home,
  Plus,
  Building2,
  History,
  Video,
} from "lucide-react";
import Icon from "../components/Icon";
import { Link, useNavigate } from "react-router-dom";
import LogoWhiteText from "../assets/logo-white-text.svg";
import API from "@/services/api";
import { Counter } from "./counter";
import TwoColumnSection2 from "@/components/TwoColumnSection2";
import FeaturesPage from "@/components/FeaturesPage";
import CommunitySignup from "@/components/CommunitySignup";
import TwoColumnSection from "@/components/TwoColumnSection";
import IntroVideo from "../assets/OMNISHARE.00.mp4";
import { Platform } from "@/types";

import { notify } from "@/utils/toast";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import OmniVideo from "../assets/video/omnishare.mp4";
import LanguageDropdown from "../components/LanguageDropdown";
import { useTranslation } from "react-i18next";

function HomePage() {
  const { t, i18n } = useTranslation();
  const changeLanguage = (lang: any) => i18n.changeLanguage(lang);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null
  );
  const [showContactForm, setShowContactForm] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
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

  // SEO Meta Tags
  useEffect(() => {
    // Update document title
    document.title =
      "OmniShare - AI-Powered Social Media Content Generator & Scheduler";

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "OmniShare is an AI-powered social media management platform that helps you create, schedule, and publish engaging content across Facebook, Instagram, YouTube, LinkedIn, and TikTok in seconds."
      );
    }

    // Add breadcrumb schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://omnishare.ai",
        },
      ],
    };

    let schemaScript = document.querySelector(
      'script[data-type="breadcrumb-schema"]'
    );
    if (!schemaScript) {
      schemaScript = document.createElement("script");
      schemaScript.type = "application/ld+json";
      schemaScript.setAttribute("data-type", "breadcrumb-schema");
      schemaScript.textContent = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(schemaScript);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  console.log("packages", packages);

  const reviews = [
    {
      name: "Sarah Johnson",
      role: "Social Media Manager",
      company: "TechFlow Inc",
      rating: 5,
      text: t("testimonial_1"),
      avatar: "SJ",
    },
    {
      name: "Michael Chen",
      role: "Marketing Director",
      company: "GrowthLabs",
      rating: 5,
      text: t("testimonial_2"),
      avatar: "MC",
    },
    {
      name: "Emily Rodriguez",
      role: "Content Creator",
      company: "Creative Studio",
      rating: 5,
      text: t("testimonial_3"),
      avatar: "ER",
    },
    {
      name: "David Thompson",
      role: "CEO",
      company: "StartupHub",
      rating: 5,
      text: t("testimonial_4"),
      avatar: "DT",
    },
    {
      name: "Lisa Martinez",
      role: "Brand Manager",
      company: "Fashion Forward",
      rating: 5,
      text: t("testimonial_5"),
      avatar: "LM",
    },
  ];

  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);

  const faqs = [
    {
      question: t("what_is_omnishare"),
      answer: t("create_publish_message"),
    },
    {
      question: t("ai_content_creation"),
      answer: t("ai_content_creation_message"),
    },

    {
      question: t("platform_support"),
      answer: t("platform_support_message"),
    },
    {
      question: t("multi_publish"),
      answer: t("multi_publish_message"),
    },
    {
      question: t("faq_security_audits"),
      answer: t("faq_security_audits_answer"),
    },
    {
      question: t("does_omnishare_optimize_media_for_each_platform"),
      answer: t("omnishare_auto_resizes_description"),
    },
    {
      question: t("insights"),
      answer: t("insights_message"),
    },
    {
      question: t("publishing_speed"),
      answer: t("publishing_speed_message"),
    },
    {
      question: t("trend_content"),
      answer: t("trend_content_message"),
    },
    {
      question: t("business_suitability"),
      answer: t("business_suitability_message"),
    },
    {
      question: t("demos"),
      answer: t("demos_message"),
    },
    {
      question: t("faq_how_is_my_data_protected"),
      answer: t("faq_how_is_my_data_protected_answer"),
    },
    {
      question: t("faq_does_omnishare_store_credentials"),
      answer: t("faq_does_omnishare_store_credentials_answer"),
    },
    {
      question: t("faq_can_multiple_team_members_access"),
      answer: t("faq_can_multiple_team_members_access_answer"),
    },
    {
      question: t("faq_prevent_unauthorized_access"),
      answer: t("faq_prevent_unauthorized_access_answer"),
    },
    {
      question: t("faq_privacy_compliance"),
      answer: t("faq_privacy_compliance_answer"),
    },
    {
      question: t("faq_security_issue"),
      answer: t("faq_security_issue_answer"),
    },
  ];

  const displayedFaqs = faqs.slice(0, visibleCount);

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

  const contactSchema = z.object({
    firstName: z.string().min(2, "First name is too short"),
    lastName: z.string().min(2, "Last name is too short"),
    email: z.string().email("Invalid email address"),
    message: z.string().min(5, "Message must be at least 5 characters"),
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
  });
  const onSubmit = async (data: any) => {
    try {
      await API.contactUs(data);

      notify("success", "Message sent successfully");
      reset();
    } catch (err: any) {
      notify("error", err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-y-0 left-0 z-50 w-full sm:w-[60%] bg-[#7650e3] transform md:hidden overflow-y-auto"
          >
            {/* Header with Logo and Close Button */}
            <div className="flex items-center justify-between border-b border-white/20 p-2 py-3">
              <span className="flex items-center">
                <Icon
                  name="spiral-logo"
                  className="ml-2 brightness-[200]"
                  size={38}
                />
                <span className="text-white text-2xl lg:text-[1.6rem] tracking-tight ml-3">
                  <img
                    src={LogoWhiteText}
                    alt="Omnishare logo"
                    className="h-4"
                    decoding="async"
                    loading="lazy"
                  />
                </span>
              </span>

              <button
                onClick={() => setIsMenuOpen(false)}
                className="rounded-md text-white mr-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 px-1 py-2.5 flex flex-col mx-2 gap-y-2">
              {[
                { name: t("home"), icon: Home },
                { name: t("features"), icon: Plus },
                { name: t("faq"), icon: Building2 },
                { name: t("contact"), icon: History },
              ].map((item, index) => (
                <motion.button
                  key={item.name}
                  onClick={() => scrollToSection(item.name.toLowerCase())}
                  className="flex items-center px-4 py-3 text-white font-medium rounded-md transition-colors hover:bg-[#d7d7fc] hover:text-[#7650e3]"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon size={20} className="mr-3" />
                  <span>{item.name}</span>
                </motion.button>
              ))}
            </nav>

            <div className=" p-4 space-y-3 ml-3">
              <LanguageDropdown alignRight={false} />
            </div>

            <div className="px-3 py-4">
              <motion.button
                onClick={() => {
                  navigate("/auth");
                  setIsMenuOpen(false);
                }}
                className="w-full bg-white text-[#7650e3] px-6 py-3 rounded-full font-semibold shadow-lg transition-all"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                {t("get_started")}
              </motion.button>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0">
              <div className="w-full mx-auto">
                <div className="text-center flex flex-col items-center justify-center border-y gap-3 border-white/20 relative p-2">
                  <div className="flex justify-center space-x-1 text-sm text-white/80 mb-1">
                    <Link
                      to="/privacy"
                      className="transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("privacy_policy")}
                    </Link>
                    <span className="text-white/20">•</span>
                    <Link
                      to="/terms"
                      className="transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("terms_service")}
                    </Link>
                    <span className="text-white/20">•</span>
                    <Link
                      to="/support"
                      className="transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("support")}
                    </Link>
                  </div>
                  <div className="flex justify-center space-x-1 text-xs text-white/80 w-full">
                    {/* Social Media Icons */}
                    <div className="flex flex-row justify-between gap-1.5 px-5 w-full">
                      <a
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#d7d7fc] transition-colors"
                        href="https://www.instagram.com/omnishare.ai/"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <g clipPath="url(#clip0_367_3134)">
                            <path
                              d="M12.625 2.2896C15.8313 2.2896 16.2109 2.30366 17.4719 2.35991C18.6438 2.41147 19.2766 2.60835 19.6984 2.77241C20.2563 2.98804 20.6594 3.25054 21.0766 3.66772C21.4984 4.0896 21.7563 4.48804 21.9719 5.04585C22.1359 5.46772 22.3328 6.10522 22.3844 7.27241C22.4406 8.53804 22.4547 8.91772 22.4547 12.1193C22.4547 15.3255 22.4406 15.7052 22.3844 16.9662C22.3328 18.138 22.1359 18.7709 21.9719 19.1927C21.7563 19.7505 21.4938 20.1537 21.0766 20.5709C20.6547 20.9927 20.2563 21.2505 19.6984 21.4662C19.2766 21.6302 18.6391 21.8271 17.4719 21.8787C16.2063 21.9349 15.8266 21.949 12.625 21.949C9.41875 21.949 9.03906 21.9349 7.77813 21.8787C6.60625 21.8271 5.97344 21.6302 5.55156 21.4662C4.99375 21.2505 4.59063 20.988 4.17344 20.5709C3.75156 20.149 3.49375 19.7505 3.27813 19.1927C3.11406 18.7709 2.91719 18.1334 2.86563 16.9662C2.80938 15.7005 2.79531 15.3209 2.79531 12.1193C2.79531 8.91304 2.80938 8.53335 2.86563 7.27241C2.91719 6.10054 3.11406 5.46772 3.27813 5.04585C3.49375 4.48804 3.75625 4.08491 4.17344 3.66772C4.59531 3.24585 4.99375 2.98804 5.55156 2.77241C5.97344 2.60835 6.61094 2.41147 7.77813 2.35991C9.03906 2.30366 9.41875 2.2896 12.625 2.2896ZM12.625 0.128662C9.36719 0.128662 8.95938 0.142725 7.67969 0.198975C6.40469 0.255225 5.52813 0.461475 4.76875 0.756787C3.97656 1.06616 3.30625 1.47397 2.64063 2.14429C1.97031 2.80991 1.5625 3.48023 1.25313 4.26772C0.957812 5.03179 0.751563 5.90366 0.695313 7.17866C0.639063 8.46304 0.625 8.87085 0.625 12.1287C0.625 15.3865 0.639063 15.7943 0.695313 17.074C0.751563 18.349 0.957812 19.2255 1.25313 19.9849C1.5625 20.7771 1.97031 21.4474 2.64063 22.113C3.30625 22.7787 3.97656 23.1912 4.76406 23.4958C5.52813 23.7912 6.4 23.9974 7.675 24.0537C8.95469 24.1099 9.3625 24.124 12.6203 24.124C15.8781 24.124 16.2859 24.1099 17.5656 24.0537C18.8406 23.9974 19.7172 23.7912 20.4766 23.4958C21.2641 23.1912 21.9344 22.7787 22.6 22.113C23.2656 21.4474 23.6781 20.7771 23.9828 19.9896C24.2781 19.2255 24.4844 18.3537 24.5406 17.0787C24.5969 15.799 24.6109 15.3912 24.6109 12.1334C24.6109 8.87554 24.5969 8.46772 24.5406 7.18804C24.4844 5.91304 24.2781 5.03647 23.9828 4.2771C23.6875 3.48022 23.2797 2.80991 22.6094 2.14429C21.9438 1.47866 21.2734 1.06616 20.4859 0.761475C19.7219 0.466162 18.85 0.259912 17.575 0.203662C16.2906 0.142725 15.8828 0.128662 12.625 0.128662Z"
                              fill="#fff"
                            />
                            <path
                              d="M12.625 5.9646C9.22188 5.9646 6.46094 8.72554 6.46094 12.1287C6.46094 15.5318 9.22188 18.2927 12.625 18.2927C16.0281 18.2927 18.7891 15.5318 18.7891 12.1287C18.7891 8.72554 16.0281 5.9646 12.625 5.9646ZM12.625 16.1271C10.4172 16.1271 8.62656 14.3365 8.62656 12.1287C8.62656 9.92085 10.4172 8.13022 12.625 8.13022C14.8328 8.13022 16.6234 9.92085 16.6234 12.1287C16.6234 14.3365 14.8328 16.1271 12.625 16.1271Z"
                              fill="#fff"
                            />
                            <path
                              d="M20.4719 5.7208C20.4719 6.51768 19.825 7.15987 19.0328 7.15987C18.2359 7.15987 17.5938 6.51299 17.5938 5.7208C17.5938 4.92393 18.2406 4.28174 19.0328 4.28174C19.825 4.28174 20.4719 4.92861 20.4719 5.7208Z"
                              fill="#fff"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_367_3134">
                              <rect
                                width="24"
                                height="24"
                                fill="white"
                                transform="translate(0.625 0.128662)"
                              />
                            </clipPath>
                          </defs>
                        </svg>
                      </a>

                      <a
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#d7d7fc] transition-colors"
                        href="https://www.linkedin.com/company/omnishare-ai"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 25"
                          fill="none"
                        >
                          <g clipPath="url(#clip0_749_992)">
                            <path
                              d="M22.2283 0.528564H1.77167C1.30179 0.528564 0.851161 0.715222 0.518909 1.04747C0.186657 1.37973 0 1.83036 0 2.30023V22.7569C0 23.2268 0.186657 23.6774 0.518909 24.0097C0.851161 24.3419 1.30179 24.5286 1.77167 24.5286H22.2283C22.6982 24.5286 23.1488 24.3419 23.4811 24.0097C23.8133 23.6774 24 23.2268 24 22.7569V2.30023C24 1.83036 23.8133 1.37973 23.4811 1.04747C23.1488 0.715222 22.6982 0.528564 22.2283 0.528564ZM7.15333 20.9736H3.545V9.5119H7.15333V20.9736ZM5.34667 7.92356C4.93736 7.92126 4.53792 7.79776 4.19873 7.56865C3.85955 7.33954 3.59584 7.0151 3.44088 6.63625C3.28591 6.25741 3.24665 5.84116 3.32803 5.44002C3.40941 5.03888 3.6078 4.67084 3.89816 4.38235C4.18851 4.09385 4.55782 3.89783 4.95947 3.81903C5.36112 3.74022 5.77711 3.78216 6.15495 3.93955C6.53279 4.09694 6.85554 4.36273 7.08247 4.70338C7.30939 5.04402 7.43032 5.44426 7.43 5.85357C7.43386 6.1276 7.38251 6.3996 7.27901 6.65337C7.17551 6.90713 7.02198 7.13746 6.82757 7.33063C6.63316 7.5238 6.40185 7.67585 6.14742 7.77772C5.893 7.87958 5.62067 7.92919 5.34667 7.92356ZM20.4533 20.9836H16.8467V14.7219C16.8467 12.8752 16.0617 12.3052 15.0483 12.3052C13.9783 12.3052 12.9283 13.1119 12.9283 14.7686V20.9836H9.32V9.52023H12.79V11.1086H12.8367C13.185 10.4036 14.405 9.19857 16.2667 9.19857C18.28 9.19857 20.455 10.3936 20.455 13.8936L20.4533 20.9836Z"
                              fill="#fff"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_749_992">
                              <rect
                                width="24"
                                height="24"
                                fill="white"
                                transform="translate(0 0.528564)"
                              />
                            </clipPath>
                          </defs>
                        </svg>
                      </a>

                      <a
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#d7d7fc] transition-colors"
                        href="https://www.youtube.com/@OmniShare-ai"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 25 25"
                          fill="none"
                        >
                          <g clipPath="url(#clip0_367_3138)">
                            <path
                              d="M24.3859 7.32871C24.3859 7.32871 24.1516 5.67402 23.4297 4.94746C22.5156 3.99121 21.4938 3.98652 21.025 3.93027C17.6688 3.68652 12.6297 3.68652 12.6297 3.68652H12.6203C12.6203 3.68652 7.58125 3.68652 4.225 3.93027C3.75625 3.98652 2.73438 3.99121 1.82031 4.94746C1.09844 5.67402 0.86875 7.32871 0.86875 7.32871C0.86875 7.32871 0.625 9.27402 0.625 11.2146V13.0334C0.625 14.974 0.864062 16.9193 0.864062 16.9193C0.864062 16.9193 1.09844 18.574 1.81562 19.3006C2.72969 20.2568 3.92969 20.224 4.46406 20.3271C6.38594 20.51 12.625 20.5662 12.625 20.5662C12.625 20.5662 17.6688 20.5568 21.025 20.3178C21.4938 20.2615 22.5156 20.2568 23.4297 19.3006C24.1516 18.574 24.3859 16.9193 24.3859 16.9193C24.3859 16.9193 24.625 14.9787 24.625 13.0334V11.2146C24.625 9.27402 24.3859 7.32871 24.3859 7.32871ZM10.1453 15.2412V8.4959L16.6281 11.8803L10.1453 15.2412Z"
                              fill="#fff"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_367_3138">
                              <rect
                                width="24"
                                height="24"
                                fill="white"
                                transform="translate(0.625 0.128662)"
                              />
                            </clipPath>
                          </defs>
                        </svg>
                      </a>

                      <a
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#d7d7fc] transition-colors"
                        href="https://www.tiktok.com/@omnishare.ai?is_from_webapp=1&sender_device=pc"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <g clipPath="url(#clip0_tiktok)">
                            <path
                              d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.68v12.7a2.85 2.85 0 1 1-5.92-2.86 2.85 2.85 0 0 1 2.31 1.09V9.4a6.53 6.53 0 1 0 5.63 5.63V8.13a8.34 8.34 0 0 0 5.81 2.32v-3.7a4.5 4.5 0 0 1-.54-.06z"
                              fill="#fff"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_tiktok">
                              <rect width="24" height="24" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </a>

                      <a
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#d7d7fc] transition-colors"
                        href="https://www.facebook.com/share/1H74CpLTCK/"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <g clipPath="url(#clip0_fb)">
                            <path
                              d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07813V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z"
                              fill="#fff"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_fb">
                              <rect width="24" height="24" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="text-white/80 text-center text-sm mt-1 py-1">
                  © 2025 Omni Share
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 w-full z-40 transition-all duration-500 ${
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
                <img
                  src={LogoWhiteText}
                  alt="Omnishare logo"
                  className="h-5"
                  decoding="async"
                  loading="lazy"
                />
              </span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {[t("home"), t("features"), t("faq2"), t("contact")].map(
                (section, index) => (
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
                )
              )}

              <LanguageDropdown alignRight={true} />

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
                {t("get_started")}
              </motion.button>
            </div>

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
        </div>
      </motion.nav>

      <section
        id="home"
        className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-gray-900"
      >
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={OmniVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        />

        <div className="absolute inset-0 z-0 pointer-events-none w-full h-full will-change-transform">
          <div className="absolute inset-0 bg-gradient-to-br bg-purple-900/70 to-transparent" />
        </div>

        <motion.div
          className="relative z-10 w-fit mx-auto px-4 sm:px-6 lg:px-[10%] text-center rounded-2xl will-change-transform"
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
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight  mx-auto"
          >
            {t("ai_social_media")}
            <br />
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
              className="bg-gradient-to-r from-white text-white bg-white bg-clip-text text-transparent"
            >
              {t("made_simple")}
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
            className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto "
          >
            {t("create_schedule_publish")}
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
                  url: "https://www.tiktok.com/@omnishare.ai",
                  index: 4,
                },
              ].map((icons) => (
                <motion.button
                  key={icons.index}
                  onClick={() => window.open(icons.url, "_blank")}
                  className="will-change-transform"
                  whileHover={{
                    scale: 1.3,
                    rotate: 10,
                    y: -5,
                    transition: { delay: 0 },
                  }}
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{
                    delay: isInitialMount.current ? 0.8 + icons.index * 0.1 : 0,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                >
                  <svg
                    className="md:w-10 md:h-10 w-7 h-7 text-white transition-colors"
                    viewBox="0 0 24 24"
                    fill="currentColor"
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
                  </svg>
                </motion.button>
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
            className="bg-white text-[#7650e3] px-6 py-3 rounded-full text-lg font-semibold shadow-2xl inline-flex items-center space-x-2"
            whileHover={{
              scale: 1.08,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
              y: -5,
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{t("get_started_free")}</span>

            <ChevronDown className="w-5 h-5" />
          </motion.button>
        </motion.div>

        <motion.div
          className="absolute bottom-16 flex justify-center left-0 right-0 transform "
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8 text-white" />
        </motion.div>
      </section>
      <motion.div
        id="features"
        initial={{ opacity: 0, y: 130 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-300px" }}
        transition={{ duration: 1.6, type: "spring", stiffness: 80 }}
      >
        <FeaturesPage />
      </motion.div>
      <TwoColumnSection />
      <TwoColumnSection2 />
      {/* Active Users Stats Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className=" max-w-full mx-auto px-4 sm:px-6 lg:px-[10%] w-full">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {[
              { icon: Users, end: 1000, suffix: "+", label: t("active_users") },
              {
                icon: TrendingUp,
                end: 99.9,
                suffix: "+",
                label: t("posts_created"),
              },
              {
                icon: Share2,
                end: 5,
                suffix: "",
                label: t("platforms_supported"),
              },
              { icon: Sparkles, end: 99.9, suffix: "%", label: t("uptime") },
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
                <div className="text-gray-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className=" bg-gray-50 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{ y: useTransform(smoothProgress, [0, 1], [0, -200]) }}
        >
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#7650e3] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#6366F1] rounded-full blur-3xl"></div>
        </motion.div>
      </section>

      <section id="video" className="py-20 bg-white relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{ y: useTransform(smoothProgress, [0.3, 0.6], [100, -100]) }}
        >
          <div className="absolute top-40 right-20 w-80 h-80 bg-[#7650e3] rounded-full blur-3xl"></div>
        </motion.div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t("see_action")}
            </h2>
            <p className="text-xl text-gray-500 font-medium">
              {t("see_action_message")}
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
            <video
              src={IntroVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%23111827' width='1920' height='1080'/%3E%3C/svg%3E"
              className="absolute inset-0 w-full h-full object-cover"
            />

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
              {t("loved_creators")}
            </h2>
            <p className="text-xl text-gray-500 font-medium">
              {t("loved_creators_message")}
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

                <p className="text-xl md:text-2xl text-black text-center mb-8 leading-relaxed italic">
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
              <ChevronLeft className="w-6 h-6 text-black" />
            </motion.button>

            <motion.button
              onClick={nextReview}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white rounded-full p-3 shadow-xl"
              aria-label="Next review"
            >
              <ChevronRight className="w-6 h-6 text-black" />
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
              {t("faq")}
            </h2>
            <p className="text-xl text-gray-500 font-medium">
              {t("faq_message")}
            </p>
          </motion.div>

          {/* ---------------- FIXED FAQ LOOP ---------------- */}
          <motion.div
            className="space-y-4"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {displayedFaqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-md shadow-md overflow-hidden transition-all hover:shadow-lg"
                whileHover={{ x: 5 }}
              >
                <button
                  onClick={() =>
                    setExpandedFaqIndex(
                      expandedFaqIndex === index ? null : index
                    )
                  }
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  aria-expanded={expandedFaqIndex === index}
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
                    <ChevronDown className="w-6 h-6 text-[#7650e3]" />
                  </motion.div>
                </button>

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

          <div className="mt-6 text-center">
            <motion.button
              onClick={() => {
                if (visibleCount > 6) {
                  setVisibleCount(6);
                  setExpandedFaqIndex(null); // Critical!
                } else {
                  setVisibleCount(faqs.length);
                }
              }}
              className="bg-[#7650e3] text-white px-8 py-3 rounded-full shadow-lg inline-flex items-center space-x-2"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 30px rgba(118, 80, 227, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              {visibleCount === 6 ? t("Load More") : t("Show Less")}
              <motion.div
                animate={{ rotate: visibleCount === faqs.length ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t("contact_us")}
            </h2>
            <p className="text-xl text-gray-500 font-medium mb-5">
              {t("contact_us_message")}
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
              <span>
                {showContactForm ? t("hide_form") : t("get_in_touch")}
              </span>
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
                onSubmit={handleSubmit(onSubmit)} // ❗ remove onError here
                className="space-y-6 pt-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, type: "spring" }}
                  >
                    <label className="block text-sm font-semibold text-black mb-2">
                      {t("first_name")}
                    </label>
                    <input
                      {...register("firstName")}
                      type="text"
                      className="w-full px-4 py-2.5 border border-purple-600 rounded-md focus-visible:ring-0 focus:ring-0 transition-all"
                      placeholder={t("first_name")}
                    />

                    {/* ❗ Zod Error Here */}
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.firstName.message}
                      </p>
                    )}
                  </motion.div>

                  {/* Last Name */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, type: "spring" }}
                  >
                    <label className="block text-sm font-semibold text-black mb-2">
                      {t("last_name")}
                    </label>
                    <input
                      {...register("lastName")}
                      type="text"
                      className="w-full px-4 py-2.5 border border-purple-600 rounded-md focus-visible:ring-0 focus:ring-0 transition-all"
                      placeholder={t("last_name")}
                    />

                    {/* ❗ Zod Error Here */}
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lastName.message}
                      </p>
                    )}
                  </motion.div>
                </div>

                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <label className="block text-sm font-semibold text-black mb-2">
                    {t("email")}
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full px-4 py-2.5 border border-purple-600 rounded-md focus-visible:ring-0 focus:ring-0 transition-all"
                    placeholder={t("email_address")}
                  />

                  {/* ❗ Zod Error Here */}
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </motion.div>

                {/* Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <label className="block text-sm font-semibold text-black mb-2">
                    {t("message")}
                  </label>
                  <textarea
                    {...register("message")}
                    rows={6}
                    className="w-full px-4 py-2.5 border border-purple-600 rounded-md focus-visible:ring-0 focus:ring-0 transition-all"
                    placeholder={t("message_placeholder")}
                  />

                  {/* ❗ Zod Error Here */}
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.message.message}
                    </p>
                  )}
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#7650e3] text-white py-3 rounded-md font-semibold text-lg shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 30px rgba(118, 80, 227, 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? "Sending..." : t("send_message")}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      <CommunitySignup />
      <div className="relative bg-theme-secondary ">
        <motion.footer
          className="w-full px-4 py-4 text-center text-sm theme-text-light"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="w-full mx-auto pt-2 md:px-[10%] px-3 flex flex-col sm:flex-row items-center md:justify-between gap-3">
            {/* LEFT SIDE: Copyright Text (Ab yeh pehla direct child hai) */}
            {/* sm:text-center class add ki taaki mobile par text center ho jaaye */}
            <div className="flex justify-center items-center text-sm sm:text-center">
              <span className="mb-2">
                © {new Date().getFullYear()} OMNISHARE
              </span>
            </div>

            {/* RIGHT SIDE: Links (Ab yeh doosra direct child hai) */}
            {/* is div ko flex-wrap kiya taaki agar links lambe hon to wrap ho jaayen aur mobile par center hon */}
            <div className="flex flex-wrap justify-center space-x-1 text-sm theme-text-light">
              <Link to="/privacy" className="transition-colors duration-200">
                Privacy Policy
              </Link>
              <span className="text-white/20">•</span>
              <Link to="/terms" className="transition-colors duration-200">
                Terms of Service
              </Link>
              <span className="text-white/20">•</span>
              <Link to="/support" className="transition-colors duration-200">
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
