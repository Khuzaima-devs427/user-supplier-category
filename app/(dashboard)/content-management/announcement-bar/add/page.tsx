'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '../../../../_components/contexts/PermissionContext';
import { clientService } from '../../../../app/utils/api-client';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { MessageSquare, Bell, BellOff, AlertCircle, CheckCircle, XCircle, Zap, Calendar } from 'lucide-react';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

interface AnnouncementFormData {
  announcement: string;
  status: 'active' | 'inactive';
}

interface AnnouncementFormErrors {
  announcement?: string;
  status?: string;
}

const AddAnnouncementPage = () => {
  const router = useRouter();
  const { permissions } = usePermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    announcement: '',
    status: 'inactive' // Default to inactive as only one can be active
  });
  const [errors, setErrors] = useState<AnnouncementFormErrors>({});
  const [charCount, setCharCount] = useState(0);
  const [activeAnnouncements, setActiveAnnouncements] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Set isClient only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch active announcements count
  useEffect(() => {
    const fetchActiveAnnouncements = async () => {
      try {
        const response = await clientService.get<ApiResponse<{ total: number, active: number, inactive: number }>>('/announcement-bar/stats');
        if (response.data.success) {
          setActiveAnnouncements(response.data.data.active || 0);
        }
      } catch (error) {
        console.error('Error fetching announcement stats:', error);
      }
    };

    if (isClient) {
      fetchActiveAnnouncements();
    }
  }, [isClient]);

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
      [name]: value
    }));

    if (name === 'announcement') {
      setCharCount(value.length);
    }

    // Clear error for this field
    if (errors[name as keyof AnnouncementFormErrors]) {
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

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [formData.announcement]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: AnnouncementFormErrors = {};

    if (!formData.announcement.trim()) {
      newErrors.announcement = 'Announcement text is required';
    } else if (formData.announcement.length > 500) {
      newErrors.announcement = 'Announcement cannot exceed 500 characters';
    } else if (formData.announcement.length < 10) {
      newErrors.announcement = 'Announcement should be at least 10 characters';
    }

    if (formData.status === 'active' && activeAnnouncements > 0) {
      newErrors.status = 'There is already an active announcement. Activating this will deactivate the existing one.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isClient) return;
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Confirm if activating with existing active announcement
    if (formData.status === 'active' && activeAnnouncements > 0) {
      const confirmed = window.confirm(
        'There is already an active announcement. Activating this announcement will automatically deactivate the existing one. Do you want to continue?'
      );
      if (!confirmed) return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🔄 Submitting announcement data:', formData);

      const response = await clientService.post<ApiResponse>('/announcement-bar/', formData);
      
      if (response.data.success) {
        toast.success('Announcement created successfully!');
        router.push('/content-management');
      } else {
        throw new Error(response.data.message || 'Failed to create announcement');
      }
    } catch (error: any) {
      console.error('❌ Error creating announcement:', error);
      
      if (error.response?.data?.message?.includes('active') || 
          error.response?.data?.message?.includes('deactivate')) {
        setErrors(prev => ({
          ...prev,
          status: error.response.data.message
        }));
        toast.error(error.response.data.message);
      } else {
        toast.error(`Failed to create announcement: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      announcement: '',
      status: 'inactive'
    });
    setErrors({});
    setCharCount(0);
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
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check permission to add announcements
  if (!hasPermission('announcements.create')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to create announcements.
          </p>
          <Link
            href="/content-management/announcement-bar"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            ← Back to Announcements
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
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Add New Announcement</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Create a new announcement for the website header
                  </p>
                </div>
              </div>
              <Link
                href="/content-management"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                ← Back to Announcements
              </Link>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">


            {/* Section 1: Announcement Content */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Announcement Content
                </h3>
              </div>
              
              <div>
                <label htmlFor="announcement" className="block text-sm font-medium text-gray-700 mb-2">
                  Announcement Text *
                </label>
                <textarea
                  ref={textareaRef}
                  id="announcement"
                  name="announcement"
                  value={formData.announcement}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  maxLength={500}
                  className={`w-full px-3 py-2 border ${
                    errors.announcement ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none`}
                  placeholder="Enter your announcement here"
                />
                {errors.announcement && (
                  <p className="mt-1 text-sm text-red-600">{errors.announcement}</p>
                )}
                
              </div>

              {/* Content Tips */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Content Tips:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Keep it short and impactful
                  </li>
                  <li className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-green-500" />
                    Include emojis for visual appeal
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    Mention time limitations for urgency
                  </li>
                </ul>
              </div>
            </div>

            {/* Section 2: Status */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Status</h3>
              
              {/* Status Cards */}
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
                      <BellOff className={`w-5 h-5 ${
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
                        Announcement will be saved but not shown to users
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
                      ? 'border-blue-400 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  } ${
                    activeAnnouncements > 0 ? 'cursor-pointer' : ''
                  }`}
                  disabled={activeAnnouncements > 0}
                  title={activeAnnouncements > 0 ? 'There is already an active announcement' : ''}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      formData.status === 'active' ? 'bg-blue-100' : 'bg-gray-50'
                    }`}>
                      <Bell className={`w-5 h-5 ${
                        formData.status === 'active' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${
                          formData.status === 'active' ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          Active
                        </h4>
                        {formData.status === 'active' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Announcement will be visible to all users
                      </p>
                      {activeAnnouncements > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          <span>Will deactivate existing announcement</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </div>

              {/* Active Announcements Warning */}
              {activeAnnouncements > 0 && formData.status === 'active' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">
                        Active Announcement Detected
                      </h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        There is currently {activeAnnouncements} active announcement{activeAnnouncements > 1 ? 's' : ''}. 
                        Activating this announcement will automatically deactivate {activeAnnouncements > 1 ? 'them' : 'it'}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {errors.status && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                    <div>
                      <p className="text-sm text-red-700">{errors.status}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Preview</h3>
              
              <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                {/* Mock website header */}
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                
                {/* Announcement preview */}
                <div className="p-4">
                  <div className={`p-3 rounded-lg ${
                    formData.status === 'active' 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${
                        formData.status === 'active' 
                          ? 'bg-blue-500' 
                          : 'bg-gray-600'
                      }`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {formData.status === 'active' ? '📢 Live Announcement' : '📢 Inactive Announcement'}
                        </p>
                        <p className="text-sm mt-1">
                          {formData.announcement || 'Your announcement text will appear here...'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Website content mock */}
                  <div className="mt-4">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                This is how your announcement will appear to users on the website. 
                {formData.status === 'active' 
                  ? ' The announcement will be prominently displayed at the top of the page.'
                  : ' The announcement will be hidden from users.'}
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
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
                disabled={isSubmitting || !formData.announcement.trim()}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </span>
                ) : 'Create Announcement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAnnouncementPage;