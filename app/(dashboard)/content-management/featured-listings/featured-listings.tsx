'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Added useCallback
import { useRouter } from 'next/navigation';
import { clientService } from '../../../app/utils/api-client';
import { usePermissions } from '../../../_components/contexts/PermissionContext';
import FeatureListingViewModal from '../_components/view-modal/featured-listings-ViewModal';
import { toast } from 'react-toastify';
import { 
  FolderOpen, 
  ChevronDown,
  Plus,
  Search,
  Loader2,
  Star
} from 'lucide-react';
import DeleteConfirmationModal from '../../../_components/_modals/DeleteConfirmationModal';
import SimpleTable from './listingtable';
import { useFeatureListingsColumns } from '../../../_components/_hooks/useFeaturedListingsColumns';
import type { DataGridRow } from '../../../_components/_hooks/useFeaturedListingsColumns';
import { AxiosResponse } from 'axios';

// Interfaces
interface FeatureCategory {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  featuredListingsCount?: number;
}

interface FeaturedListing {
  _id: string;
  name: string;
  description: string;
  price: number;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  displayOrder: number;
  featureCategory: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  createdByName?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

const FeaturedListingsPage = () => {
  const router = useRouter();
  const { permissions } = usePermissions();
  const [isClient, setIsClient] = useState(false);
  
  // States
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<FeatureCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [listingsData, setListingsData] = useState<FeaturedListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [deletingItem, setDeletingItem] = useState<FeaturedListing | FeatureCategory | null>(null);
  const [viewingItem, setViewingItem] = useState<FeaturedListing | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Set isClient only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug: Check permissions on load
  useEffect(() => {
    if (isClient) {
      console.log('🔐 DEBUG: Permissions on load:', {
        permissions,
        hasEditPermission: permissions['featured_listings.edit'],
        isStaticAdmin: permissions.isStaticAdmin
      });
    }
  }, [permissions, isClient]);

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

  // Load categories on mount
  useEffect(() => {
    if (isClient) {
      fetchCategories();
    }
  }, [isClient]);

  // Fetch ALL categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response: AxiosResponse<ApiResponse<FeatureCategory[]>> = await clientService.get('/feature-categories');
      const categoriesData = Array.isArray(response.data.data) ? response.data.data : [];
      
      // Filter categories to only those that have listings. If the API provides counts, use them.
      const candidates = categoriesData.map((c: any) => ({
        ...c,
        listingsCount: c.listingsCount ?? c.totalListings ?? undefined,
        featuredListingsCount: c.featuredListingsCount ?? c.featuredCount ?? 0,
      }));

      const needsCheck = candidates.filter((c: any) => c.listingsCount === undefined || c.listingsCount === null);
      const checked: Record<string, boolean> = {};

      if (needsCheck.length > 0) {
        await Promise.all(needsCheck.map(async (cat: any) => {
          try {
            const r: AxiosResponse<ApiResponse> = await clientService.get(`/featured-listings?category=${cat._id}&limit=1`);
            const d = r?.data?.data;
            const has = Array.isArray(d) ? d.length > 0 : !!(d && d.listings && d.listings.length > 0);
            checked[cat._id] = has;
          } catch (err) {
            checked[cat._id] = false;
          }
        }));
      }

      const finalCategories = candidates.filter((c: any) => {
        if ((c.listingsCount ?? 0) > 0) return true;
        if ((c.featuredListingsCount ?? 0) > 0) return true;
        if (checked[c._id]) return true;
        return false;
      });

      setCategories(finalCategories);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch listings for a category - useCallback to prevent unnecessary re-renders
  const fetchCategoryListings = useCallback(async (categoryId: string, onlyFeatured: boolean = false) => {
    try {
      setLoadingListings(true);
      const params = new URLSearchParams({ category: categoryId, limit: '100' });
      if (onlyFeatured) params.set('isFeatured', 'true');
      const response: AxiosResponse<ApiResponse<FeaturedListing[]>> = await clientService.get(`/featured-listings?${params.toString()}`);

      if (!response?.data) {
        toast.error('No data received from server');
        setListingsData([]);
        return;
      }

      const apiData = response.data;
      let listings: FeaturedListing[] = [];

      if (apiData.success) {
        if (Array.isArray(apiData.data)) {
          listings = apiData.data;
        } else if (apiData.data && typeof apiData.data === 'object' && 'listings' in apiData.data && Array.isArray((apiData.data as any).listings)) {
          listings = (apiData.data as any).listings;
        }
      } else if (Array.isArray(apiData)) {
        listings = apiData;
      }
      
      const formattedListings = listings.map((listing: any) => ({
        _id: listing._id,
        name: listing.name || '',
        description: listing.description || '',
        price: listing.price || 0,
        status: listing.status || 'inactive',
        isFeatured: listing.isFeatured || false,
        displayOrder: listing.displayOrder || 0,
        featureCategory: listing.featureCategory?._id || listing.featureCategory || '',
        image: listing.image?.url || listing.image || '',
        formattedPrice: `$${(listing.price || 0).toFixed(2)}`,
        createdAt: listing.createdAt || '',
        updatedAt: listing.updatedAt || '',
        createdBy: listing.createdBy || '',
        createdByName: listing.createdByName || ''
      }));
      
      setListingsData(formattedListings);
      
    } catch (error: any) {
      console.error('❌ Error loading listings:', error);
      toast.error('Failed to load listings');
      setListingsData([]);
    } finally {
      setLoadingListings(false);
    }
  }, []);

  // Toggle category expansion
  const handleToggleCategory = async (categoryId: string) => {
    if (expandedCategoryId === categoryId) {
      setExpandedCategoryId(null);
      setListingsData([]);
    } else {
      setExpandedCategoryId(categoryId);
      await fetchCategoryListings(categoryId);
    }
  };

  // Convert API listings into DataGrid rows - FIXED VERSION
  const listingRows: DataGridRow[] = useMemo(() => {
    const listings = Array.isArray(listingsData) ? listingsData : [];
    
    return listings.map((l, idx) => ({
      id: l._id, // This is IMPORTANT - must match DataGridRow.id
      _id: l._id,
      serialNo: idx + 1,
      name: l.name || '',
      description: l.description || '',
      image: l.image || '',
      price: l.price || 0,
      formattedPrice: `$${(l.price || 0).toFixed(2)}`,
      status: l.status || 'inactive',
      isFeatured: l.isFeatured || false,
      featuredOrder: null,
      displayOrder: l.displayOrder || 0,
      featureCategory: l.featureCategory || '',
      categoryId: expandedCategoryId || undefined,
      createdAt: l.createdAt || '',
      updatedAt: l.updatedAt || '',
      createdBy: l.createdBy || '',
      createdByName: l.createdByName || '',
      tags: [],
      views: 0,
      clicks: 0,
      rowType: 'listing' as const,
    }));
  }, [listingsData, expandedCategoryId]);

  // Debug: Check row structure
  useEffect(() => {
    if (isClient && listingRows.length > 0) {
      console.log('🔍 DEBUG: Listing rows analysis:', {
        totalRows: listingRows.length,
        firstRow: listingRows[0],
        firstRowType: typeof listingRows[0],
        firstRowKeys: Object.keys(listingRows[0]),
        firstRowId: listingRows[0].id,
        firstRow_id: listingRows[0]._id,
        firstRowStatus: listingRows[0].status,
        isDataGridRow: 'id' in listingRows[0] && '_id' in listingRows[0] && 'status' in listingRows[0]
      });
    }
  }, [listingRows, isClient]);

  // Debug: Log listingsData changes
  useEffect(() => {
    if (isClient && listingsData.length > 0) {
      console.log('📊 listingsData updated:', {
        count: listingsData.length,
        items: listingsData.map(l => ({ id: l._id, name: l.name, status: l.status }))
      });
    }
  }, [listingsData, isClient]);

  // Add new listing to category
  const handleAddListing = (categoryId: string) => {
    // Check permission
    if (!hasPermission('featured_listings.create')) {
      toast.error('You do not have permission to add featured listings');
      return;
    }
    
    router.push(`/content-management/featured-listings/add?category=${categoryId}`);
  };

  // Edit listing
  const handleEditListing = (row: DataGridRow) => {
    // Check permission
    if (!hasPermission('featured_listings.edit')) {
      toast.error('You do not have permission to edit featured listings');
      return;
    }
    
    console.log('✏️ Edit listing clicked:', row._id);
    router.push(`/content-management/featured-listings/edit/${row._id}`);
  };

  // Delete listing
  const handleDeleteListing = async () => {
    if (!deletingItem || !('featureCategory' in deletingItem)) return;
    
    // Check permission
    if (!hasPermission('featured_listings.delete')) {
      toast.error('You do not have permission to delete featured listings');
      setDeletingItem(null);
      return;
    }
    
    setIsDeleting(true);
    try {
      await clientService.delete(`/featured-listings/${deletingItem._id}`);
      
      if (expandedCategoryId) {
        await fetchCategoryListings(expandedCategoryId);
      }
      
      toast.success('Listing deleted successfully');
      setDeletingItem(null);
    } catch (error: any) {
      console.error('❌ Error deleting listing:', error);
      toast.error('Failed to delete listing');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle status change - FIXED WITH OPTIMISTIC UPDATES
// Handle status change - OPTIMIZED (no page reload)
// const handleStatusChange = async (row: DataGridRow, newStatus: 'active' | 'inactive') => {
//   console.log('🎯 handleStatusChange FUNCTION CALLED with:', {
//     rowId: row._id,
//     rowName: row.name,
//     currentStatus: row.status,
//     newStatus: newStatus,
//   });
  
//   // Check permission
//   if (!hasPermission('featured_listings.edit')) {
//     toast.error('You do not have permission to update listing status');
//     return;
//   }
  
//   const itemId = row._id || row.id;
//   if (!itemId) {
//     console.error('❌ No item ID found in row:', row);
//     toast.error('Cannot update status: Item ID is missing');
//     return;
//   }
  
//   // OPTIMISTIC UPDATE: Immediately update the UI
//   const previousData = [...listingsData];
//   setListingsData(prev => prev.map(item => 
//     item._id === row._id ? { ...item, status: newStatus } : item
//   ));
  
//   try {
//     const apiUrl = `/featured-listings/${itemId}/status`;
    
//     const response: AxiosResponse<ApiResponse<FeaturedListing>> = await clientService.patch(
//       apiUrl,
//       { status: newStatus }
//     );
    
//     console.log('✅ API Response received:', {
//       success: response.data.success,
//       message: response.data.message,
//       data: response.data.data,
//       statusCode: response.status
//     });
    
//     if (response.data.success) {
//       console.log('✅ Status updated successfully in backend');
      
//       // ⚠️ REMOVED THIS LINE - Don't refresh the entire list!
//       // if (expandedCategoryId) {
//       //   console.log('🔄 Refreshing listings from server...');
//       //   await fetchCategoryListings(expandedCategoryId);
//       // }
      
//       // Instead, just update with server response data if needed
//       if (response.data.data) {
//         setListingsData(prev => prev.map(item => 
//           item._id === row._id ? { 
//             ...item, 
//             ...response.data.data 
//           } : item
//         ));
//       }
      
//       toast.success(`Status updated to ${newStatus}`);
//     } else {
//       // Revert optimistic update if API fails
//       setListingsData(previousData);
//       throw new Error(response.data.message);
//     }
//   } catch (error: any) {
//     // Revert optimistic update on error
//     setListingsData(previousData);
    
//     console.error('❌ ERROR in handleStatusChange:', error);
//     toast.error(`Failed to update status: ${error.message || 'Unknown error'}`);
//   }
// };


// Handle status change - WITH AUTO-FEATURED STATUS UPDATE
const handleStatusChange = async (row: DataGridRow, newStatus: 'active' | 'inactive') => {
  console.log('🎯 handleStatusChange FUNCTION CALLED with:', {
    rowId: row._id,
    rowName: row.name,
    currentStatus: row.status,
    newStatus: newStatus,
  });
  
  // Check permission
  if (!hasPermission('featured_listings.edit')) {
    toast.error('You do not have permission to update listing status');
    return;
  }
  
  const itemId = row._id || row.id;
  if (!itemId) {
    console.error('❌ No item ID found in row:', row);
    toast.error('Cannot update status: Item ID is missing');
    return;
  }
  
  // OPTIMISTIC UPDATE: Immediately update the UI
  const previousData = [...listingsData];
  
  // 🚨 CRITICAL FIX: Auto-update featured status based on new status
  const updates = {
    status: newStatus,
    // If status becomes inactive, automatically set isFeatured to false
    isFeatured: newStatus === 'inactive' ? false : row.isFeatured
  };
  
  setListingsData(prev => prev.map(item => 
    item._id === row._id ? { ...item, ...updates } : item
  ));
  
  try {
    const apiUrl = `/featured-listings/${itemId}/status`;
    
    const response: AxiosResponse<ApiResponse<FeaturedListing>> = await clientService.patch(
      apiUrl,
      { status: newStatus }
    );
    
    console.log('✅ API Response received:', {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
      statusCode: response.status
    });
    
    if (response.data.success) {
      console.log('✅ Status updated successfully in backend');
      
      // 🚨 Additional API call if we need to auto-unfeature
      if (newStatus === 'inactive' && row.isFeatured) {
        console.log('🔄 Auto-unfeaturing listing due to inactive status');
        try {
          await clientService.patch(`/featured-listings/${itemId}/toggle-featured`);
        } catch (error) {
          console.error('⚠️ Failed to auto-unfeature listing:', error);
          // Don't revert on this error - the status update succeeded
        }
      }
      
      // Update with server response data if needed
      if (response.data.data) {
        setListingsData(prev => prev.map(item => 
          item._id === row._id ? { 
            ...item, 
            ...response.data.data,
            // Ensure isFeatured is false if status is inactive
            isFeatured: newStatus === 'inactive' ? false : response.data.data.isFeatured
          } : item
        ));
      }
      
      toast.success(`Status updated to ${newStatus}${newStatus === 'inactive' ? ' (and unfeatured)' : ''}`);
    } else {
      // Revert optimistic update if API fails
      setListingsData(previousData);
      throw new Error(response.data.message);
    }
  } catch (error: any) {
    // Revert optimistic update on error
    setListingsData(previousData);
    
    console.error('❌ ERROR in handleStatusChange:', error);
    toast.error(`Failed to update status: ${error.message || 'Unknown error'}`);
  }
};


  // Toggle featured status
// Toggle featured status - OPTIMIZED (no page reload)
// const handleToggleFeatured = async (row: DataGridRow) => {
//   // Check permission
//   if (!hasPermission('featured_listings.edit')) {
//     toast.error('You do not have permission to update featured status');
//     return;
//   }
  
//   // OPTIMISTIC UPDATE: Immediately update the UI
//   const previousData = [...listingsData];
//   const newFeaturedStatus = !row.isFeatured;
  
//   setListingsData(prev => prev.map(item => 
//     item._id === row._id ? { ...item, isFeatured: newFeaturedStatus } : item
//   ));
  
//   try {
//     const response: AxiosResponse<ApiResponse<FeaturedListing>> = await clientService.patch(
//       `/featured-listings/${row._id}/toggle-featured`
//     );
    
//     if (response.data.success) {
//       console.log('✅ Featured status updated successfully in backend');
      
//       // ⚠️ REMOVED THIS LINE - Don't refresh the entire list!
//       // await fetchCategoryListings(expandedCategoryId!);
      
//       // Update with server data
//       if (response.data.data) {
//         setListingsData(prev => prev.map(item => 
//           item._id === row._id ? { 
//             ...item, 
//             ...response.data.data 
//           } : item
//         ));
//       }
      
//       toast.success(`Listing ${newFeaturedStatus ? 'featured' : 'unfeatured'} successfully`);
//     } else {
//       setListingsData(previousData);
//       throw new Error(response.data.message);
//     }
//   } catch (error: any) {
//     setListingsData(previousData);
//     console.error('❌ Error toggling featured:', error);
//     toast.error('Failed to update featured status');
//   }
// };



// Toggle featured status - WITH STATUS CHECK
const handleToggleFeatured = async (row: DataGridRow) => {
  // Check permission
  if (!hasPermission('featured_listings.edit')) {
    toast.error('You do not have permission to update featured status');
    return;
  }
  
  // 🚨 NEW CHECK: Prevent featuring if status is inactive
  if (row.status === 'inactive' && !row.isFeatured) {
    toast.error('Cannot feature an inactive listing. Please activate it first.');
    return;
  }
  
  // OPTIMISTIC UPDATE: Immediately update the UI
  const previousData = [...listingsData];
  const newFeaturedStatus = !row.isFeatured;
  
  setListingsData(prev => prev.map(item => 
    item._id === row._id ? { ...item, isFeatured: newFeaturedStatus } : item
  ));
  
  try {
    const response: AxiosResponse<ApiResponse<FeaturedListing>> = await clientService.patch(
      `/featured-listings/${row._id}/toggle-featured`
    );
    
    if (response.data.success) {
      console.log('✅ Featured status updated successfully in backend');
      
      // Update with server data
      if (response.data.data) {
        setListingsData(prev => prev.map(item => 
          item._id === row._id ? { 
            ...item, 
            ...response.data.data 
          } : item
        ));
      }
      
      toast.success(`Listing ${newFeaturedStatus ? 'featured' : 'unfeatured'} successfully`);
    } else {
      setListingsData(previousData);
      throw new Error(response.data.message);
    }
  } catch (error: any) {
    setListingsData(previousData);
    console.error('❌ Error toggling featured:', error);
    toast.error('Failed to update featured status');
  }
};


  // Handle view item
  const handleViewItem = (row: DataGridRow) => {
    // Check permission
    if (!hasPermission('featured_listings.view')) {
      toast.error('You do not have permission to view featured listing details');
      return;
    }
    
    if (!row || !row._id) {
      console.error('❌ Cannot view: Invalid item data', row);
      toast.error('Cannot view listing: Invalid data');
      return;
    }
    
    console.log('🔍 Viewing item (DataGridRow):', row);
    
    // Find the full listing data from listingsData
    const fullListing = listingsData.find(l => l._id === row._id);
    
    if (!fullListing) {
      console.error('❌ Full listing data not found for:', row._id);
      toast.error('Cannot view listing: Data not found');
      return;
    }
    
    setViewingItem(fullListing);
    setIsViewModalOpen(true);
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name?.toLowerCase().includes(search.toLowerCase()) ||
    category.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Get current featured count
  const currentFeaturedCount = useMemo(() => {
    if (!expandedCategoryId) return 0;
    const category = categories.find((c) => c._id === expandedCategoryId);
    return category?.featuredListingsCount || 0;
  }, [expandedCategoryId, categories]);

  // Debug: Check column hook props
  useEffect(() => {
    if (isClient) {
      console.log('🎯 DEBUG: Columns hook props check:', {
        onStatusChangeProvided: !!handleStatusChange,
        onEditProvided: !!handleEditListing,
        onViewProvided: !!handleViewItem,
        onDeleteProvided: true,
        onFeaturedToggleProvided: !!handleToggleFeatured,
        permissions: permissions,
        hasEditPermission: permissions['featured_listings.edit'],
        featuredCount: currentFeaturedCount
      });
    }
  }, [isClient, permissions, currentFeaturedCount]);

  // Use the column hook - IMPORTANT: Pass the current listingsData for local updates
  const columns = useFeatureListingsColumns({
    onEdit: handleEditListing,
    onDelete: (row) => {
      console.log('🗑️ Delete callback triggered for:', row._id);
      // Check permission before showing delete confirmation
      if (!hasPermission('featured_listings.delete')) {
        toast.error('You do not have permission to delete featured listings');
        return;
      }
      setDeletingItem({
        _id: row._id,
        name: row.name,
        featureCategory: row.featureCategory
      } as FeaturedListing);
    },
    onStatusChange: (row, status) => {
      console.log('🔄 onStatusChange callback triggered from column hook:', {
        rowId: row._id,
        rowName: row.name,
        newStatus: status
      });
      handleStatusChange(row, status);
    },
    onFeaturedToggle: handleToggleFeatured,
    onView: handleViewItem,
    permissions,
    featuredCount: currentFeaturedCount,
    // Pass data for local state management
    data: listingRows,
    // Add refresh callback
    onRefresh: expandedCategoryId ? () => fetchCategoryListings(expandedCategoryId) : undefined,
  });

  // Transform columns for SimpleTable component
  const simpleTableColumns = useMemo(() => {
    return columns.map(column => ({
      name: column.name,
      cell: column.cell,
      width: column.width,
      center: column.name === 'S.No',
    }));
  }, [columns]);

  // Loading state for server render
  if (!isClient) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
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
  if (!hasPermission('featured_listings.view')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the featured listings management page.
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Featured Listings</h1>
            <p className="text-gray-600 mt-1">Manage listings for each category</p>
          </div>
          
          <div className="flex gap-2">
            {hasPermission('featured_listings.create') && (
              <button
                onClick={() => router.push('/content-management/featured-listings/add')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add New Listing
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar for Categories */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search categories..."
            />
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {loadingCategories ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <div className="mt-2 text-gray-600">Loading categories...</div>
          </div>
        ) : !Array.isArray(categories) || categories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No categories found
            </h3>
            <div className="text-gray-600 mb-4">
              {search ? 'Try a different search term' : 'Create categories first'}
            </div>
            <button
              onClick={() => router.push('/content-management/feature-categories/add')}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
            >
              Create Listing
            </button>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Category Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                    <div className="flex items-center gap-2">
                      {category.isFeatured && (
                        <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Featured
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        category.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2 ml-8">{category.description}</div>
                </div>

                <div className="flex items-center">
                  <button
                    onClick={() => handleToggleCategory(category._id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100"
                  >
                    {expandedCategoryId === category._id ? 'Hide' : 'Show'} Listings
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      expandedCategoryId === category._id ? 'rotate-180' : ''
                    }`} />
                  </button>
                </div>
              </div>

              {/* Listings Table (when expanded) */}
              {expandedCategoryId === category._id && (
                <div className="border-t border-gray-200">
                  <div className="p-4">
                    {loadingListings ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">Loading listings...</span>
                      </div>
                    ) : !Array.isArray(listingsData) || listingsData.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-500 mb-2">No listings found in this category</div>
                        {hasPermission('featured_listings.create') && (
                          <button
                            onClick={() => handleAddListing(category._id)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100"
                          >
                            <Plus className="w-4 h-4" />
                            Add First Listing
                          </button>
                        )}
                      </div>
                    ) : (
                      <SimpleTable
                        columns={simpleTableColumns}
                        data={listingRows}
                        isLoading={loadingListings}
                        emptyMessage="No listings found in this category"
                        className="shadow-none border-none"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* View Modal */}
      {viewingItem && (
        <FeatureListingViewModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewingItem(null);
          }}
          data={viewingItem}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingItem}
        onClose={() => !isDeleting && setDeletingItem(null)}
        onConfirm={handleDeleteListing}
        title="Delete Listing"
        message="Are you sure you want to delete this listing?"
        itemName={deletingItem?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default FeaturedListingsPage;