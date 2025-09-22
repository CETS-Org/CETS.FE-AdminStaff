import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Edit, Trash2, Percent, Calendar, User, Clock, Tag, TrendingUp } from "lucide-react";
import type { Promotion } from "@/types/promotion.type";

interface Props {
  open: boolean;
  onClose: () => void;
  promotion: Promotion | null;
  onEdit: (promotion: Promotion) => void;
  onDelete: (promotion: Promotion) => void;
}

export default function PromotionDetailDialog({ open, onClose, promotion, onEdit, onDelete }: Props) {
  if (!promotion) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No end date";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDiscountDisplay = () => {
    if (promotion.percentOff) {
      return `${promotion.percentOff}% off`;
    } else if (promotion.amountOff) {
      return `$${promotion.amountOff} off`;
    }
    return "No discount";
  };

  const getStatusInfo = () => {
    const now = new Date();
    const endDate = promotion.endDate ? new Date(promotion.endDate) : null;
    const startDate = promotion.startDate ? new Date(promotion.startDate) : null;
    
    if (!promotion.isActive) {
      return { status: "Inactive", color: "bg-gray-100 text-gray-800", description: "This promotion is currently disabled" };
    } else if (endDate && endDate < now) {
      return { status: "Expired", color: "bg-red-100 text-red-800", description: "This promotion has expired" };
    } else if (startDate && startDate > now) {
      return { status: "Scheduled", color: "bg-yellow-100 text-yellow-800", description: "This promotion will start in the future" };
    } else {
      return { status: "Active", color: "bg-green-100 text-green-800", description: "This promotion is currently active" };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto ">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Percent className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{promotion.name}</h3>
              <p className="text-sm text-gray-500">Code: {promotion.code}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Badge className={statusInfo.color}>
                  {statusInfo.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{statusInfo.description}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Discount:</span>
                <span className="text-green-600 font-semibold">{getDiscountDisplay()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Type:</span>
                <span>{promotion.promotionType?.name || 'Unknown'}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          {/* Duration Information */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Duration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Start Date</p>
                <p className="text-sm text-gray-600">
                  {promotion.startDate ? formatDate(promotion.startDate) : "No start date"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">End Date</p>
                <p className="text-sm text-gray-600">
                  {promotion.endDate ? formatDate(promotion.endDate) : "No end date"}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          {/* Promotion Type Details */}
          {promotion.promotionType && (
            <>
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Promotion Type Details
                </h4>
                <div className="pl-6 space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Name</p>
                    <p className="text-sm text-gray-600">{promotion.promotionType.name}</p>
                  </div>
                  {promotion.promotionType.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Description</p>
                      <p className="text-sm text-gray-600">{promotion.promotionType.description}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-gray-200 my-4"></div>
            </>
          )}

          {/* Audit Information */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Audit Information
            </h4>
            <div className="pl-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Created By</p>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">
                        {promotion.createdByNavigation?.fullName || 'Unknown'}
                      </p>
                      {promotion.createdByNavigation?.email && (
                        <p className="text-xs text-gray-500">
                          {promotion.createdByNavigation.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{formatDateTime(promotion.createdAt)}</p>
                </div>

                {promotion.updatedAt && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Last Updated By</p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">
                          {promotion.updatedByNavigation?.fullName || 'Unknown'}
                        </p>
                        {promotion.updatedByNavigation?.email && (
                          <p className="text-xs text-gray-500">
                            {promotion.updatedByNavigation.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{formatDateTime(promotion.updatedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="secondary"
            onClick={() => onEdit(promotion)}
            className="flex items-center gap-2"
            iconLeft={<Edit className="w-4 h-4" />}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() => onDelete(promotion)}
            className="flex items-center gap-2"
            iconLeft={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
