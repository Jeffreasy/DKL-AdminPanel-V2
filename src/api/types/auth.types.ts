export interface Permission {
    resource: string;
    action: string;
  }
  
  export interface Role {
    id: string;
    name: string;
    description: string;
    assigned_at?: string;
    is_active?: boolean;
  }
  
  export interface User {
    id: string;
    email: string;
    naam: string;
    is_actief: boolean;
    permissions?: Permission[];
    roles?: Role[];
    laatste_login?: string;
    created_at?: string;
  }
  
  // De exacte payload die de Go handler verwacht in c.BodyParser(&loginData)
  export interface LoginCredentials {
    email: string;
    wachtwoord: string;
  }
  
  // De response structuur van handleGebruikerLoginResponse
  export interface AuthResponse {
    success: boolean;
    token: string;         // Access Token (korte levensduur)
    refresh_token: string; // Refresh Token (lange levensduur)
    user: User;
  }
  
  export interface RefreshTokenRequest {
    refresh_token: string;
  }
  
  export interface RefreshTokenResponse {
    success: boolean;
    token: string;
    refresh_token: string;
  }
  
  // V46 Session Types
  export interface DeviceInfo {
    browser: string;
    browser_version: string;
    os: string;
    os_version: string;
    device_type: string;
    platform: string;
  }
  
  export interface Session {
    id: string;
    device_info: DeviceInfo;
    ip_address: string;
    user_agent: string;
    login_time: string;
    last_activity: string;
    is_current: boolean;
    display_name: string;
    location_info?: string;
  }
  
  export interface SessionListResponse {
    success: boolean;
    sessions: Session[];
  }
  
  export interface LogoutOptions {
    revoke_all_sessions?: boolean;
    session_id?: string;
  }
  
  // Password & Account Types
  export interface ForgotPasswordRequest {
    email: string;
  }
  
  export interface ResetPasswordRequest {
    huidig_wachtwoord: string;
    nieuw_wachtwoord: string;
  }
  
  export interface ResetPasswordWithTokenRequest {
    token: string;
    new_password: string;
  }
  
  export interface DeleteAccountRequest {
    password: string;
    reason?: string;
  }

  export interface VerifyEmailRequest {
    token: string;
  }

  export interface SendVerificationRequest {
    email: string;
  }

  // RBAC Types
  export interface RBACRole {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
    users?: Gebruiker[];
  }

  export interface UserRole {
    id: string;
    user_id: string;
    role_id: string;
    assigned_at: string;
    is_active: boolean;
    user?: Gebruiker;
    role?: RBACRole;
  }

  export interface Gebruiker {
    id: string;
    email: string;
    naam: string;
    is_actief: boolean;
    created_at: string;
    updated_at: string;
    role_id?: string; // Backward compatibility
    roles?: RBACRole[]; // Many-to-many relation
  }