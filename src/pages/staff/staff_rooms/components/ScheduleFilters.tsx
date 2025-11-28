import { useState, useRef, useEffect } from "react";
import Input from "@/components/ui/Input";
import { Search, Filter, X } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Room, RoomType, RoomStatus } from "@/types/room.type";
import { getRoomStatuses } from "@/api/room.api";

interface ScheduleFiltersProps {
  rooms: Room[];
  roomTypes: RoomType[];
  onFilterChange: (filters: {
    search: string;
    roomType: string;
    status: string;
  }) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export default function ScheduleFilters({
  rooms,
  roomTypes,
  onFilterChange,
  searchInputRef,
}: ScheduleFiltersProps) {
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = searchInputRef || internalRef;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [statuses, setStatuses] = useState<RoomStatus[]>([]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFilterChange({
      search: value,
      roomType: selectedRoomType,
      status: selectedStatus,
    });
  };

  const handleRoomTypeChange = (value: string) => {
    setSelectedRoomType(value);
    onFilterChange({
      search: searchQuery,
      roomType: value,
      status: selectedStatus,
    });
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    onFilterChange({
      search: searchQuery,
      roomType: selectedRoomType,
      status: value,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedRoomType("all");
    setSelectedStatus("all");
    onFilterChange({
      search: "",
      roomType: "all",
      status: "all",
    });
  };

  const hasActiveFilters =
    searchQuery || selectedRoomType !== "all" || selectedStatus !== "all";

  // Load room statuses for status filter
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const data = await getRoomStatuses();
        setStatuses(data || []);
      } catch (error) {
        console.warn("Failed to load room statuses for filter", error);
      }
    };

    fetchStatuses();
  }, []);

  return (
    <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search room... (Ctrl+F)"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Room Type Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
        <select
          value={selectedRoomType}
          onChange={(e) => handleRoomTypeChange(e.target.value)}
          className="h-10 pl-10 pr-8 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
        >
          <option value="all">All Types</option>
          {roomTypes && roomTypes.length > 0 && roomTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <select
        value={selectedStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="h-10 px-4 pr-8 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
      >
        <option value="all">All Status</option>
        {statuses.map((status) => (
          <option key={status.id} value={status.code}>
            {status.name}
          </option>
        ))}
      </select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          iconLeft={<X className="w-4 h-4" />}
        >
          Clear
        </Button>
      )}
    </div>
  );
}

