import { apiClient } from './api';
import {
  RegisterRequest,
  LoginRequest,
  VerifyOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  ApiResponse,
} from '../types';

export const authService = {
  async register(data: RegisterRequest): Promise<ApiResponse<string>> {
    return apiClient.post<ApiResponse<string>>('/auth/register', data);
  },

  async verifyRegistration(data: VerifyOtpRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>('/auth/verify', data);
  },

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<string>> {
    return apiClient.post<ApiResponse<string>>('/auth/forgot-password', data);
  },

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<string>> {
    return apiClient.post<ApiResponse<string>>('/auth/reset-password', data);
  },

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  saveTokens(authResponse: AuthResponse): void {
    localStorage.setItem('accessToken', authResponse.accessToken);
    localStorage.setItem('refreshToken', authResponse.refreshToken);
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};
