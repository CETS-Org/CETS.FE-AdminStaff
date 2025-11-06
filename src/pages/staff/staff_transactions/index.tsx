import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { type BulkAction, type FilterConfig } from "@/components/ui/DataTable";
import type { TableColumn } from "@/components/ui/Table";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { 
  CreditCard, Eye, Download, AlertCircle, CheckCircle, 
  XCircle, Clock, TrendingUp
} from "lucide-react";
import type { Transaction } from "@/types/transaction.type";
import { transactionApi } from "@/api/transaction.api";
import TransactionDetailDialog from "./components/TransactionDetailDialog";

export default function StaffTransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Statistics
  const [stats, setStats] = useState({
    totalAmount: 0,
    successCount: 0,
    failedCount: 0,
    pendingCount: 0,
  });

  const breadcrumbItems = [
    { label: "Dashboard", href: "/staff" },
    { label: "Transactions", href: "/staff/transactions" },
  ];

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionApi.getAll();
      setTransactions(data);
      
      // Calculate statistics
      const totalAmount = data.reduce((sum, t) => sum + t.paymentAmount, 0);
      const successCount = data.filter(t => t.eventType === 'payment.success').length;
      const failedCount = data.filter(t => t.eventType === 'payment.failed').length;
      const pendingCount = data.filter(t => t.eventType === 'payment.pending').length;
      
      setStats({ totalAmount, successCount, failedCount, pendingCount });
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTransactions();
  }, []);

  // Handle view transaction
  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailDialogOpen(true);
  };

  // Handle export
  const handleExport = async () => {
    try {
      const blob = await transactionApi.exportTransactions();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error exporting transactions:", err);
      alert("Failed to export transactions. Please try again.");
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get event type badge
  const getEventTypeBadge = (eventType: string) => {
    const badges: Record<string, { label: string; className: string; icon: ReactNode }> = {
      'payment.success': { 
        label: 'Success', 
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="w-3 h-3" />
      },
      'payment.failed': { 
        label: 'Failed', 
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className="w-3 h-3" />
      },
      'payment.pending': { 
        label: 'Pending', 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className="w-3 h-3" />
      },
      'payment.refund': { 
        label: 'Refund', 
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <TrendingUp className="w-3 h-3" />
      },
    };
    
    const badge = badges[eventType] || { 
      label: eventType, 
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: <AlertCircle className="w-3 h-3" />
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${badge.className}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  // Columns configuration
  const columns: TableColumn<Transaction>[] = [
    {
      header: "Transaction ID",
      accessor: (transaction) => (
        <div>
          <div className="font-mono text-sm text-gray-900 truncate max-w-[150px]" title={transaction.id}>
            {transaction.id.substring(0, 8)}...
          </div>
          <div className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</div>
        </div>
      ),
      className: "min-w-[180px]",
    },
    {
      header: "Course",
      accessor: (transaction) => (
        <div>
          <div className="font-medium text-gray-900">{transaction.courseName}</div>
          <div className="text-xs text-gray-500">{transaction.createdByName}</div>
        </div>
      ),
      className: "min-w-[200px]",
    },
    {
      header: "Amount",
      accessor: (transaction) => (
        <div className="font-semibold text-green-600">
          {formatCurrency(transaction.paymentAmount)}
        </div>
      ),
      className: "min-w-[150px]",
    },
    {
      header: "Gateway",
      accessor: (transaction) => (
        <div className="inline-flex px-2 py-1 rounded bg-blue-50 text-blue-700 text-sm font-medium">
          {transaction.gatewayName}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (transaction) => getEventTypeBadge(transaction.eventType),
    },
    {
      header: "Received At",
      accessor: (transaction) => (
        <div className="text-sm text-gray-600">
          {formatDate(transaction.receivedAt)}
        </div>
      ),
      className: "min-w-[150px]",
    },
    {
      header: "Actions",
      accessor: (transaction) => (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleViewTransaction(transaction)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: "w-[100px]",
    },
  ];

  // Filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      key: "eventType",
      label: "Event Type",
      options: [
        { label: "All Status", value: "all" },
        { label: "Success", value: "payment.success" },
        { label: "Failed", value: "payment.failed" },
        { label: "Pending", value: "payment.pending" },
        { label: "Refund", value: "payment.refund" },
      ],
    },
    {
      key: "gatewayName",
      label: "Payment Gateway",
      options: [
        { label: "All Gateways", value: "all" },
        ...Array.from(new Set(transactions.map(t => t.gatewayName))).map(gateway => ({
          label: gateway,
          value: gateway,
        })),
      ],
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<Transaction>[] = [
    {
      id: "export-selected",
      label: "Export Selected",
      icon: <Download className="w-4 h-4" />,
      onClick: (selectedTransactions) => {
        console.log("Exporting:", selectedTransactions);
        alert(`Exporting ${selectedTransactions.length} transactions`);
      },
      variant: "secondary",
    },
  ];

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title="Transactions Management"
        description="Monitor and manage payment transactions"
        icon={<CreditCard className="w-5 h-5 text-white" />}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Amount</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {formatCurrency(stats.totalAmount)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Successful</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{stats.successCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Failed</p>
              <p className="text-2xl font-bold text-red-700 mt-1">{stats.failedCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900">Error Loading Transactions</h3>
              <p className="text-red-700">{error}</p>
            </div>
            <Button 
              variant="secondary" 
              onClick={fetchTransactions} 
              className="text-red-600 border-red-300 hover:bg-red-100"
            >
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {/* DataTable */}
      <DataTable<Transaction>
        title="Payment Transactions"
        description="View and manage all payment webhook transactions"
        data={transactions}
        columns={columns}
        searchFields={['id', 'paymentID', 'courseName', 'createdByName', 'gatewayName']}
        filterConfigs={filterConfigs}
        bulkActions={bulkActions}
        addButtonLabel="Export All"
        addButtonIcon={<Download className="w-4 h-4" />}
        onAdd={handleExport}
        viewModes={["table"]}
        defaultViewMode="table"
        itemsPerPage={5}
        loading={loading}
        error={error}
        onRefresh={fetchTransactions}
        emptyStateTitle="No transactions found"
        emptyStateDescription="Transactions will appear here once payment webhooks are received"
        getItemId={(transaction) => transaction.id}
        enableSelection={true}
        className=""
        headerClassName=""
      />

      {/* Transaction Detail Dialog */}
      <TransactionDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        transaction={selectedTransaction}
      />
    </div>
  );
}

