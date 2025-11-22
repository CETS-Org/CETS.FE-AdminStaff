import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Account } from "@/types/account.type"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function clearAuthData(): void {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userInfo')
}

export function getUserInfo(): Account | null {
  try {
    const userInfo = localStorage.getItem('userInfo')
    return userInfo ? JSON.parse(userInfo) : null
  } catch (error) {
    console.error('Error parsing user info:', error)
    return null
  }
}
