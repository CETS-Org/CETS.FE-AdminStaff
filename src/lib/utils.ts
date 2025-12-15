import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ======================================================
// 1. MODELS (Defined locally as requested)
// ======================================================

export interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  roleNames?: string[]; // Danh sách role (VD: ["Admin", "Staff"])
  token?: string;       // Nếu lưu token gộp chung (tuỳ logic project)
}

// ======================================================
// 2. UI UTILITIES (Tailwind)
// ======================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ======================================================
// 3. AUTHENTICATION UTILITIES
// ======================================================

const STORAGE_KEY_TOKEN = 'authToken';
const STORAGE_KEY_USER = 'userInfo';

// Lấy JWT Token
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY_TOKEN);
}

// Kiểm tra Token còn hạn không
export function isTokenValid(): boolean {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    // Decode phần Payload của JWT (phần ở giữa 2 dấu chấm)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    const currentTime = Date.now() / 1000;
    
    // Kiểm tra thời gian hết hạn (exp)
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

// Xóa dữ liệu khi Logout
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_USER);
  // Dispatch sự kiện để UI cập nhật (nếu cần)
  window.dispatchEvent(new Event('auth:logout'));
}

// ======================================================
// 4. USER INFO UTILITIES
// ======================================================

// Lấy toàn bộ object UserInfo
export function getUserInfo(): UserInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const userInfo = localStorage.getItem(STORAGE_KEY_USER);
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error('Error parsing user info:', error);
    return null;
  }
}

/**
 * QUAN TRỌNG CHO FORM:
 * Lấy ID user hiện tại. Nếu chưa login, trả về Empty Guid 
 * để tránh lỗi crash khi submit form (CreatedBy/UpdatedBy).
 */
export function getCurrentUserId(): string {
  const userInfo = getUserInfo();
  return userInfo?.id || "00000000-0000-0000-0000-000000000000";
}

// Alias (nếu bạn quen dùng tên cũ)
export const getTeacherId = getCurrentUserId;
export const getStudentId = getCurrentUserId;

export function getUserEmail(): string | null {
  const userInfo = getUserInfo();
  return userInfo?.email || null;
}

export function getUserRole(): string | null {
  const userInfo = getUserInfo();
  // Lấy role đầu tiên nếu có nhiều role
  return userInfo?.roleNames?.[0] || null; 
}

// Check if user is staff (read-only access)
export function isStaffUser(): boolean {
  const role = getUserRole();
  return role === 'AcademicStaff' || role === 'AccountantStaff';
}

// Check if user is admin (full access)
export function isAdminUser(): boolean {
  const role = getUserRole();
  return role === 'Admin';
}

export function getUserPhone(): string | null {
  const userInfo = getUserInfo();
  return userInfo?.phoneNumber || null;
}

export function getUserFullName(): string {
    const userInfo = getUserInfo();
    return userInfo?.fullName || "Unknown User";
}

// ======================================================
// 5. UPDATE & SYNC
// ======================================================

// Cập nhật thông tin User (ví dụ sau khi update profile) và báo cho Header reload
export function setUserInfo(partial: Partial<UserInfo>): void {
  try {
    const current = getUserInfo() || ({} as UserInfo);
    const next = { ...current, ...partial } as UserInfo;
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(next));
    
    // Dispatch event custom để các component khác (Header/Sidebar) tự render lại
    window.dispatchEvent(new CustomEvent('userInfoUpdated'));
  } catch (error) {
    console.error('Failed to set user info:', error);
  }
}
