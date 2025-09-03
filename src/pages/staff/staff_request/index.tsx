import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Table from "@/components/ui/Table";
import type { TableColumn } from "@/components/ui/Table";
import Pagination from "@/shared/pagination";
import { Search, Filter, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Request {
  id: string;
  studentName: string;
  studentEmail: string;
  requestType: "course_change" | "schedule_change" | "refund" | "other";
  description: string;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  priority: "low" | "medium" | "high";
}

export default function StaffRequestPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

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
        priority: "medium"
      },
      {
        id: "2",
        studentName: "Tran Thi B",
        studentEmail: "tranthib@email.com",
        requestType: "schedule_change",
        description: "Need to reschedule class from Monday to Wednesday",
        status: "approved",
        submittedDate: "2024-01-14",
        priority: "high"
      },
      {
        id: "3",
        studentName: "Le Van C",
        studentEmail: "levanc@email.com",
        requestType: "refund",
        description: "Request refund due to personal reasons",
        status: "rejected",
        submittedDate: "2024-01-13",
        priority: "low"
      },
      {
        id: "4",
        studentName: "Pham Thi D",
        studentEmail: "phamthid@email.com",
        requestType: "other",
        description: "Request for additional study materials",
        status: "pending",
        submittedDate: "2024-01-12",
        priority: "low"
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
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusChange = (requestId: string, newStatus: "approved" | "rejected") => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, status: newStatus }
        : request
    ));
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

  // Table columns configuration
  const tableColumns: TableColumn<Request>[] = [
    {
      header: "Student",
      accessor: (request) => (
        <div>
          <div className="font-medium">{request.studentName}</div>
          <div className="text-sm text-gray-500">{request.studentEmail}</div>
        </div>
      )
    },
    {
      header: "Request Type",
      accessor: (request) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {getTypeLabel(request.requestType)}
        </span>
      )
    },
    {
      header: "Description",
      accessor: (request) => (
        <div className="max-w-xs truncate" title={request.description}>
          {request.description}
        </div>
      )
    },
    {
      header: "Priority",
      accessor: (request) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
          {request.priority}
        </span>
      )
    },
    {
      header: "Status",
      accessor: (request) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(request.status)}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
            request.status === "approved" ? "bg-green-100 text-green-800" :
            "bg-red-100 text-red-800"
          }`}>
            {request.status}
          </span>
        </div>
      )
    },
    {
      header: "Submitted Date",
      accessor: (request) => new Date(request.submittedDate).toLocaleDateString()
    },
    {
      header: "Actions",
      accessor: (request) => (
        <div className="flex gap-2">
          {request.status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => handleStatusChange(request.id, "approved")}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleStatusChange(request.id, "rejected")}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Reject
              </Button>
            </>
          )}
          <Button size="sm" variant="secondary">
            View Details
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 mx-auto mt-16 lg:pl-70">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Requests</h1>
        <p className="text-gray-600">Manage and respond to student requests</p>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-32"
            options={[
              { label: "All Status", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" }
            ]}
          />
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-40"
            options={[
              { label: "All Types", value: "all" },
              { label: "Course Change", value: "course_change" },
              { label: "Schedule Change", value: "schedule_change" },
              { label: "Refund", value: "refund" },
              { label: "Other", value: "other" }
            ]}
          />
        </div>
      </div>

      {/* Requests Table */}
      <Card title="Student Requests Management">
        <div className="space-y-4">
          <Table
            columns={tableColumns}
            data={paginatedRequests}
            emptyState={
              <div className="text-center py-8">
                <p className="text-gray-500">No requests found</p>
              </div>
            }
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
