'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DataGridWrapper from '../../../_components/_data-grid/DataGridWrapper';
import DeleteConfirmationModal from '../../../_components/_modals/DeleteConfirmationModal';
import DateRangeFilter from '../../../_components/_filters/DateRangeFilter';
import { clientService } from '../../../app/utils/api-client';
import { usePermissions } from '../../../_components/contexts/PermissionContext';
import { toast } from 'react-toastify';
import FeatureCategoryViewModal from '../_components/view-modal/feature-category-ViewModal';
import { useFeatureCategoryColumns } from '../../../_components/_hooks/useFeatureCategoryColumns';

// API Response interfaces
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
  };
  featuredInfo?: {
    currentFeatured: number;
    maxFeatured: number;
    canAddMore: boolean;
  };
}

// Feature Category Item Interface
interface FeatureCategoryItem {
  _id: string;
  name: string;
  description: string;
  type: string;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  featuredOrder: number | null;
  createdAt: string;
  updatedAt: string;
}

// DataGrid Row Interface
interface DataGridRow {
  id: string;
  _id: string;
  serialNo: number;
  name: string;
  description: string;
  type: string;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  featuredOrder: number | null;
  createdAt: string;
  updatedAt: string;
  statusBadgeColor: string;
  featuredBadgeColor: string;
}

// Featured Limit Info Interface
interface FeaturedLimitInfo {
  currentFeatured: number;
  maxFeatured: number;
  canAddMore: boolean;
  availableSlots: number;
  featuredList: Array<{
    id: string;
    name: string;
    order: number | null;
  }>;
}

const FeatureCategoriesPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { permissions } = usePermissions();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingItem, setDeletingItem] = useState<FeatureCategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingItem, setViewingItem] = useState<FeatureCategoryItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [featuredLimitInfo, setFeaturedLimitInfo] = useState<FeaturedLimitInfo | null>(null);
  const limit = 10;

  // Set isClient only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch featured limit info
  const fetchFeaturedLimitInfo = async (): Promise<FeaturedLimitInfo> => {
    if (!isClient) {
      return {
        currentFeatured: 0,
        maxFeatured: 4,
        canAddMore: true,
        availableSlots: 4,
        featuredList: []
      };
    }

    try {
      const response = await clientService.get<ApiResponse<FeaturedLimitInfo>>(
        '/feature-categories/stats/featured-limit'
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch featured limit info');
    } catch (error) {
      console.error('Failed to fetch featured limit info:', error);
      throw error;
    }
  };

  // Load featured limit info on mount
  useEffect(() => {
    if (!isClient) return;

    const loadFeaturedLimitInfo = async () => {
      try {
        const info = await fetchFeaturedLimitInfo();
        setFeaturedLimitInfo(info);
      } catch (error) {
        console.error('Failed to load featured limit info:', error);
      }
    };

    loadFeaturedLimitInfo();
  }, [isClient]);

  // Helper function to check permissions
  const hasPermission = (permissionKey: string): boolean => {
    if (!isClient) return true; // Return true during SSR to avoid hydration mismatch
    
    // If user is static admin, they have ALL permissions
    if (permissions.isStaticAdmin === true) {
      return true;
    }
    
    // Check specific permission
    const hasPerm = permissions[permissionKey] === true;
    return hasPerm;
  };

  // Helper function to get category preview
  const getCategoryPreview = (name?: string): string => {
    if (!name) return 'Untitled Category';
    return name.substring(0, 50) + (name.length > 50 ? '...' : '');
  };

  // DEBUG: Test API connection
  useEffect(() => {
    if (!isClient) return;
    
    const testApi = async () => {
      try {
        console.log('🧪 Testing feature-categories API connection...');
        const testResponse = await clientService.get<ApiResponse<FeatureCategoryItem[]>>(
          '/feature-categories/?page=1&limit=5'
        );
        console.log('✅ Feature Categories API Test Success:', testResponse.data);
      } catch (error) {
        console.error('❌ Feature Categories API Test Failed:', error);
      }
    };
    
    testApi();
  }, [isClient]);

  // Fetch feature categories from API
  const { 
    data: featureCategoriesData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['feature-categories', search, statusFilter, typeFilter, featuredFilter, startDate, endDate, currentPage],
    queryFn: async (): Promise<{ items: FeatureCategoryItem[], totalItems: number, featuredInfo: any }> => {
      if (!isClient) {
        return { items: [], totalItems: 0, featuredInfo: null };
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
        ...(featuredFilter && { isFeatured: featuredFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      console.log('🔍 Fetching feature categories from:', `/feature-categories/?${params}`);
      
      try {
        const response = await clientService.get<ApiResponse<FeatureCategoryItem[]>>(
          `/feature-categories/?${params}`
        );
        
        const apiData = response.data;
        
        if (apiData.success) {
          const items = apiData.data || [];
          const totalItems = apiData.pagination?.totalItems || items.length;
          const featuredInfo = apiData.featuredInfo;
          
          console.log('✅ Extracted items:', items.length, 'items');
          return { items, totalItems, featuredInfo };
        } else {
          console.warn('⚠️ No data or unsuccessful response:', apiData);
          return { items: [], totalItems: 0, featuredInfo: null };
        }
      } catch (err) {
        console.error('❌ API Error:', err);
        throw err;
      }
    },
    enabled: isClient,
  });

  // Delete item function
  const deleteItem = async (itemId: string): Promise<void> => {
    const response = await clientService.delete<ApiResponse>(`/feature-categories/${itemId}`);
    const result = response.data;
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete feature category');
    }
  };

  // Toggle featured status function
  const toggleFeaturedStatus = async (itemId: string): Promise<FeatureCategoryItem> => {
    const response = await clientService.patch<ApiResponse<FeatureCategoryItem>>(
      `/feature-categories/${itemId}/toggle-featured`,
      {}
    );
    
    const result = response.data;
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to toggle featured status');
    }
    
    return result.data;
  };

  // Handle view item
  const handleViewItem = (item: FeatureCategoryItem) => {
    // Check permission
    if (!hasPermission('feature_categories.view')) {
      toast.error('You do not have permission to view feature category details');
      return;
    }
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  // Handle edit item
  const handleEditItem = (item: FeatureCategoryItem) => {
    // Check permission
    if (!hasPermission('feature_categories.edit')) {
      toast.error('You do not have permission to edit feature categories');
      return;
    }
    
    const itemId = item._id;
    if (!itemId) {
      console.error('❌ Cannot edit: No ID found in item:', item);
      toast.error('Cannot edit: Item ID is missing');
      return;
    }
    
    const editUrl = `/content-management/featured-categories/edit/${encodeURIComponent(itemId)}`;
    router.push(editUrl);
  };

  // Handle delete item
  const handleDeleteItem = async () => {
    if (!deletingItem || !isClient) return;
    
    // Check permission
    if (!hasPermission('feature_categories.delete')) {
      toast.error('You do not have permission to delete feature categories');
      setDeletingItem(null);
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteItem(deletingItem._id);
      
      // Invalidate all related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['feature-categories'] }),
        queryClient.invalidateQueries({ queryKey: ['featured-limit-info'] }),
      ]);
      
      // Refresh featured limit info
      const updatedInfo = await fetchFeaturedLimitInfo();
      setFeaturedLimitInfo(updatedInfo);
      
      setDeletingItem(null);
      toast.success('Feature category deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting feature category:', error);
      toast.error(`Failed to delete feature category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle featured toggle
  // const handleFeaturedToggle = async (item: FeatureCategoryItem) => {
  //   if (!isClient) return;
    
  //   // Check permission
  //   if (!hasPermission('feature_categories.edit')) {
  //     toast.error('You do not have permission to update featured status');
  //     return;
  //   }
    
  //   const itemId = item._id;
  //   if (!itemId) {
  //     console.error('❌ Cannot toggle featured: No ID found in item:', item);
  //     toast.error('Cannot toggle featured: Item ID is missing');
  //     return;
  //   }
    
  //   try {
  //     // Check if we're trying to mark as featured when limit is reached
  //     if (!item.isFeatured && featuredLimitInfo && !featuredLimitInfo.canAddMore) {
  //       toast.error(`Maximum ${featuredLimitInfo.maxFeatured} featured categories reached. Please remove one first.`);
  //       return;
  //     }
      
  //     const updatedItem = await toggleFeaturedStatus(itemId);
      
  //     // Invalidate queries
  //     await Promise.all([
  //       queryClient.invalidateQueries({ queryKey: ['feature-categories'] }),
  //       queryClient.invalidateQueries({ queryKey: ['featured-limit-info'] }),
  //     ]);
      
  //     // Refresh featured limit info
  //     const updatedInfo = await fetchFeaturedLimitInfo();
  //     setFeaturedLimitInfo(updatedInfo);
      
  //     const action = updatedItem.isFeatured ? 'marked as featured' : 'removed from featured';
  //     toast.success(`Category ${action} successfully`);
  //   } catch (error) {
  //     console.error('❌ Error toggling featured status:', error);
  //     toast.error(`Failed to toggle featured status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  //   }
  // };


  // Handle featured toggle - WITH STATUS CHECK
const handleFeaturedToggle = async (item: FeatureCategoryItem) => {
  if (!isClient) return;
  
  // Check permission
  if (!hasPermission('feature_categories.edit')) {
    toast.error('You do not have permission to update featured status');
    return;
  }
  
  const itemId = item._id;
  if (!itemId) {
    console.error('❌ Cannot toggle featured: No ID found in item:', item);
    toast.error('Cannot toggle featured: Item ID is missing');
    return;
  }
  
  try {
    // 🚨 NEW CHECK: Prevent featuring if status is inactive
    if (item.status === 'inactive' && !item.isFeatured) {
      toast.error('Cannot feature an inactive category. Please activate it first.');
      return;
    }
    
    // Check if we're trying to mark as featured when limit is reached
    if (!item.isFeatured && featuredLimitInfo && !featuredLimitInfo.canAddMore) {
      toast.error(`Maximum ${featuredLimitInfo.maxFeatured} featured categories reached. Please remove one first.`);
      return;
    }
    
    const updatedItem = await toggleFeaturedStatus(itemId);
    
    // Invalidate queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['feature-categories'] }),
      queryClient.invalidateQueries({ queryKey: ['featured-limit-info'] }),
    ]);
    
    // Refresh featured limit info
    const updatedInfo = await fetchFeaturedLimitInfo();
    setFeaturedLimitInfo(updatedInfo);
    
    const action = updatedItem.isFeatured ? 'marked as featured' : 'removed from featured';
    toast.success(`Category ${action} successfully`);
  } catch (error) {
    console.error('❌ Error toggling featured status:', error);
    toast.error(`Failed to toggle featured status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

  // Handle status change
  // const handleStatusChange = async (item: FeatureCategoryItem, status: 'active' | 'inactive') => {
  //   if (!isClient) return;
    
  //   // Check permission
  //   if (!hasPermission('feature_categories.edit')) {
  //     toast.error('You do not have permission to update category status');
  //     return;
  //   }
    
  //   const itemId = item._id;
  //   if (!itemId) {
  //     console.error('❌ Cannot update status: No ID found in item:', item);
  //     toast.error('Cannot update status: Item ID is missing');
  //     return;
  //   }
    
  //   try {
  //     const response = await clientService.put<ApiResponse<FeatureCategoryItem>>(
  //       `/feature-categories/${itemId}`,
  //       { status }
  //     );

  //     const result = response.data;
      
  //     if (!result.success) {
  //       throw new Error(result.message || 'Failed to update category status');
  //     }

  //     await queryClient.invalidateQueries({ queryKey: ['feature-categories'] });
  //     toast.success(`Status updated to ${status}`);
  //   } catch (error) {
  //     console.error('❌ Error updating category status:', error);
  //     toast.error(`Failed to update category status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  //   }
  // };

// Handle status change - WITH AUTO-FEATURED STATUS UPDATE
const handleStatusChange = async (item: FeatureCategoryItem, status: 'active' | 'inactive') => {
  if (!isClient) return;
  
  // Check permission
  if (!hasPermission('feature_categories.edit')) {
    toast.error('You do not have permission to update category status');
    return;
  }
  
  const itemId = item._id;
  if (!itemId) {
    console.error('❌ Cannot update status: No ID found in item:', item);
    toast.error('Cannot update status: Item ID is missing');
    return;
  }
  
  try {
    console.log('🎯 Updating status for:', {
      itemId,
      itemName: item.name,
      currentStatus: item.status,
      newStatus: status,
      isCurrentlyFeatured: item.isFeatured
    });
    
    // 🚨 CRITICAL: If status is changing to inactive and item is featured,
    // we need to auto-unfeature it
    const needsUnfeature = (status === 'inactive' && item.isFeatured);
    
    // First, update the status
    const response = await clientService.put<ApiResponse<FeatureCategoryItem>>(
      `/feature-categories/${itemId}`,
      { status }
    );

    const result = response.data;
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update category status');
    }

    // 🚨 AUTO-UNFEATURE if status is inactive
    if (needsUnfeature) {
      console.log('🔄 Auto-unfeaturing category due to inactive status');
      try {
        await clientService.patch<ApiResponse<FeatureCategoryItem>>(
          `/feature-categories/${itemId}/toggle-featured`,
          {}
        );
        console.log('✅ Successfully auto-unfeatured category');
      } catch (unfeatureError) {
        console.error('⚠️ Failed to auto-unfeature category:', unfeatureError);
        // Continue anyway - the status update succeeded
      }
    }

    // Invalidate all related queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['feature-categories'] }),
      queryClient.invalidateQueries({ queryKey: ['featured-limit-info'] }),
    ]);
    
    // Refresh featured limit info
    const updatedInfo = await fetchFeaturedLimitInfo();
    setFeaturedLimitInfo(updatedInfo);
    
    toast.success(`Status updated to ${status}${needsUnfeature ? ' (and unfeatured)' : ''}`);
  } catch (error) {
    console.error('❌ Error updating category status:', error);
    toast.error(`Failed to update category status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};


  // Extract feature category items and total count
  const { items: featureCategoryItems, totalItems } = useMemo(() => {
    if (!isClient) {
      return { items: [], totalItems: 0 };
    }
    
    if (!featureCategoriesData) {
      return { items: [], totalItems: 0 };
    }
    
    return {
      items: featureCategoriesData.items || [],
      totalItems: featureCategoriesData.totalItems || 0
    };
  }, [featureCategoriesData, isClient]);

  // Transform data for DataGrid
  const dataWithSerial: DataGridRow[] = useMemo(() => {
    if (!isClient) return [];
    
    if (!featureCategoryItems || featureCategoryItems.length === 0) {
      return [];
    }
    
    const transformedData = featureCategoryItems.map((item: FeatureCategoryItem, index: number) => ({
      id: item._id,
      _id: item._id,
      serialNo: (currentPage - 1) * limit + (index + 1),
      name: item.name,
      description: item.description,
      type: item.type,
      status: item.status,
      isFeatured: item.isFeatured,
      featuredOrder: item.featuredOrder,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      statusBadgeColor: item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
      featuredBadgeColor: item.isFeatured ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800',
    }));
    
    return transformedData;
  }, [featureCategoryItems, currentPage, limit, isClient]);

  // Use the feature category columns hook
  const columns = useFeatureCategoryColumns({
    onEdit: handleEditItem,
    onDelete: (item: FeatureCategoryItem) => {
      setDeletingItem(item);
    },
    onStatusChange: handleStatusChange,
    onFeaturedToggle: handleFeaturedToggle,
    onView: handleViewItem,
    permissions: permissions,
    featuredLimitInfo: featuredLimitInfo
  });

  // Handle Add Item button click
  const handleAddItem = () => {
    if (!hasPermission('feature_categories.create')) {
      toast.error('You do not have permission to add feature categories');
      return;
    }
    
    router.push('/content-management/featured-categories/add');
  };

  // Featured limit indicator component
  const FeaturedLimitIndicator = () => {
    if (!featuredLimitInfo) return null;
    
    const { currentFeatured, maxFeatured, canAddMore, availableSlots } = featuredLimitInfo;
    
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
        <div className="text-sm font-medium text-blue-800">
          Featured Categories: {currentFeatured}/{maxFeatured}
        </div>
        <div className="h-4 w-px bg-blue-300"></div>
        <div className={`text-sm ${canAddMore ? 'text-green-600' : 'text-red-600'}`}>
          {canAddMore ? `${availableSlots} slots available` : 'Maximum featured limit reached'}
        </div>
      </div>
    );
  };

  // Filters component
  const FeatureCategoryFilters = (
    <div className="flex flex-col gap-4">
      {/* Featured Limit Indicator */}
      <FeaturedLimitIndicator />
      
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

        {/* <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!isClient}
          >
            <option value="">All Types</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Home">Home</option>
            <option value="Sports">Sports</option>
            <option value="Books">Books</option>
            <option value="General">General</option>
            <option value="Other">Other</option>
          </select>
        </div> */}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Featured</label>
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!isClient}
          >
            <option value="">All</option>
            <option value="true">Featured</option>
            <option value="false">Not Featured</option>
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
            setTypeFilter('');
            setFeaturedFilter('');
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
  if (!hasPermission('feature_categories.view')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the feature categories management page.
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
          <h3 className="text-sm font-medium text-red-800">Error loading feature categories</h3>
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
    currentPage: currentPage,
    featuredLimitInfo: featuredLimitInfo
  });

  return (
    <div>
      <DataGridWrapper
        title="Feature Categories Management"
        description="Manage featured categories with maximum 4 featured items limit"
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
        searchPlaceholder="Search categories by name, description, or type..."
        filtersComponent={FeatureCategoryFilters}
        defaultFiltersExpanded={true}
        hasAddButton={true}
        addButtonText="Add New Category"
        addButtonOnClick={handleAddItem}
        addButtonPermission="feature_categories.create"
        hasExportButton={true}
        onExport={() => toast.info('Export functionality coming soon')}
        allPermissions={permissions}
        enableRowActions={true}
        editPermission="feature_categories.edit"
        deletePermission="feature_categories.delete"
        // viewPermission="feature_categories.view"
        // additionalInfo={featuredLimitInfo && (
        //   <div className="text-sm text-gray-600">
        //     Featured: {featuredLimitInfo.currentFeatured}/{featuredLimitInfo.maxFeatured}
        //     {!featuredLimitInfo.canAddMore && ' (Limit Reached)'}
        //   </div>
        // )}
      />

      <DeleteConfirmationModal
        isOpen={!!deletingItem}
        onClose={() => !isDeleting && setDeletingItem(null)}
        onConfirm={handleDeleteItem}
        title="Delete Feature Category"
        message="Are you sure you want to delete this feature category? This action cannot be undone."
        itemName={getCategoryPreview(deletingItem?.name)}
        isLoading={isDeleting}
      />

      <FeatureCategoryViewModal
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

export default FeatureCategoriesPage;