import { api, endpoint } from "./api";
import type { Transaction, TransactionFilter, PaginatedTransactionResponse } from "@/types/transaction.type";

export const transactionApi = {
  // Get all transactions
  getAll: async (filters?: TransactionFilter): Promise<Transaction[]> => {
    const params = new URLSearchParams();
    if (filters?.eventType) params.append('eventType', filters.eventType);
    if (filters?.gatewayName) params.append('gatewayName', filters.gatewayName);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
    if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
    
    const url = params.toString() ? `${endpoint.paymentWebhook}?${params}` : endpoint.paymentWebhook;
    const response = await api.get<Transaction[]>(url);
    return response.data;
  },

  // Get transaction by ID
  getById: async (id: string): Promise<Transaction> => {
    const response = await api.get<Transaction>(`${endpoint.paymentWebhook}/${id}`);
    return response.data;
  },

  // Get paginated transactions for admin
  getAllPaginated: async (filters?: TransactionFilter): Promise<PaginatedTransactionResponse> => {
    const params = new URLSearchParams();
    if (filters?.eventType) params.append('eventType', filters.eventType);
    if (filters?.accountName) params.append('accountName', filters.accountName);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
    if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    
    const url = params.toString() ? `${endpoint.paymentWebhook}/paginated?${params}` : `${endpoint.paymentWebhook}/paginated`;
    const response = await api.get<PaginatedTransactionResponse>(url);
    return response.data;
  },

  // Export transactions (optional)
  exportTransactions: async (filters?: TransactionFilter): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters?.eventType) params.append('eventType', filters.eventType);
    if (filters?.gatewayName) params.append('gatewayName', filters.gatewayName);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    
    const url = params.toString() ? `${endpoint.paymentWebhook}/export?${params}` : `${endpoint.paymentWebhook}/export`;
    const response = await api.get(url, {
      responseType: 'blob',
    });
    return response.data;
  },
};

