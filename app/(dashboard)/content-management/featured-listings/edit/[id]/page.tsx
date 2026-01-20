'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePermissions } from '../../../../../_components/contexts/PermissionContext';
import { clientService } from '../../../../../../app/app/utils/api-client';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { Upload, X, Image as ImageIcon, DollarSign, Hash, Tag, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

interface FeatureCategory {
  _id: string;
  name: string;
  description: string;
  type: string;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface FeaturedListing {
  _id: string;
  featureCategory: string | FeatureCategory;
  name: string;
  description: string;
  price: number;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  featuredOrder: number;
  image?: string | {  // CHANGED: Accept both string and object
    url: string;
    publicId?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface FeaturedListingFormData {
  categoryId: string;
  name: string;
  description: string;
  price: number | string;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  featuredOrder: number;
}

interface FeaturedListingFormErrors {
  categoryId?: string;
  name?: string;
  description?: string;
  price?: string;
  image?: string;
  featuredOrder?: string;
}

// Helper function to get image URL regardless of format
const getImageUrl = (imageData: any): string | null => {
  if (!imageData) return null;
  
  if (typeof imageData === 'string') {
    return imageData;
  }
  
  if (typeof imageData === 'object' && imageData.url) {
    return imageData.url;
  }
  
  return null;
};

// Helper to extract public ID from image data
const getImagePublicId = (imageData: any): string | null => {
  if (!imageData) return null;
  
  if (typeof imageData === 'object' && imageData.publicId) {
    return imageData.publicId;
  }
  
  return null;
};

const EditFeaturedListingPage = () => {
  const router = useRouter();
  const params = useParams();
  const { permissions } = usePermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [categories, setCategories] = useState<FeatureCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [featuredListing, setFeaturedListing] = useState<FeaturedListing | null>(null);
  
  const [formData, setFormData] = useState<FeaturedListingFormData>({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    status: 'active',
    isFeatured: false,
    featuredOrder: 1
  });

  const [errors, setErrors] = useState<FeaturedListingFormErrors>({});
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<{ url: string; publicId?: string } | null>(null);
  const [hasImageChanged, setHasImageChanged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const listingId = params.id as string;

  // Set isClient only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    if (!isClient || !listingId) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchCategories(),
          fetchFeaturedListing()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isClient, listingId]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await clientService.get<ApiResponse<FeatureCategory[]>>('/feature-categories?status=active');
      
      if (response.data.success) {
        setCategories(response.data.data);
      } else {
        toast.error('Failed to load categories');
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch featured listing
  const fetchFeaturedListing = async () => {
    try {
      console.log('🔄 Fetching featured listing:', listingId);
      const response = await clientService.get<ApiResponse<FeaturedListing>>(`/featured-listings/${listingId}`);
      
      console.log('✅ Featured listing response:', response.data);
      
      if (response.data.success) {
        const listing = response.data.data;
        setFeaturedListing(listing);
        
        // Debug: Log image data
        console.log('🖼️ Image data from API:', {
          rawImage: listing.image,
          type: typeof listing.image,
          imageUrl: getImageUrl(listing.image),
          publicId: getImagePublicId(listing.image)
        });
        
        // Set existing image if available
        const imageUrl = getImageUrl(listing.image);
        if (imageUrl) {
          const existingImageData = {
            url: imageUrl,
            publicId: getImagePublicId(listing.image) || undefined
          };
          setExistingImage(existingImageData);
          setImagePreview(imageUrl);
          console.log('✅ Set existing image:', imageUrl);
        }
        
        // Set form data
        const categoryId = typeof listing.featureCategory === 'string' 
          ? listing.featureCategory 
          : listing.featureCategory._id;
          
        setFormData({
          categoryId,
          name: listing.name,
          description: listing.description,
          price: listing.price,
          status: listing.status,
          isFeatured: listing.isFeatured,
          featuredOrder: listing.featuredOrder
        });
      } else {
        toast.error('Failed to load featured listing');
        router.push('/content-management');
      }
    } catch (error: any) {
      console.error('❌ Error fetching featured listing:', error);
      toast.error('Featured listing not found');
      router.push('/content-management');
    }
  };

  // Helper function to check permissions
  const hasPermission = (permissionKey: string): boolean => {
    if (!isClient) return true;
    if (permissions.isStaticAdmin === true) return true;
    return permissions[permissionKey] === true;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : name === 'featuredOrder' || name === 'price'
        ? (value === '' ? '' : parseFloat(value))
        : value
    }));

    // Clear error for this field
    if (errors[name as keyof FeaturedListingFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Handle category select change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    setFormData(prev => ({
      ...prev,
      categoryId
    }));

    if (errors.categoryId) {
      setErrors(prev => ({
        ...prev,
        categoryId: undefined
      }));
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageFile(files[0]);
    }
  };

  const handleImageFile = (file: File) => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, GIF, WebP)');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setSelectedFile(file);
    setHasImageChanged(true);
    toast.success('New image selected!');
  };

  const handleRemoveImage = () => {
    if (imagePreview && hasImageChanged) {
      URL.revokeObjectURL(imagePreview); // Clean up memory from new file
    }
    
    if (hasImageChanged) {
      setImagePreview(null);
      setSelectedFile(null);
      setHasImageChanged(false);
    } else {
      // If removing existing image, mark for deletion
      setImagePreview(null);
      setExistingImage(null);
      setHasImageChanged(true);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FeaturedListingFormErrors = {};

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 200) {
      newErrors.name = 'Name cannot exceed 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    if (!formData.price || formData.price === '' || Number(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    // Only validate image if it's required (new listing or image was removed)
    if (!existingImage && !selectedFile) {
      newErrors.image = 'Image is required';
    }

    if (!formData.featuredOrder || formData.featuredOrder < 1) {
      newErrors.featuredOrder = 'Display order must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission using FormData
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isClient || !featuredListing) return;
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create FormData object
      const submitFormData = new FormData();
      
      // Append text fields
      submitFormData.append('featureCategory', formData.categoryId);
      submitFormData.append('name', formData.name);
      submitFormData.append('description', formData.description);
      submitFormData.append('price', formData.price.toString());
      submitFormData.append('status', formData.status);
      submitFormData.append('isFeatured', formData.isFeatured.toString());
      submitFormData.append('featuredOrder', formData.featuredOrder.toString());
      
      // Append image file if changed
      if (selectedFile) {
        submitFormData.append('image', selectedFile);
        console.log('🖼️ Appending new image file:', selectedFile.name);
      }
      
      // If image was removed, add a flag
      if (existingImage && !imagePreview && hasImageChanged) {
        submitFormData.append('removeImage', 'true');
        console.log('🗑️ Marking image for removal');
      }
      
      console.log('🔄 Updating featured listing:', {
        id: listingId,
        featureCategory: formData.categoryId,
        name: formData.name,
        price: formData.price,
        hasImageChanged,
        existingImage: !!existingImage,
        newImage: !!selectedFile,
        imageRemoved: existingImage && !imagePreview && hasImageChanged
      });

      const response = await clientService.put<ApiResponse>(
        `/featured-listings/${listingId}`,
        submitFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (response.data.success) {
        toast.success('Featured listing updated successfully!');
        router.push('/content-management');
      } else {
        throw new Error(response.data.message || 'Failed to update featured listing');
      }
    } catch (error: any) {
      console.error('❌ Error updating featured listing:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        if (errorMessage.includes('Display order already exists')) {
          setErrors(prev => ({
            ...prev,
            featuredOrder: 'This display order already exists. Please choose a different one.'
          }));
          toast.error('Display order already exists. Please choose a different one.');
        } else if (errorMessage.includes('Cloudinary') || errorMessage.includes('upload')) {
          toast.error(`Image upload failed: ${errorMessage}`);
        } else if (errorMessage.includes('category') || errorMessage.includes('featureCategory')) {
          setErrors(prev => ({
            ...prev,
            categoryId: errorMessage
          }));
          toast.error(errorMessage);
        } else if (errorMessage.includes('required')) {
          toast.error(`Missing required fields: ${errorMessage}`);
        } else {
          toast.error(`Failed to update featured listing: ${errorMessage}`);
        }
      } else {
        toast.error(`Failed to update featured listing: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to original values
  const handleReset = () => {
    if (featuredListing) {
      const categoryId = typeof featuredListing.featureCategory === 'string' 
        ? featuredListing.featureCategory 
        : featuredListing.featureCategory._id;
        
      setFormData({
        categoryId,
        name: featuredListing.name,
        description: featuredListing.description,
        price: featuredListing.price,
        status: featuredListing.status,
        isFeatured: featuredListing.isFeatured,
        featuredOrder: featuredListing.featuredOrder
      });
      
      // Reset image using helper function
      const imageUrl = getImageUrl(featuredListing.image);
      if (imageUrl) {
        const existingImageData = {
          url: imageUrl,
          publicId: getImagePublicId(featuredListing.image) || undefined
        };
        setExistingImage(existingImageData);
        setImagePreview(imageUrl);
        setHasImageChanged(false);
      } else {
        setExistingImage(null);
        setImagePreview(null);
        setHasImageChanged(false);
      }
      
      setSelectedFile(null);
      setErrors({});
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Loading state for server render
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
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get selected category name for display
  const selectedCategory = categories.find(cat => cat._id === formData.categoryId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Featured Listing</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Update listing details and settings
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  ID: {listingId}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/content-management"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  ← Back to Content Management
                </Link>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Section 1: Category Selection */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-medium text-gray-900">Feature Category</h3>
              </div>
              
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Category *
                </label>
                <div className="relative">
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleCategoryChange}
                    required
                    disabled={loadingCategories}
                    className={`w-full px-3 py-2.5 border ${
                      errors.categoryId ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      loadingCategories ? 'bg-gray-50' : ''
                    } appearance-none pr-10`}
                  >
                    <option value="">Select a feature category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name} {category.isFeatured && '★'} - {category.type}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                
                {loadingCategories && (
                  <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading categories...
                  </div>
                )}
                
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
                )}
                
                {!loadingCategories && categories.length === 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">No categories available</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          No active feature categories found.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Selected Category Info */}
                {selectedCategory && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-start">
                      <div className="shrink-0">
                        <Tag className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800">
                          {selectedCategory.name}
                          {selectedCategory.isFeatured && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Featured
                            </span>
                          )}
                        </h4>
                        <div className="mt-1 text-sm text-blue-700">
                          <p><span className="font-medium">Type:</span> {selectedCategory.type}</p>
                          {selectedCategory.description && (
                            <p className="mt-1"><span className="font-medium">Description:</span> {selectedCategory.description}</p>
                          )}
                          <p className="mt-1"><span className="font-medium">Status:</span> 
                            <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                              selectedCategory.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {selectedCategory.status}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Listing Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Listing Details</h3>
              
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Listing Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Enter listing name"
                    maxLength={200}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">Maximum 200 characters</p>
                    <p className="text-xs text-gray-500">{formData.name.length}/200</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className={`w-full px-3 py-2 border ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Enter detailed description of the listing"
                    maxLength={1000}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">Maximum 1000 characters</p>
                    <p className="text-xs text-gray-500">{formData.description.length}/1000</p>
                  </div>
                </div>

                {/* Price */}
                <div className="relative">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className={`w-full pl-10 pr-3 py-2 border ${
                        errors.price ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the price in USD
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Status & Settings */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-medium text-gray-900">Status & Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Active listings will be displayed
                  </p>
                </div>

                {/* Display Order */}
                <div>
                  <label htmlFor="featuredOrder" className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order *
                  </label>
                  <input
                    type="number"
                    id="featuredOrder"
                    name="featuredOrder"
                    value={formData.featuredOrder}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className={`w-full px-3 py-2 border ${
                      errors.featuredOrder ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                  {errors.featuredOrder && (
                    <p className="mt-1 text-sm text-red-600">{errors.featuredOrder}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Lower numbers appear first (e.g., 1 shows before 2)
                  </p>
                </div>
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                  Mark as Featured Listing
                </label>
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Highlighted
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Featured listings will be highlighted with special styling in their category
              </p>
            </div>

            {/* Section 4: Image Upload */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-medium text-gray-900">Listing Image</h3>
              </div>

              <div className="space-y-4">
                {/* Image Status */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      existingImage || selectedFile ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {existingImage || selectedFile ? (
                        <ImageIcon className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {existingImage || selectedFile ? 'Image is set' : 'No image selected'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {existingImage && !hasImageChanged 
                          ? 'Current image from Cloudinary' 
                          : hasImageChanged && selectedFile
                          ? 'New image will replace existing one' 
                          : hasImageChanged && !existingImage
                          ? 'Image will be removed' 
                          : 'Upload an image for this listing'}
                      </p>
                    </div>
                  </div>
                  
                  {existingImage && !hasImageChanged && (
                    <div className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      Current
                    </div>
                  )}
                  
                  {hasImageChanged && (
                    <div className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                      Changed
                    </div>
                  )}
                </div>



                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : imagePreview
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <div className="space-y-4">
                    {imagePreview ? (
                      <>
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                          <ImageIcon className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {hasImageChanged ? 'New Image Selected' : 'Current Image'}
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            {hasImageChanged 
                              ? 'Will replace existing image when you update' 
                              : 'Current listing image from Cloudinary'}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                          <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            Drag & drop to replace image
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            or click to browse files on your computer
                          </p>
                        </div>
                      </>
                    )}
                    
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleBrowseClick}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        {imagePreview ? 'Replace Image' : 'Browse Files'}
                      </button>
                      
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-400">
                      Supports JPG, PNG, GIF, WebP • Max 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Card */}
              {imagePreview && selectedCategory && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Listing Preview:</p>
                  <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={imagePreview}
                        alt="Listing preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={(e) => {
                          console.error('❌ Preview image failed to load:', imagePreview);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {formData.isFeatured && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        </div>
                      )}
                      {!hasImageChanged && existingImage && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Current
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {selectedCategory.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {formData.name || 'Listing Name'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {formData.description || 'Listing description...'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            ${formData.price ? Number(formData.price).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }) : '0.00'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    This is how your listing will appear on the website under the "{selectedCategory.name}" category
                  </p>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              >
                Reset to Original
              </button>
              <button
                type="button"
                onClick={() => router.push('/content-management')}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || 
                  !formData.categoryId || 
                  !formData.name || 
                  !formData.description || 
                  !formData.price ||
                  loadingCategories ||
                  categories.length === 0}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </span>
                ) : 'Update Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditFeaturedListingPage;