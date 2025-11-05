// src/components/enrollment/ClassEnrollmentSection.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, UserPlus2, Users, Trash2, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { StudentInfo } from "@/types/student.type";

type FetchResult = { items: StudentInfo[]; hasMore: boolean };

export interface ClassEnrollmentSectionProps {
  selectedIds: string[];                 // accountId
  maxStudents: number;
  onChangeSelected: (ids: string[]) => void;
  fetchStudents: (query: string, page?: number) => Promise<FetchResult>;
  onAutoFill?: () => Promise<string[]>;  // trả về accountId[]
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
}: ClassEnrollmentSectionProps) {
  const L = {
    manualTitle: "Add students",
    enrolledTitle: "Enrolled Students",
    addSelected: "Add",
    clearSelection: "Clear",
    autoAdd: "Auto Add",
    clearAll: "Clear All",
    searchPlaceholder: "Search by Student Code",
    inClassTag: "In class",
    emptyEnrolled: "No students yet.",
    ...labels,
  };

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<StudentInfo[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set()); // accountId set
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
      setRows((prev) => (reset ? res.items : [...prev, ...res.items]));
    } finally {
      setLoading(false);
    }
  };

  // first mount
  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce search
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

  const handleAutoAdd = async () => {
    if (!onAutoFill) return;
    const ids = await onAutoFill();
    const next = ids.filter((id) => !selectedMap.has(id)).slice(0, remaining);
    if (next.length === 0) return;
    onChangeSelected([...selectedIds, ...next]);
  };

  const removeOne = (id: string) => onChangeSelected(selectedIds.filter((x) => x !== id));
  const clearAll = () => onChangeSelected([]);

  const initials = (code: string) =>
    (code ?? "")
      .replace(/[^\w]/g, " ")
      .trim()
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  // ---------- UI ----------
  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — Manual Add */}
        <Card className="p-5 border-gray-200/80 shadow-sm">
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

          {/* List */}
          <div className="space-y-2 max-h-80 overflow-auto pr-1">
            {rows.map((s) => {
              const disabled = selectedMap.has(s.accountId) || selectedIds.length >= maxStudents;
              const checked = picked.has(s.accountId);
              return (
                <label
                  key={s.accountId}
                  className={`group flex items-start gap-3 p-3 rounded-xl border transition
                    ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-blue-300 hover:bg-blue-50/60"}
                    border-gray-200 bg-white`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4"
                    checked={checked}
                    onChange={() => togglePick(s.accountId, disabled)}
                    disabled={disabled}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                        {initials(s.studentCode)}
                      </div>
                      <div className="font-medium text-gray-900">{s.studentCode}</div>
                      {selectedMap.has(s.accountId) && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
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
                <div className="mx-auto mb-2 w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                No results. Try a different keyword.
              </div>
            )}
            {hasMore && !loading && (
              <div className="flex justify-center pt-1">
                <Button variant="secondary" onClick={() => load(false)} className="rounded-full px-5">
                  Load more
                </Button>
              </div>
            )}
          </div>

          {/* Sticky actions */}
          <div className="sticky bottom-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 -mx-5 px-5 pt-3 mt-2 border-t">
            <div className="flex items-center gap-2">
              <Button
                onClick={addSelected}
                disabled={picked.size === 0 || remaining === 0}
                className="flex-1 rounded-xl"
              >
                {L.addSelected}
              </Button>
              <Button variant="secondary" onClick={clearPicked} className="rounded-xl">
                {L.clearSelection}
              </Button>
              {!!onAutoFill && (
                <Button variant="secondary" onClick={handleAutoAdd} className="rounded-xl">
                  {L.autoAdd}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* RIGHT — Enrolled */}
        <Card className="p-5 border-gray-200/80 shadow-sm">
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
            <div className="py-10 text-center text-sm text-gray-500 bg-gradient-to-b from-gray-50 to-transparent rounded-xl border border-dashed">
              {L.emptyEnrolled}
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-auto pr-1">
              {rows
                .filter((s) => selectedMap.has(s.accountId))
                .map((s) => (
                  <div
                    key={s.accountId}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white hover:border-rose-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center">
                        {initials(s.studentCode)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{s.studentCode}</div>
                        <div className="text-[11px] text-gray-500">{s.school ?? "No school"}</div>
                      </div>
                    </div>
                    <Button variant="secondary" onClick={() => removeOne(s.accountId)} className="rounded-xl">
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
