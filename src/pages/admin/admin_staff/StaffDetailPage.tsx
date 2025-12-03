import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import { 
  ChevronRight, 
  User, 
  UserX,
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
import { setIsDelete, setIsActive } from "@/api/account.api";
import DeleteConfirmDialog from "@/shared/delete_confirm_dialog";
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);

  // Fetch staff data
  useEffect(() => {
    const locationState = location.state as any;
    
    if (locationState && locationState.updateStatus === "success") {
      setShowSuccessToast(true);
      const timer = setTimeout(() => setShowSuccessToast(false), 5000);
      
      // If we have preloaded data, use it immediately
      if (locationState.preloadedStaff) {
        setStaff(locationState.preloadedStaff);
        setLoading(false);
        setIsInitialLoad(false);
        navigate(location.pathname, { replace: true, state: {} });
        return () => clearTimeout(timer);
      }
      
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
        setIsInitialLoad(false);
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

  const handleEditSuccess = async () => {
    // Refresh staff data after successful edit
    if (staff?.accountId) {
      try {
        const refreshedStaff = await getStaffById(staff.accountId);
        setStaff(refreshedStaff);
        setShowSuccessToast(true);
        const timer = setTimeout(() => setShowSuccessToast(false), 5000);
        return () => clearTimeout(timer);
      } catch (error) {
        console.error("Error refreshing staff data:", error);
      }
    }
  };

  const handleBan = () => {
    setBanDialogOpen(true);
  };

  const confirmBanStaff = async () => {
    if (!staff?.accountId) return;
    try {
      const isBanned = (staff as any)?.isDeleted || staff.statusName === 'Blocked' || staff.statusName === 'Locked';
      if (isBanned) {
        await setIsActive(staff.accountId);
      } else {
        await setIsDelete(staff.accountId);
      }
      const refreshed = await getStaffById(staff.accountId);
      setStaff(refreshed);
    } catch (err) {
      console.error("Error updating staff status:", err);
    } finally {
      setBanDialogOpen(false);
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      // Add new note logic
      console.log("Adding note:", newNote);
      setNewNote("");
    }
  };

  // Loading state - only show full loading on initial load
  if (loading && isInitialLoad) {
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
            {(() => {
              const isBanned = (staff as any)?.isDeleted || staff?.statusName === 'Blocked' || staff?.statusName === 'Locked';
              return isBanned ? (
                <Button
                  onClick={handleBan}
                  className="border-emerald-200 bg-emerald-500 hover:bg-emerald-100 hover:border-emerald-300 text-emerald-700 hover:text-emerald-800 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center">
                    <UserX className="w-4 h-4 mr-2" />
                    Unban Staff
                  </div>
                </Button>
              ) : (
                <Button
                  onClick={handleBan}
                  className="border-red-200 bg-red-500 hover:bg-red-100 hover:border-red-300 text-red-600 hover:text-red-700 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center">
                    <UserX className="w-4 h-4 mr-2" />
                    Ban Staff
                  </div>
                </Button>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        {/* Staff Information - Centered */}
        <div className="w-full max-w-2xl">
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
      </div>

      <DeleteConfirmDialog
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        onConfirm={confirmBanStaff}
        title={((staff as any)?.isDeleted || staff?.statusName === 'Blocked' || staff?.statusName === 'Locked') ? "Unban Staff" : "Ban Staff"}
        message={((staff as any)?.isDeleted || staff?.statusName === 'Blocked' || staff?.statusName === 'Locked')
          ? `Are you sure you want to unban "${staff?.fullName}"? This will reactivate their account.`
          : `Are you sure you want to ban "${staff?.fullName}"? This will deactivate their account.`}
      />
    </div>
  );
}
