// src/components/schedule/StaffSessionCard.tsx
import { Edit, Trash2, MapPin, Video, FileText, Ban, CheckCircle2, Clock } from "lucide-react";
import type { StaffSession } from "@/components/schedule";

type ScheduleDisplayMode = 'full' | 'classOnly' | 'roomOnly';

type StaffSessionCardProps = {
  session: StaffSession;
  startLabel: string;
  endLabel: string;
  onSessionClick: (session: StaffSession, startLabel: string, endLabel: string) => void;
  onEdit: (session: StaffSession) => void;
  onDelete: (session: StaffSession) => void;
  displayMode?: ScheduleDisplayMode;
};

export default function StaffSessionCard({
  session,
  startLabel,
  endLabel,
  onSessionClick,
  onEdit,
  onDelete,
  displayMode = 'full',
}: StaffSessionCardProps) {
  
  const rawData = (session as any).resource || {};
  const isStudy = rawData.isStudy;
  const isActive = rawData.isActive !== false; 
  const isDeleted = rawData.isDeleted;
  
  const hasOnlineLink = !!rawData.onlineMeetingUrl;
  const hasNote = !!rawData.progressNote;

  // --- LOGIC TRẠNG THÁI & GIAO DIỆN ---
  let containerStyle = "";
  let titleColor = "";
  let statusLabel = "";
  let statusStyle = "";
  let statusIcon = null;

  if (!isActive || isDeleted) {
      // CANCELLED
      containerStyle = "bg-gray-50/80 border-l-4 border-red-400 hover:bg-gray-100";
      titleColor = "text-gray-500 line-through decoration-red-400";
      
      statusLabel = "Cancelled";
      statusStyle = "text-red-500 bg-red-50 border-red-200";
      statusIcon = <Ban className="w-3 h-3" />;
  } else if (isStudy) {
      // LESSON (Active)
      containerStyle = "bg-white border-l-4 border-blue-600 hover:bg-blue-50 transition-colors";
      titleColor = "text-blue-900";
      
      statusLabel = "Up Coming";
      statusStyle = "text-blue-600 bg-blue-50 border-blue-200";
      statusIcon = <Clock className="w-3 h-3" />;
  } else {
      // ACTIVITY (Active)
      containerStyle = "bg-white border-l-4 border-amber-500 hover:bg-amber-50 transition-colors";
      titleColor = "text-amber-900";
      
      statusLabel = "Complete";
      statusStyle = "text-amber-600 bg-amber-50 border-amber-200";
      statusIcon = <CheckCircle2 className="w-3 h-3" />;
  }

  return (
    <div className="relative h-full group w-full">
      <button
        onClick={() => onSessionClick(session, startLabel, endLabel)}
        className={`w-full h-full text-left rounded-r-md shadow-sm p-2 
                   focus:outline-none focus:ring-2 focus:ring-offset-1
                   flex flex-col gap-1 overflow-hidden ${containerStyle}`}
      >
        {/* --- HEADER --- */}
        <div className="flex justify-between items-start w-full gap-1">
            {/* Title */}
            <div className={`font-bold text-xs leading-tight truncate flex-1 ${titleColor}`}>
                {session.title}
            </div>
        </div>

        {/* --- STATUS BADGE (Mới thêm) --- */}
        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold w-fit mt-0.5 ${statusStyle}`}>
            {statusIcon}
            <span className="uppercase tracking-wide">{statusLabel}</span>
        </div>

        {/* --- BODY --- */}
        {displayMode !== 'classOnly' && (
            <div className="flex flex-col gap-1 mt-auto pt-1">
                
                {/* Room Info */}
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600">
                    <MapPin className="w-3 h-3 opacity-70" />
                    <span className="truncate">{session.room || "No Room"}</span>
                </div>

                {/* Icons Row */}
                <div className="flex items-center gap-1.5 mt-0.5">
                    {hasOnlineLink && (
                        <div className="flex items-center gap-1 text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100" title="Online Meeting">
                            <Video className="w-2.5 h-2.5" />
                            <span>Online</span>
                        </div>
                    )}

                    {hasNote && (
                        <div className="flex items-center gap-1 text-[9px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200" title="Note added">
                            <FileText className="w-2.5 h-2.5" />
                            <span>Note</span>
                        </div>
                    )}
                </div>
            </div>
        )}
      </button>
      
      {/* --- HOVER ACTIONS --- */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col gap-1 z-10 translate-x-2 group-hover:translate-x-0">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(session); }}
          className="p-1.5 bg-white hover:bg-blue-50 rounded-full shadow-md border border-gray-200 text-blue-600 transition-transform hover:scale-110"
          title="Edit"
        >
          <Edit className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(session); }}
          className="p-1.5 bg-white hover:bg-red-50 rounded-full shadow-md border border-gray-200 text-red-500 transition-transform hover:scale-110"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}