// app/user/user-categories/edit-category/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

interface CategoryFormData {
  role: string;
  categoryType: string;
  description: string;
  permissions: string[];
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

interface SystemPermission {
  [key: string]: string;
}

const EditCategoryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const categoryId = searchParams.get('id');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [systemPermissions, setSystemPermissions] = useState<SystemPermission>({});
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [formData, setFormData] = useState<CategoryFormData>({
    role: '',
    categoryType: '',
    description: '',
    permissions: [],
  });

  const categoryTypes = [
    { value: 'Supplier', label: 'Supplier' },
    { value: 'User', label: 'User' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Super Admin', label: 'Super Admin' },
    { value: 'Other', label: 'Other' },
  ];

  // Permission groups for quick assignment
  const permissionGroups = [
    { value: 'full_access', label: 'Full Access (All Permissions)' },
    { value: 'read_only', label: 'Read Only' },
    { value: 'manager', label: 'Manager Access' },
    { value: 'basic', label: 'Basic Access' },
    { value: 'custom', label: 'Custom Permissions' }
  ];

  // Fetch system permissions and category data on component mount
  useEffect(() => {
    if (categoryId) {
      Promise.all([fetchSystemPermissions(), fetchCategory()]);
    } else {
      setIsFetching(false);
    }
  }, [categoryId]);

  const fetchSystemPermissions = async () => {
    try {
      setLoadingPermissions(true);
      const response = await fetch('http://localhost:5000/api/user-categories/system/permissions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch system permissions');
      }
      
      const result = await response.json();
      
      if (result.success && result.data.permissions) {
        setSystemPermissions(result.data.permissions);
      } else {
        throw new Error('Invalid permissions data');
      }
    } catch (error) {
      console.error('Error fetching system permissions:', error);
      alert('Failed to load system permissions');
    } finally {
      setLoadingPermissions(false);
    }
  };

  const fetchCategory = async () => {
    try {
      setIsFetching(true);
      const response = await fetch(`http://localhost:5000/api/user-categories/${categoryId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const category: Category = result.data;
        setFormData({
          role: category.role || '',
          categoryType: category.categoryType || '',
          description: category.description || '',
          permissions: category.permissions || [],
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

  const handlePermissionChange = (permissionKey: string, isChecked: boolean) => {
    setFormData(prev => {
      const updatedPermissions = isChecked
        ? [...prev.permissions, permissionKey]
        : prev.permissions.filter(p => p !== permissionKey);
      
      return {
        ...prev,
        permissions: updatedPermissions
      };
    });
  };

  const handlePermissionGroupChange = (groupValue: string) => {
    let groupPermissions: string[] = [];

    switch (groupValue) {
      case 'full_access':
        groupPermissions = Object.values(systemPermissions);
        break;
      case 'read_only':
        groupPermissions = [
          'dashboard.view',
          'users.view',
          'user_categories.view', 
          'suppliers.view',
          'supplier_categories.view',
          'projects.view',
          'analytics.view',
          'settings.view'
        ];
        break;
      case 'manager':
        groupPermissions = [
          'dashboard.view',
          'users.view', 'users.create', 'users.edit',
          'suppliers.view', 'suppliers.create', 'suppliers.edit',
          'projects.view', 'projects.create', 'projects.edit',
          'analytics.view',
          'settings.view'
        ];
        break;
      case 'basic':
        groupPermissions = ['dashboard.view', 'users.view', 'projects.view'];
        break;
      case 'custom':
        // Keep current permissions for custom
        return;
      default:
        groupPermissions = [];
    }

    setFormData(prev => ({
      ...prev,
      permissions: groupPermissions
    }));
  };

  const selectAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: Object.values(systemPermissions)
    }));
  };

  const clearAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: []
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
      const response = await fetch(`http://localhost:5000/api/user-categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: formData.role,
          categoryType: formData.categoryType,
          description: formData.description,
          permissions: formData.permissions
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
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

  // Group permissions by module for better organization
  const groupedPermissions = Object.entries(systemPermissions).reduce((acc, [key, value]) => {
    const module = key.split('.')[0];
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push({ key, value });
    return acc;
  }, {} as { [key: string]: { key: string; value: string }[] });

  // Show loading state while fetching data
  if (isFetching || loadingPermissions) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-center text-gray-600">Loading category data and permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no category ID
  if (!categoryId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit User Category</h1>
            <p className="mt-1 text-sm text-gray-600">
              Update the user category information and permissions below.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
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
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter category description (optional)"
                />
              </div>
            </div>

            {/* Permissions Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Permissions</h3>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={selectAllPermissions}
                    className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAllPermissions}
                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Permission Groups */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Permission Groups
                </label>
                <select
                  onChange={(e) => handlePermissionGroupChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  defaultValue=""
                >
                  <option value="">Select a permission group...</option>
                  {permissionGroups.map(group => (
                    <option key={group.value} value={group.value}>
                      {group.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select a predefined permission group or configure custom permissions below
                </p>
              </div>

              {/* Individual Permissions */}
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                {Object.entries(groupedPermissions).map(([module, permissions]) => (
                  <div key={module} className="p-4">
                    <h4 className="text-sm font-medium text-gray-900 capitalize mb-3">
                      {module.replace('_', ' ')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {permissions.map(({ key, value }) => (
                        <label key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(value)}
                            onChange={(e) => handlePermissionChange(value, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 capitalize">
                            {key.split('.')[1].replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Permissions Count
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>{formData.permissions.length}</strong> permissions selected
                </p>
              </div> */}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 ">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.role || !formData.categoryType}
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