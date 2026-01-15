import Cookies from "js-cookie";
import API from "../services/api";

export interface OAuthConnection {
  connected: boolean;
  username?: string;
  profilePicture?: string;
  connectedAt?: number;
  expiresAt?: number;
  scopes?: string[];
  needsRefresh?: boolean;
}

export class OAuthManagerClient {
  private authToken?: string;

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private ensureAuthenticated() {
    const token = this.authToken || Cookies.get("auth_token");
    if (!token)
      throw new Error("Authentication token required. Please log in.");
    this.authToken = token;
  }

  async getConnectionStatus(): Promise<any> {
    this.ensureAuthenticated();
    return API.connectionsStatus();
  }

  async getPlatformConnection(platform: string): Promise<OAuthConnection> {
    this.ensureAuthenticated();
    return API.connectionForPlatform(platform);
  }

  async startOAuthFlow(
    platform: string,
    options: any = {}
  ): Promise<{ authUrl: string; state: string }> {
    this.ensureAuthenticated();
    return API.platformConnection(platform, options);
  }

  async oauthStart(data: any): Promise<any> {
    this.ensureAuthenticated();
    return API.oauthStart(data);
  }

  async oauthCallback(data: any): Promise<any> {
    this.ensureAuthenticated();
    return API.oauthCallback(data);
  }

  async disconnectPlatform(platform: string): Promise<any> {
    this.ensureAuthenticated();
    return API.disconnectPlatform(platform);
  }

  async getAccessToken(platform: string): Promise<any> {
    this.ensureAuthenticated();
    return API.tokenForPlatform(platform);
  }

  async getPlatformConfig(): Promise<any> {
    this.ensureAuthenticated();
    return API.configuredPlatforms();
  }

  async healthCheck(): Promise<any> {
    this.ensureAuthenticated();
    return API.health();
  }

  async getUserConnectionStatus(userId: string): Promise<any> {
    this.ensureAuthenticated();
    return API.statusByUser(userId);
  }
}

export const oauthManagerClient = new OAuthManagerClient();
