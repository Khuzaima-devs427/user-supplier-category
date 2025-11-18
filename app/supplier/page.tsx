'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DataGridWrapper from '../_components/_data-grid/DataGridWrapper';
import { useSupplierColumns } from '../_components/_hooks/useSupplierColumns';
import StatusFilter, { EmailStatusFilter } from '../_components/_filters/StatusFilter';
import DateRangeFilter from '../_components/_filters/DateRangeFilter';
import DeleteConfirmationModal from '../_components/_modals/DeleteConfirmationModal';

// Interface for backend response
interface BackendSupplier {
  id: string;
  Name?: {
    firstName: string;
    lastName: string;
  };
  email: string;
  phone: string;
  category: string;
  address?: {
    country: string;
    city: string;
    streetAddress: string;
    houseNumber: number;
    postalCode: number;
  };
  isActive: boolean;
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
  const limit = 10;

  // Fetch suppliers data
  const { data: suppliersData, isLoading, error } = useQuery({
    queryKey: ['suppliers', search, statusFilter, emailStatusFilter, startDate, endDate, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter && { isActive: statusFilter === 'active' ? 'true' : 'false' }),
        ...(emailStatusFilter && { isEmailVerified: emailStatusFilter === 'verified' ? 'true' : 'false' }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      console.log('Fetching from:', `http://localhost:5000/api/suppliers?${params}`);
      
      const response = await fetch(`http://localhost:5000/api/suppliers?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      return data;
    },
  });

  // Delete supplier function
  const deleteSupplier = async (supplierId: string): Promise<void> => {
    const response = await fetch(`http://localhost:5000/api/suppliers/${supplierId}`, {
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
      const response = await fetch(`http://localhost:5000/api/suppliers/${supplierId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to update status');
      }

      // Invalidate and refetch suppliers data
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      
      console.log(`Status updated to ${status} successfully`);
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
      const response = await fetch(`http://localhost:5000/api/suppliers/${supplierId}/email-verification`, {
        method: 'PATCH',
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

      // Invalidate and refetch suppliers data
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      
      console.log(`Email verification ${isEmailVerified ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      console.error('Error updating email verification:', error);
      alert(`Failed to update email verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdatingEmailVerification(null);
    }
  };

  // Handle edit supplier - navigates to edit page
  const handleEditSupplier = (supplier: any) => {
    router.push(`/supplier/edit-supplier?id=${supplier.id}`);
  };

  // Handle delete supplier confirmation
  const handleDeleteSupplier = async () => {
    if (!deletingSupplier) return;
    
    setIsDeleting(true);
    try {
      await deleteSupplier(deletingSupplier.id);
      
      // Invalidate and refetch suppliers data
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      
      // Close the modal
      setDeletingSupplier(null);
      
      // Show success message
      console.log('Supplier deleted successfully');
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

  console.log('Processed suppliers:', suppliers);

  // Transform backend data to table format
  const dataWithSerial = useMemo(() => {
    return suppliers.map((supplier: BackendSupplier, index: number) => {
      // Safe access to Name field with fallbacks
      const Name = supplier.Name 
        ? `${supplier.Name.firstName || ''} ${supplier.Name.lastName || ''}`.trim()
        : 'No Name Provided';

      // Safe access to address field with fallbacks
      const address = supplier.address 
        ? `${supplier.address.streetAddress || ''}, ${supplier.address.city || ''}, ${supplier.address.country || ''}`.trim()
        : 'No Address Provided';

      return {
        id: supplier.id,
        serialNo: (currentPage - 1) * limit + (index + 1),
        Name: Name,
        email: supplier.email,
        phone: supplier.phone,
        category: supplier.category,
        status: supplier.isActive ? 'active' : 'inactive',
        address: address,
        isActive: supplier.isActive,
        isEmailVerified: supplier.isEmailVerified,
        createdAt: supplier.createdAt,
        updatedAt: supplier.updatedAt
      };
    });
  }, [suppliers, currentPage, limit]);

  const handleAddSupplier = () => {
    router.push('/supplier/add-supplier');
  };

  const columns = useSupplierColumns({
    onEdit: handleEditSupplier,
    onDelete: (supplier) => {
      console.log('Delete supplier:', supplier);
      setDeletingSupplier(supplier);
    },
    onStatusChange: handleStatusChange,
    onEmailVerificationChange: handleEmailVerificationChange
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
    </div>
  );
};

export default SuppliersPage;









// 'use client';

// import React, { useState, useMemo } from 'react';
// import { useRouter } from 'next/navigation';
// import { useQuery, useQueryClient } from '@tanstack/react-query';
// import DataGridWrapper from '../_components/_data-grid/DataGridWrapper';
// import { useSupplierColumns } from '../_components/_hooks/useSupplierColumns';
// import StatusFilter, { EmailStatusFilter } from '../_components/_filters/StatusFilter';
// import DateRangeFilter from '../_components/_filters/DateRangeFilter';
// import DeleteConfirmationModal from '../_components/_modals/DeleteConfirmationModal';

// // Interface for backend response
// interface BackendSupplier {
//   id: string;
//   Name?: {
//     firstName: string;
//     lastName: string;
//   };
//   email: string;
//   phone: string;
//   category: string;
//   address?: {
//     country: string;
//     city: string;
//     streetAddress: string;
//     houseNumber: number;
//     postalCode: number;
//   };
//   isActive: boolean;
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
//   const limit = 10;

//   // Fetch suppliers data
//   const { data: suppliersData, isLoading, error } = useQuery({
//     queryKey: ['suppliers', search, statusFilter, emailStatusFilter, startDate, endDate, currentPage],
//     queryFn: async () => {
//       const params = new URLSearchParams({
//         page: currentPage.toString(),
//         limit: limit.toString(),
//         ...(search && { search }),
//         ...(statusFilter && { isActive: statusFilter === 'active' ? 'true' : 'false' }),
//         ...(emailStatusFilter && { isEmailVerified: emailStatusFilter === 'verified' ? 'true' : 'false' }),
//         ...(startDate && { startDate }),
//         ...(endDate && { endDate }),
//       });

//       console.log('Fetching from:', `http://localhost:5000/api/suppliers?${params}`);
      
//       const response = await fetch(`http://localhost:5000/api/suppliers?${params}`);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('API Response:', data);
//       return data;
//     },
//   });

//   // Delete supplier function
//   const deleteSupplier = async (supplierId: string): Promise<void> => {
//     const response = await fetch(`http://localhost:5000/api/suppliers/${supplierId}`, {
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


//   // Handle edit supplier - navigates to edit page
//   const handleEditSupplier = (supplier: any) => {
//     router.push(`/supplier/edit-supplier?id=${supplier.id}`);
//   };

//   // Handle delete supplier confirmation
//   const handleDeleteSupplier = async () => {
//     if (!deletingSupplier) return;
    
//     setIsDeleting(true);
//     try {
//       await deleteSupplier(deletingSupplier.id);
      
//       // Invalidate and refetch suppliers data
//       queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      
//       // Close the modal
//       setDeletingSupplier(null);
      
//       // Show success message
//       console.log('Supplier deleted successfully');
//     } catch (error) {
//       console.error('Error deleting supplier:', error);
//       alert(`Failed to delete supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   // Extract data from backend response
//   const suppliers: BackendSupplier[] = suppliersData?.data || [];
//   const totalSuppliers = suppliersData?.pagination?.totalItems || 0;

//   console.log('Processed suppliers:', suppliers);

//   // Transform backend data to table format
//   const dataWithSerial = useMemo(() => {
//     return suppliers.map((supplier: BackendSupplier, index: number) => {
//       // Safe access to Name field with fallbacks
//       const Name = supplier.Name 
//         ? `${supplier.Name.firstName || ''} ${supplier.Name.lastName || ''}`.trim()
//         : 'No Name Provided';

//       // Safe access to address field with fallbacks
//       const address = supplier.address 
//         ? `${supplier.address.streetAddress || ''}, ${supplier.address.city || ''}, ${supplier.address.country || ''}`.trim()
//         : 'No Address Provided';

//       return {
//         id: supplier.id,
//         serialNo: (currentPage - 1) * limit + (index + 1),
//         Name: Name,
//         email: supplier.email,
//         phone: supplier.phone,
//         category: supplier.category,
//         status: supplier.isActive ? 'active' : 'inactive',
//         address: address,
//         isActive: supplier.isActive,
//         isEmailVerified: supplier.isEmailVerified,
//         createdAt: supplier.createdAt,
//         updatedAt: supplier.updatedAt
//       };
//     });
//   }, [suppliers, currentPage, limit]);

//   const handleAddSupplier = () => {
//     router.push('/supplier/add-supplier');
//   };

// const columns = useSupplierColumns({
//   onEdit: handleEditSupplier,
//   onDelete: (supplier) => {
//     console.log('Delete supplier:', supplier);
//     setDeletingSupplier(supplier);
//   }
// });

//   // Filters component
//   const SupplierFilters = 
//     <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
//       <StatusFilter
//         value={statusFilter}
//         onChange={setStatusFilter}
//         placeholder="Filter by status"
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
//     <div className="p-6">
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
//     </div>
//   );
// };

// export default SuppliersPage;