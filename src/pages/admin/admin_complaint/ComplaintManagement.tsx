import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Download, MessageSquare, Clock, CheckCircle, XCircle, Calendar, SortAsc, SortDesc, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Pagination from '@/shared/pagination';
import ComplaintDetailDialog, { type Complaint } from '../../staff/staff_complaints/components/ComplaintDetailDialog';
import ReportCard from './components/ReportCard';
import { getAllComplaints, updateComplaint, getComplaintsByStatus, type SystemComplaint } from '@/api/complaint.api';
import { getLookupsByTypeCode } from '@/api/core.api';
import { useToast } from '@/hooks/useToast';
import Spinner from '@/components/ui/Spinner';

interface ComplaintLocal extends Complaint {
  reportStatusID?: string;
  statusName?: string;
  submitterRole?: string;
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

  // Normalize role name - map specific roles to general categories
  const normalizeRole = (role: string | undefined | null): string | undefined => {
    if (!role) return undefined;
    
    const roleLower = role.toLowerCase().trim();
    
    // Map Student role
    if (roleLower === 'student') {
      return 'Student';
    }
    
    // Map Teacher role
    if (roleLower === 'teacher') {
      return 'Teacher';
    }
    
    // Map Staff roles (AcademicStaff, AccountantStaff, etc.) to Staff
    // Check for various staff role formats
    if (roleLower.includes('staff') || 
        roleLower === 'academicstaff' || 
        roleLower === 'accountantstaff' ||
        roleLower === 'academic staff' || 
        roleLower === 'accountant staff' ||
        roleLower.startsWith('academic') ||
        roleLower.startsWith('accountant')) {
      return 'Staff';
    }
    
    // Map Admin role
    if (roleLower === 'admin') {
      return 'Admin';
    }
    
    // Return original role if no mapping found
    return role;
  };

  // Determine role from submitterRole, submitterEmail, or submitterName if not provided
  let submitterRole = normalizeRole(apiComplaint.submitterRole);
  
  if (!submitterRole) {
    // Try to determine role from email domain or name pattern
    const email = apiComplaint.submitterEmail?.toLowerCase() || '';
    const name = apiComplaint.submitterName?.toLowerCase() || '';
    
    // Check if it's a student (usually has student email pattern or student in name)
    if (email.includes('student') || email.includes('@student') || name.includes('student')) {
      submitterRole = 'Student';
    } 
    // Check if it's a teacher
    else if (email.includes('teacher') || email.includes('@teacher') || name.includes('teacher')) {
      submitterRole = 'Teacher';
    }
    // Check if it's staff (academic staff, accountant staff, etc.)
    else if (email.includes('staff') || email.includes('@staff') || name.includes('staff') || 
             email.includes('academic') || email.includes('accountant') ||
             name.includes('academic') || name.includes('accountant')) {
      submitterRole = 'Staff';
    }
  }

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
    submitterRole: submitterRole,
    attachmentUrl: apiComplaint.attachmentUrl,
    reportUrl: apiComplaint.reportUrl,
    resolvedByName: apiComplaint.resolvedByName,
    resolvedAt: apiComplaint.resolvedAt,
    adminResponse: apiComplaint.adminResponse
  };
};

export default function ComplaintManagement() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [complaints, setComplaints] = useState<ComplaintLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusLookups, setStatusLookups] = useState<any[]>([]);
  const [reportTypes, setReportTypes] = useState<any[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({}); // statusId -> statusName
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintLocal | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [itemsPerPage] = useState(12);

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

  // Get unique roles from complaints data (normalized)
  const rolesFromComplaints = Array.from(
    new Set(complaints.map(c => c.submitterRole).filter((r): r is string => !!r))
  );
  
  // Define all possible roles in the system
  const allPossibleRoles = ['Student', 'Teacher', 'Staff'];
  
  // Combine roles from complaints with all possible roles, then sort
  const availableRoles = Array.from(
    new Set([...allPossibleRoles, ...rolesFromComplaints])
  ).sort();

  // Sorting logic
  const sortComplaints = useCallback((complaints: ComplaintLocal[]) => {
    return [...complaints].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date.split('/').reverse().join('-')).getTime();
          bValue = new Date(b.date.split('/').reverse().join('-')).getTime();
          break;
        case 'priority':
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 2;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 2;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'name':
          aValue = a.user.name;
          bValue = b.user.name;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortBy, sortOrder]);

  const filteredComplaints = sortComplaints(complaints.filter(complaint => {
    const matchesSearch = complaint.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || complaint.status === statusFilter;
    const matchesType = typeFilter === 'All Types' || complaint.type === typeFilter;
    const matchesPriority = priorityFilter === 'All Priority' || complaint.priority === priorityFilter;
    const matchesRole = roleFilter === 'All Roles' || complaint.submitterRole === roleFilter;
    
    // Date filtering
    if (dateFrom || dateTo) {
      const complaintDate = new Date(complaint.date.split('/').reverse().join('-'));
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      
      if (fromDate && toDate) {
        if (complaintDate < fromDate || complaintDate > toDate) return false;
      } else if (fromDate) {
        if (complaintDate < fromDate) return false;
      } else if (toDate) {
        if (complaintDate > toDate) return false;
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesRole;
  }));

  // Pagination calculations
  const totalItems = filteredComplaints.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentComplaints = filteredComplaints.slice(startIndex, endIndex);

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

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  // Handle complaint actions
  const handleViewComplaint = (complaint: ComplaintLocal | Complaint) => {
    setSelectedComplaint(complaint as ComplaintLocal);
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

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All Status');
    setTypeFilter('All Types');
    setPriorityFilter('All Priority');
    setRoleFilter('All Roles');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
    setSelectedComplaints([]);
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Admin Dashboard", href: "/admin" },
    { label: "System Report", href: "/admin/reports" }
  ];

  if (loading) {
    return (
      <div className="mt-16 p-6 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Page Header */}
      <PageHeader
        title="System Report"
        description="Manage and resolve system reports from students and staff with comprehensive tools"
      />

      <div className="space-y-6">

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

      {/* System Reports Table */}
      <Card>
        <div className="p-6">
          {/* Card Header with Action Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md bg-gradient-to-br from-orange-500 to-orange-600">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  System Reports Management
                </h3>
                <p className="text-sm text-gray-600">
                  View and manage all system reports
                </p>
              </div>
            </div>
            <Button 
              onClick={handleExportComplaints}
              variant="secondary"
              iconLeft={<Download className="w-4 h-4" />}
            >
              Export
            </Button>
          </div>

        {/* Bulk Actions */}
        {selectedComplaints.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-900">
                  {selectedComplaints.length} report(s) selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleBulkStatusChange('In Progress')}
                  className="!bg-blue-600 hover:!bg-blue-700 text-white"
                  iconLeft={<Clock className="w-4 h-4 mr-2" />}
                >
                  Mark In Progress
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBulkStatusChange('Resolved')}
                  className="!bg-green-600 hover:!bg-green-700 text-white"
                  iconLeft={<CheckCircle className="w-4 h-4 mr-2" />}
                >
                  Resolve All
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBulkStatusChange('Closed')}
                  className="!bg-gray-600 hover:!bg-gray-700 text-white"
                  iconLeft={<XCircle className="w-4 h-4 mr-2" />}
                >
                  Close All
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
                placeholder="Search by report ID, submitter name, or description..."
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
                    { label: "Submitter Name", value: "name" }
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pt-4 border-t">
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { label: "All Status", value: "All Status" },
                  ...statusLookups
                    .filter((status: any) => status.isActive)
                    .map((status: any) => ({
                      value: status.name,
                      label: status.name
                    }))
                ]}
              />
              <Select
                label="Report Type"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { label: "All Types", value: "All Types" },
                  ...reportTypes
                    .filter((type: any) => type.isActive)
                    .map((type: any) => ({
                      value: type.name,
                      label: type.name
                    }))
                ]}
              />
              <Select
                label="Priority"
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { label: "All Priorities", value: "All Priority" },
                  ...availablePriorities.map((priority: string) => ({
                    value: priority,
                    label: priority
                  }))
                ]}
              />
              <Select
                label="Submitter Role"
                value={roleFilter}
                onChange={(e) => {
                  handleRoleFilterChange(e.target.value);
                }}
                options={[
                  { label: "All Roles", value: "All Roles" },
                  ...availableRoles.map((role: string) => ({
                    value: role,
                    label: role
                  }))
                ]}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setCurrentPage(1);
                    }}
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
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Select All Checkbox */}
          {currentComplaints.length > 0 && (
            <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
              <input
                type="checkbox"
                checked={selectedComplaints.length === currentComplaints.length && currentComplaints.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                Select all ({currentComplaints.length} items)
              </span>
            </div>
          )}

          {/* Report Cards */}
          {currentComplaints.length > 0 ? (
            <div className="space-y-4">
              {currentComplaints.map((complaint) => (
                <ReportCard
                  key={complaint.id}
                  report={complaint}
                  onViewDetails={handleViewComplaint}
                  isSelected={selectedComplaints.includes(complaint.id)}
                  onSelect={handleSelectComplaint}
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
                  {(searchTerm || statusFilter !== "All Status" || typeFilter !== "All Types" || priorityFilter !== "All Priority" || roleFilter !== "All Roles" || dateFrom || dateTo) ? "No reports match your filters" : "No reports found"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {(searchTerm || statusFilter !== "All Status" || typeFilter !== "All Types" || priorityFilter !== "All Priority" || roleFilter !== "All Roles" || dateFrom || dateTo)
                    ? "Try adjusting your search criteria or filters"
                    : "No system reports have been submitted yet"
                  }
                </p>
                {(searchTerm || statusFilter !== "All Status" || typeFilter !== "All Types" || priorityFilter !== "All Priority" || roleFilter !== "All Roles" || dateFrom || dateTo) && (
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
          {currentComplaints.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={Math.min(endIndex, totalItems)}
            />
          )}
        </div>
        </div>
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