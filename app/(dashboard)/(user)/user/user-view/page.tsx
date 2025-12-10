// // 'use client';

// // import React, { useState, useMemo } from 'react';
// // import { useQuery, useQueryClient } from '@tanstack/react-query';
// // import { useRouter } from 'next/navigation';
// // import DataGridWrapper from '../../_components/_data-grid/DataGridWrapper';
// // import { useUserColumns } from '../../_components/_hooks/useUserColumns';
// // import StatusFilter, { EmailStatusFilter } from '../../_components/_filters/StatusFilter';
// // import DateRangeFilter from '../../_components/_filters/DateRangeFilter';
// // import DeleteConfirmationModal from '../../_components/_modals/DeleteConfirmationModal';
// // import ViewDetailsModal from '../../_components/_view-modal/ViewDetailsModal';

// // // Updated interface for backend response with new model
// // interface BackendUser {
// //   _id: string;
// //   firstName: string;
// //   lastName: string;
// //   email: string;
// //   phoneNumber: string;
// //   userType: any; // Reference to UserCategory
// //   address?: any;
// //   isBlocked: boolean;
// //   isEmailVerified: boolean;
// //   createdAt: string;
// // }

// // const UsersPage = () => {
// //   const router = useRouter();
// //   const queryClient = useQueryClient();
// //   const [search, setSearch] = useState('');
// //   const [statusFilter, setStatusFilter] = useState('');
// //   const [emailStatusFilter, setEmailStatusFilter] = useState('');
// //   const [startDate, setStartDate] = useState('');
// //   const [endDate, setEndDate] = useState('');
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [deletingUser, setDeletingUser] = useState<any>(null);
// //   const [isDeleting, setIsDeleting] = useState(false);
// //   const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
// //   const [updatingEmailVerification, setUpdatingEmailVerification] = useState<string | null>(null);
// //   const [viewingUser, setViewingUser] = useState<any>(null);
// //   const limit = 10;

// //   // Safe category name getter
// //   const getCategoryName = (userType: any): string => {
// //     if (!userType) return 'No Category';
    
// //     if (typeof userType === 'string') {
// //       return userType;
// //     }
    
// //     // Handle populated userType object
// //     if (typeof userType === 'object') {
// //       return userType.role || userType._id || 'Unnamed Category';
// //     }
    
// //     return 'No Category';
// //   };

// //   // Fetch users data - FIXED: Using correct endpoint
// //   const { data: usersData, isLoading, error } = useQuery({
// //     queryKey: ['users', search, statusFilter, emailStatusFilter, startDate, endDate, currentPage],
// //     queryFn: async () => {
// //       const params = new URLSearchParams({
// //         page: currentPage.toString(),
// //         limit: limit.toString(),
// //         ...(search && { search }),
// //         ...(statusFilter && { isBlocked: statusFilter === 'inactive' ? 'true' : 'false' }), // Changed from isActive to isBlocked
// //         ...(emailStatusFilter && { isEmailVerified: emailStatusFilter === 'verified' ? 'true' : 'false' }),
// //         ...(startDate && { startDate }),
// //         ...(endDate && { endDate }),
// //       });

// //       console.log('Fetching users from:', `http://localhost:5000/api/users?${params}`);
      
// //       const response = await fetch(`http://localhost:5000/api/users?${params}`);
      
// //       if (!response.ok) {
// //         throw new Error(`HTTP error! status: ${response.status}`);
// //       }
      
// //       const data = await response.json();
// //       console.log('Users API Response:', data);
// //       return data;
// //     },
// //   });

// //   // Update user status - FIXED: Using correct endpoint and field
// //   const updateUserStatus = async (userId: string, status: 'active' | 'inactive'): Promise<void> => {
// //     setUpdatingStatus(userId);
    
// //     try {
// //       console.log(`Updating user ${userId} status to: ${status}`);
      
// //       const response = await fetch(`http://localhost:5000/api/users/${userId}/status`, {
// //         method: 'PATCH',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ 
// //           isBlocked: status === 'inactive' // Changed from isActive to isBlocked
// //         }),
// //       });

// //       if (!response.ok) {
// //         const errorData = await response.json().catch(() => ({}));
// //         throw new Error(errorData.message || `Failed to update user status: ${response.status}`);
// //       }

// //       const result = await response.json();
      
// //       if (!result.success) {
// //         throw new Error(result.message || 'Failed to update user status');
// //       }

// //       await queryClient.invalidateQueries({ 
// //         queryKey: ['users'], 
// //         refetchType: 'active'
// //       });
      
// //       console.log(`User ${userId} status successfully updated to: ${status}`);
// //     } catch (error) {
// //       console.error('Error updating user status:', error);
// //       alert(`Failed to update user status: ${error instanceof Error ? error.message : 'Unknown error'}`);
// //     } finally {
// //       setUpdatingStatus(null);
// //     }
// //   };

// //   // Update email verification status - FIXED: Check if this endpoint exists
// //   const updateEmailVerification = async (userId: string, isEmailVerified: boolean): Promise<void> => {
// //     setUpdatingEmailVerification(userId);
    
// //     try {
// //       console.log(`Updating user ${userId} email verification to: ${isEmailVerified}`);
      
// //       // NOTE: This endpoint might not exist in your backend yet
// //       const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
// //         method: 'PUT', // Using update endpoint instead
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ 
// //           isEmailVerified 
// //         }),
// //       });

// //       if (!response.ok) {
// //         const errorData = await response.json().catch(() => ({}));
// //         throw new Error(errorData.message || `Failed to update email verification: ${response.status}`);
// //       }

// //       const result = await response.json();
      
// //       if (!result.success) {
// //         throw new Error(result.message || 'Failed to update email verification');
// //       }

// //       await queryClient.invalidateQueries({ 
// //         queryKey: ['users'], 
// //         refetchType: 'active'
// //       });
      
// //       console.log(`User ${userId} email verification successfully updated to: ${isEmailVerified}`);
// //     } catch (error) {
// //       console.error('Error updating email verification:', error);
// //       alert(`Failed to update email verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
// //     } finally {
// //       setUpdatingEmailVerification(null);
// //     }
// //   };

// //   // Delete user function - FIXED: Using correct endpoint
// //   const deleteUser = async (userId: string): Promise<void> => {
// //     const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
// //       method: 'DELETE',
// //       headers: {
// //         'Content-Type': 'application/json',
// //       },
// //     });

// //     if (!response.ok) {
// //       const errorData = await response.json().catch(() => ({}));
// //       throw new Error(errorData.message || `Failed to delete user: ${response.status}`);
// //     }

// //     const result = await response.json();
// //     if (!result.success) {
// //       throw new Error(result.message || 'Failed to delete user');
// //     }
// //   };

// //   // Handle edit user
// //   const handleEditUser = (user: any) => {
// //     router.push(`/user/user-view/edit-user?id=${user.id}`);
// //   };

// //   // Handle view user
// //   const handleViewUser = (user: any) => {
// //     setViewingUser(user);
// //   };

// //   // Handle delete user confirmation
// //   const handleDeleteUser = async () => {
// //     if (!deletingUser) return;
    
// //     setIsDeleting(true);
// //     try {
// //       await deleteUser(deletingUser.id);
      
// //       await queryClient.invalidateQueries({ 
// //         queryKey: ['users'], 
// //         refetchType: 'active'
// //       });
      
// //       setDeletingUser(null);
// //       console.log('User deleted successfully');
// //     } catch (error) {
// //       console.error('Error deleting user:', error);
// //       alert(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
// //     } finally {
// //       setIsDeleting(false);
// //     }
// //   };

// //   // Handle status change
// //   const handleStatusChange = (user: any, status: 'active' | 'inactive') => {
// //     updateUserStatus(user.id, status);
// //   };

// //   // Handle email verification change
// //   const handleEmailVerificationChange = (user: any, isEmailVerified: boolean) => {
// //     updateEmailVerification(user.id, isEmailVerified);
// //   };

// //   // Extract data from backend response
// //   const users: BackendUser[] = usersData?.data || [];
// //   const totalUsers = usersData?.pagination?.totalItems || 0;

// //   console.log('Processed users:', users);

// //   // Transform backend data to table format - FIXED: Using correct field names
// //   const dataWithSerial = useMemo(() => {
// //     return users.map((user: BackendUser, index: number) => ({
// //       id: user._id, // Changed from user.id to user._id
// //       serialNo: (currentPage - 1) * limit + (index + 1),
// //       name: `${user.firstName} ${user.lastName}`,
// //       email: user.email,
// //       phone: user.phoneNumber, // Changed from user.phone to user.phoneNumber
// //       status: user.isBlocked ? 'inactive' : 'active', // Inverted logic for isBlocked
// //       createdAt: user.createdAt,
// //       category: getCategoryName(user.userType), // Changed from user.category to user.userType
// //       isEmailVerified: user.isEmailVerified,
// //       // Add original data for view modal
// //       firstName: user.firstName,
// //       lastName: user.lastName,
// //       isActive: !user.isBlocked, // Calculate isActive from isBlocked
// //       originalCategory: user.userType, // Keep original for view modal
// //       address: user.address
// //     }));
// //   }, [users, currentPage, limit]);

// //   // Handle Add User button click
// //   const handleAddUser = () => {
// //     router.push('/user/user-view/add-user');
// //   };

// //   const columns = useUserColumns({
// //     onEdit: handleEditUser,
// //     onDelete: (user) => {
// //       console.log('Delete user:', user);
// //       setDeletingUser(user);
// //     },
// //     onView: handleViewUser,
// //     onStatusChange: handleStatusChange,
// //     onEmailVerificationChange: handleEmailVerificationChange
// //   });

// //   // Add error handling
// //   if (error) {
// //     return (
// //       <div className="p-6">
// //         <div className="bg-red-50 border border-red-200 rounded-md p-4">
// //           <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
// //           <p className="text-sm text-red-600 mt-1">{(error as Error).message}</p>
// //           <button 
// //             onClick={() => window.location.reload()}
// //             className="mt-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
// //           >
// //             Retry
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // Filters component
// //   const UserFilters = (
// //     <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
// //       <StatusFilter
// //         value={statusFilter}
// //         onChange={setStatusFilter}
// //         placeholder="All Users"
// //       />
// //       <EmailStatusFilter
// //         value={emailStatusFilter}
// //         onChange={setEmailStatusFilter}
// //         placeholder="All Emails"
// //       />
// //       <DateRangeFilter
// //         startDate={startDate}
// //         endDate={endDate}
// //         onStartDateChange={setStartDate}
// //         onEndDateChange={setEndDate}
// //       />
// //       <button
// //         onClick={() => {
// //           setStatusFilter('');
// //           setEmailStatusFilter('');
// //           setStartDate('');
// //           setEndDate('');
// //           setSearch('');
// //           setCurrentPage(1);
// //         }}
// //         className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-nowrap"
// //       >
// //         Clear Filters
// //       </button>
// //     </div>
// //   );

// //   return (
// //     <div>
// //       <DataGridWrapper
// //         title="Users Management"
// //         description="Manage all users in the system"
// //         columns={columns}
// //         data={dataWithSerial}
// //         isLoading={isLoading}
// //         totalRows={totalUsers}
// //         rowsPerPage={limit}
// //         currentPage={currentPage}
// //         onPageChange={setCurrentPage}
// //         isSearchEnabled={true}
// //         searchState={search}
// //         setSearchState={setSearch}
// //         searchPlaceholder="Search users by name, email..."
// //         filtersComponent={UserFilters}
// //         defaultFiltersExpanded={true}
// //         hasAddButton={true}
// //         addButtonText="Add User"
// //         addButtonOnClick={handleAddUser}
// //         hasExportButton={true}
// //         onExport={() => console.log('Export users')}
// //       />

// //       {/* Delete Confirmation Modal */}
// //       <DeleteConfirmationModal
// //         isOpen={!!deletingUser}
// //         onClose={() => !isDeleting && setDeletingUser(null)}
// //         onConfirm={handleDeleteUser}
// //         title="Delete User"
// //         message="Are you sure you want to delete this user? This action cannot be undone and all associated data will be permanently removed."
// //         itemName={deletingUser?.name}
// //         isLoading={isDeleting}
// //         type="user"
// //       />

// //       {/* View Details Modal */}
// //       <ViewDetailsModal
// //         isOpen={!!viewingUser}
// //         onClose={() => setViewingUser(null)}
// //         type="user"
// //         data={viewingUser}
// //       />
// //     </div>
// //   );
// // };

// // export default UsersPage;









// 'use client';

// import React, { useState, useMemo } from 'react';
// import { useQuery, useQueryClient } from '@tanstack/react-query';
// import { useRouter } from 'next/navigation';
// import DataGridWrapper from '../../../../_components/_data-grid/DataGridWrapper';
// import { useUserColumns } from '../../../../_components/_hooks/useUserColumns';
// import StatusFilter, { EmailStatusFilter } from '../../../../_components/_filters/StatusFilter';
// import DateRangeFilter from '../../../../_components/_filters/DateRangeFilter';
// import DeleteConfirmationModal from '../../../../_components/_modals/DeleteConfirmationModal';
// import ViewDetailsModal from '../../../../_components/_view-modal/ViewDetailsModal';
// import { clientService } from '../../../../app/utils/api-client';

// // Updated interface for backend response with new model
// interface BackendUser {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   userType: any;
//   address?: any;
//   isBlocked: boolean;
//   isEmailVerified: boolean;
//   createdAt: string;
// }

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

// interface UsersApiResponse {
//   data: BackendUser[];
//   pagination?: {
//     totalItems: number;
//     currentPage: number;
//     totalPages: number;
//   };
// }

// const UsersPage = () => {
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');
//   const [emailStatusFilter, setEmailStatusFilter] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [deletingUser, setDeletingUser] = useState<any>(null);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
//   const [updatingEmailVerification, setUpdatingEmailVerification] = useState<string | null>(null);
//   const [viewingUser, setViewingUser] = useState<any>(null);
//   const limit = 10;

//   // Safe category name getter
//   const getCategoryName = (userType: any): string => {
//     if (!userType) return 'No Category';
    
//     if (typeof userType === 'string') {
//       return userType;
//     }
    
//     if (typeof userType === 'object') {
//       return userType.role || userType._id || 'Unnamed Category';
//     }
    
//     return 'No Category';
//   };

//   // Fetch users data with proper typing
//   const { data: usersData, isLoading, error } = useQuery({
//     queryKey: ['users', search, statusFilter, emailStatusFilter, startDate, endDate, currentPage],
//     queryFn: async (): Promise<UsersApiResponse> => {
//       const params = new URLSearchParams({
//         page: currentPage.toString(),
//         limit: limit.toString(),
//         ...(search && { search }),
//         ...(statusFilter && { isBlocked: statusFilter === 'inactive' ? 'true' : 'false' }),
//         ...(emailStatusFilter && { isEmailVerified: emailStatusFilter === 'verified' ? 'true' : 'false' }),
//         ...(startDate && { startDate }),
//         ...(endDate && { endDate }),
//       });

//       console.log('Fetching users from:', `/users?${params}`);
      
//       try {
//         const response = await clientService.get<ApiResponse<UsersApiResponse>>(`/users?${params}`);
//         console.log('🚀 FULL API RESPONSE:', response);
//         console.log('📊 Response data:', response.data);
        
//         // Check the actual structure
//         if (response.data && typeof response.data === 'object') {
//           const apiData = response.data as ApiResponse<UsersApiResponse>;
//           console.log('🔍 Response keys:', Object.keys(apiData));
//           console.log('👥 Users data:', apiData.data?.data);
//           console.log('📄 Pagination:', apiData.data?.pagination);
//         }
        
//         // Return the nested data structure
//         return (response.data as ApiResponse<UsersApiResponse>).data;
//       } catch (err) {
//         console.error('❌ API Error:', err);
//         throw err;
//       }
//     },
//   });

//   // DEBUG: Check what usersData contains
//   React.useEffect(() => {
//     console.log('🎯 usersData:', usersData);
//     console.log('🎯 usersData type:', typeof usersData);
//     if (usersData) {
//       console.log('🎯 usersData keys:', Object.keys(usersData));
//       console.log('🎯 usersData.data:', (usersData as UsersApiResponse).data);
//       console.log('🎯 usersData.pagination:', (usersData as UsersApiResponse).pagination);
//     }
//   }, [usersData]);

//   // FLEXIBLE: Extract data based on actual API structure with proper typing
//   const users: BackendUser[] = React.useMemo(() => {
//     if (!usersData) return [];
    
//     const data = usersData as UsersApiResponse;
    
//     // Try different possible structures
//     if (Array.isArray(data)) {
//       console.log('📦 usersData is direct array');
//       return data;
//     } else if (Array.isArray(data.data)) {
//       console.log('📦 usersData.data is array');
//       return data.data;
//     } else if (data && 'users' in data && Array.isArray((data as any).users)) {
//       console.log('📦 usersData.users is array');
//       return (data as any).users;
//     } else if (data && 'items' in data && Array.isArray((data as any).items)) {
//       console.log('📦 usersData.items is array');
//       return (data as any).items;
//     }
    
//     console.log('❓ Unknown usersData structure:', usersData);
//     return [];
//   }, [usersData]);

//   // FLEXIBLE: Extract total count with proper typing - FIXED
//   const totalUsers = React.useMemo(() => {
//     if (!usersData) return 0;
    
//     const data = usersData as UsersApiResponse;
    
//     if (data.pagination?.totalItems) {
//       return data.pagination.totalItems;
//     } else if ((data as any).total) {
//       return (data as any).total;
//     } else if ((data as any).totalCount) {
//       return (data as any).totalCount;
//     } else if (data.pagination && 'total' in data.pagination) {
//       // FIX: Use type assertion for pagination.total
//       return (data.pagination as any).total;
//     }
    
//     return users.length; // Fallback to current array length
//   }, [usersData, users]);

//   console.log('🎯 Final users:', users);
//   console.log('🎯 Final totalUsers:', totalUsers);

//   // Update user status
//   const updateUserStatus = async (userId: string, status: 'active' | 'inactive'): Promise<void> => {
//     setUpdatingStatus(userId);
    
//     try {
//       console.log(`Updating user ${userId} status to: ${status}`);
      
//       const response = await clientService.patch<ApiResponse>(`/users/${userId}/status`, { 
//         isBlocked: status === 'inactive'
//       });

//       const result = response.data as ApiResponse;
      
//       if (result && !result.success) {
//         throw new Error(result.message || 'Failed to update user status');
//       }

//       await queryClient.invalidateQueries({ 
//         queryKey: ['users'], 
//         refetchType: 'active'
//       });
      
//       console.log(`User ${userId} status successfully updated to: ${status}`);
//     } catch (error) {
//       console.error('Error updating user status:', error);
//       alert(`Failed to update user status: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       setUpdatingStatus(null);
//     }
//   };

//   // Update email verification status
//   const updateEmailVerification = async (userId: string, isEmailVerified: boolean): Promise<void> => {
//     setUpdatingEmailVerification(userId);
    
//     try {
//       console.log(`Updating user ${userId} email verification to: ${isEmailVerified}`);
      
//       const response = await clientService.put<ApiResponse>(`/users/${userId}`, { 
//         isEmailVerified 
//       });

//       const result = response.data as ApiResponse;
      
//       if (result && !result.success) {
//         throw new Error(result.message || 'Failed to update email verification');
//       }

//       await queryClient.invalidateQueries({ 
//         queryKey: ['users'], 
//         refetchType: 'active'
//       });
      
//       console.log(`User ${userId} email verification successfully updated to: ${isEmailVerified}`);
//     } catch (error) {
//       console.error('Error updating email verification:', error);
//       alert(`Failed to update email verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       setUpdatingEmailVerification(null);
//     }
//   };

//   // Delete user function
//   const deleteUser = async (userId: string): Promise<void> => {
//     const response = await clientService.delete<ApiResponse>(`/users/${userId}`);
//     const result = response.data as ApiResponse;
    
//     if (result && !result.success) {
//       throw new Error(result.message || 'Failed to delete user');
//     }
//   };

//   // Handle edit user
//   const handleEditUser = (user: any) => {
//     router.push(`/user/user-view/edit-user?id=${user.id}`);
//   };

//   // Handle view user
//   const handleViewUser = (user: any) => {
//     setViewingUser(user);
//   };

//   // Handle delete user confirmation
//   const handleDeleteUser = async () => {
//     if (!deletingUser) return;
    
//     setIsDeleting(true);
//     try {
//       await deleteUser(deletingUser.id);
      
//       await queryClient.invalidateQueries({ 
//         queryKey: ['users'], 
//         refetchType: 'active'
//       });
      
//       setDeletingUser(null);
//       console.log('User deleted successfully');
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       alert(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   // Handle status change
//   const handleStatusChange = (user: any, status: 'active' | 'inactive') => {
//     updateUserStatus(user.id, status);
//   };

//   // Handle email verification change
//   const handleEmailVerificationChange = (user: any, isEmailVerified: boolean) => {
//     updateEmailVerification(user.id, isEmailVerified);
//   };

//   // Transform backend data to table format
//   const dataWithSerial = useMemo(() => {
//     return users.map((user: BackendUser, index: number) => ({
//       id: user._id,
//       serialNo: (currentPage - 1) * limit + (index + 1),
//       name: `${user.firstName} ${user.lastName}`,
//       email: user.email,
//       phone: user.phoneNumber,
//       status: user.isBlocked ? 'inactive' : 'active',
//       createdAt: user.createdAt,
//       category: getCategoryName(user.userType),
//       isEmailVerified: user.isEmailVerified,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       isActive: !user.isBlocked,
//       originalCategory: user.userType,
//       address: user.address
//     }));
//   }, [users, currentPage, limit]);

//   // Handle Add User button click
//   const handleAddUser = () => {
//     router.push('/user/user-view/add-user');
//   };

//   const columns = useUserColumns({
//     onEdit: handleEditUser,
//     onDelete: (user) => {
//       console.log('Delete user:', user);
//       setDeletingUser(user);
//     },
//     onView: handleViewUser,
//     onStatusChange: handleStatusChange,
//     onEmailVerificationChange: handleEmailVerificationChange
//   });

//   // Add error handling
//   if (error) {
//     return (
//       <div className="p-6">
//         <div className="bg-red-50 border border-red-200 rounded-md p-4">
//           <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
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

//   // Filters component
//   const UserFilters = (
//     <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
//       <StatusFilter
//         value={statusFilter}
//         onChange={setStatusFilter}
//         placeholder="All Users"
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
//         className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-nowrap"
//       >
//         Clear Filters
//       </button>
//     </div>
//   );

//   return (
//     <div>
//       <DataGridWrapper
//         title="Users Management"
//         description="Manage all users in the system"
//         columns={columns}
//         data={dataWithSerial}
//         isLoading={isLoading}
//         totalRows={totalUsers}
//         rowsPerPage={limit}
//         currentPage={currentPage}
//         onPageChange={setCurrentPage}
//         isSearchEnabled={true}
//         searchState={search}
//         setSearchState={setSearch}
//         searchPlaceholder="Search users by name, email..."
//         filtersComponent={UserFilters}
//         defaultFiltersExpanded={true}
//         hasAddButton={true}
//         addButtonText="Add User"
//         addButtonOnClick={handleAddUser}
//         hasExportButton={true}
//         onExport={() => console.log('Export users')}
//       />

//       {/* Delete Confirmation Modal */}
//       <DeleteConfirmationModal
//         isOpen={!!deletingUser}
//         onClose={() => !isDeleting && setDeletingUser(null)}
//         onConfirm={handleDeleteUser}
//         title="Delete User"
//         message="Are you sure you want to delete this user? This action cannot be undone and all associated data will be permanently removed."
//         itemName={deletingUser?.name}
//         isLoading={isDeleting}
//         type="user"
//       />

//       {/* View Details Modal */}
//       <ViewDetailsModal
//         isOpen={!!viewingUser}
//         onClose={() => setViewingUser(null)}
//         type="user"
//         data={viewingUser}
//       />
//     </div>
//   );
// };

// export default UsersPage;












'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import DataGridWrapper from '../../../../_components/_data-grid/DataGridWrapper';
import { useUserColumns } from '../../../../_components/_hooks/useUserColumns';
import StatusFilter, { EmailStatusFilter } from '../../../../_components/_filters/StatusFilter';
import DateRangeFilter from '../../../../_components/_filters/DateRangeFilter';
import DeleteConfirmationModal from '../../../../_components/_modals/DeleteConfirmationModal';
import ViewDetailsModal from '../../../../_components/_view-modal/ViewDetailsModal';
import { clientService } from '../../../../app/utils/api-client';
import { usePermissions } from '../../../../_components/contexts/PermissionContext'; // ADD PERMISSIONS IMPORT

// Updated interface for backend response with new model
interface BackendUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userType: any;
  address?: any;
  isBlocked: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

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

interface UsersApiResponse {
  data: BackendUser[];
  pagination?: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}

const UsersPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { permissions } = usePermissions(); // GET PERMISSIONS
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [emailStatusFilter, setEmailStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [updatingEmailVerification, setUpdatingEmailVerification] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const limit = 10;

  // Check if user has permission to access this page
  const hasUserViewPermission = permissions['users.view'] === true;
  const hasUserCreatePermission = permissions['users.create'] === true;
  const hasUserEditPermission = permissions['users.edit'] === true;
  const hasUserDeletePermission = permissions['users.delete'] === true;

  // If user has no permission to view users, show access denied
  if (!hasUserViewPermission && !hasUserCreatePermission && !hasUserEditPermission && !hasUserDeletePermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the users management page.
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

  // Safe category name getter
  const getCategoryName = (userType: any): string => {
    if (!userType) return 'No Category';
    
    if (typeof userType === 'string') {
      return userType;
    }
    
    if (typeof userType === 'object') {
      return userType.role || userType._id || 'Unnamed Category';
    }
    
    return 'No Category';
  };

  // Fetch users data with proper typing
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['users', search, statusFilter, emailStatusFilter, startDate, endDate, currentPage],
    queryFn: async (): Promise<UsersApiResponse> => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter && { isBlocked: statusFilter === 'inactive' ? 'true' : 'false' }),
        ...(emailStatusFilter && { isEmailVerified: emailStatusFilter === 'verified' ? 'true' : 'false' }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      console.log('Fetching users from:', `/users?${params}`);
      
      try {
        const response = await clientService.get<ApiResponse<UsersApiResponse>>(`/users?${params}`);
        console.log('🚀 FULL API RESPONSE:', response);
        console.log('📊 Response data:', response.data);
        
        // Check the actual structure
        if (response.data && typeof response.data === 'object') {
          const apiData = response.data as ApiResponse<UsersApiResponse>;
          console.log('🔍 Response keys:', Object.keys(apiData));
          console.log('👥 Users data:', apiData.data?.data);
          console.log('📄 Pagination:', apiData.data?.pagination);
        }
        
        // Return the nested data structure
        return (response.data as ApiResponse<UsersApiResponse>).data;
      } catch (err) {
        console.error('❌ API Error:', err);
        throw err;
      }
    },
    enabled: hasUserViewPermission, // Only fetch if user has view permission
  });

  // FLEXIBLE: Extract data based on actual API structure with proper typing
  const users: BackendUser[] = React.useMemo(() => {
    if (!usersData) return [];
    
    const data = usersData as UsersApiResponse;
    
    // Try different possible structures
    if (Array.isArray(data)) {
      console.log('📦 usersData is direct array');
      return data;
    } else if (Array.isArray(data.data)) {
      console.log('📦 usersData.data is array');
      return data.data;
    } else if (data && 'users' in data && Array.isArray((data as any).users)) {
      console.log('📦 usersData.users is array');
      return (data as any).users;
    } else if (data && 'items' in data && Array.isArray((data as any).items)) {
      console.log('📦 usersData.items is array');
      return (data as any).items;
    }
    
    console.log('❓ Unknown usersData structure:', usersData);
    return [];
  }, [usersData]);

  // FLEXIBLE: Extract total count with proper typing - FIXED
  const totalUsers = React.useMemo(() => {
    if (!usersData) return 0;
    
    const data = usersData as UsersApiResponse;
    
    if (data.pagination?.totalItems) {
      return data.pagination.totalItems;
    } else if ((data as any).total) {
      return (data as any).total;
    } else if ((data as any).totalCount) {
      return (data as any).totalCount;
    } else if (data.pagination && 'total' in data.pagination) {
      // FIX: Use type assertion for pagination.total
      return (data.pagination as any).total;
    }
    
    return users.length; // Fallback to current array length
  }, [usersData, users]);

  // Update user status
  const updateUserStatus = async (userId: string, status: 'active' | 'inactive'): Promise<void> => {
    // Check permission
    if (!hasUserEditPermission) {
      alert('You do not have permission to update user status');
      return;
    }
    
    setUpdatingStatus(userId);
    
    try {
      console.log(`Updating user ${userId} status to: ${status}`);
      
      const response = await clientService.patch<ApiResponse>(`/users/${userId}/status`, { 
        isBlocked: status === 'inactive'
      });

      const result = response.data as ApiResponse;
      
      if (result && !result.success) {
        throw new Error(result.message || 'Failed to update user status');
      }

      await queryClient.invalidateQueries({ 
        queryKey: ['users'], 
        refetchType: 'active'
      });
      
      console.log(`User ${userId} status successfully updated to: ${status}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert(`Failed to update user status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Update email verification status
  const updateEmailVerification = async (userId: string, isEmailVerified: boolean): Promise<void> => {
    // Check permission
    if (!hasUserEditPermission) {
      alert('You do not have permission to update email verification');
      return;
    }
    
    setUpdatingEmailVerification(userId);
    
    try {
      console.log(`Updating user ${userId} email verification to: ${isEmailVerified}`);
      
      const response = await clientService.put<ApiResponse>(`/users/${userId}`, { 
        isEmailVerified 
      });

      const result = response.data as ApiResponse;
      
      if (result && !result.success) {
        throw new Error(result.message || 'Failed to update email verification');
      }

      await queryClient.invalidateQueries({ 
        queryKey: ['users'], 
        refetchType: 'active'
      });
      
      console.log(`User ${userId} email verification successfully updated to: ${isEmailVerified}`);
    } catch (error) {
      console.error('Error updating email verification:', error);
      alert(`Failed to update email verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdatingEmailVerification(null);
    }
  };

  // Delete user function
  const deleteUser = async (userId: string): Promise<void> => {
    const response = await clientService.delete<ApiResponse>(`/users/${userId}`);
    const result = response.data as ApiResponse;
    
    if (result && !result.success) {
      throw new Error(result.message || 'Failed to delete user');
    }
  };

  // Handle edit user
  const handleEditUser = (user: any) => {
    // Check permission
    if (!hasUserEditPermission) {
      alert('You do not have permission to edit users');
      return;
    }
    router.push(`/user/user-view/edit-user?id=${user.id}`);
  };

  // Handle view user
  const handleViewUser = (user: any) => {
    // Check permission (view is usually allowed if user can see the list)
    if (!hasUserViewPermission) {
      alert('You do not have permission to view user details');
      return;
    }
    setViewingUser(user);
  };

  // Handle delete user confirmation
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    
    // Check permission
    if (!hasUserDeletePermission) {
      alert('You do not have permission to delete users');
      setDeletingUser(null);
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteUser(deletingUser.id);
      
      await queryClient.invalidateQueries({ 
        queryKey: ['users'], 
        refetchType: 'active'
      });
      
      setDeletingUser(null);
      console.log('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle status change
  const handleStatusChange = (user: any, status: 'active' | 'inactive') => {
    // Permission check is inside updateUserStatus
    updateUserStatus(user.id, status);
  };

  // Handle email verification change
  const handleEmailVerificationChange = (user: any, isEmailVerified: boolean) => {
    // Permission check is inside updateEmailVerification
    updateEmailVerification(user.id, isEmailVerified);
  };

  // Transform backend data to table format
  const dataWithSerial = useMemo(() => {
    return users.map((user: BackendUser, index: number) => ({
      id: user._id,
      serialNo: (currentPage - 1) * limit + (index + 1),
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phoneNumber,
      status: user.isBlocked ? 'inactive' : 'active',
      createdAt: user.createdAt,
      category: getCategoryName(user.userType),
      isEmailVerified: user.isEmailVerified,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: !user.isBlocked,
      originalCategory: user.userType,
      address: user.address
    }));
  }, [users, currentPage, limit]);

  // Handle Add User button click
  const handleAddUser = () => {
    // Check permission
    if (!hasUserCreatePermission) {
      alert('You do not have permission to add users');
      return;
    }
    router.push('/user/user-view/add-user');
  };

  const columns = useUserColumns({
    onEdit: (user) => {
      // Check permission in callback
      if (!hasUserEditPermission) {
        alert('You do not have permission to edit users');
        return;
      }
      handleEditUser(user);
    },
    onDelete: (user) => {
      // Check permission in callback
      if (!hasUserDeletePermission) {
        alert('You do not have permission to delete users');
        return;
      }
      console.log('Delete user:', user);
      setDeletingUser(user);
    },
    onView: (user) => {
      // Check permission in callback
      if (!hasUserViewPermission) {
        alert('You do not have permission to view user details');
        return;
      }
      handleViewUser(user);
    },
    onStatusChange: (user, status) => {
      // Permission check is handled in handleStatusChange
      handleStatusChange(user, status);
    },
    onEmailVerificationChange: (user, isVerified) => {
      // Permission check is handled in handleEmailVerificationChange
      handleEmailVerificationChange(user, isVerified);
    },
    permissions: permissions // Pass permissions to the hook if it supports it
  });

  // Add error handling
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
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

  // Filters component
  const UserFilters = (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <StatusFilter
        value={statusFilter}
        onChange={setStatusFilter}
        placeholder="All Users"
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
        className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-nowrap"
      >
        Clear Filters
      </button>
    </div>
  );

  return (
    <div>
      <DataGridWrapper
        title="Users Management"
        description="Manage all users in the system"
        columns={columns}
        data={dataWithSerial}
        isLoading={isLoading}
        totalRows={totalUsers}
        rowsPerPage={limit}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isSearchEnabled={true}
        searchState={search}
        setSearchState={setSearch}
        searchPlaceholder="Search users by name, email..."
        filtersComponent={UserFilters}
        defaultFiltersExpanded={true}
        hasAddButton={true}
        addButtonText="Add User"
        addButtonOnClick={handleAddUser}
        addButtonPermission="users.create" // ADD PERMISSION CHECK
        hasExportButton={true}
        onExport={() => console.log('Export users')}
        allPermissions={permissions} // PASS PERMISSIONS
        enableRowActions={true}
        editPermission="users.edit" // EDIT PERMISSION
        deletePermission="users.delete" // DELETE PERMISSION
        // enableBulkActions={hasUserDeletePermission} // Only enable if user can delete
        // onBulkDelete={(selectedUsers) => {
        //   if (!hasUserDeletePermission) {
        //     alert('You do not have permission to delete users');
        //     return;
        //   }
        //   // Handle bulk delete
        //   console.log('Bulk delete users:', selectedUsers);
        // }}
        // bulkDeletePermission="users.delete" // BULK DELETE PERMISSION
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingUser}
        onClose={() => !isDeleting && setDeletingUser(null)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone and all associated data will be permanently removed."
        itemName={deletingUser?.name}
        isLoading={isDeleting}
        type="user"
      />

      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
        type="user"
        data={viewingUser}
      />
    </div>
  );
};

export default UsersPage;