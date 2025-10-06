import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

export const loginAcademicStaff = (credentials: any, config?: AxiosRequestConfig) =>
  api.post(`${endpoint.account}/login/academicStaff`, credentials, config);

export const loginAccountantStaff = (credentials: any, config?: AxiosRequestConfig) =>
  api.post(`${endpoint.account}/login/accountantStaff`, credentials, config);

export const loginAdmin = (credentials: any, config?: AxiosRequestConfig) =>
  api.post(`${endpoint.account}/login/admin`, credentials, config);

import type { Role } from "@/types/account.type";

// Types for forgot password flow
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  token: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  token: string;
}

export interface VerifyOtpResponse {
  message: string;
  token: string;
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  token: string;
}

export interface ResetPasswordResponse {
  message: string;
  account: boolean;
}

// Forgot password API functions
export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  try {
    const response = await api.post(`${endpoint.account}/forgot-password`, email);
    return response.data;
  } catch (error) {
    console.error('Error sending forgot password request:', error);
    throw error;
  }
};

export const verifyOtp = async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
  try {
    const response = await api.post(`${endpoint.account}/verify-otp`, data);
    return response.data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  try {
    const response = await api.post(`${endpoint.account}/reset-password`, data);
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

export const setIsDelete = async (id: string) : Promise<void> =>{
    try {
        const response = await api.patch(`${endpoint.account}/deactivate/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error setting isDelete for account ${id}:`, error);
        throw error;
    }
}

export const setIsActive = async (id: string) : Promise<void> =>{
    try {
        const response = await api.patch(`${endpoint.account}/activate/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error setting isActive for account ${id}:`, error);
        throw error;
    }
}

export const getRole = async (): Promise<Role[]> => {
    try {
        const response = await api.get<Role[]>(`${endpoint.role}`);
        return response.data;
    } catch (error) {
        console.error(`Error getting role:`, error);
        throw error;
    }
}

// Change password types and API
export interface ChangePasswordRequest {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
  account: boolean;
}

export const changePassword = async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
  try {
    const response = await api.post(`${endpoint.account}/change-password`, data);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Resend verification email types and API
export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
  success: boolean;
}

export const resendVerificationEmail = async (email: string): Promise<ResendVerificationResponse> => {
  try {
    const response = await api.post(`${endpoint.account}/resend-verification`, { email });
    return response.data;
  } catch (error) {
    console.error('Error resending verification email:', error);
    throw error;
  }
};