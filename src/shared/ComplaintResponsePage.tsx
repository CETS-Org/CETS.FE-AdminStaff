import { useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
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
  category: string;
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
    submittedAt: 'January 15, 2025',
    description: 'I paid the course fee but my account did not get updated.',
    category: 'Payment Issue'
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
    submittedAt: 'January 16, 2025',
    description: 'Class schedule conflicts with another important meeting. Need urgent resolution.',
    category: 'Schedule Conflict'
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

export default function ComplaintResponsePage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [complaint] = useState<ComplaintDetail | null>(id ? mockComplaintData[id] : null);
  const [responseMessage, setResponseMessage] = useState('');
  const [selectedAction, setSelectedAction] = useState('Keep Pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Determine if this is admin or staff based on URL
  const isAdmin = location.pathname.startsWith('/admin');
  const backPath = isAdmin ? `/admin/reports/${id}` : `/staff/complaints/${id}`;

  const handleSubmit = async () => {
    if (!responseMessage.trim()) {
      alert('Please enter a response message.');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Response saved successfully!');
      navigate(backPath);
    }, 1000);
  };

  const handleCancel = () => {
    navigate(backPath);
  };

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50/50 lg:ml-64">
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Complaint not found</h2>
            <p className="text-gray-600 mt-2">The complaint you're looking for doesn't exist.</p>
            <Link to={isAdmin ? '/admin/reports' : '/staff/complaints'} className="inline-block mt-4">
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

        {/* Complaint Details Section */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Complaint Details</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                {complaint.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Complaint ID</h3>
                <p className="text-base font-semibold text-gray-900">{complaint.complaintId}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">User</h3>
                <p className="text-base font-semibold text-gray-900">{complaint.user.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Date Submitted</h3>
                <p className="text-base text-gray-900">{complaint.submittedAt}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Category</h3>
                <p className="text-base text-gray-900">{complaint.category}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Complaint Content</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">"{complaint.description}"</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Response Section */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Response</h2>
            
            <div className="space-y-6">
              {/* Response Message */}
              <div>
                <label htmlFor="response-message" className="block text-sm font-medium text-gray-700 mb-2">
                  Response Message
                </label>
                <textarea
                  id="response-message"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Dear Student A,&#10;&#10;We have verified your payment. Your account has been updated successfully."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                />
              </div>

              {/* Action Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Action</label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="action"
                      value="Resolve and Close"
                      checked={selectedAction === 'Resolve and Close'}
                      onChange={(e) => setSelectedAction(e.target.value)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Resolve and Close</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="action"
                      value="Escalate to Higher Level"
                      checked={selectedAction === 'Escalate to Higher Level'}
                      onChange={(e) => setSelectedAction(e.target.value)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Escalate to Higher Level</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="action"
                      value="Keep Pending"
                      checked={selectedAction === 'Keep Pending'}
                      onChange={(e) => setSelectedAction(e.target.value)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Keep Pending</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Response'}
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}