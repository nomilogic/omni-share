export interface OAuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: "google" | "facebook" | "linkedin";
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
   // redirectUri: `https://omnishare.ai/server/api/client/oauth/linkedin/callback`,
   // redirectUri: `https://4q2ddj89-3000.uks1.devtunnels.ms/api/client/oauth/linkedin/callback`,
  },
};
 
export const generateOAuthState = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const storeOAuthState = (state: string): void => {
  sessionStorage.setItem("oauth_state", state);
};

export const verifyOAuthState = (state: string): boolean => {
  const storedState = sessionStorage.getItem("oauth_state");
  sessionStorage.removeItem("oauth_state");
  return storedState === state;
};

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

      console.log("🔍 OAuth Debug Info:");
      console.log("Frontend Origin:", window.location.origin);
      console.log("Redirect URI:", oauthConfig.google.redirectUri);

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

export const initiateFacebookOAuth = (): Promise<{
  token: string;
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
        scope: "email,public_profile",
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

export const initiateLinkedInOAuth = (): Promise<{
  token: string;
  user: any;
}> => {
  return new Promise((resolve, reject) => {
    try {
      const state = generateOAuthState();
      storeOAuthState(state);

      const params = new URLSearchParams({
        response_type: "code",
        client_id: oauthConfig.linkedin.clientId,
        redirect_uri: oauthConfig.linkedin.redirectUri,
        scope:"openid profile email w_member_social",
        state,
      });

      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
      alert(authUrl);
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
            reject(new Error(event.data.error || "LinkedIn authentication failed"));
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
          reject(new Error("Authentication cancelled or popup closed"));
        }
      }, 1000);
    } catch (err: any) {
      reject(new Error(err?.message || "Unexpected error initializing LinkedIn OAuth"));
    }
  });
};

/**
 * Handle OAuth callback and exchange code for user data
 */
export const handleOAuthCallback = async (
  provider: "google" | "facebook" | "linkedin",
  code: string,
  state: string
): Promise<{ token: string; user: any }> => {
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
            : oauthConfig.linkedin.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.error || `${provider} OAuth failed: ${response.status}`
      );
    }

    const result = await response.json();

    if (!result.token || !result.user) {
      throw new Error(
        "Invalid response from OAuth server: missing token or user"
      );
    }

    console.log(`✅ ${provider} OAuth response:`, result);
    return result;
  } catch (error) {
    console.error(`❌ ${provider} OAuth error:`, error);
    throw error;
  }
};

/**
 * Check if OAuth is properly configured
 */
export const isOAuthConfigured = (provider: "google" | "facebook" | "linkedin"): boolean => {
  if (provider === "google") {
    return !!oauthConfig.google.clientId;
  }
  if (provider === "facebook") {
    return !!oauthConfig.facebook.appId;
  }
  if (provider === "linkedin") {
    return !!oauthConfig.linkedin.clientId;
  }
  return false;
};
