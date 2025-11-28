'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DataGridWrapper from '../../_components/_data-grid/DataGridWrapper';
import { useCategoryColumns } from '../../_components/_hooks/useCategoryColumns';
import DeleteConfirmationModal from '../../_components/_modals/DeleteConfirmationModal';
import ViewCategoryModal from '../../_components/_view-modal/ViewCategoryModal';
import { TypeFilter, StatusFilter } from '../../_components/_filters/StatusFilter';
import DateRangeFilter from '../../_components/_filters/DateRangeFilter';

// Updated interface to match your actual backend model
interface BackendCategory {
  _id: string;
  role: string;
  description: string;
  categoryType: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const CategoriesPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingCategory, setDeletingCategory] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const limit = 10;

  // Fetch categories data
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['categories', search, typeFilter, statusFilter, startDate, endDate, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(typeFilter && { categoryType: typeFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      console.log('Fetching categories from:', `http://localhost:5000/api/user-categories?${params}`);
      
      const response = await fetch(`http://localhost:5000/api/user-categories?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Categories API Response:', data);
      return data;
    },
  });

  // Delete category function
  const deleteCategory = async (categoryId: string): Promise<void> => {
    const response = await fetch(`http://localhost:5000/api/user-categories/${categoryId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete category: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete category');
    }
  };

  // Handle view category
  const handleViewCategory = (category: any) => {
    setViewingCategory(category);
    setIsViewModalOpen(true);
  };

  // Handle edit category
  const handleEditCategory = (category: any) => {
    router.push(`/user/user-categories/edit-category?id=${category.id}`);
  };

  // Handle delete category confirmation
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    
    setIsDeleting(true);
    try {
      await deleteCategory(deletingCategory.id);
      
      // Better cache invalidation
      await Promise.all([
        queryClient.invalidateQueries({ 
          queryKey: ['categories'], 
          refetchType: 'all'
        }),
        queryClient.refetchQueries({
          queryKey: ['categories']
        })
      ]);
      
      setDeletingCategory(null);
      console.log('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(`Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle status change
// Update the handleStatusChange function to use correct ID
const handleStatusChange = async (category: any, status: 'active' | 'inactive') => {
  try {
    console.log('🔄 Update user category status:', category.id, status);
    
    const response = await fetch(`http://localhost:5000/api/user-categories/${category.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update category status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update category status');
    }

    // Invalidate and refetch
    await queryClient.invalidateQueries({ queryKey: ['categories'] });
    
    console.log('✅ Category status updated successfully');
  } catch (error) {
    console.error('❌ Error updating category status:', error);
    alert(`Failed to update category status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
  // Extract data from backend response
  const categories: BackendCategory[] = categoriesData?.data || [];
  const totalCategories = categoriesData?.pagination?.totalItems || 0;

  // Transform backend data to table format
  const dataWithSerial = useMemo(() => {
    return categories.map((category: BackendCategory, index: number) => ({
      id: category._id,
      serialNo: (currentPage - 1) * limit + (index + 1),
      role: category.role,
      type: category.categoryType,
      description: category.description,
      status: category.status,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
  }, [categories, currentPage, limit]);

  // Handle Add Category button click
  const handleAddCategory = () => {
    router.push('/user/user-categories/add-categories');
  };

  const columns = useCategoryColumns({
    onEdit: handleEditCategory,
    onDelete: (category) => {
      console.log('Delete category:', category);
      setDeletingCategory(category);
    },
    onStatusChange: handleStatusChange,
    onView: handleViewCategory
  });

  const CategoryFilters = (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <TypeFilter
        value={typeFilter}
        onChange={setTypeFilter}
        placeholder="All Types"
      />

      {/* FIXED: Using imported StatusFilter component */}
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
          setTypeFilter('');
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

  // Add error handling
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-red-800">Error loading categories</h3>
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
        title="User Categories Management"
        description="Manage all user categories in the system"
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
        searchPlaceholder="Search categories by role..."
        filtersComponent={CategoryFilters}
        defaultFiltersExpanded={true}
        hasAddButton={true}
        addButtonText="Add Category"
        addButtonOnClick={handleAddCategory}
        hasExportButton={true}
        onExport={() => console.log('Export categories')}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingCategory}
        onClose={() => !isDeleting && setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        itemName={deletingCategory?.role}
        isLoading={isDeleting}
        type="category"
      />

      {/* View Category Modal */}
      <ViewCategoryModal
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

export default CategoriesPage;