'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DataGridWrapper from '../../../_components/_data-grid/DataGridWrapper';
import DeleteConfirmationModal from '../../../_components/_modals/DeleteConfirmationModal';
import DateRangeFilter from '../../../_components/_filters/DateRangeFilter';
import { clientService } from '../../../app/utils/api-client';
import { usePermissions } from '../../../_components/contexts/PermissionContext';
import { useReviewsColumns } from '../../../_components/_hooks/useFeaturedReviewsColumns';
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

// Review Item Interface based on your model
interface ReviewItem {
  _id: string;
  listingId: string;
  categoryId: string;
  userEmail: string;
  rating: number;
  title: string;
  content: string;
  images?: Array<{
    url: string;
    publicId?: string;
    uploadedAt: string;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
   productImage?: string; // ADD THIS - from listing
  listingTitle?: string; // ADD THIS - from populated data
  categoryName?: string; // ADD THIS - from populated data
}

// DataGrid Row Interface
interface DataGridRow {
  id: string;
  _id: string;
  serialNo: number;
  userEmail: string;
  image?: string; // First image or placeholder
  title: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
  listingTitle?: string; // ADD THIS
  categoryName?: string; // ADD THIS
}

const ReviewsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { permissions } = usePermissions();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingItem, setDeletingItem] = useState<ReviewItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
    return hasPerm;
  };

  // Fetch reviews from API
  const { 
    data: reviewsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['reviews', search, statusFilter, ratingFilter, startDate, endDate, currentPage],
    queryFn: async (): Promise<ReviewItem[]> => {
      if (!isClient) {
        console.log('🔄 Skipping fetch - not on client yet');
        return [];
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(ratingFilter && { rating: ratingFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      console.log('🔍 Fetching reviews from:', `/reviews/?${params}`);
      
      try {
        // Remove /admin from the endpoint since your routes don't have it
       const response = await clientService.get<ApiResponse<ReviewItem[]>>(`/reviews/?${params}`);
        console.log('✅ API Response:', response.data);
        
        const apiData = response.data;
        
        if (apiData.success && apiData.data) {
          const items = apiData.data;
          console.log('✅ Extracted items:', items.length, 'items');
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

  // Delete item function
  const deleteItem = async (itemId: string): Promise<void> => {
    const response = await clientService.delete<ApiResponse>(`/reviews/${itemId}`);
    const result = response.data;
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete review');
    }
  };

  // Handle edit item (if needed, but you said no actions)
  const handleEditItem = (item: DataGridRow) => {
    // Check permission
    if (!hasPermission('reviews.edit')) {
      toast.error('You do not have permission to edit reviews');
      return;
    }
    
    console.log('🔄 Edit item clicked:', item);
    
    const itemId = item.id;
    if (!itemId) {
      console.error('❌ Cannot edit: No ID found in item:', item);
      toast.error('Cannot edit: Item ID is missing');
      return;
    }
    
    const editUrl = `/content-management/reviews/edit/${encodeURIComponent(itemId)}`;
    router.push(editUrl);
  };

  // Handle delete item
  const handleDeleteItem = async () => {
    if (!deletingItem || !isClient) return;
    
    // Check permission
    if (!hasPermission('reviews.delete')) {
      toast.error('You do not have permission to delete reviews');
      setDeletingItem(null);
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteItem(deletingItem._id);
      
      await queryClient.invalidateQueries({ 
        queryKey: ['reviews'], 
        refetchType: 'all'
      });
      
      setDeletingItem(null);
      toast.success('Review deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting review:', error);
      toast.error(`Failed to delete review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle status change
  // const handleStatusChange = async (item: DataGridRow, status: 'pending' | 'approved' | 'rejected') => {
  //   if (!isClient) return;
    
  //   // Check permission
  //   if (!hasPermission('reviews.edit')) {
  //     toast.error('You do not have permission to update review status');
  //     return;
  //   }
    
  //   const itemId = item.id;
  //   if (!itemId) {
  //     console.error('❌ Cannot update status: No ID found in item:', item);
  //     toast.error('Cannot update status: Item ID is missing');
  //     return;
  //   }
    
  //   try {
  //     const response = await clientService.put<ApiResponse>(`/reviews/${itemId}`, {
  //       status: status
  //     });

  //     const result = response.data;
      
  //     if (!result.success) {
  //       throw new Error(result.message || 'Failed to update review status');
  //     }

  //     await queryClient.invalidateQueries({ queryKey: ['reviews'] });
  //     toast.success(`Status updated to ${status}`);
  //   } catch (error) {
  //     console.error('❌ Error updating review status:', error);
  //     toast.error(`Failed to update review status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  //   }
  // };

// Handle status change - for admin moderation only
const handleStatusChange = async (item: DataGridRow, status: 'pending' | 'approved' | 'rejected') => {
  if (!isClient) return;
  
  // Check if user has permission to update review status
  if (!hasPermission('reviews.edit')) {
    toast.error('You do not have permission to moderate reviews');
    return;
  }
  
  const itemId = item.id;
  if (!itemId) {
    console.error('❌ Cannot update status: No ID found in item:', item);
    toast.error('Cannot update status: Item ID is missing');
    return;
  }
  
  console.log('🔥 Admin moderating review:', { 
    reviewId: itemId, 
    currentStatus: item.status, 
    newStatus: status,
    title: item.title 
  });
  
  try {
    // Call the status-only endpoint
    const response = await clientService.put<ApiResponse>(`/reviews/${itemId}/status`, {
      status: status
    });

    const result = response.data;
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update review status');
    }

    // Refresh the reviews list
    await queryClient.invalidateQueries({ queryKey: ['reviews'] });
    toast.success(`Review ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'set to pending'}`);
    
  } catch (error) {
    console.error('❌ Error updating review status:', error);
    
    // Show user-friendly error message
    let errorMessage = 'Failed to update review status';
    if (error instanceof Error) {
      if (error.message.includes('403')) {
        errorMessage = 'You do not have permission to moderate this review';
      } else if (error.message.includes('404')) {
        errorMessage = 'Review not found';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else {
        errorMessage = error.message;
      }
    }
    
    toast.error(errorMessage);
  }
};


  // Extract review items
  const reviewItems: ReviewItem[] = useMemo(() => {
    if (!isClient) return [];
    
    if (!reviewsData) {
      return [];
    }
    
    // If it's already an array of ReviewItem, return it
    if (Array.isArray(reviewsData)) {
      return reviewsData;
    }
    
    return [];
  }, [reviewsData, isClient]);

  // Extract total count
  const totalItems = useMemo(() => {
    if (!isClient) return 0;
    
    if (!reviewsData) {
      return 0;
    }
    
    if (Array.isArray(reviewsData)) {
      return reviewsData.length;
    }
    
    return reviewItems.length;
  }, [reviewsData, reviewItems, isClient]);

  // Transform data for DataGrid
  // const dataWithSerial: DataGridRow[] = useMemo(() => {
  //   if (!isClient) return [];
    
  //   if (!reviewItems || reviewItems.length === 0) {
  //     return [];
  //   }
    
  //   const transformedData = reviewItems.map((item: ReviewItem, index: number) => {
  //     // Get first image or use placeholder
  //     const firstImage = item.images && item.images.length > 0 
  //       ? item.images[0].url 
  //       : undefined;
      
  //     return {
  //       id: item._id,
  //       _id: item._id,
  //       serialNo: (currentPage - 1) * limit + (index + 1),
  //       userEmail: item.userEmail,
  //       image: firstImage,
  //       title: item.title,
  //       content: item.content.length > 100 ? item.content.substring(0, 100) + '...' : item.content,
  //       rating: item.rating,
  //       status: item.status,
  //       isVerifiedPurchase: item.isVerifiedPurchase,
  //       helpfulVotes: item.helpfulVotes,
  //       reportCount: item.reportCount,
  //       createdAt: item.createdAt,
  //       updatedAt: item.updatedAt,
  //     };
  //   });
    
  //   return transformedData;
  // }, [reviewItems, currentPage, limit, isClient]);

// Transform data for DataGrid
const dataWithSerial: DataGridRow[] = useMemo(() => {
  if (!isClient) return [];
  
  if (!reviewItems || reviewItems.length === 0) {
    return [];
  }
  
  console.log('🔄 Transforming review items:', reviewItems.length);
  
  const transformedData = reviewItems.map((item: ReviewItem, index: number) => {
    // DEBUG: Check what data we have
    console.log('🔍 Review item:', {
      id: item._id,
      hasProductImage: !!item.productImage,
      productImage: item.productImage,
      hasImages: item.images?.length || 0,
      images: item.images,
      listingTitle: item.listingTitle
    });
    
    // Use productImage from listing FIRST, then fallback to first review image
    const imageToShow = item.productImage || 
      (item.images && item.images.length > 0 ? item.images[0].url : undefined);
    
    return {
      id: item._id,
      _id: item._id,
      serialNo: (currentPage - 1) * limit + (index + 1),
      userEmail: item.userEmail,
      image: imageToShow, // Use productImage or first review image
      title: item.title,
      content: item.content.length > 100 ? item.content.substring(0, 100) + '...' : item.content,
      rating: item.rating,
      status: item.status,
      isVerifiedPurchase: item.isVerifiedPurchase,
      helpfulVotes: item.helpfulVotes,
      reportCount: item.reportCount,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      listingTitle: item.listingTitle, // Pass this to columns if needed
      categoryName: item.categoryName, // Pass this to columns if needed
    };
  });
  
  return transformedData;
}, [reviewItems, currentPage, limit, isClient]);


  // Handle Add Item button click (if needed)
  const handleAddItem = () => {
    if (!hasPermission('reviews.create')) {
      toast.error('You do not have permission to add reviews');
      return;
    }
    
    router.push('/content-management/reviews/add');
  };

  // Use the reviews columns hook WITHOUT actions
  const columns = useReviewsColumns({
    onEdit: undefined, // No edit action
    onDelete: undefined, // No delete action
    onStatusChange: handleStatusChange,
    onView: undefined, // No view action
    permissions: permissions
  });

  // Filters component
  const ReviewsFilters = (
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
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Rating</label>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={!isClient}
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
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
          setRatingFilter('');
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
  if (!hasPermission('reviews.view')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the reviews management page.
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
          <h3 className="text-sm font-medium text-red-800">Error loading reviews</h3>
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

  return (
    <div>
      <DataGridWrapper
        title="Reviews Management"
        description="Manage user reviews for listings"
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
        searchPlaceholder="Search by user email, title or content..."
        filtersComponent={ReviewsFilters}
        defaultFiltersExpanded={true}
        hasAddButton={false} // Reviews are usually user-submitted
        hasExportButton={true}
        onExport={() => toast.info('Export functionality coming soon')}
        allPermissions={permissions}
        enableRowActions={false} // Disable row actions as requested
      />

      <DeleteConfirmationModal
        isOpen={!!deletingItem}
        onClose={() => !isDeleting && setDeletingItem(null)}
        onConfirm={handleDeleteItem}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        itemName={deletingItem?.title}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ReviewsPage;