import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Filter, Download, CheckSquare, Square, MoreVertical, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import ComplaintDetailDialog from '../../staff/staff_complaints/components/ComplaintDetailDialog';

interface Complaint {
  id: string;
  complaintId: string;
  user: {
    name: string;
    avatar?: string;
  };
  type: 'Payment' | 'Schedule' | 'Technical' | 'Course' | 'Faculty';
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  priority: 'Low' | 'Medium' | 'High';
  date: string;
  description: string;
}

const mockComplaints: Complaint[] = [
  {
    id: '1',
    complaintId: 'CMP-001',
    user: {
      name: 'John Smith',
      avatar: undefined
    },
    type: 'Course',
    status: 'Pending',
    priority: 'High',
    date: '20/08/2025',
    description: 'Unable to access course materials for Math 101'
  },
  {
    id: '2',
    complaintId: 'CMP-002',
    user: {
      name: 'Sarah Johnson',
      avatar: undefined
    },
    type: 'Schedule',
    status: 'In Progress',
    priority: 'Medium',
    date: '21/08/2025',
    description: 'Class time conflict with another subject'
  },
  {
    id: '3',
    complaintId: 'CMP-003',
    user: {
      name: 'Mike Wilson',
      avatar: undefined
    },
    type: 'Technical',
    status: 'Resolved',
    priority: 'Low',
    date: '22/08/2025',
    description: 'Login issues with student portal'
  },
  {
    id: '4',
    complaintId: 'CMP-004',
    user: {
      name: 'Emma Davis',
      avatar: undefined
    },
    type: 'Faculty',
    status: 'Pending',
    priority: 'Medium',
    date: '23/08/2025',
    description: 'Teacher availability concern'
  },
  {
    id: '5',
    complaintId: 'CMP-005',
    user: {
      name: 'Alex Brown',
      avatar: undefined
    },
    type: 'Payment',
    status: 'Rejected',
    priority: 'Low',
    date: '24/08/2025',
    description: 'Fee payment processing issue'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Resolved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Payment':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Schedule':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Technical':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Course':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'Faculty':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function ComplaintManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || complaint.status === statusFilter;
    const matchesType = typeFilter === 'All Types' || complaint.type === typeFilter;
    const matchesPriority = priorityFilter === 'All Priority' || complaint.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  // Pagination calculations
  const totalItems = filteredComplaints.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentComplaints = filteredComplaints.slice(startIndex, endIndex);
  const showingStart = totalItems > 0 ? startIndex + 1 : 0;
  const showingEnd = Math.min(endIndex, totalItems);

  // Get user avatar or initials
  const getUserAvatar = (user: Complaint['user']) => {
    if (user.avatar) {
      return <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />;
    }
    
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    return (
      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
        <span className="text-sm font-medium text-gray-600">{initials}</span>
      </div>
    );
  };

  // Handle search and filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const handlePriorityFilterChange = (value: string) => {
    setPriorityFilter(value);
    setCurrentPage(1);
  };

  // Handle complaint actions
  const handleViewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailDialog(true);
  };

  const handleStatusChange = (complaintId: string, newStatus: string) => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, status: newStatus as Complaint['status'] }
        : complaint
    ));
  };

  // Handle bulk actions
  const handleSelectComplaint = (complaintId: string) => {
    setSelectedComplaints(prev => 
      prev.includes(complaintId)
        ? prev.filter(id => id !== complaintId)
        : [...prev, complaintId]
    );
  };

  const handleSelectAll = () => {
    if (selectedComplaints.length === currentComplaints.length) {
      setSelectedComplaints([]);
    } else {
      setSelectedComplaints(currentComplaints.map(c => c.id));
    }
  };

  const handleBulkStatusChange = (newStatus: string) => {
    setComplaints(prev => prev.map(complaint => 
      selectedComplaints.includes(complaint.id)
        ? { ...complaint, status: newStatus as Complaint['status'] }
        : complaint
    ));
    setSelectedComplaints([]);
  };

  const handleExportComplaints = () => {
    // In a real app, this would generate and download a CSV/Excel file
    console.log('Exporting complaints...', filteredComplaints);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-16">
      <div className="p-6 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span>Dashboard</span>
          <span>›</span>
          <span>Complaints Managements</span>
        </div>

        {/* Page Header */}
        <PageHeader 
          title="Complaint Management" 
          description="Manage and resolve student and staff complaints"
        />

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Total Complaints</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors">
                  {complaints.length}
                </p>
                <p className="text-xs text-gray-600 mt-1">
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
                  {complaints.filter(c => c.status === 'Pending').length}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Awaiting review
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <XCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">In Progress</p>
                <p className="text-3xl font-bold text-blue-900 group-hover:text-blue-600 transition-colors">
                  {complaints.filter(c => c.status === 'In Progress').length}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Being processed
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
                <p className="text-sm font-medium text-green-700">Resolved</p>
                <p className="text-3xl font-bold text-green-900 group-hover:text-green-600 transition-colors">
                  {complaints.filter(c => c.status === 'Resolved').length}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Successfully closed
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-900">All Complaints</h2>
                {selectedComplaints.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedComplaints.length} selected
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleBulkStatusChange('In Progress')}
                        className="text-xs !bg-blue-500 text-blue-700 border-blue-200 hover:!bg-blue-300"
                      >
                        Mark In Progress
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleBulkStatusChange('Resolved')}
                        className="text-xs !bg-green-500 text-green-700 border-green-200 hover:!bg-green-300"
                      >
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleBulkStatusChange('Rejected')}
                        className="text-xs !bg-red-500 text-red-700 border-red-200 hover:!bg-red-300"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                  iconLeft={<Filter className="w-4 h-4" />}
                >
                  Filters
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportComplaints}
                  className="flex items-center gap-2"
                  iconLeft={<Download className="w-4 h-4" />}
                >
                  Export
                </Button>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <Select
                    value={statusFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStatusFilterChange(e.target.value)}
                    options={[
                      { value: 'All Status', label: 'All Status' },
                      { value: 'Pending', label: 'Pending' },
                      { value: 'In Progress', label: 'In Progress' },
                      { value: 'Resolved', label: 'Resolved' },
                      { value: 'Rejected', label: 'Rejected' }
                    ]}
                    className="w-full sm:w-44"
                  />
                  <Select
                    value={typeFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleTypeFilterChange(e.target.value)}
                    options={[
                      { value: 'All Types', label: 'All Types' },
                      { value: 'Payment', label: 'Payment' },
                      { value: 'Schedule', label: 'Schedule' },
                      { value: 'Technical', label: 'Technical' },
                      { value: 'Course', label: 'Course' },
                      { value: 'Faculty', label: 'Faculty' }
                    ]}
                    className="w-full sm:w-44"
                  />
                  <Select
                    value={priorityFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handlePriorityFilterChange(e.target.value)}
                    options={[
                      { value: 'All Priority', label: 'All Priority' },
                      { value: 'High', label: 'High' },
                      { value: 'Medium', label: 'Medium' },
                      { value: 'Low', label: 'Low' }
                    ]}
                    className="w-full sm:w-44"
                  />
                </div>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
              
              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date From
                    </label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFrom(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date To
                    </label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateTo(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setDateFrom('');
                        setDateTo('');
                        setStatusFilter('All Status');
                        setTypeFilter('All Types');
                        setPriorityFilter('All Priority');
                        setSearchTerm('');
                      }}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center justify-center w-4 h-4"
                    >
                      {selectedComplaints.length === currentComplaints.length && currentComplaints.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-gray-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSelectComplaint(complaint.id)}
                        className="flex items-center justify-center w-4 h-4"
                      >
                        {selectedComplaints.includes(complaint.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 font-mono">
                        {complaint.complaintId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getUserAvatar(complaint.user)}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {complaint.user.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-48">
                            {complaint.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(complaint.type)}`}>
                        {complaint.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{complaint.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewComplaint(complaint)}
                          className="inline-flex items-center justify-center gap-2"
                          iconLeft={<Eye className="w-4 h-4 flex-shrink-0" />}
                        >
                          <span className="leading-none">View</span>
                        </Button>
                        <Link to={`/admin/complaints/${complaint.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="inline-flex items-center justify-center"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {showingStart} to {showingEnd} of {totalItems} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    Previous
                  </Button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      size="sm"
                      variant={currentPage === page ? undefined : "secondary"}
                      className={
                        currentPage === page
                          ? "bg-gray-900 text-white hover:bg-gray-800"
                          : ""
                      }
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Complaint Detail Dialog */}
        <ComplaintDetailDialog
          isOpen={showDetailDialog}
          onClose={() => setShowDetailDialog(false)}
          complaint={selectedComplaint}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}