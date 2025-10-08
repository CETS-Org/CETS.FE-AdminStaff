import React, { useMemo } from 'react';
import type { Timeslot } from '@/types/timetable.type';
import { Clock, Edit, Trash2, Eye } from 'lucide-react';
import DataTable, { type FilterConfig } from '@/components/ui/DataTable';
import type { TableColumn } from '@/components/ui/Table';
import Button from '@/components/ui/Button';

interface TimetableGridProps {
  timeslots: Timeslot[];
  onView?: (timeslot: Timeslot) => void;
  onEdit?: (timeslot: Timeslot) => void;
  onDelete?: (timeslot: Timeslot) => void;
  onAdd?: () => void;
  loading?: boolean;
}

export default function TimetableGrid({
  timeslots,
  onView,
  onEdit,
  onDelete,
  onAdd,
  loading = false,
}: TimetableGridProps) {
  // Sort timeslots by slot number
  const sortedTimeslots = useMemo(
    () => [...timeslots].sort((a, b) => a.slotNumber - b.slotNumber),
    [timeslots]
  );

  const columns: TableColumn<Timeslot>[] = [
    {
      header: 'Timeslot',
      className: 'w-1/5',
      accessor: (slot) => (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
            {slot.slotNumber}
          </span>
          <span className="font-medium text-gray-900">{slot.slotName}</span>
        </div>
      ),
    },
    {
      header: 'Time Range',
      className: 'w-1/5',
      accessor: (slot) => (
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>
            {slot.startTime} - {slot.endTime}
          </span>
        </div>
      ),
    },
    {
      header: 'Duration',
      className: 'w-1/6',
      accessor: (slot) => (
        <span className="text-gray-700">{slot.duration} mins</span>
      ),
    },
    {
      header: 'Description',
      className: 'w-1/4',
      accessor: (slot) => (
        <span className="text-gray-600 text-sm truncate block max-w-xs">
          {slot.description || '-'}
        </span>
      ),
    },
    {
      header: 'Status',
      className: 'w-1/6',
      accessor: (slot) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
          slot.isActive 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-gray-100 text-gray-800 border-gray-200'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            slot.isActive ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          {slot.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'w-40',
      accessor: (slot) => (
        <div className="flex items-center gap-1">
          {onView && (
            <Button
              size="sm"
              onClick={() => onView(slot)}
              className="!p-2 !bg-blue-50 !text-blue-600 !border !border-blue-200 hover:!bg-blue-100 hover:!text-blue-700 hover:!border-blue-300 !transition-colors !rounded-md"
              title="View timeslot details"
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              onClick={() => onEdit(slot)}
              className="!p-2 !bg-green-50 !text-green-600 !border !border-green-200 hover:!bg-green-100 hover:!text-green-700 hover:!border-green-300 !transition-colors !rounded-md"
              title="Edit timeslot"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              onClick={() => onDelete(slot)}
              className="!p-2 !bg-red-50 !text-red-600 !border !border-red-200 hover:!bg-red-100 hover:!text-red-700 hover:!border-red-300 !transition-colors !rounded-md"
              title="Delete timeslot"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      key: 'isActive',
      label: 'Status',
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' },
      ],
    },
  ];

  // Transform isActive boolean to string for filtering
  const dataWithStringStatus = useMemo(
    () =>
      sortedTimeslots.map((slot) => ({
        ...slot,
        isActive: slot.isActive.toString() as any,
      })),
    [sortedTimeslots]
  );

  return (
    <DataTable
      title="Timeslots"
      description="Manage your timetable slots"
      data={dataWithStringStatus}
      columns={columns}
      searchFields={['slotName', 'startTime', 'endTime']}
      filterConfigs={filterConfigs}
      onAdd={onAdd}
      addButtonLabel="Add Timeslot"
      itemsPerPage={10}
      loading={loading}
      emptyStateTitle="No timeslots found"
      emptyStateDescription="Get started by creating your first timeslot"
      emptyStateAction={
        onAdd ? { label: 'Create Timeslot', onClick: onAdd } : undefined
      }
      getItemId={(item) => item.id}
      className=""
      headerClassName=""
    />
  );
}

