export interface CreateContractRequest {
	teacherID: string;
	contractNumber: string;
	signedAt?: string | null;
	expiredAt?: string | null;
	contractStatusID: string;
	contractUrl?: string | null;
	fileHash: string;
}

export interface UpdateContractRequest {
	teacherID: string;
	contractNumber: string;
	signedAt?: string | null;
	expiredAt?: string | null;
	contractStatusID: string;
	contractUrl?: string | null;
	fileHash: string;
	isDeleted: boolean;
}

export interface ContractResponse {
	id: string;
	teacherID: string;
	contractNumber: string;
	signedAt?: string | null;
	expiredAt?: string | null;
	contractStatusID: string;
	contractUrl?: string | null;
	fileHash: string;
	createdAt: string;
	updatedAt?: string | null;
	updatedBy?: string | null;
	isDeleted: boolean;
}

export interface ContractStatusOption {
	id: string;
	name: string;
}


