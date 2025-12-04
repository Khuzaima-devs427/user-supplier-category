// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import { useQueryClient } from '@tanstack/react-query';
// import LeafletMap from '../../../_components/_leaflet_map/map';

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

// interface SupplierFormData {
//   supplierCategory: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   country: string;
//   state: string;
//   city: string;
//   streetAddress: string;
//   houseNumber: string;
//   postalCode: string;
// }

// interface SupplierCategory {
//   _id: string;
//   name: string;
//   description: string;
// }

// const EditSupplierPage = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const queryClient = useQueryClient();
//   const supplierId = searchParams.get('id');
  
//   const [isLoading, setIsLoading] = useState(false);
//   const [isFetching, setIsFetching] = useState(true);
//   const [supplierCategories, setSupplierCategories] = useState<SupplierCategory[]>([]);
//   const [loadingSupplierCategories, setLoadingSupplierCategories] = useState(true);
//   const [selectedLocation, setSelectedLocation] = useState<Address>({});
//   const [formData, setFormData] = useState<SupplierFormData>({
//     supplierCategory: '',
//     firstName: '',
//     lastName: '',
//     email: '',
//     phoneNumber: '',
//     country: '',
//     state: '',
//     city: '',
//     streetAddress: '',
//     houseNumber: '',
//     postalCode: '',
//   });

//   const countries = [
//     { value: 'United States', label: 'United States' },
//     { value: 'Canada', label: 'Canada' },
//     { value: 'United Kingdom', label: 'United Kingdom' },
//     { value: 'Australia', label: 'Australia' },
//     { value: 'India', label: 'India' },
//     { value: 'Pakistan', label: 'Pakistan' },
//   ];

//   // Fetch supplier categories from backend
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         console.log('🔄 Fetching supplier categories...');
//         const response = await fetch('http://localhost:5000/api/supplier-categories?status=active');
//         const result = await response.json();
        
//         console.log('📦 Supplier categories response:', result);
        
//         if (response.ok && result.success) {
//           setSupplierCategories(result.data || []);
//           console.log(`✅ Loaded ${result.data?.length || 0} supplier categories`);
//         } else {
//           console.error('❌ Failed to fetch categories:', result.message);
//           setSupplierCategories([]);
//         }
//       } catch (error) {
//         console.error('❌ Error fetching categories:', error);
//         setSupplierCategories([]);
//       } finally {
//         setLoadingSupplierCategories(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   const handleLocationSelect = (address: Address) => {
//     setSelectedLocation(address);
    
//     // Auto-fill the form fields with the selected address
//     setFormData(prev => ({
//       ...prev,
//       country: address.country || prev.country,
//       state: address.state || prev.state,
//       city: address.city || prev.city,
//       streetAddress: address.streetAddress || prev.streetAddress,
//       houseNumber: address.houseNumber || prev.houseNumber,
//       postalCode: address.postalCode || prev.postalCode,
//     }));
//   };

//   // Fetch supplier data when component mounts
//   useEffect(() => {
//     const fetchSupplierData = async () => {
//       if (!supplierId) {
//         console.log('❌ No supplier ID provided');
//         setIsFetching(false);
//         return;
//       }

//       try {
//         console.log(`🔄 Fetching supplier data for ID: ${supplierId}`);
        
//         // Use the general users endpoint since suppliers are stored in users table
//         const response = await fetch(`http://localhost:5000/api/users/${supplierId}`);
        
//         if (!response.ok) {
//           throw new Error(`Failed to fetch supplier data: ${response.status}`);
//         }
        
//         const result = await response.json();
//         console.log('📦 Supplier data response:', result);
        
//         if (result.success && result.data) {
//           const supplier = result.data;
          
//           console.log('🔍 Raw supplier data:', {
//             supplierCategory: supplier.supplierCategory,
//             userType: supplier.userType,
//             address: supplier.address
//           });

//           // Handle supplier category - it could be an object (populated) or string (ID)
//           let supplierCategoryValue = '';
//           if (supplier.supplierCategory) {
//             if (typeof supplier.supplierCategory === 'object' && supplier.supplierCategory._id) {
//               supplierCategoryValue = supplier.supplierCategory._id;
//               console.log(`✅ Found populated supplier category: ${supplier.supplierCategory.name}`);
//             } else {
//               supplierCategoryValue = supplier.supplierCategory;
//               console.log(`ℹ️ Supplier category is ID: ${supplierCategoryValue}`);
//             }
//           } else {
//             console.log('❌ No supplier category found for this supplier');
//           }

//           // Handle address data
//           const address = supplier.address || {};
//           console.log('🏠 Address data:', address);
          
//           // Set form data
//           const newFormData = {
//             supplierCategory: supplierCategoryValue,
//             firstName: supplier.firstName || '',
//             lastName: supplier.lastName || '',
//             email: supplier.email || '',
//             phoneNumber: supplier.phoneNumber || '',
//             country: address.country || '',
//             state: address.state || '',
//             city: address.city || '',
//             streetAddress: address.streetAddress || '',
//             houseNumber: address.houseNumber || '',
//             postalCode: address.postalCode || ''
//           };

//           setFormData(newFormData);

//           // Set selected location for map
//           if (address.coordinates?.latitude && address.coordinates?.longitude) {
//             setSelectedLocation({
//               latitude: address.coordinates.latitude,
//               longitude: address.coordinates.longitude,
//               country: address.country,
//               state: address.state,
//               city: address.city,
//               streetAddress: address.streetAddress,
//               houseNumber: address.houseNumber,
//               postalCode: address.postalCode
//             });
//           } else if (address.latitude && address.longitude) {
//             setSelectedLocation({
//               latitude: address.latitude,
//               longitude: address.longitude,
//               country: address.country,
//               state: address.state,
//               city: address.city,
//               streetAddress: address.streetAddress,
//               houseNumber: address.houseNumber,
//               postalCode: address.postalCode
//             });
//           }

//           console.log('✅ Form data set successfully:', newFormData);
//         } else {
//           throw new Error(result.message || 'Invalid supplier data');
//         }
//       } catch (error) {
//         console.error('❌ Error fetching supplier:', error);
//         alert(`Error loading supplier data: ${error instanceof Error ? error.message : 'Unknown error'}`);
//       } finally {
//         setIsFetching(false);
//       }
//     };

//     fetchSupplierData();
//   }, [supplierId]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!supplierId) {
//       alert('No supplier ID provided');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       // Transform data to match backend schema
//       const supplierData = {
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         email: formData.email,
//         phoneNumber: formData.phoneNumber,
//         supplierCategory: formData.supplierCategory,
//         address: {
//           country: formData.country,
//           state: formData.state,
//           city: formData.city,
//           streetAddress: formData.streetAddress,
//           houseNumber: formData.houseNumber,
//           postalCode: formData.postalCode,
//           // Include coordinates if available
//           ...(selectedLocation.latitude && selectedLocation.longitude && {
//             coordinates: {
//               latitude: selectedLocation.latitude,
//               longitude: selectedLocation.longitude
//             }
//           })
//         }
//       };

//       console.log('🔄 Updating supplier with data:', {
//         supplierId,
//         supplierData,
//         selectedCategory: formData.supplierCategory
//       });

//       // Using the general users endpoint for update
//       const response = await fetch(`http://localhost:5000/api/users/${supplierId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(supplierData),
//       });

//       const result = await response.json();
//       console.log('📨 Update response:', result);

//       if (response.ok && result.success) {
//         console.log('✅ Supplier updated successfully');
        
//         // Force immediate refetch of suppliers data
//         await queryClient.invalidateQueries({ 
//           queryKey: ['suppliers'], 
//           refetchType: 'active' 
//         });
        
//         alert('Supplier updated successfully!');
//         router.push('/supplier/view-suppliers');
//       } else {
//         console.error('❌ Update failed:', result.message);
//         alert(result.message || 'Failed to update supplier');
//       }
//     } catch (error) {
//       console.error('❌ Error updating supplier:', error);
//       alert(`Error updating supplier: ${error instanceof Error ? error.message : 'Please check your connection.'}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     router.push('/supplier/view-suppliers');
//   };

//   if (isFetching || loadingSupplierCategories) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">
//             {isFetching ? 'Loading supplier data...' : 'Loading categories...'}
//           </p>
//           <p className="text-sm text-gray-500 mt-2">
//             Supplier ID: {supplierId}
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
//                 <h1 className="text-2xl font-bold text-gray-900">Edit Supplier</h1>
//                 <p className="mt-1 text-sm text-gray-600">
//                   Update supplier information with the form below.
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Supplier ID: {supplierId}
//                 </p>
//               </div>
//               <Link
//                 href="/supplier/view-suppliers"
//                 className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 ← Back to Supplier
//               </Link>
//             </div>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="p-8 space-y-8">
//             {/* Supplier Category */}
//             <div>
//               <label htmlFor="supplierCategory" className="block text-sm font-medium text-gray-700 mb-2">
//                 Supplier Category *
//               </label>
//               <select
//                 id="supplierCategory"
//                 name="supplierCategory"
//                 value={formData.supplierCategory}
//                 onChange={handleChange}
//                 required
//                 disabled={loadingSupplierCategories}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
//               >
//                 <option value="">
//                   {loadingSupplierCategories ? 'Loading categories...' : 'Select Supplier Category'}
//                 </option>
//                 {supplierCategories.map(category => (
//                   <option key={category._id} value={category._id}>
//                     {category.name}
//                   </option>
//                 ))}
//               </select>
//               {supplierCategories.length === 0 && !loadingSupplierCategories && (
//                 <p className="mt-1 text-sm text-red-600">
//                   No supplier categories available. Please add supplier categories first.
//                 </p>
//               )}
//               {formData.supplierCategory && (
//                 <p className="mt-1 text-sm text-green-600">
//                   Selected category: {supplierCategories.find(cat => cat._id === formData.supplierCategory)?.name || 'Unknown'}
//                 </p>
//               )}
//             </div>

//             {/* Personal Information Section */}
//             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
//               <div>
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

//               <div>
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
//               <div>
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

//               <div>
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

//             {/* Address Information Section */}
//             <div className="space-y-6">
//               <div className="border-b border-gray-200 pb-4">
//                 <h3 className="text-lg font-medium text-gray-900">Address Details</h3>
//                 <p className="mt-1 text-sm text-gray-600">
//                   Fill in the address details manually or use the map below to select a location.
//                 </p>
//               </div>

//               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
//                 <div>
//                   <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
//                     Country *
//                   </label>
//                   <select
//                     id="country"
//                     name="country"
//                     value={formData.country}
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

//                 <div>
//                   <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
//                     State/Province *
//                   </label>
//                   <input
//                     type="text"
//                     id="state"
//                     name="state"
//                     value={formData.state}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     placeholder="Enter state or province"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
//                 <div>
//                   <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
//                     City *
//                   </label>
//                   <input
//                     type="text"
//                     id="city"
//                     name="city"
//                     value={formData.city}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     placeholder="Enter city"
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-2">
//                     Street Address *
//                   </label>
//                   <input
//                     type="text"
//                     id="streetAddress"
//                     name="streetAddress"
//                     value={formData.streetAddress}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     placeholder="Enter street address"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
//                 <div>
//                   <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700 mb-2">
//                     House Number *
//                   </label>
//                   <input
//                     type="text"
//                     id="houseNumber"
//                     name="houseNumber"
//                     value={formData.houseNumber}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     placeholder="Enter house number"
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
//                     Postal Code *
//                   </label>
//                   <input
//                     type="text"
//                     id="postalCode"
//                     name="postalCode"
//                     value={formData.postalCode}
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
//             <div className="flex justify-end space-x-4 pt-8  w-full">
//               <button
//                 type="button"
//                 onClick={handleCancel}
//                 className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={isLoading || loadingSupplierCategories || supplierCategories.length === 0 || !formData.supplierCategory}
//                 className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isLoading ? 'Updating...' : 'Update Supplier'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditSupplierPage;












// 'use client';

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

// interface SupplierFormData {
//   supplierCategory: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   country: string;
//   state: string;
//   city: string;
//   streetAddress: string;
//   houseNumber: string;
//   postalCode: string;
// }

// interface SupplierCategory {
//   _id: string;
//   name: string;
//   description: string;
// }

// // API Response interface
// interface ApiResponse<T = any> {
//   success: boolean;
//   message: string;
//   data: T;
// }

// const EditSupplierPage = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const queryClient = useQueryClient();
//   const supplierId = searchParams.get('id');
  
//   const [isLoading, setIsLoading] = useState(false);
//   const [isFetching, setIsFetching] = useState(true);
//   const [supplierCategories, setSupplierCategories] = useState<SupplierCategory[]>([]);
//   const [loadingSupplierCategories, setLoadingSupplierCategories] = useState(true);
//   const [selectedLocation, setSelectedLocation] = useState<Address>({});
//   const [formData, setFormData] = useState<SupplierFormData>({
//     supplierCategory: '',
//     firstName: '',
//     lastName: '',
//     email: '',
//     phoneNumber: '',
//     country: '',
//     state: '',
//     city: '',
//     streetAddress: '',
//     houseNumber: '',
//     postalCode: '',
//   });

//   const countries = [
//     { value: 'United States', label: 'United States' },
//     { value: 'Canada', label: 'Canada' },
//     { value: 'United Kingdom', label: 'United Kingdom' },
//     { value: 'Australia', label: 'Australia' },
//     { value: 'India', label: 'India' },
//     { value: 'Pakistan', label: 'Pakistan' },
//   ];

//   // Fetch supplier categories from backend - UPDATED: Using clientService
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         console.log('🔄 Fetching supplier categories...');
//         const response = await clientService.get<ApiResponse<SupplierCategory[]>>('/supplier-categories?status=active');
//         const result = response.data;
        
//         console.log('📦 Supplier categories response:', result);
        
//         if (result.success) {
//           setSupplierCategories(result.data || []);
//           console.log(`✅ Loaded ${result.data?.length || 0} supplier categories`);
//         } else {
//           console.error('❌ Failed to fetch categories:', result.message);
//           setSupplierCategories([]);
//         }
//       } catch (error) {
//         console.error('❌ Error fetching categories:', error);
//         setSupplierCategories([]);
//       } finally {
//         setLoadingSupplierCategories(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   const handleLocationSelect = (address: Address) => {
//     setSelectedLocation(address);
    
//     // Auto-fill the form fields with the selected address
//     setFormData(prev => ({
//       ...prev,
//       country: address.country || prev.country,
//       state: address.state || prev.state,
//       city: address.city || prev.city,
//       streetAddress: address.streetAddress || prev.streetAddress,
//       houseNumber: address.houseNumber || prev.houseNumber,
//       postalCode: address.postalCode || prev.postalCode,
//     }));
//   };

//   // Fetch supplier data when component mounts - UPDATED: Using clientService
//   useEffect(() => {
//     const fetchSupplierData = async () => {
//       if (!supplierId) {
//         console.log('❌ No supplier ID provided');
//         setIsFetching(false);
//         return;
//       }

//       try {
//         console.log(`🔄 Fetching supplier data for ID: ${supplierId}`);
        
//         // Use the general users endpoint since suppliers are stored in users table
//         const response = await clientService.get<ApiResponse>(`/users/${supplierId}`);
//         const result = response.data;
        
//         console.log('📦 Supplier data response:', result);
        
//         if (result.success && result.data) {
//           const supplier = result.data;
          
//           console.log('🔍 Raw supplier data:', {
//             supplierCategory: supplier.supplierCategory,
//             userType: supplier.userType,
//             address: supplier.address
//           });

//           // Handle supplier category - it could be an object (populated) or string (ID)
//           let supplierCategoryValue = '';
//           if (supplier.supplierCategory) {
//             if (typeof supplier.supplierCategory === 'object' && supplier.supplierCategory._id) {
//               supplierCategoryValue = supplier.supplierCategory._id;
//               console.log(`✅ Found populated supplier category: ${supplier.supplierCategory.name}`);
//             } else {
//               supplierCategoryValue = supplier.supplierCategory;
//               console.log(`ℹ️ Supplier category is ID: ${supplierCategoryValue}`);
//             }
//           } else {
//             console.log('❌ No supplier category found for this supplier');
//           }

//           // Handle address data
//           const address = supplier.address || {};
//           console.log('🏠 Address data:', address);
          
//           // Set form data
//           const newFormData = {
//             supplierCategory: supplierCategoryValue,
//             firstName: supplier.firstName || '',
//             lastName: supplier.lastName || '',
//             email: supplier.email || '',
//             phoneNumber: supplier.phoneNumber || '',
//             country: address.country || '',
//             state: address.state || '',
//             city: address.city || '',
//             streetAddress: address.streetAddress || '',
//             houseNumber: address.houseNumber || '',
//             postalCode: address.postalCode || ''
//           };

//           setFormData(newFormData);

//           // Set selected location for map
//           if (address.coordinates?.latitude && address.coordinates?.longitude) {
//             setSelectedLocation({
//               latitude: address.coordinates.latitude,
//               longitude: address.coordinates.longitude,
//               country: address.country,
//               state: address.state,
//               city: address.city,
//               streetAddress: address.streetAddress,
//               houseNumber: address.houseNumber,
//               postalCode: address.postalCode
//             });
//           } else if (address.latitude && address.longitude) {
//             setSelectedLocation({
//               latitude: address.latitude,
//               longitude: address.longitude,
//               country: address.country,
//               state: address.state,
//               city: address.city,
//               streetAddress: address.streetAddress,
//               houseNumber: address.houseNumber,
//               postalCode: address.postalCode
//             });
//           }

//           console.log('✅ Form data set successfully:', newFormData);
//         } else {
//           throw new Error(result.message || 'Invalid supplier data');
//         }
//       } catch (error) {
//         console.error('❌ Error fetching supplier:', error);
//         alert(`Error loading supplier data: ${error instanceof Error ? error.message : 'Unknown error'}`);
//       } finally {
//         setIsFetching(false);
//       }
//     };

//     fetchSupplierData();
//   }, [supplierId]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // UPDATED: Handle form submission using clientService
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!supplierId) {
//       alert('No supplier ID provided');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       // Transform data to match backend schema
//       const supplierData = {
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         email: formData.email,
//         phoneNumber: formData.phoneNumber,
//         supplierCategory: formData.supplierCategory,
//         address: {
//           country: formData.country,
//           state: formData.state,
//           city: formData.city,
//           streetAddress: formData.streetAddress,
//           houseNumber: formData.houseNumber,
//           postalCode: formData.postalCode,
//           // Include coordinates if available
//           ...(selectedLocation.latitude && selectedLocation.longitude && {
//             coordinates: {
//               latitude: selectedLocation.latitude,
//               longitude: selectedLocation.longitude
//             }
//           })
//         }
//       };

//       console.log('🔄 Updating supplier with data:', {
//         supplierId,
//         supplierData,
//         selectedCategory: formData.supplierCategory
//       });

//       // Using the general users endpoint for update
//       const response = await clientService.put<ApiResponse>(`/users/${supplierId}`, supplierData);
//       const result = response.data;
      
//       console.log('📨 Update response:', result);

//       if (result.success) {
//         console.log('✅ Supplier updated successfully');
        
//         // Force immediate refetch of suppliers data
//         await queryClient.invalidateQueries({ 
//           queryKey: ['suppliers'], 
//           refetchType: 'active' 
//         });
        
//         alert('Supplier updated successfully!');
//         router.push('/supplier/view-suppliers');
//       } else {
//         console.error('❌ Update failed:', result.message);
//         alert(result.message || 'Failed to update supplier');
//       }
//     } catch (error) {
//       console.error('❌ Error updating supplier:', error);
//       alert(`Error updating supplier: ${error instanceof Error ? error.message : 'Please check your connection.'}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     router.push('/supplier/view-suppliers');
//   };

//   if (isFetching || loadingSupplierCategories) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">
//             {isFetching ? 'Loading supplier data...' : 'Loading categories...'}
//           </p>
//           <p className="text-sm text-gray-500 mt-2">
//             Supplier ID: {supplierId}
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
//                 <h1 className="text-2xl font-bold text-gray-900">Edit Supplier</h1>
//                 <p className="mt-1 text-sm text-gray-600">
//                   Update supplier information with the form below.
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Supplier ID: {supplierId}
//                 </p>
//               </div>
//               <Link
//                 href="/supplier/view-suppliers"
//                 className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 ← Back to Supplier
//               </Link>
//             </div>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="p-8 space-y-8">
//             {/* Supplier Category */}
//             <div>
//               <label htmlFor="supplierCategory" className="block text-sm font-medium text-gray-700 mb-2">
//                 Supplier Category *
//               </label>
//               <select
//                 id="supplierCategory"
//                 name="supplierCategory"
//                 value={formData.supplierCategory}
//                 onChange={handleChange}
//                 required
//                 disabled={loadingSupplierCategories}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
//               >
//                 <option value="">
//                   {loadingSupplierCategories ? 'Loading categories...' : 'Select Supplier Category'}
//                 </option>
//                 {supplierCategories.map(category => (
//                   <option key={category._id} value={category._id}>
//                     {category.name}
//                   </option>
//                 ))}
//               </select>
//               {supplierCategories.length === 0 && !loadingSupplierCategories && (
//                 <p className="mt-1 text-sm text-red-600">
//                   No supplier categories available. Please add supplier categories first.
//                 </p>
//               )}
//               {formData.supplierCategory && (
//                 <p className="mt-1 text-sm text-green-600">
//                   Selected category: {supplierCategories.find(cat => cat._id === formData.supplierCategory)?.name || 'Unknown'}
//                 </p>
//               )}
//             </div>

//             {/* Personal Information Section */}
//             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
//               <div>
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

//               <div>
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
//               <div>
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

//               <div>
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

//             {/* Address Information Section */}
//             <div className="space-y-6">
//               <div className="border-b border-gray-200 pb-4">
//                 <h3 className="text-lg font-medium text-gray-900">Address Details</h3>
//                 <p className="mt-1 text-sm text-gray-600">
//                   Fill in the address details manually or use the map below to select a location.
//                 </p>
//               </div>

//               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
//                 <div>
//                   <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
//                     Country *
//                   </label>
//                   <select
//                     id="country"
//                     name="country"
//                     value={formData.country}
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

//                 <div>
//                   <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
//                     State/Province *
//                   </label>
//                   <input
//                     type="text"
//                     id="state"
//                     name="state"
//                     value={formData.state}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     placeholder="Enter state or province"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
//                 <div>
//                   <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
//                     City *
//                   </label>
//                   <input
//                     type="text"
//                     id="city"
//                     name="city"
//                     value={formData.city}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     placeholder="Enter city"
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-2">
//                     Street Address *
//                   </label>
//                   <input
//                     type="text"
//                     id="streetAddress"
//                     name="streetAddress"
//                     value={formData.streetAddress}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     placeholder="Enter street address"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
//                 <div>
//                   <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700 mb-2">
//                     House Number *
//                   </label>
//                   <input
//                     type="text"
//                     id="houseNumber"
//                     name="houseNumber"
//                     value={formData.houseNumber}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                     placeholder="Enter house number"
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
//                     Postal Code *
//                   </label>
//                   <input
//                     type="text"
//                     id="postalCode"
//                     name="postalCode"
//                     value={formData.postalCode}
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
//             <div className="flex justify-end space-x-4 pt-8  w-full">
//               <button
//                 type="button"
//                 onClick={handleCancel}
//                 className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={isLoading || loadingSupplierCategories || supplierCategories.length === 0 || !formData.supplierCategory}
//                 className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isLoading ? 'Updating...' : 'Update Supplier'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditSupplierPage;

























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

interface SupplierFormData {
  supplierCategory: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  state: string;
  city: string;
  streetAddress: string;
  houseNumber: string;
  postalCode: string;
}

interface SupplierCategory {
  _id: string;
  name: string;
  description: string;
}

// API Response interface
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
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
function EditSupplierContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [supplierCategories, setSupplierCategories] = useState<SupplierCategory[]>([]);
  const [loadingSupplierCategories, setLoadingSupplierCategories] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Address>({});
  const [formData, setFormData] = useState<SupplierFormData>({
    supplierCategory: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    country: '',
    state: '',
    city: '',
    streetAddress: '',
    houseNumber: '',
    postalCode: '',
  });
  const [supplierId, setSupplierId] = useState<string | null>(null);

  // Get supplierId from URL on client-side only - FIXED
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      setSupplierId(id);
    }
  }, []);

  const countries = [
    { value: 'United States', label: 'United States' },
    { value: 'Canada', label: 'Canada' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Australia', label: 'Australia' },
    { value: 'India', label: 'India' },
    { value: 'Pakistan', label: 'Pakistan' },
  ];

  // Fetch supplier categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('🔄 Fetching supplier categories...');
        const response = await clientService.get<ApiResponse<SupplierCategory[]>>('/supplier-categories?status=active');
        const result = response.data;
        
        console.log('📦 Supplier categories response:', result);
        
        if (result.success) {
          setSupplierCategories(result.data || []);
          console.log(`✅ Loaded ${result.data?.length || 0} supplier categories`);
        } else {
          console.error('❌ Failed to fetch categories:', result.message);
          setSupplierCategories([]);
        }
      } catch (error) {
        console.error('❌ Error fetching categories:', error);
        setSupplierCategories([]);
      } finally {
        setLoadingSupplierCategories(false);
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

  // Fetch supplier data when supplierId is available
  useEffect(() => {
    const fetchSupplierData = async () => {
      if (!supplierId) {
        console.log('❌ No supplier ID provided');
        setIsFetching(false);
        return;
      }

      try {
        console.log(`🔄 Fetching supplier data for ID: ${supplierId}`);
        
        // Use the general users endpoint since suppliers are stored in users table
        const response = await clientService.get<ApiResponse>(`/users/${supplierId}`);
        const result = response.data;
        
        console.log('📦 Supplier data response:', result);
        
        if (result.success && result.data) {
          const supplier = result.data;
          
          console.log('🔍 Raw supplier data:', {
            supplierCategory: supplier.supplierCategory,
            userType: supplier.userType,
            address: supplier.address
          });

          // Handle supplier category - it could be an object (populated) or string (ID)
          let supplierCategoryValue = '';
          if (supplier.supplierCategory) {
            if (typeof supplier.supplierCategory === 'object' && supplier.supplierCategory._id) {
              supplierCategoryValue = supplier.supplierCategory._id;
              console.log(`✅ Found populated supplier category: ${supplier.supplierCategory.name}`);
            } else {
              supplierCategoryValue = supplier.supplierCategory;
              console.log(`ℹ️ Supplier category is ID: ${supplierCategoryValue}`);
            }
          } else {
            console.log('❌ No supplier category found for this supplier');
          }

          // Handle address data
          const address = supplier.address || {};
          console.log('🏠 Address data:', address);
          
          // Set form data
          const newFormData = {
            supplierCategory: supplierCategoryValue,
            firstName: supplier.firstName || '',
            lastName: supplier.lastName || '',
            email: supplier.email || '',
            phoneNumber: supplier.phoneNumber || '',
            country: address.country || '',
            state: address.state || '',
            city: address.city || '',
            streetAddress: address.streetAddress || '',
            houseNumber: address.houseNumber || '',
            postalCode: address.postalCode || ''
          };

          setFormData(newFormData);

          // Set selected location for map
          if (address.coordinates?.latitude && address.coordinates?.longitude) {
            setSelectedLocation({
              latitude: address.coordinates.latitude,
              longitude: address.coordinates.longitude,
              country: address.country,
              state: address.state,
              city: address.city,
              streetAddress: address.streetAddress,
              houseNumber: address.houseNumber,
              postalCode: address.postalCode
            });
          } else if (address.latitude && address.longitude) {
            setSelectedLocation({
              latitude: address.latitude,
              longitude: address.longitude,
              country: address.country,
              state: address.state,
              city: address.city,
              streetAddress: address.streetAddress,
              houseNumber: address.houseNumber,
              postalCode: address.postalCode
            });
          }

          console.log('✅ Form data set successfully:', newFormData);
        } else {
          throw new Error(result.message || 'Invalid supplier data');
        }
      } catch (error) {
        console.error('❌ Error fetching supplier:', error);
        alert(`Error loading supplier data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsFetching(false);
      }
    };

    fetchSupplierData();
  }, [supplierId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      alert('No supplier ID provided');
      return;
    }

    setIsLoading(true);
    try {
      // Transform data to match backend schema
      const supplierData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        supplierCategory: formData.supplierCategory,
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

      console.log('🔄 Updating supplier with data:', {
        supplierId,
        supplierData,
        selectedCategory: formData.supplierCategory
      });

      // Using the general users endpoint for update
      const response = await clientService.put<ApiResponse>(`/users/${supplierId}`, supplierData);
      const result = response.data;
      
      console.log('📨 Update response:', result);

      if (result.success) {
        console.log('✅ Supplier updated successfully');
        
        // Force immediate refetch of suppliers data
        await queryClient.invalidateQueries({ 
          queryKey: ['suppliers'], 
          refetchType: 'active' 
        });
        
        alert('Supplier updated successfully!');
        router.push('/supplier/view-suppliers');
      } else {
        console.error('❌ Update failed:', result.message);
        alert(result.message || 'Failed to update supplier');
      }
    } catch (error) {
      console.error('❌ Error updating supplier:', error);
      alert(`Error updating supplier: ${error instanceof Error ? error.message : 'Please check your connection.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/supplier/view-suppliers');
  };

  // Show loading while fetching supplierId or supplier data
  if (!supplierId || isFetching || loadingSupplierCategories) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {!supplierId ? 'Loading...' : 
             isFetching ? 'Loading supplier data...' : 
             'Loading categories...'}
          </p>
          {supplierId && (
            <p className="text-sm text-gray-500 mt-2">
              Supplier ID: {supplierId}
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
                <h1 className="text-2xl font-bold text-gray-900">Edit Supplier</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Update supplier information with the form below.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supplier ID: {supplierId}
                </p>
              </div>
              <Link
                href="/supplier/view-suppliers"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                ← Back to Supplier
              </Link>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Supplier Category */}
            <div>
              <label htmlFor="supplierCategory" className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Category *
              </label>
              <select
                id="supplierCategory"
                name="supplierCategory"
                value={formData.supplierCategory}
                onChange={handleChange}
                required
                disabled={loadingSupplierCategories}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              >
                <option value="">
                  {loadingSupplierCategories ? 'Loading categories...' : 'Select Supplier Category'}
                </option>
                {supplierCategories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {supplierCategories.length === 0 && !loadingSupplierCategories && (
                <p className="mt-1 text-sm text-red-600">
                  No supplier categories available. Please add supplier categories first.
                </p>
              )}
              {formData.supplierCategory && (
                <p className="mt-1 text-sm text-green-600">
                  Selected category: {supplierCategories.find(cat => cat._id === formData.supplierCategory)?.name || 'Unknown'}
                </p>
              )}
            </div>

            {/* Personal Information Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
              <div>
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

              <div>
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
              <div>
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

              <div>
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

            {/* Address Information Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">Address Details</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Fill in the address details manually or use the map below to select a location.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
                <div>
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

                <div>
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
                <div>
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

                <div>
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
                <div>
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

                <div>
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
                disabled={isLoading || loadingSupplierCategories || supplierCategories.length === 0 || !formData.supplierCategory}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Supplier'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Main page export with Suspense boundary
export default function EditSupplierPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EditSupplierContent />
    </Suspense>
  );
}