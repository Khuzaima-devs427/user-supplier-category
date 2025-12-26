// 'use client';

// import React, { useState, useMemo, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useQuery, useQueryClient } from '@tanstack/react-query';
// import DataGridWrapper from '../../../_components/_data-grid/DataGridWrapper';
// import DeleteConfirmationModal from '../../../_components/_modals/DeleteConfirmationModal';
// // import ViewModal from '../../_components/_view-modal/ViewModal';
// import DateRangeFilter from '../../../_components/_filters/DateRangeFilter';
// import { clientService } from '../../../app/utils/api-client';
// import { usePermissions } from '../../../_components/contexts/PermissionContext';
// import { useHeroSliderColumns } from '../../../_components/_hooks/useHeroSliderColumns';
// import { toast } from 'react-toastify';

// // API Response interfaces
// interface ApiResponse<T = any> {
//   success: boolean;
//   message: string;
//   data: T;
//   pagination?: {
//     totalItems: number;
//     currentPage: number;
//     totalPages: number;
//   };
// }

// // Hero Slider Item Interface
// interface HeroSliderItem {
//   _id: string;
//   image: string;
//   title: string;
//   buttonText: string;
//   buttonLink: string;
//   status: 'active' | 'inactive';
//   displayOrder: number;
//   createdAt: string;
//   updatedAt: string;
//   createdBy: string;
// }

// const HeroSliderPage = () => {
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const { permissions } = usePermissions();
  
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [deletingItem, setDeletingItem] = useState<HeroSliderItem | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [viewingItem, setViewingItem] = useState<HeroSliderItem | null>(null);
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [isClient, setIsClient] = useState(false); // Added to track client-side
//   const limit = 10;

//   // Set isClient only on the client
//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   // DEBUG: Test API connection - only on client
//   useEffect(() => {
//     if (!isClient) return;
    
//     const testApi = async () => {
//       try {
//         console.log('🧪 Testing hero-slider API connection...');
//         const testResponse = await clientService.get<ApiResponse<HeroSliderItem[]>>('/hero-slider?page=1&limit=5');
//         console.log('✅ Hero Slider API Test Success:', testResponse.data);
//       } catch (error) {
//         console.error('❌ Hero Slider API Test Failed:', error);
//       }
//     };
    
//     testApi();
//   }, [isClient]);

//   // Fetch hero slider items from API
//   const { data: heroSliderData, isLoading, error } = useQuery({
//     queryKey: ['hero-slider', search, statusFilter, startDate, endDate, currentPage],
//     queryFn: async (): Promise<HeroSliderItem[]> => {
//       // Don't fetch on server if we're not on client yet
//       if (!isClient) {
//         console.log('🔄 Skipping fetch - not on client yet');
//         return [];
//       }

//       const params = new URLSearchParams({
//         page: currentPage.toString(),
//         limit: limit.toString(),
//         ...(search && { search }),
//         ...(statusFilter && { status: statusFilter }),
//         ...(startDate && { startDate }),
//         ...(endDate && { endDate }),
//       });

//       console.log('🔍 Fetching hero slider from:', `/hero-slider?${params}`);
      
//       try {
//         const response = await clientService.get<ApiResponse<HeroSliderItem[]>>(`/hero-slider?${params}`);
//         console.log('🚀 FULL API RESPONSE:', response);
        
//         const apiData = response.data as ApiResponse<HeroSliderItem[]>;
//         console.log('🔍 Response structure:', {
//           success: apiData.success,
//           message: apiData.message,
//           data: apiData.data,
//           pagination: apiData.pagination
//         });
        
//         return apiData.data;
//       } catch (err) {
//         console.error('❌ API Error:', err);
//         throw err;
//       }
//     },
//     enabled: isClient, // Only fetch when on client
//   });

//   // DEBUG: Check what heroSliderData contains
//   useEffect(() => {
//     if (!isClient) return;
//     console.log('🎯 heroSliderData:', heroSliderData);
//     if (heroSliderData) {
//       console.log('🎯 Is heroSliderData an array?:', Array.isArray(heroSliderData));
//       console.log('🎯 heroSliderData length:', Array.isArray(heroSliderData) ? heroSliderData.length : 'Not an array');
//     }
//   }, [heroSliderData, isClient]);

//   // Delete item function
//   const deleteItem = async (itemId: string): Promise<void> => {
//     const response = await clientService.delete<ApiResponse>(`/hero-slider/${itemId}`);
//     const result = response.data;
    
//     if (!result.success) {
//       throw new Error(result.message || 'Failed to delete hero slider item');
//     }
//   };

//   // Helper function to check permissions
//   const hasPermission = (permissionKey: string): boolean => {
//     // On server, default to true (so we render the same content)
//     // We'll check permissions properly on client
//     if (!isClient) {
//       return true;
//     }
    
//     if (permissions.isStaticAdmin === true) {
//       return true;
//     }
    
//     const hasPerm = permissions[permissionKey] === true;
//     console.log(`🔍 Checking permission "${permissionKey}": ${hasPerm} (isClient: ${isClient})`);
//     return hasPerm;
//   };

//   // Handle view item
//   const handleViewItem = (item: HeroSliderItem) => {
//     if (!isClient) return;
//     setViewingItem(item);
//     setIsViewModalOpen(true);
//   };

//   // Handle edit item
//   const handleEditItem = (item: HeroSliderItem) => {
//     if (!isClient) return;
    
//     if (!hasPermission('hero_slider.edit')) {
//       toast.error('You do not have permission to edit hero slider items');
//       return;
//     }
//     router.push(`/content-management/hero-slider/edit/${item._id}`);
//   };

//   // Handle delete item
//   const handleDeleteItem = async () => {
//     if (!deletingItem || !isClient) return;
    
//     if (!hasPermission('hero_slider.delete')) {
//       toast.error('You do not have permission to delete hero slider items');
//       setDeletingItem(null);
//       return;
//     }
    
//     setIsDeleting(true);
//     try {
//       await deleteItem(deletingItem._id);
      
//       await Promise.all([
//         queryClient.invalidateQueries({ 
//           queryKey: ['hero-slider'], 
//           refetchType: 'all'
//         }),
//         queryClient.refetchQueries({
//           queryKey: ['hero-slider']
//         })
//       ]);
      
//       setDeletingItem(null);
//       toast.success('Hero slider item deleted successfully');
//       console.log('✅ Hero slider item deleted successfully');
//     } catch (error) {
//       console.error('❌ Error deleting hero slider item:', error);
//       toast.error(`Failed to delete hero slider item: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   // Handle status change
//   const handleStatusChange = async (item: HeroSliderItem, status: 'active' | 'inactive') => {
//     if (!isClient) return;
    
//     if (!hasPermission('hero_slider.edit')) {
//       toast.error('You do not have permission to update hero slider status');
//       return;
//     }
    
//     try {
//       console.log('🔄 Update hero slider status:', item._id, status);
      
//       const response = await clientService.patch<ApiResponse>(`/hero-slider/${item._id}/status`, {
//         status: status
//       });

//       const result = response.data;
      
//       if (!result.success) {
//         throw new Error(result.message || 'Failed to update hero slider status');
//       }

//       await queryClient.invalidateQueries({ queryKey: ['hero-slider'] });
//       toast.success(`Status updated to ${status}`);
//       console.log('✅ Hero slider status updated successfully');
//     } catch (error) {
//       console.error('❌ Error updating hero slider status:', error);
//       toast.error(`Failed to update hero slider status: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   };

//   // Extract hero slider items
//   const heroSliderItems: HeroSliderItem[] = useMemo(() => {
//     if (!heroSliderData) {
//       console.log('📭 No heroSliderData available');
//       return [];
//     }
    
//     if (Array.isArray(heroSliderData)) {
//       return heroSliderData;
//     }
    
//     if (Array.isArray((heroSliderData as any).data)) {
//       return (heroSliderData as any).data;
//     }
    
//     console.log('❓ Unknown heroSliderData structure:', heroSliderData);
//     return [];
//   }, [heroSliderData]);

//   // Extract total count
//   const totalItems = useMemo(() => {
//     if (!heroSliderData) {
//       return 0;
//     }
    
//     if (Array.isArray(heroSliderData)) {
//       return heroSliderData.length;
//     }
    
//     if ((heroSliderData as any).pagination?.totalItems) {
//       return (heroSliderData as any).pagination.totalItems;
//     }
    
//     return heroSliderItems.length;
//   }, [heroSliderData, heroSliderItems]);

//   // Transform data for DataGrid with your columns
//   const dataWithSerial = useMemo(() => {
//     console.log('🎬 Creating dataWithSerial from heroSliderItems:', heroSliderItems);
    
//     if (!heroSliderItems.length) {
//       return [];
//     }
    
//     return heroSliderItems.map((item: HeroSliderItem, index: number) => ({
//       id: item._id,
//       serialNo: (currentPage - 1) * limit + (index + 1),
//       image: item.image,
//       title: item.title,
//       buttonText: item.buttonText,
//       buttonLink: item.buttonLink,
//       status: item.status,
//       displayOrder: item.displayOrder,
//       createdAt: item.createdAt,
//       updatedAt: item.updatedAt,
//       createdBy: item.createdBy,
//     }));
//   }, [heroSliderItems, currentPage, limit]);

//   // Handle Add Item button click
//   const handleAddItem = () => {
//     if (!isClient) return;
    
//     if (!hasPermission('hero_slider.create')) {
//       toast.error('You do not have permission to add hero slider items');
//       return;
//     }
//     router.push('/content-management/hero-slider/add');
//   };

//   // Use the hero slider columns hook
//   const columns = useHeroSliderColumns({
//     onEdit: handleEditItem,
//     onDelete: (item) => {
//       if (!isClient) return;
      
//       if (!hasPermission('hero_slider.delete')) {
//         toast.error('You do not have permission to delete hero slider items');
//         return;
//       }
//       console.log('Delete item:', item);
//       setDeletingItem(item);
//     },
//     onStatusChange: handleStatusChange,
//     // onView: handleViewItem,
//     permissions: permissions
//   });

//   // Filters component
//   const HeroSliderFilters = (
//     <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
//       <div className="flex flex-col gap-2">
//         <label className="text-sm font-medium text-gray-700">Status</label>
//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           disabled={!isClient}
//         >
//           <option value="">All Status</option>
//           <option value="active">Active</option>
//           <option value="inactive">Inactive</option>
//         </select>
//       </div>

//       <DateRangeFilter
//         startDate={startDate}
//         endDate={endDate}
//         onStartDateChange={setStartDate}
//         onEndDateChange={setEndDate}
//         // disabled={!isClient}
//       />
      
//       <button
//         onClick={() => {
//           if (!isClient) return;
//           setStatusFilter('');
//           setStartDate('');
//           setEndDate('');
//           setSearch('');
//           setCurrentPage(1);
//         }}
//         className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-nowrap"
//         disabled={!isClient}
//       >
//         Clear Filters
//       </button>
//     </div>
//   );

//   // View modal content
//   const viewModalContent = viewingItem ? (
//     <div className="space-y-4">
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <h4 className="text-sm font-medium text-gray-500">Title</h4>
//           <p className="mt-1 text-gray-900">{viewingItem.title}</p>
//         </div>
//         <div>
//           <h4 className="text-sm font-medium text-gray-500">Button Text</h4>
//           <p className="mt-1 text-gray-900">{viewingItem.buttonText}</p>
//         </div>
//         <div>
//           <h4 className="text-sm font-medium text-gray-500">Button Link</h4>
//           <a 
//             href={viewingItem.buttonLink} 
//             target="_blank" 
//             rel="noopener noreferrer"
//             className="mt-1 text-blue-600 hover:underline"
//           >
//             {viewingItem.buttonLink}
//           </a>
//         </div>
//         <div>
//           <h4 className="text-sm font-medium text-gray-500">Status</h4>
//           <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//             viewingItem.status === 'active' 
//               ? 'bg-green-100 text-green-800' 
//               : 'bg-red-100 text-red-800'
//           }`}>
//             {viewingItem.status.charAt(0).toUpperCase() + viewingItem.status.slice(1)}
//           </span>
//         </div>
//         <div>
//           <h4 className="text-sm font-medium text-gray-500">Display Order</h4>
//           <p className="mt-1 text-gray-900">{viewingItem.displayOrder}</p>
//         </div>
//         <div>
//           <h4 className="text-sm font-medium text-gray-500">Created By</h4>
//           <p className="mt-1 text-gray-900">{viewingItem.createdBy}</p>
//         </div>
//       </div>
      
//       <div>
//         <h4 className="text-sm font-medium text-gray-500">Image Preview</h4>
//         <div className="mt-2 w-full max-w-md h-48 rounded-lg overflow-hidden border border-gray-200">
//           <img
//             src={viewingItem.image}
//             alt={viewingItem.title}
//             className="w-full h-full object-cover"
//             onError={(e) => {
//               (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
//             }}
//           />
//         </div>
//       </div>
      
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <h4 className="text-sm font-medium text-gray-500">Created At</h4>
//           <p className="mt-1 text-gray-900">
//             {new Date(viewingItem.createdAt).toLocaleString('en-US', {
//               dateStyle: 'medium',
//               timeStyle: 'short'
//             })}
//           </p>
//         </div>
//         <div>
//           <h4 className="text-sm font-medium text-gray-500">Updated At</h4>
//           <p className="mt-1 text-gray-900">
//             {new Date(viewingItem.updatedAt).toLocaleString('en-US', {
//               dateStyle: 'medium',
//               timeStyle: 'short'
//             })}
//           </p>
//         </div>
//       </div>
//     </div>
//   ) : null;

//   // Loading state for server render - must match DataGridWrapper structure
//   if (!isClient) {
//     return (
//       <div className="p-6 bg-gray-50 min-h-screen w-full">
//         <div className="mb-6">
//           <div className="animate-pulse">
//             <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
//             <div className="h-4 bg-gray-200 rounded w-1/2"></div>
//           </div>
//         </div>
//         <div className="min-h-[400px] bg-white rounded-lg shadow">
//           <div className="flex items-center justify-center h-full">
//             <div className="text-gray-500">Loading...</div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Check if user has view permission - only on client
//   if (!hasPermission('hero_slider.view')) {
//     return (
//       <div className="p-6 bg-gray-50 min-h-screen w-full"> {/* ← MUST match DataGridWrapper structure */}
//         <div className="flex flex-col items-center justify-center min-h-[400px]"> {/* Changed from min-h-[50vh] */}
//           <div className="text-center">
//             <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
//             <p className="text-gray-600 mb-4">
//               You don't have permission to access the hero slider management page.
//             </p>
//             <button
//               onClick={() => router.back()}
//               className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
//             >
//               Go Back
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Error handling
//   if (error) {
//     return (
//       <div className="p-6 bg-gray-50 min-h-screen w-full"> {/* ← Match structure */}
//         <div className="bg-red-50 border border-red-200 rounded-md p-4">
//           <h3 className="text-sm font-medium text-red-800">Error loading hero slider items</h3>
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
//         title="Hero Slider Management"
//         description="Manage homepage banner slides and promotions"
//         columns={columns}
//         data={dataWithSerial}
//         isLoading={isLoading}
//         totalRows={totalItems}
//         rowsPerPage={limit}
//         currentPage={currentPage}
//         onPageChange={setCurrentPage}
//         isSearchEnabled={true}
//         searchState={search}
//         setSearchState={setSearch}
//         searchPlaceholder="Search by title or button text..."
//         filtersComponent={HeroSliderFilters}
//         defaultFiltersExpanded={true}
//         hasAddButton={true}
//         addButtonText="Add New Slide"
//         addButtonOnClick={handleAddItem}
//         addButtonPermission="hero_slider.create"
//         hasExportButton={true}
//         onExport={() => {
//           if (!isClient) return;
//           toast.info('Export functionality coming soon');
//         }}
//         allPermissions={permissions}
//         enableRowActions={false}
//         editPermission="hero_slider.edit"
//         deletePermission="hero_slider.delete"
//       />

//       {/* Delete Confirmation Modal */}
//       <DeleteConfirmationModal
//         isOpen={!!deletingItem}
//         onClose={() => !isDeleting && setDeletingItem(null)}
//         onConfirm={handleDeleteItem}
//         title="Delete Hero Slider Item"
//         message="Are you sure you want to delete this hero slider item? This action cannot be undone."
//         itemName={deletingItem?.title}
//         isLoading={isDeleting}
//         // type="hero slider item"
//       />

//       {/* View Modal */}
//       {/* <ViewModal
//         isOpen={isViewModalOpen}
//         onClose={() => {
//           setIsViewModalOpen(false);
//           setViewingItem(null);
//         }}
//         title="Hero Slider Item Details"
//         content={viewModalContent}
//         size="lg"
//       /> */}
//     </div>
//   );
// };

// export default HeroSliderPage;

















'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DataGridWrapper from '../../../_components/_data-grid/DataGridWrapper';
import DeleteConfirmationModal from '../../../_components/_modals/DeleteConfirmationModal';
import DateRangeFilter from '../../../_components/_filters/DateRangeFilter';
import { clientService } from '../../../app/utils/api-client';
import { usePermissions } from '../../../_components/contexts/PermissionContext';
import { useHeroSliderColumns } from '../../../_components/_hooks/useHeroSliderColumns';
import { toast } from 'react-toastify';
import HeroSliderViewModal from '../_components/view-modal/hero-slider-ViewModal';

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

// Hero Slider Item Interface
interface HeroSliderItem {
  _id: string;
  image: string;
  title: string;
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

const HeroSliderPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { permissions } = usePermissions();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingItem, setDeletingItem] = useState<HeroSliderItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingItem, setViewingItem] = useState<HeroSliderItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const limit = 10;

  // Check permissions - CORRECTED to use hero slider permissions
  const hasHeroSliderViewPermission = permissions['hero_slider.view'] === true;
  const hasHeroSliderCreatePermission = permissions['hero_slider.create'] === true;
  const hasHeroSliderEditPermission = permissions['hero_slider.edit'] === true;
  const hasHeroSliderDeletePermission = permissions['hero_slider.delete'] === true;

  // Helper function to check permissions (similar to suppliers page)
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

  // If user has no permission to view hero slider, show access denied
  if (!hasPermission('hero_slider.view')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the hero slider management page.
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

  // Set isClient only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // DEBUG: Test API connection
  useEffect(() => {
    if (!isClient) return;
    
    const testApi = async () => {
      try {
        console.log('🧪 Testing hero-slider API connection...');
        const testResponse = await clientService.get<ApiResponse<HeroSliderItem[]>>('/hero-slider?page=1&limit=5');
        console.log('✅ Hero Slider API Test Success:', testResponse.data);
      } catch (error) {
        console.error('❌ Hero Slider API Test Failed:', error);
      }
    };
    
    testApi();
  }, [isClient]);

  // Fetch hero slider items from API
  const { data: heroSliderData, isLoading, error } = useQuery({
    queryKey: ['hero-slider', search, statusFilter, startDate, endDate, currentPage],
    queryFn: async (): Promise<HeroSliderItem[]> => {
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

      console.log('🔍 Fetching hero slider from:', `/hero-slider?${params}`);
      
      try {
        const response = await clientService.get<ApiResponse<HeroSliderItem[]>>(`/hero-slider?${params}`);
        console.log('🚀 FULL API RESPONSE:', response);
        
        const apiData = response.data as ApiResponse<HeroSliderItem[]>;
        
        // Debug: Check the structure of returned data
        if (apiData.data && apiData.data.length > 0) {
          const firstItem = apiData.data[0];
          console.log('🔍 First item from API:', {
            _id: firstItem._id,
            _idLength: firstItem._id?.length,
            title: firstItem.title
          });
        }
        
        return apiData.data;
      } catch (err) {
        console.error('❌ API Error:', err);
        throw err;
      }
    },
    enabled: hasHeroSliderViewPermission && isClient, // Only fetch if user has view permission and is on client
  });

  // DEBUG: Check what heroSliderData contains
  useEffect(() => {
    if (!isClient) return;
    console.log('🎯 heroSliderData:', heroSliderData);
  }, [heroSliderData, isClient]);

  // Delete item function
  const deleteItem = async (itemId: string): Promise<void> => {
    const response = await clientService.delete<ApiResponse>(`/hero-slider/${itemId}`);
    const result = response.data;
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete hero slider item');
    }
  };

  // Handle view item
  const handleViewItem = (item: DataGridRow) => {
    // Check permission
    if (!hasPermission('hero_slider.view')) {
      toast.error('You do not have permission to view hero slider details');
      return;
    }
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  // Handle edit item
  const handleEditItem = (item: DataGridRow) => {
    // Check permission
    if (!hasPermission('hero_slider.edit')) {
      toast.error('You do not have permission to edit hero slider items');
      return;
    }
    
    console.log('🔄 Edit item clicked:', {
      id: item.id,
      title: item.title,
      idLength: item.id?.length
    });
    
    // Get the ID from DataGridRow
    const itemId = item.id;
    
    if (!itemId) {
      console.error('❌ Cannot edit: No ID found in item:', item);
      toast.error('Cannot edit: Item ID is missing');
      return;
    }
    
    // CRITICAL FIX: Use encodeURIComponent to handle special characters
    const encodedId = encodeURIComponent(itemId);
    
    // Debug: Check if encoding is needed
    console.log('🔍 ID Debug:', {
      originalId: itemId,
      encodedId: encodedId,
      needsEncoding: itemId !== encodedId,
      url: `/content-management/hero-slider/edit/${encodedId}`
    });
    
    const editUrl = `/content-management/hero-slider/edit/${encodedId}`;
    
    router.push(editUrl);
  };

  // Handle delete item
  const handleDeleteItem = async () => {
    if (!deletingItem || !isClient) return;
    
    // Check permission
    if (!hasPermission('hero_slider.delete')) {
      toast.error('You do not have permission to delete hero slider items');
      setDeletingItem(null);
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteItem(deletingItem._id);
      
      await Promise.all([
        queryClient.invalidateQueries({ 
          queryKey: ['hero-slider'], 
          refetchType: 'all'
        }),
        queryClient.refetchQueries({
          queryKey: ['hero-slider']
        })
      ]);
      
      setDeletingItem(null);
      toast.success('Hero slider item deleted successfully');
      console.log('✅ Hero slider item deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting hero slider item:', error);
      toast.error(`Failed to delete hero slider item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (item: DataGridRow, status: 'active' | 'inactive') => {
    if (!isClient) return;
    
    // Check permission
    if (!hasPermission('hero_slider.edit')) {
      toast.error('You do not have permission to update hero slider status');
      return;
    }
    
    // Get the ID from DataGridRow
    const itemId = item.id;
    
    if (!itemId) {
      console.error('❌ Cannot update status: No ID found in item:', item);
      toast.error('Cannot update status: Item ID is missing');
      return;
    }
    
    try {
      console.log('🔄 Update hero slider status:', itemId, status);
      
      const response = await clientService.patch<ApiResponse>(`/hero-slider/${itemId}/status`, {
        status: status
      });

      const result = response.data;
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update hero slider status');
      }

      await queryClient.invalidateQueries({ queryKey: ['hero-slider'] });
      toast.success(`Status updated to ${status}`);
      console.log('✅ Hero slider status updated successfully');
    } catch (error) {
      console.error('❌ Error updating hero slider status:', error);
      toast.error(`Failed to update hero slider status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Extract hero slider items
  const heroSliderItems: HeroSliderItem[] = useMemo(() => {
    if (!heroSliderData) {
      console.log('📭 No heroSliderData available');
      return [];
    }
    
    if (Array.isArray(heroSliderData)) {
      return heroSliderData;
    }
    
    if (Array.isArray((heroSliderData as any).data)) {
      return (heroSliderData as any).data;
    }
    
    console.log('❓ Unknown heroSliderData structure:', heroSliderData);
    return [];
  }, [heroSliderData]);

  // Extract total count
  const totalItems = useMemo(() => {
    if (!heroSliderData) {
      return 0;
    }
    
    if (Array.isArray(heroSliderData)) {
      return heroSliderData.length;
    }
    
    if ((heroSliderData as any).pagination?.totalItems) {
      return (heroSliderData as any).pagination.totalItems;
    }
    
    return heroSliderItems.length;
  }, [heroSliderData, heroSliderItems]);

  // Transform data for DataGrid with your columns
  const dataWithSerial: DataGridRow[] = useMemo(() => {
    console.log('🎬 Creating dataWithSerial from heroSliderItems:', heroSliderItems.length, 'items');
    
    if (!heroSliderItems.length) {
      return [];
    }
    
    return heroSliderItems.map((item: HeroSliderItem, index: number) => {
      const row = {
        id: item._id,
        _id: item._id,
        serialNo: (currentPage - 1) * limit + (index + 1),
        image: item.image,
        title: item.title,
        buttonText: item.buttonText,
        buttonLink: item.buttonLink,
        status: item.status,
        displayOrder: item.displayOrder,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        createdBy: item.createdBy,
        tag: item.tag,
        description: item.description,
      };
      
      // Debug first few rows
      if (index < 3) {
        console.log(`🎬 Row ${index + 1}:`, {
          id: row.id,
          idLength: row.id?.length,
          title: row.title,
          encoded: encodeURIComponent(row.id),
          needsEncoding: row.id !== encodeURIComponent(row.id)
        });
      }
      
      return row;
    });
  }, [heroSliderItems, currentPage, limit]);

  // Debug: Check transformed data
  useEffect(() => {
    if (!isClient || !dataWithSerial.length) return;
    
    console.log('📊 DataWithSerial analysis:', {
      totalRows: dataWithSerial.length,
      firstRowId: dataWithSerial[0].id,
      firstRowIdLength: dataWithSerial[0].id?.length,
      firstRowTitle: dataWithSerial[0].title
    });
  }, [dataWithSerial, isClient]);

  // Handle Add Item button click
  const handleAddItem = () => {
    // Check permission
    if (!hasPermission('hero_slider.create')) {
      toast.error('You do not have permission to add hero slider items');
      return;
    }
    
    router.push('/content-management/hero-slider/add');
  };

  // Use the hero slider columns hook
  const columns = useHeroSliderColumns({
    onEdit: (item) => {
      // Permission check is handled in handleEditItem
      handleEditItem(item);
    },
    onDelete: (item: DataGridRow) => {
      // Check permission in callback
      if (!hasPermission('hero_slider.delete')) {
        toast.error('You do not have permission to delete hero slider items');
        return;
      }
      console.log('Delete item:', item);
      setDeletingItem({
        _id: item.id,
        image: item.image,
        title: item.title,
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
    onStatusChange: (item, status) => {
      // Permission check is handled in handleStatusChange
      handleStatusChange(item, status);
    },
    onView: (item) => {
      // Permission check is handled in handleViewItem
      handleViewItem(item);
    },
    permissions: permissions // Pass permissions to the hook
  });

  // Filters component
  const HeroSliderFilters = (
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
          if (!isClient) return;
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

  // Error handling
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-red-800">Error loading hero slider items</h3>
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
        title="Hero Slider Management"
        description="Manage homepage banner slides and promotions"
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
        searchPlaceholder="Search by title or button text..."
        filtersComponent={HeroSliderFilters}
        defaultFiltersExpanded={true}
        hasAddButton={true}
        addButtonText="Add New Slide"
        addButtonOnClick={handleAddItem}
        addButtonPermission="hero_slider.create"
        hasExportButton={true}
        onExport={() => {
          if (!isClient) return;
          toast.info('Export functionality coming soon');
        }}
        allPermissions={permissions}
        enableRowActions={true}
        editPermission="hero_slider.edit"
        deletePermission="hero_slider.delete"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingItem}
        onClose={() => !isDeleting && setDeletingItem(null)}
        onConfirm={handleDeleteItem}
        title="Delete Hero Slider Item"
        message="Are you sure you want to delete this hero slider item? This action cannot be undone."
        itemName={deletingItem?.title}
        isLoading={isDeleting}
      />

     <HeroSliderViewModal
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

export default HeroSliderPage;