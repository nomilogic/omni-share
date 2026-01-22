import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Plus,
  Building2,
  History,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { useLoading } from "../../context/LoadingContext";
import { useSubscriptionModal } from "../../context/SubscriptionModalContext";
import { PricingModals } from "../PricingModals";
import { useModal } from "../../context2/ModalContext";
import ReferralSection from "../../components/dashboard/ReferralSection";
import PreloaderOverlay from "../PreloaderOverlay";
import { ManageSubscriptionModal } from "../ManageSubscriptionModal";
import API from "@/services/api";
import logoText from "../../assets/logo-text.svg";
import LogoWhiteText from "../../assets/logo-white-text.svg";
import { useTranslation } from "react-i18next";
import Sidebar from "./LayoutSideBar";
import AppInitializer from "../AppLayoutLoader";
import { ResizeContext } from "@/context/ResizeContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const {
    user,
    logout,
    balance,
    refreshUser,
    unreadCount,
    setUnreadCount,
    fetchUnreadCount,
  }: any = useAppContext();
  const { t } = useTranslation();
  const { loadingState } = useLoading();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPackage, setShowPackage] = useState(false);
  const [isCanceled, setIsCanceled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planMsgOpen, setPlanMsgOpen] = useState(false);
  const [coinsMsgOpen, setCoinsMsgOpen] = useState(false);
  const [referralMsgOpen, setReferralMsgOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const packageDropdownRef = useRef<HTMLDivElement>(null);
  const planRef = useRef<HTMLDivElement>(null);
  const coinsRef = useRef<HTMLDivElement>(null);
  const referralRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);

  const { openModal } = useModal();
  const {
    showManageSubscription,
    openManageSubscription,
    closeManageSubscription,
  } = useSubscriptionModal();

  const navigation = [
    { key: "dashboard", name: "Dashboard", path: "/dashboard", icon: Home },
    {
      key: "create_content",
      name: "Create Content",
      path: "/content",
      icon: Plus,
    },
    { key: "accounts", name: "Accounts", path: "/accounts", icon: Building2 },
    { key: "history", name: "History", path: "/history", icon: History },
    {
      key: "pricing_plan",
      name: "Pricing Plan",
      path: "/pricing",
      icon: CreditCard,
    },
    {
      key: t("analytics"),
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
  ];
  const [zoom, setZoom] = useState(1);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await API.readAllHistory();
      setUnreadCount(0);
      fetchUnreadCount();
    } catch (error) {}
  };

  const handleReferShareClick = async () => {
    openModal(ReferralSection as any, {});
    setIsMobileMenuOpen(false);
  };

  const cancelSubscription = async () => {
    try {
      setIsCanceled(true);
      await API.cancelPackage();
      refreshUser();
    } catch (error) {
      console.error(error);
    } finally {
      closeManageSubscription();
      setIsCanceled(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (userMenuRef.current && !userMenuRef.current.contains(target))
        if (
          packageDropdownRef.current &&
          !packageDropdownRef.current.contains(target)
        )
          setShowPackage(false);
      if (planRef.current && !planRef.current.contains(target))
        setPlanMsgOpen(false);
      if (coinsRef.current && !coinsRef.current.contains(target))
        setCoinsMsgOpen(false);
      if (referralRef.current && !referralRef.current.contains(target))
        setReferralMsgOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleResizeMainToFullScreen = (isFullScreen: boolean) => {
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

  useEffect(() => {
    const handleWindowResize = () => {
      if (window.innerHeight < 800) {
        setZoom(window.innerHeight / 800);
      }
    };
    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("load", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  return (
    <ResizeContext.Provider value={{ handleResizeMainToFullScreen }}>
      <div>
        <Sidebar
          zoom={zoom}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          user={user}
          navigation={navigation}
          unreadCount={unreadCount}
          handleMarkAllAsRead={handleMarkAllAsRead}
          handleLogout={handleLogout}
          balance={balance}
          showPackage={showPackage}
          setShowPackage={setShowPackage}
          logoText={logoText}
          LogoWhiteText={LogoWhiteText}
          t={t}
          handleReferShareClick={handleReferShareClick}
          planMsgOpen={planMsgOpen}
          setPlanMsgOpen={setPlanMsgOpen}
          coinsMsgOpen={coinsMsgOpen}
          setCoinsMsgOpen={setCoinsMsgOpen}
          referralMsgOpen={referralMsgOpen}
          setReferralMsgOpen={setReferralMsgOpen}
          openManageSubscription={openManageSubscription}
          userMenuRef={userMenuRef}
          packageDropdownRef={packageDropdownRef}
          planRef={planRef}
          coinsRef={coinsRef}
          referralRef={referralRef}
        />

        <main
          id="mainContent"
          ref={mainContentRef}
          className="py-0 h-full-dec-hf w-full overflow-auto theme-bg-card  mt-[60px] "
        >
          <div className="w-full mx-auto overflow-fit max-w-5xl ">
            {children}
          </div>
        </main>
      </div>
      <AppInitializer />
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
        isCanceled={isCanceled}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onCancelSubscription={() => {
          try {
            (cancelSubscription as any) && cancelSubscription();
          } catch (e) {
            console.error("cancelSubscription not available", e);
          }
        }}
        onAddCoins={() => {
          setShowPackage(false);
          closeManageSubscription();
          navigate("/pricing?tab=addons");
        }}
      />
      <PricingModals />
      <PreloaderOverlay loadingState={loadingState} />
    </ResizeContext.Provider>
  );
};
