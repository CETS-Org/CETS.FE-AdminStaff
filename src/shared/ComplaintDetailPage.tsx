import { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, MessageSquare, Clock, Calendar, Flag } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface ComplaintDetail {
  id: string;
  complaintId: string;
  user: {
    name: string;
    avatar?: string;
  };
  type: 'Payment' | 'Schedule' | 'Technical' | 'Course' | 'Faculty';
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  priority?: 'Low' | 'Medium' | 'High';
  submittedAt: string;
  description: string;
  attachments: {
    name: string;
    type: 'PDF' | 'JPEG' | 'PNG';
    size: string;
    url?: string;
  }[];
  activityLog: {
    action: string;
    user: string;
    timestamp: string;
  }[];
}

// Mock data - in real app this would come from API
const mockComplaintData: { [key: string]: ComplaintDetail } = {
  '1': {
    id: '1',
    complaintId: 'CMP-001',
    user: {
      name: 'Student A',
      avatar: undefined
    },
    type: 'Payment',
    status: 'Pending',
    priority: 'Medium',
    submittedAt: '2025-08-20 14:30',
    description: 'I paid the course fee but my account did not get updated.',
    attachments: [
      {
        name: 'receipt.pdf',
        type: 'PDF',
        size: '245 KB'
      },
      {
        name: 'image.jpeg',
        type: 'JPEG',
        size: '1.2 MB'
      }
    ],
    activityLog: [
      {
        action: 'Complaint submitted',
        user: 'Student A',
        timestamp: '2025-08-20 14:30'
      }
    ]
  },
  '2': {
    id: '2',
    complaintId: 'CMP-002',
    user: {
      name: 'Teacher B',
      avatar: undefined
    },
    type: 'Schedule',
    status: 'In Progress',
    priority: 'High',
    submittedAt: '2025-08-21 10:15',
    description: 'Class schedule conflicts with another important meeting. Need urgent resolution.',
    attachments: [],
    activityLog: [
      {
        action: 'Complaint submitted',
        user: 'Teacher B',
        timestamp: '2025-08-21 10:15'
      },
      {
        action: 'Status changed to In Progress',
        user: 'Admin John',
        timestamp: '2025-08-21 11:00'
      }
    ]
  }
};

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

const getUserAvatar = (user: ComplaintDetail['user']) => {
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

const getFileIcon = (type: string) => {
  switch (type) {
    case 'PDF':
      return (
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
      );
    case 'JPEG':
    case 'PNG':
      return (
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
      );
  }
};

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [complaint] = useState<ComplaintDetail | null>(id ? mockComplaintData[id] : null);
  
  // Determine if this is admin or staff based on URL
  const isAdmin = location.pathname.startsWith('/admin');
  const backPath = isAdmin ? '/admin/reports' : '/staff/complaints';

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50/50 lg:ml-64">
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Complaint not found</h2>
            <p className="text-gray-600 mt-2">The complaint you're looking for doesn't exist.</p>
            <Link to={backPath} className="inline-block mt-4">
              <Button>Back to Complaints</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 lg:ml-64">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={backPath} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <div className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Complaint Details</span>
          </Link>
        </div>

        {/* Complaint Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{complaint.complaintId}</h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                  {complaint.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                <div className="flex items-center gap-3">
                  {getUserAvatar(complaint.user)}
                  <div>
                    <p className="text-sm text-gray-600">Submitted by</p>
                    <p className="font-medium text-gray-900">{complaint.user.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(complaint.type)}`}>
                      {complaint.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Submitted at</p>
                    <p className="text-sm font-medium text-gray-900">{complaint.submittedAt}</p>
                  </div>
                </div>

                {complaint.priority && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Flag className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Priority</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Complaint Description */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaint Description</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">"{complaint.description}"</p>
              </div>
            </div>
          </Card>

          {/* Attachments */}
          {complaint.attachments.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
                <div className="space-y-3">
                  {complaint.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFileIcon(attachment.type)}
                        <div>
                          <p className="font-medium text-gray-900">{attachment.name}</p>
                          <p className="text-sm text-gray-500">{attachment.type} Document • {attachment.size}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Activity Log */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h3>
              <div className="space-y-4">
                {complaint.activityLog.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">by {activity.user} • {activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Response Button */}
        <div className="fixed bottom-6 right-6">
          <Link to={isAdmin ? `/admin/reports/${id}/response` : `/staff/complaints/${id}/response`}>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg">
              <MessageSquare className="w-4 h-4 mr-2" />
              Response
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}