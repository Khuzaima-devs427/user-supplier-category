'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

interface CategoryFormData {
  role: string;
  categoryType: string;
  description: string;
}

interface Category {
  _id: string;
  role: string;
  categoryType: string;
  description: string;
  permissions: string[];
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

const EditCategoryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const categoryId = searchParams.get('id');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState<CategoryFormData>({
    role: '',
    categoryType: '',
    description: '',
  });

  // Updated to match your backend enum
  const categoryTypes = [
    { value: 'Supplier', label: 'Supplier' },
    { value: 'User', label: 'User' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Super Admin', label: 'Super Admin' },
    { value: 'Other', label: 'Other' },
  ];

  // Fetch category data on component mount
  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    } else {
      setIsFetching(false);
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setIsFetching(true);
      // FIXED: Using correct endpoint
      const response = await fetch(`http://localhost:5000/api/user-categories/${categoryId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const category: Category = result.data;
        setFormData({
          role: category.role || '',
          categoryType: category.categoryType || '', // Changed from 'type' to 'categoryType'
          description: category.description || '',
        });
      } else {
        throw new Error(result.message || 'Failed to fetch category data');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      alert(`Failed to load category: ${error instanceof Error ? error.message : 'Unknown error'}`);
      router.push('/user/user-categories');
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryId) {
      alert('Category ID is missing');
      return;
    }

    setIsLoading(true);

    try {
      // FIXED: Using correct endpoint and field names
      const response = await fetch(`http://localhost:5000/api/user-categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: formData.role,
          categoryType: formData.categoryType, // Changed from 'type' to 'categoryType'
          description: formData.description,
          permissions: [] // Add permissions array as required by backend
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Force immediate refetch of categories data
        await queryClient.invalidateQueries({ 
          queryKey: ['categories'], 
          refetchType: 'active' 
        });
        
        alert('Category updated successfully!');
        router.push('/user/user-categories');
      } else {
        alert(result.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/user/user-categories');
  };

  // Show loading state while fetching category data
  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-center text-gray-600">Loading category data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no category ID
  if (!categoryId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-600 mb-4">Category Not Found</h2>
              <p className="text-gray-600 mb-6">Unable to find the category to edit.</p>
              <button
                onClick={handleCancel}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Back to Categories
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit User Category</h1>
            <p className="mt-1 text-sm text-gray-600">
              Update the user category information below.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter category role"
              />
            </div>

            {/* Category Type */}
            <div>
              <label htmlFor="categoryType" className="block text-sm font-medium text-gray-700 mb-2">
                Category Type *
              </label>
              <select
                id="categoryType"
                name="categoryType"
                value={formData.categoryType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select Category Type</option>
                {categoryTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter category description (optional)"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCategoryPage;