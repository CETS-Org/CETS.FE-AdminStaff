import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { 
  CreditCard, Search, Filter, ChevronLeft, ChevronRight,
  Calendar, DollarSign, User, Download
} from "lucide-react";
import type { Transaction, TransactionFilter } from "@/types/transaction.type";
import { transactionApi } from "@/api/transaction.api";

export default function AdminTransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  // Filter state
  const [filters, setFilters] = useState<TransactionFilter>({
    accountName: "",
    eventType: "",
    dateFrom: "",
    dateTo: "",
    minAmount: undefined,
    maxAmount: undefined,
  });

  const [tempFilters, setTempFilters] = useState(filters);

  const breadcrumbItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "Transactions", href: "/admin/transactions" },
  ];

  // Fetch transactions with pagination
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await transactionApi.getAllPaginated({
        ...filters,
        page: currentPage,
        pageSize: pageSize,
      });
      
      setTransactions(response.data);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTransactions();
  }, [currentPage, filters]);

  // Handle filter apply
  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(1); // Reset to first page when applying filters
  };

  // Handle filter reset
  const handleResetFilters = () => {
    const resetFilters: TransactionFilter = {
      accountName: "",
      eventType: "",
      dateFrom: "",
      dateTo: "",
      minAmount: undefined,
      maxAmount: undefined,
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    setCurrentPage(1);
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
    const badges: Record<string, { label: string; className: string }> = {
      'payment.success': { 
        label: 'Success', 
        className: 'bg-green-100 text-green-800 border-green-200',
      },
      'payment.failed': { 
        label: 'Failed', 
        className: 'bg-red-100 text-red-800 border-red-200',
      },
      'payment.pending': { 
        label: 'Pending', 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      },
      'payment.refund': { 
        label: 'Refund', 
        className: 'bg-blue-100 text-blue-800 border-blue-200',
      },
    };
    
    const badge = badges[eventType] || { 
      label: eventType, 
      className: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  // Handle export
  const handleExport = async () => {
    try {
      const blob = await transactionApi.exportTransactions(filters);
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

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title="Transaction Management"
        description="View and manage all payment transactions"
        icon={<CreditCard className="w-5 h-5 text-white" />}
      />

      {/* Filters Card */}
      <Card>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Account Name Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Account Name
              </label>
              <input
                type="text"
                placeholder="Search by account name..."
                value={tempFilters.accountName || ""}
                onChange={(e) => setTempFilters({ ...tempFilters, accountName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Event Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 inline mr-1" />
                Event Type
              </label>
              <select
                value={tempFilters.eventType || ""}
                onChange={(e) => setTempFilters({ ...tempFilters, eventType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="payment.success">Success</option>
                <option value="payment.failed">Failed</option>
                <option value="payment.pending">Pending</option>
                <option value="payment.refund">Refund</option>
              </select>
            </div>

            {/* Date From Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date From
              </label>
              <input
                type="date"
                value={tempFilters.dateFrom || ""}
                onChange={(e) => setTempFilters({ ...tempFilters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date To Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date To
              </label>
              <input
                type="date"
                value={tempFilters.dateTo || ""}
                onChange={(e) => setTempFilters({ ...tempFilters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Min Amount Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Min Amount
              </label>
              <input
                type="number"
                placeholder="0"
                value={tempFilters.minAmount || ""}
                onChange={(e) => setTempFilters({ ...tempFilters, minAmount: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Max Amount Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Max Amount
              </label>
              <input
                type="number"
                placeholder="999999999"
                value={tempFilters.maxAmount || ""}
                onChange={(e) => setTempFilters({ ...tempFilters, maxAmount: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handleApplyFilters}
              className="flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {transactions.length > 0 ? ((currentPage - 1) * pageSize + 1) : 0} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} transactions
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExport}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Transactions Table */}
      <Card>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <Button
              variant="primary"
              onClick={fetchTransactions}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Received At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Name
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEventTypeBadge(transaction.eventType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transaction.receivedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      {formatCurrency(transaction.paymentAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.createdByName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
