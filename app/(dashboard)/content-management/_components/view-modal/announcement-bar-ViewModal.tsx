'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  MessageSquare, 
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Copy,
  Loader2,
  Bell,
  BellOff,
  RefreshCw,
  Info
} from 'lucide-react';
import { clientService } from '../../../../app/utils/api-client';

interface AnnouncementViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

interface AnnouncementItem {
  _id: string;
  announcement: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  createdByName?: string;
}

// API Response interface
interface AnnouncementResponse {
  success: boolean;
  message: string;
  data: AnnouncementItem;
}

const AnnouncementViewModal: React.FC<AnnouncementViewModalProps> = ({ 
  isOpen, 
  onClose, 
  data 
}) => {
  const [announcement, setAnnouncement] = useState<AnnouncementItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  // Fetch announcement data when modal opens
  useEffect(() => {
    const fetchAnnouncementData = async () => {
      if (!isOpen || !data) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Try multiple ID fields
        const announcementId = data.id || data._id || (data.data && (data.data.id || data.data._id));
        
        if (!announcementId) {
          console.error('❌ No announcement ID found in data:', data);
          setIsLoading(false);
          return;
        }

        console.log('🔄 Fetching announcement data for View modal ID:', announcementId);
        
        const response = await clientService.get<AnnouncementResponse>(
          `/announcements/${announcementId}`
        );
        
        console.log('✅ View Modal Announcement data received:', response.data);
        
        if (response.data.success) {
          setAnnouncement(response.data.data);
        } else {
          console.error('❌ Failed to fetch announcement data for view modal');
        }
      } catch (error) {
        console.error('❌ Error fetching announcement for view modal:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncementData();
  }, [isOpen, data]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAnnouncement(null);
      setIsLoading(true);
      setCopiedId(false);
    }
  }, [isOpen]);

  // Copy ID to clipboard
  const handleCopyId = () => {
    const id = announcement?._id || announcement?._id;
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
  const displayData = announcement || data;

  // Truncate long announcements for preview
  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
          {/* Header */}
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${displayData?.status === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {displayData?.status === 'active' ? (
                    <Bell className="h-5 w-5 text-green-600" />
                  ) : (
                    <BellOff className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Announcement Details
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete information about this announcement
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
                <p className="ml-3 text-gray-600">Loading announcement data...</p>
              </div>
            ) : !displayData ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No announcement data available</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Grid Layout for Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Announcement Content & Status */}
                  <div className="space-y-6">
                    {/* Announcement Content Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        Announcement Content
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Announcement Text */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Announcement Text</span>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                {displayData.announcement?.length || 0}/500 chars
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: <span className="font-mono">{displayData._id?.substring(0, 8)}...</span>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="prose max-w-none">
                              <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                                {displayData.announcement || 'No announcement text provided'}
                              </p>
                            </div>
                            
                            {/* Truncated preview for long announcements */}
                            {displayData.announcement && displayData.announcement.length > 200 && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                  <strong>Preview:</strong> {truncateText(displayData.announcement, 100)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Character Count Stats */}
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="p-2 bg-gray-50 rounded border border-gray-200">
                            <p className="text-xs font-medium text-gray-500">Characters</p>
                            <p className="text-lg font-bold text-gray-900">
                              {displayData.announcement?.length || 0}
                            </p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded border border-gray-200">
                            <p className="text-xs font-medium text-gray-500">Words</p>
                            <p className="text-lg font-bold text-gray-900">
                              {displayData.announcement?.split(/\s+/).filter(Boolean).length || 0}
                            </p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded border border-gray-200">
                            <p className="text-xs font-medium text-gray-500">Remaining</p>
                            <p className={`text-lg font-bold ${
                              (displayData.announcement?.length || 0) > 450 
                                ? 'text-red-600' 
                                : (displayData.announcement?.length || 0) > 400 
                                  ? 'text-yellow-600' 
                                  : 'text-green-600'
                            }`}>
                              {500 - (displayData.announcement?.length || 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Info className="h-5 w-5 text-indigo-600" />
                        Status Information
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
                              {displayData.status === 'active' ? 'Live' : 'Hidden'}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600">
                            {displayData.status === 'active' 
                              ? 'This announcement is currently visible to all users on the website.'
                              : 'This announcement is hidden and not visible to users.'}
                          </p>
                        </div>

                        {/* Status Rules */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-blue-800">Important Note</p>
                              <p className="text-xs text-blue-700">
                                Only one announcement can be active at a time. Activating this announcement will automatically deactivate any other active announcement.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - System Information & Timestamps */}
                  <div className="space-y-6">
                    {/* System Information Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        System Information
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Announcement ID */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-700">Announcement ID</p>
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
                          <div className="p-3 rounded text-center bg-blue-50 border border-blue-200">
                            <p className="text-xs font-medium text-gray-600">Type</p>
                            <p className="text-sm font-bold text-blue-700">
                              Announcement
                            </p>
                          </div>
                          <div className="p-3 rounded text-center bg-purple-50 border border-purple-200">
                            <p className="text-xs font-medium text-gray-600">Priority</p>
                            <p className="text-sm font-bold text-purple-700">
                              High
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
                                <RefreshCw className="h-4 w-4 text-gray-400" />
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

                    {/* Preview Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-purple-600" />
                        User Preview
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Preview Box */}
                        <div className="relative rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                          {/* Simulated announcement bar */}
                          <div className={`p-4 ${displayData.status === 'active' ? 'bg-blue-50' : 'bg-gray-100'} border-b border-gray-200`}>
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${displayData.status === 'active' ? 'bg-blue-100' : 'bg-gray-200'}`}>
                                {displayData.status === 'active' ? (
                                  <Bell className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <BellOff className="h-4 w-4 text-gray-500" />
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-700">
                                  {displayData.status === 'active' ? 'Live Announcement' : 'Inactive Announcement'}
                                </p>
                                <p className="text-sm text-gray-900 font-medium">
                                  {truncateText(displayData.announcement || 'No announcement text', 80)}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Preview explanation */}
                          <div className="p-3 bg-gray-50 border-t border-gray-200">
                            <p className="text-xs text-gray-600">
                              This is how the announcement appears to users on the website. 
                              {displayData.status === 'active' 
                                ? ' The announcement bar is visible at the top of the page.'
                                : ' The announcement is hidden from users.'}
                            </p>
                          </div>
                        </div>

                        {/* Visibility Note */}
                        <div className="flex items-start gap-2 text-sm">
                          {displayData.status === 'active' ? (
                            <>
                              <Eye className="h-4 w-4 text-green-600 mt-0.5" />
                              <p className="text-green-700">
                                This announcement is currently visible to all users.
                              </p>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 text-gray-600 mt-0.5" />
                              <p className="text-gray-700">
                                This announcement is hidden and not visible to users.
                              </p>
                            </>
                          )}
                        </div>
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
                {displayData?.status === 'active' && (
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

export default AnnouncementViewModal;