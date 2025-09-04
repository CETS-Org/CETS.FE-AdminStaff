import { useMemo, useState, useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import AddEditSessionDialog from "./AddEditSessionDialog";
import Card from "@/components/ui/Card";
import Table, { type TableColumn } from "@/components/ui/Table";
import Pagination from "@/shared/pagination";
import { Search, Filter, X, Calendar, Edit, Trash2, Plus, BookOpen } from "lucide-react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

type ClassSession = {
  id: number;
  className: string;
  date: string;
  startTime: string; // Format: "09:00"
  endTime: string;   // Format: "11:00"
  room: string;
  type: string; // lesson | exam | break
  teacherName?: string;
};

export default function ScheduleList() {
  const [view, setView] = useState<"week" | "table">("week");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const quickAddRef = useRef<HTMLDivElement>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; session: ClassSession | null }>({ open: false, session: null });
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sessions, setSessions] = useState<ClassSession[]>(() => {
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
      { id: 1, className: "IELTS A1", date: iso(1), teacherName: "liliBeth", startTime: "09:00", endTime: "11:00", room: "R101", type: "lesson" }, // Mon 09:00-11:00
      { id: 2, className: "TOEIC B2", date: iso(2), teacherName: "liliBeth", startTime: "13:00", endTime: "15:00", room: "R203", type: "lesson" }, // Tue 13:00-15:00
      { id: 3, className: "IELTS A1", date: iso(2), teacherName: "liliBeth", startTime: "15:00", endTime: "17:00", room: "R102", type: "lesson" }, // Tue 15:00-17:00
      { id: 4, className: "Kids C1", date: iso(3), teacherName: "liliBeth", startTime: "10:00", endTime: "12:00", room: "R305", type: "lesson" },  // Wed 10:00-12:00
      { id: 5, className: "IELTS A2", date: iso(4), teacherName: "liliBeth", startTime: "08:00", endTime: "10:00", room: "R101", type: "break" },   // Thu 08:00-10:00
      { id: 6, className: "Mock Test", date: iso(5), teacherName: "liliBeth", startTime: "09:00", endTime: "12:00", room: "Hall A", type: "exam" },   // Fri 09:00-12:00
      { id: 7, className: "TOEIC B2", date: iso(6), teacherName: "liliBeth", startTime: "11:00", endTime: "13:00", room: "R203", type: "lesson" },   // Sat 11:00-13:00
      { id: 8, className: "Business English", date: iso(1), teacherName: "liliBeth", startTime: "14:00", endTime: "16:00", room: "R201", type: "lesson" }, // Mon 14:00-16:00
      { id: 9, className: "Conversation Club", date: iso(3), teacherName: "liliBeth", startTime: "18:00", endTime: "20:00", room: "R301", type: "lesson" }, // Wed 18:00-20:00
    ];
  });

  // Week view with time slots
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = today.getDay(); // 0..6 (Sun..Sat)
    const start = new Date(today);
    start.setDate(today.getDate() - day + weekOffset * 7);
    return start; // Sunday
  }, [weekOffset]);

  const daysOfWeek: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const hours: number[] = Array.from({ length: 16 }, (_, i) => 7 + i); // 07:00 - 22:00

  // Filter and search logic
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesSearch = searchTerm === "" || 
        session.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (session.teacherName && session.teacherName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        session.room.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === "all" || session.type === typeFilter;
      const matchesTeacher = teacherFilter === "all" || session.teacherName === teacherFilter;
      const matchesRoom = roomFilter === "all" || session.room === roomFilter;
      
      return matchesSearch && matchesType && matchesTeacher && matchesRoom;
    });
  }, [sessions, searchTerm, typeFilter, teacherFilter, roomFilter]);


  // Group sessions by day and calculate their grid positions
  const sessionsByDay = useMemo(() => {
    const map = new Map<string, ClassSession[]>();
    for (const s of filteredSessions) {
      const key = s.date; // yyyy-mm-dd
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [filteredSessions]);

  // Calculate grid position for each session
  const getSessionGridPosition = (session: ClassSession) => {
    const startHour = parseInt(session.startTime.split(':')[0]);
    const endHour = parseInt(session.endTime.split(':')[0]);
    const duration = endHour - startHour;
    
    return {
      gridRow: `${startHour - 6} / span ${duration}`, // 6 is the offset since we start from hour 7
      startHour,
      duration
    };
  };

  // Table view data: sessions within the current week range
  const weekStartISO = daysOfWeek[0].toISOString().slice(0, 10);
  const weekEndISO = daysOfWeek[6].toISOString().slice(0, 10);
  const weekSessions = useMemo(() => {
    const start = new Date(weekStartISO);
    const end = new Date(weekEndISO);
    return filteredSessions
      .filter((s) => {
        const d = new Date(s.date);
        return d >= start && d <= end;
      })
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  }, [filteredSessions, weekStartISO, weekEndISO]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(weekSessions.length / itemsPerPage) || 1;
  const currentTableData = useMemo(
    () => weekSessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [weekSessions, currentPage]
  );

  const columns: TableColumn<ClassSession>[] = [
    { header: "Class", accessor: (row) => row.className },
    { 
      header: "Teacher", 
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-700">
              {row.teacherName ? row.teacherName.charAt(0).toUpperCase() : "?"}
            </span>
          </div>
          <span className="font-medium">{row.teacherName || "-"}</span>
        </div>
      )
    },
    { header: "Date", accessor: (row) => new Date(row.date).toLocaleDateString() },
    { header: "Time", accessor: (row) => `${row.startTime} - ${row.endTime}` },
    { header: "Room", accessor: (row) => row.room },
    {
      header: "Type",
      accessor: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded-md text-[75%] border
          ${row.type === 'exam' ? 'bg-red-100 text-red-700 border-red-200' : ''}
          ${row.type === 'lesson' ? 'bg-green-100 text-green-700 border-green-200' : ''}
          ${row.type === 'break' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
        `}>
          {row.type}
        </span>
      )
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-2">
                     <Button
             variant="secondary"
             size="sm"
             onClick={() => handleEdit(row)}
             className="inline-flex items-center justify-center gap-2"
           >
            <div className="flex items-center gap-2">
            <Edit className="w-4 h-4 flex-shrink-0" />
            <span className="leading-none">Edit</span>
            </div>
            
           </Button>
           <Button
             variant="secondary"
             size="sm"
             onClick={() => handleDelete(row)}
             className="inline-flex items-center justify-center gap-2 text-red-600 hover:text-red-700"
           >
            <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 flex-shrink-0" />
            <span className="leading-none">Delete</span>
            </div>
             
           </Button>
        </div>
      )
    }
  ];

  const handleAdd = (payload: { date: string; startTime: string; endTime: string; room: string; type: string; teacherName?: string; className?: string }) => {
    setSessions((prev) => [
      { id: prev.length ? prev[prev.length - 1].id + 1 : 1, className: payload.className || "New Class", ...payload },
      ...prev,
    ]);
  };

  const handleEdit = (session: ClassSession) => {
    setEditingSession(session);
    setOpenDialog(true);
  };

  const handleUpdate = (payload: { date: string; startTime: string; endTime: string; room: string; type: string; teacherName?: string; className?: string }) => {
    if (editingSession) {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === editingSession.id
            ? { ...session, ...payload }
            : session
        )
      );
      setEditingSession(null);
    }
  };

  const handleDelete = (session: ClassSession) => {
    setDeleteDialog({ open: true, session });
  };

  const confirmDelete = () => {
    if (deleteDialog.session) {
      setSessions((prev) => prev.filter((session) => session.id !== deleteDialog.session!.id));
      setDeleteDialog({ open: false, session: null });
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingSession(null);
  };

  const handleQuickAddIELTS = () => {
    const today = new Date();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7); // Next Monday
    
    const ieltsSessions = [
      {
        date: nextMonday.toISOString().slice(0, 10),
        startTime: "09:00",
        endTime: "11:00",
        room: "R101",
        type: "lesson",
        teacherName: "IELTS Teacher",
        className: "IELTS A1 - New Class"
      },
      {
        date: new Date(nextMonday.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // Wednesday
        startTime: "09:00",
        endTime: "11:00",
        room: "R101",
        type: "lesson",
        teacherName: "IELTS Teacher",
        className: "IELTS A1 - New Class"
      },
      {
        date: new Date(nextMonday.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // Friday
        startTime: "09:00",
        endTime: "11:00",
        room: "R101",
        type: "lesson",
        teacherName: "IELTS Teacher",
        className: "IELTS A1 - New Class"
      }
    ];

    ieltsSessions.forEach(session => {
      setSessions((prev) => [
        { id: prev.length ? prev[prev.length - 1].id + 1 : 1, ...session },
        ...prev,
      ]);
    });

    setShowQuickAdd(false);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setTeacherFilter("all");
    setRoomFilter("all");
  };

  const hasActiveFilters = searchTerm !== "" || typeFilter !== "all" || teacherFilter !== "all" || roomFilter !== "all";

  // Get unique values for filter options
  const teachers = useMemo(() => {
    const uniqueTeachers = [...new Set(sessions.map(s => s.teacherName).filter(Boolean))] as string[];
    return uniqueTeachers.sort();
  }, [sessions]);

  const rooms = useMemo(() => {
    const uniqueRooms = [...new Set(sessions.map(s => s.room))];
    return uniqueRooms.sort();
  }, [sessions]);

  const sessionTypes = [
    { label: "All Types", value: "all" },
    { label: "Lesson", value: "lesson" },
    { label: "Exam", value: "exam" },
    { label: "Break", value: "break" },
  ];

  // Close quick add dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickAddRef.current && !quickAddRef.current.contains(event.target as Node)) {
        setShowQuickAdd(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
 {/* Search and Filter Section */}
 <Card className="mb-6" title="Search and Filter" description="Search and filter your schedule">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by class name, teacher, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="secondary"
              className="flex items-center gap-2 text-primary-500"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {hasActiveFilters && (
                  <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {[searchTerm, typeFilter, teacherFilter, roomFilter].filter(f => f !== "" && f !== "all").length}
                  </span>
                )}
              </span>
            </Button>
            <Button
              onClick={clearFilters}
              variant="secondary"
              className="whitespace-nowrap text-red-500"
            >
              <span className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Clear Filters
              </span>
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <Select
                label="Session Type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={sessionTypes}
              />
              <Select
                label="Teacher"
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value)}
                options={[
                  { label: "All Teachers", value: "all" },
                  ...teachers.map(teacher => ({ label: teacher, value: teacher }))
                ]}
              />
              <Select
                label="Room"
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                options={[
                  { label: "All Rooms", value: "all" },
                  ...rooms.map(room => ({ label: room, value: room }))
                ]}
              />
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
            <span>
              Showing {weekSessions.length} sessions this week
              {hasActiveFilters && " (filtered)"}
            </span>
            {hasActiveFilters && (
              <span className="text-primary-600">
                {sessions.length - filteredSessions.length} sessions hidden by filters
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Controls Section */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setWeekOffset((v) => v - 1)} size="sm">
                {"< Week"}
              </Button>
              <div className="text-sm text-neutral-700 px-3 py-2 bg-gray-50 rounded-md">
                {daysOfWeek[0].toLocaleDateString()} - {daysOfWeek[6].toLocaleDateString()}
              </div>
              <Button variant="secondary" onClick={() => setWeekOffset((v) => v + 1)} size="sm">
                {"Week >"}
              </Button>
            </div>

            <div className="rounded-md overflow-hidden border bg-white">
              <button
                className={`px-3 py-1 text-sm ${view === 'week' ? 'bg-primary-800 text-white' : 'text-neutral-700'}`}
                onClick={() => setView('week')}
              >Week</button>
              <button
                className={`px-3 py-1 text-sm border-l ${view === 'table' ? 'bg-primary-800 text-white' : 'text-neutral-700'}`}
                onClick={() => setView('table')}
              >Table</button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Quick Add Dropdown */}
            <div className="relative" ref={quickAddRef}>
              <Button
                onClick={() => setShowQuickAdd(!showQuickAdd)}
                variant="secondary"
                className="flex items-center gap-2"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                Quick Add
              </Button>
              
              {showQuickAdd && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-3">
                    <div className="text-sm font-medium text-gray-700 mb-3">Quick Add Templates</div>
                    <button
                      onClick={handleQuickAddIELTS}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-blue-50 rounded-md transition-colors border border-transparent hover:border-blue-200"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">IELTS A1 - New Class</div>
                        <div className="text-sm text-gray-500">3 sessions/week (Mon, Wed, Fri at 9:00 AM)</div>
                        <div className="text-xs text-blue-600 mt-1">Room: R101 • Teacher: IELTS Teacher</div>
                      </div>
                    </button>
                    
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500 text-center">
                        More templates coming soon...
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <Button onClick={() => setOpenDialog(true)} size="sm">Add session</Button>
          </div>
        </div>
      </Card>

     
      {view === 'week' ? (
      <Card title="Weekly Schedule" description="View and manage your weekly class schedule">
        <div className="overflow-x-auto">
          <div className="flex min-w-[800px]">
            {/* Time labels column - Left side */}
            <div className="w-20 flex-shrink-0">
              {/* Empty space for header - match the exact height of days header */}
              <div className="h-16 bg-gray-50 border-b border-r"></div>
              
              {/* Time labels */}
              {hours.map((h) => (
                <div key={`label-${h}`} className="h-16 text-xs text-neutral-500 border-b border-r bg-gray-50 p-1 text-center font-medium flex items-center justify-center">
                  {`${String(h).padStart(2, '0')}:00`}
                </div>
              ))}
            </div>
            
            {/* Calendar grid - Right side */}
            <div className="flex-1">
              {/* Days header */}
              <div className="grid grid-cols-7 h-16">
                {daysOfWeek.map((d) => {
                  const isToday = new Date().toDateString() === d.toDateString();
                  return (
                    <div key={d.toDateString()} className={`px-3 py-3 text-sm font-semibold text-center border-b border-r flex flex-col justify-center ${isToday ? 'bg-primary-100 text-primary-800' : 'text-neutral-700 bg-gray-50'}`}>
                      <div>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className={`text-lg ${isToday ? 'text-primary-900' : 'text-neutral-900'}`}>{d.getDate()}</div>
                    </div>
                  );
                })}
              </div>
              
              {/* Calendar grid with sessions */}
              <div className="grid grid-cols-7 relative" style={{ height: `${hours.length * 64}px` }}>
                {/* Day columns with sessions */}
                {daysOfWeek.map((d) => {
                  const daySessions = sessionsByDay.get(d.toISOString().slice(0, 10)) || [];
                  const isToday = new Date().toDateString() === d.toDateString();
                  
                  return (
                    <div key={d.toDateString()} className={`relative border-r ${isToday ? 'bg-primary-25' : 'bg-white'}`}>
                      {/* Time slots background */}
                      {hours.map((h) => (
                        <div key={`slot-${h}`} className={`h-16 border-b ${isToday ? 'bg-primary-25' : 'bg-white hover:bg-gray-25'}`} />
                      ))}
                      
                      {/* Sessions positioned absolutely */}
                      {daySessions.map((s) => {
                        const sessionDateTime = new Date(`${s.date}T${s.startTime}:00`);
                        const isPast = sessionDateTime < new Date();
                        const position = getSessionGridPosition(s);
                        
                        return (
                          <div
                            key={s.id}
                            className={`absolute left-1 right-1 rounded-md px-2 py-1 text-[75%] border group hover:shadow-sm transition-all duration-200 cursor-pointer z-10
                              ${isPast 
                                ? "bg-gray-200 text-gray-600 border-gray-400" 
                                : s.type === "exam"
                                ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                                : s.type === "lesson"
                                ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                                : s.type === "break"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200"
                                : ""}
                            `}
                            style={{
                              top: `${(position.startHour - 7) * 64 + 2}px`,
                              height: `${position.duration * 64 - 4}px`,
                            }}
                          >
                            <div className="flex flex-col h-full">
                              <div className="flex items-center justify-between mb-1">
                                <div className="font-semibold text-xs">{s.startTime} - {s.endTime}</div>
                                                                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button
                                     onClick={() => handleEdit(s)}
                                     className="p-1 hover:bg-white/50 rounded inline-flex items-center justify-center"
                                     title="Edit session"
                                   >
                                     <Edit className="w-3 h-3 flex-shrink-0" />
                                   </button>
                                   <button
                                     onClick={() => handleDelete(s)}
                                     className="p-1 hover:bg-white/50 rounded text-red-600 inline-flex items-center justify-center"
                                     title="Delete session"
                                   >
                                     <Trash2 className="w-3 h-3 flex-shrink-0" />
                                   </button>
                                 </div>
                              </div>
                              <div className="truncate font-medium text-sm">{s.className}</div>
                              <div className="text-xs opacity-75 truncate">{s.room} • {s.teacherName}</div>
                              {position.duration > 1 && (
                                <div className="text-xs opacity-60 mt-auto">
                                  {position.duration} hours
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Card>
      ) : (
      <Card title="Schedule Table" description="List view of all scheduled sessions">
        <div className="space-y-4">
          <Table 
            columns={columns} 
            data={currentTableData}
            emptyState={
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {hasActiveFilters ? "No sessions match your filters" : "No sessions found"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {hasActiveFilters 
                    ? "Try adjusting your search criteria or clear the filters."
                    : "Get started by adding your first session."
                  }
                </p>
                {hasActiveFilters ? (
                  <Button onClick={clearFilters} variant="secondary">
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={() => setOpenDialog(true)}>
                    Add Session
                  </Button>
                )}
              </div>
            }
          />
          
          <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={weekSessions.length}
              startIndex={(currentPage - 1) * itemsPerPage}
              endIndex={Math.min(currentPage * itemsPerPage, weekSessions.length)}
            />
          
        </div>
      </Card>
      )}

      <AddEditSessionDialog 
        open={openDialog} 
        onOpenChange={handleDialogClose} 
        onSave={editingSession ? handleUpdate : handleAdd} 
        initial={editingSession ? {
          date: editingSession.date,
          startTime: editingSession.startTime,
          endTime: editingSession.endTime,
          room: editingSession.room,
          type: editingSession.type,
          teacherName: editingSession.teacherName,
          className: editingSession.className
        } : null} 
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open: boolean) => setDeleteDialog({ open, session: null })}
        onConfirm={confirmDelete}
        title="Delete Session"
        message={`Are you sure you want to delete "${deleteDialog.session?.className}" session? This action cannot be undone.`}
      />
    </div>
  );
}


