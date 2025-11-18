import React, { ReactNode, useState } from 'react';
import DataGrid from './DataGrid';

interface DataGridWrapperProps<T> {
  title: string;
  description: string;
  columns: any[];
  data: T[];
  isLoading?: boolean;
  totalRows?: number;
  rowsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  
  // Search
  isSearchEnabled?: boolean;
  searchState?: string;
  setSearchState?: (search: string) => void;
  searchPlaceholder?: string;
  
  // Filters
  filtersComponent?: ReactNode;
  defaultFiltersExpanded?: boolean;
  
  // Actions
  hasAddButton?: boolean;
  addButtonOnClick?: () => void;
  addButtonText?: string;
  addButtonPermission?: string;
  
  // Export/Import
  hasExportButton?: boolean;
  onExport?: () => void;
  hasImportButton?: boolean;
  onImport?: () => void;
  
  // Permissions
  allPermissions?: string[];
  
  // Selection
  onSelectedRowsChange?: (selected: { allSelected: boolean; selectedCount: number; selectedRows: T[] }) => void;
  
  // Custom actions
  customActions?: ReactNode;
}

const DataGridWrapper = <T,>({
  title,
  description,
  columns,
  data,
  isLoading = false,
  totalRows = 0,
  rowsPerPage = 10,
  currentPage = 1,
  onPageChange,
  isSearchEnabled = true,
  searchState,
  setSearchState,
  searchPlaceholder = "Search...",
  filtersComponent,
  defaultFiltersExpanded = false,
  hasAddButton = false,
  addButtonOnClick,
  addButtonText = "Add New",
  addButtonPermission,
  hasExportButton = false,
  onExport,
  hasImportButton = false,
  onImport,
  allPermissions = [],
  onSelectedRowsChange,
  customActions
}: DataGridWrapperProps<T>) => {
  const [filtersExpanded, setFiltersExpanded] = useState(defaultFiltersExpanded);

  const hasPermission = (permission: string) => {
    return !permission || allPermissions.includes(permission);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen w-full"> {/* Added w-full here */}
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {customActions}
            
            {hasExportButton && (
              <button
                onClick={onExport}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Export
              </button>
            )}
            
            {hasImportButton && (
              <button
                onClick={onImport}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Import
              </button>
            )}
            
            {hasAddButton && hasPermission(addButtonPermission || '') && (
              <button
                onClick={addButtonOnClick}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {addButtonText}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="bg-white rounded-lg shadow mb-6 w-full"> {/* Added w-full here */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full"> {/* Added w-full here */}
            {isSearchEnabled && (
              <div className="flex-1"> {/* REMOVED max-w-md from here */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchState}
                    onChange={(e) => setSearchState?.(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={searchPlaceholder}
                  />
                </div>
              </div>
            )}
            
            {filtersComponent && (
              <button
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                <svg 
                  className={`h-4 w-4 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Expandable Filters */}
        {filtersComponent && (
          <div 
            className={`border-b border-gray-200 bg-gray-50 transition-all duration-300 ease-in-out overflow-hidden ${
              filtersExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-4">
              {filtersComponent}
            </div>
          </div>
        )}
      </div>

      {/* Data Grid */}
      <div className="min-h-[400px] w-full"> {/* Added w-full here */}
        <DataGrid
          columns={columns}
          data={data}
          isLoading={isLoading}
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          currentPage={currentPage}
          onPageChange={onPageChange}
          onSelectedRowsChange={onSelectedRowsChange}
        />
      </div>
    </div>
  );
};

export default DataGridWrapper;