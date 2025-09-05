import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal, Trash2, Ban } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

interface UserDetail {
  id: string;
  accountId: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  role: 'Student' | 'Teacher' | 'Staff' | 'Admin';
  status: 'Active' | 'Suspended' | 'Deleted';
  avatar?: string;
  // Student specific fields
  studentCode?: string;
  guardianName?: string;
  school?: string;
  academicNote?: string;
  honorRoll?: string;
  // Teacher specific fields
  teacherCode?: string;
  yearsOfExperience?: number;
  bio?: string;
  credentials?: string[];
  // Audit fields
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

// Mock data - in real app this would come from API
const mockUserData: { [key: string]: UserDetail } = {
  '1': {
    id: '1',
    accountId: 'afe2c3dd-a98f-79d0-abc2d-ef1234567890',
    name: 'Sarah Elizabeth Johnson',
    email: 'sarah.johnson@school.edu',
    phone: '+1 (550) 123-4567',
    dateOfBirth: '1995-03-15',
    address: '123 Main Street, Apt 4B, Springfield, IL 62701',
    role: 'Teacher',
    status: 'Active',
    // Teacher fields
    teacherCode: 'TCH-2025-005678',
    yearsOfExperience: 8,
    bio: 'Experienced mathematics teacher with a passion for helping students understand complex concepts. Specializes in algebra and geometry.',
    credentials: [
      'Bachelor of Science in Mathematics - University of Illinois',
      'Teaching Certificate - Illinois State Board'
    ],
    // Audit
    createdAt: '2025-01-15 09:30:45 UTC',
    updatedAt: '2025-01-20 14:22:10 UTC',
    updatedBy: 'Admin John Smith'
  },
  '2': {
    id: '2',
    accountId: 'bcd3e4ff-b12c-89e1-def3e-gh5678901234',
    name: 'John Michael Smith',
    email: 'john.smith@school.edu',
    phone: '+1 (550) 987-6543',
    dateOfBirth: '2003-08-22',
    address: '456 Oak Avenue, Springfield, IL 62701',
    role: 'Student',
    status: 'Active',
    // Student fields
    studentCode: 'STU-2025-001234',
    guardianName: 'Michael Johnson',
    school: 'Springfield High School',
    academicNote: 'Honor Roll Student',
    honorRoll: 'Honor Roll Student',
    // Audit
    createdAt: '2025-01-10 10:15:30 UTC',
    updatedAt: '2025-01-18 16:45:22 UTC',
    updatedBy: 'Admin Sarah Davis'
  }
};

const getUserAvatar = (user: UserDetail) => {
  if (user.avatar) {
    return <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full" />;
  }
  
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  return (
    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
      <span className="text-xl font-medium text-gray-600">{initials}</span>
    </div>
  );
};

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

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail | null>(id ? mockUserData[id] : null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    // Here you would save the changes to the API
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  const handleDeleteUser = () => {
    // Handle user deletion
    setShowDeleteDialog(false);
    alert('User deleted successfully!');
  };

  const handleBanUser = () => {
    if (!user) return;
    setUser({...user, status: 'Suspended'});
    setShowBanDialog(false);
    alert('User has been banned successfully!');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50/50 lg:ml-64">
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
            <p className="text-gray-600 mt-2">The user you're looking for doesn't exist.</p>
                         <Link to="/admin/users" className="inline-block mt-4">
              <Button>Back to User Management</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 lg:ml-64">
      <div className="p-8">
                 {/* Header */}
         <div className="flex items-start justify-between gap-4 mb-6">
           <div className="flex items-center gap-6">
             <Link to="/admin/users" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
               <div className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                 <ArrowLeft className="w-4 h-4" />
               </div>
               <span className="text-sm font-medium">Back</span>
             </Link>
             
             <div className="flex items-center gap-4">
               {getUserAvatar(user)}
               <div>
                 <div className="flex items-center gap-3 mb-1">
                   <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                     {user.status}
                   </span>
                 </div>
                 <p className="text-gray-600">{user.email}</p>
                 <p className="text-sm text-gray-500">{user.phone}</p>
                 <p className="text-sm text-gray-500">{user.role}</p>
               </div>
             </div>
           </div>
           
           <div className="flex items-center gap-3">
             <Button 
               variant="secondary"
               size="sm"
               onClick={() => setShowBanDialog(true)}
               className="text-yellow-700 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-300"
             >
               <Ban className="w-4 h-4 mr-2" />
               Ban User
             </Button>
             
             <Button 
               variant="secondary"
               size="sm"
               onClick={() => setShowDeleteDialog(true)}
               className="text-red-700 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300"
             >
               <Trash2 className="w-4 h-4 mr-2" />
               Delete User
             </Button>
             
             <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
               <MoreHorizontal className="w-4 h-4" />
             </Button>
           </div>
         </div>

        {/* Account ID */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Account ID</p>
                <p className="font-mono text-gray-900">{user.accountId}</p>
              </div>
              <Button variant="ghost" size="sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              {!isEditing ? (
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    Save
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <Input
                  value={user.name}
                  disabled={!isEditing}
                  onChange={(e) => setUser({...user, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Input
                  type="email"
                  value={user.email}
                  disabled={!isEditing}
                  onChange={(e) => setUser({...user, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <Input
                  value={user.phone}
                  disabled={!isEditing}
                  onChange={(e) => setUser({...user, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <Input
                  type="date"
                  value={user.dateOfBirth}
                  disabled={!isEditing}
                  onChange={(e) => setUser({...user, dateOfBirth: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <Input
                  value={user.address}
                  disabled={!isEditing}
                  onChange={(e) => setUser({...user, address: e.target.value})}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Student Information (if role is Student) */}
        {user.role === 'Student' && (
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Code</label>
                  <Input
                    value={user.studentCode || ''}
                    disabled={!isEditing}
                    onChange={(e) => setUser({...user, studentCode: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Name</label>
                  <Input
                    value={user.guardianName || ''}
                    disabled={!isEditing}
                    onChange={(e) => setUser({...user, guardianName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
                  <Input
                    value={user.school || ''}
                    disabled={!isEditing}
                    onChange={(e) => setUser({...user, school: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Academic Note</label>
                  <Input
                    value={user.honorRoll || ''}
                    disabled={!isEditing}
                    onChange={(e) => setUser({...user, honorRoll: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Teacher Information (if role is Teacher) */}
        {user.role === 'Teacher' && (
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Teacher Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Code</label>
                  <Input
                    value={user.teacherCode || ''}
                    disabled={!isEditing}
                    onChange={(e) => setUser({...user, teacherCode: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                  <Input
                    type="number"
                    value={user.yearsOfExperience || ''}
                    disabled={!isEditing}
                    onChange={(e) => setUser({...user, yearsOfExperience: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  rows={3}
                  value={user.bio || ''}
                  disabled={!isEditing}
                  onChange={(e) => setUser({...user, bio: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Credentials</label>
                <div className="space-y-2">
                  {user.credentials?.map((credential, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={credential}
                        disabled={!isEditing}
                        onChange={(e) => {
                          const newCredentials = [...(user.credentials || [])];
                          newCredentials[index] = e.target.value;
                          setUser({...user, credentials: newCredentials});
                        }}
                      />
                      {isEditing && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const newCredentials = user.credentials?.filter((_, i) => i !== index);
                            setUser({...user, credentials: newCredentials});
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const newCredentials = [...(user.credentials || []), ''];
                        setUser({...user, credentials: newCredentials});
                      }}
                    >
                      + Add Credential
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Audit Information */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Audit Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
                <p className="text-sm text-gray-900">{user.createdAt}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Updated At</label>
                <p className="text-sm text-gray-900">{user.updatedAt}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Updated By</label>
                <p className="text-sm text-gray-900">{user.updatedBy}</p>
              </div>
            </div>
                     </div>
         </Card>

         {/* Confirmation Dialogs */}
         <ConfirmationDialog
           isOpen={showDeleteDialog}
           onClose={() => setShowDeleteDialog(false)}
           onConfirm={handleDeleteUser}
           title="Delete User"
           message="Are you sure you want to delete this user? This action cannot be undone and will permanently remove all user data."
           confirmText="Delete User"
           cancelText="Cancel"
           type="danger"
         />

         <ConfirmationDialog
           isOpen={showBanDialog}
           onClose={() => setShowBanDialog(false)}
           onConfirm={handleBanUser}
           title="Ban User"
           message="Are you sure you want to ban this user? They will no longer be able to access the system."
           confirmText="Ban User"
           cancelText="Cancel"
           type="warning"
         />
       </div>
     </div>
   );
 }