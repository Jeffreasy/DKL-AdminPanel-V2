import apiClient from '@/api/axios.client';
import {
  LoginCredentials,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutOptions,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResetPasswordWithTokenRequest,
  User,
  SessionListResponse,
  DeleteAccountRequest,
  VerifyEmailRequest,
  SendVerificationRequest
} from '@/api/types/auth.types';

class AuthService {
  private static instance: AuthService;
  
  // Base path matches your Go Router group
  private readonly BASE_PATH = '/auth';

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Inloggen gebruiker
   * Endpoint: POST /api/auth/login
   */
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`${this.BASE_PATH}/login`, credentials);
    return response.data;
  }

  /**
   * Uitloggen
   * Endpoint: POST /api/auth/logout
   */
  public async logout(options?: LogoutOptions): Promise<{ message: string }> {
    const response = await apiClient.post(`${this.BASE_PATH}/logout`, options);
    return response.data;
  }

  /**
   * Refresh Access Token
   * Endpoint: POST /api/auth/refresh
   */
  public async refreshToken(token: string): Promise<RefreshTokenResponse> {
    const payload: RefreshTokenRequest = { refresh_token: token };
    const response = await apiClient.post<RefreshTokenResponse>(`${this.BASE_PATH}/refresh`, payload);
    return response.data;
  }

  /**
   * Haal profiel op van ingelogde gebruiker
   * Endpoint: GET /api/auth/profile
   */
  public async getProfile(): Promise<User> {
    const response = await apiClient.get<User>(`${this.BASE_PATH}/profile`);
    return response.data;
  }

  // --- Password Management ---

  /**
   * Wachtwoord vergeten aanvraag
   * Endpoint: POST /api/auth/forgot-password
   */
  public async forgotPassword(email: string): Promise<{ message: string }> {
    const payload: ForgotPasswordRequest = { email };
    const response = await apiClient.post(`${this.BASE_PATH}/forgot-password`, payload);
    return response.data;
  }

  /**
   * Wachtwoord wijzigen (als je al ingelogd bent)
   * Endpoint: POST /api/auth/reset-password
   */
  public async updatePassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post(`${this.BASE_PATH}/reset-password`, data);
    return response.data;
  }

  /**
   * Wachtwoord resetten met token (vanuit email)
   * Endpoint: POST /api/auth/reset-password-with-token
   */
  public async resetPasswordWithToken(data: ResetPasswordWithTokenRequest): Promise<{ message: string }> {
    const response = await apiClient.post(`${this.BASE_PATH}/reset-password-with-token`, {
      token: data.token,
      new_password: data.new_password // Backend verwacht snake_case field names in struct
    });
    return response.data;
  }

  // --- Session Management (V46) ---

  /**
   * Lijst alle actieve sessies
   * Endpoint: GET /api/auth/sessions
   */
  public async getSessions(): Promise<SessionListResponse> {
    const response = await apiClient.get<SessionListResponse>(`${this.BASE_PATH}/sessions`);
    return response.data;
  }

  /**
   * Trek specifieke sessie in
   * Endpoint: DELETE /api/auth/sessions/{sessionId}
   */
  public async revokeSession(sessionId: string): Promise<{ success: true; message: string }> {
    const response = await apiClient.delete(`${this.BASE_PATH}/sessions/${sessionId}`);
    return response.data;
  }

  /**
   * Trek alle andere sessies in behalve de huidige
   * Endpoint: POST /api/auth/sessions/revoke-others
   */
  public async revokeOtherSessions(): Promise<{ success: true; message: string }> {
    const response = await apiClient.post(`${this.BASE_PATH}/sessions/revoke-others`);
    return response.data;
  }

  // --- Account Management ---

  /**
   * Account verwijderen
   * Endpoint: DELETE /api/auth/account
   */
  public async deleteAccount(data: DeleteAccountRequest): Promise<{ success: boolean; message: string }> {
    // DELETE request with body requires "data" property in axios config
    const response = await apiClient.delete(`${this.BASE_PATH}/account`, { data });
    return response.data;
  }

  /**
   * Reset Password using Token
   * Endpoint: POST /api/auth/reset-password-with-token
   */
  public async resetPassword(token: string, newPassword: string) {
    return apiClient.post(`${this.BASE_PATH}/reset-password-with-token`, {
      token,
      new_password: newPassword
    } as ResetPasswordWithTokenRequest);
  }

  /**
   * Verify Email Address
   * Endpoint: POST /api/auth/verify-email
   */
  public async verifyEmail(token: string) {
    return apiClient.post(`${this.BASE_PATH}/verify-email`, { token } as VerifyEmailRequest);
  }

  /**
   * Resend Verification Email
   * Endpoint: POST /api/auth/send-verification
   */
  public async resendVerification(email: string) {
    return apiClient.post(`${this.BASE_PATH}/send-verification`, { email } as SendVerificationRequest);
  }
}

export const authService = AuthService.getInstance();