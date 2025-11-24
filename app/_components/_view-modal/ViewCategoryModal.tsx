'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ViewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

const ViewCategoryModal: React.FC<ViewCategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  data 
}) => {
  if (!isOpen || !data) return null;

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

  // Get status badge style
  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'
      : 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800';
  };

  // Get type badge style
  const getTypeBadge = (type: string) => {
    const typeStyles: { [key: string]: string } = {
      income: 'bg-blue-100 text-blue-800',
      expense: 'bg-orange-100 text-orange-800',
      transfer: 'bg-purple-100 text-purple-800',
      default: 'bg-gray-100 text-gray-800'
    };
    
    const style = typeStyles[type?.toLowerCase()] || typeStyles.default;
    return `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style}`;
  };

  // Get role badge style
  const getRoleBadge = (role: string) => {
    const roleStyles: { [key: string]: string } = {
      admin: 'bg-red-100 text-red-800',
      user: 'bg-green-100 text-green-800',
      manager: 'bg-yellow-100 text-yellow-800',
      default: 'bg-gray-100 text-gray-800'
    };
    
    const style = roleStyles[role?.toLowerCase()] || roleStyles.default;
    return `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-[3px]">
      {/* Background overlay */}
      <div 
        className="fixed inset-0  bg-opacity-50 transition-opacity"
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
                  Category Details
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Complete information about this category
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
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Category Name</p>
                    <p className="text-sm text-gray-900 font-semibold">{data.role || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Category ID</p>
                    <p className="text-sm text-gray-900 font-mono">{data.id || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Category Type & Role */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Type</p>
                    <div className="flex items-center">
                      <span className={getTypeBadge(data.type)}>
                        {data.type ? data.type.charAt(0).toUpperCase() + data.type.slice(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Role</p>
                    <div className="flex items-center">
                      <span className={getRoleBadge(data.role)}>
                        {data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">
                    {data.description || 'No description provided'}
                  </p>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Status Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Category Status</p>
                    <div className="flex items-center">
                      <span className={getStatusBadge(true)}>
                        Active
                      </span>
                    </div>
                  </div>
                  
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timestamps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Created At</p>
                    <p className="text-sm text-gray-900">{data.createdAt ? formatDate(data.createdAt) : 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Last Updated</p>
                    <p className="text-sm text-gray-900">{data.updatedAt ? formatDate(data.updatedAt) : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <hr className="border-gray-200" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-600">Serial Number</p>
                      <p className="text-sm text-blue-900 font-semibold">{data.serialNo || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-600">Database ID</p>
                      <p className="text-sm text-blue-900 font-mono">{data.id || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

export default ViewCategoryModal;