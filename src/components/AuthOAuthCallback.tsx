import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { Loader, CheckCircle, XCircle } from "lucide-react";
import { handleOAuthCallback } from "../utils/authOAuth";
import { getCurrentUser } from "@/lib/auth";

interface AuthOAuthCallbackProps {
  onAuthSuccess: (user: any) => void;
}

export const AuthOAuthCallback: React.FC<AuthOAuthCallbackProps> = ({
  onAuthSuccess,
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { provider } = useParams<{ provider: string }>();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [message, setMessage] = useState("Processing authentication...");
  const [isProcessing, setIsProcessing] = useState(false);

  const hasRunRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent multiple simultaneous OAuth requests and StrictMode double-invoke
      if (hasRunRef.current || isProcessing) {
        console.log(
          "🔒 OAuth callback already in progress or already handled, skipping..."
        );
        return;
      }
      hasRunRef.current = true;

      setIsProcessing(true);
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error("Missing code or state parameter");
        }

        if (!provider || (provider !== "google" && provider !== "facebook")) {
          throw new Error("Invalid OAuth provider");
        }

        setMessage(`Authenticating with ${provider}...`);

        // Handle the OAuth callback
        const result = await handleOAuthCallback(provider, code, state);

        setStatus("success");
        setMessage(`Successfully authenticated with ${provider}!`);

        // Send success message to parent window (popup opener)
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "oauth_success",
              provider: provider,
              state: state,
              result: result,
            },
            "*"
          );

          // Close the popup after a brief delay with error handling
          setTimeout(() => {
            try {
              window.close();
            } catch (error) {
              console.warn("Could not close popup window:", error);
              // Fallback: show user message to close manually
              setMessage(
                "Authentication successful! You can close this window."
              );
            }
          }, 1000);
        } else {
          // Fallback: store token and call success handler if not in popup
          localStorage.setItem("auth_token", result.token);
          onAuthSuccess(result.user);

          // Redirect to content page after a short delay
          setTimeout(() => {
            navigate("/content");
          }, 2000);
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        const errorMessage =
          error instanceof Error ? error.message : "Authentication failed";
        setMessage(errorMessage);

        // Send error message to parent window (popup opener)
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "oauth_error",
              error: errorMessage,
            },
            "*"
          );

          // Close the popup after a brief delay with error handling
          setTimeout(() => {
            try {
              window.close();
            } catch (error) {
              console.warn("Could not close popup window:", error);
              // Fallback: show user message to close manually
              setMessage("Authentication failed. You can close this window.");
            }
          }, 2000);
        } else {
          // Fallback: redirect to login page after error
          setTimeout(() => {
            navigate("/auth");
          }, 3000);
        }
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, provider, onAuthSuccess]);

  const getProviderDisplayName = (provider: string) => {
    switch (provider) {
      case "google":
        return "Google";
      case "facebook":
        return "Facebook";
      default:
        return provider;
    }
  };

  return (
    <div className="h-full-dec-hf  x-2 flex items-center justify-center theme-bg-primary">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-white/15 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
      </div>

      <div
        className="max-w-md w-full theme-bg-card rounded-2xl shadow-xl border p-8 text-center relative z-10"
        style={{ borderColor: "var(--theme-border)" }}
      >
        <div className="mb-6">
          {status === "processing" && (
            <Loader className="w-12 h-12 theme-text-accent animate-spin mx-auto" />
          )}
          {status === "success" && (
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          )}
          {status === "error" && (
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold theme-text-primary mb-2">
          {status === "processing" &&
            `Connecting to ${getProviderDisplayName(provider || "")}`}
          {status === "success" && "Authentication Successful"}
          {status === "error" && "Authentication Failed"}
        </h2>

        <p className="theme-text-secondary">{message}</p>

        {status === "success" && (
          <div className="mt-4 text-sm theme-text-secondary">
            Redirecting to create content...
          </div>
        )}

        {status === "error" && (
          <div className="mt-6">
            <button
              onClick={() => navigate("/auth")}
              className="theme-button-primary px-6 py-3 rounded-xl hover:theme-button-hover transition-all duration-200"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
