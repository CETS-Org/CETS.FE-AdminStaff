import React, { useMemo } from 'react';
import type { Timeslot } from '@/types/timetable.type';
import { Clock, Edit, Trash2 } from 'lucide-react';
import DataTable, { type FilterConfig } from '@/components/ui/DataTable';
import type { TableColumn } from '@/components/ui/Table';

interface TimetableGridProps {
  timeslots: Timeslot[];
  onEdit?: (timeslot: Timeslot) => void;
  onDelete?: (timeslot: Timeslot) => void;
  onAdd?: () => void;
  loading?: boolean;
}

export default function TimetableGrid({
  timeslots,
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
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            slot.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {slot.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'w-24',
      accessor: (slot) => (
        <div className="flex items-center justify-end gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(slot)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit timeslot"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(slot)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete timeslot"
            >
              <Trash2 className="w-4 h-4" />
            </button>
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

