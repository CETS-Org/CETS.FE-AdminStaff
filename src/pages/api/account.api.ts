import axios, { type AxiosResponse } from 'axios';

// Types for Account data structure
export interface Account {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'staff' | 'teacher' | 'student';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  avatar?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface CreateAccountRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'staff' | 'teacher' | 'student';
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
}

export interface UpdateAccountRequest {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'staff' | 'teacher' | 'student';
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
}

export interface AccountListResponse {
  accounts: Account[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AccountSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface Teacher {
  accountId: string;
  email: string;
  phoneNumber: string | null;
  fullName: string;
  dateOfBirth: string | null;
  cid: string | null;
  address: string | null;
  avatarUrl: string | null;
  accountStatusID: string;
  isVerified: boolean;
  verifiedCode: string | null;
  verifiedCodeExpiresAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  statusName: string;
  roleNames: string[];
  studentInfo: any | null;
  teacherInfo: any | null;
}


// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7096',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('authToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Handle unauthorized access
//       localStorage.removeItem('authToken');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// CRUD Functions for Account Management

/**
 * Get all accounts with pagination and filtering
 */
export const getTeachers = async (): Promise<Teacher[]> => {
  try {
    const response = await api.get<Teacher[]>('/api/IDN_Account', {
      params: {   
        RoleName: 'Teacher',     
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    throw error;
  }
};


/**
 * Get a single account by ID
 */
export const getAccountById = async (id: string): Promise<Account> => {
  try {
    const response: AxiosResponse<ApiResponse<Account>> = await api.get(`/api/accounts/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching account ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new account
 */
export const createAccount = async (accountData: CreateAccountRequest): Promise<Account> => {
  try {
    const response: AxiosResponse<ApiResponse<Account>> = await api.post('/api/accounts', accountData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};

/**
 * Update an existing account
 */
export const updateAccount = async (id: string, accountData: UpdateAccountRequest): Promise<Account> => {
  try {
    const response: AxiosResponse<ApiResponse<Account>> = await api.put(`/api/accounts/${id}`, accountData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating account ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an account
 */
export const deleteAccount = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/accounts/${id}`);
  } catch (error) {
    console.error(`Error deleting account ${id}:`, error);
    throw error;
  }
};

/**
 * Update account status
 */
export const updateAccountStatus = async (
  id: string, 
  status: 'active' | 'inactive' | 'pending' | 'suspended'
): Promise<Account> => {
  try {
    const response: AxiosResponse<ApiResponse<Account>> = await api.patch(`/api/accounts/${id}/status`, { status });
    return response.data.data;
  } catch (error) {
    console.error(`Error updating account status ${id}:`, error);
    throw error;
  }
};

/**
 * Change account password
 */
export const changeAccountPassword = async (
  id: string, 
  currentPassword: string, 
  newPassword: string
): Promise<void> => {
  try {
    await api.patch(`/api/accounts/${id}/password`, {
      currentPassword,
      newPassword,
    });
  } catch (error) {
    console.error(`Error changing password for account ${id}:`, error);
    throw error;
  }
};

/**
 * Reset account password (admin only)
 */
export const resetAccountPassword = async (id: string): Promise<{ temporaryPassword: string }> => {
  try {
    const response: AxiosResponse<ApiResponse<{ temporaryPassword: string }>> = await api.post(`/api/accounts/${id}/reset-password`);
    return response.data.data;
  } catch (error) {
    console.error(`Error resetting password for account ${id}:`, error);
    throw error;
  }
};

/**
 * Upload account avatar
 */
export const uploadAccountAvatar = async (id: string, file: File): Promise<Account> => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response: AxiosResponse<ApiResponse<Account>> = await api.post(
      `/api/accounts/${id}/avatar`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error uploading avatar for account ${id}:`, error);
    throw error;
  }
};

/**
 * Delete account avatar
 */
export const deleteAccountAvatar = async (id: string): Promise<Account> => {
  try {
    const response: AxiosResponse<ApiResponse<Account>> = await api.delete(`/api/accounts/${id}/avatar`);
    return response.data.data;
  } catch (error) {
    console.error(`Error deleting avatar for account ${id}:`, error);
    throw error;
  }
};

/**
 * Get accounts by role
 */
export const getAccountsByRole = async (role: string, params?: Omit<AccountSearchParams, 'role'>): Promise<AccountListResponse> => {
  try {
    const response: AxiosResponse<ApiResponse<AccountListResponse>> = await api.get(`/api/accounts/role/${role}`, {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        search: params?.search,
        status: params?.status,
        sortBy: params?.sortBy || 'createdAt',
        sortOrder: params?.sortOrder || 'desc',
      },
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching accounts by role ${role}:`, error);
    throw error;
  }
};

/**
 * Search accounts by email or username
 */
export const searchAccounts = async (query: string, params?: Omit<AccountSearchParams, 'search'>): Promise<AccountListResponse> => {
  try {
    const response: AxiosResponse<ApiResponse<AccountListResponse>> = await api.get('/api/accounts/search', {
      params: {
        q: query,
        page: params?.page || 1,
        limit: params?.limit || 10,
        role: params?.role,
        status: params?.status,
        sortBy: params?.sortBy || 'createdAt',
        sortOrder: params?.sortOrder || 'desc',
      },
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error searching accounts with query "${query}":`, error);
    throw error;
  }
};

/**
 * Bulk update account status
 */
export const bulkUpdateAccountStatus = async (
  accountIds: string[], 
  status: 'active' | 'inactive' | 'pending' | 'suspended'
): Promise<{ updated: number; failed: string[] }> => {
  try {
    const response: AxiosResponse<ApiResponse<{ updated: number; failed: string[] }>> = await api.patch('/api/accounts/bulk/status', {
      accountIds,
      status,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error bulk updating account status:', error);
    throw error;
  }
};

/**
 * Bulk delete accounts
 */
export const bulkDeleteAccounts = async (accountIds: string[]): Promise<{ deleted: number; failed: string[] }> => {
  try {
    const response: AxiosResponse<ApiResponse<{ deleted: number; failed: string[] }>> = await api.delete('/api/accounts/bulk', {
      data: { accountIds },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error bulk deleting accounts:', error);
    throw error;
  }
};

/**
 * Get account statistics
 */
export const getAccountStats = async (): Promise<{
  total: number;
  active: number;
  inactive: number;
  pending: number;
  suspended: number;
  byRole: Record<string, number>;
}> => {
  try {
    const response: AxiosResponse<ApiResponse<{
      total: number;
      active: number;
      inactive: number;
      pending: number;
      suspended: number;
      byRole: Record<string, number>;
    }>> = await api.get('/api/accounts/stats');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching account statistics:', error);
    throw error;
  }
};

export default {
  getTeachers,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  updateAccountStatus,
  changeAccountPassword,
  resetAccountPassword,
  uploadAccountAvatar,
  deleteAccountAvatar,
  getAccountsByRole,
  searchAccounts,
  bulkUpdateAccountStatus,
  bulkDeleteAccounts,
  getAccountStats,
};
