'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import LeafletMap from '../../../_components/_leaflet_map/map';
import Link from 'next/link';

interface Address {
  country?: string;
  state?: string;
  city?: string;
  streetAddress?: string;
  houseNumber?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

interface UserFormData {
  userType: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  country: string;
  state: string;
  city: string;
  streetAddress: string;
  houseNumber: string;
  postalCode: string;
}

interface Category {
  _id: string;
  role: string;
  categoryType: string;
}

const AddUserPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Address>({});
  const [formData, setFormData] = useState<UserFormData>({
    userType: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    country: '',
    state: '',
    city: '',
    streetAddress: '',
    houseNumber: '',
    postalCode: '',
  });

  const countries = [
    { value: 'United States', label: 'United States' },
    { value: 'Canada', label: 'Canada' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Australia', label: 'Australia' },
    { value: 'India', label: 'India' },
    { value: 'Pakistan', label: 'Pakistan' },
  ];

  // Fetch user categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user-categories');
        const result = await response.json();
        
        if (response.ok && result.success) {
          setCategories(result.data || []);
        } else {
          console.error('Failed to fetch categories:', result.message);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleLocationSelect = (address: Address) => {
    setSelectedLocation(address);
    
    // Auto-fill the form fields with the selected address
    setFormData(prev => ({
      ...prev,
      country: address.country || prev.country,
      state: address.state || prev.state,
      city: address.city || prev.city,
      streetAddress: address.streetAddress || prev.streetAddress,
      houseNumber: address.houseNumber || prev.houseNumber,
      postalCode: address.postalCode || prev.postalCode,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      setIsLoading(false);
      return;
    }

    try {
      // Transform data to match backend schema
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        userType: formData.userType,
        address: {
          country: formData.country,
          state: formData.state,
          city: formData.city,
          streetAddress: formData.streetAddress,
          houseNumber: formData.houseNumber,
          postalCode: formData.postalCode,
          // Include coordinates if available
          ...(selectedLocation.latitude && selectedLocation.longitude && {
            coordinates: {
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude
            }
          })
        }
      };

      console.log('Sending user data:', userData);

      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Force immediate refetch of users data
        await queryClient.invalidateQueries({ 
          queryKey: ['users'], 
          refetchType: 'active' 
        });
        
        alert('User created successfully!');
        router.push('/user/user-view');
      } else {
        alert(result.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/user/user-view');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          {/* <div className="px-8 py-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
            <p className="mt-1 text-sm text-gray-600">
              Create a new user account with the form below.
            </p>
          </div> */}
                    <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Create a new user account with the form below.
                </p>
              </div>
              <Link
                href="/user/user-view"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                ← Back to Users
              </Link>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* User Category */}
            <div className="w-full">
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-2">
                User Category *
              </label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                required
                disabled={loadingCategories}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              >
                <option value="">
                  {loadingCategories ? 'Loading categories...' : 'Select User Category'}
                </option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.role} ({category.categoryType})
                  </option>
                ))}
              </select>
              {categories.length === 0 && !loadingCategories && (
                <p className="mt-1 text-sm text-red-600">
                  No categories available. Please add categories first.
                </p>
              )}
            </div>

            {/* Personal Information Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
              <div className="w-full">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter first name"
                />
              </div>

              <div className="w-full">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
              <div className="w-full">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter email address"
                />
              </div>

              <div className="w-full">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
              <div className="w-full">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter password"
                />
              </div>

              <div className="w-full">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">Address Details</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Fill in the address details manually or use the map below to select a location.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
                <div className="w-full">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full">
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter state or province"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
                <div className="w-full">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter city"
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="streetAddress"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter street address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
                <div className="w-full">
                  <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    House Number *
                  </label>
                  <input
                    type="text"
                    id="houseNumber"
                    name="houseNumber"
                    value={formData.houseNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter house number"
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
            </div>

            {/* Location Map Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location Map</h3>
              
              <LeafletMap 
                onLocationSelect={handleLocationSelect}
                initialAddress={selectedLocation}
              />
            </div>

            {/* Form Actions */}
            {/* className="flex justify-end space-x-4 pt-8 border-t border-gray-200 w-full" */}
            <div className = "flex justify-end space-x-4 pt-6 w-full">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || loadingCategories || categories.length === 0}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserPage;