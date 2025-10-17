/**
 * OAuth Authentication Utilities
 * Handles Google and Facebook OAuth flows for user registration and login
 */

export interface OAuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: "google" | "facebook";
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
}

// OAuth configuration
export const oauthConfig: OAuthConfig = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
    redirectUri: "http://localhost:5000/auth/google/callback",
  },
  facebook: {
    appId: import.meta.env.VITE_FACEBOOK_APP_ID || "",
    redirectUri: "http://localhost:5000/auth/facebook/callback",
  },
};

/**
 * Generate a random state parameter for OAuth security
 */
export const generateOAuthState = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

/**
 * Store OAuth state in localStorage
 */
export const storeOAuthState = (state: string): void => {
  localStorage.setItem("oauth_state", state);
};

/**
 * Verify OAuth state from localStorage
 */
export const verifyOAuthState = (state: string): boolean => {
  const storedState = localStorage.getItem("oauth_state");
  localStorage.removeItem("oauth_state");
  return storedState === state;
};

/**
 * Initiate Google OAuth flow in popup window
 */
export const initiateGoogleOAuth = (): Promise<{
  token: string;
  user: any;
}> => {
  return new Promise((resolve, reject) => {
    try {
      const state = generateOAuthState();
      storeOAuthState(state);

      const params = new URLSearchParams({
        client_id: oauthConfig.google.clientId,
        redirect_uri: oauthConfig.google.redirectUri,
        response_type: "code",
        scope: "openid email profile",
        state: state,
        access_type: "offline",
        prompt: "consent",
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      // Debug logs
      console.log("🔍 OAuth Debug Info:");
      console.log("window.location.origin:", window.location.origin);
      console.log("Redirect URI:", oauthConfig.google.redirectUri);
      console.log("Full Auth URL:", authUrl);

      // Open popup
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
        try {
          if (!event.data || typeof event.data !== "object") return;

          if (
            event.data.type === "oauth_success" &&
            event.data.provider === "google"
          ) {
            if (!verifyOAuthState(event.data.state)) {
              cleanup();
              reject(new Error("Invalid OAuth state parameter"));
              return;
            }

            // Ensure we got proper JSON
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
            cleanup();
            reject(
              new Error(event.data.error || "Google authentication failed")
            );
          }
        } catch (err) {
          cleanup();
          reject(new Error("Unexpected error during OAuth message handling"));
        }
      };

      window.addEventListener("message", messageListener);

      // Detect popup closure
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          cleanup();
          reject(new Error("Authentication cancelled or popup closed"));
        }
      }, 1000);
    } catch (err: any) {
      reject(
        new Error(err?.message || "Unexpected error initializing Google OAuth")
      );
    }
  });
};

/**
 * Initiate Facebook OAuth flow in popup window
 */
export const initiateFacebookOAuth = (): Promise<{
  token: string;
  user: any;
}> => {
  return new Promise((resolve, reject) => {
    const state = generateOAuthState();
    storeOAuthState(state);

    const params = new URLSearchParams({
      client_id: oauthConfig.facebook.appId,
      redirect_uri: oauthConfig.facebook.redirectUri,
      response_type: "code",
      scope: "email,public_profile",
      state: state,
    });

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;

    // Open popup window
    const popup = window.open(
      authUrl,
      "facebook_oauth",
      "width=500,height=600,scrollbars=yes,resizable=yes"
    );

    if (!popup) {
      reject(new Error("Popup blocked. Please allow popups for this site."));
      return;
    }

    // Listen for messages from popup
    const messageListener = (event: MessageEvent) => {
      if (
        event.data.type === "oauth_success" &&
        event.data.provider === "facebook"
      ) {
        // Verify state in parent window
        if (!verifyOAuthState(event.data.state)) {
          window.removeEventListener("message", messageListener);
          popup.close();
          reject(new Error("Invalid OAuth state parameter"));
          return;
        }
        window.removeEventListener("message", messageListener);
        popup.close();
        resolve(event.data.result);
      } else if (event.data.type === "oauth_error") {
        window.removeEventListener("message", messageListener);
        popup.close();
        reject(new Error(event.data.error || "Facebook authentication failed"));
      }
    };

    window.addEventListener("message", messageListener);

    // Handle popup closure
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", messageListener);
        reject(new Error("Authentication cancelled"));
      }
    }, 1000);
  });
};

/**
 * Handle OAuth callback and exchange code for user data
 */
export const handleOAuthCallback = async (
  provider: "google" | "facebook",
  code: string,
  state: string
): Promise<{ token: string; user: any }> => {
  // Skip state verification here since it will be done in parent window
  // The popup doesn't have access to parent's localStorage

  try {
    const response = await fetch(`/api/auth/oauth/${provider}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        redirectUri:
          provider === "google"
            ? oauthConfig.google.redirectUri
            : oauthConfig.facebook.redirectUri,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `${provider} OAuth failed`);
    }

    if (!result.token || !result.user) {
      throw new Error("Invalid response from OAuth server");
    }

    return result;
  } catch (error) {
    console.error(`${provider} OAuth error:`, error);
    throw error;
  }
};

/**
 * Check if OAuth is properly configured
 */
export const isOAuthConfigured = (provider: "google" | "facebook"): boolean => {
  if (provider === "google") {
    return !!oauthConfig.google.clientId;
  }
  if (provider === "facebook") {
    return !!oauthConfig.facebook.appId;
  }
  return false;
};
