import { useEffect, useMemo, useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { type BulkAction, type FilterConfig } from "@/components/ui/DataTable";
import type { TableColumn } from "@/components/ui/Table";
import { AlertCircle, Download, Eye, FileText, Loader2, Pencil, Plus, Trash2, User } from "lucide-react";
import DeleteConfirmDialog from "@/shared/delete_confirm_dialog";
import { getContracts, getContractById, deleteContract, getContractStatuses } from "@/api/contract.api";
import type { ContractResponse, ContractStatusOption } from "@/types/contract.type";
import { getTeachers } from "@/api/teacher.api";
import type { Teacher } from "@/types/teacher.type";
import AddEditContractDialog from "./components/AddEditContractDialog.tsx";
import ContractDetailDialog from "./components/ContractDetailDialog.tsx";
import { mockContracts, mockContractStatuses } from "./data/mockdataContract";

export default function StaffContractsPage() {
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContractResponse | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [statuses, setStatuses] = useState<ContractStatusOption[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    void fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [list, statusList, teacherList] = await Promise.all([
        getContracts().catch(() => mockContracts),
        getContractStatuses().catch(() => mockContractStatuses),
        getTeachers().catch(() => [] as Teacher[])
      ]);
      setContracts(list);
      setStatuses(statusList as ContractStatusOption[]);
      setTeachers(teacherList);
    } catch (e) {
      console.error(e);
      setError("Failed to load contracts. Showing mock data.");
    } finally {
      setLoading(false);
    }
  };

  const teacherIdToName = useMemo(() => {
    const map = new Map<string, string>();
    teachers.forEach(t => map.set(t.accountId, t.fullName || t.email || t.accountId));
    return map;
  }, [teachers]);

  const statusIdToName = useMemo(() => {
    const map = new Map<string, string>();
    statuses.forEach(s => map.set(s.id, s.name));
    return map;
  }, [statuses]);

  const getTeacherName = (id: string) => teacherIdToName.get(id) ?? id;
  const getStatusName = (id: string) => statusIdToName.get(id) ?? id;

  const breadcrumbItems = [ { label: "Contracts" } ];

  const handleAdd = () => {
    setSelected(null);
    setAddEditOpen(true);
  };

  const handleView = async (row: ContractResponse) => {
    // Open immediately with the current row; hydrate details in background
    setSelected(row);
    setDetailOpen(true);
    try {
      setDialogLoading(true);
      const full = await getContractById(row.id).catch(() => row);
      setSelected(full);
    } catch (e) {
      console.error(e);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleEdit = async (row: ContractResponse) => {
    // Open immediately with the current row; hydrate details in background
    setSelected(row);
    setAddEditOpen(true);
    try {
      setDialogLoading(true);
      const full = await getContractById(row.id).catch(() => row);
      setSelected(full);
    } catch (e) {
      console.error(e);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDelete = (row: ContractResponse) => {
    setSelected(row);
    setDeleteOpen(true);
  };

  const onDeleted = async () => {
    if (!selected) return;
    try {
      await deleteContract(selected.id);
      await fetchAll();
    } catch (e) {
      console.error(e);
      alert('Failed to delete contract.');
    } finally {
      setDeleteOpen(false);
      setSelected(null);
    }
  };

  const columns: TableColumn<ContractResponse>[] = [
    {
      header: "Contract Number",
      className: "w-1/5",
      accessor: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="font-semibold text-gray-900">{r.contractNumber}</div>
        </div>
      )
    },
    {
      header: "Teacher",
      className: "w-1/4",
      accessor: (r) => (
        <div className="flex items-center gap-2 text-sm text-gray-900">
          <User className="w-4 h-4 text-gray-500" />
          <span>{getTeacherName(r.teacherID)}</span>
        </div>
      )
    },
    {
      header: "Status",
      className: "w-1/6",
      accessor: (r) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-800 border-gray-200">
          {getStatusName(r.contractStatusID)}
        </span>
      )
    },
    {
      header: "Signed",
      className: "w-1/6",
      accessor: (r) => (
        <span className="text-sm text-gray-900">{r.signedAt ? new Date(r.signedAt).toLocaleDateString() : '—'}</span>
      )
    },
    {
      header: "Expires",
      className: "w-1/6",
      accessor: (r) => (
        <span className="text-sm text-gray-900">{r.expiredAt ? new Date(r.expiredAt).toLocaleDateString() : '—'}</span>
      )
    },
    {
      header: "Actions",
      className: "w-40",
      accessor: (r) => (
        <div className="flex items-center gap-1">
          <Button size="sm" onClick={() => void handleView(r)} className="!p-2 !bg-blue-50 !text-blue-600 !border !border-blue-200 hover:!bg-blue-100 hover:!text-blue-700 hover:!border-blue-300 !transition-colors !rounded-md">
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={() => void handleEdit(r)} className="!p-2 !bg-green-50 !text-green-600 !border !border-green-200 hover:!bg-green-100 hover:!text-green-700 hover:!border-green-300 !transition-colors !rounded-md">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={() => handleDelete(r)} className="!p-2 !bg-red-50 !text-red-600 !border !border-red-200 hover:!bg-red-100 hover:!text-red-700 hover:!border-red-300 !transition-colors !rounded-md">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      key: "contractStatusID",
      label: "Status",
      options: [
        { label: "All Statuses", value: "all" },
        ...statuses.map(s => ({ label: s.name, value: s.id }))
      ],
    },
  ];

  const bulkActions: BulkAction<ContractResponse>[] = [
    {
      id: "export",
      label: "Export",
      icon: <Download className="w-4 h-4" />,
      onClick: (list) => {
        const rows = list.map(c => ({
          ContractNumber: c.contractNumber,
          Teacher: getTeacherName(c.teacherID),
          Status: getStatusName(c.contractStatusID),
          SignedAt: c.signedAt ?? '',
          ExpiredAt: c.expiredAt ?? '',
          CreatedAt: c.createdAt,
        }));
        if (rows.length === 0) return;
        const csv = [
          Object.keys(rows[0]).join(','),
          ...rows.map(r => Object.values(r).map(v => `"${String(v)}"`).join(','))
        ].join("\n");
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contracts.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      variant: "secondary",
      className: "text-blue-600 border-blue-300 hover:bg-blue-100",
    },
  ];

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title="Contract Management"
        description="View and manage teacher contracts"
        icon={<FileText className="w-5 h-5 text-white" />}
      />

      {error ? (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900">Error Loading Contracts</h3>
              <p className="text-red-700">{error}</p>
            </div>
            <Button variant="secondary" onClick={() => void fetchAll()} className="text-red-600 border-red-300 hover:bg-red-100">
              Try Again
            </Button>
          </div>
        </Card>
      ) : null}

      <DataTable<ContractResponse>
        title="Contracts"
        description="Contracts list"
        data={contracts}
        columns={columns}
        searchFields={["contractNumber"]}
        filterConfigs={filterConfigs}
        bulkActions={bulkActions}
        onAdd={handleAdd}
        addButtonLabel="New Contract"
        addButtonIcon={<Plus className="w-4 h-4" />}
        viewModes={["table"]}
        defaultViewMode="table"
        itemsPerPage={10}
        loading={loading}
        error={error}
        onRefresh={() => void fetchAll()}
        emptyStateTitle="No contracts found"
        emptyStateDescription="Create a contract to get started"
        emptyStateAction={{ label: "New Contract", onClick: handleAdd }}
        getItemId={(c) => c.id}
        enableSelection={true}
      />

      <AddEditContractDialog
        open={addEditOpen}
        onOpenChange={setAddEditOpen}
        contract={selected}
        statuses={statuses}
        teachers={teachers}
        onSaved={async () => { await fetchAll(); setSelected(null); }}
      />

      <ContractDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        contract={selected}
        teacherName={selected ? getTeacherName(selected.teacherID) : ''}
        statusName={selected ? getStatusName(selected.contractStatusID) : ''}
        loading={dialogLoading}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => void onDeleted()}
        title="Delete Contract"
        message={`Are you sure you want to delete ${selected?.contractNumber}? This action cannot be undone.`}
      />
    </div>
  );
}


