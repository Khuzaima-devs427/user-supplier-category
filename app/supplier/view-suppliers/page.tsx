'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DataGridWrapper from '../../_components/_data-grid/DataGridWrapper';
import { useSupplierColumns } from '../../_components/_hooks/useSupplierColumns';
import StatusFilter, { EmailStatusFilter } from '../../_components/_filters/StatusFilter';
import DateRangeFilter from '../../_components/_filters/DateRangeFilter';
import DeleteConfirmationModal from '../../_components/_modals/DeleteConfirmationModal';
import ViewDetailsModal from '../../_components/_view-modal/ViewDetailsModal';

interface BackendSupplier {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userType: any;
  supplierCategory: any;
  address?: any;
  isBlocked: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

const SuppliersPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [emailStatusFilter, setEmailStatusFilter] = useState(''); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingSupplier, setDeletingSupplier] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [updatingEmailVerification, setUpdatingEmailVerification] = useState<string | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<any>(null);
  const limit = 10;

  // Fetch suppliers data
  const { data: suppliersData, isLoading, error } = useQuery({
    queryKey: ['suppliers', search, statusFilter, emailStatusFilter, startDate, endDate, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter && { isBlocked: statusFilter === 'inactive' ? 'true' : 'false' }),
        ...(emailStatusFilter && { isEmailVerified: emailStatusFilter === 'verified' ? 'true' : 'false' }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const response = await fetch(`http://localhost:5000/api/suppliers?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    },
  });

  // Delete supplier function
  const deleteSupplier = async (supplierId: string): Promise<void> => {
    const response = await fetch(`http://localhost:5000/api/users/${supplierId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete supplier: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete supplier');
    }
  };

  // Update supplier status
  const updateSupplierStatus = async (supplierId: string, status: 'active' | 'inactive'): Promise<void> => {
    setUpdatingStatus(supplierId);
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/${supplierId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          isBlocked: status === 'inactive'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to update status');
      }

      await queryClient.invalidateQueries({ 
        queryKey: ['suppliers'], 
        refetchType: 'active' 
      });
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Update email verification status
  const updateEmailVerification = async (supplierId: string, isEmailVerified: boolean): Promise<void> => {
    setUpdatingEmailVerification(supplierId);
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/${supplierId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isEmailVerified }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update email verification: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to update email verification');
      }

      await queryClient.invalidateQueries({ 
        queryKey: ['suppliers'], 
        refetchType: 'active' 
      });
    } catch (error) {
      console.error('Error updating email verification:', error);
      alert(`Failed to update email verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdatingEmailVerification(null);
    }
  };

  // Handle edit supplier
  const handleEditSupplier = (supplier: any) => {
    const editData = {
      id: supplier.id,
      firstName: supplier.firstName,
      lastName: supplier.lastName,
      email: supplier.email,
      phoneNumber: supplier.phone,
      userType: supplier.originalUserCategory?._id || supplier.originalUserCategory,
      supplierCategory: supplier.originalSupplierCategory?._id || supplier.originalSupplierCategory,
      address: supplier.originalAddress,
      isBlocked: supplier.status === 'inactive',
      isEmailVerified: supplier.isEmailVerified
    };
    
    router.push(`/supplier/view-suppliers/edit-supplier?id=${supplier.id}&data=${encodeURIComponent(JSON.stringify(editData))}`);
  };

  // Handle view supplier
  const handleViewSupplier = (supplier: any) => {
    setViewingSupplier(supplier);
  };

  // Handle delete supplier confirmation
  const handleDeleteSupplier = async () => {
    if (!deletingSupplier) return;
    
    setIsDeleting(true);
    try {
      await deleteSupplier(deletingSupplier.id);
      await queryClient.invalidateQueries({ 
        queryKey: ['suppliers'], 
        refetchType: 'active' 
      });
      setDeletingSupplier(null);
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert(`Failed to delete supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle status change
  const handleStatusChange = (supplier: any, status: 'active' | 'inactive') => {
    updateSupplierStatus(supplier.id, status);
  };

  // Handle email verification change
  const handleEmailVerificationChange = (supplier: any, isEmailVerified: boolean) => {
    updateEmailVerification(supplier.id, isEmailVerified);
  };

  // Extract data from backend response
  const suppliers: BackendSupplier[] = suppliersData?.data || [];
  const totalSuppliers = suppliersData?.pagination?.totalItems || 0;

  // Simple category name getters
  const getUserCategoryName = (userType: any): string => {
    if (!userType) return 'No Category';
    if (typeof userType === 'string') return userType;
    if (typeof userType === 'object') {
      return userType.role || userType.name || 'No Category';
    }
    return 'No Category';
  };

  const getSupplierCategoryName = (supplierCategory: any): string => {
    if (!supplierCategory) return 'No Category';
    if (typeof supplierCategory === 'string') return supplierCategory;
    if (typeof supplierCategory === 'object') {
      return supplierCategory.name || 'No Category';
    }
    return 'No Category';
  };

  // Transform backend data to table format - FIXED with correct property names
  const dataWithSerial = useMemo(() => {
    return suppliers.map((supplier: BackendSupplier, index: number) => {
      const displayName = `${supplier.firstName || ''} ${supplier.lastName || ''}`.trim() || 'No Name Provided';

      const userCategoryName = getUserCategoryName(supplier.userType);
      const supplierCategoryName = getSupplierCategoryName(supplier.supplierCategory);

      return {
        id: supplier._id,
        serialNo: (currentPage - 1) * limit + (index + 1),
        Name: displayName,
        email: supplier.email,
        phone: supplier.phoneNumber || 'Not provided',
        // FIXED: Use 'category' instead of 'supplierCategory' to match your column definition
        category: supplierCategoryName,
        userRole: userCategoryName,
        status: supplier.isBlocked ? 'inactive' : 'active',
        address: supplier.address ? `${supplier.address.streetAddress || ''}, ${supplier.address.city || ''}`.trim() : 'No Address',
        isEmailVerified: supplier.isEmailVerified,
        createdAt: supplier.createdAt,
        // Store original data for editing
        firstName: supplier.firstName,
        lastName: supplier.lastName,
        originalUserCategory: supplier.userType,
        originalSupplierCategory: supplier.supplierCategory,
        originalAddress: supplier.address
      };
    });
  }, [suppliers, currentPage, limit]);

  const handleAddSupplier = () => {
    router.push('/supplier/view-suppliers/add-supplier');
  };

  const columns = useSupplierColumns({
    onEdit: handleEditSupplier,
    onDelete: (supplier) => setDeletingSupplier(supplier),
    onView: handleViewSupplier,
    onStatusChange: handleStatusChange,
    onEmailVerificationChange: handleEmailVerificationChange,

  });

  // Filters component
  const SupplierFilters = 
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <StatusFilter
        value={statusFilter}
        onChange={setStatusFilter}
        placeholder="Filter by status"
      />
      <EmailStatusFilter
        value={emailStatusFilter}
        onChange={setEmailStatusFilter}
        placeholder="All Emails"
      />
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      <button
        onClick={() => {
          setStatusFilter('');
          setEmailStatusFilter('');
          setStartDate('');
          setEndDate('');
          setSearch('');
          setCurrentPage(1);
        }}
        className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        Clear Filters
      </button>
    </div>
  ;

  // Add error handling
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-red-800">Error loading suppliers</h3>
          <p className="text-sm text-red-600 mt-1">{(error as Error).message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DataGridWrapper
        title="Suppliers Management"
        description="Manage all suppliers in the system"
        columns={columns}
        data={dataWithSerial}
        isLoading={isLoading}
        totalRows={totalSuppliers}
        rowsPerPage={limit}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isSearchEnabled={true}
        searchState={search}
        setSearchState={setSearch}
        searchPlaceholder="Search suppliers by name, email..."
        filtersComponent={SupplierFilters}
        defaultFiltersExpanded={true}
        hasAddButton={true}
        addButtonText="Add Supplier"
        addButtonOnClick={handleAddSupplier}
        hasExportButton={true}
        onExport={() => console.log('Export suppliers')}
      />

      {/* Delete Confirmation Modal for Suppliers */}
      <DeleteConfirmationModal
        isOpen={!!deletingSupplier}
        onClose={() => !isDeleting && setDeletingSupplier(null)}
        onConfirm={handleDeleteSupplier}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier? This action cannot be undone and all associated data will be permanently removed."
        itemName={deletingSupplier?.Name}
        isLoading={isDeleting}
        type="supplier"
      />

      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={!!viewingSupplier}
        onClose={() => setViewingSupplier(null)}
        type="supplier"
        data={viewingSupplier}
      />
    </div>
  );
};

export default SuppliersPage;




















































// 'use client';

// import React, { useState, useMemo } from 'react';
// import { useRouter } from 'next/navigation';
// import { useQuery, useQueryClient } from '@tanstack/react-query';

// const SuppliersPage = () => {
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const [search, setSearch] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [deletingSupplier, setDeletingSupplier] = useState<any>(null);
//   const limit = 10;

//   // Fetch suppliers data
//   const { data: suppliersData, isLoading, error } = useQuery({
//     queryKey: ['suppliers', search, currentPage],
//     queryFn: async () => {
//       const params = new URLSearchParams({
//         page: currentPage.toString(),
//         limit: limit.toString(),
//         ...(search && { search }),
//       });

//       const response = await fetch(`http://localhost:5000/api/suppliers?${params}`);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       return data;
//     },
//   });

//   // Simple columns that will definitely work
//   const columns = [
//     {
//       header: 'S.No',
//       accessorKey: 'serialNo',
//     },
//     {
//       header: 'NAME',
//       accessorKey: 'name',
//     },
//     {
//       header: 'EMAIL', 
//       accessorKey: 'email',
//     },
//     {
//       header: 'CATEGORY',
//       accessorKey: 'category',
//     },
//     {
//       header: 'USER ROLE',
//       accessorKey: 'userRole', 
//     },
//     {
//       header: 'STATUS',
//       accessorKey: 'status',
//     },
//     {
//       header: 'EMAIL VERIFICATION',
//       accessorKey: 'emailVerification',
//     },
//     {
//       header: 'CREATED AT',
//       accessorKey: 'createdAt',
//     },
//     {
//       header: 'ACTIONS',
//       cell: ({ row }: any) => (
//         <div className="flex gap-2">
//           <button 
//             onClick={() => router.push(`/supplier/view-suppliers/edit-supplier?id=${row.original.id}`)}
//             className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
//           >
//             Edit
//           </button>
//           <button 
//             onClick={() => setDeletingSupplier(row.original)}
//             className="px-3 py-1 bg-red-500 text-white rounded text-sm"
//           >
//             Delete
//           </button>
//         </div>
//       ),
//     },
//   ];

//   // Transform data - SIMPLE AND DIRECT
//   const dataWithSerial = useMemo(() => {
//     const suppliers = suppliersData?.data || [];
    
//     return suppliers.map((supplier: any, index: number) => {
//       // Get category names directly
//       const supplierCategoryName = supplier.supplierCategory?.name || 'No Category';
//       const userRoleName = supplier.userType?.role || 'No Role';

//       return {
//         id: supplier._id,
//         serialNo: (currentPage - 1) * limit + (index + 1),
//         name: `${supplier.firstName || ''} ${supplier.lastName || ''}`.trim(),
//         email: supplier.email,
//         category: supplierCategoryName, // This will show "PC"
//         userRole: userRoleName, // This will show "Mobile"
//         status: supplier.isBlocked ? 'Inactive' : 'Active',
//         emailVerification: supplier.isEmailVerified ? 'Verified' : 'Unverified',
//         createdAt: new Date(supplier.createdAt).toLocaleDateString(),
//       };
//     });
//   }, [suppliersData, currentPage, limit]);

//   const suppliers = suppliersData?.data || [];
//   const totalSuppliers = suppliersData?.pagination?.totalItems || 0;

//   if (error) {
//     return (
//       <div className="p-6">
//         <div className="bg-red-50 border border-red-200 rounded-md p-4">
//           <h3 className="text-sm font-medium text-red-800">Error loading suppliers</h3>
//           <p className="text-sm text-red-600 mt-1">{(error as Error).message}</p>
//           <button 
//             onClick={() => window.location.reload()}
//             className="mt-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">Suppliers Management</h1>
//         <p className="text-gray-600">Manage all suppliers in the system</p>
//       </div>

//       {/* Search and Add Button */}
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex gap-4">
//           <input
//             type="text"
//             placeholder="Search suppliers by name, email..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//         <button
//           onClick={() => router.push('/supplier/view-suppliers/add-supplier')}
//           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//         >
//           Add Supplier
//         </button>
//       </div>

//       {/* Debug Info */}
//       {suppliers.length > 0 && (
//         <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
//           <p className="text-sm text-green-800">
//             <strong>Debug:</strong> First supplier category: "{suppliers[0].supplierCategory?.name}" | User role: "{suppliers[0].userType?.role}"
//           </p>
//         </div>
//       )}

//       {/* Table */}
//       <div className="bg-white rounded-lg shadow">
//         <div className="overflow-x-auto">
//           <table className="min-w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 {columns.map((column) => (
//                   <th 
//                     key={column.header}
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                   >
//                     {column.header}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {isLoading ? (
//                 <tr>
//                   <td colSpan={columns.length} className="px-6 py-4 text-center">
//                     Loading...
//                   </td>
//                 </tr>
//               ) : dataWithSerial.length === 0 ? (
//                 <tr>
//                   <td colSpan={columns.length} className="px-6 py-4 text-center">
//                     No suppliers found
//                   </td>
//                 </tr>
//               ) : (
//                 dataWithSerial.map((row: any) => (
//                   <tr key={row.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {row.serialNo}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {row.name}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {row.email}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {row.category}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {row.userRole}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-2 py-1 text-xs rounded-full ${
//                         row.status === 'Active' 
//                           ? 'bg-green-100 text-green-800' 
//                           : 'bg-red-100 text-red-800'
//                       }`}>
//                         {row.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-2 py-1 text-xs rounded-full ${
//                         row.emailVerification === 'Verified' 
//                           ? 'bg-blue-100 text-blue-800' 
//                           : 'bg-yellow-100 text-yellow-800'
//                       }`}>
//                         {row.emailVerification}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {row.createdAt}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <div className="flex gap-2">
//                         <button 
//                           onClick={() => router.push(`/supplier/view-suppliers/edit-supplier?id=${row.id}`)}
//                           className="text-blue-600 hover:text-blue-900"
//                         >
//                           Edit
//                         </button>
//                         <button 
//                           onClick={() => setDeletingSupplier(row)}
//                           className="text-red-600 hover:text-red-900"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
//           <div className="flex justify-between items-center">
//             <div className="text-sm text-gray-700">
//               Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalSuppliers)} of {totalSuppliers} results
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                 disabled={currentPage === 1}
//                 className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
//               >
//                 Previous
//               </button>
//               <button
//                 onClick={() => setCurrentPage(prev => prev + 1)}
//                 disabled={currentPage * limit >= totalSuppliers}
//                 className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SuppliersPage;