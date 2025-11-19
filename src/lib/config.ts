/**
 * Environment configuration
 */
export const config = {
  // API base URL from environment variable with fallback
  apiUrl: import.meta.env.VITE_API_URL || 'https://localhost:8000',
  
  // Storage public base URL (Cloudflare R2)
  storagePublicUrl: import.meta.env.VITE_STORAGE_PUBLIC_URL || 'https://pub-59cfd11e5f0d4b00af54839edc83842d.r2.dev',
};

