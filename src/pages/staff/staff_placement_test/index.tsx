import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { Plus, FileText, Edit, Trash2, Search, Filter, PenTool } from 'lucide-react';
import {
  getAllPlacementTests,
  deletePlacementTest,
  type PlacementTest,
} from '@/api/placementTest.api';
import { useToast } from '@/hooks/useToast';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import CreatePlacementQuestionDialog from './components/CreatePlacementQuestionDialog';

export default function PlacementTestManagementPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [placementTests, setPlacementTests] = useState<PlacementTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [testToDelete, setTestToDelete] = useState<PlacementTest | null>(null);
  const [showCreateQuestionDialog, setShowCreateQuestionDialog] = useState(false);

  useEffect(() => {
    loadPlacementTests();
  }, []);

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

  const filteredTests = placementTests.filter((test) =>
    test.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (test: PlacementTest) => (
        <div className="font-medium text-neutral-900">{test.title}</div>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (test: PlacementTest) => (
        <div className="text-neutral-600">{test.durationMinutes} minutes</div>
      ),
    },
    {
      key: 'questions',
      label: 'Questions',
      render: (test: PlacementTest) => (
        <div className="text-neutral-600">{test.questions?.length || 0} questions</div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (test: PlacementTest) => (
        <div className="text-neutral-600">
          {new Date(test.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (test: PlacementTest) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/staff/placement-test/edit/${test.id}`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
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
    <div className="space-y-6">
      <PageHeader
        title="Placement Test Management"
        description="Manage placement tests for students"
      />

      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search placement tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowCreateQuestionDialog(true)}
            iconLeft={<PenTool className="w-4 h-4" />}
          >
            Create Question
          </Button>
          <Button
            onClick={() => navigate('/staff/placement-test/create')}
            iconLeft={<Plus className="w-4 h-4" />}
          >
            Create Placement Test
          </Button>
        </div>
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
            {searchTerm ? 'Try a different search term' : 'Create your first placement test'}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => navigate('/staff/placement-test/create')}
              iconLeft={<Plus className="w-4 h-4" />}
            >
              Create Placement Test
            </Button>
          )}
        </div>
      ) : (
        <DataTable data={filteredTests} columns={columns} />
      )}

      <ConfirmationDialog
        open={!!testToDelete}
        onOpenChange={(open) => !open && setTestToDelete(null)}
        title="Delete Placement Test"
        message={`Are you sure you want to delete "${testToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        variant="danger"
      />

      <CreatePlacementQuestionDialog
        open={showCreateQuestionDialog}
        onOpenChange={setShowCreateQuestionDialog}
        onSuccess={() => {
          // Optionally reload data or show success message
          success('Question created successfully');
        }}
      />
    </div>
  );
}

