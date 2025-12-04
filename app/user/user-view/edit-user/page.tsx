// 'use client';

// export const dynamic = 'force-dynamic'

// import React, { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import { useQueryClient } from '@tanstack/react-query';
// import LeafletMap from '../../../_components/_leaflet_map/map';
// import { clientService } from '../../../app/utils/api-client';

// interface Address {
//   country?: string;
//   state?: string;
//   city?: string;
//   streetAddress?: string;
//   houseNumber?: string;
//   postalCode?: string;
//   latitude?: number;
//   longitude?: number;
// }

// interface UserFormData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   userType: string;
//   address: {
//     country: string;
//     state: string;
//     city: string;
//     streetAddress: string;
//     houseNumber: string;
//     postalCode: string;
//     latitude?: number;
//     longitude?: number;
//   };
// }

// interface Category {
//   _id: string;
//   role: string;
//   categoryType: string;
// }

// // API Response interfaces
// interface CategoriesResponse {
//   success: boolean;
//   message: string;
//   data: Category[];
// }

// interface UserResponse {
//   success: boolean;
//   message: string;
//   data: {
//     firstName: string;
//     lastName: string;
//     email: string;
//     phoneNumber: string;
//     userType: any; // Can be string ID or populated object
//     address: {
//       country: string;
//       state: string;
//       city: string;
//       streetAddress: string;
//       houseNumber: string;
//       postalCode: string;
//       coordinates?: {
//         latitude: number;
//         longitude: number;
//       };
//       latitude?: number;
//       longitude?: number;
//     };
//   };
// }

// interface UpdateUserResponse {
//   success: boolean;
//   message: string;
//   data: any;
// }

// const EditUserPage = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const queryClient = useQueryClient();
//   const userId = searchParams.get('id');
  
//   const [isLoading, setIsLoading] = useState(false);
//   const [isFetching, setIsFetching] = useState(true);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loadingCategories, setLoadingCategories] = useState(true);
//   const [selectedLocation, setSelectedLocation] = useState<Address>({});
//   const [formData, setFormData] = useState<UserFormData>({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phoneNumber: '',
//     userType: '',
//     address: {
//       country: '',
//       state: '',
//       city: '',
//       streetAddress: '',
//       houseNumber: '',
//       postalCode: ''
//     }
//   });

//   const countries = [
//     { value: 'United States', label: 'United States' },
//     { value: 'Canada', label: 'Canada' },
//     { value: 'United Kingdom', label: 'United Kingdom' },
//     { value: 'Australia', label: 'Australia' },
//     { value: 'India', label: 'India' },
//     { value: 'Pakistan', label: 'Pakistan' },
//   ];

//   // Fetch user categories from backend - UPDATED: Using clientService
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         console.log('🔄 Fetching user categories...');
        
//         // UPDATED: Using clientService instead of fetch
//         const response = await clientService.get<CategoriesResponse>('/user-categories');
//         const result = response.data;
        
//         if (result.success) {
//           setCategories(result.data || []);
//           console.log(`✅ Loaded ${result.data?.length || 0} user categories`);
//         } else {
//           console.error('❌ Failed to fetch categories:', result.message);
//           setCategories([]);
//         }
//       } catch (error) {
//         console.error('❌ Error fetching categories:', error);
//         setCategories([]);
//       } finally {
//         setLoadingCategories(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   const handleLocationSelect = (address: Address) => {
//     setSelectedLocation(address);
    
//     // Auto-fill the form fields with the selected address
//     setFormData(prev => ({
//       ...prev,
//       address: {
//         ...prev.address,
//         country: address.country || prev.address.country,
//         state: address.state || prev.address.state,
//         city: address.city || prev.address.city,
//         streetAddress: address.streetAddress || prev.address.streetAddress,
//         houseNumber: address.houseNumber || prev.address.houseNumber,
//         postalCode: address.postalCode || prev.address.postalCode,
//         ...(address.latitude && { latitude: address.latitude }),
//         ...(address.longitude && { longitude: address.longitude })
//       }
//     }));
//   };

//   // Fetch user data when component mounts - UPDATED: Using clientService
//   useEffect(() => {
//     const fetchUserData = async () => {
//       if (!userId) {
//         console.log('❌ No user ID provided');
//         setIsFetching(false);
//         return;
//       }

//       try {
//         console.log(`🔄 Fetching user data for ID: ${userId}`);
        
//         // UPDATED: Using clientService instead of fetch
//         const response = await clientService.get<UserResponse>(`/users/${userId}`);
//         const result = response.data;
        
//         console.log('📦 User data response:', result);
        
//         if (result.success && result.data) {
//           const user = result.data;
          
//           // Handle userType - it could be an object (populated) or string (ID)
//           let userTypeValue = '';
//           if (user.userType) {
//             if (typeof user.userType === 'object' && user.userType._id) {
//               userTypeValue = user.userType._id;
//               console.log(`✅ Found populated user type: ${user.userType.role || user.userType.name}`);
//             } else {
//               userTypeValue = user.userType;
//               console.log(`ℹ️ User type is ID: ${userTypeValue}`);
//             }
//           }

//           // Set form data with user data
//           const userFormData = {
//             firstName: user.firstName || '',
//             lastName: user.lastName || '',
//             email: user.email || '',
//             phoneNumber: user.phoneNumber || '',
//             userType: userTypeValue,
//             address: {
//               country: user.address?.country || '',
//               state: user.address?.state || '',
//               city: user.address?.city || '',
//               streetAddress: user.address?.streetAddress || '',
//               houseNumber: user.address?.houseNumber || '',
//               postalCode: user.address?.postalCode || '',
//               latitude: user.address?.coordinates?.latitude || user.address?.latitude,
//               longitude: user.address?.coordinates?.longitude || user.address?.longitude
//             }
//           };

//           setFormData(userFormData);

//           // Set selected location for map
//           if (user.address?.coordinates?.latitude && user.address?.coordinates?.longitude) {
//             setSelectedLocation({
//               latitude: user.address.coordinates.latitude,
//               longitude: user.address.coordinates.longitude,
//               country: user.address.country,
//               state: user.address.state,
//               city: user.address.city,
//               streetAddress: user.address.streetAddress,
//               houseNumber: user.address.houseNumber,
//               postalCode: user.address.postalCode
//             });
//           } else if (user.address?.latitude && user.address?.longitude) {
//             setSelectedLocation({
//               latitude: user.address.latitude,
//               longitude: user.address.longitude,
//               country: user.address.country,
//               state: user.address.state,
//               city: user.address.city,
//               streetAddress: user.address.streetAddress,
//               houseNumber: user.address.houseNumber,
//               postalCode: user.address.postalCode
//             });
//           }

//           console.log('✅ Form data set successfully:', userFormData);
//         } else {
//           throw new Error(result.message || 'Invalid user data');
//         }
//       } catch (error) {
//         console.error('❌ Error fetching user:', error);
//         alert('Error loading user data');
//       } finally {
//         setIsFetching(false);
//       }
//     };

//     fetchUserData();
//   }, [userId]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
    
//     if (name.startsWith('address.')) {
//       const addressField = name.split('.')[1];
//       setFormData(prev => ({
//         ...prev,
//         address: {
//           ...prev.address,
//           [addressField]: value
//         }
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }
//   };

//   // UPDATED: Handle form submission using clientService
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!userId) {
//       alert('No user ID provided');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const userData = {
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         email: formData.email,
//         phoneNumber: formData.phoneNumber,
//         userType: formData.userType,
//         address: {
//           ...formData.address,
//           ...(selectedLocation.latitude && { latitude: selectedLocation.latitude }),
//           ...(selectedLocation.longitude && { longitude: selectedLocation.longitude })
//         }
//       };

//       console.log('🔄 Updating user with data:', {
//         userId,
//         userData,
//         selectedCategory: formData.userType
//       });

//       // UPDATED: Using clientService.put() instead of fetch
//       const response = await clientService.put<UpdateUserResponse>(`/users/${userId}`, userData);
//       const result = response.data;

//       if (result.success) {
//         await queryClient.invalidateQueries({ 
//           queryKey: ['users'], 
//           refetchType: 'active' 
//         });
        
//         alert('✅ User updated successfully!');
//         router.push('/user/user-view');
//       } else {
//         alert(result.message || 'Failed to update user');
//       }
//     } catch (error) {
//       console.error('❌ Error updating user:', error);
//       alert('Error updating user. Please check your connection.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     router.push('/user/user-view');
//   };

//   if (isFetching || loadingCategories) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">
//             {isFetching ? 'Loading user data...' : 'Loading categories...'}
//           </p>
//           <p className="text-sm text-gray-500 mt-2">
//             User ID: {userId}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="bg-white rounded-lg shadow-md">
//           {/* Header */}
//           <div className="px-8 py-6 border-b border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
//                 <p className="mt-1 text-sm text-gray-600">
//                   Update user information with the form below.
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   User ID: {userId}
//                 </p>
//               </div>
//               <Link
//                 href="/user/user-view"
//                 className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 ← Back to Users
//               </Link>
//             </div>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="p-8 space-y-8">
//             {/* Personal Information Section */}
//             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
//               <div className="w-full">
//                 <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
//                   First Name *
//                 </label>
//                 <input
//                   type="text"
//                   id="firstName"
//                   name="firstName"
//                   value={formData.firstName}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                   placeholder="Enter first name"
//                 />
//               </div>

//               <div className="w-full">
//                 <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
//                   Last Name *
//                 </label>
//                 <input
//                   type="text"
//                   id="lastName"
//                   name="lastName"
//                   value={formData.lastName}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                   placeholder="Enter last name"
//                 />
//               </div>
//             </div>
            
//             {/* Contact Information Section */}
//             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
//               <div className="w-full">
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address *
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                   placeholder="Enter email address"
//                 />
//               </div>

//               <div className="w-full">
//                 <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
//                   Phone Number
//                 </label>
//                 <input
//                   type="tel"
//                   id="phoneNumber"
//                   name="phoneNumber"
//                   value={formData.phoneNumber}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                   placeholder="Enter phone number"
//                 />
//               </div>
//             </div>

//             {/* User Category Section */}
//             <div className="w-full">
//               <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-2">
//                 User Category *
//               </label>
//               <select
//                 id="userType"
//                 name="userType"
//                 value={formData.userType}
//                 onChange={handleChange}
//                 required
//                 disabled={categories.length === 0}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
//               >
//                 <option value="">
//                   {categories.length === 0 ? 'No categories available' : 'Select User Category'}
//                 </option>
//                 {categories.map(category => (
//                   <option key={category._id} value={category._id}>
//                     {category.role} ({category.categoryType})
//                   </option>
//                 ))}
//               </select>
//               {categories.length === 0 && (
//                 <p className="mt-1 text-sm text-red-600">
//                   No categories available. Please add user categories first.
//                 </p>
//               )}
//               {formData.userType && (
//                 <p className="mt-1 text-sm text-green-600">
//                   Selected category: {categories.find(cat => cat._id === formData.userType)?.role || 'Unknown'}
//                 </p>
//               )}
//             </div>

//             {/* Address Information Section */}
//             <div>
//               <h3 className="text-lg font-medium text-gray-900 mb-6">Address Information</h3>
              
//               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
//                 <div className="w-full">
//                   <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
//                     Country *
//                   </label>
//                   <select
//                     id="country"
//                     name="address.country"
//                     value={formData.address.country}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                   >
//                     <option value="">Select Country</option>
//                     {countries.map(country => (
//                       <option key={country.value} value={country.value}>
//                         {country.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="w-full">
//                   <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
//                     State/Province *
//                   </label>
//                   <input
//                     type="text"
//                     id="state"
//                     name="address.state"
//                     value={formData.address.state}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     placeholder="Enter state or province"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full mt-6">
//                 <div className="w-full">
//                   <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
//                     City *
//                   </label>
//                   <input
//                     type="text"
//                     id="city"
//                     name="address.city"
//                     value={formData.address.city}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     placeholder="Enter city"
//                   />
//                 </div>

//                 <div className="w-full">
//                   <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-2">
//                     Street Address *
//                   </label>
//                   <input
//                     type="text"
//                     id="streetAddress"
//                     name="address.streetAddress"
//                     value={formData.address.streetAddress}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     placeholder="Enter street address"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full mt-6">
//                 <div className="w-full">
//                   <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700 mb-2">
//                     House Number *
//                   </label>
//                   <input
//                     type="text"
//                     id="houseNumber"
//                     name="address.houseNumber"
//                     value={formData.address.houseNumber}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     placeholder="Enter house number"
//                   />
//                 </div>

//                 <div className="w-full">
//                   <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
//                     Postal Code *
//                   </label>
//                   <input
//                     type="text"
//                     id="postalCode"
//                     name="address.postalCode"
//                     value={formData.address.postalCode}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     placeholder="Enter postal code"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Location Map Section */}
//             <div>
//               <h3 className="text-lg font-medium text-gray-900 mb-4">Location Map</h3>
              
//               <LeafletMap 
//                 onLocationSelect={handleLocationSelect}
//                 initialAddress={selectedLocation}
//               />
//             </div>

//             {/* Form Actions */}
//             <div className="flex justify-end space-x-4 pt-8 w-full">
//               <button
//                 type="button"
//                 onClick={handleCancel}
//                 className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={isLoading || categories.length === 0}
//                 className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isLoading ? 'Updating...' : 'Update User'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditUserPage;
















'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import LeafletMap from '../../../_components/_leaflet_map/map';
import { clientService } from '../../../app/utils/api-client';

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
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userType: string;
  address: {
    country: string;
    state: string;
    city: string;
    streetAddress: string;
    houseNumber: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
  };
}

interface Category {
  _id: string;
  role: string;
  categoryType: string;
}

// API Response interfaces
interface CategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
}

interface UserResponse {
  success: boolean;
  message: string;
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    userType: any; // Can be string ID or populated object
    address: {
      country: string;
      state: string;
      city: string;
      streetAddress: string;
      houseNumber: string;
      postalCode: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
      latitude?: number;
      longitude?: number;
    };
  };
}

interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: any;
}

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Main component that uses useSearchParams
function EditUserContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Address>({});
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    userType: '',
    address: {
      country: '',
      state: '',
      city: '',
      streetAddress: '',
      houseNumber: '',
      postalCode: ''
    }
  });
  const [userId, setUserId] = useState<string | null>(null);

  const countries = [
    { value: 'United States', label: 'United States' },
    { value: 'Canada', label: 'Canada' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Australia', label: 'Australia' },
    { value: 'India', label: 'India' },
    { value: 'Pakistan', label: 'Pakistan' },
  ];

  // Dynamically import useSearchParams inside useEffect
  useEffect(() => {
    const { useSearchParams } = require('next/navigation');
    const searchParams = useSearchParams();
    setUserId(searchParams.get('id'));
  }, []);

  // Fetch user categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('🔄 Fetching user categories...');
        
        const response = await clientService.get<CategoriesResponse>('/user-categories');
        const result = response.data;
        
        if (result.success) {
          setCategories(result.data || []);
          console.log(`✅ Loaded ${result.data?.length || 0} user categories`);
        } else {
          console.error('❌ Failed to fetch categories:', result.message);
          setCategories([]);
        }
      } catch (error) {
        console.error('❌ Error fetching categories:', error);
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
      address: {
        ...prev.address,
        country: address.country || prev.address.country,
        state: address.state || prev.address.state,
        city: address.city || prev.address.city,
        streetAddress: address.streetAddress || prev.address.streetAddress,
        houseNumber: address.houseNumber || prev.address.houseNumber,
        postalCode: address.postalCode || prev.address.postalCode,
        ...(address.latitude && { latitude: address.latitude }),
        ...(address.longitude && { longitude: address.longitude })
      }
    }));
  };

  // Fetch user data when userId is available
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        console.log('❌ No user ID provided');
        setIsFetching(false);
        return;
      }

      try {
        console.log(`🔄 Fetching user data for ID: ${userId}`);
        
        const response = await clientService.get<UserResponse>(`/users/${userId}`);
        const result = response.data;
        
        console.log('📦 User data response:', result);
        
        if (result.success && result.data) {
          const user = result.data;
          
          // Handle userType - it could be an object (populated) or string (ID)
          let userTypeValue = '';
          if (user.userType) {
            if (typeof user.userType === 'object' && user.userType._id) {
              userTypeValue = user.userType._id;
              console.log(`✅ Found populated user type: ${user.userType.role || user.userType.name}`);
            } else {
              userTypeValue = user.userType;
              console.log(`ℹ️ User type is ID: ${userTypeValue}`);
            }
          }

          // Set form data with user data
          const userFormData = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            userType: userTypeValue,
            address: {
              country: user.address?.country || '',
              state: user.address?.state || '',
              city: user.address?.city || '',
              streetAddress: user.address?.streetAddress || '',
              houseNumber: user.address?.houseNumber || '',
              postalCode: user.address?.postalCode || '',
              latitude: user.address?.coordinates?.latitude || user.address?.latitude,
              longitude: user.address?.coordinates?.longitude || user.address?.longitude
            }
          };

          setFormData(userFormData);

          // Set selected location for map
          if (user.address?.coordinates?.latitude && user.address?.coordinates?.longitude) {
            setSelectedLocation({
              latitude: user.address.coordinates.latitude,
              longitude: user.address.coordinates.longitude,
              country: user.address.country,
              state: user.address.state,
              city: user.address.city,
              streetAddress: user.address.streetAddress,
              houseNumber: user.address.houseNumber,
              postalCode: user.address.postalCode
            });
          } else if (user.address?.latitude && user.address?.longitude) {
            setSelectedLocation({
              latitude: user.address.latitude,
              longitude: user.address.longitude,
              country: user.address.country,
              state: user.address.state,
              city: user.address.city,
              streetAddress: user.address.streetAddress,
              houseNumber: user.address.houseNumber,
              postalCode: user.address.postalCode
            });
          }

          console.log('✅ Form data set successfully:', userFormData);
        } else {
          throw new Error(result.message || 'Invalid user data');
        }
      } catch (error) {
        console.error('❌ Error fetching user:', error);
        alert('Error loading user data');
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('No user ID provided');
      return;
    }

    setIsLoading(true);
    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        userType: formData.userType,
        address: {
          ...formData.address,
          ...(selectedLocation.latitude && { latitude: selectedLocation.latitude }),
          ...(selectedLocation.longitude && { longitude: selectedLocation.longitude })
        }
      };

      console.log('🔄 Updating user with data:', {
        userId,
        userData,
        selectedCategory: formData.userType
      });

      const response = await clientService.put<UpdateUserResponse>(`/users/${userId}`, userData);
      const result = response.data;

      if (result.success) {
        await queryClient.invalidateQueries({ 
          queryKey: ['users'], 
          refetchType: 'active' 
        });
        
        alert('✅ User updated successfully!');
        router.push('/user/user-view');
      } else {
        alert(result.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('❌ Error updating user:', error);
      alert('Error updating user. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/user/user-view');
  };

  if (!userId || isFetching || loadingCategories) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {!userId ? 'Loading...' : 
             isFetching ? 'Loading user data...' : 
             'Loading categories...'}
          </p>
          {userId && (
            <p className="text-sm text-gray-500 mt-2">
              User ID: {userId}
            </p>
          )}
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
                <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Update user information with the form below.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  User ID: {userId}
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

            {/* User Category Section */}
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
                disabled={categories.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              >
                <option value="">
                  {categories.length === 0 ? 'No categories available' : 'Select User Category'}
                </option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.role} ({category.categoryType})
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  No categories available. Please add user categories first.
                </p>
              )}
              {formData.userType && (
                <p className="mt-1 text-sm text-green-600">
                  Selected category: {categories.find(cat => cat._id === formData.userType)?.role || 'Unknown'}
                </p>
              )}
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
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter state or province"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full mt-6">
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
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full mt-6">
                <div className="w-full">
                  <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    House Number *
                  </label>
                  <input
                    type="text"
                    id="houseNumber"
                    name="address.houseNumber"
                    value={formData.address.houseNumber}
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
                    name="address.postalCode"
                    value={formData.address.postalCode}
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
            <div className="flex justify-end space-x-4 pt-8 w-full">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || categories.length === 0}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Main page export with Suspense boundary
export default function EditUserPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EditUserContent />
    </Suspense>
  );
}