import { useMemo, useState, useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import AddEditSessionDialog from "./AddEditSessionDialog";
import Card from "@/components/ui/Card";
import Table, { type TableColumn } from "@/components/ui/Table";
import Pagination from "@/shared/pagination";
import { Search, Filter, X, Calendar, Edit, Trash2, Plus, BookOpen } from "lucide-react";

type ClassSession = {
  id: number;
  className: string;
  date: string;
  time: string;
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
      { id: 1, className: "IELTS A1", date: iso(1), teacherName: "liliBeth", time: "09:00", room: "R101", type: "lesson" }, // Mon 09:00
      { id: 2, className: "TOEIC B2", date: iso(2), teacherName: "liliBeth", time: "13:00", room: "R203", type: "lesson" }, // Tue 13:00
      { id: 3, className: "IELTS A1", date: iso(2), teacherName: "liliBeth", time: "15:00", room: "R102", type: "lesson" }, // Tue 15:00
      { id: 4, className: "Kids C1", date: iso(3), teacherName: "liliBeth", time: "10:00", room: "R305", type: "lesson" },  // Wed 10:00
      { id: 5, className: "IELTS A2", date: iso(4), teacherName: "liliBeth", time: "08:00", room: "R101", type: "break" },   // Thu 08:00
      { id: 6, className: "Mock Test", date: iso(5), teacherName: "liliBeth", time: "09:00", room: "Hall A", type: "exam" },   // Fri 09:00
      { id: 7, className: "TOEIC B2", date: iso(6), teacherName: "liliBeth", time: "11:00", room: "R203", type: "lesson" },   // Sat 11:00
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

  const hours: number[] = Array.from({ length: 13 }, (_, i) => 8 + i); // 08:00 - 20:00

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

  const sessionsByDayHour = useMemo(() => {
    const map = new Map<string, ClassSession[]>();
    for (const s of filteredSessions) {
      const hour = Number(s.time.slice(0, 2));
      const key = `${s.date}|${hour}`; // yyyy-mm-dd|H
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [filteredSessions]);

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
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
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
    { header: "Teacher", accessor: (row) => row.teacherName || "-" },
    { header: "Date", accessor: (row) => new Date(row.date).toLocaleDateString() },
    { header: "Time", accessor: (row) => row.time },
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
            className="flex items-center gap-1"
          >
            <Edit className="w-3 h-3" />
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDelete(row.id)}
            className="flex items-center gap-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </Button>
        </div>
      )
    }
  ];

  const handleAdd = (payload: { date: string; time: string; room: string; type: string; teacherName?: string; className?: string }) => {
    setSessions((prev) => [
      { id: prev.length ? prev[prev.length - 1].id + 1 : 1, className: payload.className || "New Class", ...payload },
      ...prev,
    ]);
  };

  const handleEdit = (session: ClassSession) => {
    setEditingSession(session);
    setOpenDialog(true);
  };

  const handleUpdate = (payload: { date: string; time: string; room: string; type: string; teacherName?: string; className?: string }) => {
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

  const handleDelete = (sessionId: number) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      setSessions((prev) => prev.filter((session) => session.id !== sessionId));
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
        time: "09:00",
        room: "R101",
        type: "lesson",
        teacherName: "IELTS Teacher",
        className: "IELTS A1 - New Class"
      },
      {
        date: new Date(nextMonday.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // Wednesday
        time: "09:00",
        room: "R101",
        type: "lesson",
        teacherName: "IELTS Teacher",
        className: "IELTS A1 - New Class"
      },
      {
        date: new Date(nextMonday.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // Friday
        time: "09:00",
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setWeekOffset((v) => v - 1)}>{"< Week"}</Button>
          <div className="text-sm text-neutral-700">
            {daysOfWeek[0].toLocaleDateString()} - {daysOfWeek[6].toLocaleDateString()}
          </div>
          <Button variant="secondary" onClick={() => setWeekOffset((v) => v + 1)}>{"Week >"}</Button>

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
          
          {/* Quick Add Dropdown */}
          <div className="relative" ref={quickAddRef}>
            <Button
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              variant="secondary"
              className="flex items-center gap-2"
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
          
          <Button onClick={() => setOpenDialog(true)}>Add session</Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card className="mb-6">
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
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {[searchTerm, typeFilter, teacherFilter, roomFilter].filter(f => f !== "" && f !== "all").length}
                </span>
              )}
            </Button>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="secondary"
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
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
      {view === 'week' ? (
      <Card>
        <div className="grid" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
          {/* Header row */}
          <div />
          {daysOfWeek.map((d) => (
            <div key={d.toDateString()} className="px-2 py-2 text-xs font-semibold text-neutral-600 border-b border-neutral-200">
              {d.toLocaleDateString('en-US', { weekday: 'short' })} {d.getDate()}
            </div>
          ))}
          {/* Time rows */}
          {hours.map((h) => (
            <>
              <div key={`label-${h}`} className="text-xs text-neutral-500 border-r pr-2 py-2">{`${String(h).padStart(2, '0')}:00`}</div>
              {daysOfWeek.map((d) => {
                const key = `${d.toISOString().slice(0, 10)}|${h}`;
                const items = sessionsByDayHour.get(key) || [];
                const isToday = new Date().toDateString() === d.toDateString();
                return (
                  <div key={`${key}`} className={`min-h-16 border-b border-l p-1 ${isToday ? 'bg-primary-50' : ''}`}>
                    <div className="flex flex-col gap-1">
                      {items.map((s) => {
                        // Kiểm tra nếu session đã qua
                        const sessionDateTime = new Date(`${s.date}T${s.time}:00`);
                        const isPast = sessionDateTime < new Date();
                        return (
                          <div
                            key={s.id}
                            className={`rounded-md px-2 py-1 text-[75%] border w-full group hover:shadow-sm transition-shadow
  ${isPast 
        ? "bg-gray-200 text-gray-600 border-gray-400" 
        : s.type === "exam"
        ? "bg-red-100 text-red-700 border-red-200"
        : s.type === "lesson"
        ? "bg-green-100 text-green-700 border-green-200"
        : s.type === "break"
        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
        : ""}
      `}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold">{s.time}</div>
                                <div className="truncate">{s.className} • {s.room}</div>
                                <div className="text-xs opacity-75">{s.teacherName}</div>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEdit(s)}
                                  className="p-1 hover:bg-white/50 rounded"
                                  title="Edit session"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDelete(s.id)}
                                  className="p-1 hover:bg-white/50 rounded text-red-600"
                                  title="Delete session"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </Card>
      ) : (
      <Card>
        <div className="rounded-lg">
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
        </div>
        <div className="mt-2">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </Card>
      )}

      <AddEditSessionDialog 
        open={openDialog} 
        onOpenChange={handleDialogClose} 
        onSave={editingSession ? handleUpdate : handleAdd} 
        initial={editingSession ? {
          date: editingSession.date,
          time: editingSession.time,
          room: editingSession.room,
          type: editingSession.type,
          teacherName: editingSession.teacherName,
          className: editingSession.className
        } : null} 
      />
    </div>
  );
}


