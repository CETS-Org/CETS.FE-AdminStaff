import { Calendar, ChevronRight, Clock, CheckCircle, XCircle, CalendarClock, ArrowRightLeft, GraduationCap, DollarSign, FileText, UserMinus, PauseCircle, AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AcademicRequest } from "@/types/academicRequest.type";

interface RequestCardProps {
  request: AcademicRequest;
  onViewDetails: (request: AcademicRequest) => void;
  isSelected?: boolean;
  onSelect?: (requestId: string) => void;
}

export default function RequestCard({ request, onViewDetails, isSelected = false, onSelect }: RequestCardProps) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "course_change":
        return "Course Change";
      case "schedule_change":
        return "Schedule Change";
      case "class_transfer":
        return "Class Transfer";
      case "meeting_reschedule":
        return "Meeting Reschedule";
      case "enrollment_cancellation":
        return "Enrollment Cancellation";
      case "suspension":
        return "Suspension";
      case "dropout":
        return "Dropout";
      case "refund":
        return "Refund";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string): { Icon: LucideIcon; gradient: string } => {
    switch (type) {
      case "meeting_reschedule":
        return { Icon: CalendarClock, gradient: "from-purple-500 to-purple-600" };
      case "class_transfer":
        return { Icon: ArrowRightLeft, gradient: "from-blue-500 to-blue-600" };
      case "course_change":
        return { Icon: GraduationCap, gradient: "from-indigo-500 to-indigo-600" };
      case "schedule_change":
        return { Icon: Clock, gradient: "from-cyan-500 to-cyan-600" };
      case "enrollment_cancellation":
        return { Icon: UserMinus, gradient: "from-red-500 to-red-600" };
      case "suspension":
        return { Icon: PauseCircle, gradient: "from-orange-500 to-orange-600" };
      case "dropout":
        return { Icon: AlertTriangle, gradient: "from-red-600 to-red-700" };
      case "refund":
        return { Icon: DollarSign, gradient: "from-green-500 to-green-600" };
      case "other":
        return { Icon: FileText, gradient: "from-gray-500 to-gray-600" };
      default:
        return { Icon: Calendar, gradient: "from-blue-500 to-blue-600" };
    }
  };

  const getStatusConfig = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower === "pending" || statusLower === "submitted") {
      return {
        badge: "bg-yellow-100 text-yellow-800",
        border: "border-yellow-200",
        hover: "hover:bg-yellow-50 hover:border-yellow-300",
        icon: "text-yellow-500"
      };
    }
    
    if (statusLower === "underreview") {
      return {
        badge: "bg-purple-100 text-purple-800",
        border: "border-purple-200",
        hover: "hover:bg-purple-50 hover:border-purple-300",
        icon: "text-purple-500"
      };
    }
    
    if (statusLower === "needinfo" || statusLower === "need info") {
      return {
        badge: "bg-blue-100 text-blue-800",
        border: "border-blue-200",
        hover: "hover:bg-blue-50 hover:border-blue-300",
        icon: "text-blue-500"
      };
    }
    
    if (statusLower === "approved" || statusLower === "resolved") {
      return {
        badge: "bg-green-100 text-green-800",
        border: "border-green-200",
        hover: "hover:bg-green-50 hover:border-green-300",
        icon: "text-green-500"
      };
    }
    
    if (statusLower === "rejected") {
      return {
        badge: "bg-red-100 text-red-800",
        border: "border-red-200",
        hover: "hover:bg-red-50 hover:border-red-300",
        icon: "text-red-500"
      };
    }
    
    if (statusLower === "completed") {
      return {
        badge: "bg-gray-100 text-gray-800",
        border: "border-gray-200",
        hover: "hover:bg-gray-50 hover:border-gray-300",
        icon: "text-gray-500"
      };
    }
    
    return {
      badge: "bg-gray-100 text-gray-800",
      border: "border-gray-200",
      hover: "hover:bg-gray-50 hover:border-gray-300",
      icon: "text-gray-500"
    };
  };

  const getPriorityConfig = (priority: string) => {
    const priorityLower = priority?.toLowerCase() || 'medium';
    
    if (priorityLower === "high") {
      return {
        badge: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm",
        text: "High"
      };
    }
    
    if (priorityLower === "low") {
      return {
        badge: "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm",
        text: "Low"
      };
    }
    
    // Default to medium
    return {
      badge: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-sm",
      text: "Medium"
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const statusConfig = getStatusConfig(request.status);
  const priorityConfig = getPriorityConfig(request.priority);
  const typeIcon = getTypeIcon(request.requestType);

  return (
    <div
      onClick={() => onViewDetails(request)}
      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200 border-l-4 ${
        isSelected ? 'border-blue-500 bg-blue-50' : statusConfig.border
      } ${statusConfig.hover} hover:shadow-md`}
    >
      <div className="flex items-center gap-4 flex-1">
        {onSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect?.(request.id);
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${typeIcon.gradient} shadow-md`}>
          <typeIcon.Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-primary-800 mb-1">{getTypeLabel(request.requestType)}</h4>
          <p className="text-sm text-neutral-600 mb-2 line-clamp-1">{request.description || request.reason}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-neutral-600">
              From: {request.studentName}
            </span>
            <span className="text-xs text-neutral-500">
              {request.studentEmail}
            </span>
            <span className="text-xs text-neutral-500">
              • {formatDate(request.submittedDate)}
            </span>
            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${priorityConfig.badge}`}>
              {priorityConfig.text}
            </span>
            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full capitalize ${statusConfig.badge}`}>
              {request.status === "underreview" ? "Under Review" : 
               request.status === "needinfo" ? "Need Info" : 
               request.status}
            </span>
          </div>
        </div>
      </div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusConfig.icon} bg-accent-50`}>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
}
