import { Calendar, Flag, Clock, CheckCircle, XCircle } from "lucide-react";
import Button from "@/components/ui/Button";

interface Request {
  id: string;
  studentName: string;
  studentEmail: string;
  requestType: "course_change" | "schedule_change" | "refund" | "other";
  description: string;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  priority: "low" | "medium" | "high";
  note?: string;
}

interface RequestCardProps {
  request: Request;
  onViewDetails: (request: Request) => void;
}

export default function RequestCard({ request, onViewDetails }: RequestCardProps) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "course_change":
        return "Course Change";
      case "schedule_change":
        return "Schedule Change";
      case "refund":
        return "Refund";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {request.description}
          </h3>
          <p className="text-sm text-gray-600">
            From: {request.studentName}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewDetails(request)}
          className="ml-4 flex-shrink-0"
        >
          View Details
        </Button>
      </div>

      {/* Details */}
      <div className="flex items-center gap-6 text-sm text-gray-700">
        {/* Type */}
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-gray-500" />
          <span>{getTypeLabel(request.requestType)}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>{formatDate(request.submittedDate)}</span>
        </div>

        {/* Status */}
        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
          {getStatusIcon(request.status)}
          <span className="uppercase">{request.status}</span>
        </div>
      </div>
    </div>
  );
}
