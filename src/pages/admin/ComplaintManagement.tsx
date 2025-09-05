import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
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
  type: 'Payment' | 'Schedule' | 'Technical';
  status: 'Pending' | 'Resolved';
  date: string;
}

const mockComplaints: Complaint[] = [
  {
    id: '1',
    complaintId: 'CMP-001',
    user: {
      name: 'Student A',
      avatar: undefined
    },
    type: 'Payment',
    status: 'Pending',
    date: '20/08/2025'
  },
  {
    id: '2',
    complaintId: 'CMP-002',
    user: {
      name: 'Teacher B',
      avatar: undefined
    },
    type: 'Schedule',
    status: 'Pending',
    date: '21/08/2025'
  },
  {
    id: '3',
    complaintId: 'CMP-003',
    user: {
      name: 'Student C',
      avatar: undefined
    },
    type: 'Technical',
    status: 'Resolved',
    date: '22/08/2025'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Resolved':
      return 'bg-green-100 text-green-800 border-green-200';
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
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function ComplaintManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Filter by Status');
  const [typeFilter, setTypeFilter] = useState('Filter by Type');
  const [dateFilter, setDateFilter] = useState('Filter by Date');
  const [complaints] = useState<Complaint[]>(mockComplaints);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Filter by Status' || complaint.status === statusFilter;
    const matchesType = typeFilter === 'Filter by Type' || complaint.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
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

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 lg:ml-64">
      <div className="p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span>Dashboard</span>
          <span>›</span>
          <span>Complaints Managements</span>
        </div>

        {/* Page Header */}
        <PageHeader
          title="Complaint Management"
          subtitle="Manage and track customer complaints"
        />

        {/* Main Content */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStatusFilterChange(e.target.value)}
                options={[
                  { value: 'Filter by Status', label: 'Filter by Status' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Resolved', label: 'Resolved' }
                ]}
                className="w-full sm:w-auto"
              />
              <Select
                value={typeFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleTypeFilterChange(e.target.value)}
                options={[
                  { value: 'Filter by Type', label: 'Filter by Type' },
                  { value: 'Payment', label: 'Payment' },
                  { value: 'Schedule', label: 'Schedule' },
                  { value: 'Technical', label: 'Technical' }
                ]}
                className="w-full sm:w-auto"
              />
              <Select
                value={dateFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleDateFilterChange(e.target.value)}
                options={[
                  { value: 'Filter by Date', label: 'Filter by Date' },
                  { value: 'Today', label: 'Today' },
                  { value: 'This Week', label: 'This Week' },
                  { value: 'This Month', label: 'This Month' }
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
                    Complaint ID
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
                      <div className="text-sm text-gray-900">{complaint.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link to={`/admin/reports/${complaint.id}`}>
                          <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span>View</span>
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
                <div className="text-sm text-gray-500">
                  {/* Simple pagination text - can be enhanced with actual pagination buttons */}
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}