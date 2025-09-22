import StaffWeekSchedule from "./components/StaffWeekSchedule";
import AddEditSessionDialog from "./components/AddEditSessionDialog";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import type { StaffSession } from "@/components/schedule";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Plus, 
  Search, 
  Download, 
  RefreshCw,
  Eye,
  EyeOff,
  TrendingUp
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";

// Helper function to convert ClassSession to StaffSession format
function convertToStaffSession(classSession: any): StaffSession {
  // Convert date and time to the format expected by the schedule component
  const dateTime = new Date(`${classSession.date}T${classSession.startTime}:00`);
  const startTime = `${dateTime.getFullYear()}:${String(dateTime.getMonth() + 1).padStart(2, '0')}:${String(dateTime.getDate()).padStart(2, '0')}:${String(dateTime.getHours()).padStart(2, '0')}:${String(dateTime.getMinutes()).padStart(2, '0')}`;
  
  return {
    id: classSession.id.toString(),
    title: classSession.className,
    classCode: classSession.className,
    start: startTime,
    room: classSession.room,
    instructor: classSession.teacherName,
    type: classSession.type as "lesson" | "exam" | "break",
    endTime: classSession.endTime,
    durationMin: 90, // Default duration
  };
}

// Session filters and search
type FilterState = {
  search: string;
  type: string;
  instructor: string;
  room: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
};

type ViewMode = 'schedule' | 'list';
type ScheduleDisplayMode = 'full' | 'classOnly' | 'roomOnly';

export default function StaffSchedulePage() {

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; session: StaffSession | null }>({ 
    open: false, 
    session: null 
  });

  // Enhanced UI states
  const [viewMode, setViewMode] = useState<ViewMode>('schedule');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [scheduleDisplayMode, setScheduleDisplayMode] = useState<ScheduleDisplayMode>('full');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    instructor: 'all',
    room: 'all',
    dateRange: 'week'
  });

  // Mock data - in real app, this would come from API
  const [classSessions, setClassSessions] = useState(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - day); // Sunday of current week
    const iso = (offset: number) => {
      const d = new Date(start);
      d.setDate(start.getDate() + offset);
      return d.toISOString().slice(0, 10);
    };
    return [
      { id: 1, className: "IELTS A1", date: iso(1), teacherName: "liliBeth", startTime: "13:30", endTime: "15:00", room: "R101", type: "lesson" },
      { id: 2, className: "TOEIC B2", date: iso(2), teacherName: "liliBeth", startTime: "15:30", endTime: "17:00", room: "R203", type: "lesson" },
      { id: 3, className: "IELTS A1", date: iso(2), teacherName: "liliBeth", startTime: "18:00", endTime: "19:30", room: "R102", type: "lesson" },
      { id: 4, className: "Kids C1", date: iso(3), teacherName: "liliBeth", startTime: "20:00", endTime: "21:30", room: "R305", type: "lesson" },
      { id: 5, className: "IELTS A2", date: iso(4), teacherName: "liliBeth", startTime: "13:30", endTime: "15:00", room: "R101", type: "lesson" },
      { id: 6, className: "Mock Test", date: iso(5), teacherName: "liliBeth", startTime: "15:30", endTime: "17:00", room: "Hall A", type: "exam" },
      { id: 7, className: "TOEIC B2", date: iso(6), teacherName: "liliBeth", startTime: "18:00", endTime: "19:30", room: "R203", type: "lesson" },
      { id: 8, className: "Business English", date: iso(1), teacherName: "liliBeth", startTime: "20:00", endTime: "21:30", room: "R201", type: "lesson" },
      { id: 9, className: "Conversation Club", date: iso(3), teacherName: "liliBeth", startTime: "15:30", endTime: "17:00", room: "R301", type: "lesson" },
      { id: 10, className: "English Grammar", date: iso(1), teacherName: "liliBeth", startTime: "09:00", endTime: "10:30", room: "R104", type: "lesson" },
      { id: 11, className: "Speaking Practice", date: iso(4), teacherName: "liliBeth", startTime: "09:00", endTime: "10:30", room: "R205", type: "lesson" },
      { id: 12, className: "Writing Workshop", date: iso(6), teacherName: "liliBeth", startTime: "09:00", endTime: "10:30", room: "R301", type: "lesson" },
    ];
  });

  // Convert to StaffSession format with filtering
  const staffSessions = useMemo(() => 
    classSessions.map(convertToStaffSession), 
    [classSessions]
  );

  // Filter sessions based on current filters
  const filteredSessions = useMemo(() => {
    return staffSessions.filter(session => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          session.title.toLowerCase().includes(searchLower) ||
          session.classCode.toLowerCase().includes(searchLower) ||
          session.instructor?.toLowerCase().includes(searchLower) ||
          session.room?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filters.type !== 'all' && session.type !== filters.type) {
        return false;
      }

      // Instructor filter
      if (filters.instructor !== 'all' && session.instructor !== filters.instructor) {
        return false;
      }

      // Room filter
      if (filters.room !== 'all' && session.room !== filters.room) {
        return false;
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const sessionDate = new Date(session.start.split(':').slice(0, 3).join('-'));
        const now = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            if (sessionDate.toDateString() !== now.toDateString()) return false;
            break;
          case 'week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            if (sessionDate < weekStart || sessionDate > weekEnd) return false;
            break;
          case 'month':
            if (sessionDate.getMonth() !== now.getMonth() || 
                sessionDate.getFullYear() !== now.getFullYear()) return false;
            break;
        }
      }

      return true;
    });
  }, [staffSessions, filters]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const instructors = [...new Set(staffSessions.map(s => s.instructor).filter(Boolean))];
    const rooms = [...new Set(staffSessions.map(s => s.room).filter(Boolean))];
    
    return {
      instructors: instructors.map(instructor => ({ label: instructor!, value: instructor! })),
      rooms: rooms.map(room => ({ label: room!, value: room! }))
    };
  }, [staffSessions]);

  // Statistics based on filtered sessions
  const statistics = useMemo(() => {
    const totalSessions = filteredSessions.length;
    const todaySessions = filteredSessions.filter(session => {
      const sessionDate = new Date(session.start.split(':').slice(0, 3).join('-'));
      return sessionDate.toDateString() === new Date().toDateString();
    }).length;
    const activeClasses = new Set(filteredSessions.map(s => s.classCode)).size;
    const roomsUsed = new Set(filteredSessions.map(s => s.room).filter(Boolean)).size;
    const upcomingSessions = filteredSessions.filter(session => {
      const sessionDateTime = new Date(session.start.split(':').slice(0, 3).join('-'));
      return sessionDateTime > new Date();
    }).length;

    return {
      totalSessions,
      todaySessions,
      activeClasses,
      roomsUsed,
      upcomingSessions
    };
  }, [filteredSessions]);

  const handleEdit = (session: StaffSession) => {
    // Find the original session data
    const originalSession = classSessions.find(s => s.id.toString() === session.id);
    if (originalSession) {
      setEditingSession(originalSession);
      setDialogOpen(true);
    }
  };

  const handleDelete = (session: StaffSession) => {
    setDeleteDialog({ open: true, session });
  };

  const confirmDelete = () => {
    if (deleteDialog.session) {
      setClassSessions(prev => prev.filter(s => s.id.toString() !== deleteDialog.session!.id));
      setDeleteDialog({ open: false, session: null });
    }
  };

  const handleAddSession = () => {
    setEditingSession(null);
    setDialogOpen(true);
  };

  const handleSaveSession = useCallback((sessionData: any) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (editingSession) {
        // Update existing session
        setClassSessions(prev => 
          prev.map(s => 
            s.id === editingSession.id 
              ? { ...s, ...sessionData }
              : s
          )
        );
      } else {
        // Add new session
        const newId = Math.max(...classSessions.map(s => s.id), 0) + 1;
        setClassSessions(prev => [...prev, { ...sessionData, id: newId }]);
      }
      setDialogOpen(false);
      setEditingSession(null);
      setIsLoading(false);
    }, 500);
  }, [editingSession, classSessions]);

  // Enhanced filter handlers
  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      type: 'all',
      instructor: 'all',
      room: 'all',
      dateRange: 'week'
    });
  }, []);

  const exportSchedule = useCallback(() => {
    // Simulate export functionality
    setIsLoading(true);
    setTimeout(() => {
      // In a real app, this would generate and download a file
      console.log('Exporting schedule data:', filteredSessions);
      setIsLoading(false);
    }, 1000);
  }, [filteredSessions]);

  const refreshData = useCallback(() => {
    setIsLoading(true);
    // Simulate API refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 lg:ml-0 pt-11">
      <div className="p-6">
        {/* Page Header */}
        <PageHeader
          title="Schedule Management"
          description="Manage and organize class schedules, sessions, and time slots"
          icon={<Calendar className="w-5 h-5 text-white" />}
          controls={[
            {
              type: 'button',
              label: 'Refresh',
              variant: 'secondary',
              icon: <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />,
              onClick: refreshData,
              className: isLoading ? 'opacity-60 cursor-not-allowed' : ''
            },
            {
              type: 'button',
              label: 'Export',
              variant: 'secondary',
              icon: <Download className="w-4 h-4" />,
              onClick: exportSchedule,
              className: isLoading ? 'opacity-60 cursor-not-allowed' : ''
            },
            {
              type: 'button',
              label: showFilters ? 'Hide Filters' : 'Show Filters',
              variant: 'secondary',
              icon: showFilters ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />,
              onClick: () => setShowFilters(!showFilters)
            }
          ]}
        />

        {/* Search and Filters */}
        {showFilters && (
            <Card className="mb-6 p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2 relative">
                  <Input
                    placeholder="Search sessions, classes, instructors..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  options={[
                    { label: "All Types", value: "all" },
                    { label: "Lesson", value: "lesson" },
                    { label: "Exam", value: "exam" },
                    { label: "Break", value: "break" },
                  ]}
                />
                
                <Select
                  value={filters.instructor}
                  onChange={(e) => handleFilterChange('instructor', e.target.value)}
                  options={[
                    { label: "All Instructors", value: "all" },
                    ...filterOptions.instructors
                  ]}
                />
                
                <Select
                  value={filters.room}
                  onChange={(e) => handleFilterChange('room', e.target.value)}
                  options={[
                    { label: "All Rooms", value: "all" },
                    ...filterOptions.rooms
                  ]}
                />
                
                <div className="flex items-end gap-2">
                  <Select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    options={[
                      { label: "All Time", value: "all" },
                      { label: "Today", value: "today" },
                      { label: "This Week", value: "week" },
                      { label: "This Month", value: "month" },
                    ]}
                  />
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={clearFilters}
                    className="shrink-0"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </Card>
        )}

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-8">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Total Sessions</p>
                <p className="text-3xl font-bold text-blue-900 group-hover:text-blue-600 transition-colors">
                  {statistics.totalSessions}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  All scheduled sessions
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Today's Sessions</p>
                <p className="text-3xl font-bold text-green-900 group-hover:text-green-600 transition-colors">
                  {statistics.todaySessions}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Sessions scheduled today
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Active Classes</p>
                <p className="text-3xl font-bold text-purple-900 group-hover:text-purple-600 transition-colors">
                  {statistics.activeClasses}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Currently running classes
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700">Upcoming</p>
                <p className="text-3xl font-bold text-orange-900 group-hover:text-orange-600 transition-colors">
                  {statistics.upcomingSessions}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Future scheduled sessions
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Schedule Content */}
        <Card className="overflow-hidden relative">
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-gray-600">Loading...</span>
              </div>
            </div>
          )}
          
          {/* Session count indicator */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">Weekly Schedule</h2>
                <Badge variant="secondary" className="text-xs">
                  {filteredSessions.length} sessions
                </Badge>
                {filters.search && (
                  <Badge variant="outline" className="text-xs">
                    Filtered by: "{filters.search}"
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Schedule Display Mode Selector */}
                {viewMode === 'schedule' && (
                  <Select
                    value={scheduleDisplayMode}
                    onChange={(e) => setScheduleDisplayMode(e.target.value as ScheduleDisplayMode)}
                    options={[
                      { label: "Full Info", value: "full" },
                      { label: "Class Only", value: "classOnly" },
                      { label: "Room Only", value: "roomOnly" },
                    ]}
                    className="min-w-[120px]"
                  />
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'schedule' ? 'list' : 'schedule')}
                  iconLeft={viewMode === 'schedule' ? <BookOpen className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                  className="whitespace-nowrap"
                >
                  {viewMode === 'schedule' ? 'List View' : 'Schedule View'}
                </Button>
                <Button 
                  onClick={handleAddSession} 
                  iconLeft={<Plus className="w-4 h-4" />}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  Add Session
                </Button>
              </div>
            </div>
          </div>

          {/* Schedule or List View */}
          {viewMode === 'schedule' ? (
            <StaffWeekSchedule 
              sessions={filteredSessions} 
              startHour={9} 
              slots={5} 
              slotMinutes={90}
              timeSlots={[
                { start: "09:00", end: "10:30" },
                { start: "13:30", end: "15:00" },
                { start: "15:30", end: "17:00" },
                { start: "18:00", end: "19:30" },
                { start: "20:00", end: "21:30" }
              ]}
              onEdit={handleEdit}
              onDelete={handleDelete}
              displayMode={scheduleDisplayMode}
            />
          ) : (
            <div className="p-6">
              {/* List View */}
              <div className="space-y-4">
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Found</h3>
                    <p className="text-gray-500 mb-4">
                      {filters.search || filters.type !== 'all' || filters.instructor !== 'all' || filters.room !== 'all'
                        ? "Try adjusting your filters to see more sessions."
                        : "No sessions are scheduled for the selected time period."
                      }
                    </p>
                    <Button onClick={handleAddSession} className="flex items-center gap-2 mx-auto">
                      <Plus className="w-4 h-4" />
                      Add New Session
                    </Button>
                  </div>
                ) : (
                  filteredSessions.map((session) => {
                    const sessionDate = new Date(session.start.split(':').slice(0, 3).join('-'));
                    return (
                      <Card key={session.id} className="p-3 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-blue-100 rounded-md">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900 text-sm">{session.title}</h4>
                                <Badge 
                                  variant={session.type === 'lesson' ? 'default' : 
                                          session.type === 'exam' ? 'destructive' : 'secondary'}
                                  className="text-xs px-1.5 py-0.5"
                                >
                                  {session.type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-600">
                                <span>{session.instructor}</span>
                                <span>•</span>
                                <span>{session.room}</span>
                                <span>•</span>
                                <span>
                                  {sessionDate.toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                                <span>•</span>
                                <span>
                                  {session.start.split(':').slice(3).join(':')} - {session.endTime}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 ml-3">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEdit(session)}
                              className="px-2 py-1 text-xs"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(session)}
                              className="px-2 py-1 text-xs"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Add/Edit Session Dialog */}
        <AddEditSessionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSaveSession}
          initial={editingSession}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialog.open}
          onOpenChange={(open: boolean) => setDeleteDialog({ open, session: null })}
          onConfirm={confirmDelete}
          title="Delete Session"
          message={`Are you sure you want to delete "${deleteDialog.session?.title}" session? This action cannot be undone.`}
        />
      </div>
    </div>
  );
}


