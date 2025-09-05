import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, Users, DollarSign, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EditEventDialog from './components/EditEventDialog';

interface EventDetail {
  id: string;
  name: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  capacity: number;
  parking: string;
  status: 'Active' | 'Draft' | 'Completed';
  created: string;
  lastModified: string;
  registered: number;
  revenue: number;
  attendees: number;
  maxAttendees: number;
  bannerImage?: string;
  pricingInfo: {
    studentPrice: number;
    guestPrice: number;
  };
}

// Mock data - in real app this would come from API
const mockEventData: { [key: string]: EventDetail } = {
  '1': {
    id: '1',
    name: 'English Speaking Club 2025',
    description: 'Join us for an engaging English Speaking Club where students practice communication through games, debates, and role-play activities. The event helps improve fluency, build confidence, and enhance public speaking skills.',
    eventType: 'Student Activity / Speaking Club',
    startDate: 'July 15, 2025',
    endDate: 'July 17, 2025',
    startTime: '10:00 AM',
    endTime: '11:00 PM',
    venue: 'Central Park Great Lawn',
    address: 'Central Park, New York, NY 10024',
    capacity: 5000,
    parking: 'Street parking available',
    status: 'Active',
    created: 'Jan 15, 2025',
    lastModified: 'Feb 10, 2025',
    registered: 42,
    revenue: 100,
    attendees: 26,
    maxAttendees: 50,
    pricingInfo: {
      studentPrice: 0,
      guestPrice: 10.00
    }
  },
  '2': {
    id: '2',
    name: 'Music Festival',
    description: 'Summer music celebration with live performances from various artists.',
    eventType: 'Festival / Entertainment',
    startDate: 'June 20, 2025',
    endDate: 'June 20, 2025',
    startTime: '02:00 PM',
    endTime: '11:00 PM',
    venue: 'City Park Amphitheater',
    address: 'City Park, New York, NY 10025',
    capacity: 500,
    parking: 'Free parking available',
    status: 'Draft',
    created: 'Jan 10, 2025',
    lastModified: 'Jan 20, 2025',
    registered: 0,
    revenue: 0,
    attendees: 0,
    maxAttendees: 500,
    pricingInfo: {
      studentPrice: 15,
      guestPrice: 25.00
    }
  },
  '3': {
    id: '3',
    name: 'Workshop Series',
    description: 'Professional development workshop series for skill enhancement.',
    eventType: 'Workshop / Professional Development',
    startDate: 'Feb 28, 2025',
    endDate: 'Feb 28, 2025',
    startTime: '10:30 AM',
    endTime: '04:00 PM',
    venue: 'Conference Center',
    address: 'Business District, New York, NY 10026',
    capacity: 100,
    parking: 'Paid parking garage',
    status: 'Completed',
    created: 'Jan 5, 2025',
    lastModified: 'Feb 25, 2025',
    registered: 85,
    revenue: 850,
    attendees: 85,
    maxAttendees: 100,
    pricingInfo: {
      studentPrice: 5,
      guestPrice: 15.00
    }
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Draft':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'Completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventDetail | null>(id ? mockEventData[id] : null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditEvent = (eventData: any) => {
    if (!event) return;
    
    const updatedEvent: EventDetail = {
      ...event,
      name: eventData.eventName,
      description: eventData.description,
      eventType: eventData.eventType,
      startDate: new Date(eventData.startDate).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      endDate: new Date(eventData.endDate).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      venue: eventData.venueName,
      address: eventData.address,
      capacity: eventData.maxCapacity,
      status: eventData.status === 'Cancelled' ? 'Draft' : eventData.status, // Convert Cancelled to Draft for compatibility
      lastModified: eventData.lastModified || new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      registered: eventData.registered,
      attendees: eventData.registered,
      maxAttendees: eventData.maxCapacity
    };

    setEvent(updatedEvent);
  };

  const handleDeleteEvent = () => {
    // In a real app, this would redirect to events list after deletion
    alert('Event deleted successfully!');
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50/50 lg:ml-64">
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Event not found</h2>
            <p className="text-gray-600 mt-2">The event you're looking for doesn't exist.</p>
            <Link to="/events" className="inline-block mt-4">
              <Button>Back to Events</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 lg:ml-64">
      <div className="p-6">
        {/* Breadcrumb and Header */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link to="/events" className="hover:text-gray-900">Events</Link>
          <span>›</span>
          <span>Summer Music Festival 2025</span>
        </div>

        {/* Page Header with Actions */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to="/events">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{event.startDate} - {event.endDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{event.venue}, {event.address.split(',')[1]}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{event.attendees}/{event.maxAttendees} attendees</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="danger" onClick={handleDeleteEvent}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Banner */}
            <Card className="overflow-hidden">
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <p className="text-sm">Event Banner Image</p>
                </div>
              </div>
            </Card>

            {/* Basic Information */}
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">ℹ</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                      <p className="text-gray-900">{event.name}</p>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <p className="text-gray-900">{event.startDate}</p>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <p className="text-gray-900">{event.startTime}</p>
                    </div>
                  </div>
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                      <p className="text-gray-900">{event.eventType}</p>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <p className="text-gray-900">{event.endDate}</p>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <p className="text-gray-900">{event.endTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">📝</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
              </div>
            </Card>

            {/* Location Details */}
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                      <p className="text-gray-900">{event.venue}</p>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                      <p className="text-gray-900">{event.capacity.toLocaleString()} people</p>
                    </div>
                  </div>
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <p className="text-gray-900">{event.address}</p>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parking</label>
                      <p className="text-gray-900">{event.parking}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Pricing Information */}
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Pricing Information</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700">Free for registered students</span>
                    <span className="font-semibold text-gray-900">
                      ${event.pricingInfo.studentPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700">Guest Pass</span>
                    <span className="font-semibold text-gray-900">
                      ${event.pricingInfo.guestPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Status */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Created</span>
                    <span className="text-gray-900">{event.created}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Last Modified</span>
                    <span className="text-gray-900">{event.lastModified}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Statistics */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-700">Registered</span>
                      <span className="text-gray-900 font-semibold">{event.registered} students</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-700">Revenue</span>
                      <span className="text-gray-900 font-semibold">${event.revenue}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="secondary">
                    <Users className="w-4 h-4 mr-2" />
                    View Attendees
                  </Button>
                  <Button className="w-full justify-start" variant="secondary">
                    <Calendar className="w-4 h-4 mr-2" />
                    Check-in Management
                  </Button>
                  <Button className="w-full justify-start" variant="secondary">
                    <Clock className="w-4 h-4 mr-2" />
                    Event Timeline
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Edit Dialog */}
        <EditEventDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleEditEvent}
          onDelete={handleDeleteEvent}
          eventData={event ? {
            id: event.id,
            eventName: event.name,
            eventType: event.eventType,
            startDate: '2025-07-15', // Convert from display format to input format
            endDate: '2025-07-17',
            startTime: event.startTime,
            endTime: event.endTime,
            description: event.description,
            venueName: event.venue,
            roomHall: 'Main Area',
            address: event.address,
            maxCapacity: event.capacity,
            registered: event.registered,
            status: event.status === 'Completed' ? 'Active' : event.status, // Convert Completed to Active for form compatibility
            created: event.created,
            lastModified: event.lastModified,
            revenue: event.revenue
          } : null}
        />
      </div>
    </div>
  );
}