import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import AddEditSessionDialog from "./AddEditSessionDialog";
import Card from "@/components/ui/Card";
import Table, { type TableColumn } from "@/components/ui/Table";
import Pagination from "@/shared/pagination";

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

  const sessionsByDayHour = useMemo(() => {
    const map = new Map<string, ClassSession[]>();
    for (const s of sessions) {
      const hour = Number(s.time.slice(0, 2));
      const key = `${s.date}|${hour}`; // yyyy-mm-dd|H
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [sessions]);

  // Table view data: sessions within the current week range
  const weekStartISO = daysOfWeek[0].toISOString().slice(0, 10);
  const weekEndISO = daysOfWeek[6].toISOString().slice(0, 10);
  const weekSessions = useMemo(() => {
    const start = new Date(weekStartISO);
    const end = new Date(weekEndISO);
    return sessions
      .filter((s) => {
        const d = new Date(s.date);
        return d >= start && d <= end;
      })
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [sessions, weekStartISO, weekEndISO]);

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
    }
  ];

  const handleAdd = (payload: { date: string; time: string; room: string; type: string; teacherName?: string }) => {
    setSessions((prev) => [
      { id: prev.length ? prev[prev.length - 1].id + 1 : 1, className: "New Class", ...payload },
      ...prev,
    ]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-600">Class Schedule</h1>
        <div className="flex items-center gap-2">
        
         
            <>
              <Button variant="secondary" onClick={() => setWeekOffset((v) => v - 1)}>{"< Week"}</Button>
              <div className="text-sm text-neutral-700">
                {daysOfWeek[0].toLocaleDateString()} - {daysOfWeek[6].toLocaleDateString()}
              </div>
              <Button variant="secondary" onClick={() => setWeekOffset((v) => v + 1)}>{"Week >"}</Button>
            </>
          

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
          <Button onClick={() => setOpenDialog(true)}>Add session</Button>
        </div>
      </div>
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
                            className={`rounded-md px-2 py-1 text-[75%] border w-full truncate flex flex-col
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
                            <span className="font-semibold">{s.time}</span> • {s.className} • {s.room}
                            <span> • {s.teacherName}</span>
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
          <Table columns={columns} data={currentTableData} />
        </div>
        <div className="mt-2">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </Card>
      )}

      <AddEditSessionDialog open={openDialog} onOpenChange={setOpenDialog} onSave={handleAdd} initial={null} />
    </div>
  );
}


