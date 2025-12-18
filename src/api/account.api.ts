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

// Checkers for uniqueness validation (email, phone, CID)
// Returns true if email EXISTS in database, false if email is UNIQUE (does NOT exist)
// Note: 404 status means email EXISTS (already in database)
export const checkEmailExist = async (email: string): Promise<boolean> => {
  try {
    const res = await api.get(`${endpoint.account}/checkEmailExist/${encodeURIComponent(email)}`);
    // If API returns success, email is UNIQUE (doesn't exist)
    const result = res.data;
    // Handle both boolean and string responses
    let isUnique: boolean;
    if (typeof result === 'boolean') {
      isUnique = result === true;
    } else if (typeof result === 'string') {
      isUnique = result.toLowerCase() === 'true';
    } else {
      isUnique = (result as boolean) === true;
    }
    
    // API returns true if UNIQUE, but we want to return true if EXISTS
    // So invert: if API says UNIQUE (true), we return EXISTS (false)
    // If API says EXISTS (false), we return EXISTS (true)
    const emailExists = !isUnique;
    return emailExists;
  } catch (err: any) {
    // 404 means email EXISTS (already in database)
    if (err?.response?.status === 404) {
      return true; // Email EXISTS
    }
    throw err;
  }
};

// Returns true if phone EXISTS in database, false if phone is UNIQUE (does NOT exist)
// Note: 404 status means phone EXISTS (already in database)
export const checkPhoneExist = async (phone: string): Promise<boolean> => {
  try {
    const res = await api.get(`${endpoint.account}/checkPhoneExist/${encodeURIComponent(phone)}`);
    // If API returns success, phone is UNIQUE (doesn't exist)
    const result = res.data;
    // Handle both boolean and string responses
    let isUnique: boolean;
    if (typeof result === 'boolean') {
      isUnique = result === true;
    } else if (typeof result === 'string') {
      isUnique = result.toLowerCase() === 'true';
    } else {
      isUnique = (result as boolean) === true;
    }
    
    // API returns true if UNIQUE, but we want to return true if EXISTS
    const phoneExists = !isUnique;
    return phoneExists;
  } catch (err: any) {
    // 404 means phone EXISTS (already in database)
    if (err?.response?.status === 404) {
      return true; // Phone EXISTS
    }
    throw err;
  }
};

// Returns true if CID EXISTS in database, false if CID is UNIQUE (does NOT exist)
// Note: 404 status means CID EXISTS (already in database)
export const checkCIDExist = async (cid: string): Promise<boolean> => {
  try {
    const res = await api.get(`${endpoint.account}/checkCIDExist/${encodeURIComponent(cid)}`);
    // If API returns success, CID is UNIQUE (doesn't exist)
    const result = res.data;
    // Handle both boolean and string responses
    let isUnique: boolean;
    if (typeof result === 'boolean') {
      isUnique = result === true;
    } else if (typeof result === 'string') {
      isUnique = result.toLowerCase() === 'true';
    } else {
      isUnique = (result as boolean) === true;
    }
    
    // API returns true if UNIQUE, but we want to return true if EXISTS
    const cidExists = !isUnique;
    return cidExists;
  } catch (err: any) {
    // 404 means CID EXISTS (already in database)
    if (err?.response?.status === 404) {
      return true; // CID EXISTS
    }
    throw err;
  }
};