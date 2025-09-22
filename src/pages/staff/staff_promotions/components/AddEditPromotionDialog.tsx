import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Loader2, AlertCircle } from "lucide-react";
import type { Promotion, PromotionType } from "@/types/promotion.type";

interface Props {
  open: boolean;
  onClose: () => void;
  promotion: Promotion | null;
  mode: "add" | "edit";
  onSuccess: () => void;
}

// Mock promotion types - replace with actual API call
const mockPromotionTypes: PromotionType[] = [
  { id: "type1", name: "Seasonal Discount", description: "Seasonal promotional offers", isActive: true },
  { id: "type2", name: "Student Discount", description: "Discounts for new students", isActive: true },
  { id: "type3", name: "Early Bird", description: "Early registration discounts", isActive: true },
  { id: "type4", name: "Loyalty Discount", description: "Discounts for returning customers", isActive: true },
];

export default function AddEditPromotionDialog({ open, onClose, promotion, mode, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promotionTypes, setPromotionTypes] = useState<PromotionType[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    promotionTypeID: "",
    code: "",
    name: "",
    percentOff: "",
    amountOff: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    isActive: true,
  });

  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");

  useEffect(() => {
    if (open) {
      // Load promotion types
      setPromotionTypes(mockPromotionTypes);
      
      if (mode === "edit" && promotion) {
        setFormData({
          promotionTypeID: promotion.promotionTypeID,
          code: promotion.code,
          name: promotion.name,
          percentOff: promotion.percentOff?.toString() || "",
          amountOff: promotion.amountOff?.toString() || "",
          startDate: promotion.startDate ? new Date(promotion.startDate) : undefined,
          endDate: promotion.endDate ? new Date(promotion.endDate) : undefined,
          isActive: promotion.isActive,
        });
        setDiscountType(promotion.percentOff ? "percentage" : "amount");
      } else {
        setFormData({
          promotionTypeID: "",
          code: "",
          name: "",
          percentOff: "",
          amountOff: "",
          startDate: undefined,
          endDate: undefined,
          isActive: true,
        });
        setDiscountType("percentage");
      }
      setError(null);
    }
  }, [open, mode, promotion]);

  const validateForm = () => {
    if (!formData.code.trim()) return "Promotion code is required";
    if (!formData.name.trim()) return "Promotion name is required";
    if (!formData.promotionTypeID) return "Promotion type is required";
    
    if (discountType === "percentage") {
      const percentOff = parseFloat(formData.percentOff);
      if (isNaN(percentOff) || percentOff <= 0 || percentOff > 100) {
        return "Percentage off must be between 1 and 100";
      }
    } else {
      const amountOff = parseFloat(formData.amountOff);
      if (isNaN(amountOff) || amountOff <= 0) {
        return "Amount off must be greater than 0";
      }
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      return "End date must be after start date";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Replace with actual API call - would normally send the request data
      // const requestData = {
      //   ...(mode === "edit" && promotion ? { id: promotion.id } : {}),
      //   promotionTypeID: formData.promotionTypeID,
      //   code: formData.code.trim(),
      //   name: formData.name.trim(),
      //   percentOff: discountType === "percentage" ? parseFloat(formData.percentOff) : null,
      //   amountOff: discountType === "amount" ? parseFloat(formData.amountOff) : null,
      //   startDate: formData.startDate ? formData.startDate.toISOString().split('T')[0] : null,
      //   endDate: formData.endDate ? formData.endDate.toISOString().split('T')[0] : null,
      //   isActive: formData.isActive,
      // };

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${mode} promotion`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto ">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Promotion" : "Edit Promotion"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-8">
          {error && (
            <div className="flex items-center gap-2 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Input
                label="Promotion Code *"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder="e.g., SUMMER2024"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="space-y-2">
              <Select
                label="Promotion Type *"
                value={formData.promotionTypeID}
                onChange={(e) => handleInputChange("promotionTypeID", e.target.value)}
                options={[
                  { value: "", label: "Select promotion type" },
                  ...promotionTypes.map(type => ({ value: type.id, label: type.name }))
                ]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Input
              label="Promotion Name *"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Summer Sale 2024"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Discount Type *</label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="percentage"
                  name="discountType"
                  checked={discountType === "percentage"}
                  onChange={() => setDiscountType("percentage")}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="percentage" className="text-sm text-gray-700">Percentage Off</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="amount"
                  name="discountType"
                  checked={discountType === "amount"}
                  onChange={() => setDiscountType("amount")}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="amount" className="text-sm text-gray-700">Fixed Amount Off</label>
              </div>
            </div>

            {discountType === "percentage" ? (
              <div className="space-y-2">
                <Input
                  label="Percentage Off (%) *"
                  type="number"
                  min="1"
                  max="100"
                  step="0.01"
                  value={formData.percentOff}
                  onChange={(e) => handleInputChange("percentOff", e.target.value)}
                  placeholder="e.g., 20"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  label="Amount Off ($) *"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amountOff}
                  onChange={(e) => handleInputChange("amountOff", e.target.value)}
                  placeholder="e.g., 50.00"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Input
                label="Start Date"
                type="date"
                value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange("startDate", e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>

            <div className="space-y-2">
              <Input
                label="End Date"
                type="date"
                value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange("endDate", e.target.value ? new Date(e.target.value) : undefined)}
                min={formData.startDate ? formData.startDate.toISOString().split('T')[0] : undefined}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange("isActive", e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">Active Promotion</label>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "add" ? "Create Promotion" : "Update Promotion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
