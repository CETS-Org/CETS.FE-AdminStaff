import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { CreditCard, Calendar, User, DollarSign, FileText, Package } from "lucide-react";
import type { Transaction, PayloadData } from "@/types/transaction.type";

interface TransactionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

export default function TransactionDetailDialog({
  open,
  onOpenChange,
  transaction,
}: TransactionDetailDialogProps) {
  if (!transaction) return null;

  let payloadData: PayloadData | null = null;
  try {
    payloadData = JSON.parse(transaction.payload) as PayloadData;
  } catch (e) {
    console.error("Failed to parse payload:", e);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getEventTypeBadge = (eventType: string) => {
    const colors: Record<string, string> = {
      'payment.success': 'bg-green-100 text-green-800 border-green-200',
      'payment.failed': 'bg-red-100 text-red-800 border-red-200',
      'payment.pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'payment.refund': 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[eventType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-semibold">Transaction Details</span>
              <p className="text-sm text-gray-500 font-normal">Payment Webhook Event</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="pt-2">
            <div className="space-y-6">
              {/* Status & Event Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Event Type</div>
                  <div className={`inline-flex px-3 py-1 rounded-full border text-sm font-medium ${getEventTypeBadge(transaction.eventType)}`}>
                    {transaction.eventType}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Gateway</div>
                  <div className="font-semibold text-gray-900">{transaction.gatewayName}</div>
                </div>
              </div>

              {/* Transaction Info */}
              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Transaction Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Transaction ID</div>
                    <div className="font-mono text-sm text-gray-900 break-all">{transaction.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Payment ID</div>
                    <div className="font-mono text-sm text-gray-900 break-all">{transaction.paymentID}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Event ID</div>
                    <div className="font-mono text-sm text-gray-900 break-all">{transaction.eventId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Gateway ID</div>
                    <div className="font-mono text-sm text-gray-900 break-all">{transaction.gatewayID}</div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border border-gray-200 rounded-lg p-5 bg-gradient-to-br from-green-50 to-emerald-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Payment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Amount</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(transaction.paymentAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Course Name</div>
                    <div className="font-semibold text-gray-900">{transaction.courseName}</div>
                  </div>
                </div>
              </div>

              {/* Payload Data */}
              {payloadData && (
                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    Payload Data
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Invoice ID</div>
                      <div className="font-mono text-sm text-gray-900 break-all">{payloadData.invoiceId}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Student ID</div>
                      <div className="font-mono text-sm text-gray-900 break-all">{payloadData.studentId}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Reservation Item ID</div>
                      <div className="font-mono text-sm text-gray-900 break-all">{payloadData.reservationItemId}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Status</div>
                      <div className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        payloadData.status === 'PAID' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {payloadData.status}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-600 mb-1">Payment Date</div>
                      <div className="text-sm text-gray-900">{formatDateTime(payloadData.paymentDate)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Timestamps
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Received At</div>
                    <div className="text-sm text-gray-900">{formatDateTime(transaction.receivedAt)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Created At</div>
                    <div className="text-sm text-gray-900">{formatDateTime(transaction.createdAt)}</div>
                  </div>
                </div>
              </div>

              {/* Creator Info */}
              <div className="border border-gray-200 rounded-lg p-5 bg-blue-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Created By
                </h3>
                <div className="text-gray-900 font-medium">{transaction.createdByName}</div>
              </div>
            </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

