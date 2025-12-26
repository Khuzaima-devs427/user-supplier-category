// app/content-management/hero-slider/edit/[id]/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePermissions } from '../../../../../_components/contexts/PermissionContext';
import { clientService } from '../../../../../app/utils/api-client';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

interface HeroSliderFormData {
  title: string;
  buttonText: string;
  buttonLink: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  existingImage?: string;
}

interface HeroSliderFormErrors {
  image?: string;
  title?: string;
  buttonText?: string;
  buttonLink?: string;
  status?: string;
  displayOrder?: string;
}

interface HeroSliderItem {
  _id: string;
  image: string;
  title: string;
  buttonText: string;
  buttonLink: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const EditHeroSliderPage = () => {
  const router = useRouter();
  const params = useParams();
  const { permissions } = usePermissions();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState<HeroSliderFormData>({
    title: '',
    buttonText: 'Learn More',
    buttonLink: '',
    status: 'active',
    displayOrder: 1,
    existingImage: ''
  });

  const [errors, setErrors] = useState<HeroSliderFormErrors>({});
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadMode, setIsUploadMode] = useState(true); // Default to upload mode
  const [showExistingImage, setShowExistingImage] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get the ID from URL parameters (decode to handle special characters)
  const sliderId = params?.id ? decodeURIComponent(params.id as string) : '';

  // Set isClient only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch hero slider data
  useEffect(() => {
    if (!isClient || !sliderId) return;

    const fetchHeroSlider = async () => {
      try {
        setIsLoading(true);
        
        // Log for debugging
        console.log('🔍 Fetching hero slider with ID:', {
          sliderId,
          encodedId: encodeURIComponent(sliderId),
          url: `/hero-slider/${sliderId}`
        });

        const response = await clientService.get<ApiResponse<HeroSliderItem>>(`/hero-slider/${sliderId}`);
        
        if (response.data.success) {
          const item = response.data.data;
          console.log('📋 Fetched hero slider item:', item);
          
          setFormData({
            title: item.title || '',
            buttonText: item.buttonText || 'Learn More',
            buttonLink: item.buttonLink || '',
            status: item.status || 'active',
            displayOrder: item.displayOrder || 1,
            existingImage: item.image || ''
          });

          // Set existing image for preview
          if (item.image) {
            setImagePreview(item.image);
          }
        } else {
          throw new Error(response.data.message || 'Failed to fetch hero slider data');
        }
      } catch (error: any) {
        console.error('❌ Error fetching hero slider:', error);
        
        if (error.response?.status === 404) {
          toast.error('Hero slider item not found');
          router.push('/content-management');
        } else {
          toast.error(`Failed to load hero slider: ${error.response?.data?.message || error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroSlider();
  }, [isClient, sliderId, router]);

  // Check permissions
  // useEffect(() => {
  //   if (!isClient || isLoading) return;
    
  //   if (!hasPermission('hero_slider.edit')) {
  //     toast.error('You do not have permission to edit hero slider items');
  //     router.push('/content-management');
  //   }
  // }, [isClient, permissions, router, isLoading]);

  // Helper function to check permissions
  const hasPermission = (permissionKey: string): boolean => {
    if (!isClient) return true;
    if (permissions.isStaticAdmin === true) return true;
    return permissions[permissionKey] === true;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'displayOrder' ? parseInt(value) || 1 : value
    }));

    // Clear error for this field
    if (errors[name as keyof HeroSliderFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
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
    setIsUploadMode(true);
    setShowExistingImage(false);
    toast.success('New image uploaded!');
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview !== formData.existingImage) {
      URL.revokeObjectURL(imagePreview); // Clean up memory for new uploads
    }
    setImagePreview(formData.existingImage || null);
    setSelectedFile(null);
    setShowExistingImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Switch between URL and upload modes
  const handleModeSwitch = (mode: 'upload' | 'url') => {
    setIsUploadMode(mode === 'upload');
    if (mode === 'url') {
      // Switching to URL mode - clear uploaded image
      if (imagePreview && imagePreview !== formData.existingImage) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(formData.existingImage || null);
      setSelectedFile(null);
      setShowExistingImage(true);
    } else {
      // Switching to upload mode
      setIsUploadMode(true);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: HeroSliderFormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    if (!formData.buttonText.trim()) {
      newErrors.buttonText = 'Button text is required';
    } else if (formData.buttonText.length > 50) {
      newErrors.buttonText = 'Button text cannot exceed 50 characters';
    }

    if (!formData.buttonLink.trim()) {
      newErrors.buttonLink = 'Button link is required';
    } else if (!isValidUrl(formData.buttonLink)) {
      newErrors.buttonLink = 'Please enter a valid URL';
    }

    if (!formData.displayOrder || formData.displayOrder < 1) {
      newErrors.displayOrder = 'Display order must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // URL validation helper
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle form submission using FormData (like add page)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isClient || !sliderId) return;
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create FormData object
      const submitFormData = new FormData();
      
      // Append text fields
      submitFormData.append('title', formData.title);
      submitFormData.append('buttonText', formData.buttonText);
      submitFormData.append('buttonLink', formData.buttonLink);
      submitFormData.append('status', formData.status);
      submitFormData.append('displayOrder', formData.displayOrder.toString());
      
      // Append image file if in upload mode and a new file was selected
      if (isUploadMode && selectedFile) {
        submitFormData.append('image', selectedFile);
        console.log('🔄 Appending new image file:', selectedFile.name);
      } else if (!showExistingImage) {
        // If existing image was removed, send empty to indicate deletion
        submitFormData.append('removeImage', 'true');
      }
      
      console.log('🔄 Updating hero slider with ID:', sliderId);
      console.log('📦 Update data:', {
        title: formData.title,
        buttonText: formData.buttonText,
        buttonLink: formData.buttonLink,
        status: formData.status,
        displayOrder: formData.displayOrder,
        hasNewImage: !!(isUploadMode && selectedFile),
        keepExistingImage: showExistingImage
      });

      // Send data using FormData with PUT method
      const response = await clientService.put<ApiResponse>(
        `/hero-slider/${sliderId}`, 
        submitFormData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (response.data.success) {
        toast.success('Hero slider updated successfully!');
        router.push('/content-management');
      } else {
        throw new Error(response.data.message || 'Failed to update hero slider');
      }
    } catch (error: any) {
      console.error('❌ Error updating hero slider:', error);
      
      if (error.response?.data?.message?.includes('Display order already exists')) {
        setErrors(prev => ({
          ...prev,
          displayOrder: 'This display order already exists. Please choose a different one.'
        }));
        toast.error('Display order already exists. Please choose a different one.');
      } else if (error.response?.data?.message?.includes('Cloudinary') || 
                 error.response?.data?.message?.includes('upload')) {
        toast.error(`Image upload failed: ${error.response.data.message}`);
      } else {
        toast.error(`Failed to update hero slider: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to original values
  const handleReset = () => {
    if (formData.existingImage) {
      setImagePreview(formData.existingImage);
    }
    setSelectedFile(null);
    setShowExistingImage(true);
    setIsUploadMode(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrors({});
  };

  // Loading state
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading hero slider data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state - slider not found
  if (!sliderId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Hero Slider Not Found</h2>
              <p className="text-gray-600 mb-6">The hero slider item you're trying to edit doesn't exist.</p>
              <Link
                href="/content-management"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                ← Back to Content Management
              </Link>
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
          {/* Header - Matching your design */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Hero Slider</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Update the banner slide for the homepage hero section
                </p>
              </div>
              <Link
                href="/content-management"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                ← Back to Content Management
              </Link>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Section 1: Title */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Title</h3>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Slide Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Enter a compelling slide title"
                  maxLength={200}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">Maximum 200 characters</p>
                  <p className="text-xs text-gray-500">{formData.title.length}/200</p>
                </div>
              </div>
            </div>

            {/* Section 2: Button Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Button Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Button Text */}
                <div>
                  <label htmlFor="buttonText" className="block text-sm font-medium text-gray-700 mb-2">
                    Button Text *
                  </label>
                  <input
                    type="text"
                    id="buttonText"
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border ${
                      errors.buttonText ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Learn More, Shop Now, etc."
                    maxLength={50}
                  />
                  {errors.buttonText && (
                    <p className="mt-1 text-sm text-red-600">{errors.buttonText}</p>
                  )}
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">Maximum 50 characters</p>
                    <p className="text-xs text-gray-500">{formData.buttonText.length}/50</p>
                  </div>
                </div>

                {/* Button Link */}
                <div>
                  <label htmlFor="buttonLink" className="block text-sm font-medium text-gray-700 mb-2">
                    Button Link *
                  </label>
                  <input
                    type="url"
                    id="buttonLink"
                    name="buttonLink"
                    value={formData.buttonLink}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border ${
                      errors.buttonLink ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="https://example.com/your-page"
                  />
                  {errors.buttonLink && (
                    <p className="mt-1 text-sm text-red-600">{errors.buttonLink}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Full URL including https://
                  </p>
                </div>
              </div>

              {/* Button Preview */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Button Preview:</p>
                <div className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200">
                  {formData.buttonText || 'Your Button'}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  This is how your button will appear on the slide
                </p>
              </div>
            </div>

            {/* Section 3: Status */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Status</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Slide Status
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
                    Active slides will be displayed on the homepage
                  </p>
                </div>

                {/* Display Order */}
                <div>
                  <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order *
                  </label>
                  <input
                    type="number"
                    id="displayOrder"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className={`w-full px-3 py-2 border ${
                      errors.displayOrder ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                  {errors.displayOrder && (
                    <p className="mt-1 text-sm text-red-600">{errors.displayOrder}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Lower numbers appear first (e.g., 1 shows before 2)
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4: Image - DEFAULT TO UPLOAD MODE */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Image</h3>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('upload')}
                    className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded transition-colors ${
                      isUploadMode
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('url')}
                    className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded transition-colors ${
                      !isUploadMode
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <LinkIcon className="w-3 h-3" />
                    Use URL
                  </button>
                </div>
              </div>

              {!isUploadMode ? (
                // URL Mode (currently disabled)
                <div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <div className="shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          URL mode not available
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            Currently, only image upload is supported. The backend will handle Cloudinary upload automatically.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Upload Mode (DEFAULT)
                <div className="space-y-4">
                  {/* Current Image Display */}
                  {/* {showExistingImage && formData.existingImage && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Current Image</span>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          Currently Displaying
                        </span>
                      </div>
                      <div className="relative aspect-video rounded-md overflow-hidden border border-blue-200">
                        <div className="relative w-full h-48">
                          <Image
                            src={formData.existingImage}
                            alt="Current hero slider"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 mt-3">
                        This image is currently being used. Upload a new image to replace it.
                      </p>
                    </div>
                  )} */}

                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : imagePreview && !showExistingImage
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
                      {imagePreview && !showExistingImage ? (
                        <>
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                            <ImageIcon className="w-8 h-8 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              New Image Uploaded Successfully!
                            </p>
                            <p className="text-xs text-gray-500 mb-4">
                              Will replace current image when you submit
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
                              {showExistingImage ? 'Upload New Image' : 'Drag & drop your image here'}
                            </p>
                            <p className="text-xs text-gray-500 mb-4">
                              {showExistingImage 
                                ? 'Upload a new image to replace the current one' 
                                : 'or click to browse files on your computer'}
                            </p>
                          </div>
                        </>
                      )}
                      
                      <button
                        type="button"
                        onClick={handleBrowseClick}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        {imagePreview && !showExistingImage ? 'Replace New Image' : 'Browse Files'}
                      </button>
                      
                      <p className="text-xs text-gray-400">
                        Supports JPG, PNG, GIF, WebP • Max 10MB
                      </p>
                    </div>
                  </div>

                  {/* New Image Preview */}
                  {imagePreview && !showExistingImage && (
                    <div className="relative rounded-lg border border-gray-200 overflow-hidden">
                      <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">New Image Preview</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove new image"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="relative aspect-video">
                        <div className="relative w-full h-48">
                          <Image
                            src={imagePreview}
                            alt="New image preview"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                          This new image will replace the current one
                        </p>
                      </div>
                    </div>
                  )}

                  {errors.image && (
                    <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                  )}
                </div>
              )}

              {/* Slide Preview (for both modes) */}
              {imagePreview && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Slide Preview:</p>
                  <div className="relative aspect-video rounded-md overflow-hidden border border-gray-200">
                    <div className="relative w-full h-48">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-4">
                      <div className="text-white">
                        <h3 className="text-lg font-bold mb-2">{formData.title || 'Slide Title'}</h3>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200">
                          {formData.buttonText || 'Button'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    This is how your updated slide will appear on the homepage
                  </p>
                </div>
              )}
            </div>

            {/* Form Actions - Matching your design */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              >
                Reset Changes
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
                disabled={isSubmitting || !formData.title || !formData.buttonText || !formData.buttonLink}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Slide'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditHeroSliderPage;