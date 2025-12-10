// 'use client';

// import React, { useState, useMemo } from 'react';
// import { useRouter } from 'next/navigation';
// import { useQuery, useQueryClient } from '@tanstack/react-query';
// import DataGridWrapper from '../../_components/_data-grid/DataGridWrapper';
// import { useSupplierColumns } from '../../_components/_hooks/useSupplierColumns';
// import StatusFilter, { EmailStatusFilter } from '../../_components/_filters/StatusFilter';
// import DateRangeFilter from '../../_components/_filters/DateRangeFilter';
// import DeleteConfirmationModal from '../../_components/_modals/DeleteConfirmationModal';
// import ViewDetailsModal from '../../_components/_view-modal/ViewDetailsModal';

// interface BackendSupplier {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   userType: any;
//   supplierCategory: any;
//   address?: any;
//   isBlocked: boolean;
//   isEmailVerified: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// const SuppliersPage = () => {
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');
//   const [emailStatusFilter, setEmailStatusFilter] = useState(''); 
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [deletingSupplier, setDeletingSupplier] = useState<any>(null);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
//   const [updatingEmailVerification, setUpdatingEmailVerification] = useState<string | null>(null);
//   const [viewingSupplier, setViewingSupplier] = useState<any>(null);
//   const limit = 10;

//   // Fetch suppliers data
//   const { data: suppliersData, isLoading, error } = useQuery({
//     queryKey: ['suppliers', search, statusFilter, emailStatusFilter, startDate, endDate, currentPage],
//     queryFn: async () => {
//       const params = new URLSearchParams({
//         page: currentPage.toString(),
//         limit: limit.toString(),
//         ...(search && { search }),
//         ...(statusFilter && { isBlocked: statusFilter === 'inactive' ? 'true' : 'false' }),
//         ...(emailStatusFilter && { isEmailVerified: emailStatusFilter === 'verified' ? 'true' : 'false' }),
//         ...(startDate && { startDate }),
//         ...(endDate && { endDate }),
//       });

//       const response = await fetch(`http://localhost:5000/api/suppliers?${params}`);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       return data;
//     },
//   });

//   // Delete supplier function
//   const deleteSupplier = async (supplierId: string): Promise<void> => {
//     const response = await fetch(`http://localhost:5000/api/users/${supplierId}`, {
//       method: 'DELETE',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.message || `Failed to delete supplier: ${response.status}`);
//     }

//     const result = await response.json();
//     if (!result.success) {
//       throw new Error(result.message || 'Failed to delete supplier');
//     }
//   };

//   // Update supplier status
//   const updateSupplierStatus = async (supplierId: string, status: 'active' | 'inactive'): Promise<void> => {
//     setUpdatingStatus(supplierId);
    
//     try {
//       const response = await fetch(`http://localhost:5000/api/users/${supplierId}/status`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           isBlocked: status === 'inactive'
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `Failed to update status: ${response.status}`);
//       }

//       const result = await response.json();
//       if (!result.success) {
//         throw new Error(result.message || 'Failed to update status');
//       }

//       await queryClient.invalidateQueries({ 
//         queryKey: ['suppliers'], 
//         refetchType: 'active' 
//       });
//     } catch (error) {
//       console.error('Error updating status:', error);
//       alert(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       setUpdatingStatus(null);
//     }
//   };

//   // Update email verification status
//   const updateEmailVerification = async (supplierId: string, isEmailVerified: boolean): Promise<void> => {
//     setUpdatingEmailVerification(supplierId);
    
//     try {
//       const response = await fetch(`http://localhost:5000/api/users/${supplierId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ isEmailVerified }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `Failed to update email verification: ${response.status}`);
//       }

//       const result = await response.json();
//       if (!result.success) {
//         throw new Error(result.message || 'Failed to update email verification');
//       }

//       await queryClient.invalidateQueries({ 
//         queryKey: ['suppliers'], 
//         refetchType: 'active' 
//       });
//     } catch (error) {
//       console.error('Error updating email verification:', error);
//       alert(`Failed to update email verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       setUpdatingEmailVerification(null);
//     }
//   };

//   // Handle edit supplier
//   const handleEditSupplier = (supplier: any) => {
//     const editData = {
//       id: supplier.id,
//       firstName: supplier.firstName,
//       lastName: supplier.lastName,
//       email: supplier.email,
//       phoneNumber: supplier.phone,
//       userType: supplier.originalUserCategory?._id || supplier.originalUserCategory,
//       supplierCategory: supplier.originalSupplierCategory?._id || supplier.originalSupplierCategory,
//       address: supplier.originalAddress,
//       isBlocked: supplier.status === 'inactive',
//       isEmailVerified: supplier.isEmailVerified
//     };
    
//     router.push(`/supplier/view-suppliers/edit-supplier?id=${supplier.id}&data=${encodeURIComponent(JSON.stringify(editData))}`);
//   };

//   // Handle view supplier
//   const handleViewSupplier = (supplier: any) => {
//     setViewingSupplier(supplier);
//   };

//   // Handle delete supplier confirmation
//   const handleDeleteSupplier = async () => {
//     if (!deletingSupplier) return;
    
//     setIsDeleting(true);
//     try {
//       await deleteSupplier(deletingSupplier.id);
//       await queryClient.invalidateQueries({ 
//         queryKey: ['suppliers'], 
//         refetchType: 'active' 
//       });
//       setDeletingSupplier(null);
//     } catch (error) {
//       console.error('Error deleting supplier:', error);
//       alert(`Failed to delete supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   // Handle status change
//   const handleStatusChange = (supplier: any, status: 'active' | 'inactive') => {
//     updateSupplierStatus(supplier.id, status);
//   };

//   // Handle email verification change
//   const handleEmailVerificationChange = (supplier: any, isEmailVerified: boolean) => {
//     updateEmailVerification(supplier.id, isEmailVerified);
//   };

//   // Extract data from backend response
//   const suppliers: BackendSupplier[] = suppliersData?.data || [];
//   const totalSuppliers = suppliersData?.pagination?.totalItems || 0;

//   // Simple category name getters
//   const getUserCategoryName = (userType: any): string => {
//     if (!userType) return 'No Category';
//     if (typeof userType === 'string') return userType;
//     if (typeof userType === 'object') {
//       return userType.role || userType.name || 'No Category';
//     }
//     return 'No Category';
//   };

//   const getSupplierCategoryName = (supplierCategory: any): string => {
//     if (!supplierCategory) return 'No Category';
//     if (typeof supplierCategory === 'string') return supplierCategory;
//     if (typeof supplierCategory === 'object') {
//       return supplierCategory.name || 'No Category';
//     }
//     return 'No Category';
//   };

//   // Transform backend data to table format - FIXED with correct property names
//   const dataWithSerial = useMemo(() => {
//     return suppliers.map((supplier: BackendSupplier, index: number) => {
//       const displayName = `${supplier.firstName || ''} ${supplier.lastName || ''}`.trim() || 'No Name Provided';

//       const userCategoryName = getUserCategoryName(supplier.userType);
//       const supplierCategoryName = getSupplierCategoryName(supplier.supplierCategory);

//       return {
//         id: supplier._id,
//         serialNo: (currentPage - 1) * limit + (index + 1),
//         Name: displayName,
//         email: supplier.email,
//         phone: supplier.phoneNumber || 'Not provided',
//         // FIXED: Use 'category' instead of 'supplierCategory' to match your column definition
//         category: supplierCategoryName,
//         userRole: userCategoryName,
//         status: supplier.isBlocked ? 'inactive' : 'active',
//         address: supplier.address ? `${supplier.address.streetAddress || ''}, ${supplier.address.city || ''}`.trim() : 'No Address',
//         isEmailVerified: supplier.isEmailVerified,
//         createdAt: supplier.createdAt,
//         // Store original data for editing
//         firstName: supplier.firstName,
//         lastName: supplier.lastName,
//         originalUserCategory: supplier.userType,
//         originalSupplierCategory: supplier.supplierCategory,
//         originalAddress: supplier.address
//       };
//     });
//   }, [suppliers, currentPage, limit]);

//   const handleAddSupplier = () => {
//     router.push('/supplier/view-suppliers/add-supplier');
//   };

//   const columns = useSupplierColumns({
//     onEdit: handleEditSupplier,
//     onDelete: (supplier) => setDeletingSupplier(supplier),
//     onView: handleViewSupplier,
//     onStatusChange: handleStatusChange,
//     onEmailVerificationChange: handleEmailVerificationChange,

//   });

//   // Filters component
//   const SupplierFilters = 
//     <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
//       <StatusFilter
//         value={statusFilter}
//         onChange={setStatusFilter}
//         placeholder="All Status"
//       />
//       <EmailStatusFilter
//         value={emailStatusFilter}
//         onChange={setEmailStatusFilter}
//         placeholder="All Emails"
//       />
//       <DateRangeFilter
//         startDate={startDate}
//         endDate={endDate}
//         onStartDateChange={setStartDate}
//         onEndDateChange={setEndDate}
//       />
//       <button
//         onClick={() => {
//           setStatusFilter('');
//           setEmailStatusFilter('');
//           setStartDate('');
//           setEndDate('');
//           setSearch('');
//           setCurrentPage(1);
//         }}
//         className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//       >
//         Clear Filters
//       </button>
//     </div>
//   ;

//   // Add error handling
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
//     <div>
//       <DataGridWrapper
//         title="Suppliers Management"
//         description="Manage all suppliers in the system"
//         columns={columns}
//         data={dataWithSerial}
//         isLoading={isLoading}
//         totalRows={totalSuppliers}
//         rowsPerPage={limit}
//         currentPage={currentPage}
//         onPageChange={setCurrentPage}
//         isSearchEnabled={true}
//         searchState={search}
//         setSearchState={setSearch}
//         searchPlaceholder="Search suppliers by name, email..."
//         filtersComponent={SupplierFilters}
//         defaultFiltersExpanded={true}
//         hasAddButton={true}
//         addButtonText="Add Supplier"
//         addButtonOnClick={handleAddSupplier}
//         hasExportButton={true}
//         onExport={() => console.log('Export suppliers')}
//       />

//       {/* Delete Confirmation Modal for Suppliers */}
//       <DeleteConfirmationModal
//         isOpen={!!deletingSupplier}
//         onClose={() => !isDeleting && setDeletingSupplier(null)}
//         onConfirm={handleDeleteSupplier}
//         title="Delete Supplier"
//         message="Are you sure you want to delete this supplier? This action cannot be undone and all associated data will be permanently removed."
//         itemName={deletingSupplier?.Name}
//         isLoading={isDeleting}
//         type="supplier"
//       />

//       {/* View Details Modal */}
//       <ViewDetailsModal
//         isOpen={!!viewingSupplier}
//         onClose={() => setViewingSupplier(null)}
//         type="supplier"
//         data={viewingSupplier}
//       />
//     </div>
//   );
// };

// export default SuppliersPage;

















'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DataGridWrapper from '../../../../_components/_data-grid/DataGridWrapper';
import { useSupplierColumns } from '../../../../_components/_hooks/useSupplierColumns';
import StatusFilter, { EmailStatusFilter } from '../../../../_components/_filters/StatusFilter';
import DateRangeFilter from '../../../../_components/_filters/DateRangeFilter';
import DeleteConfirmationModal from '../../../../_components/_modals/DeleteConfirmationModal';
import ViewDetailsModal from '../../../../_components/_view-modal/ViewDetailsModal';
import { clientService } from '../../../../app/utils/api-client';
import { usePermissions } from '../../../../_components/contexts/PermissionContext';

// API Response interfaces
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}

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
  const { permissions } = usePermissions(); // GET PERMISSIONS FROM CONTEXT
  
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

  // DEBUG: Add debug logging for permissions
  useEffect(() => {
    console.log('🔍 DEBUG - Current permissions in SuppliersPage:', {
      permissions,
      isStaticAdmin: permissions.isStaticAdmin,
      suppliers_edit: permissions['suppliers.edit'],
      suppliers_delete: permissions['suppliers.delete'],
      suppliers_create: permissions['suppliers.create'],
      suppliers_view: permissions['suppliers.view'],
      allTruePermissions: Object.keys(permissions).filter(k => permissions[k])
    });
  }, [permissions]);

  // Helper function to check permissions
  const hasPermission = (permissionKey: string): boolean => {
    // If user is static admin, they have ALL permissions
    if (permissions.isStaticAdmin === true) {
      console.log(`✅ Static admin override for permission: ${permissionKey}`);
      return true;
    }
    
    // Check specific permission
    const hasPerm = permissions[permissionKey] === true;
    console.log(`🔍 Checking permission "${permissionKey}": ${hasPerm}`);
    return hasPerm;
  };

  // UPDATED: Fetch suppliers data using axios
  const { data: suppliersData, isLoading, error } = useQuery({
    queryKey: ['suppliers', search, statusFilter, emailStatusFilter, startDate, endDate, currentPage],
    queryFn: async (): Promise<BackendSupplier[]> => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter && { isBlocked: statusFilter === 'inactive' ? 'true' : 'false' }),
        ...(emailStatusFilter && { isEmailVerified: emailStatusFilter === 'verified' ? 'true' : 'false' }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      console.log('🔍 Fetching suppliers from:', `/suppliers?${params}`);
      
      try {
        const response = await clientService.get<ApiResponse<BackendSupplier[]>>(`/suppliers?${params}`);
        console.log('🚀 FULL API RESPONSE:', response);
        console.log('📊 Response data:', response.data);
        
        // Extract the data array from the API response
        const apiData = response.data as ApiResponse<BackendSupplier[]>;
        console.log('🔍 Response structure:', {
          success: apiData.success,
          message: apiData.message,
          data: apiData.data,
          pagination: apiData.pagination
        });
        
        return apiData.data;
      } catch (err) {
        console.error('❌ API Error:', err);
        throw err;
      }
    },
  });

  // UPDATED: Delete supplier function using axios
  const deleteSupplier = async (supplierId: string): Promise<void> => {
    const response = await clientService.delete<ApiResponse>(`/users/${supplierId}`);
    const result = response.data;
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete supplier');
    }
  };

  // UPDATED: Update supplier status using axios
  const updateSupplierStatus = async (supplierId: string, status: 'active' | 'inactive'): Promise<void> => {
    setUpdatingStatus(supplierId);
    
    try {
      const response = await clientService.patch<ApiResponse>(`/users/${supplierId}/status`, { 
        isBlocked: status === 'inactive'
      });

      const result = response.data;
      
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

  // UPDATED: Update email verification status using axios
  const updateEmailVerification = async (supplierId: string, isEmailVerified: boolean): Promise<void> => {
    setUpdatingEmailVerification(supplierId);
    
    try {
      const response = await clientService.put<ApiResponse>(`/users/${supplierId}`, { 
        isEmailVerified 
      });

      const result = response.data;
      
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

  // Handle edit supplier - Updated with permission helper
  const handleEditSupplier = (supplier: any) => {
    // Check if user has edit permission
    if (!hasPermission('suppliers.edit')) {
      alert('You do not have permission to edit suppliers');
      return;
    }
    
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

  // Handle delete supplier confirmation - Updated with permission helper
  const handleDeleteSupplier = async () => {
    if (!deletingSupplier) return;
    
    // Check if user has delete permission
    if (!hasPermission('suppliers.delete')) {
      alert('You do not have permission to delete suppliers');
      setDeletingSupplier(null);
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteSupplier(deletingSupplier.id);
      await queryClient.invalidateQueries({ 
        queryKey: ['suppliers'], 
        refetchType: 'active' 
      });
      setDeletingSupplier(null);
      console.log('✅ Supplier deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting supplier:', error);
      alert(`Failed to delete supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle status change - Updated with permission helper
  const handleStatusChange = (supplier: any, status: 'active' | 'inactive') => {
    // Check if user has edit permission
    if (!hasPermission('suppliers.edit')) {
      alert('You do not have permission to update supplier status');
      return;
    }
    updateSupplierStatus(supplier.id, status);
  };

  // Handle email verification change - Updated with permission helper
  const handleEmailVerificationChange = (supplier: any, isEmailVerified: boolean) => {
    // Check if user has edit permission
    if (!hasPermission('suppliers.edit')) {
      alert('You do not have permission to update email verification');
      return;
    }
    updateEmailVerification(supplier.id, isEmailVerified);
  };

  // FLEXIBLE: Extract suppliers based on actual API structure
  const suppliers: BackendSupplier[] = useMemo(() => {
    if (!suppliersData) {
      console.log('📭 No suppliersData available');
      return [];
    }
    
    console.log('🔧 Processing suppliersData:', suppliersData);
    
    // suppliersData should already be the array from our query function
    if (Array.isArray(suppliersData)) {
      console.log('📦 suppliersData is direct array');
      return suppliersData;
    }
    
    // If for some reason it's wrapped
    if (Array.isArray((suppliersData as any).data)) {
      console.log('📦 suppliersData.data is array');
      return (suppliersData as any).data;
    }
    
    console.log('❓ Unknown suppliersData structure:', suppliersData);
    return [];
  }, [suppliersData]);

  // FLEXIBLE: Extract total count
  const totalSuppliers = useMemo(() => {
    if (!suppliersData) {
      console.log('📭 No suppliersData for total count');
      return 0;
    }
    
    console.log('🔧 Calculating total from:', suppliersData);
    
    // If suppliersData is an array, return its length
    if (Array.isArray(suppliersData)) {
      console.log('📊 Using suppliersData array length:', suppliersData.length);
      return suppliersData.length;
    }
    
    // Check if there's pagination info
    if ((suppliersData as any).pagination?.totalItems) {
      return (suppliersData as any).pagination.totalItems;
    }
    
    console.log('📊 Fallback to suppliers length:', suppliers.length);
    return suppliers.length;
  }, [suppliersData, suppliers]);

  console.log('🎯 Final suppliers:', suppliers);
  console.log('🎯 Final suppliers length:', suppliers.length);
  console.log('🎯 Final totalSuppliers:', totalSuppliers);

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

  // Transform backend data to table format
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
        category: supplierCategoryName,
        userRole: userCategoryName,
        status: supplier.isBlocked ? 'inactive' : 'active',
        address: supplier.address ? `${supplier.address.streetAddress || ''}, ${supplier.address.city || ''}`.trim() : 'No Address',
        isEmailVerified: supplier.isEmailVerified,
        createdAt: supplier.createdAt,
        firstName: supplier.firstName,
        lastName: supplier.lastName,
        originalUserCategory: supplier.userType,
        originalSupplierCategory: supplier.supplierCategory,
        originalAddress: supplier.address
      };
    });
  }, [suppliers, currentPage, limit]);

  // Handle Add Supplier button click - Check permission before adding
  const handleAddSupplier = () => {
    // Check if user has create permission
    if (!hasPermission('suppliers.create')) {
      alert('You do not have permission to add suppliers');
      return;
    }
    router.push('/supplier/view-suppliers/add-supplier');
  };

  // Update columns with permission checks
  const columns = useSupplierColumns({
    onEdit: handleEditSupplier,
    onDelete: (supplier) => {
      // Check if user has delete permission
      if (!hasPermission('suppliers.delete')) {
        alert('You do not have permission to delete suppliers');
        return;
      }
      console.log('Delete supplier:', supplier);
      setDeletingSupplier(supplier);
    },
    onView: handleViewSupplier,
    onStatusChange: handleStatusChange,
    onEmailVerificationChange: handleEmailVerificationChange,
    // Pass permissions to the column hook
    permissions: permissions
  });

  // Filters component
  const SupplierFilters = 
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <StatusFilter
        value={statusFilter}
        onChange={setStatusFilter}
        placeholder="All Status"
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

  // Check if user has view permission for suppliers - Updated with permission helper
  if (!hasPermission('suppliers.view')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the suppliers management page.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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

  console.log('🎯 Rendering DataGridWrapper with:', {
    columns: columns?.length,
    data: dataWithSerial?.length,
    isLoading,
    totalRows: totalSuppliers
  });

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
        addButtonPermission="suppliers.create"
        hasExportButton={true}
        onExport={() => console.log('Export suppliers')}
        allPermissions={permissions}
        enableRowActions={true}
        editPermission="suppliers.edit"
        deletePermission="suppliers.delete"
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














































