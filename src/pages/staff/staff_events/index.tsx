import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, MoreHorizontal, Edit, Copy, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import CreateEventDialog from './components/CreateEventDialog';
import EditEventDialog from './components/EditEventDialog';

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  status: 'Active' | 'Draft' | 'Completed';
  attendees: number;
  maxAttendees: number;
  checkedIn: number;
  checkInRate: string;
}

const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Tech Conference 2025',
    description: 'Annual technology summit',
    date: 'March 15, 2025',
    time: '09:00 AM - 06:00 PM',
    status: 'Active',
    attendees: 245,
    maxAttendees: 300,
    checkedIn: 152,
    checkInRate: '62%'
  },
  {
    id: '2',
    name: 'Music Festival',
    description: 'Summer music celebration',
    date: 'June 20, 2025',
    time: '02:00 PM - 11:00 PM',
    status: 'Draft',
    attendees: 0,
    maxAttendees: 500,
    checkedIn: 0,
    checkInRate: 'Not started'
  },
  {
    id: '3',
    name: 'Workshop Series',
    description: 'Professional development',
    date: 'Feb 28, 2025',
    time: '10:30 AM - 04:00 PM',
    status: 'Completed',
    attendees: 85,
    maxAttendees: 100,
    checkedIn: 78,
    checkInRate: '92%'
  },
  {
    id: '4',
    name: 'Digital Marketing Summit',
    description: 'Learn latest digital marketing strategies',
    date: 'April 12, 2025',
    time: '08:30 AM - 05:00 PM',
    status: 'Active',
    attendees: 156,
    maxAttendees: 200,
    checkedIn: 89,
    checkInRate: '57%'
  },
  {
    id: '5',
    name: 'AI & Machine Learning Conference',
    description: 'Exploring the future of AI',
    date: 'May 8, 2025',
    time: '09:00 AM - 06:00 PM',
    status: 'Draft',
    attendees: 45,
    maxAttendees: 150,
    checkedIn: 0,
    checkInRate: 'Not started'
  },
  {
    id: '6',
    name: 'Startup Pitch Competition',
    description: 'Young entrepreneurs showcase their ideas',
    date: 'March 22, 2025',
    time: '02:00 PM - 08:00 PM',
    status: 'Active',
    attendees: 78,
    maxAttendees: 120,
    checkedIn: 45,
    checkInRate: '58%'
  },
  {
    id: '7',
    name: 'Web Development Bootcamp',
    description: 'Intensive coding workshop',
    date: 'January 15, 2025',
    time: '10:00 AM - 04:00 PM',
    status: 'Completed',
    attendees: 32,
    maxAttendees: 40,
    checkedIn: 32,
    checkInRate: '100%'
  },
  {
    id: '8',
    name: 'Design Thinking Workshop',
    description: 'Creative problem solving methods',
    date: 'July 10, 2025',
    time: '09:30 AM - 03:30 PM',
    status: 'Draft',
    attendees: 12,
    maxAttendees: 50,
    checkedIn: 0,
    checkInRate: 'Not started'
  },
  {
    id: '9',
    name: 'Cybersecurity Seminar',
    description: 'Protecting your digital assets',
    date: 'August 5, 2025',
    time: '01:00 PM - 05:00 PM',
    status: 'Active',
    attendees: 95,
    maxAttendees: 100,
    checkedIn: 67,
    checkInRate: '71%'
  },
  {
    id: '10',
    name: 'Data Science Symposium',
    description: 'Big data analytics and insights',
    date: 'September 18, 2025',
    time: '08:00 AM - 06:00 PM',
    status: 'Draft',
    attendees: 23,
    maxAttendees: 80,
    checkedIn: 0,
    checkInRate: 'Not started'
  },
  {
    id: '11',
    name: 'Mobile App Development Conference',
    description: 'iOS and Android development trends',
    date: 'October 12, 2025',
    time: '09:00 AM - 05:00 PM',
    status: 'Active',
    attendees: 134,
    maxAttendees: 180,
    checkedIn: 78,
    checkInRate: '58%'
  },
  {
    id: '12',
    name: 'E-commerce Growth Summit',
    description: 'Scaling online businesses',
    date: 'November 25, 2025',
    time: '10:00 AM - 04:00 PM',
    status: 'Draft',
    attendees: 67,
    maxAttendees: 120,
    checkedIn: 0,
    checkInRate: 'Not started'
  }
];

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

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Number of events per page

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalItems = filteredEvents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);
  const showingStart = totalItems > 0 ? startIndex + 1 : 0;
  const showingEnd = Math.min(endIndex, totalItems);

  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === 'Active').length;
  const totalAttendees = events.reduce((sum, e) => sum + e.attendees, 0);
  const todayCheckIns = events
    .filter(e => e.status === 'Active')
    .reduce((sum, e) => sum + e.checkedIn, 0);

  const handleCreateEvent = (eventData: any) => {
    const newEvent: Event = {
      id: (events.length + 1).toString(),
      name: eventData.eventName,
      description: eventData.description,
      date: new Date(eventData.startDate).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: `${eventData.startTime} - ${eventData.endTime}`,
      status: eventData.status,
      attendees: eventData.registered,
      maxAttendees: eventData.maxCapacity,
      checkedIn: 0,
      checkInRate: eventData.registered > 0 ? '0%' : 'Not started'
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const handleEditEvent = (eventData: any) => {
    if (!selectedEvent) return;
    
    const updatedEvent: Event = {
      ...selectedEvent,
      name: eventData.eventName,
      description: eventData.description,
      date: new Date(eventData.startDate).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: `${eventData.startTime} - ${eventData.endTime}`,
      status: eventData.status,
      attendees: eventData.registered,
      maxAttendees: eventData.maxCapacity
    };

    setEvents(prev => prev.map(event => 
      event.id === selectedEvent.id ? updatedEvent : event
    ));
    setSelectedEvent(null);
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    setEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
    setSelectedEvent(null);
  };

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to first page when search or filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 lg:ml-0 pt-11">
      <div className="p-6">
        {/* Page Header */}
        <PageHeader
          title="Events Dashboard"
          subtitle="Manage your events, registrations, and check-ins"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Events</p>
                <p className="text-2xl font-bold text-gray-900">{activeEvents}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Attendees</p>
                <p className="text-2xl font-bold text-gray-900">{totalAttendees.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Check-ins Today</p>
                <p className="text-2xl font-bold text-gray-900">{todayCheckIns}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Events Table */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">All Events</h2>
              <Button 
                className="bg-gray-900 hover:bg-gray-800 text-white"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStatusFilterChange(e.target.value)}
                options={[
                  { value: 'All Status', label: 'All Status' },
                  { value: 'Active', label: 'Active' },
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Completed', label: 'Completed' }
                ]}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-ins
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <Link to={`/staff/events/${event.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                            {event.name}
                          </Link>
                          <div className="text-sm text-gray-500">{event.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{event.date}</div>
                      <div className="text-sm text-gray-500">{event.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {event.attendees} / {event.maxAttendees}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {event.status === 'Active' ? `${event.checkedIn} checked in` : event.checkInRate}
                      </div>
                      {event.status === 'Active' && (
                        <div className="text-sm text-gray-500">{event.checkInRate} rate</div>
                      )}
                    </td>                  
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {showingStart} to {showingEnd} of {totalItems} events
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    Previous
                  </Button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      size="sm"
                      variant={currentPage === page ? undefined : "secondary"}
                      className={
                        currentPage === page
                          ? "bg-gray-900 text-white hover:bg-gray-800"
                          : ""
                      }
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Dialogs */}
        <CreateEventDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSave={handleCreateEvent}
        />

        <EditEventDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedEvent(null);
          }}
          onSave={handleEditEvent}
          onDelete={handleDeleteEvent}
          eventData={selectedEvent ? {
            id: selectedEvent.id,
            eventName: selectedEvent.name,
            eventType: 'Conference',
            startDate: '2025-07-15',
            endDate: '2025-07-17',
            startTime: '10:00',
            endTime: '23:00',
            description: selectedEvent.description,
            venueName: 'Central Park Great Lawn',
            roomHall: 'Main Area',
            address: 'Central Park, New York, NY 10024',
            maxCapacity: selectedEvent.maxAttendees,
            registered: selectedEvent.attendees,
            status: selectedEvent.status === 'Completed' ? 'Active' : selectedEvent.status, // Convert Completed to Active for form compatibility
            created: 'Jan 15, 2025',
            lastModified: 'Feb 10, 2025',
            revenue: 100
          } : null}
        />
      </div>
    </div>
  );
}