import { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import PageHeader from '@/components/ui/PageHeader';
import TimetableGrid from './components/TimetableGrid';
import AddEditTimeslotDialog from './components/AddEditTimeslotDialog';
import DeleteTimeslotDialog from './components/DeleteTimeslotDialog';
import { 
  type Timeslot, 
  type CreateTimeslotDto, 
  DEFAULT_TIMESLOTS 
} from '@/types/timetable.type';
// import { 
//   getTimeslots, 
//   createTimeslot, 
//   updateTimeslot, 
//   deleteTimeslot 
// } from '@/api/timetable.api';

export default function StaffTimetablePage() {
  // State management
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Dialog states
  const [addEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTimeslot, setSelectedTimeslot] = useState<Timeslot | null>(null);

  // Load timeslots on mount
  useEffect(() => {
    loadTimeslots();
  }, []);

  const loadTimeslots = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await getTimeslots();
      // setTimeslots(response.data);
      
      // Using mock data for now
      const mockTimeslots: Timeslot[] = DEFAULT_TIMESLOTS.map((slot, index) => ({
        ...slot,
        id: `slot-${index + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setTimeslots(mockTimeslots);
    } catch (error) {
      console.error('Failed to load timeslots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTimeslot = async (data: CreateTimeslotDto) => {
    try {
      // TODO: Replace with actual API call
      // await createTimeslot(data);
      
      // Mock implementation
      const newTimeslot: Timeslot = {
        ...data,
        id: `slot-${Date.now()}`,
        duration: data.duration ?? 90,
        isActive: data.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTimeslots(prev => [...prev, newTimeslot]);
      setAddEditDialogOpen(false);
      setSelectedTimeslot(null);
      
      // Show success message (you can integrate with a toast library)
      alert('Timeslot created successfully!');
    } catch (error) {
      console.error('Failed to create timeslot:', error);
      alert('Failed to create timeslot. Please try again.');
    }
  };

  const handleUpdateTimeslot = async (data: CreateTimeslotDto) => {
    if (!selectedTimeslot) return;
    
    try {
      // TODO: Replace with actual API call
      // await updateTimeslot(selectedTimeslot.id, data);
      
      // Mock implementation
      setTimeslots(prev =>
        prev.map(slot =>
          slot.id === selectedTimeslot.id
            ? { ...slot, ...data, updatedAt: new Date().toISOString() }
            : slot
        )
      );
      
      setAddEditDialogOpen(false);
      setSelectedTimeslot(null);
      
      alert('Timeslot updated successfully!');
    } catch (error) {
      console.error('Failed to update timeslot:', error);
      alert('Failed to update timeslot. Please try again.');
    }
  };

  const handleDeleteTimeslot = async () => {
    if (!selectedTimeslot) return;
    
    try {
      // TODO: Replace with actual API call
      // await deleteTimeslot(selectedTimeslot.id);
      
      // Mock implementation
      setTimeslots(prev => prev.filter(slot => slot.id !== selectedTimeslot.id));
      
      setDeleteDialogOpen(false);
      setSelectedTimeslot(null);
      
      alert('Timeslot deleted successfully!');
    } catch (error) {
      console.error('Failed to delete timeslot:', error);
      alert('Failed to delete timeslot. Please try again.');
    }
  };

  const handleEdit = (timeslot: Timeslot) => {
    setSelectedTimeslot(timeslot);
    setAddEditDialogOpen(true);
  };

  const handleDelete = (timeslot: Timeslot) => {
    setSelectedTimeslot(timeslot);
    setDeleteDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedTimeslot(null);
    setAddEditDialogOpen(true);
  };

  // Statistics
  const stats = useMemo(() => {
    const total = timeslots.length;
    const active = timeslots.filter(s => s.isActive).length;
    const inactive = total - active;
    
    return { total, active, inactive };
  }, [timeslots]);

  const breadcrumbItems = [
    { label: 'Timetable Management' },
  ];

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title="Timetable Management"
        description="Manage timeslots and view timetable schedules"
        icon={<Clock className="w-5 h-5 text-white" />}
        controls={[
          {
            type: 'button',
            label: 'Add Timeslot',
            variant: 'primary',
            icon: <Plus className="w-4 h-4" />,
            onClick: handleAddNew
          }
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-700">Total Timeslots</p>
              <p className="text-3xl font-bold text-blue-900 group-hover:text-blue-600 transition-colors">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Eye className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-700">Active Slots</p>
              <p className="text-3xl font-bold text-green-900 group-hover:text-green-600 transition-colors">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <EyeOff className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Inactive Slots</p>
              <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors">{stats.inactive}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Timeslots Table */}
      <TimetableGrid
        timeslots={timeslots}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAddNew}
        loading={loading}
      />

      {/* Dialogs */}
      <AddEditTimeslotDialog
        open={addEditDialogOpen}
        onOpenChange={setAddEditDialogOpen}
        timeslot={selectedTimeslot}
        onSave={selectedTimeslot ? handleUpdateTimeslot : handleCreateTimeslot}
      />

      <DeleteTimeslotDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        timeslot={selectedTimeslot}
        onConfirm={handleDeleteTimeslot}
      />
    </div>
  );
}

