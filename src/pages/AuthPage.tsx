import React, { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthForm } from "../components/AuthForm";
import { useAppContext } from "../context/AppContext";
import API from "../services/api";
import { notify } from "@/utils/toast";
import { useTranslation } from "react-i18next";

export const AuthPage: React.FC = () => {
  const { initUser } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleAuthSuccess = () => {
    initUser();
    navigate("/content");
  };

  const handleResetPassword = async (token: string, new_password: string) => {
    setLoading(true);
    setError(null);
    try {
      await API.setNewPassword({ new_password }, {
        headers: { authorization: token },
      } as any);
      notify("error", t("password_updated_successfully"));
      navigate("/login");
    } catch (err: any) {
      console.error("setNewPassword failed", err);
      setError(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col relative theme-bg-trinary">
      <div className="flex-grow">
        <AuthForm
          onAuthSuccess={handleAuthSuccess}
          onResetPassword={(token: string, password: string) =>
            handleResetPassword(token, password)
          }
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};
