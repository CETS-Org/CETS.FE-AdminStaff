 // src/components/schedule/StaffSessionCard.tsx
import { Edit, Trash2 } from "lucide-react";
import { getStaffSessionStyles } from "@/components/schedule";
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
  const styles = getStaffSessionStyles(session.type);

  return (
    <div className="group relative">
      <button
        onClick={() => onSessionClick(session, startLabel, endLabel)}
        className={`w-full h-full text-left rounded-md shadow-sm p-1 transition-all duration-200
                   hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400
                   min-h-[60px] max-h-[60px] flex flex-col justify-center overflow-hidden
                   ${styles.border} ${styles.bg} ${styles.hover}`}
        title={`${session.title} • ${startLabel} – ${endLabel}`}
      >
        {displayMode === 'classOnly' ? (
          // Class Only Mode
          <>
            <div className={`text-[10px] font-bold leading-tight truncate group-hover:opacity-90 ${styles.text}`}>
              {session.title}
            </div>
          </>
        ) : displayMode === 'roomOnly' ? (
          // Room Only Mode - Show only room
          <>
            <div className={`text-[10px] font-bold leading-tight truncate group-hover:opacity-90 ${styles.text}`}>
              {session.room || 'No Room'}
            </div>
          </>
        ) : (
          // Full Mode - Show all information except time
          <>
            <div className={`text-[10px] font-bold leading-tight truncate group-hover:opacity-90 mb-0.5 ${styles.text}`}>
              {session.title}
            </div>
            <div className={`text-[9px] font-medium leading-tight truncate mb-0.5 ${styles.text} opacity-80`}>
              {session.classCode}
              {session.room && (
                <span>
                  {" • "}{session.room}
                </span>
              )}
            </div>
            {session.instructor && (
              <div className={`text-[9px] leading-tight truncate ${styles.text} opacity-70`}>
                {session.instructor}
              </div>
            )}
          </>
        )}
      </button>
      
      {/* Action buttons - visible on hover */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(session);
          }}
          className="p-1 bg-white/90 hover:bg-white rounded shadow-sm border border-gray-200"
          title="Edit session"
        >
          <Edit className="w-3 h-3 text-gray-600" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(session);
          }}
          className="p-1 bg-white/90 hover:bg-white rounded shadow-sm border border-gray-200 text-red-600 hover:text-red-700"
          title="Delete session"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
