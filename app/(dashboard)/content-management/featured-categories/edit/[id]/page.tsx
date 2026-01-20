'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePermissions } from '../../../../../_components/contexts/PermissionContext';
import { clientService } from '../../../../../app/utils/api-client';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { 
  Tag, 
  FileText, 
  Type, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Zap, 
  Star,
  ListChecks,
  Hash,
  Loader2
} from 'lucide-react';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

interface FeatureCategoryFormData {
  name: string;
  description: string;
  type: string;
  status: 'active' | 'inactive';
  isFeatured: boolean;
}

interface FeatureCategoryFormErrors {
  name?: string;
  description?: string;
  type?: string;
  status?: string;
}

const EditFeatureCategoryPage = () => {
  const router = useRouter();
  const params = useParams();
  const { permissions } = usePermissions();
  
  const categoryId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const [formData, setFormData] = useState<FeatureCategoryFormData>({
    name: '',
    description: '',
    type: '',
    status: 'inactive',
    isFeatured: false
  });
  
  const [originalData, setOriginalData] = useState<FeatureCategoryFormData | null>(null);
  const [errors, setErrors] = useState<FeatureCategoryFormErrors>({});
  const [featuredLimitInfo, setFeaturedLimitInfo] = useState<{
    currentFeatured: number;
    maxFeatured: number;
    canAddMore: boolean;
  } | null>(null);
  
  const [nameCharCount, setNameCharCount] = useState(0);
  const [descCharCount, setDescCharCount] = useState(0);
  const [typeCharCount, setTypeCharCount] = useState(0);
  
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Set isClient only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch category data
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!isClient || !categoryId) return;
      
      setIsLoading(true);
      try {
        // Fetch category details
        const categoryResponse = await clientService.get<ApiResponse<any>>(
          `/feature-categories/${categoryId}`
        );
        
        if (categoryResponse.data.success) {
          const category = categoryResponse.data.data;
          
          const data = {
            name: category.name || '',
            description: category.description || '',
            type: category.type || '',
            status: category.status || 'inactive',
            isFeatured: category.isFeatured || false
          };
          
          setFormData(data);
          setOriginalData(data);
          
          // Set character counts
          setNameCharCount(data.name.length);
          setDescCharCount(data.description.length);
          setTypeCharCount(data.type.length);
        } else {
          toast.error('Failed to load category data');
          router.push('/content-management/feature-categories');
        }
      } catch (error) {
        console.error('❌ Error fetching category data:', error);
        toast.error('Failed to load category data');
        router.push('/content-management/feature-categories');
      } finally {
        setIsLoading(false);
      }
    };

    if (isClient && categoryId) {
      fetchCategoryData();
    }
  }, [isClient, categoryId, router]);

  // Fetch featured limit info
  useEffect(() => {
    const fetchFeaturedLimitInfo = async () => {
      try {
        const response = await clientService.get<ApiResponse<{
          currentFeatured: number;
          maxFeatured: number;
          canAddMore: boolean;
        }>>('/feature-categories/stats/featured-limit');
        
        if (response.data.success) {
          setFeaturedLimitInfo(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching featured limit info:', error);
      }
    };

    if (isClient) {
      fetchFeaturedLimitInfo();
    }
  }, [isClient]);

  // Helper function to check permissions
  const hasPermission = (permissionKey: string): boolean => {
    if (!isClient) return true;
    if (permissions.isStaticAdmin === true) return true;
    return permissions[permissionKey] === true;
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Update character counts
    if (name === 'name') {
      setNameCharCount(value.length);
    }
    if (name === 'description') {
      setDescCharCount(value.length);
    }
    if (name === 'type') {
      setTypeCharCount(value.length);
    }

    // Clear error for this field
    if (errors[name as keyof FeatureCategoryFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Handle status change
  const handleStatusChange = (status: 'active' | 'inactive') => {
    setFormData(prev => ({
      ...prev,
      status
    }));
  };

  // Handle featured toggle
  const handleFeaturedToggle = () => {
    // If trying to mark as featured when already featured, just toggle off
    if (formData.isFeatured) {
      setFormData(prev => ({
        ...prev,
        isFeatured: false
      }));
      return;
    }
    
    // If trying to mark as featured when limit is reached
    if (featuredLimitInfo && !featuredLimitInfo.canAddMore) {
      toast.error(`Maximum ${featuredLimitInfo.maxFeatured} featured categories reached. Please remove one first.`);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      isFeatured: !prev.isFeatured
    }));
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = descriptionRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [formData.description]);

  // Check if form has changes
  const hasChanges = (): boolean => {
    if (!originalData) return false;
    
    return (
      formData.name !== originalData.name ||
      formData.description !== originalData.description ||
      formData.type !== originalData.type ||
      formData.status !== originalData.status ||
      formData.isFeatured !== originalData.isFeatured
    );
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FeatureCategoryFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Category name cannot exceed 100 characters';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Category name should be at least 2 characters';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Category type is required';
    } else if (formData.type.length > 50) {
      newErrors.type = 'Category type cannot exceed 50 characters';
    } else if (formData.type.length < 2) {
      newErrors.type = 'Category type should be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isClient || !categoryId) return;
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Check if no changes were made
    if (!hasChanges()) {
      toast.info('No changes were made');
      return;
    }

    // Confirm if marking as featured when limit is reached
    if (formData.isFeatured && !originalData?.isFeatured && featuredLimitInfo && !featuredLimitInfo.canAddMore) {
      const confirmed = window.confirm(
        `Maximum ${featuredLimitInfo.maxFeatured} featured categories reached. You cannot mark this as featured. Would you like to save without marking as featured?`
      );
      if (confirmed) {
        setFormData(prev => ({ ...prev, isFeatured: false }));
      } else {
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      console.log('🔄 Updating feature category data:', formData);

      const response = await clientService.put<ApiResponse>(
        `/feature-categories/${categoryId}`,
        formData
      );
      
      if (response.data.success) {
        toast.success('Feature category updated successfully!');
        
        // Invalidate React Query cache for feature-categories
        // This will trigger automatic refresh on the main page
        if (typeof window !== 'undefined') {
          // Dispatch a custom event that can be listened to by the main page
          window.dispatchEvent(new Event('feature-category-updated'));
          
          // Also update localStorage as a cache-busting mechanism
          localStorage.setItem('feature-category-updated', Date.now().toString());
        }
        
        // Navigate back to main page
        router.push('/content-management');
        router.refresh(); // Refresh the page to get updated data
      } else {
        throw new Error(response.data.message || 'Failed to update feature category');
      }
    } catch (error: any) {
      console.error('❌ Error updating feature category:', error);
      
      if (error.response?.data?.message?.includes('featured') || 
          error.response?.data?.message?.includes('limit')) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.message?.includes('name') && 
                 error.response?.data?.message?.includes('already exists')) {
        setErrors(prev => ({
          ...prev,
          name: 'A category with this name already exists'
        }));
        toast.error('A category with this name already exists');
      } else {
        toast.error(`Failed to update feature category: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to original data
  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      setNameCharCount(originalData.name.length);
      setDescCharCount(originalData.description.length);
      setTypeCharCount(originalData.type.length);
      setErrors({});
    }
  };

  // Loading state for server render or data fetching
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check permission to edit feature categories
  if (!hasPermission('feature_categories.edit')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to edit feature categories.
          </p>
          <Link
            href="/content-management"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            ← Back to Feature Categories
          </Link>
        </div>
      </div>
    );
  }

  // If no category data found
  if (!originalData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Category Not Found</h2>
          <p className="text-gray-600 mb-4">
            The category you're trying to edit doesn't exist or has been removed.
          </p>
          <Link
            href="/content-management/feature-categories"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            ← Back to Feature Categories
          </Link>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Tag className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Feature Category</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Update category details and settings
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{categoryId}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/content-management"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                ← Back to Feature Categories
              </Link>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Change Indicator */}
            {hasChanges() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">
                      Unsaved Changes
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      You have made changes to this category. Don't forget to save!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Section 1: Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                Basic Information
              </h3>
              
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                  className={`w-full px-3 py-2 border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Enter category name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Maximum 100 characters
                  </p>
                  <p className={`text-xs ${
                    nameCharCount > 90 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {nameCharCount}/100
                  </p>
                </div>
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  ref={descriptionRef}
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  maxLength={500}
                  className={`w-full px-3 py-2 border ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none`}
                  placeholder="Enter a brief description of the category"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Optional, maximum 500 characters
                  </p>
                  <p className={`text-xs ${
                    descCharCount > 450 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {descCharCount}/500
                  </p>
                </div>
              </div>

              {/* Type Field */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Type *
                </label>
                <input
                  id="type"
                  name="type"
                  type="text"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  maxLength={50}
                  className={`w-full px-3 py-2 border ${
                    errors.type ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Enter category type"
                />
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                )}
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Maximum 50 characters
                  </p>
                  <p className={`text-xs ${
                    typeCharCount > 40 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {typeCharCount}/50
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Settings */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-blue-600" />
                Category Settings
              </h3>
              
              {/* Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Inactive Card */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange('inactive')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      formData.status === 'inactive'
                        ? 'border-gray-400 bg-gray-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        formData.status === 'inactive' ? 'bg-gray-100' : 'bg-gray-50'
                      }`}>
                        <XCircle className={`w-5 h-5 ${
                          formData.status === 'inactive' ? 'text-gray-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${
                            formData.status === 'inactive' ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            Inactive
                          </h4>
                          {formData.status === 'inactive' && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Category will be saved but not visible
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Active Card */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange('active')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      formData.status === 'active'
                        ? 'border-green-400 bg-green-50 shadow-sm'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        formData.status === 'active' ? 'bg-green-100' : 'bg-gray-50'
                      }`}>
                        <CheckCircle className={`w-5 h-5 ${
                          formData.status === 'active' ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${
                            formData.status === 'active' ? 'text-green-900' : 'text-gray-700'
                          }`}>
                            Active
                          </h4>
                          {formData.status === 'active' && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Category will be visible to users
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Featured Setting */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Featured Setting</h4>
                
                {(() => {
                  // Calculate disabled state
                  const isDisabled = Boolean(
                    featuredLimitInfo && 
                    !featuredLimitInfo.canAddMore && 
                    !formData.isFeatured &&
                    !originalData?.isFeatured // Only disable if it wasn't already featured
                  );
                  
                  return (
                    <button
                      type="button"
                      onClick={handleFeaturedToggle}
                      disabled={isDisabled}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 flex items-start gap-3 ${
                        formData.isFeatured
                          ? 'border-blue-400 bg-blue-50'
                          : isDisabled
                          ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                      title={
                        isDisabled
                          ? `Maximum ${featuredLimitInfo?.maxFeatured} featured categories reached`
                          : formData.isFeatured
                          ? 'Click to remove from featured'
                          : 'Click to mark as featured'
                      }
                    >
                      <div className={`p-2 rounded-full ${
                        formData.isFeatured ? 'bg-blue-100' : 'bg-gray-50'
                      }`}>
                        <Star className={`w-5 h-5 ${
                          formData.isFeatured ? 'text-blue-600 fill-blue-500' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${
                            formData.isFeatured ? 'text-blue-900' : 'text-gray-700'
                          }`}>
                            {formData.isFeatured ? 'Featured Category' : 'Mark as Featured'}
                          </h4>
                          {formData.isFeatured && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {formData.isFeatured 
                            ? 'This category will be highlighted as featured on the website'
                            : 'Make this category stand out by featuring it'}
                        </p>
                        
                        {/* Featured Limit Info */}
                        {featuredLimitInfo && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2 text-xs">
                              <Hash className="w-3 h-3 text-gray-500" />
                              <span className="text-gray-600">
                                Featured: {featuredLimitInfo.currentFeatured}/{featuredLimitInfo.maxFeatured}
                                {isDisabled && ' (Limit Reached)'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Limit Warning */}
                        {isDisabled && (
                          <div className="mt-2 flex items-start gap-1 text-xs text-red-600">
                            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                            <span>Cannot mark as featured. Maximum limit reached.</span>
                          </div>
                        )}
                        
                        {/* Already Featured Note */}
                        {originalData?.isFeatured && !formData.isFeatured && (
                          <div className="mt-2 flex items-start gap-1 text-xs text-yellow-600">
                            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                            <span>This category is currently featured. Clicking will remove it from featured.</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Preview</h3>
              
              <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className={`p-4 rounded-lg ${
                    formData.status === 'active' 
                      ? formData.isFeatured
                        ? 'bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                        : 'bg-gray-800 text-gray-200'
                      : 'bg-gray-700 text-gray-400 opacity-75'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-1.5 rounded-full ${
                            formData.status === 'active'
                              ? formData.isFeatured
                                ? 'bg-blue-500'
                                : 'bg-gray-600'
                              : 'bg-gray-600'
                          }`}>
                            <Tag className="w-4 h-4" />
                          </div>
                          {formData.isFeatured && (
                            <span className="px-2 py-0.5 bg-white text-blue-700 text-xs font-bold rounded-full">
                              FEATURED
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-semibold mb-1">
                          {formData.name || 'Category Name'}
                        </h4>
                        <p className="text-sm opacity-90 mb-2">
                          {formData.type || 'Category Type'}
                        </p>
                        <p className="text-sm opacity-80">
                          {formData.description || 'Category description will appear here...'}
                        </p>
                      </div>
                      {formData.status === 'inactive' && (
                        <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                          INACTIVE
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                This is how your category will appear on the website. 
                {formData.isFeatured 
                  ? ' Featured categories are highlighted and given priority placement.'
                  : ' Regular categories are displayed in the standard listing.'}
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting || !hasChanges()}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => router.push('/content-management')}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.name.trim() || !formData.type.trim() || !hasChanges()}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </span>
                ) : 'Update Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditFeatureCategoryPage;