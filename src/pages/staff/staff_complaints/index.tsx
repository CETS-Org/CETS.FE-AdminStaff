import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';

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

export default function StaffComplaintManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');
  const [complaints] = useState<Complaint[]>(mockComplaints);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

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
    <div className="min-h-screen bg-gray-50/50 lg:ml-64">
      <div className="p-6">
        {/* Page Header */}
        <PageHeader
          title="Complaint Management"
          subtitle="Manage and resolve student and staff complaints"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{complaints.length}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{complaints.filter(c => c.status === 'Pending').length}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{complaints.filter(c => c.status === 'In Progress').length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{complaints.filter(c => c.status === 'Resolved').length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
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
                className="w-full sm:w-auto"
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
                className="w-full sm:w-auto"
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
                className="w-full sm:w-auto"
              />
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
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
                        <Link to={`/staff/complaints/${complaint.id}`}>
                          <Button
                                      variant="secondary"
                                      size="sm"
                                      className="inline-flex items-center justify-center gap-2"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 flex-shrink-0" />
                                        <span className="leading-none">View</span>
                                      </div>
                                      
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
      </div>
    </div>
  );
}