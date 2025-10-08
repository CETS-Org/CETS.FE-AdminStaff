import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import { Calendar, FileUp, Hash, Loader2, Tag, User } from 'lucide-react';
import type { ContractResponse, CreateContractRequest, UpdateContractRequest, ContractStatusOption } from '@/types/contract.type';
import { createContract, updateContract, computeSHA256 } from '@/api/contract.api';
import type { Teacher } from '@/types/teacher.type';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: ContractResponse | null;
  statuses: ContractStatusOption[];
  teachers: Teacher[];
  onSaved?: () => void;
}

export default function AddEditContractDialog({ open, onOpenChange, contract, statuses, teachers, onSaved }: Props) {
  const isEdit = !!contract;
  const [form, setForm] = useState({
    teacherID: '',
    contractNumber: '',
    signedAt: '' as string | '',
    expiredAt: '' as string | '',
    contractStatusID: '',
    contractUrl: '' as string | '',
    fileHash: '',
    isDeleted: false,
  });
  const [file, setFile] = useState<File | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contract) {
      setForm({
        teacherID: contract.teacherID,
        contractNumber: contract.contractNumber,
        signedAt: contract.signedAt ? contract.signedAt.substring(0, 10) : '',
        expiredAt: contract.expiredAt ? contract.expiredAt.substring(0, 10) : '',
        contractStatusID: contract.contractStatusID,
        contractUrl: contract.contractUrl ?? '',
        fileHash: contract.fileHash,
        isDeleted: contract.isDeleted,
      });
      setFile(undefined);
      setErrors({});
    } else {
      setForm({
        teacherID: teachers[0]?.accountId ?? '',
        contractNumber: '',
        signedAt: '',
        expiredAt: '',
        contractStatusID: statuses[0]?.id ?? '',
        contractUrl: '',
        fileHash: '',
        isDeleted: false,
      });
      setFile(undefined);
      setErrors({});
    }
  }, [contract, open, teachers, statuses]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.teacherID) e.teacherID = 'Teacher is required';
    if (!form.contractNumber.trim()) e.contractNumber = 'Contract number is required';
    if (!form.contractStatusID) e.contractStatusID = 'Status is required';
    if (!isEdit && !file) e.file = 'Contract file is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      if (isEdit) {
        const payload: UpdateContractRequest = {
          teacherID: form.teacherID,
          contractNumber: form.contractNumber,
          signedAt: form.signedAt ? new Date(form.signedAt).toISOString() : null,
          expiredAt: form.expiredAt ? new Date(form.expiredAt).toISOString() : null,
          contractStatusID: form.contractStatusID,
          contractUrl: form.contractUrl || null,
          fileHash: form.fileHash,
          isDeleted: form.isDeleted,
        };
        await updateContract(contract!.id, payload, file);
      } else {
        const fileHash = file ? await computeSHA256(file) : '';
        const payload: CreateContractRequest = {
          teacherID: form.teacherID,
          contractNumber: form.contractNumber,
          signedAt: form.signedAt ? new Date(form.signedAt).toISOString() : null,
          expiredAt: form.expiredAt ? new Date(form.expiredAt).toISOString() : null,
          contractStatusID: form.contractStatusID,
          contractUrl: form.contractUrl || null,
          fileHash,
        };
        await createContract(payload, file);
      }
      onOpenChange(false);
      onSaved && onSaved();
    } catch (e) {
      console.error(e);
      alert('Failed to save contract.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] mt-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Contract' : 'New Contract'}</DialogTitle>
          <DialogDescription className='pb-2'>
            {isEdit ? 'Update contract information.' : 'Fill in details to create a new contract.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label required icon={<User className="w-4 h-4" />}>Teacher</Label>
            <select
              value={form.teacherID}
              onChange={(e) => setForm(prev => ({ ...prev, teacherID: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.teacherID ? 'border-red-500' : 'border-gray-300'}`}
              required
            >
              <option value="">Select teacher</option>
              {teachers.map(t => (
                <option key={t.accountId} value={t.accountId}>{t.fullName || t.email || t.accountId}</option>
              ))}
            </select>
            {errors.teacherID && <p className="text-red-500 text-sm mt-1">{errors.teacherID}</p>}
          </div>

          <div>
            <Label required icon={<Tag className="w-4 h-4" />}>Contract Number</Label>
            <Input
              type="text"
              value={form.contractNumber}
              onChange={(e) => setForm(prev => ({ ...prev, contractNumber: e.target.value }))}
              placeholder="e.g., CT-2025-001"
              className={errors.contractNumber ? 'border-red-500' : ''}
              required
            />
            {errors.contractNumber && <p className="text-red-500 text-sm mt-1">{errors.contractNumber}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label icon={<Calendar className="w-4 h-4" />}>Signed At</Label>
              <Input
                type="date"
                value={form.signedAt}
                onChange={(e) => setForm(prev => ({ ...prev, signedAt: e.target.value }))}
              />
            </div>
            <div>
              <Label icon={<Calendar className="w-4 h-4" />}>Expired At</Label>
              <Input
                type="date"
                value={form.expiredAt}
                onChange={(e) => setForm(prev => ({ ...prev, expiredAt: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label required>Status</Label>
            <select
              value={form.contractStatusID}
              onChange={(e) => setForm(prev => ({ ...prev, contractStatusID: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.contractStatusID ? 'border-red-500' : 'border-gray-300'}`}
              required
            >
              <option value="">Select status</option>
              {statuses.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.contractStatusID && <p className="text-red-500 text-sm mt-1">{errors.contractStatusID}</p>}
          </div>

          <div>
            <Label icon={<FileUp className="w-4 h-4" />}>Contract File</Label>
            <input
              type="file"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setFile(e.target.files?.[0])}
              className="w-full"
            />
            {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
          </div>

          {isEdit && (
            <div>
              <Label icon={<Hash className="w-4 h-4" />}>Current File Hash</Label>
              <Input type="text" value={form.fileHash} readOnly />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} variant="success" iconLeft={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}>
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


