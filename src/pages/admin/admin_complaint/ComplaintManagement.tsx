import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Filter, Download, CheckSquare, Square, MoreVertical, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import ComplaintDetailDialog, { type Complaint } from '../../staff/staff_complaints/components/ComplaintDetailDialog';
import { getAllComplaints, updateComplaint, getComplaintsByStatus, type SystemComplaint } from '@/api/complaint.api';
import { getLookupsByTypeCode } from '@/api/core.api';
import { useToast } from '@/hooks/useToast';
import Spinner from '@/components/ui/Spinner';

interface ComplaintLocal extends Complaint {
  reportStatusID?: string;
  statusName?: string;
}

// Helper function to map API response to UI format
const mapApiComplaintToUI = (apiComplaint: SystemComplaint, index: number): ComplaintLocal => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Extract type from reportTypeName or default
  const type = apiComplaint.reportTypeName || 'General';
  
  // Use status name directly from API
  const status = apiComplaint.statusName || 'Open';

  return {
    id: apiComplaint.id,
    complaintId: `CMP-${String(index + 1).padStart(3, '0')}`,
    user: {
      name: apiComplaint.submitterName || 'Unknown User',
      avatar: undefined
    },
    type: type,
    status: status,
    priority: apiComplaint.priority || 'Medium', // Use priority from API, default to Medium if not provided
    date: formatDate(apiComplaint.createdAt),
    description: apiComplaint.description,
    reportStatusID: apiComplaint.reportStatusID,
    statusName: apiComplaint.statusName,
    submitterEmail: apiComplaint.submitterEmail,
    attachmentUrl: apiComplaint.attachmentUrl,
    resolvedByName: apiComplaint.resolvedByName,
    resolvedAt: apiComplaint.resolvedAt,
    adminResponse: apiComplaint.adminResponse
  };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Open':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Resolved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Closed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
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
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');
  const [complaints, setComplaints] = useState<ComplaintLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusLookups, setStatusLookups] = useState<any[]>([]);
  const [reportTypes, setReportTypes] = useState<any[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({}); // statusId -> statusName
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintLocal | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Helper to get status by code
  const getStatusByCode = (code: string) => {
    return statusLookups.find((s: any) => s.code?.toUpperCase() === code.toUpperCase())?.name || code;
  };

  // Fetch complaints and status lookups on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch status lookups
        try {
          const statusResponse = await getLookupsByTypeCode('ReportStatus');
          const statuses = statusResponse.data || [];
          setStatusLookups(statuses);
          
          // Create status map for quick lookup
          const map: Record<string, string> = {};
          statuses.forEach((status: any) => {
            map[status.id] = status.name;
          });
          setStatusMap(map);
        } catch (error) {
          console.error('Error fetching status lookups:', error);
        }

        // Fetch report types
        try {
          const typeResponse = await getLookupsByTypeCode('ReportType');
          const types = typeResponse.data || [];
          setReportTypes(types);
        } catch (error) {
          console.error('Error fetching report types:', error);
        }

        // Fetch complaints
        const complaintsData = await getAllComplaints();
        const mappedComplaints = complaintsData.map((complaint, index) => 
          mapApiComplaintToUI(complaint, index)
        );
        setComplaints(mappedComplaints);
      } catch (error: any) {
        console.error('Error fetching complaints:', error);
        showToast('Failed to load complaints', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  // Get unique priorities from complaints data
  const availablePriorities = Array.from(
    new Set(complaints.map(c => c.priority).filter(p => p))
  ).sort();

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
  const getUserAvatar = (user: ComplaintLocal['user']) => {
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
  const handleViewComplaint = (complaint: ComplaintLocal) => {
    setSelectedComplaint(complaint);
    setShowDetailDialog(true);
  };

  const handleStatusChange = async (complaintId: string, newStatus: string, response?: string) => {
    try {
      const complaint = complaints.find(c => c.id === complaintId);
      if (!complaint) return;

      // Find status ID from statusLookups by matching name directly from API
      const statusEntry = statusLookups.find((s: any) => s.name === newStatus);

      if (!statusEntry) {
        showToast('Status not found', 'error');
        return;
      }

      // Get original complaint from API
      const originalComplaints = await getAllComplaints();
      const originalComplaint = originalComplaints.find(c => c.id === complaintId);
      if (!originalComplaint) return;

      // Update complaint via API
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      // Prepare update payload
      const updatePayload: any = {
        reportTypeID: originalComplaint.reportTypeID,
        submittedBy: originalComplaint.submittedBy,
        title: originalComplaint.title,
        description: originalComplaint.description,
        attachmentUrl: originalComplaint.attachmentUrl || undefined,
        reportStatusID: statusEntry.lookUpId, // Always include reportStatusID
        reportUrl: originalComplaint.reportUrl || undefined,
        priority: originalComplaint.priority || undefined,
        adminResponse: response || undefined, // Store admin response
        resolvedBy: statusEntry.code === 'RESOLVED' || statusEntry.code === 'CLOSED' ? userData.id : undefined,
        resolvedAt: statusEntry.code === 'RESOLVED' || statusEntry.code === 'CLOSED' ? new Date().toISOString() : undefined
      };

      console.log('Updating complaint with payload:', updatePayload);
      
      await updateComplaint(complaintId, updatePayload);

      // Refresh complaints list
      const updatedComplaints = await getAllComplaints();
      const mappedComplaints = updatedComplaints.map((c, idx) => mapApiComplaintToUI(c, idx));
      setComplaints(mappedComplaints);

      // Update selectedComplaint if dialog is open
      const updatedComplaint = mappedComplaints.find(c => c.id === complaintId);
      if (updatedComplaint) {
        setSelectedComplaint(updatedComplaint);
      }

      showToast('Complaint status updated successfully', 'success');
    } catch (error: any) {
      console.error('Error updating complaint status:', error);
      showToast('Failed to update complaint status', 'error');
    }
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

  const handleBulkStatusChange = async (newStatus: string) => {
    try {
      // Find status ID from statusLookups by matching name directly from API
      // Status names from API: "Closed", "In Progress", "Resolved", "Open"
      const statusEntry = statusLookups.find((s: any) => s.name === newStatus);

      if (!statusEntry) {
        showToast('Status not found', 'error');
        return;
      }

      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      // Update all selected complaints
      const updatePromises = selectedComplaints.map(async (complaintId) => {
        const originalComplaints = await getAllComplaints();
        const originalComplaint = originalComplaints.find(c => c.id === complaintId);
        if (!originalComplaint) return;

        await updateComplaint(complaintId, {
          reportTypeID: originalComplaint.reportTypeID,
          submittedBy: originalComplaint.submittedBy,
          title: originalComplaint.title,
          description: originalComplaint.description,
          attachmentUrl: originalComplaint.attachmentUrl || undefined,
          reportStatusID: statusEntry.lookUpId || statusEntry.id, // Always include reportStatusID
          reportUrl: originalComplaint.reportUrl || undefined,
          priority: originalComplaint.priority || undefined,
          resolvedBy: statusEntry.code === 'RESOLVED' || statusEntry.code === 'CLOSED' ? userData.id : undefined,
          resolvedAt: statusEntry.code === 'RESOLVED' || statusEntry.code === 'CLOSED' ? new Date().toISOString() : undefined
        });
      });

      await Promise.all(updatePromises);

      // Update local state
      setComplaints(prev => prev.map(complaint => 
        selectedComplaints.includes(complaint.id)
          ? { ...complaint, status: newStatus, statusName: statusEntry.name, reportStatusID: statusEntry.id }
          : complaint
      ));
      
      setSelectedComplaints([]);
      showToast(`${selectedComplaints.length} complaints updated successfully`, 'success');
    } catch (error: any) {
      console.error('Error updating complaints:', error);
      showToast('Failed to update complaints', 'error');
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 pt-16 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

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
                <p className="text-sm font-medium text-yellow-700">Open</p>
                <p className="text-3xl font-bold text-yellow-900 group-hover:text-yellow-600 transition-colors">
                  {complaints.filter(c => c.status === 'Open').length}
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
                        onClick={() => handleBulkStatusChange('Closed')}
                        className="text-xs !bg-gray-500 text-gray-700 border-gray-200 hover:!bg-gray-300"
                      >
                        Close
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
                      ...statusLookups
                        .filter((status: any) => status.isActive)
                        .map((status: any) => ({
                          value: status.name,
                          label: status.name
                        }))
                    ]}
                    className="w-full sm:w-44"
                  />
                  <Select
                    value={typeFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleTypeFilterChange(e.target.value)}
                    options={[
                      { value: 'All Types', label: 'All Types' },
                      ...reportTypes
                        .filter((type: any) => type.isActive)
                        .map((type: any) => ({
                          value: type.name,
                          label: type.name
                        }))
                    ]}
                    className="w-full sm:w-44"
                  />
                  <Select
                    value={priorityFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handlePriorityFilterChange(e.target.value)}
                    options={[
                      { value: 'All Priority', label: 'All Priority' },
                      ...availablePriorities.map((priority: string) => ({
                        value: priority,
                        label: priority
                      }))
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
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
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
                      <div className="flex items-center">
                        {getUserAvatar(complaint.user)}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {complaint.user.name}
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {complaint.priority ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
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
          complaint={selectedComplaint as Complaint | null}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}