export interface OAuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: "google" | "facebook" | "linkedin" | "instagram";
}

export interface OAuthConfig {
  google: {
    clientId: string;
    redirectUri: string;
  };
  facebook: {
    appId: string;
    redirectUri: string;
  };
  linkedin: {
    clientId: string;
    redirectUri: string;
  };
  instagram: {
    appId: string;
    redirectUri: string;
  };
}

export const oauthConfig: OAuthConfig = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
    redirectUri: `${window.location.origin}/auth/google/callback`,
  },
  facebook: {
    appId: import.meta.env.VITE_FACEBOOK_APP_ID || "",
    redirectUri: `${window.location.origin}/auth/facebook/callback`,
  },
  linkedin: {
    clientId: import.meta.env.VITE_LINKEDIN_CLIENT_ID || "",
    redirectUri: `${window.location.origin}/auth/linkedin/callback`,
  },
  instagram: {
    appId: import.meta.env.VITE_INSTAGRAM_CLIENT_ID || "",
    redirectUri: `${window.location.origin}/auth/instagram/callback`,
  },
};

export const generateOAuthState = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const storeOAuthState = (state: string): void => {
  localStorage.setItem("oauth_state", state);
};

export const verifyOAuthState = (state: string): boolean => {
  const storedState = localStorage.getItem("oauth_state");
  localStorage.removeItem("oauth_state");
  return storedState === state;
};

export const initiateGoogleOAuth = (
  referralId?: string
): Promise<{
  refreshToken: string;
  accessToken: string;
  user: any;
}> => {
  return new Promise((resolve, reject) => {
    try {
      const state = generateOAuthState();
      storeOAuthState(state);

      const params = new URLSearchParams({
        client_id: oauthConfig.google.clientId,
        referralId: referralId || "",
        redirect_uri: oauthConfig.google.redirectUri,
        response_type: "code",
        scope: "openid email profile",
        state: state,
        access_type: "offline",
        prompt: "select_account",
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      const popup = window.open(
        authUrl,
        "google_oauth",
        "width=500,height=600,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        reject(new Error("Popup blocked. Please allow popups for this site."));
        return;
      }

      const cleanup = () => {
        window.removeEventListener("message", messageListener);
        clearInterval(checkClosed);
        if (!popup.closed) popup.close();
      };

      const messageListener = (event: MessageEvent) => {
        // Verify origin for security

        console.log("event.data", event.data);
        if (event.origin !== window.location.origin) {
          console.warn("Message from untrusted origin:", event.origin);
          return;
        }

        try {
          console.log("📨 Received message:", event.data);

          if (!event.data || typeof event.data !== "object") {
            console.warn("Invalid event data structure");
            return;
          }

          if (
            event.data.type === "oauth_success" &&
            event.data.provider === "google"
          ) {
            if (!verifyOAuthState(event.data.state)) {
              cleanup();
              reject(new Error("Invalid OAuth state parameter"));
              return;
            }

            if (!event.data.result || typeof event.data.result !== "object") {
              cleanup();
              reject(
                new Error("Malformed OAuth response — missing result object")
              );
              return;
            }

            cleanup();
            resolve(event.data.result);
          } else if (event.data.type === "oauth_error") {
            console.error("❌ OAuth error:", event.data.error);
            cleanup();
            reject(
              new Error(event.data.error || "Google authentication failed")
            );
          }
        } catch (err) {
          console.error("Message handler error:", err);
          cleanup();
          reject(new Error("Unexpected error during OAuth message handling"));
        }
      };

      window.addEventListener("message", messageListener);

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          cleanup();
        }
      }, 1000);
    } catch (err: any) {
      reject(
        new Error(err?.message || "Unexpected error initializing Google OAuth")
      );
    }
  });
};

export const initiateFacebookOAuth = (): Promise<{
  refreshToken: string;
  accessToken: string;
  user: any;
}> => {
  return new Promise((resolve, reject) => {
    try {
      const state = generateOAuthState();
      storeOAuthState(state);

      const params = new URLSearchParams({
        client_id: oauthConfig.facebook.appId,
        redirect_uri: oauthConfig.facebook.redirectUri,
        response_type: "code",
        scope: "email,public_profile, business_management",
        state: state,
      });

      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;

      const popup = window.open(
        authUrl,
        "facebook_oauth",
        "width=500,height=600,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        reject(new Error("Popup blocked. Please allow popups for this site."));
        return;
      }

      const cleanup = () => {
        window.removeEventListener("message", messageListener);
        clearInterval(checkClosed);
        if (!popup.closed) popup.close();
      };

      const messageListener = (event: MessageEvent) => {
        console.log("event.data", event.data);
        if (event.origin !== window.location.origin) {
          console.warn("Message from untrusted origin:", event.origin);
          return;
        }

        try {
          if (
            event.data.type === "oauth_success" &&
            event.data.provider === "facebook"
          ) {
            if (!verifyOAuthState(event.data.state)) {
              cleanup();
              reject(new Error("Invalid OAuth state parameter"));
              return;
            }

            console.log("✅ Facebook OAuth success");
            cleanup();
            resolve(event.data.result);
          } else if (event.data.type === "oauth_error") {
            console.error("❌ Facebook OAuth error:", event.data.error);
            cleanup();
            reject(
              new Error(event.data.error || "Facebook authentication failed")
            );
          }
        } catch (err) {
          console.error("Message handler error:", err);
          cleanup();
          reject(new Error("Unexpected error during OAuth message handling"));
        }
      };

      window.addEventListener("message", messageListener);

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          cleanup();
          reject(new Error("Authentication cancelled"));
        }
      }, 1000);
    } catch (err: any) {
      reject(
        new Error(
          err?.message || "Unexpected error initializing Facebook OAuth"
        )
      );
    }
  });
};

export const initiateLinkedInOAuth = (
  referralId: any
): Promise<{
  refreshToken: string;
  accessToken: string;
  user: any;
}> => {
  return new Promise((resolve, reject) => {
    try {
      const state = generateOAuthState();
      storeOAuthState(state);

      const params = new URLSearchParams({
        response_type: "code",
        client_id: oauthConfig.linkedin.clientId,
        referralId: referralId || "",
        redirect_uri: oauthConfig.linkedin.redirectUri,
        scope: "openid profile email w_member_social",
        state,
      });

      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
      const popup = window.open(
        authUrl,
        "linkedin_oauth",
        "width=500,height=600,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        reject(new Error("Popup blocked. Please allow popups for this site."));
        return;
      }

      const cleanup = () => {
        window.removeEventListener("message", messageListener);
        clearInterval(checkClosed);
        if (!popup.closed) popup.close();
      };

      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) {
          console.warn("Message from untrusted origin:", event.origin);
          return;
        }

        try {
          if (
            event.data?.type === "oauth_success" &&
            event.data?.provider === "linkedin"
          ) {
            if (!verifyOAuthState(event.data.state)) {
              cleanup();
              reject(new Error("Invalid OAuth state parameter"));
              return;
            }

            cleanup();
            resolve(event.data.result);
          } else if (event.data?.type === "oauth_error") {
            cleanup();
            reject(
              new Error(event.data.error || "LinkedIn authentication failed")
            );
          }
        } catch (err) {
          cleanup();
          reject(new Error("Unexpected error during OAuth message handling"));
        }
      };

      window.addEventListener("message", messageListener);

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          cleanup();
        }
      }, 1000);
    } catch (err: any) {
      reject(
        new Error(
          err?.message || "Unexpected error initializing LinkedIn OAuth"
        )
      );
    }
  });
};

export const initiateInstagramOAuth = (
  referralId?: string
): Promise<{
  refreshToken: string;
  accessToken: string;
  user: any;
}> => {
  return new Promise((resolve, reject) => {
    try {
      const state = generateOAuthState();
      storeOAuthState(state);

      // Using new Instagram Business scope values (effective Jan 27, 2025)
      // Old scopes deprecated: business_basic, business_content_publish, business_manage_comments, business_manage_messages
      const params = new URLSearchParams({
        client_id: oauthConfig.instagram.appId,
        redirect_uri: oauthConfig.instagram.redirectUri,
        scope:
          "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages,instagram_business_manage_comments",
        response_type: "code",
        state: state,
      });

      const authUrl = `https://api.instagram.com/oauth/authorize?${params.toString()}`;

      const popup = window.open(
        authUrl,
        "instagram_oauth",
        "width=500,height=600,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        reject(new Error("Popup blocked. Please allow popups for this site."));
        return;
      }

      const cleanup = () => {
        window.removeEventListener("message", messageListener);
        clearInterval(checkClosed);
        if (!popup.closed) popup.close();
      };

      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) {
          console.warn("Message from untrusted origin:", event.origin);
          return;
        }

        try {
          if (
            event.data.type === "oauth_success" &&
            event.data.provider === "instagram"
          ) {
            if (!verifyOAuthState(event.data.state)) {
              cleanup();
              reject(new Error("Invalid OAuth state parameter"));
              return;
            }

            if (!event.data.result || typeof event.data.result !== "object") {
              cleanup();
              reject(
                new Error("Malformed OAuth response — missing result object")
              );
              return;
            }

            cleanup();
            resolve(event.data.result);
          } else if (event.data.type === "oauth_error") {
            console.error("❌ Instagram OAuth error:", event.data.error);
            cleanup();
            reject(
              new Error(event.data.error || "Instagram authentication failed")
            );
          }
        } catch (err) {
          console.error("Message handler error:", err);
          cleanup();
          reject(new Error("Unexpected error during OAuth message handling"));
        }
      };

      window.addEventListener("message", messageListener);

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          cleanup();
        }
      }, 1000);
    } catch (err: any) {
      reject(
        new Error(
          err?.message || "Unexpected error initializing Instagram OAuth"
        )
      );
    }
  });
};

/**
 * Handle OAuth callback and exchange code for user data
 */
export const handleOAuthCallback = async (
  provider: "google" | "facebook" | "linkedin" | "instagram",
  code: string,
  state: string
): Promise<{ refreshToken: string; accessToken: string; user: any }> => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    const response = await fetch(`${apiUrl}/client/oauth/${provider}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        state,
        redirectUri:
          provider === "google"
            ? oauthConfig.google.redirectUri
            : provider === "facebook"
            ? oauthConfig.facebook.redirectUri
            : provider === "linkedin"
            ? oauthConfig.linkedin.redirectUri
            : oauthConfig.instagram.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.error || `${provider} OAuth failed: ${response.status}`
      );
    }

    const result = await response.json();

    return result;
  } catch (error) {
    console.error(`❌ ${provider} OAuth error:`, error);
    throw error;
  }
};

/**
 * Check if OAuth is properly configured
 */
export const isOAuthConfigured = (
  provider: "google" | "facebook" | "linkedin" | "instagram"
): boolean => {
  if (provider === "google") {
    return !!oauthConfig.google.clientId;
  }
  if (provider === "facebook") {
    return !!oauthConfig.facebook.appId;
  }
  if (provider === "linkedin") {
    return !!oauthConfig.linkedin.clientId;
  }
  if (provider === "instagram") {
    return !!oauthConfig.instagram.appId;
  }
  return false;
};
