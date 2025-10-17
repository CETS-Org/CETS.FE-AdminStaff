import { api } from "./api";
import type { Promotion } from "@/types/promotion.type";

// API endpoint
const PROMOTION_ENDPOINT = "/api/FIN_Promotion";

// Get all promotions
export const getPromotions = async (): Promise<Promotion[]> => {
  try {
    console.log("Fetching promotions from API...");
    const response = await api.get<Promotion[]>(PROMOTION_ENDPOINT);
    console.log("Promotions received:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching promotions:", error);
    throw error;
  }
};

// Get promotion by ID
export const getPromotionById = async (id: string): Promise<Promotion> => {
  try {
    const response = await api.get<Promotion>(`${PROMOTION_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching promotion ${id}:`, error);
    throw error;
  }
};

// Create new promotion
export const createPromotion = async (promotionData: Omit<Promotion, "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "createdByNavigation" | "updatedByNavigation">): Promise<Promotion> => {
  try {
    console.log("Creating promotion:", promotionData);
    const response = await api.post<Promotion>(PROMOTION_ENDPOINT, promotionData);
    console.log("Promotion created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating promotion:", error);
    throw error;
  }
};

// Update promotion
export const updatePromotion = async (id: string, promotionData: Partial<Promotion>): Promise<Promotion> => {
  try {
    console.log(`Updating promotion ${id}:`, promotionData);
    const response = await api.put<Promotion>(`${PROMOTION_ENDPOINT}/${id}`, promotionData);
    console.log("Promotion updated:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating promotion ${id}:`, error);
    throw error;
  }
};

// Delete promotion
export const deletePromotion = async (id: string): Promise<void> => {
  try {
    console.log(`Deleting promotion ${id}`);
    await api.delete(`${PROMOTION_ENDPOINT}/${id}`);
    console.log("Promotion deleted successfully");
  } catch (error) {
    console.error(`Error deleting promotion ${id}:`, error);
    throw error;
  }
};

// Toggle promotion active status
export const togglePromotionStatus = async (id: string, isActive: boolean): Promise<Promotion> => {
  try {
    console.log(`Toggling promotion ${id} status to ${isActive}`);
    const response = await api.patch<Promotion>(`${PROMOTION_ENDPOINT}/${id}/status`, { isActive });
    console.log("Promotion status updated:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error toggling promotion ${id} status:`, error);
    throw error;
  }
};

// Bulk delete promotions
export const bulkDeletePromotions = async (ids: string[]): Promise<void> => {
  try {
    console.log("Bulk deleting promotions:", ids);
    await api.post(`${PROMOTION_ENDPOINT}/bulk-delete`, { ids });
    console.log("Promotions bulk deleted successfully");
  } catch (error) {
    console.error("Error bulk deleting promotions:", error);
    throw error;
  }
};

// Bulk activate promotions
export const bulkActivatePromotions = async (ids: string[]): Promise<void> => {
  try {
    console.log("Bulk activating promotions:", ids);
    await api.post(`${PROMOTION_ENDPOINT}/bulk-activate`, { ids });
    console.log("Promotions bulk activated successfully");
  } catch (error) {
    console.error("Error bulk activating promotions:", error);
    throw error;
  }
};

