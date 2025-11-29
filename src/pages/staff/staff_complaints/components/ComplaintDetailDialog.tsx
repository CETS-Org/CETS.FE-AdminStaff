import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/useToast';
import { getComplaintDownloadUrl } from '@/api/complaint.api';

export interface Complaint {
  id: string;
  complaintId: string;
  user: {
    name: string;
    avatar?: string;
  };
  type: string;
  status: string;
  priority: string;
  date: string;
  description: string;
  submitterEmail?: string;
  attachmentUrl?: string;
  resolvedByName?: string;
  resolvedAt?: string;
  adminResponse?: string;
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
  const [reply, setReply] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'resolve' | 'closed' | 'in-progress'>('resolve');
  const [selectedNextStatus, setSelectedNextStatus] = useState<'in-progress' | 'closed' | 'resolve' | null>(null);
  const { showToast } = useToast();

  // Reset reply when dialog opens/closes or complaint changes
  useEffect(() => {
    if (!isOpen || !complaint) {
      setReply('');
      setShowConfirmDialog(false);
      setSelectedNextStatus(null);
    }
  }, [isOpen, complaint?.id]);

  if (!complaint) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'In Progress':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'Resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Closed':
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Closed':
      case 'Rejected':
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

  const handleActionClick = (action: 'resolve' | 'closed' | 'in-progress') => {
    // For Resolved or Closed, require reply
    if ((action === 'resolve' || action === 'closed') && !reply.trim()) {
      showToast('Please provide an admin response', 'error');
      return;
    }
    // For in-progress, reply is optional but we still show confirm dialog
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = () => {
    const statusMap: Record<'resolve' | 'closed' | 'in-progress', string> = {
      'resolve': 'Resolved',
      'closed': 'Closed',
      'in-progress': 'In Progress'
    };
    
    // For Resolved or Closed, require reply
    if ((confirmAction === 'resolve' || confirmAction === 'closed') && !reply.trim()) {
      showToast('Please provide an admin response', 'error');
      return;
    }
    
    const newStatus = statusMap[confirmAction];
    onStatusChange(complaint.id, newStatus, reply || undefined);
    setShowConfirmDialog(false);
    setReply('');
    setSelectedNextStatus(null); // Reset selected status after change
  };

  const handleDownloadAttachment = async () => {
    if (!complaint.attachmentUrl) {
      showToast('No attachment available to download', 'error');
      return;
    }

    try {
      showToast('Preparing download...', 'info');
      const response = await getComplaintDownloadUrl(complaint.id);
      const downloadUrl = response.downloadUrl;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('Download started!', 'success');
    } catch (error: any) {
      console.error('Download attachment error:', error);
      showToast(`Failed to download attachment: ${error.response?.data?.error || error.message || 'Unknown error'}`, 'error');
    }
  };

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
                    {complaint.submitterEmail && (
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{complaint.submitterEmail}</span>
                      </div>
                    )}
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
              {complaint.attachmentUrl && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Attachment
                  </h3>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {complaint.attachmentUrl.split('/').pop() || 'Attachment'}
                        </p>
                        <p className="text-xs text-gray-500">Supporting document</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownloadAttachment}
                      className="flex items-center gap-2"
                      iconLeft={<Download className="w-4 h-4" />}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {/* Admin Response */}
              {complaint.adminResponse && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Response</label>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">{complaint.adminResponse}</p>
                    {complaint.resolvedByName && (
                      <p className="text-xs text-gray-600 mt-2">
                        By {complaint.resolvedByName}
                        {complaint.resolvedAt && ` on ${new Date(complaint.resolvedAt).toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Reply Section - Show for all status changes */}
              {selectedNextStatus && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Response {(selectedNextStatus === 'resolve' || selectedNextStatus === 'closed') ? <span className="text-red-500">*</span> : <span className="text-gray-500">(Optional)</span>}
                  </label>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Enter your response to the complainant..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={4}
                  />
                </div>
              )}
            </div>
          </DialogBody>
          
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Close
            </Button>
            {/* Show buttons for Open status - only if no action selected yet */}
            {complaint.status === 'Open' && !selectedNextStatus && (
              <>
                <Button
                  onClick={() => {
                    setSelectedNextStatus('in-progress');
                    setReply('');
                  }}
                  iconLeft={<Clock className="w-4 h-4 mr-2" />}
                  className="!bg-blue-600 hover:!bg-blue-700 !text-white"
                >
                  Mark In Progress
                </Button>
              </>
            )}
            {/* Show buttons for In Progress status - only if no action selected yet */}
            {complaint.status === 'In Progress' && !selectedNextStatus && (
              <>
                <Button
                  onClick={() => {
                    setSelectedNextStatus('resolve');
                    setReply('');
                  }}
                  iconLeft={<CheckCircle className="w-4 h-4 mr-2" />}
                  className="!bg-green-600 hover:!bg-green-700 !text-white"
                >
                  Resolve
                </Button>
              </>
            )}
            {/* When status is Resolved or Closed, only show Close button to close dialog */}
            {/* Show buttons when any status change is selected */}
            {selectedNextStatus && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedNextStatus(null);
                    setReply('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleActionClick(selectedNextStatus)}
                  iconLeft={
                    selectedNextStatus === 'resolve' ? <CheckCircle className="w-4 h-4 mr-2" /> : 
                    selectedNextStatus === 'closed' ? <XCircle className="w-4 h-4 mr-2" /> : 
                    <Clock className="w-4 h-4 mr-2" />
                  }
                  className={
                    selectedNextStatus === 'resolve' ? '!bg-green-600 hover:!bg-green-700 !text-white' : 
                    selectedNextStatus === 'closed' ? '!bg-gray-600 hover:!bg-gray-700 !text-white' : 
                    '!bg-blue-600 hover:!bg-blue-700 !text-white'
                  }
                  disabled={(selectedNextStatus === 'resolve' || selectedNextStatus === 'closed') && !reply.trim()}
                >
                  {selectedNextStatus === 'resolve' ? 'Confirm Resolve' : 
                   selectedNextStatus === 'closed' ? 'Confirm Close' : 
                   'Confirm In Progress'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={(open) => !open && setShowConfirmDialog(false)}>
        <DialogContent size="lg" className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'resolve' ? 'Resolve Complaint' : 
               confirmAction === 'closed' ? 'Close Complaint' : 
               'Mark as In Progress'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'resolve' 
                ? 'Are you sure you want to resolve this complaint? The complainant will be notified.'
                : confirmAction === 'closed'
                ? 'Are you sure you want to close this complaint? Please provide a reason for closing.'
                : 'This will mark the complaint as in progress and assign it for further processing.'}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex-1 overflow-y-auto max-h-none">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {confirmAction === 'resolve' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : confirmAction === 'closed' ? (
                    <XCircle className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-blue-600" />
                  )}
                  <span className="font-medium">Complaint Details</span>
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Complainant:</span> {complaint.user.name}</p>
                  <p><span className="font-medium">Type:</span> {complaint.type}</p>
                  <p><span className="font-medium">Priority:</span> {complaint.priority}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-reply" className="block text-sm font-medium text-gray-700">
                  Reply to Complainant {(confirmAction === 'closed' || confirmAction === 'resolve') ? '(Required)' : '(Optional)'}
                </label>
                <textarea
                  id="confirm-reply"
                  value={reply}
                  readOnly
                  disabled
                  placeholder={`Enter your ${confirmAction === 'resolve' ? 'resolution' : confirmAction === 'closed' ? 'closing' : 'progress'} message...`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm resize-none bg-gray-50 text-gray-700 cursor-not-allowed"
                  rows={4}
                />
                <p className="text-xs text-gray-500 italic">Reply is entered in the complaint details dialog</p>
                {(confirmAction === 'closed' || confirmAction === 'resolve') && !reply.trim() && (
                  <p className="text-sm text-red-600">Please provide an admin response in the complaint details dialog</p>
                )}
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              className={`${
                confirmAction === 'resolve' ? 'bg-green-600 hover:bg-green-700' : 
                confirmAction === 'closed' ? 'bg-gray-600 hover:bg-gray-700' : 
                'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              disabled={
                (confirmAction === 'closed' && !reply.trim()) ||
                (confirmAction === 'resolve' && !reply.trim())
              }
            >
              {confirmAction === 'resolve' 
                ? 'Resolve Complaint'
                : confirmAction === 'closed'
                ? 'Close Complaint'
                : 'Mark as In Progress'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
