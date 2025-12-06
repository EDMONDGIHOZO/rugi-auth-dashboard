import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import type {
  LoginRequest,
  LoginResponse,
  User,
  App,
  CreateAppRequest,
  CreateAppResponse,
  PaginatedResponse,
  AuditLog,
  AssignRoleRequest,
  AssignRoleResponse,
  CreateRoleRequest,
  UserAppRole,
  AppRolesResponse,
  AuthSettings,
  CreateAuthSettingsRequest,
  UpdateAuthSettingsRequest,
  PaginationParams,
  EmailConfig,
  CreateEmailConfigRequest,
  UpdateEmailConfigRequest,
} from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/**
 * Global axios factory that can create either a public or protected instance.
 * - Public instance: no auth headers, for unauthenticated endpoints
 * - Protected instance: attaches `Authorization` header when access token exists
 */
const createAxiosInstance = (
  options: { protected?: boolean } = {}
): AxiosInstance => {
  const { protected: isProtected = false } = options;

  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (isProtected) {
    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  return instance;
};

// Global instances to be reused across the app
export const publicApi = createAxiosInstance({ protected: false });
export const protectedApi = createAxiosInstance({ protected: true });

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshed = await this.refreshToken();
            if (refreshed) {
              originalRequest.headers.Authorization = `Bearer ${this.getAccessToken()}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    return localStorage.getItem("access_token");
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
  }

  private setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  }

  private clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>(
      "/login",
      credentials
    );
    this.setTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  }

  async register(data: {
    email: string;
    password: string;
    client_id: string;
    client_secret?: string;
  }): Promise<any> {
    const response = await this.client.post("/register", data);
    return response.data;
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;

      const clientId = import.meta.env.VITE_DASHBOARD_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_DASHBOARD_CLIENT_SECRET;

      const payload: Record<string, any> = {
        refresh_token: refreshToken,
      };

      if (clientId) {
        payload.client_id = clientId;
      }

      if (clientSecret) {
        payload.client_secret = clientSecret;
      }

      const response = await this.client.post<LoginResponse>(
        "/refresh",
        payload
      );
      this.setTokens(response.data.access_token, response.data.refresh_token);
      return true;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  async revokeToken(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      await this.client.post("/revoke", { refresh_token: refreshToken });
    }
    this.clearTokens();
  }

  async getMe(): Promise<User> {
    const response = await this.client.get<User>("/me");
    return response.data;
  }

  // Apps methods
  async getApps(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  }): Promise<PaginatedResponse<App>> {
    const filteredParams =
      params && typeof params.search !== "undefined" ? { ...params } : params;

    if (filteredParams && filteredParams.search === "") {
      delete filteredParams.search;
    }

    const response = await this.client.get<PaginatedResponse<App>>("/apps", {
      params: filteredParams,
    });
    return response.data;
  }

  async getApp(appId: string): Promise<App> {
    const response = await this.client.get<App>(`/apps/${appId}`);
    return response.data;
  }

  async createApp(data: CreateAppRequest): Promise<CreateAppResponse> {
    const response = await this.client.post<CreateAppResponse>("/apps", data);
    return response.data;
  }

  async updateApp(
    appId: string,
    data: Partial<CreateAppRequest>
  ): Promise<App> {
    const response = await this.client.put<App>(`/apps/${appId}`, data);
    return response.data;
  }

  async deleteApp(appId: string): Promise<void> {
    await this.client.delete(`/apps/${appId}`);
  }

  async getAppUsers(appId: string): Promise<UserAppRole[]> {
    const response = await this.client.get<UserAppRole[]>(
      `/apps/${appId}/users`
    );
    return response.data;
  }

  async getAppRoles(appId: string): Promise<AppRolesResponse> {
    const response = await this.client.get<AppRolesResponse>(
      `/apps/${appId}/roles`
    );
    return response.data;
  }

  async createAppRole(appId: string, data: CreateRoleRequest): Promise<any> {
    const response = await this.client.post(`/apps/${appId}/roles`, data);
    return response.data;
  }

  async deleteAppRole(appId: string, roleId: number): Promise<void> {
    await this.client.delete(`/apps/${appId}/roles/${roleId}`);
  }

  // Users methods
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    verified?: boolean;
    mfaEnabled?: boolean;
  }): Promise<PaginatedResponse<User>> {
    const queryParams = params ? { ...params } : undefined;

    if (queryParams?.search?.trim() === "") {
      delete queryParams.search;
    }

    const response = await this.client.get<PaginatedResponse<User>>("/users", {
      params: queryParams,
    });
    return response.data;
  }

  async inviteUser(data: { email: string; app_ids: string[] }): Promise<any> {
    const response = await this.client.post("/users/invite", data);
    return response.data;
  }

  async getUser(userId: string): Promise<User> {
    const response = await this.client.get<{ user: User }>(`/users/${userId}`);
    return response.data.user;
  }

  async updateUser(
    userId: string,
    data: Partial<{
      email: string;
      isEmailVerified: boolean;
      mfaEnabled: boolean;
    }>
  ): Promise<User> {
    const response = await this.client.put<User>(`/users/${userId}`, data);
    return response.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.client.delete(`/users/${userId}`);
  }

  async getUserRoles(userId: string): Promise<UserAppRole[]> {
    const response = await this.client.get<UserAppRole[]>(
      `/users/${userId}/roles`
    );
    return response.data;
  }

  async assignRole(
    userId: string,
    data: AssignRoleRequest
  ): Promise<AssignRoleResponse> {
    const response = await this.client.post<AssignRoleResponse>(
      `/users/${userId}/roles`,
      data
    );
    return response.data;
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    await this.client.delete(`/users/${userId}/roles/${roleId}`);
  }

  // Audit logs
  async getAuditLogs(params?: {
    user_id?: string;
    action?: string;
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<AuditLog>> {
    const response = await this.client.get<PaginatedResponse<AuditLog>>(
      "/audit",
      { params }
    );
    return response.data;
  }

  // Auth settings
  async createAuthSettings(
    appId: string,
    data: CreateAuthSettingsRequest
  ): Promise<AuthSettings> {
    const response = await this.client.post<AuthSettings>(
      `/apps/${appId}/auth-settings`,
      data
    );
    return response.data;
  }

  async updateAuthSettings(
    appId: string,
    data: UpdateAuthSettingsRequest
  ): Promise<AuthSettings> {
    const response = await this.client.patch<AuthSettings>(
      `/apps/${appId}/auth-settings`,
      data
    );
    return response.data;
  }

  async getAllAuthSettings(
    params?: PaginationParams
  ): Promise<PaginatedResponse<AuthSettings>> {
    const response = await this.client.get<PaginatedResponse<AuthSettings>>(
      "/auth-settings",
      { params }
    );
    return response.data;
  }

  // Email config methods
  async getEmailConfig(appId: string): Promise<EmailConfig> {
    const response = await this.client.get<EmailConfig>(
      `/apps/${appId}/email-config`
    );
    return response.data;
  }

  async createEmailConfig(
    appId: string,
    data: CreateEmailConfigRequest
  ): Promise<EmailConfig> {
    const response = await this.client.post<EmailConfig>(
      `/apps/${appId}/email-config`,
      data
    );
    return response.data;
  }

  async updateEmailConfig(
    appId: string,
    data: UpdateEmailConfigRequest
  ): Promise<EmailConfig> {
    const response = await this.client.patch<EmailConfig>(
      `/apps/${appId}/email-config`,
      data
    );
    return response.data;
  }
}

export const apiClient = new ApiClient();
