import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import { 
  ChevronRight, 
  Edit, 
  Trash2, 
  User, 
  Calendar, 
  Star,
  Clock,
  Mail,
  Phone,
  MapPin,
  IdCard
} from "lucide-react";
import { formatDate, getStatusColor, getStatusDisplay } from "@/helper/helper.service";
import { getStaffById } from "@/api/staff.api";
import type { Account } from "@/types/account.type";

interface Note {
  id: string;
  adminName: string;
  adminAvatar: string;
  date: string;
  content: string;
}

export default function StaffDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [newNote, setNewNote] = useState("");
  const [staff, setStaff] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Fetch staff data
  useEffect(() => {
    if (location.state && (location.state as any).updateStatus === "success") {
      setShowSuccessToast(true);
      const timer = setTimeout(() => setShowSuccessToast(false), 5000);
      navigate(location.pathname, { replace: true, state: {} });
      return () => clearTimeout(timer);
    }

    const fetchStaff = async () => {
      if (!id) {
        setError("Staff ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("Fetching staff with ID:", id);
        const staffData = await getStaffById(id);
        console.log("Staff data received:", staffData);
        setStaff(staffData);
      } catch (err) {
        console.error("Error fetching staff:", err);
        console.error("Error details:", {
          message: err instanceof Error ? err.message : 'Unknown error',
          status: err instanceof Error && 'response' in err ? (err as any).response?.status : 'No status',
          data: err instanceof Error && 'response' in err ? (err as any).response?.data : 'No data'
        });
        setError(`Failed to load staff data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [id]);

  const notes: Note[] = [
    {
      id: "1",
      adminName: "Admin Manager",
      adminAvatar: "https://via.placeholder.com/40x40?text=AM",
      date: "January 15, 2025",
      content: "Staff member consistently performs well in their role. Excellent communication skills and attention to detail."
    },
    {
      id: "2",
      adminName: "HR Director",
      adminAvatar: "https://via.placeholder.com/40x40?text=HR",
      date: "January 10, 2025",
      content: "Recommended for additional responsibilities. Shows strong leadership potential and team collaboration skills."
    }
  ];

  const handleEdit = () => {
    // Navigate to edit page
    console.log("Edit staff");
  };

  const handleDelete = () => {
    // Show delete confirmation
    console.log("Delete staff");
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      // Add new note logic
      console.log("Adding note:", newNote);
      setNewNote("");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 mx-auto mt-16 lg:pl-70">
        <div className="flex items-center justify-center h-64">
          <Loader />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !staff) {
    return (
      <div className="p-6 mx-auto mt-16 lg:pl-70">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Staff</h3>
          <p className="text-gray-500 mb-4">{error || "Staff not found"}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="secondary"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto mt-16 ">
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-green-200 bg-green-50 text-green-800 shadow-lg min-w-[280px]">
            <div className="w-6 h-6 mt-0.5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Update Successful</p>
              <p className="text-sm">Staff profile updated successfully.</p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="ml-2 text-green-700 hover:text-green-900"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {/* Header with Breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900">Dashboard</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/admin/staffs" className="hover:text-gray-900">Staff Management</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Staff Detail</span>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleEdit}
              variant="secondary"
              size="sm"
              className="rounded-full border border-gray-300 bg-white hover:bg-gray-50"
            >
                <div className ="flex item-center">
              <Edit className="w-4 h-4 mr-2" />
              Edit
              </div>
            </Button>
            <Button
              onClick={handleDelete}
              variant="secondary"
              size="sm"
              className="rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-red-600 hover:text-red-700"
            >
                <div className ="flex item-center">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
              </div>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Staff Information */}
        <div className="lg:col-span-1">
          <Card title="Staff Information">
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {staff.avatarUrl ? (
                  <img 
                    src={staff.avatarUrl} 
                    alt={staff.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{staff.fullName}</h2>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(staff.accountStatusID ?? "")}`}>
                  {getStatusDisplay(staff.accountStatusID ?? "")}
                </span>
                {staff.isVerified && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-600">{staff.email || "N/A"}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Phone</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-600">{staff.phoneNumber || "N/A"}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Date of Birth</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-600">{formatDate(staff.dateOfBirth) || "N/A"}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Account Created</label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-600">{formatDate(staff.createdAt) || "N/A"}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Address</label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-600">{staff.address || "N/A"}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">CID</label>
                <div className="flex items-center gap-2">
                  <IdCard className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-600">{staff.cid || "N/A"}</p>
                </div>
              </div>
            </div>
          </Card>
        
        </div>

        {/* Right Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           

            {/* Work Summary */}
            <Card title="Work Summary">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Years of Service:</span>
                  <span className="font-bold text-blue-600">
                    {staff.createdAt ? Math.max(0, new Date().getFullYear() - new Date(staff.createdAt).getFullYear()) : 0} years
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Status:</span>
                  <span className="font-bold text-green-600">{staff.statusName || "Active"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Roles:</span>
                  <div className="flex flex-col items-end">
                    {staff.roleNames && staff.roleNames.length > 0 ? (
                      staff.roleNames.map((role, index) => (
                        <span key={index} className="font-bold text-purple-600 text-sm">
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="font-bold text-purple-600">N/A</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Verified:</span>
                  <span className="font-bold text-green-600">{staff.isVerified ? "Yes" : "No"}</span>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800">Consistently reliable and professional</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

         
        </div>
      </div>
    </div>
  );
}
