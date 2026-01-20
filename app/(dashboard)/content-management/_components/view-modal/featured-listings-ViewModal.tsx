'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  ExternalLink, 
  Image as ImageIcon,
  Eye,
  EyeOff,
  Hash,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Loader2,
  Tag,
  DollarSign,
  Package,
  ListOrdered,
  Star,
  ShoppingBag,
  FileText
} from 'lucide-react';
import { clientService } from '../../../../app/utils/api-client';
import Image from 'next/image';
import { AxiosResponse } from 'axios';

interface FeaturedListingViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
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
  displayOrder: number;
  featuredOrder?: number;
  image?: string | {  // CHANGED: Accept both string and object
    url: string;
    publicId?: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName?: string;
}

// API Response interface
interface FeaturedListingResponse {
  success: boolean;
  message: string;
  data: FeaturedListing;
}

interface FeatureCategoryResponse {
  success: boolean;
  message: string;
  data: FeatureCategory;
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

const FeaturedListingViewModal: React.FC<FeaturedListingViewModalProps> = ({ 
  isOpen, 
  onClose, 
  data 
}) => {
  const [featuredListing, setFeaturedListing] = useState<FeaturedListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryDetails, setCategoryDetails] = useState<FeatureCategory | null>(null);

  // Fetch featured listing data when modal opens
  useEffect(() => {
    const fetchFeaturedListingData = async () => {
      if (!isOpen || !data) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Try multiple ID fields
        const listingId = data.id || data._id || (data.data && (data.data.id || data.data._id));
        
        if (!listingId) {
          console.error('❌ No featured listing ID found in data:', data);
          setIsLoading(false);
          return;
        }

        console.log('🔄 Fetching featured listing data for View modal ID:', listingId);
        
        const response: AxiosResponse<FeaturedListingResponse> = await clientService.get(
          `/featured-listings/${listingId}`
        );
        
        console.log('✅ View Modal Featured Listing data received:', response.data);
        console.log('🖼️ Image data type:', typeof response.data.data.image);
        console.log('🖼️ Image value:', response.data.data.image);
        
        if (response.data.success) {
          const listing = response.data.data;
          setFeaturedListing(listing);
          
          // Fetch category details if needed
          if (typeof listing.featureCategory === 'string') {
            try {
              const categoryResponse: AxiosResponse<FeatureCategoryResponse> = await clientService.get(
                `/feature-categories/${listing.featureCategory}`
              );
              if (categoryResponse.data.success) {
                setCategoryDetails(categoryResponse.data.data);
              }
            } catch (categoryError) {
              console.error('❌ Error fetching category details:', categoryError);
            }
          } else {
            setCategoryDetails(listing.featureCategory);
          }
        } else {
          console.error('❌ Failed to fetch featured listing data for view modal');
        }
      } catch (error) {
        console.error('❌ Error fetching featured listing for view modal:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedListingData();
  }, [isOpen, data]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFeaturedListing(null);
      setCategoryDetails(null);
      setIsLoading(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Use fetched data or fallback to props data
  const displayData = featuredListing || data;
  
  // Get category information
  const category = categoryDetails || 
                  (typeof displayData?.featureCategory === 'object' ? displayData.featureCategory : null);
  
  // Get image URL using the helper function
  const imageUrl = getImageUrl(displayData?.image);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-opacity-50 transition-opacity backdrop-blur-[3px]"
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
          {/* Header */}
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Featured Listing Details
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Complete information about this featured listing
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
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="ml-3 text-gray-600">Loading featured listing data...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Grid Layout for Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Listing Information & Image */}
                  <div className="space-y-6">
                    {/* Basic Information Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-blue-600" />
                        Listing Information
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Name */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Listing Name</span>
                          </div>
                          <div className="p-3 bg-blue-50 rounded border border-blue-100">
                            <p className="text-gray-900 font-medium text-lg">{displayData?.name || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Description</span>
                          </div>
                          <div className="p-3 bg-blue-50 rounded border border-blue-100">
                            <p className="text-gray-900 font-medium text-lg">{displayData?.description || 'No description available'}</p>
                          </div>
                        </div>

                        {/* Price */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Price</span>
                          </div>
                          <div className="p-3 bg-green-50 rounded border border-green-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-green-700">${displayData?.price ? formatPrice(displayData.price) : '0.00'}</span>
                                <span className="text-sm text-gray-600">USD</span>
                              </div>
                              <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Fixed Price
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Category */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Category</span>
                          </div>
                          <div className="p-3 bg-gray-50 rounded border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                  {category?.name || 'Uncategorized'}
                                  {category?.isFeatured && (
                                    <Star className="w-3 h-3 ml-1 fill-yellow-400 text-yellow-600" />
                                  )}
                                </div>
                                {category?.type && (
                                  <span className="text-sm text-gray-600">
                                    Type: {category.type}
                                  </span>
                                )}
                              </div>
                              {category && (
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  category.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {category.status}
                                </span>
                              )}
                            </div>
                            {category?.description && (
                              <p className="text-sm text-gray-600 mt-2">{category.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Status & Featured */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Status */}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Eye className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">Status</span>
                            </div>
                            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                              displayData?.status === 'active'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {displayData?.status === 'active' ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  Inactive
                                </>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {displayData?.status === 'active' 
                                ? 'Visible to users' 
                                : 'Hidden from users'}
                            </p>
                          </div>

                          {/* Featured */}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Star className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">Featured</span>
                            </div>
                            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                              displayData?.isFeatured
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {displayData?.isFeatured ? (
                                <>
                                  <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-600" />
                                  Featured
                                </>
                              ) : (
                                <>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Regular
                                </>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {displayData?.isFeatured 
                                ? 'Highlighted in category' 
                                : 'Standard listing'}
                            </p>
                          </div>
                        </div>

                        {/* Display Order */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <ListOrdered className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Display Order</span>
                          </div>
                          <div className="p-3 bg-purple-50 rounded border border-purple-100">
                            <div className="flex items-center">
                              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-lg mr-4">
                                <span className="font-bold text-2xl">{displayData?.featuredOrder || displayData?.displayOrder || 'N/A'}</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">Position Priority</p>
                                <p className="text-xs text-gray-500">
                                  {(displayData?.featuredOrder === 1 || displayData?.displayOrder === 1)
                                    ? 'First item to display' 
                                    : `Position #${displayData?.featuredOrder || displayData?.displayOrder || 'N/A'} in category`}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preview Card */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300">
                      {/* Preview Header */}
                      <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Preview</span>
                          </div>
                          <span className="text-xs text-gray-500">Featured Listing</span>
                        </div>
                      </div>
                      
                      {/* Preview Content */}
                      <div className="p-4">
                        {/* Category Badge */}
                        <div className="mb-3">
                          <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            {category?.name || 'Category'}
                          </span>
                        </div>
                        
                        {/* Image Preview */}
                        <div className="relative h-40 rounded-lg overflow-hidden mb-4 bg-gray-100">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt="Preview"
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              onError={(e) => {
                                console.error('❌ Image failed to load:', imageUrl);
                                e.currentTarget.style.display = 'none';
                              }}
                              onLoad={() => console.log('✅ Image loaded successfully:', imageUrl)}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ImageIcon className="w-10 h-10 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-lg text-gray-900 line-clamp-1">
                            {displayData?.name || 'Listing Name'}
                          </h4>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {displayData?.description?.substring(0, 100) || 'Listing description...'}
                            {displayData?.description && displayData.description.length > 100 && '...'}
                          </p>
                          <div className="flex items-center justify-between pt-2">
                            <div className="text-xl font-bold text-blue-600">
                              ${displayData?.price ? formatPrice(displayData.price) : '0.00'}
                            </div>
                            {displayData?.isFeatured && (
                              <span className="inline-flex items-center text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                                <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Image & System Information */}
                  <div className="space-y-6">
                    {/* Image Preview Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-blue-600" />
                        Listing Image
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Image Preview */}
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-300 shadow-lg">
                          {imageUrl ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={imageUrl}
                                alt={displayData?.name || "Featured Listing"}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority
                                onError={(e) => {
                                  console.error('❌ Main image failed to load:', imageUrl);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              {/* Overlay badges */}
                              <div className="absolute top-4 left-4 flex gap-2">
                                {displayData?.isFeatured && (
                                  <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200 shadow-sm">
                                    <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                                    Featured
                                  </span>
                                )}
                                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200 shadow-sm">
                                  ${displayData?.price ? formatPrice(displayData.price) : '0.00'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full bg-linear-to-br from-gray-100 to-gray-200">
                              <div className="text-center p-8">
                                <ImageIcon className="w-16 h-16 text-gray-400/80 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium text-lg">No Image Available</p>
                                <p className="text-sm text-gray-500 mt-2">Image not uploaded or failed to load</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Image Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Storage</p>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="font-medium text-gray-900">Cloudinary</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Status</p>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  imageUrl ? 'bg-green-500' : 'bg-gray-400'
                                }`}></div>
                                <span className="font-medium text-gray-900">
                                  {imageUrl ? 'Uploaded' : 'Not uploaded'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Image URL Display */}
                          {imageUrl && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs font-medium text-gray-500 mb-1">Image URL</p>
                              <div className="flex items-center justify-between gap-2">
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700 break-all flex-1">
                                  {imageUrl}
                                </code>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(imageUrl);
                                    console.log('📋 Image URL copied to clipboard');
                                  }}
                                  className="ml-2 text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                                >
                                  Copy URL
                                </button>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {typeof displayData?.image === 'string' 
                                  ? 'Image stored as URL string' 
                                  : 'Image stored as object'}
                              </p>
                            </div>
                          )}
                          
                          {/* Image Type Information */}
                          <div className="mt-3 text-xs text-gray-600">
                            <p className="font-medium">Image Data Type:</p>
                            <div className="mt-1 flex items-center gap-2">
                              <div className={`px-2 py-1 rounded ${
                                typeof displayData?.image === 'string'
                                  ? 'bg-green-100 text-green-800'
                                  : typeof displayData?.image === 'object'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {typeof displayData?.image === 'string' 
                                  ? 'String URL' 
                                  : typeof displayData?.image === 'object'
                                  ? 'Object with URL'
                                  : 'No image data'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* System Information Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        System Information
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Listing ID */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Listing ID</p>
                          <div className="p-3 bg-gray-50 rounded border border-gray-200">
                            <div className="flex items-center justify-between">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700 truncate flex-1">
                                {displayData?._id || displayData?.id || 'N/A'}
                              </code>
                              <button
                                onClick={() => {
                                  const id = displayData?._id || displayData?.id;
                                  if (id) {
                                    navigator.clipboard.writeText(id);
                                    console.log('📋 ID copied to clipboard');
                                  }
                                }}
                                className="ml-2 text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                              >
                                Copy ID
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Timestamps */}
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full">
                              <ArrowUp className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-900">Created</p>
                              <p className="text-sm text-gray-700">
                                {displayData?.createdAt ? formatDate(displayData.createdAt) : 'N/A'}
                              </p>
                            </div>
                          </div>

                          {displayData?.updatedAt && (
                            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full">
                                <ArrowDown className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-green-900">Last Updated</p>
                                <p className="text-sm text-gray-700">
                                  {formatDate(displayData.updatedAt)}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Created By */}
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 rounded-full">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">Created By</p>
                              <p className="text-sm text-gray-700">
                                {displayData?.createdByName || displayData?.createdBy || 'System'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 pt-3">
                          <div className={`p-2 rounded text-center ${
                            displayData?.status === 'active' 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-gray-50 border border-gray-200'
                          }`}>
                            <p className="text-xs font-medium text-gray-600">Status</p>
                            <p className={`text-sm font-bold ${
                              displayData?.status === 'active' ? 'text-green-700' : 'text-gray-700'
                            }`}>
                              {displayData?.status === 'active' ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                          <div className="p-2 rounded text-center bg-purple-50 border border-purple-200">
                            <p className="text-xs font-medium text-gray-600">Display Order</p>
                            <p className="text-sm font-bold text-purple-700">
                              #{displayData?.featuredOrder || displayData?.displayOrder || 'N/A'}
                            </p>
                          </div>
                          <div className="p-2 rounded text-center bg-blue-50 border border-blue-200">
                            <p className="text-xs font-medium text-gray-600">Type</p>
                            <p className="text-sm font-bold text-blue-700">
                              {displayData?.isFeatured ? 'Featured' : 'Regular'}
                            </p>
                          </div>
                        </div>
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
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
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

export default FeaturedListingViewModal;