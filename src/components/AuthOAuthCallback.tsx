import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { handleOAuthCallback } from "../utils/authOAuth";
import { CheckCircle, Loader, XCircle } from "lucide-react";
import Icon from "./Icon";

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
          "OAuth callback already in progress or already handled, skipping..."
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

        if (
          !provider ||
          (provider !== "google" &&
            provider !== "facebook" &&
            provider !== "linkedin")
        ) {
          throw new Error("Invalid OAuth provider");
        }

        setMessage(`Authenticating with ${provider}...`);

        // Handle the OAuth callback
        const result = await handleOAuthCallback(provider, code, state);
        console.log("result", result);
        setStatus("success");
        setMessage(`Successfully authenticated with ${provider}!`);

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

          setTimeout(() => {
            try {
              window.close();
            } catch (error) {
              console.warn("Could not close popup window:", error);
              setMessage(
                "Authentication successful! You can close this window."
              );
            }
          }, 400);
        } else {
          console.log("result 12113123", result);
          localStorage.setItem("auth_token", result.token);
          onAuthSuccess(result.user);

          setTimeout(() => {
            navigate("/content");
          }, 10);
        }
      } catch (error) {
        console.error("error", error);
        const errorMessage =
          error instanceof Error ? error.message : "Authentication failed";
        setMessage(errorMessage);

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
      case "linkedin":
        return "LinkedIn";
      default:
        return provider;
    }
  };

  return (
    <div className="h-full-dec-hf  x-2 flex items-center justify-center ">
      <div>
        <div className="mb-6">
          {status === "processing" && (
            <div className=" flex justify-center items-center">
              <Icon name="spiral-logo" size={45} className="animate-spin" />
            </div>
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

        <p className="theme-text-secondary text-gray-500">{message}</p>

        {status === "success" && (
          <div className="mt-4 text-sm theme-text-secondary">
            Redirecting to create content...
          </div>
        )}

        {status === "error" && (
          <div className="mt-6">
            <button
              onClick={() => navigate("/auth")}
              className="theme-button-primary px-6 py-3 rounded-md hover:theme-button-hover transition-all duration-200"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
