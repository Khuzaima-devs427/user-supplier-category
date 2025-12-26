

// // _components/_data-grid/DataGridWrapper.tsx
// import React, { ReactNode, useState } from 'react';
// import DataGrid from './DataGrid';
// import { usePermissions } from '../contexts/PermissionContext';

// interface DataGridWrapperProps<T> {
//   title: string;
//   description: string;
//   columns: any[];
//   data: T[];
//   isLoading?: boolean;
//   totalRows?: number;
//   rowsPerPage?: number;
//   currentPage?: number;
//   onPageChange?: (page: number) => void;
  
//   // Search
//   isSearchEnabled?: boolean;
//   searchState?: string;
//   setSearchState?: (search: string) => void;
//   searchPlaceholder?: string;
  
//   // Filters
//   filtersComponent?: ReactNode;
//   defaultFiltersExpanded?: boolean;
  
//   // Actions
//   hasAddButton?: boolean;
//   addButtonOnClick?: () => void;
//   addButtonText?: string;
//   addButtonPermission?: string;
  
//   // Export/Import
//   hasExportButton?: boolean;
//   exportButtonPermission?: string;
//   onExport?: () => void;
//   hasImportButton?: boolean;
//   importButtonPermission?: string;
//   onImport?: () => void;
  
//   // Permissions
//   allPermissions?: { [key: string]: boolean };
  
//   // Selection
//   // onSelectedRowsChange?: (selected: { allSelected: boolean; selectedCount: number; selectedRows: T[] }) => void;
  
//   // Custom actions
//   customActions?: ReactNode;
  
//   // Row actions
//   enableRowActions?: boolean;
//   onEdit?: (row: T) => void;
//   onDelete?: (row: T) => void;
//   editPermission?: string;
//   deletePermission?: string;
  
//   // Bulk actions
// //   enableBulkActions?: boolean;
// //   onBulkDelete?: (selectedRows: T[]) => void;
// //   bulkDeletePermission?: string;
// }

// const DataGridWrapper = <T,>({
//   title,
//   description,
//   columns,
//   data,
//   isLoading = false,
//   totalRows = 0,
//   rowsPerPage = 10,
//   currentPage = 1,
//   onPageChange,
//   isSearchEnabled = true,
//   searchState,
//   setSearchState,
//   searchPlaceholder = "Search...",
//   filtersComponent,
//   defaultFiltersExpanded = false,
//   hasAddButton = false,
//   addButtonOnClick,
//   addButtonText = "Add New",
//   addButtonPermission,
//   hasExportButton = false,
//   exportButtonPermission = 'export',
//   onExport,
//   hasImportButton = false,
//   importButtonPermission = 'import',
//   onImport,
//   allPermissions,
//   // onSelectedRowsChange,
//   customActions,
//   enableRowActions = false,
//   onEdit,
//   onDelete,
//   editPermission,
//   deletePermission,
//   // enableBulkActions = false,
//   // onBulkDelete,
//   // bulkDeletePermission
// }: DataGridWrapperProps<T>) => {
//   const [filtersExpanded, setFiltersExpanded] = useState(defaultFiltersExpanded);
//   const [selectedRows, setSelectedRows] = useState<T[]>([]);
  
//   // Use permissions from context if not provided explicitly
//   const { permissions: contextPermissions } = usePermissions();
  
//   // Use provided permissions or fall back to context permissions
//   const effectivePermissions = allPermissions || contextPermissions;

//   /**
//    * Check if user has specific permission
//    * @param permission - The permission key (e.g., 'users.create')
//    * @returns boolean
//    */
//   const hasPermission = (permission: string | undefined): boolean => {
//     if (!permission) return true; // No permission required
    
//     // If user is static admin, they have ALL permissions
//     if (effectivePermissions && effectivePermissions.isStaticAdmin === true) {
//       console.log(`✅ DataGridWrapper: Static admin override for permission: ${permission}`);
//       return true;
//     }
    
//     // Check in effective permissions
//     if (effectivePermissions && effectivePermissions[permission] === true) {
//       return true;
//     }
    
//     // Alternative: If permissions is an array of strings
//     if (Array.isArray(effectivePermissions) && effectivePermissions.includes(permission)) {
//       return true;
//     }
    
//     console.log(`❌ DataGridWrapper: No permission for: ${permission}`);
//     return false;
//   };

//   /**
//    * Check if user has ANY of the given permissions
//    * @param permissions - Array of permission keys
//    * @returns boolean
//    */
//   const hasAnyPermission = (permissions: string[]): boolean => {
//     return permissions.some(permission => hasPermission(permission));
//   };

//   /**
//    * Check if user has ALL of the given permissions
//    * @param permissions - Array of permission keys
//    * @returns boolean
//    */
//   const hasAllPermissions = (permissions: string[]): boolean => {
//     return permissions.every(permission => hasPermission(permission));
//   };

//   // Handle row selection
//   // const handleSelectedRowsChange = (selected: { allSelected: boolean; selectedCount: number; selectedRows: T[] }) => {
//   //   setSelectedRows(selected.selectedRows);
//   //   onSelectedRowsChange?.(selected);
//   // };

//   // Handle bulk delete
//   // const handleBulkDelete = () => {
//   //   if (onBulkDelete && selectedRows.length > 0) {
//   //     if (window.confirm(`Are you sure you want to delete ${selectedRows.length} item(s)?`)) {
//   //       onBulkDelete(selectedRows);
//   //     }
//   //   }
//   // };

//   // Add debug logging to see what permissions are available
//   console.log('🔍 DataGridWrapper permissions check:', {
//     hasEffectivePermissions: !!effectivePermissions,
//     isStaticAdmin: effectivePermissions?.isStaticAdmin,
//     addButtonPermission,
//     exportButtonPermission,
//     importButtonPermission,
//     editPermission,
//     deletePermission,
//     allTruePermissions: effectivePermissions ? Object.keys(effectivePermissions).filter(k => effectivePermissions[k]) : []
//   });

//   // Add action columns if row actions are enabled
//   const enhancedColumns = [...columns];
  
//   // if (enableRowActions) {
//   //   enhancedColumns.push({
//   //     name: 'Actions',
//   //     cell: (row: T) => (
//   //       <div className="flex space-x-2">
//   //         {onEdit && hasPermission(editPermission) && (
//   //           <button
//   //             onClick={() => onEdit(row)}
//   //             className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
//   //             title="Edit"
//   //           >
//   //             Edit
//   //           </button>
//   //         )}
//   //         {onDelete && hasPermission(deletePermission) && (
//   //           <button
//   //             onClick={() => onDelete(row)}
//   //             className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
//   //             title="Delete"
//   //           >
//   //             Delete
//   //           </button>
//   //         )}
//   //       </div>
//   //     ),
//   //     ignoreRowClick: true,
//   //     allowOverflow: true,
//   //   });
//   // }

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen w-full">
//       {/* Header Section */}
//       <div className="mb-6">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//           <div className="mb-4 sm:mb-0">
//             <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
//             <p className="text-gray-600 mt-1">{description}</p>
//           </div>
          
//           <div className="flex flex-wrap gap-2">
//             {/* Bulk Actions */}
//             {/* {enableBulkActions && selectedRows.length > 0 && hasPermission(bulkDeletePermission) && (
//               <div className="flex items-center gap-2 mr-4">
//                 <span className="text-sm text-gray-600">
//                   {selectedRows.length} selected
//                 </span>
//                 <button
//                   onClick={handleBulkDelete}
//                   className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
//                 >
//                   Delete Selected
//                 </button>
//               </div>
//             )}
//              */}
//             {customActions}
            
//             {hasExportButton && hasPermission(exportButtonPermission) && (
//               <button
//                 onClick={onExport}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 Export
//               </button>
//             )}
            
//             {hasImportButton && hasPermission(importButtonPermission) && (
//               <button
//                 onClick={onImport}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 Import
//               </button>
//             )}
            
//             {hasAddButton && hasPermission(addButtonPermission) && (
//               <button
//                 onClick={addButtonOnClick}
//                 className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//               >
//                 {addButtonText}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Search and Filters Section */}
//       <div className="bg-white rounded-lg shadow mb-6 w-full">
//         <div className="p-4 border-b border-gray-200">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
//             {isSearchEnabled && (
//               <div className="flex-1">
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <input
//                     type="text"
//                     value={searchState}
//                     onChange={(e) => setSearchState?.(e.target.value)}
//                     className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     placeholder={searchPlaceholder}
//                   />
//                 </div>
//               </div>
//             )}
            
//             {filtersComponent && (
//               <button
//                 onClick={() => setFiltersExpanded(!filtersExpanded)}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center gap-2 whitespace-nowrap"
//               >
//                 <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
//                 </svg>
//                 Filters
//                 <svg 
//                   className={`h-4 w-4 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`} 
//                   fill="none" 
//                   viewBox="0 0 24 24" 
//                   stroke="currentColor"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                 </svg>
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Expandable Filters */}
//         {filtersComponent && (
//           <div 
//             className={`border-b border-gray-200 bg-gray-50 transition-all duration-300 ease-in-out overflow-hidden ${
//               filtersExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
//             }`}
//           >
//             <div className="p-4">
//               {filtersComponent}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Data Grid */}
//       <div className="min-h-[400px] w-full">
//         <DataGrid
//           columns={enhancedColumns}
//           data={data}
//           isLoading={isLoading}
//           totalRows={totalRows}
//           rowsPerPage={rowsPerPage}
//           currentPage={currentPage}
//           onPageChange={onPageChange}
//           // onSelectedRowsChange={handleSelectedRowsChange}
//         />
//       </div>
//     </div>
//   );
// };

// export default DataGridWrapper;
















'use client';


import React, { ReactNode, useState, useEffect } from 'react';
import DataGrid from './DataGrid';
import { usePermissions } from '../contexts/PermissionContext';

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
  exportButtonPermission?: string;
  onExport?: () => void;
  hasImportButton?: boolean;
  importButtonPermission?: string;
  onImport?: () => void;
  
  // Permissions
  allPermissions?: { [key: string]: boolean };
  
  // Selection
  // onSelectedRowsChange?: (selected: { allSelected: boolean; selectedCount: number; selectedRows: T[] }) => void;
  
  // Custom actions
  customActions?: ReactNode;
  
  // Row actions
  enableRowActions?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  editPermission?: string;
  deletePermission?: string;
  
  // Bulk actions
//   enableBulkActions?: boolean;
//   onBulkDelete?: (selectedRows: T[]) => void;
//   bulkDeletePermission?: string;
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
  exportButtonPermission = 'export',
  onExport,
  hasImportButton = false,
  importButtonPermission = 'import',
  onImport,
  allPermissions,
  // onSelectedRowsChange,
  customActions,
  enableRowActions = false,
  onEdit,
  onDelete,
  editPermission,
  deletePermission,
  // enableBulkActions = false,
  // onBulkDelete,
  // bulkDeletePermission
}: DataGridWrapperProps<T>) => {
  const [filtersExpanded, setFiltersExpanded] = useState(defaultFiltersExpanded);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  
  // Use permissions from context if not provided explicitly
  const { permissions: contextPermissions } = usePermissions();
  
  // Use provided permissions or fall back to context permissions
  const effectivePermissions = allPermissions || contextPermissions;

  /**
   * Check if user has specific permission
   * @param permission - The permission key (e.g., 'users.create')
   * @returns boolean
   */
  const hasPermission = (permission: string | undefined): boolean => {
    if (!permission) return true; // No permission required
    
    // If user is static admin, they have ALL permissions
    if (effectivePermissions && effectivePermissions.isStaticAdmin === true) {
      // console.log(`✅ DataGridWrapper: Static admin override for permission: ${permission}`);
      return true;
    }
    
    // Check in effective permissions
    if (effectivePermissions && effectivePermissions[permission] === true) {
      return true;
    }
    
    // Alternative: If permissions is an array of strings
    if (Array.isArray(effectivePermissions) && effectivePermissions.includes(permission)) {
      return true;
    }
    
    // console.log(`❌ DataGridWrapper: No permission for: ${permission}`);
    return false;
  };

  /**
   * Check if user has ANY of the given permissions
   * @param permissions - Array of permission keys
   * @returns boolean
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  /**
   * Check if user has ALL of the given permissions
   * @param permissions - Array of permission keys
   * @returns boolean
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  // Handle row selection
  // const handleSelectedRowsChange = (selected: { allSelected: boolean; selectedCount: number; selectedRows: T[] }) => {
  //   setSelectedRows(selected.selectedRows);
  //   onSelectedRowsChange?.(selected);
  // };

  // Handle bulk delete
  // const handleBulkDelete = () => {
  //   if (onBulkDelete && selectedRows.length > 0) {
  //     if (window.confirm(`Are you sure you want to delete ${selectedRows.length} item(s)?`)) {
  //       onBulkDelete(selectedRows);
  //     }
  //   }
  // };

  // Add debug logging to see what permissions are available
  // console.log('🔍 DataGridWrapper permissions check:', {
  //   hasEffectivePermissions: !!effectivePermissions,
  //   isStaticAdmin: effectivePermissions?.isStaticAdmin,
  //   addButtonPermission,
  //   exportButtonPermission,
  //   importButtonPermission,
  //   editPermission,
  //   deletePermission,
  //   allTruePermissions: effectivePermissions ? Object.keys(effectivePermissions).filter(k => effectivePermissions[k]) : []
  // });


  useEffect(() => {
  console.log('🔍 DataGridWrapper permissions check:', {
    hasEffectivePermissions: !!effectivePermissions,
    isStaticAdmin: effectivePermissions?.isStaticAdmin,
    addButtonPermission,
    exportButtonPermission,
    importButtonPermission,
    editPermission,
    deletePermission,
    allTruePermissions: effectivePermissions ? Object.keys(effectivePermissions).filter(k => effectivePermissions[k]) : []
  });
}, [effectivePermissions, addButtonPermission, exportButtonPermission, importButtonPermission, editPermission, deletePermission]);

  // Add action columns if row actions are enabled
  const enhancedColumns = [...columns];


  return (
    <div className="p-6 bg-gray-50 min-h-screen w-full">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            
            {customActions}
            
            {hasExportButton && hasPermission(exportButtonPermission) && (
              <button
                onClick={onExport}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Export
              </button>
            )}
            
            {hasImportButton && hasPermission(importButtonPermission) && (
              <button
                onClick={onImport}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Import
              </button>
            )}
            
            {hasAddButton && hasPermission(addButtonPermission) && (
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
      <div className="bg-white rounded-lg shadow mb-6 w-full">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            {isSearchEnabled && (
              <div className="flex-1">
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
      <div className="min-h-[400px] w-full">
        <DataGrid
          columns={enhancedColumns}
          data={data}
          isLoading={isLoading}
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          currentPage={currentPage}
          onPageChange={onPageChange}
          // onSelectedRowsChange={handleSelectedRowsChange}
        />
      </div>
    </div>
  );
};

export default DataGridWrapper;