'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SupplierFormData {
  Name: {
    firstName: string;
    lastName: string;
  };
  email: string;
  phone: string;
  category: string;
  isActive: boolean;
  address: {
    country: string;
    city: string;
    streetAddress: string;
    houseNumber: number;
    postalCode: number;
  };
}

const EditSupplierPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supplierId = searchParams.get('id');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState<SupplierFormData>({
    Name: {
      firstName: '',
      lastName: ''
    },
    email: '',
    phone: '',
    category: 'other',
    isActive: true,
    address: {
      country: '',
      city: '',
      streetAddress: '',
      houseNumber: 0,
      postalCode: 0
    }
  });

  const supplierCategories = [
    { value: 'mobile_supplier', label: 'Mobile Supplier' },
    { value: 'charger_supplier', label: 'Charger Supplier' },
    { value: 'laptop_supplier', label: 'Laptop Supplier' },
    { value: 'pc_supplier', label: 'PC Supplier' },
    { value: 'other', label: 'Other' },
  ];

  const countries = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
    { value: 'in', label: 'India' },
  ];

  // Fetch supplier data when component mounts
  useEffect(() => {
    const fetchSupplierData = async () => {
      if (!supplierId) {
        setIsFetching(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/suppliers/${supplierId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch supplier data');
        }
        
        const result = await response.json();
        if (result.success && result.data) {
          const supplier = result.data;
          setFormData({
            Name: supplier.Name || { firstName: '', lastName: '' },
            email: supplier.email || '',
            phone: supplier.phone || '',
            category: supplier.category || 'other',
            isActive: supplier.isActive !== undefined ? supplier.isActive : true,
            address: supplier.address || {
              country: '',
              city: '',
              streetAddress: '',
              houseNumber: 0,
              postalCode: 0
            }
          });
        }
      } catch (error) {
        console.error('Error fetching supplier:', error);
        alert('Error loading supplier data');
      } finally {
        setIsFetching(false);
      }
    };

    fetchSupplierData();
  }, [supplierId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('Name.')) {
      const nameField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        Name: {
          ...prev.Name,
          [nameField]: value
        }
      }));
    } else if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: type === 'number' ? Number(value) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return;

    setIsLoading(true);
    try {
      const supplierData = {
        Name: formData.Name,
        email: formData.email,
        phone: formData.phone,
        category: formData.category,
        isActive: formData.isActive,
        address: formData.address
      };

      const response = await fetch(`http://localhost:5000/api/suppliers/${supplierId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Supplier updated successfully!');
        router.push('/supplier');
      } else {
        alert(result.message || 'Failed to update supplier');
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      alert('Error updating supplier. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/supplier');
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading supplier data...</p>
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Supplier</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Update supplier information with the form below.
                </p>
              </div>
              <Link
                href="/supplier"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                ← Back to Suppliers
              </Link>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Contact Person Information Section */}
           
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
                <div className="w-full">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="Name.firstName"
                    value={formData.Name.firstName}
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
                    name="Name.lastName"
                    value={formData.Name.lastName}
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
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Category and Status Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
              <div className="w-full">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Supplier Category</option>
                  {supplierCategories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full flex items-center">
                <div className="flex items-center h-10">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active Supplier
                  </label>
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Address Information</h3>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
                <div className="w-full">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    id="country"
                    name="address.country"
                    value={formData.address.country}
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
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter city"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full mt-6">
                <div className="w-full">
                  <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="streetAddress"
                    name="address.streetAddress"
                    value={formData.address.streetAddress}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter street address"
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    House Number *
                  </label>
                  <input
                    type="number"
                    id="houseNumber"
                    name="address.houseNumber"
                    value={formData.address.houseNumber}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter house number"
                  />
                </div>
              </div>

              <div className="w-full mt-6">
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code *
                </label>
                <input
                  type="number"
                  id="postalCode"
                  name="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter postal code"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 w-full">
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Supplier'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSupplierPage;