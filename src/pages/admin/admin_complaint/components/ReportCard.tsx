import { ChevronRight, Clock, CheckCircle, XCircle, MessageSquare, AlertTriangle, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Complaint } from '../../../staff/staff_complaints/components/ComplaintDetailDialog';

interface ReportCardProps {
  report: Complaint;
  onViewDetails: (report: Complaint) => void;
  isSelected?: boolean;
  onSelect?: (reportId: string) => void;
}

export default function ReportCard({ report, onViewDetails, isSelected = false, onSelect }: ReportCardProps) {
  const getStatusConfig = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower === "pending" || statusLower === "submitted" || statusLower === "open") {
      return {
        badge: "bg-yellow-100 text-yellow-800",
        border: "border-yellow-200",
        hover: "hover:bg-yellow-50 hover:border-yellow-300",
        icon: "text-yellow-500"
      };
    }
    
    if (statusLower === "in progress" || statusLower === "inprogress") {
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
    
    if (statusLower === "rejected" || statusLower === "closed") {
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

  const getTypeIcon = (type: string): { Icon: LucideIcon; gradient: string } => {
    const typeLower = type?.toLowerCase() || '';
    
    if (typeLower.includes('technical') || typeLower.includes('system')) {
      return { Icon: AlertTriangle, gradient: "from-orange-500 to-orange-600" };
    }
    
    if (typeLower.includes('payment') || typeLower.includes('finance')) {
      return { Icon: FileText, gradient: "from-blue-500 to-blue-600" };
    }
    
    if (typeLower.includes('schedule')) {
      return { Icon: Clock, gradient: "from-purple-500 to-purple-600" };
    }
    
    if (typeLower.includes('course')) {
      return { Icon: FileText, gradient: "from-indigo-500 to-indigo-600" };
    }
    
    if (typeLower.includes('faculty')) {
      return { Icon: MessageSquare, gradient: "from-pink-500 to-pink-600" };
    }
    
    // Default
    return { Icon: MessageSquare, gradient: "from-gray-500 to-gray-600" };
  };

  const formatDate = (dateString: string) => {
    // Handle both DD/MM/YYYY and ISO date formats
    if (dateString.includes('/')) {
      return dateString;
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const statusConfig = getStatusConfig(report.status);
  const priorityConfig = getPriorityConfig(report.priority || 'Medium');
  const typeIcon = getTypeIcon(report.type || 'General');

  return (
    <div
      onClick={() => onViewDetails(report)}
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
              onSelect?.(report.id);
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${typeIcon.gradient} shadow-md`}>
          <typeIcon.Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{report.type || 'General'}</h4>
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{report.description}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-600">
              From: {report.user.name}
            </span>
            {report.submitterEmail && (
              <span className="text-xs text-gray-500">
                {report.submitterEmail}
              </span>
            )}
            <span className="text-xs text-gray-500">
              • {formatDate(report.date)}
            </span>
            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${priorityConfig.badge}`}>
              {priorityConfig.text}
            </span>
            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full capitalize ${statusConfig.badge}`}>
              {report.status}
            </span>
          </div>
        </div>
      </div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusConfig.icon} bg-gray-50`}>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
}

