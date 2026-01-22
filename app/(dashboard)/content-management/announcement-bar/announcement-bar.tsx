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
import AnnouncementViewModal from '../_components/view-modal/announcement-bar-ViewModal';
import { useAnnouncementColumns } from '../../../_components/_hooks/useAnnouncementBarColumns';

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

// Announcement Item Interface
interface AnnouncementItem {
  _id: string;
  announcement: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// DataGrid Row Interface
interface DataGridRow {
  id: string;
  _id: string;
  serialNo: number;
  announcement: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  statusBadgeColor: string;
}

const AnnouncementPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { permissions } = usePermissions();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingItem, setDeletingItem] = useState<AnnouncementItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingItem, setViewingItem] = useState<AnnouncementItem | null>(null);
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
      return true;
    }
    
    // Check specific permission
    const hasPerm = permissions[permissionKey] === true;
    return hasPerm;
  };

  // Helper function to get announcement preview
  const getAnnouncementPreview = (announcement?: string): string => {
    if (!announcement) return 'Untitled Announcement';
    return announcement.substring(0, 50) + (announcement.length > 50 ? '...' : '');
  };

  // DEBUG: Test API connection
  useEffect(() => {
    if (!isClient) return;
    
    const testApi = async () => {
      try {
        console.log('🧪 Testing announcement-bar API connection...');
        const testResponse = await clientService.get<ApiResponse<AnnouncementItem[]>>('/announcement-bar/?page=1&limit=5');
        console.log('✅ Announcement Bar API Test Success:', testResponse.data);
      } catch (error) {
        console.error('❌ Announcement Bar API Test Failed:', error);
      }
    };
    
    testApi();
  }, [isClient]);

  // Fetch announcements from API
  const { 
    data: announcementsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['announcement-bar', search, statusFilter, startDate, endDate, currentPage],
    queryFn: async (): Promise<AnnouncementItem[]> => {
      if (!isClient) {
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

      console.log('🔍 Fetching announcements from:', `/announcement-bar/?${params}`);
      
      try {
        const response = await clientService.get<ApiResponse<AnnouncementItem[]>>(`/announcement-bar/?${params}`);
        
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
    enabled: isClient,
  });

  // Delete item function
  const deleteItem = async (itemId: string): Promise<void> => {
    const response = await clientService.delete<ApiResponse>(`/announcement-bar/${itemId}`);
    const result = response.data;
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete announcement');
    }
  };

  // Handle view item - UPDATED to accept AnnouncementItem
  const handleViewItem = (item: AnnouncementItem) => {
    // Check permission
    if (!hasPermission('announcement_bar.view')) {
      toast.error('You do not have permission to view announcement details');
      return;
    }
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  // Handle edit item - UPDATED to accept AnnouncementItem
  const handleEditItem = (item: AnnouncementItem) => {
    // Check permission
    if (!hasPermission('announcement_bar.edit')) {
      toast.error('You do not have permission to edit announcements');
      return;
    }
    
    const itemId = item._id;
    if (!itemId) {
      console.error('❌ Cannot edit: No ID found in item:', item);
      toast.error('Cannot edit: Item ID is missing');
      return;
    }
    
    const editUrl = `/content-management/announcement-bar/edit/${encodeURIComponent(itemId)}`;
    router.push(editUrl);
  };

  // Handle delete item
  const handleDeleteItem = async () => {
    if (!deletingItem || !isClient) return;
    
    // Check permission
    if (!hasPermission('announcement_bar.delete')) {
      toast.error('You do not have permission to delete announcements');
      setDeletingItem(null);
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteItem(deletingItem._id);
      
      await queryClient.invalidateQueries({ 
        queryKey: ['announcement-bar'], 
        refetchType: 'all'
      });
      
      setDeletingItem(null);
      toast.success('Announcement deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting announcement:', error);
      toast.error(`Failed to delete announcement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle status change - UPDATED to accept AnnouncementItem


// Handle status change - UPDATED to ensure only one active announcement
const handleStatusChange = async (item: AnnouncementItem, status: 'active' | 'inactive') => {
  if (!isClient) return;
  
  // Check permission
  if (!hasPermission('announcement_bar.edit')) {
    toast.error('You do not have permission to update announcement status');
    return;
  }
  
  // If trying to set to inactive, just proceed normally
  if (status === 'inactive') {
    await updateSingleAnnouncementStatus(item, status);
    return;
  }
  
  // If trying to set to active, we need to deactivate others first
  // Show confirmation dialog for better UX
  const shouldProceed = window.confirm(
    'Activating this announcement will deactivate the other active announcement. Continue?'
  );
  
  if (!shouldProceed) return;
  
  try {
    // Call a new API endpoint that handles multiple status changes
    const response = await clientService.patch<ApiResponse>(`/announcement-bar/activate-single`, {
      announcementId: item._id
    });

    const result = response.data;
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update announcement status');
    }

    await queryClient.invalidateQueries({ queryKey: ['announcement-bar'] });
    toast.success('Announcement activated! All other announcements are now inactive.');
  } catch (error) {
    console.error('❌ Error updating announcement status:', error);
    toast.error(`Failed to update announcement status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};



// Helper function for updating single announcement (for inactive status)
const updateSingleAnnouncementStatus = async (item: AnnouncementItem, status: 'active' | 'inactive') => {
  const itemId = item._id;
  if (!itemId) {
    console.error('❌ Cannot update status: No ID found in item:', item);
    toast.error('Cannot update status: Item ID is missing');
    return;
  }
  
  try {
    // FIXED: Use the correct endpoint
    const response = await clientService.patch<ApiResponse>(`/announcement-bar/${itemId}/toggle-status`, {
      status: status
    });

    const result = response.data;
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update announcement status');
    }

    await queryClient.invalidateQueries({ queryKey: ['announcement-bar'] });
    toast.success(`Status updated to ${status}`);
  } catch (error) {
    console.error('❌ Error updating announcement status:', error);
    toast.error(`Failed to update announcement status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

  // Extract announcement items
  const announcementItems: AnnouncementItem[] = useMemo(() => {
    if (!isClient) return [];
    
    if (!announcementsData) {
      return [];
    }
    
    // If it's already an array of AnnouncementItem, return it
    if (Array.isArray(announcementsData)) {
      return announcementsData;
    }
    
    return [];
  }, [announcementsData, isClient]);

  // Extract total count
  const totalItems = useMemo(() => {
    if (!isClient) return 0;
    
    if (!announcementsData) {
      return 0;
    }
    
    if (Array.isArray(announcementsData)) {
      return announcementsData.length;
    }
    
    return announcementItems.length;
  }, [announcementsData, announcementItems, isClient]);

  // Transform data for DataGrid
  const dataWithSerial: DataGridRow[] = useMemo(() => {
    if (!isClient) return [];
    
    if (!announcementItems || announcementItems.length === 0) {
      return [];
    }
    
    const transformedData = announcementItems.map((item: AnnouncementItem, index: number) => ({
      id: item._id,
      _id: item._id,
      serialNo: (currentPage - 1) * limit + (index + 1),
      announcement: item.announcement,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      statusBadgeColor: item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
    }));
    
    return transformedData;
  }, [announcementItems, currentPage, limit, isClient]);

  // Use the announcement columns hook - UPDATED to pass adapter functions
  const columns = useAnnouncementColumns({
    onEdit: handleEditItem,
    onDelete: (item: AnnouncementItem) => {
      setDeletingItem(item);
    },
    onStatusChange: handleStatusChange,
    onView: handleViewItem,
    permissions: permissions
  });

  // Handle Add Item button click
  const handleAddItem = () => {
    if (!hasPermission('announcement_bar.create')) {
      toast.error('You do not have permission to add announcements');
      return;
    }
    
    router.push('/content-management/announcement-bar/add');
  };

  // Filters component
  const AnnouncementFilters = (
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
  if (!hasPermission('announcement_bar.view')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the announcements management page.
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
          <h3 className="text-sm font-medium text-red-800">Error loading announcements</h3>
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
        title="Announcements Management"
        description="Manage website announcements and notifications"
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
        searchPlaceholder="Search announcements..."
        filtersComponent={AnnouncementFilters}
        defaultFiltersExpanded={true}
        hasAddButton={true}
        addButtonText="Add New Announcement"
        addButtonOnClick={handleAddItem}
        addButtonPermission="announcement_bar.create"
        hasExportButton={true}
        onExport={() => toast.info('Export functionality coming soon')}
        allPermissions={permissions}
        enableRowActions={true}
        editPermission="announcement_bar.edit"
        deletePermission="announcement_bar.delete"
      />

      <DeleteConfirmationModal
        isOpen={!!deletingItem}
        onClose={() => !isDeleting && setDeletingItem(null)}
        onConfirm={handleDeleteItem}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        itemName={getAnnouncementPreview(deletingItem?.announcement)}
        isLoading={isDeleting}
      />

      <AnnouncementViewModal
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

export default AnnouncementPage;