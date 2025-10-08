import type { ContractResponse } from '@/types/contract.type';

export const mockContracts: ContractResponse[] = [
  {
    id: 'c-1001',
    teacherID: 't-1',
    contractNumber: 'CT-2025-001',
    signedAt: new Date(2025, 0, 10).toISOString(),
    expiredAt: new Date(2026, 0, 10).toISOString(),
    contractStatusID: 'active',
    contractUrl: 'https://example.com/contracts/CT-2025-001.pdf',
    fileHash: '3f786850e387550fdab836ed7e6dc881de23001b5b5a1efc9dc2b61a5a44f07d',
    createdAt: new Date(2025, 0, 10).toISOString(),
    updatedAt: new Date(2025, 0, 11).toISOString(),
    updatedBy: 'staff-1',
    isDeleted: false,
  },
  {
    id: 'c-1002',
    teacherID: 't-2',
    contractNumber: 'CT-2025-002',
    signedAt: new Date(2025, 1, 5).toISOString(),
    expiredAt: new Date(2026, 1, 5).toISOString(),
    contractStatusID: 'pending',
    contractUrl: null,
    fileHash: '7f9c2ba4e88f827d616045507605853ed73bda42c5e5f7a3a5d5a5b5f1a4c3d2',
    createdAt: new Date(2025, 1, 5).toISOString(),
    updatedAt: null,
    updatedBy: null,
    isDeleted: false,
  },
  {
    id: 'c-1003',
    teacherID: 't-3',
    contractNumber: 'CT-2024-099',
    signedAt: new Date(2024, 6, 20).toISOString(),
    expiredAt: new Date(2025, 6, 20).toISOString(),
    contractStatusID: 'expired',
    contractUrl: 'https://example.com/contracts/CT-2024-099.pdf',
    fileHash: '2c26b46b68ffc68ff99b453c1d30413413422f1640c60b9321b0baf2b6f0eea2',
    createdAt: new Date(2024, 6, 20).toISOString(),
    updatedAt: new Date(2025, 6, 20).toISOString(),
    updatedBy: 'staff-2',
    isDeleted: false,
  },
];

export const mockContractStatuses = [
  { id: 'active', name: 'Active' },
  { id: 'pending', name: 'Pending' },
  { id: 'expired', name: 'Expired' },
  { id: 'terminated', name: 'Terminated' },
];


