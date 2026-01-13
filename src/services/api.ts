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

interface TemplatePayload {
  name: string;
  json: any;
  isPublic?: boolean;
}

// OAUTH Exchange code payload
interface ExchangeCodePayload {
  code: string;
  platform: string;
  state: string;
}

interface APIInstance extends AxiosInstance {
  login: (data: LoginPayload) => Promise<any>;
  registerUser: (data: RegisterPayload) => Promise<any>;
  contactUs: (data: any) => Promise<any>;
  resendOtp: () => void;
  logout: () => Promise<any>;
  getUser: () => Promise<any>;
  userBalance: () => Promise<any>;
  otpVerification: (data: any) => Promise<any>;
  forgotPassword: (data: ForgotPasswordPayload) => Promise<any>;
  resetPassword: (data: ResetPasswordPayload) => Promise<any>;

  listAddons: () => Promise<any>;
  confirmAddons: (data: any) => Promise<any>;
  buyAddons: (data: any, language: string) => Promise<any>;

  listPackages: () => Promise<any>;
  cancelPackage: () => Promise<any>;
  cancelDowngradeRequest: () => Promise<any>;
  getCustomerPortal: () => Promise<any>;
  requestDowngrade: (id: any) => Promise<any>;
  reactivatePackage: () => Promise<any>;
  buyPackage: (packageId: string, language: string) => Promise<any>;
  requestUpgradePackage: (packageId: string) => Promise<any>;
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
  facebookPages: (token: any) => Promise<any>;
  linkedinPages: (token: any) => Promise<any>;
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
  downloadWalletTransaction: (id: any) => Promise<any>;
  readHistoryById: (postId: any) => Promise<any>;
  tiktokGetMe: () => Promise<any>;
  tiktokUploadInit: (data: any) => Promise<any>;
  tiktokUploadVideo: (data: any) => Promise<any>;
  tiktokPublishStatus: (params: any) => Promise<any>;
  tiktokCompleteUpload: (data: any) => Promise<any>;
  tiktokAccessToken: (data: any) => Promise<any>;
  tiktokOauthTokens: () => Promise<any>;
  getProfileData: () => Promise<any>;
  getGenerateAmount: () => Promise<any>;
  createGenerateAmount: (data: any) => Promise<any>;
  updateGenerateAmount: (id: any, data: any) => Promise<any>;
  deleteGenerateAmount: (id: any) => Promise<any>;
  updateProfileData: (data: any) => Promise<any>;
  scrapeProfileData: (data: ScrapperPayload) => Promise<any>;
  generateForgetLink: (data: GenerateForgetLinkPayload) => Promise<any>;
  setNewPassword: (data: NewPasswordPayload, config?: any) => Promise<any>;
  updatePassword: (data: any) => Promise<any>;
  OauthExchangeCode: (data: ExchangeCodePayload) => Promise<any>;
  subscribe: (data: ExchangeCodePayload) => Promise<any>;
  saveTemplate: (data: TemplatePayload) => Promise<any>;
  deleteTemplate: (id: string) => Promise<any>;
  listTemplates: () => Promise<any>;
  listGlobalTemplates: () => Promise<any>;
  verifyLogin2FA: (data: any) => Promise<any>;
  verifySecretLogin: (data: any) => Promise<any>;
  verify2FASetup: (data: any) => Promise<any>;
  securityAnswers: (data: any) => Promise<any>;
  enable2FA: () => Promise<any>;
  disable2FA: (otp: any) => Promise<any>;
  securityQuestionDisable2FA: (data: any) => Promise<any>;
  facebookAnalytics: () => Promise<any>;
  securityQuestion: () => Promise<any>;
  refreshToken: (token: any) => Promise<any>;
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

API.refreshToken = (token) => {
  const refresh_token = token || localStorage.getItem("refresh_token");

  return API.post("/auth/refresh-token", { refreshToken: refresh_token });
};

API.securityAnswers = (data: any) =>
  API.post("/auth/security/add-security", data);
API.verifySecretLogin = (data: any) =>
  API.post("/auth/verifySecretLogin", data);

API.facebookAnalytics = () => API.get("/client/facebook/analytics");
API.securityQuestion = () => API.get("/auth/security/question");
API.login = (data) => API.post("/auth/login", data);
API.registerUser = (data) => API.post("/auth/register", data);
API.contactUs = (data) => API.post("/auth/contact-us", data);
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

API.verifyLogin2FA = (data) => API.post("/auth/verifyLogin2FA", data);
API.disable2FA = (otp) => {
  const token: any = localStorage.getItem("auth_token");
  return API.get(`/auth/disable2FA?otp=${otp}`, {
    headers: { authorization: token },
  });
};

API.securityQuestionDisable2FA = (data) => {
  return API.post(`/auth/security/disable2FA`, data);
};
API.enable2FA = () => {
  const token: any = localStorage.getItem("auth_token");
  return API.get("/auth/enable2FA", { headers: { authorization: token } });
};
API.verify2FASetup = (data) => API.post("/auth/verify2FASetup", data);

API.getUser = () => {
  const token: any = localStorage.getItem("auth_token");
  return API.get("/auth", { headers: { authorization: token } });
};

API.userBalance = () => API.get("/auth/user/balance");

API.forgotPassword = (data) => API.post("/auth/forgot-password", data);
API.resetPassword = (data) => API.post("/auth/reset-password", data);

API.listAddons = () => API.get("/client/addons");
API.buyAddons = (addonId, language) =>
  API.get(`/client/addons/buy/${addonId}?language=${language}`);

API.confirmAddons = (id) => API.get(`/client/addons/confirm/${id}`);

API.confirmPurchase = (id) => API.get(`/client/package/confirm/${id}`);
API.listPackages = () => API.get("/client/package");
API.buyPackage = (packageId, language) =>
  API.get(`/client/package/buy/${packageId}?language=${language}`);
API.requestUpgradePackage = (id) => API.get(`/client/package/upgrade/${id}`);
API.cancelPackage = () => API.delete(`/client/package/cancel`);
API.reactivatePackage = () => API.get(`/client/package/reactivate`);
API.requestDowngrade = (id: any) => API.get(`/client/package/downgrade/${id}`);
API.cancelDowngradeRequest = () => API.delete(`/client/package/downgrade`);
API.getCustomerPortal = () => API.get(`/client/package/customer-portal`);

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
API.facebookPages = (token) =>
  API.get(`/client/facebook/pages?access_token=${token}`);
API.linkedinPages = (token) =>
  API.get(`/client/linkedin/pages?access_token=${token}`);
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
API.downloadWalletTransaction = (id: any) =>
  API.get(`/client/wallet-transaction/${id}`);

API.getProfileData = () => API.get("/client/profile");
API.updateProfileData = (data) => API.patch("/client/profile", data);
API.scrapeProfileData = (data) =>
  API.get("/client/profile/scrapper", { params: data });
API.generateForgetLink = (data) => API.post("/auth/generateForgetLink", data);
API.setNewPassword = (data, config) =>
  API.post("/auth/new-password", data, config);

API.tiktokGetMe = () => API.get("/client/tiktok/me");
API.tiktokUploadInit = (data: any) =>
  API.post("/client/tiktok/upload-init", data);
API.tiktokUploadVideo = (data: any) =>
  API.post("/client/tiktok/upload-video", data);
API.tiktokPublishStatus = (params: any) =>
  API.get("/client/tiktok/publish-status", { params });
API.tiktokCompleteUpload = (data: any) =>
  API.post("/client/tiktok/complete-upload", data);
API.tiktokAccessToken = (data: any) =>
  API.post("/client/tiktok/access-token", data);
API.tiktokOauthTokens = () => API.get("/client/tiktok/oauth_tokens");
API.getGenerateAmount = () => API.get("/admin/generation-amount");
API.updateGenerateAmount = (id: any, data: any) =>
  API.patch(`/admin/generation-amount/${id}`, data);
API.createGenerateAmount = (data: any) =>
  API.post("/admin/generation-amount", data);
API.deleteGenerateAmount = (id: any) =>
  API.delete(`/admin/generation-amount/${id}`);
API.updatePassword = (data: any) => API.post("/auth/update-password", data);
API.OauthExchangeCode = (data: any) =>
  API.post("/client/oauth/exchange-code", data);
API.subscribe = (data: any) => API.post("/client/subscribe", { email: data });

// Templates
API.saveTemplate = (data) => API.post("/client/template", data);
API.deleteTemplate = (id: string) => API.delete(`/client/template/${id}`);
API.listTemplates = () => API.get("/client/template");
API.listGlobalTemplates = () => API.get("/client/template/global");

export default API;
