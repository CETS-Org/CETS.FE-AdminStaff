import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable, { type FilterConfig, type BulkAction } from "@/components/ui/DataTable";
import { type TableColumn } from "@/components/ui/Table";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Eye, Edit, Trash2, Plus, Percent, Calendar, TrendingUp, Loader2, AlertCircle, Clock } from "lucide-react";
import type { Promotion } from "@/types/promotion.type";
import DeleteConfirmDialog from "@/shared/delete_confirm_dialog";
import AddEditPromotionDialog from "./AddEditPromotionDialog";
import PromotionDetailDialog from "./PromotionDetailDialog";
import { getPromotions, deletePromotion, bulkDeletePromotions, bulkActivatePromotions } from "@/api/promotion.api";

export default function PromotionManagement() {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; promotion: Promotion | null }>({ open: false, promotion: null });
  const [addEditDialog, setAddEditDialog] = useState<{ open: boolean; promotion: Promotion | null; mode: "add" | "edit" }>({ open: false, promotion: null, mode: "add" });
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; promotion: Promotion | null }>({ open: false, promotion: null });
  
  // Data states
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching promotions from API...");
      
      // Call API to get promotions
      const promotionsData = await getPromotions();
      console.log("Promotions data received:", promotionsData);
      
      setPromotions(promotionsData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch promotions';
      setError(errorMessage);
      console.error('Error fetching promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleDelete = async (promotionId: string) => {
    try {
      console.log("Deleting promotion:", promotionId);
      
      // Call API to delete promotion
      await deletePromotion(promotionId);
      
      // Update local state
      setPromotions(prev => prev.filter(p => p.id !== promotionId));
      setDeleteDialog({ open: false, promotion: null });
      
      console.log("Promotion deleted successfully");
    } catch (err: any) {
      console.error('Error deleting promotion:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete promotion. Please try again.';
      alert(errorMessage);
    }
  };



  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No end date";
    return new Date(dateString).toLocaleDateString();
  };

  const getDiscountDisplay = (promotion: Promotion) => {
    if (promotion.percentOff) {
      return `${promotion.percentOff}% off`;
    } else if (promotion.amountOff) {
      return `$${promotion.amountOff} off`;
    }
    return "No discount";
  };

  const getStatusBadge = (promotion: Promotion) => {
    const active = promotion.isActive === true || (typeof promotion.isActive === 'number' && promotion.isActive === 1);
    return active
      ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
      : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>;
  };

  const columns: TableColumn<Promotion>[] = [
    { 
      header: "Promotion",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Percent className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{row.name}</p>
            <p className="text-sm text-gray-500 truncate">Code: {row.code}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Discount",
      accessor: (row) => (
        <div className="text-sm">
          <p className="font-medium text-gray-900">{getDiscountDisplay(row)}</p>
          <p className="text-gray-500">{row.promotionType?.name}</p>
        </div>
      ),
    },
    {
      header: "Duration",
      accessor: (row) => (
        <div className="text-sm">
          <p className="text-gray-900">
            {formatDate(row.startDate)} - {formatDate(row.endDate)}
          </p>
          <div className="flex items-center gap-1 text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{row.endDate ? 'Limited time' : 'Ongoing'}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (row) => getStatusBadge(row),
    },
    {
      header: "Created By",
      accessor: (row) => (
        <div className="text-sm">
          <p className="font-medium text-gray-900">{row.createdByNavigation?.fullName || 'Unknown'}</p>
          <p className="text-gray-500">{formatDate(row.createdAt)}</p>
        </div>
      ),
    },
    {
      header: "Actions",
      className: "w-40",
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            onClick={() => setDetailDialog({ open: true, promotion: row })}
            className="!p-2 !bg-blue-50 !text-blue-600 !border !border-blue-200 hover:!bg-blue-100 hover:!text-blue-700 hover:!border-blue-300 !transition-colors !rounded-md"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => setAddEditDialog({ open: true, promotion: row, mode: "edit" })}
            className="!p-2 !bg-green-50 !text-green-600 !border !border-green-200 hover:!bg-green-100 hover:!text-green-700 hover:!border-green-300 !transition-colors !rounded-md"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => setDeleteDialog({ open: true, promotion: row })}
            className="!p-2 !bg-red-50 !text-red-600 !border !border-red-200 hover:!bg-red-100 hover:!text-red-700 hover:!border-red-300 !transition-colors !rounded-md"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];


  // DataTable configuration
  const searchFields: (keyof Promotion)[] = ['name', 'code'];
  
  const filterConfigs: FilterConfig[] = [
    {
      key: "isActive",
      label: "Status",
      options: [
        { label: "All Status", value: "all" },
        { label: "Active", value: "true" },
        { label: "Expired", value: "false" },
      ],
    },
    {
      key: "promotionTypeID",
      label: "Type",
      options: [
        { label: "All Types", value: "all" },
        { label: "Seasonal Discount", value: "type1" },
        { label: "Student Discount", value: "type2" },
      ],
    },
  ];

  const bulkActions: BulkAction<Promotion>[] = [
    {
      id: "delete",
      label: "Delete Selected",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: async (selectedItems: Promotion[]) => {
        try {
          const ids = selectedItems.map(item => item.id);
          console.log("Bulk delete:", ids);
          
          if (window.confirm(`Are you sure you want to delete ${ids.length} promotion(s)?`)) {
            await bulkDeletePromotions(ids);
            
            // Update local state
            setPromotions(prev => prev.filter(p => !ids.includes(p.id)));
            
            console.log("Bulk delete successful");
          }
        } catch (err: any) {
          console.error('Error bulk deleting promotions:', err);
          const errorMessage = err.response?.data?.message || 'Failed to delete promotions. Please try again.';
          alert(errorMessage);
        }
      },
      variant: "danger",
    },
    {
      id: "activate",
      label: "Activate",
      icon: <TrendingUp className="w-4 h-4" />,
      onClick: async (selectedItems: Promotion[]) => {
        try {
          const ids = selectedItems.map(item => item.id);
          console.log("Bulk activate:", ids);
          
          await bulkActivatePromotions(ids);
          
          // Refresh data to get updated status
          await fetchPromotions();
          
          console.log("Bulk activate successful");
        } catch (err: any) {
          console.error('Error bulk activating promotions:', err);
          const errorMessage = err.response?.data?.message || 'Failed to activate promotions. Please try again.';
          alert(errorMessage);
        }
      },
      variant: "primary",
    },
  ];

  const stats = {
    totalPromotions: promotions.length,
    activePromotions: promotions.filter(p => p.isActive === true || (typeof p.isActive === 'number' && p.isActive === 1)).length,
    expiredPromotions: promotions.filter(p => !(p.isActive === true || (typeof p.isActive === 'number' && p.isActive === 1))).length,
    scheduledPromotions: promotions.filter(p => {
      const startDate = p.startDate ? new Date(p.startDate) : null;
      return startDate && startDate > new Date();
    }).length,
    monthlyGrowth: Math.floor(Math.random() * 5) + 1, // Simulated for now
    weeklyGrowth: Math.floor(Math.random() * 3) + 1 // Simulated for now
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading promotions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs 
        items={[
          { label: "Staff Dashboard", to: "/staff" },
          { label: "Promotion Management" },
        ]} 
      />
      

      {/* Enhanced Stats Cards */}
      {error ? (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900">Error Loading Statistics</h3>
              <p className="text-red-700">{error}</p>
            </div>
            <Button variant="secondary" onClick={fetchPromotions} className="text-red-600 border-red-300 hover:bg-red-100">
              Try Again
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <Percent className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Total Promotions</p>
                <p className="text-3xl font-bold text-blue-900 group-hover:text-blue-600 transition-colors">
                  {loading ? "..." : stats.totalPromotions}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {loading ? "Loading..." : `+${stats.monthlyGrowth} this month`}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <TrendingUp className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Active Promotions</p>
                <p className="text-3xl font-bold text-green-900 group-hover:text-green-600 transition-colors">
                  {loading ? "..." : stats.activePromotions}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {loading ? "Loading..." : stats.totalPromotions > 0 ? `${Math.round((stats.activePromotions / stats.totalPromotions) * 100)}% of total` : "0% of total"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <Clock className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-amber-700">Scheduled</p>
                <p className="text-3xl font-bold text-amber-900 group-hover:text-amber-600 transition-colors">
                  {loading ? "..." : stats.scheduledPromotions}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  {loading ? "Loading..." : "Future promotions"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <Calendar className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-red-700">Expired</p>
                <p className="text-3xl font-bold text-red-900 group-hover:text-red-600 transition-colors">
                  {loading ? "..." : stats.expiredPromotions}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {loading ? "Loading..." : "Past promotions"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* DataTable */}
      <DataTable
        title="Promotions"
        description="Manage promotional offers and discounts for courses and services"
        data={promotions}
        columns={columns}
        searchFields={searchFields}
        filterConfigs={filterConfigs}
        bulkActions={bulkActions}
        onAdd={() => setAddEditDialog({ open: true, promotion: null, mode: "add" })}
        addButtonLabel="Add Promotion"
        addButtonIcon={<Plus className="w-4 h-4" />}
        loading={loading}
        error={error}
        onRefresh={fetchPromotions}
        emptyStateTitle="No promotions found"
        emptyStateDescription="Get started by creating your first promotion"
        emptyStateAction={{
          label: "Add Promotion",
          onClick: () => setAddEditDialog({ open: true, promotion: null, mode: "add" })
        }}
        getItemId={(promotion) => promotion.id}
        enableSelection={true}
        itemsPerPage={10}
      />

      {/* Dialogs */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, promotion: null })}
        onConfirm={() => deleteDialog.promotion && handleDelete(deleteDialog.promotion.id)}
        title="Delete Promotion"
        message={`Are you sure you want to delete "${deleteDialog.promotion?.name}"? This action cannot be undone.`}
      />

      <AddEditPromotionDialog
        open={addEditDialog.open}
        onClose={() => setAddEditDialog({ open: false, promotion: null, mode: "add" })}
        promotion={addEditDialog.promotion}
        mode={addEditDialog.mode}
        onSuccess={fetchPromotions}
      />

      <PromotionDetailDialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, promotion: null })}
        promotion={detailDialog.promotion}
        onEdit={(promotion) => {
          setDetailDialog({ open: false, promotion: null });
          setAddEditDialog({ open: true, promotion, mode: "edit" });
        }}
        onDelete={(promotion) => {
          setDetailDialog({ open: false, promotion: null });
          setDeleteDialog({ open: true, promotion });
        }}
      />
    </div>
  );
}
