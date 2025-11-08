import { useState, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import LogoWhiteText from "../assets/logo-white-text.svg";

function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null
  );
  const [showContactForm, setShowContactForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      question: "How does the AI content generation work?",
      answer:
        "Our advanced AI analyzes your brand voice, target audience, and platform-specific best practices to generate engaging, relevant content. You can customize the tone and style to match your preferences.",
    },
    {
      question: "Can I schedule posts for all platforms at once?",
      answer:
        "Yes! You can create one post and publish it across Facebook, Instagram, YouTube, LinkedIn, and TikTok simultaneously, or schedule them at different optimal times for each platform.",
    },
    {
      question:
        "What happens if I exceed my monthly post limit on the Basic plan?",
      answer:
        "You'll receive a notification when approaching your limit. You can either upgrade to Pro for unlimited posts or wait until your next billing cycle. No posts are automatically deleted.",
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer:
        "Absolutely. You can cancel anytime from your account settings. You'll retain access until the end of your current billing period, and no future charges will be made.",
    },
    {
      question: "Do you offer a free trial?",
      answer:
        "Yes! We offer a 14-day free trial with full access to all Pro features. No credit card required to start your trial.",
    },
    {
      question: "How secure is my social media data?",
      answer:
        "We use bank-level encryption and never store your social media passwords. All connections use OAuth 2.0, and we're fully GDPR and SOC 2 compliant.",
    },
  ];

  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrollY > 50 ? "bg-white shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 flex-row-reverse mds:flex-row">
            <div className="flex items-center space-x-2">
              <Icon
                name="logo-white"
                size={35}
                className={`ml-0 lg:ml-0 mt-1 lg:scale-105 ${
                  scrollY < 50 ? "" : ""
                }`}
              />
              <span
                className={`${
                  scrollY > 50 ? "text-[#000]" : "text-white"
                } text-2xl lg:text-[1.6rem] tracking-tight`}
              >
                <span className="theme-text-primary text-2xl lg:text-[1.6rem] tracking-tight">
                  <img src={LogoWhiteText} alt="Logo" className="h-5" />
                </span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("home")}
                className={`transition-colors hover:text-[#7650e3] ${
                  scrollY > 50 ? "text-gray-700" : "text-white"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className={`transition-colors hover:text-[#7650e3] ${
                  scrollY > 50 ? "text-gray-700" : "text-white"
                }`}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className={`transition-colors hover:text-[#7650e3] ${
                  scrollY > 50 ? "text-gray-700" : "text-white"
                }`}
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("video")}
                className={`transition-colors hover:text-[#7650e3] ${
                  scrollY > 50 ? "text-gray-700" : "text-white"
                }`}
              >
                Learn
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className={`transition-colors hover:text-[#7650e3] ${
                  scrollY > 50 ? "text-gray-700" : "text-white"
                }`}
              >
                Contact
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="bg-[#7650e3] text-white px-6 py-2 rounded-full hover:bg-[#633cd3] transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className={`md:hidden transition-colors ${
                scrollY > 50 ? "text-gray-900" : "text-white"
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button
                  onClick={() => scrollToSection("home")}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Pricing
                </button>
                <button
                  onClick={() => scrollToSection("video")}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Learn
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Contact
                </button>
                <button
                  onClick={() => navigate("/auth")}
                  className="block w-full text-left px-3 py-2 bg-blue-600 text-white hover:bg-blue-700"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

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

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          >
            AI-Powered Social Media
            <br />
            Made Simple
          </h1>
          <p
            className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
            style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          >
            Create, schedule, and publish stunning content across Facebook,
            Instagram, YouTube, LinkedIn, and TikTok - all from one powerful
            platform powered by AI.
          </p>

          <div
            className="flex flex-wrap items-center justify-center gap-6 mb-8"
            style={{ transform: `translateY(${scrollY * 0.17}px)` }}
          >
            <svg
              className="w-10 h-10 text-white/80 hover:text-white transition-colors"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <svg
              className="w-10 h-10 text-white/80 hover:text-white transition-colors"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <svg
              className="w-10 h-10 text-white/80 hover:text-white transition-colors"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <svg
              className="w-10 h-10 text-white/80 hover:text-white transition-colors"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            <svg
              className="w-10 h-10 text-white/80 hover:text-white transition-colors"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
            </svg>
          </div>

          <button
            onClick={() => navigate("/auth")}
            className="bg-white text-[#7650e3] px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#d7d7fc] transition-all transform hover:scale-105 shadow-2xl inline-flex items-center space-x-2"
            style={{ transform: `translateY(${scrollY * 0.2}px)` }}
          >
            <span>Get Started Free</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <ChevronDown className="w-8 h-8 text-white animate-bounce" />
        </div>
      </section>

      {/* Active Users Stats Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-[#7650e3] group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-[#000] mb-2">
                50K+
              </div>
              <div className="text-gray-600 font-medium">Active Users</div>
            </div>
            <div className="group">
              <div className="flex items-center justify-center mb-3">
                <TrendingUp className="w-8 h-8 text-[#7650e3] group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-[#000] mb-2">
                10M+
              </div>
              <div className="text-gray-600 font-medium">Posts Created</div>
            </div>
            <div className="group">
              <div className="flex items-center justify-center mb-3">
                <Share2 className="w-8 h-8 text-[#7650e3] group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-[#000] mb-2">
                5
              </div>
              <div className="text-gray-600 font-medium">
                Platforms Supported
              </div>
            </div>
            <div className="group">
              <div className="flex items-center justify-center mb-3">
                <Sparkles className="w-8 h-8 text-[#7650e3] group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-[#000] mb-2">
                99.9%
              </div>
              <div className="text-gray-600 font-medium">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 relative">
        <div
          className="absolute inset-0 opacity-5"
          style={{ transform: `translateY(${(scrollY - 600) * 0.3}px)` }}
        >
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#7650e3] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#6366F1] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to dominate social media marketing in one
              place
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {displayedFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="text-[#7650e3] mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="bg-[#7650e3] text-white px-8 py-3 rounded-full hover:bg-[#633cd3] transition-all transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
            >
              <span>{showAllFeatures ? "Show Less" : "View All Features"}</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  showAllFeatures ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section id="video" className="py-20 bg-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{ transform: `translateY(${(scrollY - 1200) * 0.2}px)` }}
        >
          <div className="absolute top-40 right-20 w-80 h-80 bg-[#7650e3] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              See Omnishare in Action
            </h2>
            <p className="text-xl text-gray-600">
              Watch how easy it is to create and schedule content across all
              platforms
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900 aspect-video">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#7650e3] to-[#6366F1]">
              <button className="bg-white rounded-full p-6 hover:scale-110 transition-transform shadow-2xl">
                <Play className="w-12 h-12 text-[#7650e3] ml-1" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-white text-lg font-semibold">
                Introduction to Omnishare
              </p>
              <p className="text-white/80">
                Learn how to maximize your social media presence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#7650e3] mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that's right for your business
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200 hover:border-[#7650e3] transition-all transform hover:scale-105">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-[#7650e3] mb-2">
                  Basic
                </h3>
                <p className="text-[#7650e3] mb-4">
                  Perfect for individuals and small teams
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-[#7650e3]">$29</span>
                  <span className="text-[#7650e3] ml-2">/month</span>
                </div>
              </div>
              <button
                onClick={() => (window.location.href = "/auth?plan=basic")}
                className="w-full bg-[#7650e3] text-white py-3 my-3 rounded-full hover:bg-[#7650e3)] transition-all font-semibold"
              >
                Get Started
              </button>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-[#7650e3]">
                    Up to 3 social media accounts
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-[#7650e3]">
                    30 AI-generated posts per month
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-[#7650e3]">
                    Basic analytics dashboard
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-[#7650e3]">
                    Schedule posts up to 1 week ahead
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-[#7650e3]">Email support</span>
                </li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-[#7650e3] to-[#6366F1] rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-all relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                  MOST POPULAR
                </span>
              </div>

              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <p className="text-white/90 mb-4">
                  For professionals and growing businesses
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-white">$79</span>
                  <span className="text-white/90 ml-2">/month</span>
                </div>
              </div>
              <button
                onClick={() => (window.location.href = "/auth?plan=pro")}
                className="w-full bg-white text-[#7650e3] py-3 my-3 rounded-full hover:bg-[#d7d7fc] transition-all font-semibold"
              >
                Get Started
              </button>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                  <span className="text-white">
                    Unlimited social media accounts
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                  <span className="text-white">
                    Unlimited AI-generated posts
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                  <span className="text-white">
                    Advanced analytics & insights
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                  <span className="text-white">
                    Schedule posts unlimited time ahead
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                  <span className="text-white">Priority 24/7 support</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                  <span className="text-white">Team collaboration tools</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                  <span className="text-white">
                    Custom branding & white-label
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-gradient-to-br from-[#d7d7fc] to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 bg-[#7650e3] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#6366F1] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Creators Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say about Omnishare
            </p>
          </div>

          <div className="relative pb-8">
            <div
              className={`bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-4xl mx-auto transition-all duration-300 ${
                slideDirection === "left"
                  ? "opacity-0 -translate-x-12"
                  : slideDirection === "right"
                  ? "opacity-0 translate-x-12"
                  : "opacity-100 translate-x-0"
              }`}
            >
              <div className="flex items-center justify-center mb-6">
                {[...Array(reviews[currentReviewIndex].rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              <p className="text-xl md:text-2xl text-gray-700 text-center mb-8 leading-relaxed italic">
                "{reviews[currentReviewIndex].text}"
              </p>

              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#7650e3] to-[#6366F1] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {reviews[currentReviewIndex].avatar}
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900 text-lg">
                    {reviews[currentReviewIndex].name}
                  </p>
                  <p className="text-gray-600">
                    {reviews[currentReviewIndex].role}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {reviews[currentReviewIndex].company}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={prevReview}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>

            <button
              onClick={nextReview}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110"
              aria-label="Next review"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {reviews.map((_, index) => (
              <button
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
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Have questions? We'd love to hear from you.
            </p>
            <button
              onClick={() => setShowContactForm(!showContactForm)}
              className="bg-[#7650e3] text-white px-8 py-3 rounded-full hover:bg-[#633cd3] transition-all transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
            >
              <span>{showContactForm ? "Hide Form" : "Get in Touch"}</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  showContactForm ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              showContactForm
                ? "max-h-[800px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <form className="space-y-6 pt-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7650e3] focus:border-transparent transition-all"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7650e3] focus:border-transparent transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7650e3] focus:border-transparent transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7650e3] focus:border-transparent transition-all"
                  placeholder="Tell us about your needs..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#7650e3] text-white py-4 rounded-md hover:bg-[#633cd3] transition-all font-semibold text-lg shadow-lg"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about Omnishare
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-md shadow-md overflow-hidden transition-all hover:shadow-lg"
              >
                <button
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
                  <ChevronDown
                    className={`w-6 h-6 text-[#7650e3] flex-shrink-0 transition-transform ${
                      expandedFaqIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaqIndex === index && (
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Still have questions? Scroll up to contact us.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="relative pt-16 bg-theme-secondary">
        <footer className="w-full px-4 py-4 text-center text-sm theme-text-light absolute bottom-0">
          <div className="max-w-full mx-auto flex md:flex-row items-center gap-2 md:justify-between justify-center flex-col">
            <span>© {new Date().getFullYear()} OMNISHARE</span>
            <div>
              <a href="/privacy" className="text-primary hover:underline">
                Privacy
              </a>
              &nbsp; | &nbsp;
              <a href="/terms" className="text-primary hover:underline">
                Terms
              </a>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default HomePage;
