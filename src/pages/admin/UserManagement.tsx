import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Ban } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

interface User {
  id: string;
  accountId: string;
  name: string;
  email: string;
  role: 'Student' | 'Teacher' | 'Staff' | 'Admin';
  status: 'Active' | 'Suspended' | 'Deleted';
  avatar?: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    accountId: '#F12 4834...',
    name: 'John Smith',
    email: 'john.smith@school.edu',
    role: 'Student',
    status: 'Active'
  },
  {
    id: '2',
    accountId: '#C45 DE78...',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@school.edu',
    role: 'Teacher',
    status: 'Active'
  },
  {
    id: '3',
    accountId: '#A83 BC12...',
    name: 'Michael Brown',
    email: 'michael.brown@school.edu',
    role: 'Staff',
    status: 'Suspended'
  },
  {
    id: '4',
    accountId: '#E56 FG90...',
    name: 'Emily Davis',
    email: 'emily.davis@school.edu',
    role: 'Admin',
    status: 'Active'
  },
  {
    id: '5',
    accountId: '#H23 IJ67...',
    name: 'David Wilson',
    email: 'david.wilson@school.edu',
    role: 'Student',
    status: 'Deleted'
  },
  {
    id: '6',
    accountId: '#K89 LM34...',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@school.edu',
    role: 'Teacher',
    status: 'Active'
  },
  {
    id: '7',
    accountId: '#N56 OP12...',
    name: 'Robert Taylor',
    email: 'robert.taylor@school.edu',
    role: 'Student',
    status: 'Active'
  },
  {
    id: '8',
    accountId: '#Q78 RS90...',
    name: 'Jennifer Martinez',
    email: 'jennifer.martinez@school.edu',
    role: 'Staff',
    status: 'Active'
  },
  {
    id: '9',
    accountId: '#T34 UV56...',
    name: 'Christopher Lee',
    email: 'christopher.lee@school.edu',
    role: 'Teacher',
    status: 'Active'
  },
  {
    id: '10',
    accountId: '#W78 XY12...',
    name: 'Amanda Garcia',
    email: 'amanda.garcia@school.edu',
    role: 'Student',
    status: 'Suspended'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Suspended':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Deleted':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'Admin':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Staff':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Teacher':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'Student':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.accountId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All Status' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination calculations
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);
  const showingStart = totalItems > 0 ? startIndex + 1 : 0;
  const showingEnd = Math.min(endIndex, totalItems);

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

  // Reset to first page when search or filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // User action handlers
  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
    setShowDeleteDialog(false);
    setSelectedUser(null);
    alert(`User "${selectedUser.name}" has been deleted successfully!`);
  };

  const handleBanUser = () => {
    if (!selectedUser) return;
    
    setUsers(prev => prev.map(user => 
      user.id === selectedUser.id 
        ? { ...user, status: 'Suspended' as const } 
        : user
    ));
    setShowBanDialog(false);
    setSelectedUser(null);
    alert(`User "${selectedUser.name}" has been banned successfully!`);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const openBanDialog = (user: User) => {
    setSelectedUser(user);
    setShowBanDialog(true);
  };

  // Get user avatar or initials
  const getUserAvatar = (user: User) => {
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

  return (
    <div className="min-h-screen bg-gray-50/50 lg:ml-64">
      <div className="p-6">
        {/* Page Header */}
        <PageHeader
          title="User Management"
          subtitle="Manage your users, roles, and permissions"
        />

        {/* Main Content */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create New User
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, Account ID"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={roleFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleRoleFilterChange(e.target.value)}
                options={[
                  { value: 'All Roles', label: 'All Roles' },
                  { value: 'Admin', label: 'Admin' },
                  { value: 'Staff', label: 'Staff' },
                  { value: 'Teacher', label: 'Teacher' },
                  { value: 'Student', label: 'Student' }
                ]}
              />
              <Select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStatusFilterChange(e.target.value)}
                options={[
                  { value: 'All Status', label: 'All Status' },
                  { value: 'Active', label: 'Active' },
                  { value: 'Suspended', label: 'Suspended' },
                  { value: 'Deleted', label: 'Deleted' }
                ]}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getUserAvatar(user)}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-mono">{user.accountId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link to={`/admin/users/${user.id}`}>
                          <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openBanDialog(user)}
                          className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                        >
                          <Ban className="w-4 h-4" />
                          <span>Ban</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openDeleteDialog(user)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </Button>
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

        {/* Confirmation Dialogs */}
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedUser(null);
          }}
          onConfirm={handleDeleteUser}
          title="Delete User"
          message={selectedUser ? `Are you sure you want to delete "${selectedUser.name}"? This action cannot be undone and will permanently remove all user data.` : ''}
          confirmText="Delete User"
          cancelText="Cancel"
          type="danger"
        />

        <ConfirmationDialog
          isOpen={showBanDialog}
          onClose={() => {
            setShowBanDialog(false);
            setSelectedUser(null);
          }}
          onConfirm={handleBanUser}
          title="Ban User"
          message={selectedUser ? `Are you sure you want to ban "${selectedUser.name}"? They will no longer be able to access the system.` : ''}
          confirmText="Ban User"
          cancelText="Cancel"
          type="warning"
        />
      </div>
    </div>
  );
}