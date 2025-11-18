'use client';

import React from 'react';

// Define props interfaces for both filters
interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface EmailStatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface CategoryStatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// User Status Filter Component
export const UserStatusFilter: React.FC<StatusFilterProps> = ({
  value,
  onChange,
  placeholder = "Select User Status"
}) => {
  return (
    <div className="w-full sm:w-48">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        User Status
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="">All Users</option>
        <option value="active">Active</option>
        <option value="blocked">Blocked</option>
      </select>
    </div>
  );
};

// Email Status Filter Component
export const EmailStatusFilter: React.FC<EmailStatusFilterProps> = ({
  value,
  onChange,
  placeholder = "Select Email Status"
}) => {
  return (
    <div className="w-full sm:w-48">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Email Status
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="">All Emails</option>
        <option value="verified">Verified</option>
        <option value="not_verified">Not Verified</option>
      </select>
    </div>
  );
};

// Category Type Filter Component
export const CategoryTypeFilter: React.FC<CategoryStatusFilterProps> = ({
  value,
  onChange,
  placeholder = "Select Category Type"
}) => {
  return (
    <div className="w-full sm:w-48">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Category Type
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="">All Types</option>
        <option value="admin">Admin</option>
        <option value="customer">Customer</option>
        <option value="supplier">Supplier</option>
        <option value="other">Other</option>
      </select>
    </div>
  );
};

// Default export for backward compatibility
const StatusFilter = UserStatusFilter;
export default StatusFilter;