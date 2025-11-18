'use client';

import React, { useState, useMemo, useEffect } from 'react';
import DataGridWrapper from '../../_components/_data-grid/DataGridWrapper';
import { useCategoryColumns } from '../../_components/_hooks/useCategoryColumns';
import StatusFilter  from '../../_components/_filters/StatusFilter';
import DateRangeFilter from '../../_components/_filters/DateRangeFilter';
import { CategoryTypeFilter } from '../../_components/_filters/StatusFilter';

interface Category {
  id: string;
  serialNo: number;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
  itemsCount: number;
}

const CategoriesPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [CategoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCategories, setTotalCategories] = useState(0);
  
  const limit = 10;

  // Fetch categories data
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
          ...(search && { search }),
          ...(statusFilter && { status: statusFilter }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        });

        const response = await fetch(`/api/categories?${params}`);
        const data = await response.json();
        
        setCategories(data.categories || []);
        setTotalCategories(data.totalCount || 0);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
        setTotalCategories(0);
      } finally {
        setIsLoading(false);
      }
    };

    // Add debounce for search
    const timeoutId = setTimeout(() => {
      fetchCategories();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, statusFilter, startDate, endDate, currentPage]);

  // Add serial numbers to data
  const dataWithSerial = useMemo(() => {
    return categories.map((category, index) => ({
      ...category,
      serialNo: (currentPage - 1) * limit + (index + 1),
    }));
  }, [categories, currentPage, limit]);

  const columns = useCategoryColumns(
    (category) => {
      // Handle edit category
      console.log('Edit category:', category);
      // You can navigate to edit page or open a modal
      // router.push(`/categories/edit/${category.id}`);
    },
    (category) => {
      // Handle delete category
      console.log('Delete category:', category);
      // You can show a confirmation modal here
      if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
        // Perform delete operation
        deleteCategory(category.id);
      }
    }
  );

  // Delete category function
  const deleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh the categories list
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
        });
        const refreshedResponse = await fetch(`/api/categories?${params}`);
        const refreshedData = await refreshedResponse.json();
        
        setCategories(refreshedData.categories || []);
        setTotalCategories(refreshedData.totalCount || 0);
        
        alert('Category deleted successfully!');
      } else {
        alert('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  // Handle add new category
  const handleAddCategory = () => {
    console.log('Add new category clicked');
    // Navigate to add category page or open modal
    // router.push('/categories/add');
  };

  // Handle export categories
  const handleExportCategories = () => {
    console.log('Export categories clicked');
    // Implement export functionality
  };

  // Filters component
  const CategoryFilters = (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <StatusFilter
        value={statusFilter}
        onChange={setStatusFilter}
        placeholder="Filter by status"
      />
      <CategoryTypeFilter
        value={CategoryFilter}
        onChange={setCategoryFilter}
        placeholder="Category Type"
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
          setCategoryFilter('');
          setStartDate('');
          setEndDate('');
          setSearch('');
          setCurrentPage(1);
        }}
        className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        Clear Filters
      </button>
    </div>
  );

  return (
    <DataGridWrapper
      title="Categories Management"
      description="Manage all product categories in the system"
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
      searchPlaceholder="Search categories by name, description..."
      filtersComponent={CategoryFilters}
      defaultFiltersExpanded={true}
      hasAddButton={true}
      addButtonText="Add Category"
      addButtonOnClick={handleAddCategory}
      hasExportButton={true}
      onExport={handleExportCategories}
    />
  );
};

export default CategoriesPage;