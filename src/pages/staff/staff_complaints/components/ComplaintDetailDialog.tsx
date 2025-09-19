import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { 
  MessageSquare, 
  Clock, 
  Calendar, 
  Flag, 
  Download, 
  User, 
  Mail,
  CheckCircle, 
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';

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
  attachments?: {
    name: string;
    type: 'PDF' | 'JPEG' | 'PNG';
    size: string;
    url?: string;
  }[];
  activityLog?: {
    action: string;
    user: string;
    timestamp: string;
  }[];
}

interface ComplaintDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  onStatusChange: (complaintId: string, status: string, response?: string) => void;
}

export default function ComplaintDetailDialog({
  isOpen,
  onClose,
  complaint,
  onStatusChange
}: ComplaintDetailDialogProps) {
  const [response, setResponse] = useState('');
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'resolve' | 'reject' | 'in-progress'>('resolve');

  if (!complaint) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'In Progress':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'Resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
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

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-red-600" />
          </div>
        );
      case 'JPEG':
      case 'PNG':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-green-600" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-gray-600" />
          </div>
        );
    }
  };

  const handleActionClick = (action: 'resolve' | 'reject' | 'in-progress') => {
    setSelectedAction(action);
    setShowResponseDialog(true);
  };

  const handleConfirmAction = () => {
    const statusMap = {
      'resolve': 'Resolved',
      'reject': 'Rejected',
      'in-progress': 'In Progress'
    };
    
    onStatusChange(complaint.id, statusMap[selectedAction], response);
    setShowResponseDialog(false);
    setResponse('');
    onClose();
  };

  const mockAttachments = [
    { name: 'screenshot.png', type: 'PNG' as const, size: '1.2 MB' },
    { name: 'receipt.pdf', type: 'PDF' as const, size: '245 KB' }
  ];

  const mockActivityLog = [
    {
      action: 'Complaint submitted',
      user: complaint.user.name,
      timestamp: complaint.date + ' 14:30'
    },
    ...(complaint.status !== 'Pending' ? [{
      action: `Status changed to ${complaint.status}`,
      user: 'Admin Staff',
      timestamp: complaint.date + ' 16:45'
    }] : [])
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent size="xl" className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>Complaint Details</span>
              <span className="text-lg font-mono text-gray-600">#{complaint.complaintId}</span>
            </DialogTitle>
            <DialogDescription>
              View and manage complaint details and status
            </DialogDescription>
          </DialogHeader>
          
          <DialogBody>
            <div className="space-y-6">
              {/* Status and Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(complaint.status)}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Type</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(complaint.type)}`}>
                        {complaint.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Flag className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Priority</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                      <p className="text-sm font-medium text-gray-900">{complaint.date}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">User Information</span>
                </div>
                <div className="flex items-center gap-4">
                  {getUserAvatar(complaint.user)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{complaint.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">user@example.com</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complaint Description */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Complaint Description
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">"{complaint.description}"</p>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Attachments ({mockAttachments.length})
                </h3>
                <div className="space-y-2">
                  {mockAttachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFileIcon(attachment.type)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                          <p className="text-xs text-gray-500">{attachment.type} • {attachment.size}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Log */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Activity Log
                </h3>
                <div className="space-y-3">
                  {mockActivityLog.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">by {activity.user} • {activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogBody>
          
          <DialogFooter>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              {complaint.status === 'Pending' && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => handleActionClick('in-progress')}
                    className="!bg-blue-500 text-blue-700 border-blue-200 hover:!bg-blue-400"
                  >
                    Mark In Progress
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleActionClick('reject')}
                    className="!bg-red-500 text-red-700 border-red-200 hover:!bg-red-400"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleActionClick('resolve')}
                    className="!bg-green-500 hover:!bg-green-400 text-white"
                  >
                    Resolve
                  </Button>
                </>
              )}
              {complaint.status === 'In Progress' && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => handleActionClick('reject')}
                    className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleActionClick('resolve')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Resolve
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={(open) => !open && setShowResponseDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAction === 'resolve' ? 'Resolve Complaint' : 
               selectedAction === 'reject' ? 'Reject Complaint' : 
               'Update Status'}
            </DialogTitle>
            <DialogDescription>
              {selectedAction === 'resolve' ? 'Provide a resolution message for this complaint.' :
               selectedAction === 'reject' ? 'Explain why this complaint is being rejected.' :
               'Add a note about the status change.'}
            </DialogDescription>
          </DialogHeader>
          
          <DialogBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Message
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder={
                    selectedAction === 'resolve' ? 'Describe how the complaint was resolved...' :
                    selectedAction === 'reject' ? 'Explain the reason for rejection...' :
                    'Add any relevant notes...'
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>
            </div>
          </DialogBody>
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowResponseDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAction}
              disabled={!response.trim()}
              className={
                selectedAction === 'resolve' ? 'bg-green-600 hover:bg-green-700' :
                selectedAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                'bg-blue-600 hover:bg-blue-700'
              }
            >
              {selectedAction === 'resolve' ? 'Resolve' : 
               selectedAction === 'reject' ? 'Reject' : 
               'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
