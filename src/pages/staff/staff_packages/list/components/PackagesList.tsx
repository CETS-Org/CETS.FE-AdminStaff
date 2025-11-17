import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import { type TableColumn } from "@/components/ui/Table";
import DataTable, { type FilterConfig, type BulkAction } from "@/components/ui/DataTable";
import { 
  Plus, Eye, Edit, Trash2, 
  CheckSquare, Square, Download,
  Package as PackageIcon,
  DollarSign
} from "lucide-react";
import DeleteConfirmDialog from "../../shared/components/DeleteConfirmDialog";
import type { Package } from "@/types/package.types";
import { deletePackage } from "@/api/package.api";
import { useToast } from "@/pages/staff/staff_courses/shared/hooks/useToast";
import Toast from "@/components/ui/Toast";

interface PackagesListProps {
  packages: Package[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function PackagesList({ packages, loading, error, onRefresh }: PackagesListProps) {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; package: Package | null }>({ open: false, package: null });
  const { showSuccessToast, showErrorToast, toastMessage, showSuccessMessage, showErrorMessage } = useToast();

  const itemsPerPage = 8;

  // Format Vietnamese currency
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const handleBulkDelete = (selectedPackages: Package[]) => {
    console.log("Bulk delete:", selectedPackages);
  };

  const handleBulkExport = (selectedPackages: Package[]) => {
    console.log("Bulk export:", selectedPackages);
  };

  // Extract unique categories from actual data
  const uniqueCategories = Array.from(
    new Set(
      packages
        .map((p) => p.categoryName)
        .filter((c): c is string => !!c)
    )
  );

  // Filter configurations for DataTable
  const filterConfigs: FilterConfig[] = [
    {
      key: "isActive",
      label: "Status",
      options: [
        { label: "All Status", value: "all" },
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
    {
      key: "categoryName",
      label: "Category",
      options: [
        { label: "All Categories", value: "all" },
        ...uniqueCategories.map(category => ({ label: category, value: category })),
      ],
    },
  ];

  // Bulk actions for DataTable
  const bulkActions: BulkAction<Package>[] = [
    {
      id: "export",
      label: "Export",
      icon: <Download className="w-4 h-4" />,
      onClick: handleBulkExport,
      variant: "secondary",
      className: "text-blue-600 border-blue-300 hover:bg-blue-100",
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleBulkDelete,
      variant: "secondary",
      className: "text-red-600 border-red-300 hover:bg-red-100",
    },
  ];

  const columns: TableColumn<Package>[] = [
    { 
      header: "Package",
      className: "w-2/5", 
      accessor: (row) => (
        <div className="flex items-center gap-3">
          {row.packageImageUrl ? (
            <img 
              src={row.packageImageUrl} 
              alt={row.name}
              className="w-12 h-12 rounded-xl object-cover shadow-sm"
            />
          ) : (
            <div className="relative w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center text-purple-700 font-bold text-lg shadow-sm">
              {row.name?.charAt(0) || 'P'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-gray-900 truncate">{row.name}</div>
            </div>
            <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{row.description || 'No description'}</div>
            {/* <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <PackageIcon className="w-3 h-3" />
                {row.courses?.length || 0} courses
              </span>
            </div> */}
          </div>
        </div>
      )
    },
    {
      header: "Code",
      className: "w-32",
      accessor: (row) => (
        <div className="space-y-1">
          <div className="font-medium text-sm text-gray-900">
            {row.packageCode || 'N/A'}
          </div>
        </div>
      )
    },
   
    {
      header: "Price",
      className: "w-40",
      accessor: (row) => (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-1 text-gray-900">
            {formatVND(row.totalPrice || 0)} ₫
          </div>  
        </div>
      )
    },
    { 
      header: "Status",
      className: "w-32", 
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
            ${row.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}
          `}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5
              ${row.isActive ? 'bg-green-500' : 'bg-gray-400'}
            `} />
            {row.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      )
    },
    {
      header: "Actions",
      className: "w-32",
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            onClick={() => handleView(row)}
            className="!p-2 !bg-blue-50 !text-blue-600 !border !border-blue-200 hover:!bg-blue-100 hover:!text-blue-700 hover:!border-blue-300 !transition-colors !rounded-md"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => handleEdit(row)}
            className="!p-2 !bg-green-50 !text-green-600 !border !border-green-200 hover:!bg-green-100 hover:!text-green-700 hover:!border-green-300 !transition-colors !rounded-md"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => handleDelete(row)}
            className="!p-2 !bg-red-50 !text-red-600 !border !border-red-200 hover:!bg-red-100 hover:!text-red-700 hover:!border-red-300 !transition-colors !rounded-md"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const handleView = (pkg: Package) => {
    navigate(`/staff/packages/${pkg.id}`);
  };

  const handleEdit = (pkg: Package) => {
    navigate(`/staff/packages/edit/${pkg.id}`);
  };

  const handleDelete = (pkg: Package) => {
    setDeleteDialog({ open: true, package: pkg });
  };

  const handleConfirmDelete = async () => {
    if (deleteDialog.package) {
      try {
        await deletePackage(deleteDialog.package.id);
        setDeleteDialog({ open: false, package: null });
        showSuccessMessage(`Package "${deleteDialog.package.name}" deleted successfully!`);
        // Refresh the packages list
        onRefresh();
      } catch (err: any) {
        console.error("Error deleting package:", err);
        showErrorMessage(err.response?.data?.message || "Failed to delete package. Please try again.");
      }
    }
  };

  // Card render function for DataTable
  const renderPackageCard = (pkg: Package, isSelected: boolean, onToggleSelect: () => void) => (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      {/* Card Header */}
      <div className="relative aspect-video bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 flex items-center justify-center">
        {pkg.packageImageUrl ? (
          <img 
            src={pkg.packageImageUrl} 
            alt={pkg.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-purple-700 font-bold text-2xl shadow-lg">
            {pkg.name?.charAt(0) || 'P'}
          </div>
        )}
        
        {/* Selection Checkbox */}
        <button
          onClick={onToggleSelect}
          className="absolute top-3 left-3 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-primary-600" />
          ) : (
            <Square className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* Discount Badge */}
      </div>

      <div className="p-5">
        {/* Package Title and Code */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
            {pkg.name}
          </h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{pkg.description || 'No description available'}</p>
        
        {/* Package Meta */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Package Code:</span>
            <span className="font-medium text-gray-900">{pkg.packageCode || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Courses:</span>
            <span className="font-medium text-gray-900">{pkg.courseNames?.length || pkg.coursesCount || pkg.courses?.length || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Standard Price:</span>
            <span className="font-medium text-gray-900">{formatVND(pkg.totalPrice || 0)} ₫</span>
          </div>
          {pkg.totalIndividualPrice && pkg.totalIndividualPrice > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Individual Price:</span>
              <span className="font-semibold text-green-600">{formatVND(pkg.totalIndividualPrice)} ₫</span>
            </div>
          )}
        </div>

        {/* Status and Category */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
            ${pkg.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}
          `}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5
              ${pkg.isActive ? 'bg-green-500' : 'bg-gray-400'}
            `} />
            {pkg.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
            {pkg.categoryName || 'Uncategorized'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleView(pkg)}
            className="!flex-1 !bg-blue-50 !text-blue-600 !border !border-blue-200 hover:!bg-blue-100 hover:!text-blue-700 hover:!border-blue-300 !transition-colors !rounded-md"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button
            size="sm"
            onClick={() => handleEdit(pkg)}
            className="!flex-1 !bg-green-50 !text-green-600 !border !border-green-200 hover:!bg-green-100 hover:!text-green-700 hover:!border-green-300 !transition-colors !rounded-md"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            size="sm"
            onClick={() => handleDelete(pkg)}
            className="!p-2 !bg-red-50 !text-red-600 !border !border-red-200 hover:!bg-red-100 hover:!text-red-700 hover:!border-red-300 !transition-colors !rounded-md"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Packages DataTable */}
      <DataTable<Package>
        title="Packages Management"
        description="Manage and organize your course packages"
        data={packages}
        columns={columns}
        searchFields={['name', 'description', 'packageCode', 'categoryName']}
        filterConfigs={filterConfigs}
        bulkActions={bulkActions}
        onAdd={() => navigate("/staff/packages/add")}
        addButtonLabel="Add Package"
        addButtonIcon={<Plus className="w-4 h-4" />}
        viewModes={["table", "card"]}
        defaultViewMode="table"
        itemsPerPage={itemsPerPage}
        loading={loading}
        error={error}
        onRefresh={onRefresh}
        emptyStateTitle="No packages found"
        emptyStateDescription="Get started by creating your first package"
        emptyStateAction={{
          label: "Add Package",
          onClick: () => navigate("/staff/packages/add")
        }}
        renderCard={renderPackageCard}
        getItemId={(pkg) => pkg.id}
        enableSelection={true}
        className=""
        headerClassName=""
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, package: deleteDialog.package })}
        onConfirm={handleConfirmDelete}
        title="Delete Package"
        message={deleteDialog.package ? `Are you sure you want to delete the package "${deleteDialog.package.name}"? This action cannot be undone.` : ""}
      />

      {/* Toast Notifications */}
      {showSuccessToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => {}}
        />
      )}
      {showErrorToast && (
        <Toast
          message={toastMessage}
          type="error"
          onClose={() => {}}
        />
      )}
    </div>
  );
}



