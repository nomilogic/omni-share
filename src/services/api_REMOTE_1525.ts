import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const BASE_URL: string =
  import.meta.env.VITE_API_URL || "https://omnishare.ai/server/api";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

interface CampaignPayload {
  title: string;
  budget: number;
}

interface SocialConnectPayload {
  accessToken: string;
}

interface OAuthPayload {
  provider: string;
}

interface OAuthCallbackPayload {
  code: string;
}

interface ProfilePayload {
  name: string;
}

interface UserPayload {
  username: string;
}

interface ScrapperPayload {
  url: string;
}

interface GenerateForgetLinkPayload {
  email: string;
}

interface NewPasswordPayload {
  new_password: string;
}

interface APIInstance extends AxiosInstance {
  login: (data: LoginPayload) => Promise<any>;
  registerUser: (data: RegisterPayload) => Promise<any>;
  resendOtp: () => void;
  logout: () => Promise<any>;
  getUser: () => Promise<any>;
  userBalance: () => Promise<any>;
  otpVerification: (data: any) => Promise<any>;
  forgotPassword: (data: ForgotPasswordPayload) => Promise<any>;
  resetPassword: (data: ResetPasswordPayload) => Promise<any>;

  listAddons: () => Promise<any>;
  confirmAddons: (data: any) => Promise<any>;
  buyAddons: (data: any) => Promise<any>;

  listPackages: () => Promise<any>;
  buyPackage: (packageId: string) => Promise<any>;
  confirmPurchase: (data: any) => Promise<any>;
  listMedia: () => Promise<any>;
  uploadMedia: (formData: FormData) => Promise<any>;
  deleteMedia: (mediaId: string) => Promise<any>;
  generateAI: (data: any) => Promise<any>;
  generateImage: (data: any) => Promise<any>;
  listCampaigns: () => Promise<any>;
  createCampaign: (data: CampaignPayload) => Promise<any>;
  updateCampaign: (id: string, data: CampaignPayload) => Promise<any>;
  deleteCampaign: (id: string) => Promise<any>;
  facebookConnect: (data: SocialConnectPayload) => Promise<any>;
  instagramConnect: (data: SocialConnectPayload) => Promise<any>;
  linkedinConnect: (data: SocialConnectPayload) => Promise<any>;
  twitterConnect: (data: SocialConnectPayload) => Promise<any>;
  tiktokConnect: (data: SocialConnectPayload) => Promise<any>;
  youtubeConnect: (data: SocialConnectPayload) => Promise<any>;
  oauthStart: (data: OAuthPayload) => Promise<any>;
  oauthCallback: (data: OAuthCallbackPayload) => Promise<any>;
  platformConnection: (platform: string, option: any) => Promise<any>;
  disconnectPlatform: (platform: string) => Promise<any>;
  connectionsStatus: () => Promise<any>;
  connectionForPlatform: (platform: string) => Promise<any>;
  tokenForPlatform: (platform: string) => Promise<any>;
  configuredPlatforms: () => Promise<any>;
  health: () => Promise<any>;
  statusByUser: (userId: string) => Promise<any>;
  getProfile: () => Promise<any>;
  updateProfile: (data: ProfilePayload) => Promise<any>;
  getUserClient: () => Promise<any>;
  updateUser: (data: UserPayload) => Promise<any>;
  getWallet: () => Promise<any>;
  facebookPost: (data: any) => Promise<any>;
  instagramPost: (data: any) => Promise<any>;
  linkedinPost: (data: any) => Promise<any>;
  twitterPost: (data: any) => Promise<any>;
  tiktokPost: (data: any) => Promise<any>;
  youtubePost: (data: any) => Promise<any>;
  savePublishedUrls: (data: any) => Promise<any>;
  getHistory: () => Promise<any>;
  readAllHistory: () => Promise<any>;
  unreadHistory: () => Promise<any>;
  walletTransaction: () => Promise<any>;
  readHistoryById: (postId: any) => Promise<any>;
  getProfileData: () => Promise<any>;
  updateProfileData: (data: any) => Promise<any>;
  scrapeProfileData: (data: ScrapperPayload) => Promise<any>;
  generateForgetLink: (data: GenerateForgetLinkPayload) => Promise<any>;
  setNewPassword: (data: NewPasswordPayload, config?: any) => Promise<any>;
}

export const API = axios.create({
  baseURL: BASE_URL,
}) as APIInstance;

API.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      if (!config.headers) {
        config.headers = new axios.AxiosHeaders();
      }
      config.headers.set("authorization", token);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

API.login = (data) => API.post("/auth/login", data);
API.registerUser = (data) => API.post("/auth/register", data);
API.resendOtp = () => {
  const emailToken: any = JSON.parse(
    JSON.stringify(localStorage.getItem("email_token"))
  );
  return API.get("/auth/resend-otp", {
    headers: { authorization: emailToken ?? "" },
  });
};

API.otpVerification = (data) => {
  const emailToken: any = localStorage.getItem("email_token");
  return API.post(
    "/auth/verify",
    { ...data },
    { headers: { authorization: emailToken ?? "" } }
  );
};
API.logout = () => {
  const token: any = localStorage.getItem("auth_token");
  return API.get("/auth/logout", { headers: { authorization: token } });
};
API.getUser = () => {
  const token: any = localStorage.getItem("auth_token");
  return API.get("/auth", { headers: { authorization: token } });
};

API.userBalance = () => API.get("/auth/user/balance");

API.forgotPassword = (data) => API.post("/auth/forgot-password", data);
API.resetPassword = (data) => API.post("/auth/reset-password", data);

API.listAddons = () => API.get("/client/addons");
API.buyAddons = (addonId) => API.get(`/client/addons/buy/${addonId}`);
API.confirmAddons = (id) => API.get(`/client/addons/confirm/${id}`);

API.confirmPurchase = (id) => API.get(`/client/package/confirm/${id}`);
API.listPackages = () => API.get("/client/package");
API.buyPackage = (packageId) => API.get(`/client/package/buy/${packageId}`);

API.listMedia = () => API.get("/client/media");
API.uploadMedia = (formData) => API.post("/client/media/upload", formData);
API.deleteMedia = (mediaId) => API.delete(`/client/media/${mediaId}`);

API.generateAI = (data) => API.post("/client/ai/generate", data);
API.generateImage = (data) => API.post("/client/ai/generate-image", data);
API.listCampaigns = () => API.get("/client/campaigns");
API.createCampaign = (data) => API.post("/client/campaigns", data);
API.updateCampaign = (id, data) => API.patch(`/client/campaigns/${id}`, data);
API.deleteCampaign = (id) => API.delete(`/client/campaigns/${id}`);
API.facebookConnect = (data) => API.post("/client/facebook/connect", data);
API.instagramConnect = (data) => API.post("/client/instagram/connect", data);
API.linkedinConnect = (data) => API.post("/client/linkedin/connect", data);
API.twitterConnect = (data) => API.post("/client/twitter/connect", data);
API.tiktokConnect = (data) => API.post("/client/tiktok/connect", data);
API.youtubeConnect = (data) => API.post("/client/youtube/connect", data);
API.oauthStart = (data) => API.post("/client/oauth/start", data);
API.oauthCallback = (data) => API.post("/client/oauth/callback", data);
API.platformConnection = (platform) =>
  API.get(`/client/oauth/${platform}/connect`);
API.disconnectPlatform = (platform) =>
  API.post(`/client/oauth/${platform}/disconnect`);
API.connectionsStatus = () => API.get("/client/oauth/connections/status");
API.connectionForPlatform = (platform) =>
  API.get(`/client/oauth/connections/${platform}`);
API.tokenForPlatform = (platform) =>
  API.get(`/client/oauth/tokens/${platform}`);

API.configuredPlatforms = () => API.get("/client/oauth/config/platforms");
API.health = () => API.get("/client/oauth/health");
API.statusByUser = (userId) => API.get(`/client/oauth/status/${userId}`);
API.getProfile = () => API.get("/auth/profile");
API.updateProfile = (data) => API.patch("/auth/profile", data);
API.getUserClient = () => API.get("/client/user");
API.updateUser = (data) => API.patch("/client/user", data);
API.getWallet = () => API.get("/client/wallet");

API.facebookPost = (data) => API.post("/client/facebook/post", data);
API.instagramPost = (data) => API.post("/client/instagram/post", data);
API.linkedinPost = (data) => API.post("/client/linkedin/post", data);
API.twitterPost = (data) => API.post("/client/twitter/post", data);
API.tiktokPost = (data) => API.post("/client/tiktok/post", data);
API.youtubePost = (data) => API.post("/client/youtube/post", data);

API.savePublishedUrls = (data) =>
  API.post("/client/post-history/save-published-urls", data);

API.getHistory = () => API.get("/client/post-history/history");
API.readAllHistory = () => API.get("/client/post-history/history/read-all");
API.readHistoryById = (postId: any) =>
  API.get(`/client/post-history/history/${postId}/read`);
API.unreadHistory = () => API.get("/client/post-history/history/unread-count");

API.walletTransaction = () => API.get("/client/wallet-transaction");
API.getProfileData = () => API.get("/client/profile");
API.updateProfileData = (data) => API.patch("/client/profile", data);
API.scrapeProfileData = (data) =>
  API.get("/client/profile/scrapper", { params: data });
API.generateForgetLink = (data) => API.post("/auth/generateForgetLink", data);
API.setNewPassword = (data, config) =>
  API.post("/auth/new-password", data, config);

export default API;
