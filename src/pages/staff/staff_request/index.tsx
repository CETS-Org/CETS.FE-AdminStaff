import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RequestCard from "./components/RequestCard";
import Pagination from "@/shared/pagination";
import { Search, Filter, Clock, CheckCircle, XCircle, Calendar, X, TrendingUp, Download, SortAsc, SortDesc, FileText, Zap, MessageSquare } from "lucide-react";
import RequestDetailDialog from "./components/RequestDetailDialog";
import ConfirmRequestDialog from "./components/ConfirmRequestDialog";
import { getAllAcademicRequests, getAcademicRequestsByStatus, processAcademicRequest } from "@/api/academicRequest.api";
import { getLookupsByTypeCode } from "@/api/core.api";
import { getUserInfo } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import type { AcademicRequestResponse, AcademicRequest } from "@/types/academicRequest.type";

export default function StaffRequestPage() {
  const { showToast, toasts, hideToast } = useToast();
  const [requests, setRequests] = useState<AcademicRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedRequest, setSelectedRequest] = useState<AcademicRequest | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction] = useState<"approve" | "reject">("approve");
  const [confirmRequest, setConfirmRequest] = useState<AcademicRequest | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterPriority, setFilterPriority] = useState('all');
  const [statusLookups, setStatusLookups] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [statusMap, setStatusMap] = useState<Map<string, string>>(new Map());

  // Map API response to AcademicRequest interface
  const mapToRequest = useCallback((apiRequest: AcademicRequestResponse): AcademicRequest => {
    const statusName = apiRequest.statusName?.toLowerCase() || "";
    const statusCode = statusLookups.find(s => s.id === apiRequest.academicRequestStatusID)?.code?.toLowerCase() || "";
    let status: "pending" | "approved" | "rejected" = "pending";
    
    // Check both status name and code
    const combinedStatus = `${statusName} ${statusCode}`;
    if (combinedStatus.includes("approved") || combinedStatus.includes("accept") || combinedStatus.includes("approved")) {
      status = "approved";
    } else if (combinedStatus.includes("rejected") || combinedStatus.includes("reject") || combinedStatus.includes("denied") || combinedStatus.includes("declined")) {
      status = "rejected";
    } else {
      status = "pending";
    }

    // Map request type - you may need to adjust based on your actual request type names
    const requestTypeName = apiRequest.requestTypeName?.toLowerCase() || "";
    let requestType: "course_change" | "schedule_change" | "refund" | "other" | "class_transfer" | "meeting_reschedule" | "enrollment_cancellation" | "suspension" = "other";
    if (requestTypeName.includes("class transfer") || requestTypeName.includes("classtransfer")) {
      requestType = "class_transfer";
    } else if (requestTypeName.includes("meeting reschedule") || requestTypeName.includes("meetingreschedule")) {
      requestType = "meeting_reschedule";
    } else if (requestTypeName.includes("enrollment cancellation") || requestTypeName.includes("cancellation")) {
      requestType = "enrollment_cancellation";
    } else if (requestTypeName.includes("suspension") || requestTypeName.includes("suspend")) {
      requestType = "suspension";
    } else if (requestTypeName.includes("schedule")) {
      requestType = "schedule_change";
    } else if (requestTypeName.includes("course")) {
      requestType = "course_change";
    } else if (requestTypeName.includes("refund")) {
      requestType = "refund";
    }

    // Map priority from API response (default to "medium" if not provided)
    const priorityName = (apiRequest.priorityName || "medium").toLowerCase();
    let priority: "low" | "medium" | "high" = "medium";
    if (priorityName.includes("high")) {
      priority = "high";
    } else if (priorityName.includes("low")) {
      priority = "low";
    } else {
      priority = "medium";
    }

    return {
      id: apiRequest.id,
      studentName: apiRequest.studentName || "Unknown",
      studentEmail: apiRequest.studentEmail || "",
      requestType,
      description: apiRequest.reason || "",
      status,
      submittedDate: apiRequest.createdAt,
      priority,
      reason: apiRequest.reason,
      staffResponse: apiRequest.staffResponse,
      processedByName: apiRequest.processedByName,
      processedAt: apiRequest.processedAt,
      attachmentUrl: apiRequest.attachmentUrl,
      // Class transfer fields
      fromClassID: apiRequest.fromClassID,
      fromClassName: apiRequest.fromClassName,
      toClassID: apiRequest.toClassID,
      toClassName: apiRequest.toClassName,
      effectiveDate: apiRequest.effectiveDate,
      // For class transfer - specific meeting details
      fromMeetingDate: apiRequest.fromMeetingDate,
      fromSlotID: apiRequest.fromSlotID,
      fromSlotName: apiRequest.fromSlotName,
      toMeetingDate: apiRequest.toMeetingDate,
      toSlotID: apiRequest.toSlotID,
      toSlotName: apiRequest.toSlotName,
      // Meeting reschedule fields
      classMeetingID: apiRequest.classMeetingID,
      meetingInfo: apiRequest.meetingInfo,
      // Original meeting details
      // New meeting details (for meeting reschedule, uses toMeetingDate and toSlotID)
      newRoomID: apiRequest.newRoomID,
      newRoomName: apiRequest.newRoomName,
    };
  }, [statusLookups]);

  // Fetch status lookups
  useEffect(() => {
    const fetchStatusLookups = async () => {
      try {
        const response = await getLookupsByTypeCode("AcademicRequestStatus");
        const lookups = response.data.map((lookup: any) => ({
          id: lookup.lookUpId || lookup.LookUpId || lookup.id,
          name: lookup.name,
          code: lookup.code?.toLowerCase() || "",
        }));
        setStatusLookups(lookups);
        
        // Create a map for quick lookup
        const map = new Map<string, string>();
        lookups.forEach((lookup: { id: string; code: string }) => {
          map.set(lookup.code, lookup.id);
        });
        setStatusMap(map);
      } catch (error) {
        console.error("Error fetching status lookups:", error);
      }
    };

    fetchStatusLookups();
  }, []);

  // Fetch academic requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        let response;
        
        if (filterStatus !== "all" && statusMap.has(filterStatus)) {
          const statusId = statusMap.get(filterStatus)!;
          response = await getAcademicRequestsByStatus(statusId);
        } else {
          response = await getAllAcademicRequests();
        }
        
        const mappedRequests = response.data.map(mapToRequest);
        setRequests(mappedRequests);
      } catch (error) {
        console.error("Error fetching academic requests:", error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    if (statusMap.size > 0 || filterStatus === "all") {
      fetchRequests();
    }
  }, [filterStatus, statusMap, mapToRequest]);

  // Statistics calculations
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    highPriority: requests.filter(r => r.priority === 'high').length,
    thisWeek: requests.filter(r => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(r.submittedDate) >= weekAgo;
    }).length
  };

  // Sorting logic
  const sortRequests = (requests: AcademicRequest[]) => {
    return [...requests].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.submittedDate).getTime();
          bValue = new Date(b.submittedDate).getTime();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'name':
          aValue = a.studentName;
          bValue = b.studentName;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedRequests.length === paginatedRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(paginatedRequests.map(r => r.id));
    }
  };

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleBulkApprove = async () => {
    for (const id of selectedRequests) {
      await handleStatusChange(id, 'approved', 'Bulk approved');
    }
    setSelectedRequests([]);
  };

  const handleBulkReject = async () => {
    for (const id of selectedRequests) {
      await handleStatusChange(id, 'rejected', 'Bulk rejected');
    }
    setSelectedRequests([]);
  };

  const handleExport = () => {
    const dataToExport = filteredRequests.map(request => ({
      'Student Name': request.studentName,
      'Student Email': request.studentEmail,
      'Request Type': getTypeLabel(request.requestType),
      'Description': request.description,
      'Status': request.status,
      'Priority': request.priority,
      'Submitted Date': request.submittedDate,
      'Reason': request.reason || ''
    }));
    
    const csv = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student-requests.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredRequests = sortRequests(requests.filter(request => {
    const matchesSearch = request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    const matchesType = filterType === "all" || request.requestType === filterType;
    const matchesPriority = filterPriority === "all" || request.priority === filterPriority;
    
    // Date filtering
    const requestDate = new Date(request.submittedDate);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    let matchesDate = true;
    if (fromDate && toDate) {
      matchesDate = requestDate >= fromDate && requestDate <= toDate;
    } else if (fromDate) {
      matchesDate = requestDate >= fromDate;
    } else if (toDate) {
      matchesDate = requestDate <= toDate;
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesDate;
  }));

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterType("all");
    setFilterPriority("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
    setSelectedRequests([]);
  };

  const handleStatusChange = async (requestId: string, newStatus: "approved" | "rejected", reply: string, selectedRoomID?: string) => {
    try {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.id) {
        console.error("User info not found");
        return;
      }

      // Find the status ID based on the status name
      const statusName = newStatus === "approved" ? "approved" : "rejected";
      const statusLookup = statusLookups.find(s => {
        const code = s.code?.toLowerCase() || "";
        const name = s.name?.toLowerCase() || "";
        
        // Match exact status name first
        if (code.includes(statusName) || name.includes(statusName)) {
          return true;
        }
        
        if (newStatus === "approved") {
          return code.includes("approve") || name.includes("approve");
        }
        
        if (newStatus === "rejected") {
          return (code.includes("rejected") || name.includes("rejected"));
        }
        
        return false;
      });

      if (!statusLookup || !statusLookup.id) {
        console.error("Status lookup not found for:", newStatus);
        console.error("Available statuses:", statusLookups);
        console.error("Selected status lookup:", statusLookup);
        alert("Status lookup not found. Please refresh the page.");
        return;
      }

      // Validate that statusID is not empty
      if (!statusLookup.id || statusLookup.id === "00000000-0000-0000-0000-000000000000") {
        console.error("Invalid status ID:", statusLookup.id);
        alert("Invalid status ID. Please refresh the page.");
        return;
      }

      await processAcademicRequest({
        requestID: requestId,
        statusID: statusLookup.id,
        description: reply,
        staffID: userInfo.id,
        selectedRoomID: selectedRoomID,
      });

      // Show success toast
      const actionText = newStatus === "approved" ? "approved" : "rejected";
      showToast(`Request has been ${actionText} successfully`, 'success');

      // Update local state
      setRequests(requests.map(request => 
        request.id === requestId 
          ? { ...request, status: newStatus }
          : request
      ));

      // Refresh the list
      const response = await getAllAcademicRequests();
      const mappedRequests = response.data.map(mapToRequest);
      setRequests(mappedRequests);
    } catch (error: any) {
      console.error("Error processing request:", error);
      const errorMessage = error.response?.data?.error || "Failed to process request. Please try again.";
      showToast(errorMessage, 'error');
    }
  };

  const handleViewDetails = (request: AcademicRequest) => {
    setSelectedRequest(request);
    setShowDetailDialog(true);
  };

  const handleApprove = async (reply: string, selectedRoomID?: string) => {
    if (selectedRequest) {
      await handleStatusChange(selectedRequest.id, "approved", reply, selectedRoomID);
      setShowDetailDialog(false);
      setSelectedRequest(null);
    }
  };

  const handleReject = async (reply: string) => {
    if (selectedRequest) {
      await handleStatusChange(selectedRequest.id, "rejected", reply);
      setShowDetailDialog(false);
      setSelectedRequest(null);
    }
  };

  const handleConfirmAction = async (reply: string) => {
    if (confirmRequest) {
      const status = confirmAction === "approve" ? "approved" : "rejected";
      await handleStatusChange(confirmRequest.id, status, reply);
      console.log(`${status} with reply:`, reply);
    }
    setShowConfirmDialog(false);
    setConfirmRequest(null);
  };

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
      case "refund":
        return "Refund";
      case "other":
        return "Other";
      default:
        return type;
    }
  };


  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Staff Dashboard", href: "/staff" },
    { label: "Student Requests", href: "/staff/requests" }
  ];

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Page Header */}
      <PageHeader
        title="Student Requests"
        description="Manage and respond to student requests with comprehensive tools"
      />

      <div className="space-y-6">

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Total Requests</p>
                <p className="text-3xl font-bold text-blue-900 group-hover:text-blue-600 transition-colors">
                  {stats.total}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  All submissions
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-700">Pending</p>
                <p className="text-3xl font-bold text-yellow-900 group-hover:text-yellow-600 transition-colors">
                  {stats.pending}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Awaiting review
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Approved</p>
                <p className="text-3xl font-bold text-green-900 group-hover:text-green-600 transition-colors">
                  {stats.approved}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.total > 0 ? `${Math.round((stats.approved / stats.total) * 100)}% of total` : '0% of total'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <XCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700">Rejected</p>
                <p className="text-3xl font-bold text-red-900 group-hover:text-red-600 transition-colors">
                  {stats.rejected}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {stats.total > 0 ? `${Math.round((stats.rejected / stats.total) * 100)}% of total` : '0% of total'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">High Priority</p>
                <p className="text-3xl font-bold text-purple-900 group-hover:text-purple-600 transition-colors">
                  {stats.highPriority}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Urgent attention
                </p>
              </div>
            </div>
          </Card>

          
        </div>

      {/* Requests Table */}
      <Card>
        <div className="p-6">
          {/* Card Header with Action Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md bg-gradient-to-br from-blue-500 to-blue-600">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary-800">
                  Student Requests Management
                </h3>
                <p className="text-sm text-accent-600">
                  View and manage all student academic requests
                </p>
              </div>
            </div>
            <Button 
              onClick={handleExport}
              variant="secondary"
              iconLeft={<Download className="w-4 h-4" />}
            >
              Export
            </Button>
          </div>

        {/* Bulk Actions and Sorting */}
        {selectedRequests.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-900">
                  {selectedRequests.length} request(s) selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleBulkApprove}
                  className="!bg-green-600 hover:!bg-green-700 text-white"
                  iconLeft={<CheckCircle className="w-4 h-4 mr-2" />}
                >
                  Approve All
                </Button>
                <Button
                  size="sm"
                  onClick={handleBulkReject}
                  className="!bg-red-600 hover:!bg-red-700 text-white"
                  iconLeft={<XCircle className="w-4 h-4 mr-2" />}
                >
                  Reject All
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="space-y-4 mb-6">
          {/* Search Bar and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by student name, email, or description..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
          {/* Sorting Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</span>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'status' | 'name')}
                  options={[
                    { label: "Date", value: "date" },
                    { label: "Priority", value: "priority" },
                    { label: "Status", value: "status" },
                    { label: "Student Name", value: "name" }
                  ]}
                className="w-40"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  iconLeft={sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </Button>
          </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
                iconLeft={<Filter className="w-4 h-4" />}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                  {(searchTerm || filterStatus !== "all" || filterType !== "all" || filterPriority !== "all" || dateFrom || dateTo) && (
                    <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {[searchTerm, filterStatus, filterType, filterPriority, dateFrom, dateTo].filter(f => f !== "" && f !== "all").length}
                    </span>
                  )}
              </Button>
              <Button
                variant="secondary"
                onClick={clearFilters}
                className="whitespace-nowrap text-red-500 hover:text-red-600 hover:bg-red-100"
                iconLeft={<X className="w-4 h-4" />}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t">
              <Select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { label: "All Status", value: "all" },
                  ...statusLookups.map(lookup => ({
                    label: lookup.name,
                    value: lookup.code
                  }))
                ]}
              />
              <Select
                label="Request Type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                options={[
                  { label: "All Types", value: "all" },
                  { label: "Course Change", value: "course_change" },
                  { label: "Schedule Change", value: "schedule_change" },
                  { label: "Refund", value: "refund" },
                  { label: "Other", value: "other" }
                ]}
              />
              <Select
                label="Priority"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                options={[
                  { label: "All Priorities", value: "all" },
                  { label: "High Priority", value: "high" },
                  { label: "Medium Priority", value: "medium" },
                  { label: "Low Priority", value: "low" }
                ]}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Select All Checkbox */}
          {paginatedRequests.length > 0 && (
            <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
              <input
                type="checkbox"
                checked={selectedRequests.length === paginatedRequests.length && paginatedRequests.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                Select all ({paginatedRequests.length} items)
              </span>
            </div>
          )}

          {/* Request Cards */}
          {paginatedRequests.length > 0 ? (
            <div className="space-y-4">
              {paginatedRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onViewDetails={handleViewDetails}
                  isSelected={selectedRequests.includes(request.id)}
                  onSelect={handleSelectRequest}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {(searchTerm || filterStatus !== "all" || filterType !== "all" || filterPriority !== "all" || dateFrom || dateTo) ? "No requests match your filters" : "No requests found"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {(searchTerm || filterStatus !== "all" || filterType !== "all" || filterPriority !== "all" || dateFrom || dateTo)
                    ? "Try adjusting your search criteria or filters"
                    : "No student requests have been submitted yet"
                  }
                </p>
                {(searchTerm || filterStatus !== "all" || filterType !== "all" || filterPriority !== "all" || dateFrom || dateTo) && (
                  <Button
                    variant="secondary"
                    onClick={clearFilters}
                    className="mt-2"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* Pagination */}
          {paginatedRequests.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={filteredRequests.length}
              startIndex={startIndex}
              endIndex={Math.min(endIndex, filteredRequests.length)}
            />
          )}
        </div>
        </div>
      </Card>

      {/* Dialogs */}
      <RequestDetailDialog
        isOpen={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        request={selectedRequest}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <ConfirmRequestDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmAction}
        action={confirmAction}
        studentName={confirmRequest?.studentName || ""}
        requestType={confirmRequest ? getTypeLabel(confirmRequest.requestType) : ""}
      />

      {/* Toast Notifications */}
      {toasts.length > 0 &&
        createPortal(
          <div className="fixed top-4 right-4 z-[10000] space-y-2">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md w-full animate-slide-in-right ${
                  toast.type === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : toast.type === "error"
                    ? "bg-red-50 border-red-200 text-red-800"
                    : toast.type === "warning"
                    ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                    : "bg-blue-50 border-blue-200 text-blue-800"
                }`}
              >
                <div className="flex-1 text-sm font-medium">
                  {toast.message}
                </div>
                <button
                  onClick={() => hideToast(toast.id)}
                  className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
