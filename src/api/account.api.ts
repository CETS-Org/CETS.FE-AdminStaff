import type { Role } from "@/types/account.type";
import { api, endpoint } from "./api";

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