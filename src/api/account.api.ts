import { api, endpoint } from "./api";

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