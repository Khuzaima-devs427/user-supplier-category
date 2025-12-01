// app/supplier/supplier-categories/page.tsx
// 'use client';

// import React, { useState, useMemo } from 'react';
// import { useRouter } from 'next/navigation';
// import { useQuery, useQueryClient } from '@tanstack/react-query';
// import DataGridWrapper from '../../_components/_data-grid/DataGridWrapper';
// import { useSupplierCategoryColumns } from '../../_components/_hooks/useSupplierCategoryColumns';
// import DeleteConfirmationModal from '../../_components/_modals/DeleteConfirmationModal';
// import ViewSupplierCategoryModal from '../../_components/_view-modal/ViewSupplierCategoryModal';
// import { ProductTypesFilter, StatusFilter } from '../../_components/_filters/StatusFilter';
// import DateRangeFilter from '../../_components/_filters/DateRangeFilter';

// interface BackendSupplierCategory {
//   _id: string;
//   name: string;
//   description: string;
//   productCategories: string[];
//   productType: 'new' | 'scrap';
//   isBlocked: boolean; 
//   status: 'active' | 'inactive';
//   createdAt: string;
//   updatedAt: string;
// }

// const SupplierCategoriesPage = () => {
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const [search, setSearch] = useState('');
//   const [productTypeFilter, setproductTypeFilter] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [deletingCategory, setDeletingCategory] = useState<any>(null);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [viewingCategory, setViewingCategory] = useState<any>(null);
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const limit = 10;

//   // Fetch supplier categories data
//   const { data: categoriesData, isLoading, error } = useQuery({
//     queryKey: ['supplier-categories', search, productTypeFilter, statusFilter, startDate, endDate, currentPage],
//     queryFn: async () => {
//       const params = new URLSearchParams({
//         page: currentPage.toString(),
//         limit: limit.toString(),
//         ...(search && { search }),
//         ...(productTypeFilter && { productType: productTypeFilter }),
//         ...(statusFilter && { status: statusFilter }),
//         ...(startDate && { startDate }),
//         ...(endDate && { endDate }),
//       });

//       console.log('Fetching supplier categories from:', `http://localhost:5000/api/supplier-categories?${params}`);
      
//       const response = await fetch(`http://localhost:5000/api/supplier-categories?${params}`);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('Supplier Categories API Response:', data);
//       return data;
//     },
//   });

//   // Delete supplier category function
//   const deleteSupplierCategory = async (categoryId: string): Promise<void> => {
//     const response = await fetch(`http://localhost:5000/api/supplier-categories/${categoryId}`, {
//       method: 'DELETE',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.message || `Failed to delete supplier category: ${response.status}`);
//     }

//     const result = await response.json();
//     if (!result.success) {
//       throw new Error(result.message || 'Failed to delete supplier category');
//     }
//   };

//   // Handle view supplier category
//   const handleViewCategory = (category: any) => {
//     setViewingCategory(category);
//     setIsViewModalOpen(true);
//   };

//   // Handle edit supplier category
//   const handleEditCategory = (category: any) => {
//     router.push(`/supplier/supplier-categories/edit-supplier-category?id=${category.id}`);
//   };

//   // Handle delete supplier category confirmation
//   const handleDeleteCategory = async () => {
//     if (!deletingCategory) return;
    
//     setIsDeleting(true);
//     try {
//       await deleteSupplierCategory(deletingCategory.id);
      
//       // FIXED: Better cache invalidation
//       await Promise.all([
//         queryClient.invalidateQueries({ 
//           queryKey: ['supplier-categories'], 
//           refetchType: 'all'
//         }),
//         queryClient.refetchQueries({
//           queryKey: ['supplier-categories']
//         })
//       ]);
      
//       setDeletingCategory(null);
//       console.log('Supplier category deleted successfully');
//     } catch (error) {
//       console.error('Error deleting supplier category:', error);
//       alert(`Failed to delete supplier category: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   // Handle status change - FIXED: Better cache invalidation
// // Handle status change - FIXED: Use correct endpoint
// const handleStatusChange = async (category: any, status: 'active' | 'inactive') => {
//   try {
//     console.log('Update supplier category status:', category.id, status);
    
//     // Use the correct ID field from backend
//     const categoryId = category.id || category._id;
    
//     // FIX: Use the correct endpoint with /status
//     const response = await fetch(`http://localhost:5000/api/supplier-categories/${categoryId}/status`, {
//       method: 'PATCH',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ status }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.message || `Failed to update supplier category status: ${response.status}`);
//     }

//     const result = await response.json();
    
//     if (!result.success) {
//       throw new Error(result.message || 'Failed to update supplier category status');
//     }

//     // FIXED: Better cache invalidation
//     await Promise.all([
//       queryClient.invalidateQueries({ 
//         queryKey: ['supplier-categories'], 
//         refetchType: 'all'
//       }),
//       queryClient.refetchQueries({
//         queryKey: ['supplier-categories']
//       })
//     ]);
    
//     console.log('Supplier category status updated successfully');
//   } catch (error) {
//     console.error('Error updating supplier category status:', error);
//     alert(`Failed to update supplier category status: ${error instanceof Error ? error.message : 'Unknown error'}`);
//   }
// };

//   // Extract data from backend response
//   const categories: BackendSupplierCategory[] = categoriesData?.data || [];
//   const totalCategories = categoriesData?.pagination?.totalItems || 0;

//   // Transform backend data to table format
// // Transform backend data to table format - FIXED: Handle isBlocked to status conversion
// const dataWithSerial = useMemo(() => {
//   console.log('Raw categories data:', categories);
  
//   return categories.map((category: BackendSupplierCategory, index: number) => {
//     // FIX: Convert isBlocked to status
//     const status = category.isBlocked ? 'inactive' : 'active';
    
//     const transformed = {
//       id: category._id,
//       serialNo: (currentPage - 1) * limit + (index + 1),
//       name: category.name,
//       description: category.description,
//       productCategories: category.productCategories,
//       productType: category.productType,
//       status: status, // Use converted status
//       createdAt: category.createdAt,
//       updatedAt: category.updatedAt,
//     };
    
//     console.log(`Category ${index}:`, {
//       originalIsBlocked: category.isBlocked,
//       convertedStatus: transformed.status,
//       hasStatus: !!transformed.status
//     });
    
//     return transformed;
//   });
// }, [categories, currentPage, limit]);

//   // Handle Add Supplier Category button click
//   const handleAddCategory = () => {
//     router.push('/supplier/supplier-categories/add-supplier-category');
//   };

//   const columns = useSupplierCategoryColumns({
//     onEdit: handleEditCategory,
//     onDelete: (category) => {
//       console.log('Delete supplier category:', category);
//       setDeletingCategory(category);
//     },
//     onStatusChange: handleStatusChange,
//     onView: handleViewCategory
//   });

//   const SupplierCategoryFilters =
//     <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
//        <ProductTypesFilter
//         value={productTypeFilter}
//         onChange={setproductTypeFilter}
//         placeholder="All Types"
//       />
//          <StatusFilter
//         value={statusFilter}
//         onChange={setStatusFilter}
//         placeholder="All Users"
//       />
 
//       <DateRangeFilter
//         startDate={startDate}
//         endDate={endDate}
//         onStartDateChange={setStartDate}
//         onEndDateChange={setEndDate}
//       />
      
//       <button
//         onClick={() => {
//           setproductTypeFilter('');
//           setStatusFilter('');
//           setStartDate('');
//           setEndDate('');
//           setSearch('');
//           setCurrentPage(1);
//         }}
//         className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-nowrap"
//       >
//         Clear Filters
//       </button>
//     </div>


//   // Add error handling
//   if (error) {
//     return (
//       <div className="p-6">
//         <div className="bg-red-50 border border-red-200 rounded-md p-4">
//           <h3 className="text-sm font-medium text-red-800">Error loading supplier categories</h3>
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
//         title="Supplier Categories Management"
//         description="Manage all supplier product categories in the system"
//         columns={columns}
//         data={dataWithSerial}
//         isLoading={isLoading}
//         totalRows={totalCategories}
//         rowsPerPage={limit}
//         currentPage={currentPage}
//         onPageChange={setCurrentPage}
//         isSearchEnabled={true}
//         searchState={search}
//         setSearchState={setSearch}
//         searchPlaceholder="Search supplier categories by name..."
//         filtersComponent={SupplierCategoryFilters}
//         defaultFiltersExpanded={true}
//         hasAddButton={true}
//         addButtonText="Add Category"
//         addButtonOnClick={handleAddCategory}
//         hasExportButton={true}
//         onExport={() => console.log('Export supplier categories')}
//       />

//       {/* Delete Confirmation Modal */}
//       <DeleteConfirmationModal
//         isOpen={!!deletingCategory}
//         onClose={() => !isDeleting && setDeletingCategory(null)}
//         onConfirm={handleDeleteCategory}
//         title="Delete Supplier Category"
//         message="Are you sure you want to delete this supplier category? This action cannot be undone."
//         itemName={deletingCategory?.name}
//         isLoading={isDeleting}
//       />

//       {/* View Supplier Category Modal */}
//       <ViewSupplierCategoryModal
//         isOpen={isViewModalOpen}
//         onClose={() => {
//           setIsViewModalOpen(false);
//           setViewingCategory(null);
//         }}
//         data={viewingCategory}
//       />
//     </div>
//   );
// };

// export default SupplierCategoriesPage;










// app/supplier/supplier-categories/page.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DataGridWrapper from '../../_components/_data-grid/DataGridWrapper';
import { useSupplierCategoryColumns } from '../../_components/_hooks/useSupplierCategoryColumns';
import DeleteConfirmationModal from '../../_components/_modals/DeleteConfirmationModal';
import ViewSupplierCategoryModal from '../../_components/_view-modal/ViewSupplierCategoryModal';
import { ProductTypesFilter, StatusFilter } from '../../_components/_filters/StatusFilter';
import DateRangeFilter from '../../_components/_filters/DateRangeFilter';
import { clientService } from '../../app/utils/api-client';

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

interface BackendSupplierCategory {
  _id: string;
  name: string;
  description: string;
  productCategories: string[];
  productType: 'new' | 'scrap';
  isBlocked: boolean; 
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface SupplierCategoriesApiResponse {
  data: BackendSupplierCategory[];
  pagination?: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}

const SupplierCategoriesPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [productTypeFilter, setproductTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingCategory, setDeletingCategory] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const limit = 10;

  // DEBUG: Test API connection
  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('🧪 Testing supplier-categories API connection...');
        const testResponse = await clientService.get<ApiResponse<BackendSupplierCategory[]>>('/supplier-categories?page=1&limit=5');
        console.log('✅ Supplier Categories API Test Success:', testResponse.data);
      } catch (error) {
        console.error('❌ Supplier Categories API Test Failed:', error);
      }
    };
    
    testApi();
  }, []);

  // UPDATED: Fetch supplier categories data with proper typing
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['supplier-categories', search, productTypeFilter, statusFilter, startDate, endDate, currentPage],
queryFn: async (): Promise<BackendSupplierCategory[]> => {
  const params = new URLSearchParams({
    page: currentPage.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(productTypeFilter && { productType: productTypeFilter }),
    ...(statusFilter && { status: statusFilter }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  });

  console.log('🔍 Fetching supplier categories from:', `/supplier-categories?${params}`);
  
  try {
    const response = await clientService.get<ApiResponse<BackendSupplierCategory[]>>(`/supplier-categories?${params}`);
    console.log('🚀 FULL API RESPONSE:', response);
    console.log('📊 Response data:', response.data);
    
    // FIXED: Properly extract the data array from the API response
    const apiData = response.data as ApiResponse<BackendSupplierCategory[]>;
    console.log('🔍 Response structure:', {
      success: apiData.success,
      message: apiData.message,
      data: apiData.data,
      pagination: apiData.pagination
    });
    
    // Check what's actually in the response
    if (apiData) {
      console.log('🎯 Response data keys:', Object.keys(apiData));
      
      // If response.data is the API response wrapper
      if (apiData.success !== undefined) {
        console.log('📦 API wrapper detected (success, message, data structure)');
        return apiData.data; // Return the nested data
      }
    }
    
    console.log('⚠️ Unknown response structure, returning raw:', response.data);
    
    // FIXED: Handle different response structures
    if (Array.isArray(response.data)) {
      console.log('📦 response.data is already an array');
      return response.data as BackendSupplierCategory[];
    } else if (response.data && typeof response.data === 'object' && 'data' in (response.data as any)) {
      console.log('📦 response.data has data property');
      return (response.data as ApiResponse<BackendSupplierCategory[]>).data;
    }
    
    console.log('⚠️ Could not extract data, returning empty array');
    return [];
  } catch (err) {
    console.error('❌ API Error:', err);
    throw err;
  }
},
  });

  // DEBUG: Check what categoriesData contains
  useEffect(() => {
    console.log('🎯 categoriesData:', categoriesData);
    console.log('🎯 categoriesData type:', typeof categoriesData);
    if (categoriesData) {
      console.log('🎯 categoriesData keys:', Object.keys(categoriesData));
      console.log('🎯 categoriesData.data:', (categoriesData as any).data);
      console.log('🎯 categoriesData.pagination:', (categoriesData as any).pagination);
      console.log('🎯 Is categoriesData.data an array?:', Array.isArray((categoriesData as any).data));
      console.log('🎯 Is categoriesData an array?:', Array.isArray(categoriesData));
    }
  }, [categoriesData]);

  // Delete supplier category function
  const deleteSupplierCategory = async (categoryId: string): Promise<void> => {
    const response = await clientService.delete<ApiResponse>(`/supplier-categories/${categoryId}`);
    const result = response.data;
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete supplier category');
    }
  };

  // Handle view supplier category
  const handleViewCategory = (category: any) => {
    setViewingCategory(category);
    setIsViewModalOpen(true);
  };

  // Handle edit supplier category
  const handleEditCategory = (category: any) => {
    router.push(`/supplier/supplier-categories/edit-supplier-category?id=${category.id}`);
  };

  // Handle delete supplier category confirmation
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    
    setIsDeleting(true);
    try {
      await deleteSupplierCategory(deletingCategory.id);
      
      await Promise.all([
        queryClient.invalidateQueries({ 
          queryKey: ['supplier-categories'], 
          refetchType: 'all'
        }),
        queryClient.refetchQueries({
          queryKey: ['supplier-categories']
        })
      ]);
      
      setDeletingCategory(null);
      console.log('Supplier category deleted successfully');
    } catch (error) {
      console.error('Error deleting supplier category:', error);
      alert(`Failed to delete supplier category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (category: any, status: 'active' | 'inactive') => {
    try {
      console.log('Update supplier category status:', category.id, status);
      
      const categoryId = category.id || category._id;
      
      const response = await clientService.patch<ApiResponse>(`/supplier-categories/${categoryId}/status`, { 
        status 
      });

      const result = response.data;
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update supplier category status');
      }

      await Promise.all([
        queryClient.invalidateQueries({ 
          queryKey: ['supplier-categories'], 
          refetchType: 'all'
        }),
        queryClient.refetchQueries({
          queryKey: ['supplier-categories']
        })
      ]);
      
      console.log('Supplier category status updated successfully');
    } catch (error) {
      console.error('Error updating supplier category status:', error);
      alert(`Failed to update supplier category status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // FLEXIBLE: Extract categories based on actual API structure
  const categories: BackendSupplierCategory[] = useMemo(() => {
    if (!categoriesData) {
      console.log('📭 No categoriesData available');
      return [];
    }
    
    console.log('🔧 Processing categoriesData:', categoriesData);
    
    // categoriesData is already the array from our query function
    if (Array.isArray(categoriesData)) {
      console.log('📦 categoriesData is direct array');
      return categoriesData;
    }
    
    // If for some reason it's wrapped
    if (Array.isArray((categoriesData as any).data)) {
      console.log('📦 categoriesData.data is array');
      return (categoriesData as any).data;
    }
    
    console.log('❓ Unknown categoriesData structure:', categoriesData);
    return [];
  }, [categoriesData]);

  // FLEXIBLE: Extract total count
  const totalCategories = useMemo(() => {
    if (!categoriesData) {
      console.log('📭 No categoriesData for total count');
      return 0;
    }
    
    console.log('🔧 Calculating total from:', categoriesData);
    
    // Since your API returns pagination in the wrapper, but we're returning just the array
    // We need to handle this differently
    
    // If categoriesData is an array, return its length
    if (Array.isArray(categoriesData)) {
      console.log('📊 Using categoriesData array length:', categoriesData.length);
      return categoriesData.length;
    }
    
    // Check if there's pagination info
    if ((categoriesData as any).pagination?.totalItems) {
      return (categoriesData as any).pagination.totalItems;
    }
    
    console.log('📊 Fallback to categories length:', categories.length);
    return categories.length;
  }, [categoriesData, categories]);

  console.log('🎯 Final categories:', categories);
  console.log('🎯 Final categories length:', categories.length);
  console.log('🎯 Final totalCategories:', totalCategories);

  // Transform backend data to table format
  const dataWithSerial = useMemo(() => {
    console.log('🎬 Creating dataWithSerial from categories:', categories);
    
    if (!categories.length) {
      console.log('📭 No categories to transform');
      return [];
    }
    
    const transformed = categories.map((category: BackendSupplierCategory, index: number) => {
      const status = category.isBlocked ? 'inactive' : 'active';
      
      return {
        id: category._id,
        serialNo: (currentPage - 1) * limit + (index + 1),
        name: category.name,
        description: category.description,
        productCategories: category.productCategories,
        productType: category.productType,
        status: status,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };
    });
    
    console.log('✅ Transformed data:', transformed);
    return transformed;
  }, [categories, currentPage, limit]);

  // Handle Add Supplier Category button click
  const handleAddCategory = () => {
    router.push('/supplier/supplier-categories/add-supplier-category');
  };

  const columns = useSupplierCategoryColumns({
    onEdit: handleEditCategory,
    onDelete: (category) => {
      console.log('Delete supplier category:', category);
      setDeletingCategory(category);
    },
    onStatusChange: handleStatusChange,
    onView: handleViewCategory
  });

  const SupplierCategoryFilters =
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
       <ProductTypesFilter
        value={productTypeFilter}
        onChange={setproductTypeFilter}
        placeholder="All Types"
      />
         <StatusFilter
        value={statusFilter}
        onChange={setStatusFilter}
        placeholder="All Users"
      />
 
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      
      <button
        onClick={() => {
          setproductTypeFilter('');
          setStatusFilter('');
          setStartDate('');
          setEndDate('');
          setSearch('');
          setCurrentPage(1);
        }}
        className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-nowrap"
      >
        Clear Filters
      </button>
    </div>

  // Add error handling
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-red-800">Error loading supplier categories</h3>
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
    totalRows: totalCategories
  });

  return (
    <div>
      <DataGridWrapper
        title="Supplier Categories Management"
        description="Manage all supplier product categories in the system"
        columns={columns}
        data={dataWithSerial}
        isLoading={isLoading}
        totalRows={totalCategories}
        rowsPerPage={limit}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isSearchEnabled={true}
        searchState={search}
        setSearchState={setSearch}
        searchPlaceholder="Search supplier categories by name..."
        filtersComponent={SupplierCategoryFilters}
        defaultFiltersExpanded={true}
        hasAddButton={true}
        addButtonText="Add Category"
        addButtonOnClick={handleAddCategory}
        hasExportButton={true}
        onExport={() => console.log('Export supplier categories')}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingCategory}
        onClose={() => !isDeleting && setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Supplier Category"
        message="Are you sure you want to delete this supplier category? This action cannot be undone."
        itemName={deletingCategory?.name}
        isLoading={isDeleting}
      />

      {/* View Supplier Category Modal */}
      <ViewSupplierCategoryModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingCategory(null);
        }}
        data={viewingCategory}
      />
    </div>
  );
};

export default SupplierCategoriesPage;