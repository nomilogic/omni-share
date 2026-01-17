/**
 * JWT-based Authentication Service
 * Handles authentication using JWT tokens from backend
 * Abstracts away Supabase implementation details
 */

import { notify } from "@/utils/toast";
import API from "../services/api";

export interface User {
  id: string;
  email: string;
  name?: string;
  profile_type?: "individual" | "business";
  plan?: "free" | "ipro" | "business";
  created_at?: Date;
  profile?: any;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  error?: string;
}

class JWTAuthService {
  private readonly TOKEN_KEY = "auth_token";
  private readonly REFRESH_TOKEN_KEY = "refresh_token";
  private readonly USER_KEY = "current_user";
  private refreshTimeout: NodeJS.Timeout | null = null;

  /**
   * Register new user
   */
  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<AuthResponse> {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (data.success) {
        this.setTokens(data.token, data.refreshToken);
        this.setUser(data.user);
        this.scheduleTokenRefresh(data.token);
        return { success: true, user: data.user, token: data.token };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      return { success: false, error: error.message || "Registration failed" };
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        this.setTokens(data.token, data.refreshToken);
        this.setUser(data.user);
        this.scheduleTokenRefresh(data.token);
        return { success: true, user: data.user, token: data.token };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: error.message || "Login failed" };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await API.logout();
      }
    } catch (error) {
      notify("error", "Logout failed.");
      console.warn(" API call failed:", error);
    } finally {
      this.clearTokens();
      this.clearRefreshTimeout();
    }
  }

  /**
   * Get current user from server
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          this.setUser(data.user);
          return data.user;
        }
      } else if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await this.refreshToken();
        if (refreshed) {
          return this.getCurrentUser(); // Retry with new token
        }
      }

      return null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Get cached user from localStorage
   */
  getCachedUser(): User | null {
    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error("Error getting cached user:", error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCachedUser();
    return !!(token && user);
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        return false;
      }

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.success) {
        this.setTokens(data.token, data.refreshToken);
        this.scheduleTokenRefresh(data.token);
        return true;
      } else {
        this.clearTokens();
        return false;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      this.clearTokens();
      return false;
    }
  }

  /**
   * Set tokens in localStorage
   */
  private setTokens(token: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Set user in localStorage
   */
  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Clear tokens from localStorage
   */
  private clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(token: string): void {
    try {
      // Decode JWT to get expiration time
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;

      // Refresh 5 minutes before expiry
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60 * 1000);

      this.clearRefreshTimeout();
      this.refreshTimeout = setTimeout(async () => {
        const success = await this.refreshToken();
        if (!success) {
          // Refresh failed, user needs to login again
          this.clearTokens();
        }
      }, refreshTime);
    } catch (error) {
      console.error("Error scheduling token refresh:", error);
    }
  }

  /**
   * Clear refresh timeout
   */
  private clearRefreshTimeout(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  /**
   * Listen to auth state changes (simplified)
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    // For JWT auth, we'll check periodically or on storage events
    const interval = setInterval(async () => {
      const cachedUser = this.getCachedUser();
      const hasToken = this.isAuthenticated();

      if (hasToken && cachedUser) {
        callback(cachedUser);
      } else {
        callback(null);
      }
    }, 1000);

    // Also listen to storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === this.TOKEN_KEY || e.key === this.USER_KEY) {
        const user = this.getCachedUser();
        const hasToken = this.isAuthenticated();
        callback(hasToken && user ? user : null);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Return cleanup function
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }
}

// Export singleton instance
export const authService = new JWTAuthService();

// Backward compatibility exports
export const getCurrentUser = () => authService.getCurrentUser();
export const signInWithEmail = (email: string, password: string) =>
  authService.login(email, password);
export const signUpWithEmail = (
  email: string,
  password: string,
  name?: string
) => authService.register(email, password, name);

// For demo purposes - create temporary demo user for testing
export const signInAnonymously = async () => {
  console.log("🔧 Creating demo user for testing...");

  // Try to login with demo credentials first
  try {
    const loginResult = await authService.login(
      "demo@example.com",
      "password123"
    );
    if (loginResult.success) {
      console.log("✅ Demo user logged in successfully");
      return loginResult.user;
    }
  } catch (error) {
    console.log("Demo user login failed, trying to register...");
  }

  // If login fails, try to register demo user
  try {
    const registerResult = await authService.register(
      "demo@example.com",
      "password123",
      "Demo User"
    );
    if (registerResult.success) {
      console.log("✅ Demo user registered and logged in successfully");
      return registerResult.user;
    } else {
      console.error("❌ Failed to create demo user:", registerResult.error);
      return null;
    }
  } catch (error) {
    console.error("❌ Error creating demo user:", error);
    return null;
  }
};

export default authService;
