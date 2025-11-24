'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import DataGridWrapper from '../../_components/_data-grid/DataGridWrapper';
import { useUserColumns } from '../../_components/_hooks/useUserColumns';
import StatusFilter, { EmailStatusFilter } from '../../_components/_filters/StatusFilter';
import DateRangeFilter from '../../_components/_filters/DateRangeFilter';
import DeleteConfirmationModal from '../../_components/_modals/DeleteConfirmationModal';
import ViewDetailsModal from '../../_components/_view-modal/ViewDetailsModal';

// Updated interface for backend response with new model
interface BackendUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userType: any; // Reference to UserCategory
  address?: any;
  isBlocked: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

const UsersPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
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

  // Safe category name getter
  const getCategoryName = (userType: any): string => {
    if (!userType) return 'No Category';
    
    if (typeof userType === 'string') {
      return userType;
    }
    
    // Handle populated userType object
    if (typeof userType === 'object') {
      return userType.role || userType._id || 'Unnamed Category';
    }
    
    return 'No Category';
  };

  // Fetch users data - FIXED: Using correct endpoint
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['users', search, statusFilter, emailStatusFilter, startDate, endDate, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter && { isBlocked: statusFilter === 'inactive' ? 'true' : 'false' }), // Changed from isActive to isBlocked
        ...(emailStatusFilter && { isEmailVerified: emailStatusFilter === 'verified' ? 'true' : 'false' }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      console.log('Fetching users from:', `http://localhost:5000/api/users?${params}`);
      
      const response = await fetch(`http://localhost:5000/api/users?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Users API Response:', data);
      return data;
    },
  });

  // Update user status - FIXED: Using correct endpoint and field
  const updateUserStatus = async (userId: string, status: 'active' | 'inactive'): Promise<void> => {
    setUpdatingStatus(userId);
    
    try {
      console.log(`Updating user ${userId} status to: ${status}`);
      
      const response = await fetch(`http://localhost:5000/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          isBlocked: status === 'inactive' // Changed from isActive to isBlocked
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update user status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
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

  // Update email verification status - FIXED: Check if this endpoint exists
  const updateEmailVerification = async (userId: string, isEmailVerified: boolean): Promise<void> => {
    setUpdatingEmailVerification(userId);
    
    try {
      console.log(`Updating user ${userId} email verification to: ${isEmailVerified}`);
      
      // NOTE: This endpoint might not exist in your backend yet
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT', // Using update endpoint instead
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          isEmailVerified 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update email verification: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
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

  // Delete user function - FIXED: Using correct endpoint
  const deleteUser = async (userId: string): Promise<void> => {
    const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete user: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete user');
    }
  };

  // Handle edit user
  const handleEditUser = (user: any) => {
    router.push(`/user/user-view/edit-user?id=${user.id}`);
  };

  // Handle view user
  const handleViewUser = (user: any) => {
    setViewingUser(user);
  };

  // Handle delete user confirmation
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    
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
    updateUserStatus(user.id, status);
  };

  // Handle email verification change
  const handleEmailVerificationChange = (user: any, isEmailVerified: boolean) => {
    updateEmailVerification(user.id, isEmailVerified);
  };

  // Extract data from backend response
  const users: BackendUser[] = usersData?.data || [];
  const totalUsers = usersData?.pagination?.totalItems || 0;

  console.log('Processed users:', users);

  // Transform backend data to table format - FIXED: Using correct field names
  const dataWithSerial = useMemo(() => {
    return users.map((user: BackendUser, index: number) => ({
      id: user._id, // Changed from user.id to user._id
      serialNo: (currentPage - 1) * limit + (index + 1),
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phoneNumber, // Changed from user.phone to user.phoneNumber
      status: user.isBlocked ? 'inactive' : 'active', // Inverted logic for isBlocked
      createdAt: user.createdAt,
      category: getCategoryName(user.userType), // Changed from user.category to user.userType
      isEmailVerified: user.isEmailVerified,
      // Add original data for view modal
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: !user.isBlocked, // Calculate isActive from isBlocked
      originalCategory: user.userType, // Keep original for view modal
      address: user.address
    }));
  }, [users, currentPage, limit]);

  // Handle Add User button click
  const handleAddUser = () => {
    router.push('/user/user-view/add-user');
  };

  const columns = useUserColumns({
    onEdit: handleEditUser,
    onDelete: (user) => {
      console.log('Delete user:', user);
      setDeletingUser(user);
    },
    onView: handleViewUser,
    onStatusChange: handleStatusChange,
    onEmailVerificationChange: handleEmailVerificationChange
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
        hasExportButton={true}
        onExport={() => console.log('Export users')}
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