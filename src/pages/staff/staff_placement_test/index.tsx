import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { Plus, FileText, Edit, Trash2, Search, Filter, Play, Power, PowerOff, Calendar } from 'lucide-react';
import {
  getAllPlacementTests,
  deletePlacementTest,
  togglePlacementTestStatus,
  type PlacementTest,
} from '@/api/placementTest.api';
import { useToast } from '@/hooks/useToast';
import PageHeader from '@/components/ui/PageHeader';
import Table from '@/components/ui/Table';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

export default function PlacementTestManagementPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [placementTests, setPlacementTests] = useState<PlacementTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [testToDelete, setTestToDelete] = useState<PlacementTest | null>(null);
  
  // Date range filter
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    loadPlacementTests();
  }, []);

  // Debounce search term - đợi 5 giây sau khi user ngừng gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const loadPlacementTests = async () => {
    try {
      setLoading(true);
      const response = await getAllPlacementTests();
      setPlacementTests(response.data || []);
    } catch (err: any) {
      showError(err?.response?.data || 'Failed to load placement tests');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!testToDelete) return;

    try {
      await deletePlacementTest(testToDelete.id);
      success('Placement test deleted successfully');
      setTestToDelete(null);
      loadPlacementTests();
    } catch (err: any) {
      showError(err?.response?.data || 'Failed to delete placement test');
    }
  };

  const handleToggleStatus = async (test: PlacementTest) => {
    try {
      const newStatus = !test.isDeleted; // Toggle: if currently disabled (isDeleted=true), enable it (isDisabled=false)
      await togglePlacementTestStatus(test.id, newStatus);
      success(`Placement test ${newStatus ? 'disabled' : 'enabled'} successfully`);
      loadPlacementTests();
    } catch (err: any) {
      showError(err?.response?.data || 'Failed to toggle placement test status');
    }
  };

  const filteredTests = placementTests.filter((test) => {
    // Date range filter
    if (startDate || endDate) {
      const testDate = new Date(test.createdAt);
      testDate.setHours(0, 0, 0, 0); // Reset time to start of day
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (testDate < start) return false;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day
        if (testDate > end) return false;
      }
    }
    
    // Search filter
    if (!debouncedSearchTerm.trim()) return true;
    
    const searchLower = debouncedSearchTerm.toLowerCase().trim();
    
    // Search by title
    if (test.title.toLowerCase().includes(searchLower)) return true;
    
    // Search by duration
    if (test.durationMinutes?.toString().includes(searchLower)) return true;
    
    // Search by questions count
    if ((test.questions?.length || 0).toString().includes(searchLower)) return true;
    
    // Search by status
    if (test.isDeleted && 'disabled'.includes(searchLower)) return true;
    if (!test.isDeleted && 'enabled'.includes(searchLower)) return true;
    
    // Search by created date
    const createdDate = new Date(test.createdAt).toLocaleDateString().toLowerCase();
    if (createdDate.includes(searchLower)) return true;
    
    return false;
  });

  const columns = [
    {
      header: 'Title',
      accessor: (test: PlacementTest) => (
        <div className="font-medium text-neutral-900">{test.title}</div>
      ),
    },
    {
      header: 'Duration',
      accessor: (test: PlacementTest) => (
        <div className="text-neutral-600">{test.durationMinutes} minutes</div>
      ),
    },
    {
      header: 'Questions',
      accessor: (test: PlacementTest) => (
        <div className="text-neutral-600">{test.questions?.length || 0} questions</div>
      ),
    },
    {
      header: 'Status',
      accessor: (test: PlacementTest) => (
        <div className="flex items-center gap-2">
          {test.isDeleted ? (
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
              Disabled
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
              Enabled
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Created At',
      accessor: (test: PlacementTest) => (
        <div className="text-neutral-600">
          {new Date(test.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (test: PlacementTest) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/staff/placement-test/try/${test.id}`)}
            className="p-2 text-green-600 hover:bg-green-50 rounded"
            title="Try Test"
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/staff/placement-test/edit/${test.id}`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(test)}
            className={`p-2 rounded ${
              test.isDeleted
                ? "text-green-600 hover:bg-green-50"
                : "text-orange-600 hover:bg-orange-50"
            }`}
            title={test.isDeleted ? "Enable Test" : "Disable Test"}
          >
            {test.isDeleted ? (
              <Power className="w-4 h-4" />
            ) : (
              <PowerOff className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setTestToDelete(test)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
      <PageHeader
        title="Placement Test Management"
        description="Manage placement tests for students"
      />

      <div className="flex justify-between items-center">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-1 max-w-4xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by title, duration, questions, status, date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          {/* Date Range Filter */}
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <label className="text-sm text-neutral-600">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                max={endDate || undefined}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-600">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                min={startDate || undefined}
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-300 transition-colors"
                title="Clear date range"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <Button
          onClick={() => navigate('/staff/placement-test/create')}
          iconLeft={<Plus className="w-4 h-4" />}
        >
          Create Placement Test
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-neutral-500">Loading placement tests...</div>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-neutral-300 rounded-lg">
          <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600 mb-2">No placement tests found</p>
          <p className="text-sm text-neutral-500 mb-4">
            {debouncedSearchTerm ? 'Try a different search term' : 'Create your first placement test'}
          </p>
          {!debouncedSearchTerm && (
            <Button
              onClick={() => navigate('/staff/placement-test/create')}
              iconLeft={<Plus className="w-4 h-4" />}
            >
              Create Placement Test
            </Button>
          )}
        </div>
      ) : (
        <Table data={filteredTests} columns={columns} />
      )}

      <ConfirmationDialog
        isOpen={!!testToDelete}
        onClose={() => setTestToDelete(null)}
        title="Delete Placement Test"
        message={`Are you sure you want to delete "${testToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        type="danger"
      />
    </div>
  );
}

