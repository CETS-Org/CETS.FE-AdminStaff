import { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';

interface EditEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: EventFormData) => void;
  onDelete?: () => void;
  eventData?: EventFormData | null;
}

interface EventFormData {
  id?: string;
  eventName: string;
  eventType: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  description: string;
  venueName: string;
  roomHall: string;
  address: string;
  maxCapacity: number;
  registered: number;
  status: 'Active' | 'Draft' | 'Cancelled';
  created?: string;
  lastModified?: string;
  revenue?: number;
}

export default function EditEventDialog({ isOpen, onClose, onSave, onDelete, eventData }: EditEventDialogProps) {
  const [formData, setFormData] = useState<EventFormData>({
    eventName: '',
    eventType: 'Conference',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '18:00',
    description: '',
    venueName: '',
    roomHall: '',
    address: '',
    maxCapacity: 50,
    registered: 0,
    status: 'Active'
  });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  useEffect(() => {
    if (eventData) {
      setFormData(eventData);
    }
  }, [eventData]);

  const handleInputChange = (field: keyof EventFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({
      ...formData,
      lastModified: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    });
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      onDelete();
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
             <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/20 backdrop-blur-sm transition-opacity px-4 sm:px-6 md:px-8 scrollbar-hide">
         <div className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{formData.eventName || 'Edit Event'}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formData.startDate} - {formData.endDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{formData.venueName || 'Location TBD'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{formData.registered}/{formData.maxCapacity} attendees</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onDelete && (
                <Button variant="danger" size="sm" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Event Banner Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Event Banner</label>
                  <div className="h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {uploadedImage ? (
                      <img src={uploadedImage} alt="Event banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-500">
                        <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <p className="text-sm">Upload Image</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Event Name"
                        value={formData.eventName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('eventName', e.target.value)}
                        placeholder="Summer Music Festival 2025"
                      />
                    </div>
                    <div>
                      <Select
                        label="Event Type"
                        value={formData.eventType}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('eventType', e.target.value)}
                        options={[
                          { value: 'Conference', label: 'Conference' },
                          { value: 'Workshop', label: 'Workshop' },
                          { value: 'Seminar', label: 'Seminar' },
                          { value: 'Meeting', label: 'Meeting' },
                          { value: 'Festival', label: 'Festival' },
                          { value: 'Other', label: 'Other' }
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Start Date"
                        type="date"
                        value={formData.startDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('startDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        label="End Date"
                        type="date"
                        value={formData.endDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('endDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Start Time"
                        type="time"
                        value={formData.startTime}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('startTime', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        label="End Time"
                        type="time"
                        value={formData.endTime}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('endTime', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Join us for an engaging English Speaking Club where students practice communication through games, debates, and role-play activities..."
                  />
                </div>

                {/* Location Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Venue Name"
                        value={formData.venueName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('venueName', e.target.value)}
                        placeholder="Grand Convention Center"
                      />
                    </div>
                    <div>
                      <Input
                        label="Room/Hall"
                        value={formData.roomHall}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('roomHall', e.target.value)}
                        placeholder="Main Auditorium"
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      label="Address"
                      value={formData.address}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('address', e.target.value)}
                      placeholder="123 Conference Blvd, Tech City, TC 12345"
                    />
                  </div>
                </div>

                {/* Capacity & Registration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Capacity & Registration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Max Capacity"
                        type="number"
                        value={formData.maxCapacity.toString()}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('maxCapacity', parseInt(e.target.value) || 0)}
                        placeholder="50"
                      />
                    </div>
                    <div>
                      <Input
                        label="Registered"
                        type="number"
                        value={formData.registered.toString()}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('registered', parseInt(e.target.value) || 0)}
                        placeholder="25"
                      />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Registration Progress</span>
                      <span>{formData.registered}/{formData.maxCapacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${formData.maxCapacity > 0 ? Math.min((formData.registered / formData.maxCapacity) * 100, 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Event Status */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Event Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(formData.status)}`}>
                        {formData.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Created</span>
                      <span className="text-gray-900">{formData.created || 'Jan 15, 2025'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Last Modified</span>
                      <span className="text-gray-900">{formData.lastModified || 'Feb 10, 2025'}</span>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Registered</span>
                      <span className="text-gray-900 font-semibold">{formData.registered} students</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Revenue</span>
                      <span className="text-gray-900 font-semibold">${formData.revenue || 100}</span>
                    </div>
                  </div>
                </div>

                {/* Set Status */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Set Status</h3>
                  <div className="space-y-2">
                    <Select
                      value={formData.status}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('status', e.target.value)}
                      options={[
                        { value: 'Active', label: 'Active' },
                        { value: 'Draft', label: 'Draft' },
                        { value: 'Cancelled', label: 'Cancelled' }
                      ]}
                    />
                    
                    {/* Status Options */}
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50 cursor-pointer">
                        <span className="text-sm text-gray-700">Active</span>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50 cursor-pointer">
                        <span className="text-sm text-gray-700">Cancelled</span>
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50 cursor-pointer">
                        <span className="text-sm text-gray-700">Draft</span>
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                className="bg-gray-900 hover:bg-gray-800 text-white"
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}