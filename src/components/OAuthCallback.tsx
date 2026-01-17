import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { oauthManagerClient } from "../lib/oauthManagerClient";
import { CheckCircle, Loader, XCircle } from "lucide-react";
import Icon from "./Icon";
import API from "@/services/api";

export const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [message, setMessage] = useState("Processing OAuth callback...");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string | null>(null);

  const hasRunRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (hasRunRef.current || isProcessing) {
        return;
      }
      hasRunRef.current = true;

      setIsProcessing(true);
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");
        const platform = window.location.pathname.split("/")[2];
        setPlatform(platform);

        console.log(
          "Handling OAuth callback for platform:",
          platform,
          "code:",
          code,
          "state:",
          state
        );
        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error("Missing code or state parameter");
        }

        if (!platform) {
          throw new Error("Invalid platform");
        }

        setMessage(`Connecting to ${platform}...`);

        const credentials = await API.OauthExchangeCode({
          platform: platform,
          code: code,
          state: state,
        });

        setStatus("success");
        setMessage(`Successfully connected to ${platform}!`);

        const messageData = {
          type: "oauth_success",
          platform: platform,
          credentials: credentials,
        };

        if (window.opener) {
          window.opener.postMessage(messageData, "*");

          setTimeout(() => {
            try {
              // window.close();
            } catch (error) {
              console.warn("Could not close popup window:", error);
              setMessage(
                "Authentication successful! You can close this window."
              );
            }
          }, 100);
        } else {
          setTimeout(() => {
            navigate("/settings");
          }, 2000);
        }
      } catch (error) {
        // window.close();
        const errorMessage =
          error instanceof Error ? error.message : "Authentication failed";
        setStatus("error");
        setMessage(errorMessage);

        const messageData = {
          type: "oauth_error",
          error: errorMessage,
        };

        if (window.opener) {
          window.opener.postMessage(messageData, "*");

          setTimeout(() => {
            try {
            } catch (error) {
              setMessage("Authentication failed. You can close this window.");
            }
          }, 100);
        } else {
          setTimeout(() => {
            navigate("/settings");
          }, 2000);
        }
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

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
          {status === "processing" && `Connecting to ${platform}...`}
          {status === "success" && "Authentication Successful"}
          {status === "error" && "Authentication Failed"}
        </h2>

        <p className=" text-gray-500">{message}</p>

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

// import React, { useEffect, useState } from 'react';
// import { useParams, useSearchParams } from 'react-router-dom';
// import { oauthManager } from '../lib/oauth';
// import { CheckCircle, XCircle, Loader } from 'lucide-react';

// export const OAuthCallback: React.FC = () => {
//   const { platform } = useParams<{ platform: string }>();
//   const [searchParams] = useSearchParams();
//   const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
//   const [message, setMessage] = useState('');
//   const called = React.useRef(false);

//   useEffect(() => {
//     if (called.current) return;
//     called.current = true;
//     handleOAuthCallback();
//     // eslint-disable-next-line
//   }, []);

//   const handleOAuthCallback = async () => {
//     try {
//       const code = searchParams.get('code');
//       const state = searchParams.get('state');
//       const error = searchParams.get('error');
//       console.log('Handling OAuth callback for platform:', platform, 'code:', code, 'state:', state);

//       if (error) {
//         throw new Error(`OAuth error: ${error}`);
//       }

//       if (!code || !state) {
//         throw new Error('Missing required OAuth parameters');
//       }

//       if (!platform) {
//         throw new Error('Invalid platform parameter');
//       }
//       await oauthManager.handleCallback(platform, code, state);

//       setStatus('success');
//       setMessage(`Successfully connected to ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`);

//       // Send message to parent window before closing
//       if (window.opener) {
//         window.opener.postMessage(
//           { type: 'oauth_success', platform, status: 'success' },
//           '*'
//         );
//       }

//       setTimeout(() => {
//         window.close();
//       }, 112000);

//     } catch (error) {
//       console.error('OAuth callback error:', error);
//       setStatus('error');
//       setMessage(error instanceof Error ? error.message : 'OAuth authentication failed');

//       // Send error to parent window before closing
//       if (window.opener) {
//         window.opener.postMessage(
//           { type: 'oauth_error', error: error instanceof Error ? error.message : 'OAuth authentication failed' },
//           '*'
//         );
//       }

//       setTimeout(() => {
//         window.close();
//       }, 113000);
//     }
//   };

//   return (
//     <div className="h-full-dec-hf  x-2 bg-gray-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-md shadow-md p-8 max-w-md w-full text-center">
//         {status === 'loading' && (
//           <>
//             <Loader className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
//             <h2 className="text-xl font-semibold text-slate-900 mb-2">
//               Completing Authentication...
//             </h2>
//             <p className="text-gray-500 font-medium">
//               Please wait while we verify your credentials.
//             </p>
//           </>
//         )}

//         {status === 'success' && (
//           <>
//             <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
//             <h2 className="text-xl font-semibold text-slate-900 mb-2">
//               Authentication Successful!
//             </h2>
//             <p className="text-gray-500 font-medium">{message}</p>
//             <p className="text-sm text-gray-500 font-medium mt-3">
//               This window will close automatically.
//             </p>
//           </>
//         )}

//         {status === 'error' && (
//           <>
//             <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
//             <h2 className="text-xl font-semibold text-slate-900 mb-2">
//               Authentication Failed
//             </h2>
//             <p className="text-gray-500 font-medium">{message}</p>
//             <p className="text-sm text-gray-500 font-medium mt-3">
//               This window will close automatically.
//             </p>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };
