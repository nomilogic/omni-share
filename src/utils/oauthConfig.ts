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
  },
};
