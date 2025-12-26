// components/HeroSliderViewModal.tsx
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
  Loader2
} from 'lucide-react';
import { clientService } from '../../../../app/utils/api-client';
import Image from 'next/image';

interface HeroSliderViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
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
  createdByName?: string;
}

// API Response interface
interface HeroSliderResponse {
  success: boolean;
  message: string;
  data: HeroSliderItem;
}

const HeroSliderViewModal: React.FC<HeroSliderViewModalProps> = ({ 
  isOpen, 
  onClose, 
  data 
}) => {
  const [heroSlider, setHeroSlider] = useState<HeroSliderItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch hero slider data when modal opens
  useEffect(() => {
    const fetchHeroSliderData = async () => {
      if (!isOpen || !data) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Try multiple ID fields
        const sliderId = data.id || data._id || (data.data && (data.data.id || data.data._id));
        
        if (!sliderId) {
          console.error('❌ No hero slider ID found in data:', data);
          setIsLoading(false);
          return;
        }

        console.log('🔄 Fetching hero slider data for View modal ID:', sliderId);
        
        const response = await clientService.get<HeroSliderResponse>(
          `/hero-slider/${sliderId}`
        );
        
        console.log('✅ View Modal Hero Slider data received:', response.data);
        
        if (response.data.success) {
          setHeroSlider(response.data.data);
        } else {
          console.error('❌ Failed to fetch hero slider data for view modal');
        }
      } catch (error) {
        console.error('❌ Error fetching hero slider for view modal:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroSliderData();
  }, [isOpen, data]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHeroSlider(null);
      setIsLoading(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Format date for display - Using native JavaScript
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

  // Use fetched data or fallback to props data
  const displayData = heroSlider || data;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div 
        className="fixed inset-0  bg-opacity-50 transition-opacity backdrop-blur-[3px]"
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
          {/* Header */}
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Hero Slider Details
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Complete information about this homepage banner slide
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
                <p className="ml-3 text-gray-600">Loading hero slider data...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Grid Layout for Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Slide Information */}
                  <div className="space-y-6">
                    {/* Slide Information Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        Slide Information
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Title */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-700">Slide Title</span>
                          </div>
                          <div className="p-3 bg-gray-50 rounded border border-gray-200">
                            <p className="text-gray-900 font-medium">{displayData.title || 'N/A'}</p>
                          </div>
                          <div className="flex justify-between mt-1">
                            <p className="text-xs text-gray-500">Maximum 200 characters</p>
                            <p className="text-xs text-gray-500">{displayData.title?.length || 0}/200</p>
                          </div>
                        </div>

                        {/* Display Order & Status */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Display Order */}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Hash className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">Display Order</span>
                            </div>
                            <div className="p-3 bg-white rounded border border-gray-200">
                              <div className="flex items-center">
                                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-lg mr-3">
                                  <span className="font-bold text-lg">{displayData.displayOrder || 'N/A'}</span>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-900">Priority Position</p>
                                  <p className="text-xs text-gray-500">
                                    {displayData.displayOrder === 1 ? 'First to display' : `Position #${displayData.displayOrder}`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Status */}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-700">Status</span>
                            </div>
                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                              displayData.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {displayData.status === 'active' ? (
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
                              {displayData.status === 'active' 
                                ? 'Currently visible on homepage' 
                                : 'Hidden from homepage'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Button Configuration Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        Button Configuration
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Button Text */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-700">Button Text</span>
                          </div>
                          <div className="p-3 bg-gray-50 rounded border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded shadow-sm">
                                  {displayData.buttonText || 'N/A'}
                                </div>
                                <span className="text-sm text-gray-600">Button Label</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {displayData.buttonText?.length || 0}/50 chars
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Button Link */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <LinkIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Button Link</span>
                          </div>
                          <div className="p-3 bg-gray-50 rounded border border-gray-200">
                            <div className="flex items-center justify-between">
                              <a
                                href={displayData.buttonLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline truncate text-sm flex-1 mr-2"
                                title={displayData.buttonLink}
                              >
                                {displayData.buttonLink || 'N/A'}
                              </a>
                              <ExternalLink className="w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {displayData.buttonLink ? 'Click to open in new tab' : 'No link configured'}
                            </p>
                          </div>
                        </div>

                        {/* Link Test Button */}
                        {displayData.buttonLink && (
                          <div className="pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-center">
                              <a
                                href={displayData.buttonLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 shadow-sm"
                              >
                                Test Button Link
                                <ExternalLink className="w-4 h-4 ml-2" />
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Slide Preview Card - MOVED HERE (below Button Configuration) */}
                    <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-blue-600" />
                        Slide Preview
                      </h3>
                      
<div className="space-y-6">
  {/* Image Preview */}
  <div className="relative aspect-21/11 rounded-xl overflow-hidden border border-gray-200 shadow-2xl group hover:shadow-3xl transition-shadow duration-300">
    {displayData.image ? (
      <div className="relative w-full h-full">
        <Image
          src={displayData.image}
          alt={displayData.title || "Hero Slide"}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent" />
      </div>
    ) : (
      <div className="flex items-center justify-center h-full bg-linear-to-br from-gray-100 to-gray-200">
        <div className="text-center p-8">
          <ImageIcon className="w-14 h-14 text-gray-400/80 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No Image</p>
        </div>
      </div>
    )}
    
    {/* Overlay with title and button */}
    <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-5">
      <div className="text-indigo-100 w-full max-w-2xl">
        <h3 className="text-2xl md:text-2xl font-bold mb-3 leading-tight drop-shadow-lg">
          {displayData.title || 'Slide Title'}
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={displayData.buttonLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="mr-2">{displayData.buttonText || 'Button'}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
    
  </div>
  
  {/* Image Source Information */}
  
    <div className="flex items-center justify-between">
      <div>
        <div className="text-gray-700">
          <span className="font-semibold">Image Source:</span>{' '}
          {displayData.image ? (
            <span className="text-blue-600 font-medium">Cloudinary Storage</span>
          ) : (
            <span className="text-gray-500">No image</span>
          )}
        </div>
      </div>

    </div>
</div>

                    </div>
                  </div>

                  {/* Right Column - Metadata */}
                  <div className="space-y-6">
                    {/* Image Information Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-purple-600" />
                        Image Information
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Image Preview Thumbnail */}
                        <div className="flex justify-center">
                          <div className="relative w-full max-w-xs aspect-video rounded-lg overflow-hidden border border-gray-300">
                            {displayData.image ? (
                              <div className="relative w-full h-full">
                                <Image
                                  src={displayData.image}
                                  alt="Slide thumbnail"
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-32 bg-gray-100">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Image Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Storage</p>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="font-medium text-gray-900">Cloudinary</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Optimized</p>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="font-medium text-gray-900">Auto-optimized</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timestamps Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                        Timestamps
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          {/* Created At */}
                          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full">
                              <ArrowUp className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-900">Created</p>
                              <p className="text-sm text-gray-700">
                                {displayData.createdAt ? formatDate(displayData.createdAt) : 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Updated At */}
                          {displayData.updatedAt && (
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
                                {displayData.createdByName || displayData.createdBy || 'System'}
                              </p>
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
                      
                      <div className="space-y-3">
                        {/* Slide ID */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Slide ID</p>
                          <div className="p-3 bg-gray-50 rounded border border-gray-200">
                            <div className="flex items-center justify-between">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700 truncate flex-1">
                                {displayData._id || displayData.id || 'N/A'}
                              </code>
                              <button
                                onClick={() => {
                                  const id = displayData._id || displayData.id;
                                  if (id) {
                                    navigator.clipboard.writeText(id);
                                    // You might want to add a toast here
                                  }
                                }}
                                className="ml-2 text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                              >
                                Copy ID
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Unique identifier for this slide in the database
                            </p>
                          </div>
                        </div>

                        {/* Status Indicators */}
                        <div className="grid grid-cols-2 gap-3 pt-3">
                          <div className={`p-2 rounded text-center ${
                            displayData.status === 'active' 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-gray-50 border border-gray-200'
                          }`}>
                            <p className="text-xs font-medium text-gray-600">Homepage</p>
                            <p className={`text-sm font-bold ${
                              displayData.status === 'active' ? 'text-green-700' : 'text-gray-700'
                            }`}>
                              {displayData.status === 'active' ? 'Visible' : 'Hidden'}
                            </p>
                          </div>
                          <div className="p-2 rounded text-center bg-blue-50 border border-blue-200">
                            <p className="text-xs font-medium text-gray-600">Display Order</p>
                            <p className="text-sm font-bold text-blue-700">
                              #{displayData.displayOrder || 'N/A'}
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

export default HeroSliderViewModal;