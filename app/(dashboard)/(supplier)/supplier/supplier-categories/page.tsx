// app/supplier/supplier-categories/page.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DataGridWrapper from '../../../../_components/_data-grid/DataGridWrapper';
import { useSupplierCategoryColumns } from '../../../../_components/_hooks/useSupplierCategoryColumns';
import DeleteConfirmationModal from '../../../../_components/_modals/DeleteConfirmationModal';
import ViewSupplierCategoryModal from '../../../../_components/_view-modal/ViewSupplierCategoryModal';
import { ProductTypesFilter, StatusFilter } from '../../../../_components/_filters/StatusFilter';
import DateRangeFilter from '../../../../_components/_filters/DateRangeFilter';
import { clientService } from '../../../../app/utils/api-client';
import { usePermissions } from '../../../../_components/contexts/PermissionContext';
import { toast } from 'react-toastify';
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

const SupplierCategoriesPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { permissions } = usePermissions(); // GET PERMISSIONS FROM CONTEXT
  
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

  // DEBUG: Add debug logging for permissions
  useEffect(() => {
    console.log('🔍 DEBUG - Current permissions in SupplierCategoriesPage:', {
      permissions,
      isStaticAdmin: permissions.isStaticAdmin,
      supplier_categories_edit: permissions['supplier_categories.edit'],
      supplier_categories_delete: permissions['supplier_categories.delete'],
      supplier_categories_create: permissions['supplier_categories.create'],
      supplier_categories_view: permissions['supplier_categories.view'],
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
        
        // Return just the data array (not the whole ApiResponse object)
        return apiData.data;
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
      console.log('🎯 Is categoriesData an array?:', Array.isArray(categoriesData));
      console.log('🎯 categoriesData length:', Array.isArray(categoriesData) ? categoriesData.length : 'Not an array');
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

  // Handle edit supplier category - Updated with permission helper
  const handleEditCategory = (category: any) => {
    // Check if user has edit permission
    if (!hasPermission('supplier_categories.edit')) {
      toast.error('You do not have permission to edit supplier categories');
      return;
    }
    router.push(`/supplier/supplier-categories/edit-supplier-category?id=${category.id}`);
  };

  // Handle delete supplier category confirmation - Updated with permission helper
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    
    // Check if user has delete permission
    if (!hasPermission('supplier_categories.delete')) {
      toast.error('You do not have permission to delete supplier categories');
      setDeletingCategory(null);
      return;
    }
    
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
      console.log('✅ Supplier category deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting supplier category:', error);
     toast.error(`Failed to delete supplier category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle status change - Updated with permission helper
  const handleStatusChange = async (category: any, status: 'active' | 'inactive') => {
    // Check if user has edit permission
    if (!hasPermission('supplier_categories.edit')) {
     toast.error('You do not have permission to update supplier category status');
      return;
    }
    
    try {
      console.log('🔄 Update supplier category status:', category.id, status);
      
      const categoryId = category.id || category._id;
      
      const response = await clientService.patch<ApiResponse>(`/supplier-categories/${categoryId}/status`, { 
        status 
      });

      const result = response.data;
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update supplier category status');
      }

      await queryClient.invalidateQueries({ queryKey: ['supplier-categories'] });
      
      console.log('✅ Supplier category status updated successfully');
    } catch (error) {
      console.error('❌ Error updating supplier category status:', error);
     toast.error(`Failed to update supplier category status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // FLEXIBLE: Extract categories based on actual API structure
  const categories: BackendSupplierCategory[] = useMemo(() => {
    if (!categoriesData) {
      console.log('📭 No categoriesData available');
      return [];
    }
    
    console.log('🔧 Processing categoriesData:', categoriesData);
    
    // categoriesData should already be the array from our query function
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

  // Handle Add Supplier Category button click - Check permission before adding
  const handleAddCategory = () => {
    // Check if user has create permission
    if (!hasPermission('supplier_categories.create')) {
     toast.error('You do not have permission to add supplier categories');
      return;
    }
    router.push('/supplier/supplier-categories/add-supplier-category');
  };

  // Update columns with permission checks
  const columns = useSupplierCategoryColumns({
    onEdit: handleEditCategory,
    onDelete: (category) => {
      // Check if user has delete permission
      if (!hasPermission('supplier_categories.delete')) {
       toast.error('You do not have permission to delete supplier categories');
        return;
      }
      console.log('Delete supplier category:', category);
      setDeletingCategory(category);
    },
    onStatusChange: handleStatusChange,
    onView: handleViewCategory,
    // Pass permissions to the column hook
    permissions: permissions
  });

  const SupplierCategoryFilters = (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <ProductTypesFilter
        value={productTypeFilter}
        onChange={setproductTypeFilter}
        placeholder="All Types"
      />
      <StatusFilter
        value={statusFilter}
        onChange={setStatusFilter}
        placeholder="All Status"
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
  );

  // Check if user has view permission for supplier categories - Updated with permission helper
  if (!hasPermission('supplier_categories.view')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the supplier categories management page.
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
        addButtonPermission="supplier_categories.create"
        hasExportButton={true}
        onExport={() => console.log('Export supplier categories')}
        allPermissions={permissions}
        enableRowActions={true}
        editPermission="supplier_categories.edit"
        deletePermission="supplier_categories.delete"
      />

      {/* Delete Confirmation Modal - FIXED: Changed type to "supplier-category" */}
      <DeleteConfirmationModal
        isOpen={!!deletingCategory}
        onClose={() => !isDeleting && setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Supplier Category"
        message="Are you sure you want to delete this supplier category? This action cannot be undone."
        itemName={deletingCategory?.name}
        isLoading={isDeleting}
        type="supplier-category"  // FIXED: Changed from "supplier category" to "supplier-category"
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