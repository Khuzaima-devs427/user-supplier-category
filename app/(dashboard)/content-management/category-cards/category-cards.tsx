'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DataGridWrapper from '../../../_components/_data-grid/DataGridWrapper';
import DeleteConfirmationModal from '../../../_components/_modals/DeleteConfirmationModal';
import DateRangeFilter from '../../../_components/_filters/DateRangeFilter';
import { clientService } from '../../../app/utils/api-client';
import { usePermissions } from '../../../_components/contexts/PermissionContext';
import { useCategoryCardsColumns } from '../../../_components/_hooks/useCategoryCardsColumns';
import { toast } from 'react-toastify';
import CategoryCardsViewModal from '../_components/view-modal/category-cards-ViewModal';

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

// Category Card Item Interface
interface CategoryCardItem {
  _id: string;
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tag?: string;
  description?: string;
}

// DataGrid Row Interface
interface DataGridRow {
  id: string;
  _id: string;
  serialNo: number;
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tag?: string;
  description?: string;
}

const CategoryCardsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { permissions } = usePermissions();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingItem, setDeletingItem] = useState<CategoryCardItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingItem, setViewingItem] = useState<CategoryCardItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const limit = 10;

  // Set isClient only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Helper function to check permissions - ONLY AFTER isClient is true
  const hasPermission = (permissionKey: string): boolean => {
    if (!isClient) return true; // Return true during SSR to avoid hydration mismatch
    
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

  // DEBUG: Test API connection
  useEffect(() => {
    if (!isClient) return;
    
    const testApi = async () => {
      try {
        console.log('🧪 Testing category-cards API connection...');
        const testResponse = await clientService.get<ApiResponse<CategoryCardItem[]>>('/category-cards/?page=1&limit=5');
        console.log('✅ Category Cards API Test Success:', testResponse.data);
        console.log('🔍 Test API response structure:', {
          success: testResponse.data.success,
          message: testResponse.data.message,
          dataLength: testResponse.data.data?.length || 0,
          fullData: testResponse.data
        });
      } catch (error) {
        console.error('❌ Category Cards API Test Failed:', error);
      }
    };
    
    testApi();
  }, [isClient]);

  // Fetch category cards from API
  const { 
    data: categoryCardsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['category-cards', search, statusFilter, startDate, endDate, currentPage],
    queryFn: async (): Promise<CategoryCardItem[]> => {
      if (!isClient) {
        console.log('🔄 Skipping fetch - not on client yet');
        return [];
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      console.log('🔍 Fetching category cards from:', `/category-cards/?${params}`);
      
      try {
        const response = await clientService.get<ApiResponse<CategoryCardItem[]>>(`/category-cards/?${params}`);
        console.log('🚀 FULL API RESPONSE STRUCTURE:', {
          response: response,
          data: response.data,
          dataType: typeof response.data,
          isArray: Array.isArray(response.data),
          keys: response.data ? Object.keys(response.data) : 'null'
        });
        
        // Check the response structure more carefully
        const apiData = response.data;
        
        console.log('📊 API Data analysis:', {
          success: apiData.success,
          message: apiData.message,
          dataExists: !!apiData.data,
          dataIsArray: Array.isArray(apiData.data),
          dataLength: Array.isArray(apiData.data) ? apiData.data.length : 'N/A',
          pagination: apiData.pagination
        });
        
        if (apiData.success && apiData.data) {
          const items = apiData.data;
          console.log('✅ Extracted items:', items.length, 'items');
          
          if (items.length > 0) {
            console.log('🔍 First item:', items[0]);
          }
          
          return items;
        } else {
          console.warn('⚠️ No data or unsuccessful response:', apiData);
          return [];
        }
      } catch (err) {
        console.error('❌ API Error:', err);
        throw err;
      }
    },
    enabled: isClient, // Only fetch when on client
  });

  // DEBUG: Check what categoryCardsData contains
  useEffect(() => {
    if (!isClient) return;
    
    console.log('=== CATEGORY CARDS DATA DEBUG ===');
    console.log('🎯 categoryCardsData:', categoryCardsData);
    console.log('Type:', typeof categoryCardsData);
    console.log('Is Array?', Array.isArray(categoryCardsData));
    
    if (categoryCardsData) {
      if (Array.isArray(categoryCardsData)) {
        console.log('Array length:', categoryCardsData.length);
        if (categoryCardsData.length > 0) {
          console.log('First item:', categoryCardsData[0]);
        }
      } else {
        console.log('Not an array, keys:', Object.keys(categoryCardsData));
      }
    }
  }, [categoryCardsData, isClient]);

  // Delete item function
  const deleteItem = async (itemId: string): Promise<void> => {
    const response = await clientService.delete<ApiResponse>(`/category-cards/${itemId}`);
    const result = response.data;
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete category card');
    }
  };

  // Handle view item
  const handleViewItem = (item: DataGridRow) => {
    // Check permission
    if (!hasPermission('category_cards.view')) {
      toast.error('You do not have permission to view category card details');
      return;
    }
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  // Handle edit item
  const handleEditItem = (item: DataGridRow) => {
    // Check permission
    if (!hasPermission('category_cards.edit')) {
      toast.error('You do not have permission to edit category cards');
      return;
    }
    
    console.log('🔄 Edit item clicked:', item);
    
    const itemId = item.id;
    if (!itemId) {
      console.error('❌ Cannot edit: No ID found in item:', item);
      toast.error('Cannot edit: Item ID is missing');
      return;
    }
    
    const editUrl = `/content-management/category-cards/edit/${encodeURIComponent(itemId)}`;
    router.push(editUrl);
  };

  // Handle delete item
  const handleDeleteItem = async () => {
    if (!deletingItem || !isClient) return;
    
    // Check permission
    if (!hasPermission('category_cards.delete')) {
      toast.error('You do not have permission to delete category cards');
      setDeletingItem(null);
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteItem(deletingItem._id);
      
      await queryClient.invalidateQueries({ 
        queryKey: ['category-cards'], 
        refetchType: 'all'
      });
      
      setDeletingItem(null);
      toast.success('Category card deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting category card:', error);
      toast.error(`Failed to delete category card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (item: DataGridRow, status: 'active' | 'inactive') => {
    if (!isClient) return;
    
    // Check permission
    if (!hasPermission('category_cards.edit')) {
      toast.error('You do not have permission to update category card status');
      return;
    }
    
    const itemId = item.id;
    if (!itemId) {
      console.error('❌ Cannot update status: No ID found in item:', item);
      toast.error('Cannot update status: Item ID is missing');
      return;
    }
    
    try {
      const response = await clientService.patch<ApiResponse>(`/category-cards/${itemId}/status`, {
        status: status
      });

      const result = response.data;
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update category card status');
      }

      await queryClient.invalidateQueries({ queryKey: ['category-cards'] });
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.error('❌ Error updating category card status:', error);
      toast.error(`Failed to update category card status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Extract category card items
  const categoryCardItems: CategoryCardItem[] = useMemo(() => {
    if (!isClient) return [];
    
    console.log('🎬 Extracting categoryCardItems from:', categoryCardsData);
    
    if (!categoryCardsData) {
      console.log('📭 No categoryCardsData available');
      return [];
    }
    
    // If it's already an array of CategoryCardItem, return it
    if (Array.isArray(categoryCardsData)) {
      console.log('📊 categoryCardsData is already an array:', categoryCardsData.length, 'items');
      return categoryCardsData;
    }
    
    return [];
  }, [categoryCardsData, isClient]);

  // Extract total count
  const totalItems = useMemo(() => {
    if (!isClient) return 0;
    
    if (!categoryCardsData) {
      return 0;
    }
    
    if (Array.isArray(categoryCardsData)) {
      return categoryCardsData.length;
    }
    
    return categoryCardItems.length;
  }, [categoryCardsData, categoryCardItems, isClient]);

  // Transform data for DataGrid
  const dataWithSerial: DataGridRow[] = useMemo(() => {
    if (!isClient) return [];
    
    console.log('🎬 Creating dataWithSerial from categoryCardItems:', categoryCardItems.length, 'items');
    
    if (!categoryCardItems || categoryCardItems.length === 0) {
      console.log('📭 No categoryCardItems to transform');
      return [];
    }
    
    const transformedData = categoryCardItems.map((item: CategoryCardItem, index: number) => ({
      id: item._id,
      _id: item._id,
      serialNo: (currentPage - 1) * limit + (index + 1),
      image: item.image,
      title: item.title,
      subtitle: item.subtitle,
      buttonText: item.buttonText,
      buttonLink: item.buttonLink,
      status: item.status,
      displayOrder: item.displayOrder,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      createdBy: item.createdBy,
      tag: item.tag,
      description: item.description,
    }));
    
    console.log('✅ Transformed data:', transformedData.length, 'rows');
    return transformedData;
  }, [categoryCardItems, currentPage, limit, isClient]);

  // Debug: Check transformed data
  useEffect(() => {
    if (!isClient) return;
    
    console.log('=== DATAGRID DATA DEBUG ===');
    console.log('📊 DataWithSerial analysis:', {
      totalRows: dataWithSerial.length,
      isLoading: isLoading,
      hasError: !!error,
      currentPage: currentPage
    });
    
    if (dataWithSerial.length > 0) {
      console.log('🔍 First row:', dataWithSerial[0]);
    }
  }, [dataWithSerial, isLoading, error, currentPage, isClient]);

  // Handle Add Item button click
  const handleAddItem = () => {
    if (!hasPermission('category_cards.create')) {
      toast.error('You do not have permission to add category cards');
      return;
    }
    
    router.push('/content-management/category-cards/add');
  };

  // Use the category cards columns hook
  const columns = useCategoryCardsColumns({
    onEdit: handleEditItem,
    onDelete: (item: DataGridRow) => {
      if (!hasPermission('category_cards.delete')) {
        toast.error('You do not have permission to delete category cards');
        return;
      }
      setDeletingItem({
        _id: item.id,
        image: item.image,
        title: item.title,
        subtitle: item.subtitle,
        buttonText: item.buttonText,
        buttonLink: item.buttonLink,
        status: item.status,
        displayOrder: item.displayOrder,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        createdBy: item.createdBy,
        tag: item.tag,
        description: item.description,
      });
    },
    onStatusChange: handleStatusChange,
    onView: handleViewItem,
    permissions: permissions
  });

  // Filters component
  const CategoryCardsFilters = (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={!isClient}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      
      <button
        onClick={() => {
          setStatusFilter('');
          setStartDate('');
          setEndDate('');
          setSearch('');
          setCurrentPage(1);
        }}
        className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-nowrap"
        disabled={!isClient}
      >
        Clear Filters
      </button>
    </div>
  );

  // Loading state for server render
  if (!isClient) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="mb-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="min-h-[400px] bg-white rounded-lg shadow">
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied only after client is ready
  if (!hasPermission('category_cards.view')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the category cards management page.
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

  // Error handling
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-red-800">Error loading category cards</h3>
          <p className="text-sm text-red-600 mt-1">{(error as Error).message}</p>
          <button 
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log('=== RENDERING DATAGRIDWRAPPER ===');
  console.log('📦 Props to DataGridWrapper:', {
    dataLength: dataWithSerial.length,
    columnsCount: columns.length,
    isLoading: isLoading,
    totalItems: totalItems,
    currentPage: currentPage
  });

  return (
    <div>
      <DataGridWrapper
        title="Category Cards Management"
        description="Manage category cards for website homepage"
        columns={columns}
        data={dataWithSerial}
        isLoading={isLoading}
        totalRows={totalItems}
        rowsPerPage={limit}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isSearchEnabled={true}
        searchState={search}
        setSearchState={setSearch}
        searchPlaceholder="Search by title, subtitle or button text..."
        filtersComponent={CategoryCardsFilters}
        defaultFiltersExpanded={true}
        hasAddButton={true}
        addButtonText="Add New Category Card"
        addButtonOnClick={handleAddItem}
        addButtonPermission="category_cards.create"
        hasExportButton={true}
        onExport={() => toast.info('Export functionality coming soon')}
        allPermissions={permissions}
        enableRowActions={true}
        editPermission="category_cards.edit"
        deletePermission="category_cards.delete"
      />

      <DeleteConfirmationModal
        isOpen={!!deletingItem}
        onClose={() => !isDeleting && setDeletingItem(null)}
        onConfirm={handleDeleteItem}
        title="Delete Category Card"
        message="Are you sure you want to delete this category card? This action cannot be undone."
        itemName={deletingItem?.title}
        isLoading={isDeleting}
      />

      <CategoryCardsViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingItem(null);
        }}
        data={viewingItem}
      />
    </div>
  );
};

export default CategoryCardsPage;