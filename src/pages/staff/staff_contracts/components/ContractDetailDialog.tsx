import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/Dialog";
import Label from '@/components/ui/Label';
import Button from '@/components/ui/Button';
import { formatDate } from "@/helper/helper.service";
import { Calendar, FileText, Hash, Link as LinkIcon } from 'lucide-react';
import type { ContractResponse } from '@/types/contract.type';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: ContractResponse | null;
  teacherName: string;
  statusName: string;
  loading?: boolean;
}

export default function ContractDetailDialog({ open, onOpenChange, contract, teacherName, statusName, loading = false }: Props) {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] mt-xl">
        <DialogHeader>
          <DialogTitle>Contract Details</DialogTitle>
          <DialogDescription className='pb-2'>View contract information.</DialogDescription>
        </DialogHeader>

        <DialogBody className="pt-0">
        {contract ? (
          <div className="space-y-6 pb-2">
            {/* Header - match room dialog style */}
            <div className="text-center pb-4 border-b">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{contract.contractNumber}</h3>
              <p className="text-md text-gray-600">{teacherName}</p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                  statusName.toLowerCase().includes('active')
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : statusName.toLowerCase().includes('pending')
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : statusName.toLowerCase().includes('expired')
                    ? 'bg-gray-100 text-gray-800 border-gray-200'
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                }`}>
                  {statusName}
                </span>
              </div>
            </div>

            {/* Info layout - responsive 12-col for better balance */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6 flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Signed At</label>
                  <p className="text-sm font-medium text-gray-900">{formatDate(contract.signedAt ?? null)}</p>
                </div>
              </div>

              <div className="md:col-span-6 flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Expired At</label>
                  <p className="text-sm font-medium text-gray-900">{formatDate(contract.expiredAt ?? null)}</p>
                </div>
              </div>

              <div className="md:col-span-12 flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Hash className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-600 mb-1">File Hash</label>
                  <p className="text-xs font-mono text-gray-900 break-all">{contract.fileHash}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => copyToClipboard(contract.fileHash)}>Copy</Button>
              </div>
            </div>

            {/* URL section - match room URL block style */}
            {contract.contractUrl ? (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <label className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-blue-600" />
                  Contract URL
                </label>
                <div className="flex items-center gap-2">
                  <a 
                    href={contract.contractUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline break-all flex-1"
                  >
                    {contract.contractUrl}
                  </a>
                  <Button size="sm" variant="secondary" onClick={() => copyToClipboard(contract.contractUrl!)}>Copy URL</Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-gray-400" />
                  No contract file uploaded
                </p>
              </div>
            )}

            {/* Meta */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6 flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Created</label>
                  <p className="text-sm font-medium text-gray-900 truncate">{formatDate(contract.createdAt)}</p>
                </div>
              </div>

              <div className="md:col-span-6 flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Last Updated</label>
                  <p className="text-sm font-medium text-gray-900 truncate">{contract.updatedAt ? formatDate(contract.updatedAt) : 'Never'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">{loading ? 'Loading...' : 'No contract selected.'}</p>
        )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}


