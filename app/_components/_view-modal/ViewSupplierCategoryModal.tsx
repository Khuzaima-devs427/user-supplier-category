// app/_components/_view-modal/ViewSupplierCategoryModal.tsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ViewSupplierCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
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

const ViewSupplierCategoryModal: React.FC<ViewSupplierCategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  data 
}) => {
  const [categoryData, setCategoryData] = useState<SupplierCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch category data when modal opens
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!isOpen || !data) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Try multiple ID fields - data might have id, _id, or the data itself might be the ID
        const categoryId = data.id || data._id || (data.data && (data.data.id || data.data._id));
        
        if (!categoryId) {
          console.error('❌ No category ID found in data:', data);
          setIsLoading(false);
          return;
        }

        console.log('🔄 Fetching category data for View modal ID:', categoryId);
        
        const response = await fetch(`http://localhost:5000/api/supplier-categories/${categoryId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ View Modal Category data received:', result);
        
        if (result.success) {
          setCategoryData(result.data);
        } else {
          console.error('❌ Failed to fetch category data for view modal');
        }
      } catch (error) {
        console.error('❌ Error fetching supplier category for view modal:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [isOpen, data]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCategoryData(null);
      setIsLoading(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get product type badge style
  const getProductTypeBadge = (productType: string) => {
    return productType === 'new'
      ? 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
      : 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800';
  };

  // Get category name badge style
  const getCategoryNameBadge = () => {
    return 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md';
  };

  // Use fetched data or fallback to props data
  const displayData = categoryData || data;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div 
        className="fixed inset-0  bg-opacity-50 transition-opacity backdrop-blur-[3px]"
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
          {/* Header */}
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Supplier Category Details
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Complete information about this supplier category
                </p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-gray-600">Loading category data...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Category Name</p>
                      <div className="flex items-center">
                        <span className={getCategoryNameBadge()}>
                          {displayData.name || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 -mt-2">
                      <div className="flex items-center">
                        {displayData?.image && displayData.image !== '' ? (
                          <div className="flex items-center gap-4">
                            <div className="relative w-25 h-19 rounded-lg overflow-hidden border border-gray-200">
                              <img
                                src={displayData.image}
                                alt="Category image"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error('❌ Image failed to load in view modal:', displayData.image);
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback');
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                                onLoad={() => console.log('✅ Image loaded successfully in view modal')}
                              />
                              <div className="hidden image-fallback absolute inset-0 bg-gray-100 items-center justify-center">
                                <span className="text-xs text-gray-500">Failed to load image</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-25 h-19 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                            <div className="text-center">
                              <div className="w-6 h-6 mx-auto mb-2 text-gray-400">
                                <svg fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-xs text-gray-500">No image</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Product Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Product Type</p>
                      <div className="flex items-center">
                        <span className={getProductTypeBadge(displayData.productType)}>
                          {displayData.productType === 'new' ? 'New Products' : 'Scrap Products'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Product Categories */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
                  <div className="">
                    <div className="flex flex-wrap gap-2">
                      {displayData.productCategories && displayData.productCategories.length > 0 ? (
                        displayData.productCategories.map((category: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                          >
                            {category}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-600">No product categories specified</p>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900">
                      {displayData.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Timestamps */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Timestamps</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Created At</p>
                      <p className="text-sm text-gray-900">{displayData.createdAt ? formatDate(displayData.createdAt) : 'N/A'}</p>
                    </div>
                    {displayData.updatedAt && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Last Updated</p>
                        <p className="text-sm text-gray-900">{formatDate(displayData.updatedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* System Information */}
                <hr className="border-gray-200" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-blue-600">Database ID</p>
                        <p className="text-sm text-blue-900 font-mono">
                          {displayData.id || displayData._id || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer with centered close button */}
          <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSupplierCategoryModal;