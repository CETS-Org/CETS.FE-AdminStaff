// src/pages/staff/staff_classes/components/ClassEnrollmentSection.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, UserPlus2, Users, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// Import Type
import type { WaitingStudentItem } from "@/pages/staff/staff_classes/data/classPlacement.types";

type FetchResult = { items: WaitingStudentItem[]; hasMore: boolean };

export interface ClassEnrollmentSectionProps {
  selectedIds: string[];
  maxStudents: number;
  onChangeSelected: (ids: string[]) => void;
  fetchStudents: (query: string, page?: number) => Promise<FetchResult>;
  
  // [UPDATED]: Đổi kiểu trả về thành WaitingStudentItem[] để khớp với API mới
  onAutoFill?: () => Promise<WaitingStudentItem[]>;
  
  // Thêm prop className để tùy chỉnh chiều cao từ cha
  className?: string;
  
  labels?: Partial<{
    manualTitle: string;
    enrolledTitle: string;
    addSelected: string;
    clearSelection: string;
    autoAdd: string;
    clearAll: string;
    searchPlaceholder: string;
    inClassTag: string;
    emptyEnrolled: string;
  }>;
}

export default function ClassEnrollmentSection({
  selectedIds,
  maxStudents,
  onChangeSelected,
  fetchStudents,
  onAutoFill,
  labels,
  className = "h-[500px]", // Mặc định chiều cao 500px (~8-10 items)
}: ClassEnrollmentSectionProps) {
  const L = {
    manualTitle: "Add students",
    enrolledTitle: "Enrolled Students",
    addSelected: "Add",
    clearSelection: "Clear",
    autoAdd: "Auto Add",
    clearAll: "Clear All",
    searchPlaceholder: "Search by Name or Code",
    inClassTag: "In class",
    emptyEnrolled: "No students yet.",
    ...labels,
  };

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Rows đóng vai trò là cache chứa thông tin chi tiết của tất cả học sinh (tìm kiếm + auto pick)
  const [rows, setRows] = useState<WaitingStudentItem[]>([]);
  
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const debounceRef = useRef<number | undefined>(undefined);

  const remaining = Math.max(0, maxStudents - selectedIds.length);
  const selectedMap = useMemo(() => new Set(selectedIds), [selectedIds]);

  const load = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const p = reset ? 1 : page;
      const res = await fetchStudents(query, p);
      setHasMore(res.hasMore);
      setPage(p + 1);
      
      // Reset picked nếu search mới
      if (reset) setPicked(new Set());

      // Lọc trùng (nếu API trả về trùng lặp do pagination)
      setRows((prev) => {
          const newItems = reset ? res.items : [...prev, ...res.items];
          // Deduplicate by ID
          return Array.from(new Map(newItems.map(item => [item.studentId, item])).values());
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setPage(1);
      load(true);
    }, 300) as unknown as number;
    return () => window.clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const togglePick = (id: string, disabled?: boolean) => {
    if (disabled) return;
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addSelected = () => {
    const toAdd = Array.from(picked).filter((id) => !selectedMap.has(id));
    const capped = toAdd.slice(0, remaining);
    if (capped.length === 0) return;
    onChangeSelected([...selectedIds, ...capped]);
    setPicked(new Set());
  };

  const clearPicked = () => setPicked(new Set());

  // [UPDATED]: Logic xử lý Auto Add mới
  const handleAutoAdd = async () => {
    if (!onAutoFill) return;
    try {
        setLoading(true);
        const items = await onAutoFill(); // Nhận về mảng objects
        
        if (!items || items.length === 0) return;

        // 1. Cập nhật rows để cột bên phải ("Enrolled") có dữ liệu hiển thị
        setRows((prev) => {
            const combined = [...prev, ...items];
            return Array.from(new Map(combined.map(item => [item.studentId, item])).values());
        });

        // 2. Lọc ID và cập nhật selectedIds cho component cha
        const ids = items.map(i => i.studentId);
        const next = ids.filter((id) => !selectedMap.has(id)).slice(0, remaining);
        
        if (next.length === 0) return;
        onChangeSelected([...selectedIds, ...next]);
    } catch (error) {
        console.error("Auto add failed", error);
    } finally {
        setLoading(false);
    }
  };

  const removeOne = (id: string) => onChangeSelected(selectedIds.filter((x) => x !== id));
  const clearAll = () => onChangeSelected([]);

  const initials = (name: string) =>
    (name ?? "")
      .replace(/[^\w\s]/g, "")
      .trim()
      .split(/\s+/)
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  // ---------- UI ----------
  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — Manual Add */}
        <Card className="p-5 border-gray-200/80 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow">
                <UserPlus2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{L.manualTitle}</div>
                <div className="text-xs text-gray-500">
                  Pick from search list. Remaining:
                  <span className={`ml-1 font-semibold ${remaining ? "text-emerald-600" : "text-rose-600"}`}>
                    {remaining}/{maxStudents}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">{selectedIds.length}/{maxStudents}</div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={L.searchPlaceholder}
              className="pl-9 rounded-xl"
            />
          </div>

          {/* List Waiting Students */}
          <div className={`space-y-2 overflow-y-auto pr-1 flex-1 border rounded-lg p-2 ${className}`}>
            {rows.map((s) => {
              const disabled = selectedMap.has(s.studentId) || selectedIds.length >= maxStudents;
              const checked = picked.has(s.studentId);
              
              return (
                <label
                  key={s.studentId}
                  className={`group flex items-start gap-3 p-3 rounded-xl border transition
                    ${disabled ? "opacity-60 cursor-not-allowed bg-gray-50" : "cursor-pointer hover:border-blue-300 hover:bg-blue-50/60"}
                    ${checked ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"}`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={checked}
                    onChange={() => togglePick(s.studentId, disabled)}
                    disabled={disabled}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-sm shrink-0">
                        {initials(s.fullName)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">{s.fullName}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{s.studentCode}</div>
                      </div>

                      {selectedMap.has(s.studentId) && (
                        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap">
                          {L.inClassTag}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}

            {loading && (
              <div className="flex items-center justify-center py-4 text-sm text-gray-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </div>
            )}
            {!rows.length && !loading && (
              <div className="py-10 text-center text-sm text-gray-500">
                No results. Try a different keyword.
              </div>
            )}
            {hasMore && !loading && (
              <div className="flex justify-center pt-1 pb-2">
                <Button variant="secondary" onClick={() => load(false)} className="rounded-full px-5 h-8 text-xs">
                  Load more
                </Button>
              </div>
            )}
          </div>

          {/* Sticky actions */}
          <div className="pt-4 mt-auto border-t grid grid-cols-3 gap-2">
              <Button
                onClick={addSelected}
                disabled={picked.size === 0 || remaining === 0}
                className="col-span-1 rounded-xl"
              >
                {L.addSelected} {picked.size > 0 && `(${picked.size})`}
              </Button>
              <Button variant="secondary" onClick={clearPicked} className="col-span-1 rounded-xl" disabled={picked.size === 0}>
                {L.clearSelection}
              </Button>
              {!!onAutoFill && (
                <Button variant="secondary" onClick={handleAutoAdd} className="col-span-1 rounded-xl" disabled={loading}>
                   {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : L.autoAdd}
                </Button>
              )}
          </div>
        </Card>

        {/* RIGHT — Enrolled */}
        <Card className="p-5 border-gray-200/80 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white flex items-center justify-center shadow">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{L.enrolledTitle}</div>
                <div className="text-xs text-gray-500">
                  {selectedIds.length} student{selectedIds.length !== 1 ? "s" : ""} enrolled
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={clearAll}
              disabled={selectedIds.length === 0}
              className="rounded-xl"
            >
              {L.clearAll}
            </Button>
          </div>

          {selectedIds.length === 0 ? (
            <div className={`flex items-center justify-center text-sm text-gray-500 bg-gray-50/50 rounded-xl border border-dashed h-[550px]`}>
              {L.emptyEnrolled}
            </div>
          ) : (
            <div className={`space-y-2 overflow-y-auto pr-1 flex-1 h-[550px]`}>
              {rows
                .filter((s) => selectedMap.has(s.studentId))
                .map((s) => (
                  <div
                    key={s.studentId}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white hover:border-rose-300 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {initials(s.fullName)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{s.fullName}</div>
                        <div className="text-[11px] text-gray-500">{s.studentCode}</div>
                      </div>
                    </div>
                    <Button 
                        variant="secondary" 
                        onClick={() => removeOne(s.studentId)} 
                        className="rounded-xl h-8 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}