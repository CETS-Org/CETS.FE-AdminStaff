import { useState, useEffect } from "react";
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
  const [confirmAction] = useState<"approve" | "reject">("approve");
  const [confirmRequest, setConfirmRequest] = useState<Request | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterPriority, setFilterPriority] = useState('all');

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
  const sortRequests = (requests: Request[]) => {
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

  const handleBulkApprove = () => {
    selectedRequests.forEach(id => {
      handleStatusChange(id, 'approved');
    });
    setSelectedRequests([]);
  };

  const handleBulkReject = () => {
    selectedRequests.forEach(id => {
      handleStatusChange(id, 'rejected');
    });
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
      'Note': request.note || ''
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

  const handleConfirmAction = (reply: string) => {
    if (confirmRequest) {
      const status = confirmAction === "approve" ? "approved" : "rejected";
      handleStatusChange(confirmRequest.id, status);
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
        icon={<MessageSquare className="w-5 h-5 text-white" />}
        controls={[
          {
            type: 'button',
            label: 'Export',
            variant: 'secondary',
            icon: <Download className="w-4 h-4" />,
            onClick: handleExport
          }
        ]}
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
      <Card title="Student Requests Management">
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
          {/* Sorting Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <div className="flex gap-2">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'status' | 'name')}
                  options={[
                    { label: "Date", value: "date" },
                    { label: "Priority", value: "priority" },
                    { label: "Status", value: "status" },
                    { label: "Student Name", value: "name" }
                  ]}
                  className="w-full sm:w-40"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  iconLeft={sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <span className="hidden sm:inline">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by student name, email, or description..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-primary-500 flex-1 sm:flex-none"
              >
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="sm:hidden">Filters</span>
                  <span className="hidden sm:inline">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                  {(searchTerm || filterStatus !== "all" || filterType !== "all" || filterPriority !== "all" || dateFrom || dateTo) && (
                    <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {[searchTerm, filterStatus, filterType, filterPriority, dateFrom, dateTo].filter(f => f !== "" && f !== "all").length}
                    </span>
                  )}
                </span>
              </Button>
              <Button
                variant="secondary"
                onClick={clearFilters}
                className="whitespace-nowrap text-red-500 flex-1 sm:flex-none"
              >
                <span className="flex items-center gap-2">
                  <X className="w-4 h-4" />
                  <span className="sm:hidden">Clear</span>
                  <span className="hidden sm:inline">Clear Filters</span>
                </span>
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
    </div>
  );
}
