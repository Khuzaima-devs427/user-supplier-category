'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

interface SupplierCategoryFormData {
  name: string;
  description: string;
  productCategories: string[];
  productType: 'new' | 'scrap';
  image?: string;
}

interface SupplierCategory {
  _id: string;
  name: string;
  description: string;
  productCategories: string[];
  productType: 'new' | 'scrap';
  image?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const EditSupplierCategoryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState<SupplierCategoryFormData>({
    name: '',
    description: '',
    productCategories: [],
    productType: 'new',
    image: ''
  });

  const categoryId = searchParams.get('id');

  // Predefined product categories matching backend enum
  const productCategoriesOptions = [
    'Electronics',
    'Construction Materials',
    'Industrial Equipment',
    'Raw Materials',
    'Consumer Goods'
  ];

  // Fetch category data on component mount
  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) {
        alert('Category ID is missing');
        router.push('/supplier/supplier-categories');
        return;
      }

      try {
        setIsFetching(true);
        console.log('🔄 Fetching category data for ID:', categoryId);
        
        const response = await fetch(`http://localhost:5000/api/supplier-categories/${categoryId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Category data received:', result);
        
        if (result.success) {
          const category: SupplierCategory = result.data;
          setFormData({
            name: category.name,
            description: category.description,
            productCategories: category.productCategories,
            productType: category.productType,
            image: category.image || ''
          });
        } else {
          alert(result.message || 'Failed to fetch category data');
          router.push('/supplier/supplier-categories');
        }
      } catch (error) {
        console.error('❌ Error fetching supplier category:', error);
        alert('Error fetching supplier category. Please check your connection.');
        router.push('/supplier/supplier-categories');
      } finally {
        setIsFetching(false);
      }
    };

    fetchCategory();
  }, [categoryId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'productCategories') {
      setFormData(prev => ({
        ...prev,
        productCategories: value ? [value] : []
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProductTypeChange = (type: 'new' | 'scrap') => {
    setFormData(prev => ({
      ...prev,
      productType: type
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file.name
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryId) {
      alert('Category ID is missing');
      return;
    }

    setIsLoading(true);

    try {
      // Validate that a product category is selected
      if (formData.productCategories.length === 0) {
        alert('Please select a product category');
        setIsLoading(false);
        return;
      }

      console.log('🔄 Updating category with data:', formData);

      const response = await fetch(`http://localhost:5000/api/supplier-categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log('✅ Update response:', result);

      if (response.ok && result.success) {
        await queryClient.invalidateQueries({ 
          queryKey: ['supplier-categories'], 
          refetchType: 'active' 
        });
        
        alert('Supplier category updated successfully!');
        router.push('/supplier/supplier-categories');
      } else {
        alert(result.message || 'Failed to update supplier category');
      }
    } catch (error) {
      console.error('❌ Error updating supplier category:', error);
      alert('Error updating supplier category. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/supplier/supplier-categories');
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-center text-gray-600">Loading category data...</p>
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
          <div className="px-8 py-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit Supplier Category</h1>
            <p className="mt-1 text-sm text-gray-600">
              Update the supplier category information below.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Category Name */}
            <div className="w-full">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter category name"
              />
            </div>

            {/* Product Categories - Simple Select */}
            <div className="w-full">
              <label htmlFor="productCategories" className="block text-sm font-medium text-gray-700 mb-2">
                Product Categories *
              </label>
              <select
                id="productCategories"
                name="productCategories"
                value={formData.productCategories[0] || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select Product Category</option>
                {productCategoriesOptions.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="w-full">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter category description"
              />
            </div>

            {/* Product Type */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Product Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* New Products Card */}
                <div
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    formData.productType === 'new'
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  onClick={() => handleProductTypeChange('new')}
                >
                  <div className="flex items-start space-x-3">
                    <div className="shrink-0">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.productType === 'new'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-400'
                      }`}>
                        {formData.productType === 'new' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        New Products
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Suppliers deal with brand new, unused products
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scrap Products Card */}
                <div
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    formData.productType === 'scrap'
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  onClick={() => handleProductTypeChange('scrap')}
                >
                  <div className="flex items-start space-x-3">
                    <div className="shrink-0">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.productType === 'scrap'
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-400'
                      }`}>
                        {formData.productType === 'scrap' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        Scrap Products
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Suppliers deal with used, recycled, or scrap materials
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Image */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Image ({formData.image ? '1/1' : '0/1'})
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-4 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                  <input
                    id="image"
                    name="image"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              {formData.image && (
                <p className="mt-2 text-sm text-green-600">
                  Selected: {formData.image}
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 w-full">
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default EditSupplierCategoryPage;