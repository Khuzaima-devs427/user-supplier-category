// app/supplier/supplier-categories/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DataGridWrapper from '../../_components/_data-grid/DataGridWrapper';
import { useSupplierCategoryColumns } from '../../_components/_hooks/useSupplierCategoryColumns';
import DeleteConfirmationModal from '../../_components/_modals/DeleteConfirmationModal';
import ViewSupplierCategoryModal from '../../_components/_view-modal/ViewSupplierCategoryModal';
import { TypeFilter } from '../../_components/_filters/StatusFilter';
import DateRangeFilter from '../../_components/_filters/DateRangeFilter';

interface BackendSupplierCategory {
  _id: string;
  name: string;
  description: string;
  productCategories: string[];
  productType: 'new' | 'scrap';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const SupplierCategoriesPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingCategory, setDeletingCategory] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const limit = 10;

  // Fetch supplier categories data
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['supplier-categories', search, productTypeFilter, statusFilter, startDate, endDate, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(productTypeFilter && { productType: productTypeFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      console.log('Fetching supplier categories from:', `http://localhost:5000/api/supplier-categories?${params}`);
      
      const response = await fetch(`http://localhost:5000/api/supplier-categories?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Supplier Categories API Response:', data);
      return data;
    },
  });

  // Delete supplier category function
  const deleteSupplierCategory = async (categoryId: string): Promise<void> => {
    const response = await fetch(`http://localhost:5000/api/supplier-categories/${categoryId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete supplier category: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete supplier category');
    }
  };

  // Handle view supplier category
  const handleViewCategory = (category: any) => {
    setViewingCategory(category);
    setIsViewModalOpen(true);
  };

  // Handle edit supplier category
  const handleEditCategory = (category: any) => {
    router.push(`/supplier/supplier-categories/edit-supplier-category?id=${category.id}`);
  };

  // Handle delete supplier category confirmation
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    
    setIsDeleting(true);
    try {
      await deleteSupplierCategory(deletingCategory.id);
      
      // FIXED: Better cache invalidation
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
      console.log('Supplier category deleted successfully');
    } catch (error) {
      console.error('Error deleting supplier category:', error);
      alert(`Failed to delete supplier category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle status change - FIXED: Better cache invalidation
  const handleStatusChange = async (category: any, status: 'active' | 'inactive') => {
    try {
      console.log('Update supplier category status:', category.id, status);
      
      const response = await fetch(`http://localhost:5000/api/supplier-categories/${category.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update supplier category status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update supplier category status');
      }

      // FIXED: Better cache invalidation
      await Promise.all([
        queryClient.invalidateQueries({ 
          queryKey: ['supplier-categories'], 
          refetchType: 'all'
        }),
        queryClient.refetchQueries({
          queryKey: ['supplier-categories']
        })
      ]);
      
      console.log('Supplier category status updated successfully');
    } catch (error) {
      console.error('Error updating supplier category status:', error);
      alert(`Failed to update supplier category status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Extract data from backend response
  const categories: BackendSupplierCategory[] = categoriesData?.data || [];
  const totalCategories = categoriesData?.pagination?.totalItems || 0;

  // Transform backend data to table format
  const dataWithSerial = useMemo(() => {
    return categories.map((category: BackendSupplierCategory, index: number) => ({
      id: category._id,
      serialNo: (currentPage - 1) * limit + (index + 1),
      name: category.name,
      description: category.description,
      productCategories: category.productCategories,
      productType: category.productType,
      status: category.status,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
  }, [categories, currentPage, limit]);

  // Handle Add Supplier Category button click
  const handleAddCategory = () => {
    router.push('/supplier/supplier-categories/add-supplier-category');
  };

  const columns = useSupplierCategoryColumns({
    onEdit: handleEditCategory,
    onDelete: (category) => {
      console.log('Delete supplier category:', category);
      setDeletingCategory(category);
    },
    onStatusChange: handleStatusChange,
    onView: handleViewCategory
  });

  const SupplierCategoryFilters = (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <select
        value={productTypeFilter}
        onChange={(e) => setProductTypeFilter(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="">All Product Types</option>
        <option value="new">New Products</option>
        <option value="scrap">Scrap Products</option>
      </select>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
 
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      
      <button
        onClick={() => {
          setProductTypeFilter('');
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
        hasExportButton={true}
        onExport={() => console.log('Export supplier categories')}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingCategory}
        onClose={() => !isDeleting && setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Supplier Category"
        message="Are you sure you want to delete this supplier category? This action cannot be undone."
        itemName={deletingCategory?.name}
        isLoading={isDeleting}
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