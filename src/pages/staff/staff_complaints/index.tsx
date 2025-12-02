import React, { useState, useEffect } from "react";
import { AlertTriangle, FileText, ChevronRight } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SystemReportPopup from "./components/SystemReportPopup";
import StaffComplaintDetailDialog from "./components/StaffComplaintDetailDialog";
import { getMyComplaints, type SystemComplaint } from "@/api/complaint.api";
import { getCurrentUserId } from "@/lib/utils";

export default function StaffComplaintManagement() {
  const userId = getCurrentUserId();
  const [activeTab, setActiveTab] = useState<"all" | "open" | "pending" | "resolved" | "rejected">("all");
  const [showSubmitPopup, setShowSubmitPopup] = useState(false);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [systemComplaints, setSystemComplaints] = useState<SystemComplaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch system complaints on mount
  useEffect(() => {
    if (userId && userId !== "00000000-0000-0000-0000-000000000000") {
      fetchSystemComplaints();
    }
  }, [userId]);

  const fetchSystemComplaints = async () => {
    if (!userId || userId === "00000000-0000-0000-0000-000000000000") return;
    
    setIsLoading(true);
    try {
      const complaints = await getMyComplaints(userId);
      setSystemComplaints(complaints);
    } catch (error) {
      console.error('Error fetching system complaints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitSuccess = () => {
    // Refresh system complaints after submission
    fetchSystemComplaints();
  };

  const handleViewDetails = (complaintId: string) => {
    setSelectedComplaintId(complaintId);
    setShowDetailPopup(true);
  };

  const getStatusConfig = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower === "pending" || statusLower === "submitted" || statusLower === "open") {
      return {
        badge: "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm",
        border: "border-orange-200",
        hover: "hover:bg-gradient-to-r hover:from-orange-25 hover:to-orange-50 hover:border-orange-300",
        icon: "text-orange-500"
      };
    }
    
    if (statusLower === "in progress" || statusLower === "inprogress") {
      return {
        badge: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm",
        border: "border-blue-200",
        hover: "hover:bg-gradient-to-r hover:from-blue-25 hover:to-blue-50 hover:border-blue-300",
        icon: "text-blue-500"
      };
    }
    
    if (statusLower === "approved" || statusLower === "resolved") {
      return {
        badge: "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm",
        border: "border-green-200",
        hover: "hover:bg-gradient-to-r hover:from-green-25 hover:to-green-50 hover:border-green-300",
        icon: "text-green-500"
      };
    }
    
    if (statusLower === "rejected" || statusLower === "closed") {
      return {
        badge: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm",
        border: "border-red-200",
        hover: "hover:bg-gradient-to-r hover:from-red-25 hover:to-red-50 hover:border-red-300",
        icon: "text-red-500"
      };
    }
    
    return {
      badge: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm",
      border: "border-blue-200",
      hover: "hover:bg-gradient-to-r hover:from-blue-25 hover:to-blue-50 hover:border-blue-300",
      icon: "text-blue-500"
    };
  };

  const renderSystemReports = (tab: "all" | "open" | "pending" | "resolved" | "rejected") => {
    if (isLoading) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p>Loading system reports...</p>
        </div>
      );
    }

    // Filter based on status
    const filtered = systemComplaints.filter(complaint => {
      const statusLower = complaint.statusName?.toLowerCase() || '';
      if (tab === "all") {
        return true;
      } else if (tab === "open") {
        return statusLower === 'open';
      } else if (tab === "pending") {
        return statusLower === 'in progress' || statusLower === 'inprogress';
      } else if (tab === "rejected") {
        return statusLower === 'closed';
      } else {
        // resolved tab
        return statusLower === 'resolved';
      }
    });

    if (filtered.length === 0) {
      const emptyMessages = {
        all: 'No system reports found',
        open: 'No open system reports found',
        pending: 'No in progress system reports found',
        resolved: 'No resolved system reports found',
        rejected: 'No closed system reports found'
      };
      return (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>{emptyMessages[tab]}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {filtered.map((complaint) => {
          const statusConfig = getStatusConfig(complaint.statusName || 'Open');
          return (
            <div
              key={complaint.id}
              onClick={() => handleViewDetails(complaint.id)}
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200 border-l-4
                ${statusConfig.border} ${statusConfig.hover} hover:shadow-md`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 shadow-md`}>
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{complaint.title}</h4>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">{complaint.description}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {complaint.reportTypeName && (
                      <span className="text-xs text-gray-600">
                        Type: {complaint.reportTypeName}
                      </span>
                    )}
                    {complaint.priority && (
                      <span className="text-xs text-gray-600">
                        Priority: {complaint.priority}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      • {new Date(complaint.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statusConfig.badge}`}>
                      {complaint.statusName || 'Open'}
                    </span>
                  </div>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusConfig.icon} bg-gray-50`}>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <PageHeader
          title="System Reports"
          description="Submit system reports and track their resolution. Reports will be reviewed by admin staff."
        />
      </div>

      {/* Main Card */}
      <Card>
        <div className="p-6">
          {/* Card Header with Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md bg-gradient-to-br from-orange-500 to-orange-600">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  System Reports
                </h3>
                <p className="text-sm text-gray-600">
                  View and track your system reports
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowSubmitPopup(true)}
            >
              Create Report
            </Button>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <div className="text-sm text-blue-700 flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-white">!</span>
              </div>
              <span>
                System reports are reviewed by admin staff. High priority issues are addressed within 24 hours. You will be notified of any updates.
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("all")}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "all"
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All Reports
              </button>
              <button
                onClick={() => setActiveTab("open")}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "open"
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Open Reports
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "pending"
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                In Progress Reports
              </button>
              <button
                onClick={() => setActiveTab("resolved")}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "resolved"
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Resolved Reports
              </button>
              <button
                onClick={() => setActiveTab("rejected")}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "rejected"
                    ? "border-red-600 text-red-700"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}
              >
                Closed Reports
              </button>
            </nav>
          </div>

          {/* Content */}
          <div>
            {renderSystemReports(activeTab)}
          </div>
        </div>
      </Card>

      {/* Popups */}
      <SystemReportPopup
        isOpen={showSubmitPopup}
        onClose={() => setShowSubmitPopup(false)}
        onSubmit={handleSubmitSuccess}
      />

      <StaffComplaintDetailDialog
        isOpen={showDetailPopup}
        onClose={() => {
          setShowDetailPopup(false);
          setSelectedComplaintId(null);
        }}
        complaintId={selectedComplaintId}
      />
    </div>
  );
}
