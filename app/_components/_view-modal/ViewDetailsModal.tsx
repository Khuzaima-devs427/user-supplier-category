'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'user' | 'supplier';
  data: any;
}

interface UserAddress {
  country: string;
  state: string;
  city: string;
  streetAddress: string;
  houseNumber: string;
  postalCode: string;
}

interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userType: any;
  supplierCategory?: any;
  address?: UserAddress;
  isBlocked: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  type, 
  data 
}) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && data?.id) {
      fetchUserData(data.id);
    }
  }, [isOpen, data]);

  const fetchUserData = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setUserData(result.data);
        } else {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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

  // Safe category name getter
  const getCategoryName = (category: any): string => {
    if (!category) return 'No Category';
    
    if (typeof category === 'string') {
      return category;
    }
    
    // Handle populated category object
    if (typeof category === 'object') {
      return category.role || category.name || 'Unnamed Category';
    }
    
    return 'No Category';
  };

  // Get category type
  const getCategoryType = (category: any): string => {
    if (!category) return '';
    
    if (typeof category === 'object') {
      return category.categoryType || '';
    }
    
    return '';
  };

  // Get full name
  const getFullName = () => {
    if (userData) {
      return `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    }
    if (data.name) return data.name;
    if (data.firstName && data.lastName) return `${data.firstName} ${data.lastName}`;
    return 'N/A';
  };

  // Get phone number
  const getPhoneNumber = () => {
    if (userData?.phoneNumber) return userData.phoneNumber;
    if (data.phoneNumber) return data.phoneNumber;
    if (data.phone) return data.phone;
    return 'N/A';
  };

  // Get email
  const getEmail = () => {
    if (userData?.email) return userData.email;
    if (data.email) return data.email;
    return 'N/A';
  };

  // Get status
  const getStatus = () => {
    if (userData) return !userData.isBlocked;
    return data.isActive !== false; // Default to active if not specified
  };

  // Get address data
  const getAddress = () => {
    if (userData?.address) return userData.address;
    if (data.address) return data.address;
    if (data.originalAddress) return data.originalAddress;
    return null;
  };

  // Render user details
  const renderUserDetails = () => {
    const address = getAddress();
    const hasAddress = address && (
      address.country || 
      address.state || 
      address.city || 
      address.streetAddress || 
      address.houseNumber || 
      address.postalCode
    );

    return (
      <div className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Full Name</p>
              <p className="text-sm text-gray-900 font-semibold">{getFullName()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Email Address</p>
              <p className="text-sm text-gray-900 font-semibold break-all">{getEmail()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Phone Number</p>
              <p className="text-sm text-gray-900 font-semibold">{getPhoneNumber()}</p>
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* User Role - Full Width */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Role</h3>
          <div className="bg-gray-50 rounded-lg p-4 w-full">
            <p className="text-sm font-medium text-gray-900">
              {getCategoryName(userData?.userType || data.originalCategory || data.userType)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Type: {getCategoryType(userData?.userType || data.originalCategory || data.userType) || 'N/A'}
            </p>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Address Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Details</h3>
          {loading ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Loading address information...</p>
            </div>
          ) : hasAddress ? (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              {/* Location Section */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Location</p>
                <div className="flex flex-wrap gap-2">
                  {address.country && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Country: {address.country}
                    </span>
                  )}
                  {address.state && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      State: {address.state}
                    </span>
                  )}
                  {address.city && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      City: {address.city}
                    </span>
                  )}
                </div>
              </div>

              {/* Street Address Section */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Street Address</p>
                <div className="flex flex-wrap gap-2">
                  {address.streetAddress && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {address.streetAddress}
                      {address.houseNumber && `, ${address.houseNumber}`}
                    </span>
                  )}
                </div>
              </div>

              {/* Postal Code Section */}
              {address.postalCode && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Postal Code</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {address.postalCode}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">No address information available</p>
            </div>
          )}
        </div>

        <hr className="border-gray-200" />

        {/* Status Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                getStatus() ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium">
                {getStatus() ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Email Verification</h3>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                userData?.isEmailVerified ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium">
                {userData?.isEmailVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Timestamps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Created At</p>
            <p className="text-sm text-gray-900">
              {formatDate(userData?.createdAt || data.createdAt)}
            </p>
          </div>
          {(userData?.updatedAt || data.updatedAt) && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-sm text-gray-900">
                {formatDate(userData?.updatedAt || data.updatedAt)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render supplier details
  const renderSupplierDetails = () => {
    const address = getAddress();
    const hasAddress = address && (
      address.country || 
      address.state || 
      address.city || 
      address.streetAddress || 
      address.houseNumber || 
      address.postalCode
    );

    return (
      <div className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Full Name</p>
              <p className="text-sm text-gray-900 font-semibold">{getFullName()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Email Address</p>
              <p className="text-sm text-gray-900 font-semibold break-all">{getEmail()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Phone Number</p>
              <p className="text-sm text-gray-900 font-semibold">{getPhoneNumber()}</p>
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

   {/* User Role and Supplier Category - Side by Side */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* User Role - Left Side */}
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Role</h3>
    <div className="bg-gray-50 rounded-lg p-4 ">
      <p className="text-sm font-medium text-gray-900">
        {getCategoryName(userData?.userType || data.originalCategory || data.userType)}
      </p>
      <p className="text-sm text-gray-600 mt-1">
        Type: {getCategoryType(userData?.userType || data.originalCategory || data.userType) || 'N/A'}
      </p>
    </div>
  </div>

  {/* Supplier Category - Right Side */}
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Category</h3>
    <div className="bg-gray-50 rounded-lg p-4 ">
      <p className="text-sm font-medium text-gray-900">
        {getCategoryName(userData?.supplierCategory || data.supplierCategory)}
      </p>
      {userData?.supplierCategory?.productType && (
        <p className="text-sm text-gray-600 mt-1">
          Product Type: {userData.supplierCategory.productType === 'new' ? 'New Products' : 'Scrap Products'}
        </p>
      )}
    </div>
  </div>
</div>



        <hr className="border-gray-200" />

        {/* Product Categories - Before Address */}
        {userData?.supplierCategory?.productCategories && (
          <>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
              
                <div className="flex flex-wrap gap-2">
                  {userData.supplierCategory.productCategories.map((category: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            
            <hr className="border-gray-200" />
          </>
        )}

        {/* Address Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Details</h3>
          {loading ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Loading address information...</p>
            </div>
          ) : hasAddress ? (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              {/* Location Section */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Location</p>
                <div className="flex flex-wrap gap-2">
                  {address.country && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Country: {address.country}
                    </span>
                  )}
                  {address.state && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      State: {address.state}
                    </span>
                  )}
                  {address.city && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      City: {address.city}
                    </span>
                  )}
                </div>
              </div>

              {/* Street Address Section */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Street Address</p>
                <div className="flex flex-wrap gap-2">
                  {address.streetAddress && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {address.streetAddress}
                      {address.houseNumber && `, ${address.houseNumber}`}
                    </span>
                  )}
                </div>
              </div>

              {/* Postal Code Section */}
              {address.postalCode && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Postal Code</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {address.postalCode}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">No address information available</p>
            </div>
          )}
        </div>

        <hr className="border-gray-200" />

        {/* Status Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                getStatus() ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium">
                {getStatus() ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Email Verification</h3>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                userData?.isEmailVerified ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium">
                {userData?.isEmailVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Timestamps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Created At</p>
            <p className="text-sm text-gray-900">
              {formatDate(userData?.createdAt || data.createdAt)}
            </p>
          </div>
          {(userData?.updatedAt || data.updatedAt) && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-sm text-gray-900">
                {formatDate(userData?.updatedAt || data.updatedAt)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-[3px]">
      <div 
        className="fixed inset-0 transition-opacity"
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
          {/* Header */}
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {type === 'user' ? 'User' : 'Supplier'} Details
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Complete information about this {type}
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
            {type === 'user' ? renderUserDetails() : renderSupplierDetails()}
          </div>

          {/* Footer */}
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

export default ViewDetailsModal;