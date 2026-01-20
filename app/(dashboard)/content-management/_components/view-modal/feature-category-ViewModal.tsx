'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Tag, 
  Star,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Copy,
  Loader2,
  Info,
  FileText,
  ListChecks,
  Hash,
  Shield,
  Zap
} from 'lucide-react';
import { clientService } from '../../../../app/utils/api-client';

interface FeatureCategoryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

interface FeatureCategoryItem {
  _id: string;
  name: string;
  description: string;
  type: string;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  createdByName?: string;
  featuredCount?: number;
  totalCategories?: number;
}

// API Response interface
interface FeatureCategoryResponse {
  success: boolean;
  message: string;
  data: FeatureCategoryItem;
}

const FeatureCategoryViewModal: React.FC<FeatureCategoryViewModalProps> = ({ 
  isOpen, 
  onClose, 
  data 
}) => {
  const [category, setCategory] = useState<FeatureCategoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [featuredStats, setFeaturedStats] = useState<{
    currentFeatured: number;
    maxFeatured: number;
    canAddMore: boolean;
  } | null>(null);

  // Fetch category data when modal opens
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!isOpen || !data) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Try multiple ID fields
        const categoryId = data.id || data._id || (data.data && (data.data.id || data.data._id));
        
        if (!categoryId) {
          console.error('❌ No category ID found in data:', data);
          setIsLoading(false);
          return;
        }

        console.log('🔄 Fetching category data for View modal ID:', categoryId);
        
        const response = await clientService.get<FeatureCategoryResponse>(
          `/feature-categories/${categoryId}`
        );
        
        console.log('✅ View Modal Category data received:', response.data);
        
        if (response.data.success) {
          setCategory(response.data.data);
          
          // Fetch featured stats
          const statsResponse = await clientService.get<any>(
            '/feature-categories/stats/featured-limit'
          );
          
          if (statsResponse.data.success) {
            setFeaturedStats(statsResponse.data.data);
          }
        } else {
          console.error('❌ Failed to fetch category data for view modal');
        }
      } catch (error) {
        console.error('❌ Error fetching category for view modal:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [isOpen, data]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCategory(null);
      setIsLoading(true);
      setCopiedId(false);
      setFeaturedStats(null);
    }
  }, [isOpen]);

  // Copy ID to clipboard
  const handleCopyId = () => {
    const id = category?._id;
    if (id) {
      navigator.clipboard.writeText(id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Calculate time since creation/update
  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
      } else {
        return 'Just now';
      }
    } catch {
      return 'Unknown time';
    }
  };

  // Use fetched data or fallback to props data
  const displayData = category || data;

  // Truncate long text for preview
  const truncateText = (text: string, maxLength: number = 150) => {
    if (!text) return 'Not provided';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div 
        className="fixed inset-0  bg-opacity-50 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
          {/* Header */}
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${displayData?.isFeatured ? 'bg-yellow-100' : displayData?.status === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {displayData?.isFeatured ? (
                    <Star className="h-5 w-5 text-yellow-600 fill-yellow-500" />
                  ) : displayData?.status === 'active' ? (
                    <Tag className="h-5 w-5 text-green-600" />
                  ) : (
                    <Tag className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Feature Category Details
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete information about this category
                  </p>
                </div>
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
                <p className="ml-3 text-gray-600">Loading category data...</p>
              </div>
            ) : !displayData ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No category data available</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Grid Layout for Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Category Content & Featured Status */}
                  <div className="space-y-6">
                    {/* Category Information Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Category Information
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Category Name */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Category Name</span>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                {displayData.name?.length || 0}/100 chars
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: <span className="font-mono">{displayData._id?.substring(0, 8)}...</span>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">
                              {displayData.name || 'No name provided'}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Primary identifier for this category
                            </p>
                          </div>
                        </div>

                        {/* Category Type */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Category Type</span>
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                {displayData.type?.length || 0}/50 chars
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="text-md font-semibold text-gray-900">
                              {displayData.type || 'No type specified'}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Classification type for organizational purposes
                            </p>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Description</span>
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                                {displayData.description?.length || 0}/500 chars
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="prose max-w-none">
                              <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                                {displayData.description || 'No description provided'}
                              </p>
                            </div>
                            
                            {/* Truncated preview for long descriptions */}
                            {displayData.description && displayData.description.length > 200 && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                  <strong>Preview:</strong> {truncateText(displayData.description, 100)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Character Count Stats */}
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="p-2 bg-gray-50 rounded border border-gray-200">
                            <p className="text-xs font-medium text-gray-500">Name</p>
                            <p className={`text-lg font-bold ${
                              (displayData.name?.length || 0) > 90 ? 'text-yellow-600' : 'text-gray-900'
                            }`}>
                              {displayData.name?.length || 0}/100
                            </p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded border border-gray-200">
                            <p className="text-xs font-medium text-gray-500">Type</p>
                            <p className={`text-lg font-bold ${
                              (displayData.type?.length || 0) > 40 ? 'text-yellow-600' : 'text-gray-900'
                            }`}>
                              {displayData.type?.length || 0}/50
                            </p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded border border-gray-200">
                            <p className="text-xs font-medium text-gray-500">Description</p>
                            <p className={`text-lg font-bold ${
                              (displayData.description?.length || 0) > 450 
                                ? 'text-red-600' 
                                : (displayData.description?.length || 0) > 400 
                                  ? 'text-yellow-600' 
                                  : 'text-gray-900'
                            }`}>
                              {displayData.description?.length || 0}/500
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Featured Status Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-600" />
                        Featured Status
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Featured Display */}
                        <div className={`p-4 rounded-lg border ${
                          displayData.isFeatured 
                            ? 'bg-yellow-50 border-yellow-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {displayData.isFeatured ? (
                                <Star className="h-6 w-6 text-yellow-600 fill-yellow-500" />
                              ) : (
                                <Star className="h-6 w-6 text-gray-400" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-700">Featured Status</p>
                                <p className={`text-lg font-bold ${
                                  displayData.isFeatured ? 'text-yellow-700' : 'text-gray-700'
                                }`}>
                                  {displayData.isFeatured ? 'FEATURED' : 'STANDARD'}
                                </p>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              displayData.isFeatured 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {displayData.isFeatured ? 'Priority' : 'Regular'}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600">
                            {displayData.isFeatured 
                              ? 'This category is highlighted and given priority placement on the website.'
                              : 'This category appears in the standard listing without special highlighting.'}
                          </p>
                        </div>

                        {/* Featured Limit Stats */}
                        {featuredStats && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Hash className="h-4 w-4 text-blue-600" />
                              <p className="text-sm font-medium text-blue-800">Featured Categories Limit</p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Current Featured</span>
                                <span className="text-sm font-semibold text-blue-700">
                                  {featuredStats.currentFeatured}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Maximum Allowed</span>
                                <span className="text-sm font-semibold text-gray-900">
                                  {featuredStats.maxFeatured}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Remaining Slots</span>
                                <span className={`text-sm font-semibold ${
                                  featuredStats.canAddMore ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {featuredStats.maxFeatured - featuredStats.currentFeatured}
                                </span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Featured Usage</span>
                                <span>{Math.round((featuredStats.currentFeatured / featuredStats.maxFeatured) * 100)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    featuredStats.currentFeatured >= featuredStats.maxFeatured 
                                      ? 'bg-red-500' 
                                      : featuredStats.currentFeatured >= featuredStats.maxFeatured * 0.8
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min(100, (featuredStats.currentFeatured / featuredStats.maxFeatured) * 100)}%` }}
                                ></div>
                              </div>
                            </div>

                            {!featuredStats.canAddMore && displayData.isFeatured && (
                              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                                  <p className="text-xs text-red-700">
                                    You have reached the maximum limit of {featuredStats.maxFeatured} featured categories. 
                                    You must remove a featured category before adding a new one.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Status, System Information & Timestamps */}
                  <div className="space-y-6">
                    {/* Status & Visibility Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ListChecks className="h-5 w-5 text-green-600" />
                        Status & Visibility
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Status Display */}
                        <div className={`p-4 rounded-lg border ${
                          displayData.status === 'active' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {displayData.status === 'active' ? (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                              ) : (
                                <XCircle className="h-6 w-6 text-gray-600" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-700">Current Status</p>
                                <p className={`text-lg font-bold ${
                                  displayData.status === 'active' ? 'text-green-700' : 'text-gray-700'
                                }`}>
                                  {displayData.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                                </p>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              displayData.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {displayData.status === 'active' ? 'Visible' : 'Hidden'}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600">
                            {displayData.status === 'active' 
                              ? 'This category is currently visible to all users on the website.'
                              : 'This category is hidden and not visible to users.'}
                          </p>
                        </div>

                        {/* Combined Status Badge */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className={`p-3 rounded text-center ${
                            displayData.status === 'active' 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-gray-50 border border-gray-200'
                          }`}>
                            <p className="text-xs font-medium text-gray-600">Visibility</p>
                            <p className={`text-sm font-bold ${
                              displayData.status === 'active' ? 'text-green-700' : 'text-gray-700'
                            }`}>
                              {displayData.status === 'active' ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                          <div className={`p-3 rounded text-center ${
                            displayData.isFeatured 
                              ? 'bg-yellow-50 border border-yellow-200' 
                              : 'bg-blue-50 border border-blue-200'
                          }`}>
                            <p className="text-xs font-medium text-gray-600">Priority</p>
                            <p className={`text-sm font-bold ${
                              displayData.isFeatured ? 'text-yellow-700' : 'text-blue-700'
                            }`}>
                              {displayData.isFeatured ? 'Featured' : 'Standard'}
                            </p>
                          </div>
                        </div>

                        {/* Status Rules */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-blue-800">Important Note</p>
                              <p className="text-xs text-blue-700">
                                Featured categories are displayed prominently on the website. 
                                Only {featuredStats?.maxFeatured || 10} categories can be featured at once.
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
                      
                      <div className="space-y-4">
                        {/* Category ID */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-700">Category ID</p>
                            <button
                              onClick={handleCopyId}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                            >
                              {copiedId ? (
                                <>
                                  <CheckCircle className="h-3 w-3" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  Copy ID
                                </>
                              )}
                            </button>
                          </div>
                          <div className="p-3 bg-gray-50 rounded border border-gray-200">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700 break-all">
                              {displayData._id || 'N/A'}
                            </code>
                            <p className="text-xs text-gray-500 mt-2">
                              Unique identifier in the database
                            </p>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className={`p-3 rounded text-center ${
                            displayData.status === 'active' 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-gray-50 border border-gray-200'
                          }`}>
                            <p className="text-xs font-medium text-gray-600">Status</p>
                            <p className={`text-sm font-bold ${
                              displayData.status === 'active' ? 'text-green-700' : 'text-gray-700'
                            }`}>
                              {displayData.status === 'active' ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                          <div className={`p-3 rounded text-center ${
                            displayData.isFeatured 
                              ? 'bg-yellow-50 border border-yellow-200' 
                              : 'bg-blue-50 border border-blue-200'
                          }`}>
                            <p className="text-xs font-medium text-gray-600">Type</p>
                            <p className="text-sm font-bold text-blue-700">
                              Category
                            </p>
                          </div>
                          <div className={`p-3 rounded text-center ${
                            displayData.isFeatured 
                              ? 'bg-purple-50 border border-purple-200' 
                              : 'bg-gray-50 border border-gray-200'
                          }`}>
                            <p className="text-xs font-medium text-gray-600">Priority</p>
                            <p className={`text-sm font-bold ${
                              displayData.isFeatured ? 'text-purple-700' : 'text-gray-700'
                            }`}>
                              {displayData.isFeatured ? 'High' : 'Normal'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timestamps Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-green-600" />
                        Timestamps
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Created At */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <p className="text-sm font-medium text-gray-700">Created At</p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {getTimeAgo(displayData.createdAt)}
                            </span>
                          </div>
                          <div className="p-3 bg-blue-50 rounded border border-blue-200">
                            <p className="text-sm text-gray-900">
                              {formatDate(displayData.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Updated At */}
                        {displayData.updatedAt && displayData.updatedAt !== displayData.createdAt && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <p className="text-sm font-medium text-gray-700">Last Updated</p>
                              </div>
                              <span className="text-xs text-gray-500">
                                {getTimeAgo(displayData.updatedAt)}
                              </span>
                            </div>
                            <div className="p-3 bg-green-50 rounded border border-green-200">
                              <p className="text-sm text-gray-900">
                                {formatDate(displayData.updatedAt)}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Created By */}
                        {displayData.createdBy && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <p className="text-sm font-medium text-gray-700">Created By</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded border border-gray-200">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 rounded-full">
                                  <User className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {displayData.createdByName || displayData.createdBy}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    User ID: {displayData.createdBy.substring(0, 8)}...
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {displayData?.status === 'active' && displayData?.isFeatured && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">Featured & Active</span>
                  </div>
                )}
                {displayData?.status === 'active' && !displayData?.isFeatured && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Currently Active</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Close
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureCategoryViewModal;