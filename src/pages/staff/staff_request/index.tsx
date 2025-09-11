import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import RequestCard from "./components/RequestCard";
import Pagination from "@/shared/pagination";
import { Search, Filter, Clock, CheckCircle, XCircle, AlertCircle, Calendar, X } from "lucide-react";
import RequestDetailDialog from "./components/RequestDetailDialog";
import ConfirmRequestDialog from "./components/ConfirmRequestDialog";

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

export default function StaffRequestPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject">("approve");
  const [confirmRequest, setConfirmRequest] = useState<Request | null>(null);

  // Mock data
  useEffect(() => {
    const mockRequests: Request[] = [
      {
        id: "1",
        studentName: "Nguyen Van A",
        studentEmail: "nguyenvana@email.com",
        requestType: "course_change",
        description: "Request to change from IELTS Foundation to TOEIC Advanced",
        status: "pending",
        submittedDate: "2024-01-15",
        priority: "medium",
        note: "I have been studying IELTS for 3 months but I think TOEIC would be more suitable for my career goals. Please consider my request."
      },
      {
        id: "2",
        studentName: "Tran Thi B",
        studentEmail: "tranthib@email.com",
        requestType: "schedule_change",
        description: "Need to reschedule class from Monday to Wednesday",
        status: "approved",
        submittedDate: "2024-01-14",
        priority: "high",
        note: "I have a work meeting that conflicts with my current class schedule. I would appreciate if you could help me reschedule to Wednesday evening."
      },
      {
        id: "3",
        studentName: "Le Van C",
        studentEmail: "levanc@email.com",
        requestType: "refund",
        description: "Request refund due to personal reasons",
        status: "rejected",
        submittedDate: "2024-01-13",
        priority: "low",
        note: "I need to withdraw from the course due to family emergency. I understand the refund policy but hope you can make an exception."
      },
      {
        id: "4",
        studentName: "Pham Thi D",
        studentEmail: "phamthid@email.com",
        requestType: "other",
        description: "Request for additional study materials",
        status: "pending",
        submittedDate: "2024-01-12",
        priority: "low",
        note: "I would like to request additional practice materials for the upcoming exam. The current materials are helpful but I need more practice questions."
      },
      {
        id: "5",
        studentName: "Hoang Van E",
        studentEmail: "hoangvane@email.com",
        requestType: "course_change",
        description: "Want to upgrade to higher level course",
        status: "approved",
        submittedDate: "2024-01-11",
        priority: "medium"
      },
      {
        id: "6",
        studentName: "Nguyen Thi F",
        studentEmail: "nguyenthif@email.com",
        requestType: "schedule_change",
        description: "Need to change class time due to work schedule",
        status: "pending",
        submittedDate: "2024-01-10",
        priority: "high"
      },
      {
        id: "7",
        studentName: "Tran Van G",
        studentEmail: "tranvang@email.com",
        requestType: "refund",
        description: "Request partial refund for unused sessions",
        status: "pending",
        submittedDate: "2024-01-09",
        priority: "medium"
      },
      {
        id: "8",
        studentName: "Le Thi H",
        studentEmail: "lethih@email.com",
        requestType: "other",
        description: "Request for certificate of completion",
        status: "approved",
        submittedDate: "2024-01-08",
        priority: "low"
      },
      {
        id: "9",
        studentName: "Vo Van I",
        studentEmail: "vovani@email.com",
        requestType: "course_change",
        description: "Request to switch from TOEIC to IELTS",
        status: "pending",
        submittedDate: "2024-01-20",
        priority: "medium",
        note: "I want to switch to IELTS as it's more recognized internationally for my study abroad plans."
      },
      {
        id: "10",
        studentName: "Dang Thi J",
        studentEmail: "dangthij@email.com",
        requestType: "schedule_change",
        description: "Need to change class from evening to morning",
        status: "pending",
        submittedDate: "2024-01-18",
        priority: "high",
        note: "My work schedule has changed and I can only attend morning classes now."
      },
      {
        id: "11",
        studentName: "Bui Van K",
        studentEmail: "buivank@email.com",
        requestType: "refund",
        description: "Request full refund due to relocation",
        status: "approved",
        submittedDate: "2024-01-16",
        priority: "low",
        note: "I have to move to another city for work and cannot continue the course."
      },
      {
        id: "12",
        studentName: "Ngo Thi L",
        studentEmail: "ngothil@email.com",
        requestType: "other",
        description: "Request for study materials in digital format",
        status: "rejected",
        submittedDate: "2024-01-05",
        priority: "low",
        note: "I prefer digital materials over physical books for easier access."
      }
    ];

    setRequests(mockRequests);
    setLoading(false);
  }, []);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    const matchesType = filterType === "all" || request.requestType === filterType;
    
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
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

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
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const handleStatusChange = (requestId: string, newStatus: "approved" | "rejected") => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, status: newStatus }
        : request
    ));
  };

  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request);
    setShowDetailDialog(true);
  };

  const handleApprove = (reply: string) => {
    if (selectedRequest) {
      handleStatusChange(selectedRequest.id, "approved");
      console.log("Approved with reply:", reply);
    }
  };

  const handleReject = (reply: string) => {
    if (selectedRequest) {
      handleStatusChange(selectedRequest.id, "rejected");
      console.log("Rejected with reply:", reply);
    }
  };

  const handleQuickApprove = (request: Request) => {
    setConfirmAction("approve");
    setConfirmRequest(request);
    setShowConfirmDialog(true);
  };

  const handleQuickReject = (request: Request) => {
    setConfirmAction("reject");
    setConfirmRequest(request);
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = (reply: string) => {
    if (confirmRequest) {
      const status = confirmAction === "approve" ? "approved" : "rejected";
      handleStatusChange(confirmRequest.id, status);
      console.log(`${status} with reply:`, reply);
    }
    setShowConfirmDialog(false);
    setConfirmRequest(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

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


  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 mx-auto mt-16 lg:pl-0 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Requests</h1>
        <p className="text-gray-600">Manage and respond to student requests</p>
      </div>

      {/* Requests Table */}
      <Card title="Student Requests Management">
        {/* Search and Filter Section */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="flex gap-4 items-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by student name, email, or description..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-primary-500"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {(searchTerm || filterStatus !== "all" || filterType !== "all" || dateFrom || dateTo) && (
                  <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {[searchTerm, filterStatus, filterType, dateFrom, dateTo].filter(f => f !== "" && f !== "all").length}
                  </span>
                )}
              </span>
            </Button>
            <Button
              variant="secondary"
              onClick={clearFilters}
              className="whitespace-nowrap text-red-500"
            >
              <span className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Clear Filters
              </span>
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <Select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Pending", value: "pending" },
                  { label: "Approved", value: "approved" },
                  { label: "Rejected", value: "rejected" }
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
          {/* Request Cards */}
          {paginatedRequests.length > 0 ? (
            <div className="space-y-4">
              {paginatedRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onViewDetails={handleViewDetails}
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
                  {(searchTerm || filterStatus !== "all" || filterType !== "all" || dateFrom || dateTo) ? "No requests match your filters" : "No requests found"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {(searchTerm || filterStatus !== "all" || filterType !== "all" || dateFrom || dateTo)
                    ? "Try adjusting your search criteria or filters"
                    : "No student requests have been submitted yet"
                  }
                </p>
                {(searchTerm || filterStatus !== "all" || filterType !== "all" || dateFrom || dateTo) && (
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
    </div>
  );
}
