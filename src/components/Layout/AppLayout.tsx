import React, { useState, useRef, useEffect } from "react";
import { ResizeContext } from "../../context/ResizeContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  PenTool,
  Calendar,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Target,
  LogOut,
  User,
  Building2,
  History,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Plus,
  HistoryIcon,
  Coins,
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { useLoading } from "../../context/LoadingContext";
import { useSubscriptionModal } from "../../context/SubscriptionModalContext";
import { NotificationCenter } from "../NotificationCenter";
import { ThemeSelector } from "../ThemeSelector";
import { useTheme } from "../../hooks/useTheme";
import { useUnreadPosts } from "../../hooks/useUnreadPosts";
import Icon from "../Icon";
import { WalletBalance } from "../WalletBalance";
import PreloaderOverlay from "../PreloaderOverlay";
import { ManageSubscriptionModal } from "../ManageSubscriptionModal";
import { ContentTemplate } from "./../../lib/postHistoryService";
import API from "@/services/api";
import logoText from "../../assets/logo-text.svg";
import LogoWhiteText from "../../assets/logo-white-text.svg";

// Define the props for AppLayout
interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout, balance } = useAppContext();

  console.log(user);
  const { loadingState } = useLoading();
  const { unreadCount, markAllAsRead: markAllUnreadAsRead } = useUnreadPosts();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const {
    showManageSubscription,
    openManageSubscription,
    closeManageSubscription,
  } = useSubscriptionModal();
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/auth");
    setShowUserMenu(false);
  };
  const handleResizeMainToFullScreen = (isFullScreen: boolean) => {
    //use MainContentRef
    const mainContent = mainContentRef.current;

    if (mainContent && isFullScreen) {
      mainContent.style.position = "fixed";
      mainContent.style.top = "0";
      mainContent.style.left = "0";
      mainContent.style.right = "0";
      mainContent.style.bottom = "0";
      mainContent.style.height = "98vh";
      mainContent.style.zIndex = "1000";
    }
    if (mainContent && !isFullScreen) {
      mainContent.style = "";
    }
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await markAllUnreadAsRead();
    } catch (error) {
      console.error("Error marking all posts as read:", error);
    }
  };

  const navigation = [
    { name: "Profile", path: "/profile", icon: User },
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Create Content", path: "/content", icon: Plus },
    { name: "Accounts", path: "/accounts", icon: Building2 },
    { name: "History", path: "/history", icon: History },
    { name: "Pricing Plan", path: "/pricing", icon: CreditCard },
    // {
    //   name: "Transaction History",
    //   path: "/transaction-history",
    //   icon: HistoryIcon,
    // },
    // { name: "Generate Amount", path: "/generate-amount", icon: Coins },
  ];
  const [showPackage, setShowPackage] = useState(false);
  const [isCanceled, setIsCanceled] = useState(false);
  const cancelSubscription = async () => {
    // alert("cancel")

    // alert box to accept cancelation
    if (window.confirm("Are you sure you want to cancel your subscription?")) {
      cancelSubscription();
    }

    try {
      setIsCanceled(true);
      await API.cancelPackage();
      window.location.reload();
    } catch (error) {
    } finally {
      setIsCanceled(false);
    }
  };
  const reactivateSubscription = async () => {
    try {
      setIsCanceled(true);
      await API.reactivatePackage();
      window.location.reload();
    } catch (error) {
    } finally {
      setIsCanceled(false);
    }
  };
  return (
    <ResizeContext.Provider value={{ handleResizeMainToFullScreen }}>
      <div className="h-full-dec-hf x-2 relative">
        <div className="relative z-10">
          <div
            className={`fixed inset-y-0 left-0 z-50 w-full md:w-[17%] theme-bg-trinary border-r border-white/10 transform ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            } transition-transform duration-300 ease-in-out`}
          >
            {/* Close button */}
            <div className="flex items-center justify-between border-b border-white/20 p-2 py-3 ">
              <span className="flex items-center">
                <Icon
                  name="spiral-logo"
                  className="ml-2 brightness-[200]"
                  size={38}
                />
                <span className="theme-text-primary text-2xl lg:text-[1.6rem] tracking-tight ml-3">
                  <img src={LogoWhiteText} alt="Logo" className="h-4" />
                </span>
              </span>
              {/* complete profile warning  */}
              {/* <button
                onClick={() => navigate("/profile")}
                className="mr-auto px-3 py-1 theme-bg-pantary hover:bg-purple-700 text-white rounded-md text-md font-medium transition-all animate-pulse"
              >
                complete your profile for better experience
              </button> */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md theme-text-light hover:theme-text-primary mr-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User Profile Section */}
            <div
              className="border-b border-white/20 relative"
              ref={userMenuRef}
            >
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 mb-0 w-full hover:theme-bg-secondary rounded-md p-2 pl-4 transition-colors"
              >
                <img
                  className="h-10 w-10 rounded-full object-cover border-2 border-white/30 theme-bg-trinary"
                  src={
                    user?.avatarUrl
                      ? user?.avatarUrl
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user?.profile?.fullName || user?.email || "User"
                        )}&background=00000000&color=fff`
                  }
                  alt={user?.profile?.fullName}
                />
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-md font-medium theme-text-light truncate">
                    {user?.profile?.fullName || user?.email || "User"}
                  </div>
                  <div className="text-sm theme-text-light truncate">
                    {user?.email}
                  </div>
                </div>
                <div className="theme-text-light ">
                  {showUserMenu ? (
                    <ChevronUp size={40} className="w-8 h-8" />
                  ) : (
                    <ChevronDown size={40} className="w-8 h-8" />
                  )}
                </div>
              </button>

              {/* User Menu Dropdown - Themed Style */}
              {
                <div
                  className={`w-full theme-bg-pantary border border-white/30 shadow-2xl z-50 overflow-hidden transition-all duration-500
                  ${
                    showUserMenu
                      ? " max-h-96 opacity-100"
                      : " max-h-0 opacity-0"
                  }
                `}
                  style={{ pointerEvents: showUserMenu ? "auto" : "none" }}
                >
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm theme-text-light capitalize opacity-70 truncate">
                          {user.wallet.package.tier} Plan
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      to="/settings"
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="group flex items-center px-4 py-3 text-md theme-text-light hover:theme-bg-secondary hover:theme-text-primary transition-all duration-150 ease-in-out"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg theme-bg-trinary group-hover:theme-bg-primary mr-3 transition-colors duration-150">
                        <Settings className="h-5 w-5 theme-text-light group-hover:theme-text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Settings</p>
                        <p className="text-sm theme-text-light opacity-70">
                          Manage your account
                        </p>
                      </div>
                    </Link>
                    {/* Divider */}
                    <div className="my-2 border-t border-white/20"></div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="group flex items-center w-full px-4 py-3 text-md theme-text-light transition-all duration-150 ease-in-out text-left"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg theme-bg-trinary mr-3 transition-colors duration-150">
                        <LogOut className="h-5 w-5 theme-text-light" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Logout</p>
                        <p className="text-sm theme-text-light opacity-70">
                          Logout of your account
                        </p>
                      </div>
                    </button>
                  </div>
                  {/* Email Footer */}
                  {/* <div className="px-4 py-3 border-t border-white/20">
                  <p className="text-xs theme-text-light  truncate text-center">
                    {user?.email}
                  </p>
                </div> */}
                </div>
              }
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                const showBadge = item.name === "History" && unreadCount > 0;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2 text-md font-medium rounded-md transition-colors ${
                      isActive
                        ? "theme-bg-primary theme-text-secondary"
                        : "theme-text-light hover:theme-bg-secondary hover:theme-text-primary"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Icon size={20} className="mr-3" />
                      {item.name}
                    </div>
                    {showBadge && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="h-6 w-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-xs text-white font-bold transition-colors duration-200 cursor-pointer border-0 outline-none"
                        title={`Mark all ${unreadCount} unread posts as read`}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </button>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 ">
              <div className="w-full mx-auto p-2">
                <div className="text-center flex flex-col items-center justify-center">
                  <div className="theme-text-light text-sm mb-1">
                    © 2025 Omni Share
                  </div>
                  <div className="flex justify-center space-x-1 text-sm theme-text-light mb-1">
                    <Link
                      to="/privacy"
                      className="hover:theme-text-primary transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Privacy Policy
                    </Link>
                    <span className="text-white/20">•</span>
                    <a
                      href="#"
                      className="hover:theme-text-primary transition-colors duration-200"
                    >
                      Terms of Service
                    </a>
                    <span className="text-white/20">•</span>
                    <a
                      href="#"
                      className="hover:theme-text-primary transition-colors duration-200"
                    >
                      Support
                    </a>
                  </div>
                  <div className="flex justify-center space-x-1 text-xs theme-text-light w-full">
                    {/* social media links icons */}
                    <div className="text-tertiary-foreground flex flex-row justify-between gap-1.5 px-5 py-2 w-full">
                      <a
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-secondary-foreground transition-colors"
                        href="#"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 25 25"
                          fill="none"
                        >
                          <g clip-path="url(#clip0_367_3134)">
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
                        className="hover:text-secondary-foreground transition-colors"
                        href="#"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 25"
                          fill="none"
                        >
                          <g clip-path="url(#clip0_749_992)">
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
                        className="hover:text-secondary-foreground transition-colors"
                        href="#"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="25"
                          height="25"
                          viewBox="0 0 25 25"
                          fill="none"
                        >
                          <g clip-path="url(#clip0_367_3138)">
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
                        className="hover:text-secondary-foreground transition-colors"
                        href="#"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                        >
                          <path
                            d="M18.3263 1.90393H21.6998L14.3297 10.3274L23 21.7899H16.2112L10.894 14.838L4.80993 21.7899H1.43442L9.31742 12.78L0.999985 1.90393H7.96109L12.7674 8.25826L18.3263 1.90393ZM17.1423 19.7707H19.0116L6.94538 3.81706H4.93945L17.1423 19.7707Z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      </a>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-secondary-foreground transition-colors"
                        href="#"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                        >
                          <path
                            d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07813V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Top Navigation */}
          <div className="sticky top-0 z-10 backdrop-blur-lg border-b border-white/20 md:px-4 md:py-2 md:pb-2 px-2">
            <div className="relative flex items-center justify-between mt-0 pb-2 ">
              {/* Left: Mobile menu button */}
              <div className="flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className=" rounded-md theme-text-primary hover:theme-text-secondary relative"
                >
                  <Menu className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
              </div>

              <Link to="/profile" className="theme-text-primary text-2xl  ml-2">
                <img src={logoText} alt="Logo" className="h-4" />
              </Link>

              {/* Right Side */}
              <div className="flex items-center space-x-1">
                {/* Theme Selector */}
                {/* <ThemeSelector /> */}

                {/* Notifications */}
                {/* <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 theme-text-primary hover:theme-text-secondary relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                    3
                  </span>
                </button>
                {showNotifications && (
                  <NotificationCenter
                    onClose={() => setShowNotifications(false)}
                    userId={user?.id}
                  />
                )}
              </div> */}
                <div className="flex gap-x-4 items-center">
                  <WalletBalance
                    setShowPackage={() => setShowPackage(!showPackage)}
                    balance={balance.toLocaleString()}
                  />

                  {showPackage && (
                    <div
                      className="absolute left-0 right-0 lg:left-auto top-4 mt-6 rounded-2xl shadow-xl p-6 border lg:w-[400px] w-full"
                      style={{
                        backgroundColor: "#F9F8FB",
                        borderColor: "#F1F0F4",
                      }}
                    >
                      {user?.wallet?.package ? (
                        <>
                          {/* Header */}
                          <div className="flex justify-between items-start ">
                            <div className="flex items-center gap-2">
                              {/* Diamond icon */}
                              <Icon name="crown" size={24} />
                              <h2 className="text-base font-semibold text-gray-800">
                                My Plan
                              </h2>
                              <span
                                className="text-gray-400 cursor-pointer text-xs"
                                title="Current subscription details"
                              >
                                <Icon name="question-mark" size={18} />
                              </span>
                            </div>

                            <span
                              className="text-base font-semibold uppercase"
                              style={{ color: "#7650e3" }}
                            >
                              {user.wallet?.package?.name || "FREE"}
                            </span>
                          </div>

                          {/* Renewal info */}
                          <p className="text-sm text-gray-700 mb-4 ml-8 font-medium mt-[-1px] ">
                            Renewing on:{" "}
                            <span className="text-gray-700 font-medium">
                              {user.wallet.expiresAt
                                ? new Date(
                                    user.wallet.expiresAt
                                  ).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "N/A"}
                            </span>
                          </p>

                          <div className="md:space-y-6 space-y-4 mb-5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-gray-800 text-md font-medium">
                                <Icon name="spiral-logo" className="mr-1" />
                                Omni Coins
                                <span
                                  className="text-gray-400 text-xs cursor-pointer"
                                  title="Coins info"
                                >
                                  <Icon name="question-mark" size={18} />
                                </span>
                              </div>
                              <p
                                className="text-base font-semibold"
                                style={{ color: "#7650e3" }}
                              >
                                {user.wallet.coins.toLocaleString() ?? 0}/{" "}
                                {user.wallet.package.coinLimit.toLocaleString()}
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-md text-gray-800 font-medium ">
                                <Icon
                                  name="share"
                                  className="scale-[0.8] mr-1"
                                />
                                Referral Coins
                                <span
                                  className="text-gray-400 text-xs cursor-pointer"
                                  title="Referral info"
                                >
                                  <Icon name="question-mark" size={18} />
                                </span>
                              </div>
                              <p
                                className="text-base font-semibold"
                                style={{ color: "#7650e3" }}
                              >
                                0
                              </p>
                            </div>
                          </div>

                          {/* Buttons */}
                          <button
                            onClick={() => openManageSubscription()}
                            className="w-full py-2 text-md font-semibold rounded-lg border flex items-center justify-center gap-2 transition  hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3]"
                            style={{ borderColor: "#7650e3", color: "#7650e3" }}
                          >
                            <Icon
                              name="manage-subs"
                              size={20}
                              className="filter-omni"
                            />
                            Manage Subscription
                          </button>

                          <Link
                            to="/pricing"
                            onClick={() => setShowPackage(false)}
                            className="w-full mt-3 p-2 text-md font-semibold rounded-lg flex items-center justify-center gap-2  text-white bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] border upgrade"
                          >
                            <div className="hover:filter-omni h-full w-full text-center">
                              <Icon
                                name="white-diamond"
                                size={20}
                                className="mr-2"
                              />
                              Upgrade
                            </div>
                          </Link>
                        </>
                      ) : (
                        <p className="text-gray-500 text-md text-center">
                          No active package found
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main
            id="mainContent"
            ref={mainContentRef}
            className="py-0 h-full-dec-hf overflow-auto theme-bg-card lg:px-[17%] md:px-[10%]"
          >
            <div className="w-full mx-auto sm:px-0 lg:px-0 overflow-fit">
              <div className="p-0">{children}</div>
            </div>
          </main>

          {/* Footer */}
        </div>

        <ManageSubscriptionModal
          isOpen={showManageSubscription}
          onClose={closeManageSubscription}
          onUpdatePayment={() => {
            setShowPackage(false);
            closeManageSubscription();
            navigate("/billing");
          }}
          onViewInvoices={() => {
            setShowPackage(false);
            closeManageSubscription();
            navigate("/invoices");
          }}
          onCancelSubscription={() => {
            closeManageSubscription();
            try {
              (cancelSubscription as any) && cancelSubscription();
            } catch (e) {
              console.error("cancelSubscription not available", e);
            }
          }}
          onAddCoins={() => {
            setShowPackage(false);
            closeManageSubscription();
            navigate("/wallet");
          }}
        />
        <PreloaderOverlay loadingState={loadingState} />
      </div>
    </ResizeContext.Provider>
  );
};
