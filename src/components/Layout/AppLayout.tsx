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
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { useLoading } from "../../context/LoadingContext";
import { NotificationCenter } from "../NotificationCenter";
import { ThemeSelector } from "../ThemeSelector";
import { useTheme } from "../../hooks/useTheme";
import { useUnreadPosts } from "../../hooks/useUnreadPosts";
import Icon from "../Icon";
import { WalletBalance } from "../WalletBalance";
import PreloaderOverlay from "../PreloaderOverlay";

// Define the props for AppLayout
interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAppContext();
  const { loadingState } = useLoading();
  const { currentTheme } = useTheme();
  const { unreadCount, markAllAsRead: markAllUnreadAsRead } = useUnreadPosts();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);

  // Close notification center when clicking outside
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
  const handleResizeMainToFullScreen= (isFullScreen: boolean) => {
  //use MainContentRef
    const mainContent = mainContentRef.current;

    if (mainContent && isFullScreen) {
      mainContent.style.position = 'fixed'; 
      mainContent.style.top = '0';
      mainContent.style.left = '0';
      mainContent.style.right = '0';
      mainContent.style.bottom = '0';
      mainContent.style.height = '98vh';
      mainContent.style.zIndex = '1000';
    }
    if (mainContent && !isFullScreen) {
      mainContent.style='';
    }

  }


  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      // API call to mark all as read
      const response = await fetch('/api/post-history/history/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local unread count immediately
        markAllUnreadAsRead();
        console.log('📚 All posts marked as read from sidebar badge');
      }
    } catch (error) {
      console.error('Error marking all posts as read:', error);
    }
  };

  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Create Content", path: "/content", icon: Plus },
    { name: "Accounts", path: "/accounts", icon: Building2 },
    { name: "History", path: "/history", icon: History },
    { name: "Pricing Plan", path: "/pricing", icon: CreditCard },
    // { name: "Campaigns", path: "/campaigns", icon: Target },
    // { name: "Schedule", path: "/schedule", icon: Calendar },
    // { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <ResizeContext.Provider value={{ handleResizeMainToFullScreen }}>
      <div className="h-full-dec-hf x-2 relative">
      {/* Themed Background */}


      <div className="relative z-10">
        <div
          className={`fixed inset-y-0 left-0 z-50 w-full md:w-[20%] theme-bg-trinary border-r border-white/10 transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            } transition-transform duration-300 ease-in-out`}
        >
          {/* Close button */}
          <div className="flex items-center justify-end border-b border-white/20 p-2">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-md theme-text-light hover:theme-text-primary"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Profile Section */}
          <div className="border-b border-white/20 relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 mb-1 w-full hover:theme-bg-secondary rounded-md p-2 transition-colors"
            >
              <img
                className="h-10 w-10 rounded-full object-cover border-2 border-white/30 theme-bg-trinary"
                src={
                  user?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.name || user?.email || "User")}&background=00000000&color=fff`
                }
                alt=""
              />
              <div className="flex-1 min-w-0 text-left">
                <div className="text-md font-medium theme-text-light truncate">
                  {user?.user_metadata?.name || user?.email || "User"}
                </div>
                <div className="text-sm theme-text-light truncate">{user?.email}</div>
              </div>
              <div className="theme-text-light">
                {showUserMenu ? (
                  <ChevronUp size={40} className="w-8 h-8" />
                ) : (
                  <ChevronDown size={40} className="w-8 h-8" />
                )}
              </div>
            </button>

            {/* User Menu Dropdown - Themed Style */}
            {(
              <div
                className={`w-full theme-bg-pantary border border-white/30 shadow-2xl z-50 overflow-hidden transition-all duration-500
                  ${showUserMenu ? " max-h-96 opacity-100" : " max-h-0 opacity-0"}
                `}
                style={{ pointerEvents: showUserMenu ? "auto" : "none" }}
              >
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs theme-text-light opacity-70 truncate">
                        {user?.subscription_tier || user?.tier || "Free Tier"}
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
                      <p className="text-xs theme-text-light opacity-70">Manage your account</p>
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
                      <p className="text-xs theme-text-light opacity-70">Logout of your account</p>
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
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              const showBadge = item.name === 'History' && unreadCount > 0;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2 text-md font-medium rounded-md transition-colors ${isActive
                    ? "theme-bg-primary theme-text-secondary"
                    : "theme-text-light hover:theme-bg-secondary hover:theme-text-primary"
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                  {showBadge && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="h-6 w-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-xs text-white font-bold transition-colors duration-200 cursor-pointer border-0 outline-none"
                      title={`Mark all ${unreadCount} unread posts as read`}
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </button>
                  )}
                </Link>
              );
            })}

          </nav>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="w-full mx-auto p-2">
              <div className="text-center flex flex-col items-center justify-center">
                <div className="theme-text-light text-sm mb-1">
                  © 2025 OMNI SHARE
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
                    <div className="text-tertiary-foreground flex flex-row justify-between gap-1.5 px-5 py-2 w-full" >
                      <a target="_blank" rel="noreferrer" className="hover:text-secondary-foreground transition-colors" href="#">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><path d="M6.61987 12.7782C6.77597 15.9737 7.85824 19.2315 9.7418 22.1262C5.32948 21.1509 1.96822 17.3847 1.62481 12.7782H6.61987ZM9.7418 1.87381C5.32948 2.84908 1.96822 6.61529 1.62481 11.2219H6.61987C6.77597 8.02631 7.85824 4.76849 9.7418 1.87381ZM12.2081 1.62482H11.7919L11.4797 2.07094C9.50247 4.87225 8.34734 8.08856 8.18084 11.2219H15.8192C15.6527 8.08856 14.4975 4.87225 12.5203 2.07094L12.2081 1.62482ZM8.18084 12.7782C8.34734 15.9115 9.50247 19.1278 11.4797 21.9291L11.7919 22.3752H12.2081L12.5203 21.9291C14.4975 19.1278 15.6527 15.9115 15.8192 12.7782H8.18084ZM17.3801 12.7782C17.224 15.9737 16.1418 19.2315 14.2582 22.1262C18.6705 21.1509 22.0318 17.3847 22.3752 12.7782H17.3801ZM22.3752 11.2219C22.0318 6.61529 18.6705 2.84908 14.2582 1.87381C16.1418 4.76849 17.224 8.02631 17.3801 11.2219H22.3752Z" fill="currentColor"></path></svg></a><a target="_blank" rel="noreferrer" className="hover:text-secondary-foreground transition-colors" href="#"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><path d="M20.317 4.15557C18.7874 3.45369 17.147 2.93658 15.4319 2.6404C15.4007 2.63469 15.3695 2.64897 15.3534 2.67754C15.1424 3.05276 14.9088 3.54226 14.7451 3.927C12.9004 3.65083 11.0652 3.65083 9.25835 3.927C9.09468 3.5337 8.85252 3.05276 8.64061 2.67754C8.62452 2.64992 8.59332 2.63564 8.56208 2.6404C6.84794 2.93563 5.20759 3.45275 3.67697 4.15557C3.66372 4.16129 3.65236 4.17082 3.64482 4.18319C0.533422 8.83155 -0.31892 13.3657 0.0992106 17.8436C0.101103 17.8655 0.1134 17.8864 0.130429 17.8997C2.18324 19.4073 4.17174 20.3225 6.12331 20.9291C6.15454 20.9386 6.18764 20.9272 6.20751 20.9015C6.66916 20.2711 7.08067 19.6063 7.43351 18.9073C7.45433 18.8664 7.43445 18.8178 7.3919 18.8016C6.73916 18.554 6.11763 18.2521 5.51976 17.9093C5.47247 17.8816 5.46868 17.814 5.51219 17.7816C5.638 17.6874 5.76385 17.5893 5.88399 17.4902C5.90572 17.4721 5.93601 17.4683 5.96156 17.4797C9.88932 19.273 14.1416 19.273 18.023 17.4797C18.0485 17.4674 18.0788 17.4712 18.1015 17.4893C18.2217 17.5883 18.3475 17.6874 18.4743 17.7816C18.5178 17.814 18.5149 17.8816 18.4676 17.9093C17.8698 18.2588 17.2482 18.554 16.5945 18.8006C16.552 18.8168 16.5331 18.8664 16.5539 18.9073C16.9143 19.6054 17.3258 20.2701 17.7789 20.9005C17.7979 20.9272 17.8319 20.9386 17.8631 20.9291C19.8242 20.3225 21.8127 19.4073 23.8655 17.8997C23.8834 17.8864 23.8948 17.8664 23.8967 17.8445C24.3971 12.6676 23.0585 8.17064 20.3482 4.18414C20.3416 4.17082 20.3303 4.16129 20.317 4.15557ZM8.02005 15.117C6.83753 15.117 5.86316 14.0313 5.86316 12.6981C5.86316 11.3648 6.81863 10.2791 8.02005 10.2791C9.2309 10.2791 10.1958 11.3743 10.1769 12.6981C10.1769 14.0313 9.22144 15.117 8.02005 15.117ZM15.9948 15.117C14.8123 15.117 13.8379 14.0313 13.8379 12.6981C13.8379 11.3648 14.7934 10.2791 15.9948 10.2791C17.2057 10.2791 18.1706 11.3743 18.1517 12.6981C18.1517 14.0313 17.2057 15.117 15.9948 15.117Z" fill="currentColor"></path></svg></a><a target="_blank" rel="noreferrer" className="hover:text-secondary-foreground transition-colors" href="#"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><path d="M12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0ZM17.0107 4.74414C16.5195 4.74414 16.0979 5.0243 15.9014 5.44531L12.9961 4.82812C12.912 4.8142 12.8279 4.82808 12.7578 4.87012C12.6877 4.91221 12.6452 4.98227 12.6172 5.06641L11.7334 9.24902C9.86673 9.30516 8.19628 9.85309 6.98926 10.7373C6.68049 10.4426 6.24538 10.2451 5.78223 10.2451C4.81392 10.2453 4.02832 11.0317 4.02832 12C4.02833 12.7156 4.44908 13.3188 5.06641 13.5996C5.03834 13.768 5.02441 13.9513 5.02441 14.1338C5.02478 16.8283 8.15486 19.0039 12.0283 19.0039C15.9017 19.0038 19.0309 16.8283 19.0312 14.1338C19.0312 13.9514 19.0173 13.7826 18.9893 13.6143C19.5647 13.3336 20 12.7158 20 12C20 11.0317 19.2143 10.2454 18.2461 10.2451C17.7689 10.2451 17.3478 10.4285 17.0391 10.7373C15.8461 9.88121 14.1897 9.31925 12.3652 9.24902L13.165 5.50195L15.7617 6.04883C15.7898 6.70848 16.3371 7.24219 17.0107 7.24219C17.6983 7.24209 18.2597 6.68073 18.2598 5.99316C18.2598 5.30551 17.6984 4.74424 17.0107 4.74414ZM14.54 16.084C14.6664 15.9577 14.8776 15.9577 15.0039 16.084C15.1021 16.2242 15.1016 16.4206 14.9756 16.5469C14.1194 17.403 12.4909 17.46 12.0137 17.46C11.536 17.4599 9.89461 17.3887 9.05273 16.5469C8.92662 16.4205 8.92649 16.2102 9.05273 16.084C9.179 15.9579 9.38933 15.9579 9.51562 16.084C10.049 16.6173 11.2002 16.8145 12.0283 16.8145C12.8563 16.8144 13.9927 16.6172 14.54 16.084ZM9.24902 12C9.93672 12 10.498 12.5613 10.498 13.249C10.498 13.9367 9.93674 14.498 9.24902 14.498C8.56136 14.498 8 13.9367 8 13.249C8.00004 12.5614 8.56139 12.0001 9.24902 12ZM14.751 12C15.4386 12 16 12.5614 16 13.249C16 13.9367 15.4387 14.498 14.751 14.498C14.0633 14.498 13.502 13.9367 13.502 13.249C13.502 12.5613 14.0633 12 14.751 12Z" fill="currentColor"></path></svg></a><a target="_blank" rel="noreferrer" className="hover:text-secondary-foreground transition-colors" href="#"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><path d="M18.3263 1.90393H21.6998L14.3297 10.3274L23 21.7899H16.2112L10.894 14.838L4.80993 21.7899H1.43442L9.31742 12.78L0.999985 1.90393H7.96109L12.7674 8.25826L18.3263 1.90393ZM17.1423 19.7707H19.0116L6.94538 3.81706H4.93945L17.1423 19.7707Z" fill="currentColor"></path></svg></a><a target="_blank" rel="noreferrer" className="hover:text-secondary-foreground transition-colors" href="#"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07813V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z" fill="currentColor"></path></svg></a>
                      <a target="_blank" rel="noreferrer" className="hover:text-secondary-foreground transition-colors" href="#"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Apple logo" className="h-5 w-5"><path fill="currentColor" d="M17.573 22.135c-1.089 1.055-2.278.888-3.422.388-1.21-.51-2.322-.533-3.6 0-1.6.69-2.444.49-3.399-.388C1.73 16.547 2.53 8.036 8.685 7.725c1.5.078 2.544.823 3.422.89 1.31-.267 2.566-1.034 3.966-.934 1.678.133 2.944.8 3.777 2-3.466 2.077-2.644 6.643.534 7.92-.634 1.667-1.456 3.323-2.822 4.545l.01-.011ZM11.996 7.659c-.167-2.478 1.844-4.522 4.155-4.722.322 2.866-2.6 5-4.155 4.722Z"></path></svg></a><a target="_blank" rel="noreferrer" className="hover:text-secondary-foreground transition-colors" href="#"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><path d="M1.33331 1.47249V22.5365C1.3321 22.5831 1.3451 22.6289 1.37059 22.668C1.39608 22.707 1.43284 22.7373 1.476 22.755C1.51915 22.7726 1.56665 22.7767 1.61218 22.7666C1.6577 22.7566 1.6991 22.733 1.73085 22.6988L12.7052 11.7133L1.73645 1.31011C1.7047 1.27599 1.6633 1.25234 1.61778 1.24231C1.57225 1.23229 1.52475 1.23636 1.4816 1.25399C1.43844 1.27161 1.40167 1.30196 1.37619 1.34099C1.3507 1.38002 1.3377 1.42589 1.33891 1.47249H1.33331ZM17.2909 7.60355L3.54497 0.0335109L3.53378 0.0279117C3.29861 -0.0952694 3.07465 0.218282 3.26502 0.403054L14.7713 9.14331L17.2909 7.60355ZM3.27062 23.5947C3.07465 23.7851 3.29861 24.0986 3.53938 23.9698L3.55057 23.9642L17.2909 16.1702L14.0434 13.0683L3.27062 23.5947ZM22.834 10.5543L18.9986 8.44342L15.4543 11.9541L19.0602 15.3864L22.834 13.2867C23.8755 12.71 23.8755 11.187 22.834 10.5543Z" fill="currentColor"></path></svg></a>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Top Navigation */}
        <div className="sticky top-0 z-10 backdrop-blur-lg border-b border-white/20 px-4 py-2 pb-2">
          <div className="relative flex items-center justify-between mt-0">
            {/* Left: Mobile menu button */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1 rounded-md theme-text-primary hover:theme-text-secondary relative"
              >
                <Menu className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Center: Logo + Brand */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0 pointer-events-none select-none mt-[-5px] scale-80 lg:scale-100 mx-[-10px]">
              <Icon name="logo" size={35} className="ml-0 lg:ml-0 mt-1 lg:scale-105" />
              <span className="theme-text-primary text-2xl lg:text-[1.6rem] tracking-tight">OMNISHARE</span>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-1">
              {/* Theme Selector */}
              <ThemeSelector />

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
              <div>
                <WalletBalance />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main id="mainContent" ref={mainContentRef} className="py-0 h-full-dec-hf overflow-auto theme-bg-card lg:px-[20%]">
          <div className="w-full mx-auto sm:px-0 lg:px-0 overflow-fit">
            <div className="p-0">{children}</div>
          </div>
        </main>

        {/* Footer */}

      </div>

      {/* Global Preloader Overlay */}
      <PreloaderOverlay loadingState={loadingState} />
      </div>
    </ResizeContext.Provider>
  );
};
