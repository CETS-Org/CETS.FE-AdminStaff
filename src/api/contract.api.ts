import { api, endpoint } from './api';
import type { ContractResponse, CreateContractRequest, UpdateContractRequest } from '@/types/contract.type';

// Compute SHA-256 hash of a File or ArrayBuffer
export async function computeSHA256(input: File | ArrayBuffer): Promise<string> {
	const buffer = input instanceof File ? await input.arrayBuffer() : input;
	const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const base = '/api/HR_Contract';

export async function getContracts(): Promise<ContractResponse[]> {
	const res = await api.get<ContractResponse[]>(`${base}`);
	return res.data;
}

export async function getContractById(id: string): Promise<ContractResponse> {
	const res = await api.get<ContractResponse>(`${base}/${id}`);
	return res.data;
}

// Create with optional file upload: first upload file to storage if provided to get contractUrl and fileHash
export async function createContract(data: CreateContractRequest, file?: File): Promise<ContractResponse> {
	let payload: CreateContractRequest = { ...data };
	if (file) {
		const fileHash = await computeSHA256(file);
		// Assume backend can accept multipart or a pre-uploaded URL. If storage requires pre-upload, adjust accordingly.
		const form = new FormData();
		form.append('file', file);
		const uploadRes = await api.post<{ url: string }>(`${base}/upload`, form, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});
		payload = { ...payload, contractUrl: uploadRes.data.url, fileHash };
	}
	const res = await api.post<ContractResponse>(`${base}`, payload);
	return res.data;
}

export async function updateContract(id: string, data: UpdateContractRequest, file?: File): Promise<ContractResponse> {
	let payload: UpdateContractRequest = { ...data };
	if (file) {
		const fileHash = await computeSHA256(file);
		const form = new FormData();
		form.append('file', file);
		const uploadRes = await api.post<{ url: string }>(`${base}/upload`, form, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});
		payload = { ...payload, contractUrl: uploadRes.data.url, fileHash };
	}
	const res = await api.put<ContractResponse>(`${base}/${id}`, payload);
	return res.data;
}

export async function deleteContract(id: string): Promise<void> {
	await api.delete(`${base}/${id}`);
}

// Helper for status options if an endpoint exists
export async function getContractStatuses(): Promise<Array<{ id: string; name: string }>> {
	const res = await api.get<Array<{ id: string; name: string }>>(`${base}/statuses`);
	return res.data;
}


