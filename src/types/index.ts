export interface User {
  id: string;
  email: string;
  isEmailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  optedInApps?: string[];
  roles?: {
    role: string;
    app: {
      id: string;
      name: string;
      clientId: string;
    };
    assignedAt: string;
  }[];
}

export interface App {
  id: string;
  name: string;
  client_id: string;
  client_secret?: string;
  type: "PUBLIC" | "CONFIDENTIAL";
  redirect_uris: string[];
  roles?: string[];
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface UserAppRole {
  id: string;
  user: { id: string; email: string };
  app: { id: string; name: string; clientId: string };
  role: { id: number; name: string };
  assigned_at: string;
  assigned_by?: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  user?: { id: string; email: string };
  action: "LOGIN" | "REFRESH" | "REVOKE" | "ROLE_ASSIGN" | "REGISTER";
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface RefreshToken {
  token: string;
  userId: string;
  appId: string;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
  deviceInfo?: Record<string, any>;
}

export interface LoginRequest {
  email: string;
  password: string;
  client_id: string;
  client_secret?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAppRequest {
  name: string;
  type: "PUBLIC" | "CONFIDENTIAL";
  redirect_uris: string[];
  roles?: string[];
}

export interface CreateAppResponse {
  message: string;
  app: App;
}

export interface CreateRoleRequest {
  role_name: string;
}

export interface AssignRoleRequest {
  app_uuid: string;
  role_name: string;
}

export interface AssignRoleResponse {
  message: string;
  userAppRole: UserAppRole;
}

export interface AuthSettings {
  id: string;
  app_id: string;
  email_password_enabled: boolean;
  email_otp_enabled: boolean;
  google_auth_enabled: boolean;
  google_client_id?: string | null;
  google_client_secret?: string | null; // Usually hidden in GET, used in POST/PATCH
  github_auth_enabled: boolean;
  github_client_id?: string | null;
  github_client_secret?: string | null;
  microsoft_auth_enabled: boolean;
  microsoft_client_id?: string | null;
  microsoft_client_secret?: string | null;
  facebook_auth_enabled: boolean;
  facebook_client_id?: string | null;
  facebook_client_secret?: string | null;
  require_email_verification: boolean;
  allow_registration: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateAuthSettingsRequest {
  email_password_enabled?: boolean;
  email_otp_enabled?: boolean;
  google_auth_enabled?: boolean;
  google_client_id?: string;
  google_client_secret?: string;
  github_auth_enabled?: boolean;
  github_client_id?: string;
  github_client_secret?: string;
  microsoft_auth_enabled?: boolean;
  microsoft_client_id?: string;
  microsoft_client_secret?: string;
  facebook_auth_enabled?: boolean;
  facebook_client_id?: string;
  facebook_client_secret?: string;
  require_email_verification?: boolean;
  allow_registration?: boolean;
}

export interface CreateAuthSettingsRequest extends UpdateAuthSettingsRequest {}

export interface AuthMethodCheck {
  app_id: string;
  method: string;
  enabled: boolean;
}

export interface AppRolesResponse {
  app: {
    id: string;
    name: string;
  };
  roles: (Role & { userCount: number })[];
}
