import { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { type TableColumn } from "@/components/ui/Table";
import DataTable, { type FilterConfig, type BulkAction } from "@/components/ui/DataTable";
import { 
  Eye, Pencil, DoorOpen, Building2, TrendingUp, AlertCircle, 
  Download, BarChart3, Loader2, Plus, Trash2, CheckSquare, Square,
  Users, Link as LinkIcon
} from "lucide-react";
import { getRooms, getRoomStatistics, getRoomTypes, createRoom, updateRoom, deleteRoom } from "@/api/room.api";
import type { Room, RoomStatistics, RoomType, AddRoom, UpdateRoom } from "@/types/room.type";
import AddEditRoomDialog from "./components/AddEditRoomDialog";
import RoomDetailDialog from "./components/RoomDetailDialog";
import DeleteConfirmDialog from "@/shared/delete_confirm_dialog";

export default function StaffRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<RoomStatistics>({
    totalRooms: 0,
    activeRooms: 0,
    inactiveRooms: 0,
    totalCapacity: 0
  });

  // Dialog states
  const [addEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDialogLoading, setIsDialogLoading] = useState(false);

  // Fetch rooms, room types and statistics
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [roomsData, roomTypesData, statsData] = await Promise.all([
        getRooms(),
        getRoomTypes(),
        getRoomStatistics()
      ]);
      
      setRooms(roomsData);
      setRoomTypes(roomTypesData);
      setStats(statsData);
    } catch (err) {
      setError("Failed to load room data. Please try again.");
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get room type name
  const getRoomTypeName = (roomTypeId: string): string => {
    const roomType = roomTypes.find(rt => rt.id === roomTypeId);
    return roomType?.name || 'Unknown';
  };

  const handleExportData = () => {
    const dataToExport = rooms.map(room => ({
      'Room Code': room.roomCode,
      'Type': getRoomTypeName(room.roomTypeId),
      'Capacity': room.capacity,
      'Status': room.isActive ? 'Active' : 'Inactive',
      'Online Meeting': room.onlineMeetingUrl || 'N/A',
      'Created': new Date(room.createdAt).toLocaleDateString()
    }));
    
    const csv = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map((row) => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rooms-list.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAddNew = () => {
    setSelectedRoom(null);
    setAddEditDialogOpen(true);
  };

  const handleView = (room: Room) => {
    setSelectedRoom(room);
    setDetailDialogOpen(true);
  };

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setAddEditDialogOpen(true);
  };

  const handleDelete = (room: Room) => {
    setSelectedRoom(room);
    setDeleteDialogOpen(true);
  };

  const handleCreateRoom = async (data: AddRoom | UpdateRoom) => {
    try {
      setIsDialogLoading(true);
      await createRoom(data as AddRoom);
      await fetchData(); // Refresh data
      setAddEditDialogOpen(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    } finally {
      setIsDialogLoading(false);
    }
  };

  const handleUpdateRoom = async (data: AddRoom | UpdateRoom) => {
    if (!selectedRoom) return;
    
    try {
      setIsDialogLoading(true);
      await updateRoom(selectedRoom.id, data as UpdateRoom);
      await fetchData(); // Refresh data
      setAddEditDialogOpen(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Failed to update room. Please try again.');
    } finally {
      setIsDialogLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRoom) return;
    
    try {
      await deleteRoom(selectedRoom.id);
      await fetchData(); // Refresh data
      setDeleteDialogOpen(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room. Please try again.');
    }
  };

  const breadcrumbItems = [
    { label: "Rooms" }
  ];

  const itemsPerPage = 8;

  // Filter configurations for DataTable
  const filterConfigs: FilterConfig[] = [
    {
      key: "isActive",
      label: "Status",
      options: [
        { label: "All Status", value: "all" },
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
    {
      key: "roomTypeId",
      label: "Room Type",
      options: [
        { label: "All Types", value: "all" },
        ...roomTypes.map(rt => ({ label: rt.name, value: rt.id }))
      ],
    },
  ];

  // Bulk actions for DataTable
  const bulkActions: BulkAction<Room>[] = [
    {
      id: "export",
      label: "Export",
      icon: <Download className="w-4 h-4" />,
      onClick: (selectedRooms) => {
        console.log("Bulk export:", selectedRooms);
      },
      variant: "secondary",
      className: "text-blue-600 border-blue-300 hover:bg-blue-100",
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (selectedRooms) => {
        console.log("Bulk delete:", selectedRooms);
      },
      variant: "secondary",
      className: "text-red-600 border-red-300 hover:bg-red-100",
    },
  ];

  const columns: TableColumn<Room>[] = [
    { 
      header: "Room Code",
      className: "w-1/4",
      accessor: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
            <DoorOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{r.roomCode}</div>
            {r.onlineMeetingUrl && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <LinkIcon className="w-3 h-3" />
                <span>Online</span>
              </div>
            )}
          </div>
        </div>
      )
    },
    { 
      header: "Type",
      className: "w-1/5",
      accessor: (r) => (
        <div className="text-sm text-gray-900">{getRoomTypeName(r.roomTypeId)}</div>
      )
    },
    { 
      header: "Capacity",
      className: "w-1/6",
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900">{r.capacity}</span>
        </div>
      )
    },
    {
      header: "Status",
      className: "w-1/6",
      accessor: (r) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
          r.isActive 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-gray-100 text-gray-800 border-gray-200'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            r.isActive ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "w-40",
      accessor: (r) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            onClick={() => handleView(r)}
            className="!p-2 !bg-blue-50 !text-blue-600 !border !border-blue-200 hover:!bg-blue-100 hover:!text-blue-700 hover:!border-blue-300 !transition-colors !rounded-md"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => handleEdit(r)}
            className="!p-2 !bg-green-50 !text-green-600 !border !border-green-200 hover:!bg-green-100 hover:!text-green-700 hover:!border-green-300 !transition-colors !rounded-md"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => handleDelete(r)}
            className="!p-2 !bg-red-50 !text-red-600 !border !border-red-200 hover:!bg-red-100 hover:!text-red-700 hover:!border-red-300 !transition-colors !rounded-md"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Card render function for DataTable
  const renderRoomCard = (room: Room, isSelected: boolean, onToggleSelect: () => void) => (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      {/* Card Header */}
      <div className="relative aspect-video bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200 flex items-center justify-center">
        <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-blue-700 shadow-lg">
          <DoorOpen className="w-10 h-10" />
        </div>
        
        {/* Selection Checkbox */}
        <button
          onClick={onToggleSelect}
          className="absolute top-3 left-3 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-primary-600" />
          ) : (
            <Square className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
            room.isActive 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : 'bg-gray-100 text-gray-800 border-gray-200'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              room.isActive ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            {room.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="p-5">
        {/* Room Title */}
        <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1 mb-1">
          {room.roomCode}
        </h3>
        <p className="text-gray-600 text-sm mb-3">{getRoomTypeName(room.roomTypeId)}</p>
        
        {/* Room Meta */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Capacity:</span>
            <span className="font-medium text-gray-900 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {room.capacity}
            </span>
          </div>
          {room.onlineMeetingUrl && (
            <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              <LinkIcon className="w-3 h-3" />
              <span>Online meeting available</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleView(room)}
            className="!flex-1 !bg-blue-50 !text-blue-600 !border !border-blue-200 hover:!bg-blue-100 hover:!text-blue-700 hover:!border-blue-300 !transition-colors !rounded-md"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button
            size="sm"
            onClick={() => handleEdit(room)}
            className="!flex-1 !bg-green-50 !text-green-600 !border !border-green-200 hover:!bg-green-100 hover:!text-green-700 hover:!border-green-300 !transition-colors !rounded-md"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Page Header */}
      <PageHeader
        title="Room Management"
        description="Manage classroom and facility spaces across the campus"
        icon={<DoorOpen className="w-5 h-5 text-white" />}
        controls={[
          {
            type: 'button',
            label: 'Add Room',
            variant: 'primary',
            icon: <Plus className="w-4 h-4" />,
            onClick: handleAddNew
          },
          {
            type: 'button',
            label: 'Export Data',
            variant: 'secondary',
            icon: <Download className="w-4 h-4" />,
            onClick: handleExportData
          }
        ]}
      />

      {/* Stats Cards */}
      {error ? (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900">Error Loading Statistics</h3>
              <p className="text-red-700">{error}</p>
            </div>
            <Button variant="secondary" onClick={fetchData} className="text-red-600 border-red-300 hover:bg-red-100">
              Try Again
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <Building2 className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Total Rooms</p>
                <p className="text-3xl font-bold text-blue-900 group-hover:text-blue-600 transition-colors">
                  {loading ? "..." : stats.totalRooms}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {loading ? "Loading..." : "All spaces"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <TrendingUp className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Active Rooms</p>
                <p className="text-3xl font-bold text-green-900 group-hover:text-green-600 transition-colors">
                  {loading ? "..." : stats.activeRooms}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {loading ? "Loading..." : "Ready to use"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <AlertCircle className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Inactive</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors">
                  {loading ? "..." : stats.inactiveRooms}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {loading ? "Loading..." : "Not in use"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <Users className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Total Capacity</p>
                <p className="text-3xl font-bold text-purple-900 group-hover:text-purple-600 transition-colors">
                  {loading ? "..." : stats.totalCapacity}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {loading ? "Loading..." : "Total seats"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Rooms DataTable */}
      <DataTable<Room>
        title="Rooms Management"
        description="Manage classroom and facility spaces"
        data={rooms}
        columns={columns}
        searchFields={['roomCode']}
        filterConfigs={filterConfigs}
        bulkActions={bulkActions}
        onAdd={handleAddNew}
        addButtonLabel="Add Room"
        addButtonIcon={<Plus className="w-4 h-4" />}
        viewModes={["table", "card"]}
        defaultViewMode="table"
        itemsPerPage={itemsPerPage}
        loading={loading}
        error={error}
        onRefresh={fetchData}
        emptyStateTitle="No rooms found"
        emptyStateDescription="Get started by creating your first room"
        emptyStateAction={{
          label: "Add Room",
          onClick: handleAddNew
        }}
        renderCard={renderRoomCard}
        getItemId={(room) => room.id}
        enableSelection={true}
        className=""
        headerClassName=""
      />

      {/* Dialogs */}
      <AddEditRoomDialog
        open={addEditDialogOpen}
        onOpenChange={setAddEditDialogOpen}
        room={selectedRoom}
        roomTypes={roomTypes}
        onSave={selectedRoom ? handleUpdateRoom : handleCreateRoom}
        isLoading={isDialogLoading}
      />

      <RoomDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        room={selectedRoom}
        roomTypes={roomTypes}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Room"
        message={`Are you sure you want to delete ${selectedRoom?.roomCode}? This action cannot be undone.`}
      />
    </div>
  );
}
