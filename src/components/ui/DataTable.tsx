import { useState, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Table, { type TableColumn } from "@/components/ui/Table";
import Pagination from "@/shared/pagination";
import { 
  Search, Filter, X, Plus, Grid3X3, List, 
  CheckSquare, Square, RefreshCw, Loader2, AlertCircle
} from "lucide-react";

export type FilterConfig = {
  key: string;
  label: string;
  options: { label: string; value: string }[];
};

export type BulkAction<T> = {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: (selectedItems: T[]) => void;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
};

export type ViewMode = "table" | "card";

export type DataTableProps<T> = {
  title: string;
  description?: string;
  data: T[];
  columns: TableColumn<T>[];
  searchFields: (keyof T)[];
  filterConfigs?: FilterConfig[];
  bulkActions?: BulkAction<T>[];
  onAdd?: () => void;
  addButtonLabel?: string;
  addButtonIcon?: ReactNode;
  viewModes?: ViewMode[];
  defaultViewMode?: ViewMode;
  itemsPerPage?: number;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateAction?: {
    label: string;
    onClick: () => void;
  };
  renderCard?: (item: T, isSelected: boolean, onToggleSelect: () => void) => ReactNode;
  getItemId: (item: T) => string;
  enableSelection?: boolean;
  className?: string;
  headerClassName?: string;
};

export default function DataTable<T>({
  title,
  description,
  data,
  columns,
  searchFields,
  filterConfigs = [],
  bulkActions = [],
  onAdd,
  addButtonLabel = "Add Item",
  addButtonIcon = <Plus className="w-4 h-4" />,
  viewModes = ["table"],
  defaultViewMode = "table",
  itemsPerPage = 8,
  loading = false,
  error = null,
  onRefresh,
  emptyStateTitle = "No items found",
  emptyStateDescription = "Get started by creating your first item",
  emptyStateAction,
  renderCard,
  getItemId,
  enableSelection = false,
  className = "",
  headerClassName = "",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Initialize filters
  useEffect(() => {
    const initialFilters: Record<string, string> = {};
    filterConfigs.forEach(config => {
      initialFilters[config.key] = "all";
    });
    setFilters(initialFilters);
  }, [filterConfigs]);

  const filteredData = useMemo(() => {
    let filtered = data.filter((item) => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        searchFields.some(field => {
          const value = item[field];
          return typeof value === 'string' && 
                 value.toLowerCase().includes(searchTerm.toLowerCase());
        });

      // Custom filters
      const matchesFilters = filterConfigs.every(config => {
        const filterValue = filters[config.key];
        if (!filterValue || filterValue === "all") return true;
        
        const itemValue = item[config.key as keyof T];
        return itemValue === filterValue;
      });
      
      return matchesSearch && matchesFilters;
    });

    return filtered;
  }, [data, searchTerm, filters, searchFields, filterConfigs]);

  const currentData = useMemo(
    () => filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredData, currentPage, itemsPerPage]
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const clearFilters = () => {
    setSearchTerm("");
    const clearedFilters: Record<string, string> = {};
    filterConfigs.forEach(config => {
      clearedFilters[config.key] = "all";
    });
    setFilters(clearedFilters);
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedItems.length === currentData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentData.map(item => getItemId(item)));
    }
  };

  const getSelectedItemsData = () => {
    return data.filter(item => selectedItems.includes(getItemId(item)));
  };

  const activeFiltersCount = [
    searchTerm,
    ...Object.values(filters).filter(value => value !== "all")
  ].filter(item => item !== "").length;

  // Enhanced columns with selection if enabled
  const enhancedColumns = useMemo(() => {
    if (!enableSelection) return columns;

    const selectionColumn: TableColumn<T> = {
      header: (
        <button
          onClick={toggleAllSelection}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          {selectedItems.length === currentData.length && currentData.length > 0 ? (
            <CheckSquare className="w-4 h-4 text-primary-600" />
          ) : (
            <Square className="w-4 h-4 text-gray-400" />
          )}
        </button>
      ),
      className: "w-12",
      accessor: (item) => (
        <button
          onClick={() => toggleItemSelection(getItemId(item))}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          {selectedItems.includes(getItemId(item)) ? (
            <CheckSquare className="w-4 h-4 text-primary-600" />
          ) : (
            <Square className="w-4 h-4 text-gray-400" />
          )}
        </button>
      )
    };

    return [selectionColumn, ...columns];
  }, [columns, enableSelection, selectedItems, currentData, getItemId]);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 ${headerClassName}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              {description && (
                <p className="text-gray-600 mt-1">
                  {filteredData.length} item{filteredData.length !== 1 ? 's' : ''} found
                  {selectedItems.length > 0 && ` • ${selectedItems.length} selected`}
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Bulk Actions */}
              {enableSelection && selectedItems.length > 0 && bulkActions.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-700">
                    {selectedItems.length} selected
                  </span>
                  {bulkActions.map((action) => (
                    <Button
                      key={action.id}
                      variant={action.variant || "secondary"}
                      size="sm"
                      onClick={() => action.onClick(getSelectedItemsData())}
                      className={action.className}
                    >
                      {action.icon}
                    </Button>
                  ))}
                </div>
              )}
              
              {/* View Mode Toggle */}
              {viewModes.length > 1 && (
                <div className="flex border border-gray-200 rounded-lg bg-white">
                  {viewModes.includes("table") && (
                    <Button
                      variant={viewMode === "table" ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className="rounded-r-none"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  )}
                  {viewModes.includes("card") && (
                    <Button
                      variant={viewMode === "card" ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setViewMode("card")}
                      className="rounded-l-none"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
              
              {/* Add Button */}
              {onAdd && (
                <Button onClick={onAdd} className="whitespace-nowrap" iconLeft={addButtonIcon}>
                  {addButtonLabel}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Search and Filter Section */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {loading && (
                  <Loader2 className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {filterConfigs.length > 0 && (
                  <Button
                    variant="secondary"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`whitespace-nowrap transition-colors ${showFilters ? 'bg-primary-50 text-primary-700 border-primary-200' : ''}`}
                    iconLeft={<Filter className="w-4 h-4 mr-2" />}
                  >
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="bg-primary-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-2 min-w-[18px] text-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                )}
                
                {activeFiltersCount > 0 && (
                  <Button
                    variant="secondary"
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 whitespace-nowrap"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
                
                {onRefresh && (
                  <Button
                    variant="secondary"
                    onClick={onRefresh}
                    className="p-2"
                    title="Refresh"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {showFilters && filterConfigs.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filterConfigs.map((config) => (
                    <Select
                      key={config.key}
                      label={config.label}
                      value={filters[config.key] || "all"}
                      onChange={(e) => setFilters(prev => ({ ...prev, [config.key]: e.target.value }))}
                      options={config.options}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Content Area */}
          {loading ? (
            <div className="space-y-4">
              {viewMode === "table" ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-48"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-100 rounded w-full"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              {onRefresh && (
                <Button onClick={onRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyStateTitle}</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || activeFiltersCount > 0 
                  ? "Try adjusting your search or filters"
                  : emptyStateDescription
                }
              </p>
              {emptyStateAction && (
                <Button onClick={emptyStateAction.onClick} iconLeft={<Plus className="w-4 h-4" />}>
                  {emptyStateAction.label}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {viewMode === "table" ? (
                <>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <Table columns={enhancedColumns} data={currentData} />
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredData.length}
                    startIndex={(currentPage - 1) * itemsPerPage + 1}
                    endIndex={Math.min(currentPage * itemsPerPage, filteredData.length)}
                  />
                </>
              ) : (
                <>
                  {renderCard ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {currentData.map((item) => (
                        <div key={getItemId(item)}>
                          {renderCard(
                            item, 
                            selectedItems.includes(getItemId(item)), 
                            () => toggleItemSelection(getItemId(item))
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">Card view not implemented</p>
                    </div>
                  )}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredData.length}
                    startIndex={(currentPage - 1) * itemsPerPage + 1}
                    endIndex={Math.min(currentPage * itemsPerPage, filteredData.length)}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
