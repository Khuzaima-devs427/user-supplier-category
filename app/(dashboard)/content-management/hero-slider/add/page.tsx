// app/content-management/hero-slider/add/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '../../../../_components/contexts/PermissionContext';
import { clientService } from '../../../../../app/app/utils/api-client';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { Upload, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
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
}

interface HeroSliderFormErrors {
  image?: string;
  title?: string;
  buttonText?: string;
  buttonLink?: string;
  status?: string;
  displayOrder?: string;
}

const AddHeroSliderPage = () => {
  const router = useRouter();
  const { permissions } = usePermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState<HeroSliderFormData>({
    title: '',
    buttonText: 'Learn More',
    buttonLink: '',
    status: 'active',
    displayOrder: 1
  });

  const [errors, setErrors] = useState<HeroSliderFormErrors>({});
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadMode, setIsUploadMode] = useState(true); // Default to upload mode
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set isClient only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check permissions
  // useEffect(() => {
  //   if (!isClient) return;
    
  //   if (!hasPermission('hero_slider.create')) {
  //     toast.error('You do not have permission to add hero slider items');
  //     router.push('/content-management');
  //   }
  // }, [isClient, permissions, router]);

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
    toast.success('Image uploaded successfully!');
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview); // Clean up memory
    }
    setImagePreview(null);
    setSelectedFile(null);
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
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);
      setSelectedFile(null);
    } else {
      // Switching to upload mode - just ensure we're in upload mode
      setIsUploadMode(true);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: HeroSliderFormErrors = {};

    if (isUploadMode && !selectedFile) {
      newErrors.image = 'Image is required when using upload mode';
    }

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

  // Handle form submission using FormData (like supplier category)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isClient) return;
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create FormData object (like supplier category)
      const submitFormData = new FormData();
      
      // Append text fields
      submitFormData.append('title', formData.title);
      submitFormData.append('buttonText', formData.buttonText);
      submitFormData.append('buttonLink', formData.buttonLink);
      submitFormData.append('status', formData.status);
      submitFormData.append('displayOrder', formData.displayOrder.toString());
      
      // Append image file if in upload mode
      if (isUploadMode && selectedFile) {
        submitFormData.append('image', selectedFile);
        console.log('🔄 Appending image file:', selectedFile.name, selectedFile.type);
      }
      
      console.log('🔄 Submitting hero slider data:', {
        title: formData.title,
        buttonText: formData.buttonText,
        buttonLink: formData.buttonLink,
        status: formData.status,
        displayOrder: formData.displayOrder,
        hasImage: !!(isUploadMode && selectedFile),
        imageMode: isUploadMode ? 'upload' : 'url'
      });

      // Send data using FormData (backend will handle Cloudinary upload)
      const response = await clientService.post<ApiResponse>('/hero-slider', submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });
      
      if (response.data.success) {
        toast.success('Hero slider created successfully!');
        router.push('/content-management');
      } else {
        throw new Error(response.data.message || 'Failed to create hero slider');
      }
    } catch (error: any) {
      console.error('❌ Error creating hero slider:', error);
      
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
        toast.error(`Failed to create hero slider: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      title: '',
      buttonText: 'Learn More',
      buttonLink: '',
      status: 'active',
      displayOrder: 1
    });
    setErrors({});
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setSelectedFile(null);
    setIsUploadMode(true); // Reset to upload mode
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Loading state for server render
  if (!isClient) {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header - Matching your design */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Hero Slider</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Create a new banner slide for the homepage hero section
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
            {/* Section 1: Title - Matching your design structure */}
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
                // URL Mode (currently disabled - backend expects file upload)
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
                  {/* Upload Area - Always visible by default */}
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
                            <ImageIcon className="w-8 h-8 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              Image Uploaded Successfully!
                            </p>
                            <p className="text-xs text-gray-500 mb-4">
                              Will be uploaded to Cloudinary via backend when you submit
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
                              Drag & drop your image here
                            </p>
                            <p className="text-xs text-gray-500 mb-4">
                              or click to browse files on your computer
                            </p>
                          </div>
                        </>
                      )}
                      
                      <button
                        type="button"
                        onClick={handleBrowseClick}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        {imagePreview ? 'Replace Image' : 'Browse Files'}
                      </button>
                      
                      <p className="text-xs text-gray-400">
                        Supports JPG, PNG, GIF, WebP • Max 10MB
                      </p>
                    </div>
                  </div>

                  {/* Uploaded Image Preview */}
                  {imagePreview && (
                    <div className="relative rounded-lg border border-gray-200 overflow-hidden">
                      <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Image Preview</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove image"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="relative aspect-video">
                        <div className="relative w-full h-48">
                          <Image
                            src={imagePreview}
                            alt="Uploaded preview"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                          Image will be uploaded to Cloudinary via backend upon submission
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
                    This is how your slide will appear on the homepage
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
                Reset Form
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
                disabled={isSubmitting || !formData.title || !selectedFile || !formData.buttonText || !formData.buttonLink}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Slide'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddHeroSliderPage;