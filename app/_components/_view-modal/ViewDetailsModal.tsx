

// 'use client';

// import React, { useState, useEffect } from 'react';
// import { X } from 'lucide-react';
// import { clientService } from '../../app/utils/api-client';

// interface ViewDetailsModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   type: 'user' | 'supplier';
//   data: any;
// }

// interface UserAddress {
//   country: string;
//   state: string;
//   city: string;
//   streetAddress: string;
//   houseNumber: string;
//   postalCode: string;
// }

// interface UserData {
//   _id: string;
//   name: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   userType: any;
//   categoryType: string;
//   supplierCategory?: any;
//   address?: UserAddress;
//   isBlocked: boolean;
//   isEmailVerified: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// // API Response interface
// interface UserResponse {
//   success: boolean;
//   message: string;
//   data: UserData;
// }

// const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({ 
//   isOpen, 
//   onClose, 
//   type, 
//   data 
// }) => {
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (isOpen && data?.id) {
//       fetchUserData(data.id);
//     }
//   }, [isOpen, data]);

//   // UPDATED: Using clientService instead of fetch
//   const fetchUserData = async (userId: string) => {
//     setLoading(true);
//     try {
//       console.log(`🔄 Fetching ${type} data for ID: ${userId}`);
      
//       const response = await clientService.get<UserResponse>(`/users/${userId}`);
//       const result = response.data;
      
//       if (result.success && result.data) {
//         setUserData(result.data);
        
//         console.log(`✅ ${type} data loaded successfully`);
        
//       } else {
//         console.error(`❌ Failed to fetch ${type}:`, result.message);
//         setUserData(null);
//       }
//     } catch (error) {
//       console.error(`❌ Error fetching ${type} data:`, error);
//       setUserData(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   // Format date for display
//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   // Safe category name getter
//   const getCategoryName = (category: any): string => {
//     if (!category) return 'No Category';
    
//     if (typeof category === 'string') {
//       return category;
//     }
    
//     // Handle populated category object
//     if (typeof category === 'object') {
//       return category.role || category.name || 'Unnamed Category';
//     }
    
//     return 'No Category';
//   };

//   // Get category type
//   const getCategoryType = (category: any): string => {
//     if (!category) return '';
    
//     if (typeof category === 'object') {
//       return category.categoryType || '';
//     }
    
//     return '';
//   };

//   // Get full name
//   const getFullName = () => {
//     if (userData) {
//       return  userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
//     }
//     if (data.name) return data.name;
//     if (data.firstName && data.lastName) return `${data.firstName} ${data.lastName}`;
//     return 'N/A';
//   };

//   // Get phone number
//   const getPhoneNumber = () => {
//     if (userData?.phoneNumber) return userData.phoneNumber;
//     if (data.phoneNumber) return data.phoneNumber;
//     if (data.phone) return data.phone;
//     return 'N/A';
//   };

//   // Get email
//   const getEmail = () => {
//     if (userData?.email) return userData.email;
//     if (data.email) return data.email;
//     return 'N/A';
//   };

//   // Get status
//   const getStatus = () => {
//     if (userData) return !userData.isBlocked;
//     return data.isActive !== false; // Default to active if not specified
//   };

//   // Get address data
//   const getAddress = () => {
//     if (userData?.address) return userData.address;
//     if (data.address) return data.address;
//     if (data.originalAddress) return data.originalAddress;
//     return null;
//   };

//   // Render user details
//   const renderUserDetails = () => {
//     const address = getAddress();
//     const hasAddress = address && (
//       address.country || 
//       address.state || 
//       address.city || 
//       address.streetAddress || 
//       address.houseNumber || 
//       address.postalCode
//     );

//     return (
//       <div className="space-y-6">
//         {/* Personal Information */}
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-600">Full Name</p>
//               <p className="text-sm text-gray-900 font-semibold">{getFullName()}</p>
//             </div>
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-600">Email Address</p>
//               <p className="text-sm text-gray-900 font-semibold break-all">{getEmail()}</p>
//             </div>
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-600">Phone Number</p>
//               <p className="text-sm text-gray-900 font-semibold">{getPhoneNumber()}</p>
//             </div>
//           </div>
//         </div>

//         <hr className="border-gray-200" />

//         {/* User Role - Full Width */}
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">User Role</h3>
//           <div className="bg-gray-50 rounded-lg p-4 w-full">
//             <p className="text-sm font-medium text-gray-900">
//               {getCategoryName(userData?.userType || data.originalCategory || data.userType)}
//             </p>
//             <p className="text-sm text-gray-600 mt-1">
//               Type: {getCategoryType(userData?.userType || data.originalCategory || data.userType) || 'N/A'}
//             </p>
//           </div>
//         </div>

//         <hr className="border-gray-200" />

//         {/* Address Details */}
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Details</h3>
//           {loading ? (
//             <div className="bg-gray-50 rounded-lg p-4">
//               <p className="text-sm text-gray-600">Loading address information...</p>
//             </div>
//           ) : hasAddress ? (
//             <div className="bg-gray-50 rounded-lg p-4 space-y-4">
//               {/* Location Section */}
//               <div className="space-y-2">
//                 <p className="text-sm font-medium text-gray-600">Location</p>
//                 <div className="flex flex-wrap gap-2">
//                   {address.country && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                       Country: {address.country}
//                     </span>
//                   )}
//                   {address.state && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
//                       State: {address.state}
//                     </span>
//                   )}
//                   {address.city && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                       City: {address.city}
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Street Address Section */}
//               <div className="space-y-2">
//                 <p className="text-sm font-medium text-gray-600">Street Address</p>
//                 <div className="flex flex-wrap gap-2">
//                   {address.streetAddress && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
//                       {address.streetAddress}
//                       {address.houseNumber && `, ${address.houseNumber}`}
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Postal Code Section */}
//               {address.postalCode && (
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium text-gray-600">Postal Code</p>
//                   <div className="flex flex-wrap gap-2">
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
//                       {address.postalCode}
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="bg-gray-50 rounded-lg p-4">
//               <p className="text-sm text-gray-600">No address information available</p>
//             </div>
//           )}
//         </div>

//         <hr className="border-gray-200" />

//         {/* Status Information */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-2">
//             <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
//             <div className="flex items-center">
//               <div className={`w-3 h-3 rounded-full mr-2 ${
//                 getStatus() ? 'bg-green-500' : 'bg-red-500'
//               }`}></div>
//               <span className="text-sm font-medium">
//                 {getStatus() ? 'Active' : 'Inactive'}
//               </span>
//             </div>
//           </div>
//           <div className="space-y-2">
//             <h3 className="text-lg font-semibold text-gray-900">Email Verification</h3>
//             <div className="flex items-center">
//               <div className={`w-3 h-3 rounded-full mr-2 ${
//                 userData?.isEmailVerified ? 'bg-green-500' : 'bg-red-500'
//               }`}></div>
//               <span className="text-sm font-medium">
//                 {userData?.isEmailVerified ? 'Verified' : 'Not Verified'}
//               </span>
//             </div>
//           </div>
//         </div>

//         <hr className="border-gray-200" />

//         {/* Timestamps */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <p className="text-sm font-medium text-gray-600">Created At</p>
//             <p className="text-sm text-gray-900">
//               {formatDate(userData?.createdAt || data.createdAt)}
//             </p>
//           </div>
//           {(userData?.updatedAt || data.updatedAt) && (
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-600">Last Updated</p>
//               <p className="text-sm text-gray-900">
//                 {formatDate(userData?.updatedAt || data.updatedAt)}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // Render supplier details
//   const renderSupplierDetails = () => {
//     const address = getAddress();
//     const hasAddress = address && (
//       address.country || 
//       address.state || 
//       address.city || 
//       address.streetAddress || 
//       address.houseNumber || 
//       address.postalCode
//     );

//     return (
//       <div className="space-y-6">
//         {/* Personal Information */}
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-600">Full Name</p>
//               <p className="text-sm text-gray-900 font-semibold">{getFullName()}</p>
//             </div>
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-600">Email Address</p>
//               <p className="text-sm text-gray-900 font-semibold break-all">{getEmail()}</p>
//             </div>
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-600">Phone Number</p>
//               <p className="text-sm text-gray-900 font-semibold">{getPhoneNumber()}</p>
//             </div>
//           </div>
//         </div>

//         <hr className="border-gray-200" />

//         {/* User Role and Supplier Category - Side by Side */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* User Role - Left Side */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">User Role</h3>
//             <div className="bg-gray-50 rounded-lg p-4">
//               <p className="text-sm font-medium text-gray-900">
//                 {getCategoryName(userData?.userType || data.originalCategory || data.userType)}
//               </p>
//               <p className="text-sm text-gray-600 mt-1">
//                 Type: {getCategoryType(userData?.userType || data.originalCategory || data.userType) || 'N/A'}
//               </p>
//             </div>
//           </div>

//           {/* Supplier Category - Right Side */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Category</h3>
//             <div className="bg-gray-50 rounded-lg p-4">
//               <p className="text-sm font-medium text-gray-900">
//                 {getCategoryName(userData?.supplierCategory || data.supplierCategory)}
//               </p>
//               {userData?.supplierCategory?.productType && (
//                 <p className="text-sm text-gray-600 mt-1">
//                   Product Type: {userData.supplierCategory.productType === 'new' ? 'New Products' : 'Scrap Products'}
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>

//         <hr className="border-gray-200" />

//         {/* Product Categories - Before Address */}
//         {userData?.supplierCategory?.productCategories && (
//           <>
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
//               <div className="flex flex-wrap gap-2">
//                 {userData.supplierCategory.productCategories.map((category: string, index: number) => (
//                   <span
//                     key={index}
//                     className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
//                   >
//                     {category}
//                   </span>
//                 ))}
//               </div>
//             </div>
//             <hr className="border-gray-200" />
//           </>
//         )}

//         {/* Address Details */}
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Details</h3>
//           {loading ? (
//             <div className="bg-gray-50 rounded-lg p-4">
//               <p className="text-sm text-gray-600">Loading address information...</p>
//             </div>
//           ) : hasAddress ? (
//             <div className="bg-gray-50 rounded-lg p-4 space-y-4">
//               {/* Location Section */}
//               <div className="space-y-2">
//                 <p className="text-sm font-medium text-gray-600">Location</p>
//                 <div className="flex flex-wrap gap-2">
//                   {address.country && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                       Country: {address.country}
//                     </span>
//                   )}
//                   {address.state && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
//                       State: {address.state}
//                     </span>
//                   )}
//                   {address.city && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                       City: {address.city}
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Street Address Section */}
//               <div className="space-y-2">
//                 <p className="text-sm font-medium text-gray-600">Street Address</p>
//                 <div className="flex flex-wrap gap-2">
//                   {address.streetAddress && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
//                       {address.streetAddress}
//                       {address.houseNumber && `, ${address.houseNumber}`}
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Postal Code Section */}
//               {address.postalCode && (
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium text-gray-600">Postal Code</p>
//                   <div className="flex flex-wrap gap-2">
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
//                       {address.postalCode}
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="bg-gray-50 rounded-lg p-4">
//               <p className="text-sm text-gray-600">No address information available</p>
//             </div>
//           )}
//         </div>

//         <hr className="border-gray-200" />

//         {/* Status Information */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-2">
//             <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
//             <div className="flex items-center">
//               <div className={`w-3 h-3 rounded-full mr-2 ${
//                 getStatus() ? 'bg-green-500' : 'bg-red-500'
//               }`}></div>
//               <span className="text-sm font-medium">
//                 {getStatus() ? 'Active' : 'Inactive'}
//               </span>
//             </div>
//           </div>
//           <div className="space-y-2">
//             <h3 className="text-lg font-semibold text-gray-900">Email Verification</h3>
//             <div className="flex items-center">
//               <div className={`w-3 h-3 rounded-full mr-2 ${
//                 userData?.isEmailVerified ? 'bg-green-500' : 'bg-red-500'
//               }`}></div>
//               <span className="text-sm font-medium">
//                 {userData?.isEmailVerified ? 'Verified' : 'Not Verified'}
//               </span>
//             </div>
//           </div>
//         </div>

//         <hr className="border-gray-200" />

//         {/* Timestamps */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <p className="text-sm font-medium text-gray-600">Created At</p>
//             <p className="text-sm text-gray-900">
//               {formatDate(userData?.createdAt || data.createdAt)}
//             </p>
//           </div>
//           {(userData?.updatedAt || data.updatedAt) && (
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-600">Last Updated</p>
//               <p className="text-sm text-gray-900">
//                 {formatDate(userData?.updatedAt || data.updatedAt)}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-[3px]">
//       <div 
//         className="fixed inset-0 transition-opacity"
//         onClick={onClose}
//       />
      
//       <div className="flex min-h-full items-center justify-center p-4">
//         <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
//           {/* Header */}
//           <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg z-10">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-900">
//                   {type === 'user' ? 'User' : 'Supplier'} Details
//                 </h2>
//                 <p className="text-sm text-gray-600 mt-1">
//                   Complete information about this {type}
//                 </p>
//               </div>
//               <button
//                 onClick={onClose}
//                 className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
//           </div>

//           {/* Content */}
//           <div className="px-6 py-4">
//             {type === 'user' ? renderUserDetails() : renderSupplierDetails()}
//           </div>

//           {/* Footer */}
//           <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg">
//             <div className="flex justify-center">
//               <button
//                 onClick={onClose}
//                 className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ViewDetailsModal;













// 'use client';

// import React, { useState, useEffect } from 'react';
// import { X } from 'lucide-react';
// import { clientService } from '../../app/utils/api-client';

// interface ViewDetailsModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   type: 'user' | 'supplier';
//   data: any;
// }

// interface UserAddress {
//   country: string;
//   state: string;
//   city: string;
//   streetAddress: string;
//   houseNumber: string;
//   postalCode: string;
// }

// interface UserData {
//   _id: string;
//   name: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   userType: any;
//   categoryType: string;
//   supplierCategory?: any;
//   address?: UserAddress;
//   isBlocked: boolean;
//   isEmailVerified: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// // API Response interface
// interface UserResponse {
//   success: boolean;
//   message: string;
//   data: UserData;
// }

// const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({ 
//   isOpen, 
//   onClose, 
//   type, 
//   data 
// }) => {
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (isOpen && data?.id) {
//       fetchUserData(data.id);
//     }
//   }, [isOpen, data]);

//   // UPDATED: Using clientService instead of fetch
//   const fetchUserData = async (userId: string) => {
//     setLoading(true);
//     try {
//       console.log(`🔄 Fetching ${type} data for ID: ${userId}`);
      
//       const response = await clientService.get<UserResponse>(`/users/${userId}`);
//       const result = response.data;
      
//       if (result.success && result.data) {
//         setUserData(result.data);
        
//         console.log(`✅ ${type} data loaded successfully`);
//         console.log('🔍 User data debug:', {
//           email: result.data.email,
//           categoryType: result.data.categoryType,
//           userType: result.data.userType,
//           type: type
//         });
        
//       } else {
//         console.error(`❌ Failed to fetch ${type}:`, result.message);
//         setUserData(null);
//       }
//     } catch (error) {
//       console.error(`❌ Error fetching ${type} data:`, error);
//       setUserData(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   // Format date for display
//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   // UPDATED: Get User Category Name (matches your user file logic EXACTLY)
//   const getUserCategoryName = (): string => {
//     const userType = userData?.userType || data?.originalCategory || data?.userType;
//     const directCategoryType = userData?.categoryType || data?.categoryType;
    
//     console.log('🔍 getUserCategoryName debug:', {
//       userType,
//       directCategoryType,
//       userTypeType: typeof userType
//     });
    
//     // Priority 1: Check populated userType object FIRST (for older users)
//     if (userType && typeof userType === 'object') {
//       console.log('🔍 userType object:', userType);
//       // User has a populated UserCategory document
//       // Check categoryType first, then role
//       if (userType.categoryType) {
//         return userType.categoryType;
//       } else if (userType.role) {
//         return userType.role;
//       }
//     }
//     // Priority 2: Check direct categoryType field (for new users without userType)
//     else if (directCategoryType) {
//       console.log('🔍 Using directCategoryType:', directCategoryType);
//       return directCategoryType;
//     }
    
//     console.log('🔍 Defaulting to Customer');
//     // Default: Customer
//     return 'Customer';
//   };

//   // UPDATED: Get User Category Type - should show something different when available
//   const getUserCategoryType = (): string => {
//     const userType = userData?.userType || data?.originalCategory || data?.userType;
    
//     console.log('🔍 getUserCategoryType debug:', {
//       userType,
//       hasCategoryType: userType?.categoryType,
//       hasRole: userType?.role
//     });
    
//     // If userType is an object, check for specific properties
//     if (userType && typeof userType === 'object') {
//       // If there's a role field, that might be the "type" we want to show
//       if (userType.role) {
//         return userType.role;
//       }
//       // Otherwise return categoryType or empty
//       return userType.categoryType || '';
//     }
    
//     // For new users, if there's a direct categoryType, use it
//     const directCategoryType = userData?.categoryType || data?.categoryType;
//     if (directCategoryType) {
//       return directCategoryType;
//     }
    
//     return '';
//   };

//   // ORIGINAL: Safe category name getter for suppliers
//   const getCategoryName = (category: any): string => {
//     if (!category) return 'No Category';
    
//     if (typeof category === 'string') {
//       return category;
//     }
    
//     // Handle populated category object
//     if (typeof category === 'object') {
//       return category.role || category.name || 'Unnamed Category';
//     }
    
//     return 'No Category';
//   };

//   // ORIGINAL: Get category type for suppliers
//   const getCategoryType = (category: any): string => {
//     if (!category) return '';
    
//     if (typeof category === 'object') {
//       return category.categoryType || '';
//     }
    
//     return '';
//   };

//   // Get full name
//   const getFullName = () => {
//     if (userData) {
//       return userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
//     }
//     if (data?.name) return data.name;
//     if (data?.firstName && data?.lastName) return `${data.firstName} ${data.lastName}`;
//     return 'N/A';
//   };

//   // Get phone number
//   const getPhoneNumber = () => {
//     if (userData?.phoneNumber) return userData.phoneNumber;
//     if (data?.phoneNumber) return data.phoneNumber;
//     if (data?.phone) return data.phone;
//     return 'N/A';
//   };

//   // Get email
//   const getEmail = () => {
//     if (userData?.email) return userData.email;
//     if (data?.email) return data.email;
//     return 'N/A';
//   };

//   // Get status
//   const getStatus = () => {
//     if (userData) return !userData.isBlocked;
//     return data?.isActive !== false; // Default to active if not specified
//   };

//   // Get address data
//   const getAddress = () => {
//     if (userData?.address) return userData.address;
//     if (data?.address) return data.address;
//     if (data?.originalAddress) return data.originalAddress;
//     return null;
//   };

//   // Render user details - UPDATED with proper separation
//   const renderUserDetails = () => {
//     const address = getAddress();
//     const hasAddress = address && (
//       address.country || 
//       address.state || 
//       address.city || 
//       address.streetAddress || 
//       address.houseNumber || 
//       address.postalCode
//     );

//     // Get user category using separate functions
//     const categoryName = getUserCategoryName();
//     const categoryType = getUserCategoryType();

//     console.log('🔍 FINAL User category debug in view:', {
//       categoryName,
//       categoryType,
//       areDifferent: categoryName !== categoryType
//     });

//     return (
//       <div className="space-y-6">
//         {/* Personal Information */}
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-600">Full Name</p>
//               <p className="text-sm text-gray-900 font-semibold">{getFullName()}</p>
//             </div>
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-600">Email Address</p>
//               <p className="text-sm text-gray-900 font-semibold break-all">{getEmail()}</p>
//             </div>
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-600">Phone Number</p>
//               <p className="text-sm text-gray-900 font-semibold">{getPhoneNumber()}</p>
//             </div>
//           </div>
//         </div>

//         <hr className="border-gray-200" />

//         {/* User Role - Full Width */}
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">User Role</h3>
//           <div className="bg-gray-50 rounded-lg p-4 w-full">
//             <p className="text-sm font-medium text-gray-900">
//               {categoryName}
//             </p>
//             <p className="text-sm text-gray-600 mt-1">
//               Type: {categoryType || (categoryName === 'Customer' ? 'Customer' : 'N/A')}
//             </p>
//           </div>
//         </div>

//         <hr className="border-gray-200" />

//         {/* Address Details */}
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Details</h3>
//           {loading ? (
//             <div className="bg-gray-50 rounded-lg p-4">
//               <p className="text-sm text-gray-600">Loading address information...</p>
//             </div>
//           ) : hasAddress ? (
//             <div className="bg-gray-50 rounded-lg p-4 space-y-4">
//               {/* Location Section */}
//               <div className="space-y-2">
//                 <p className="text-sm font-medium text-gray-600">Location</p>
//                 <div className="flex flex-wrap gap-2">
//                   {address.country && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                       Country: {address.country}
//                     </span>
//                   )}
//                   {address.state && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
//                       State: {address.state}
//                     </span>
//                   )}
//                   {address.city && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                       City: {address.city}
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Street Address Section */}
//               <div className="space-y-2">
//                 <p className="text-sm font-medium text-gray-600">Street Address</p>
//                 <div className="flex flex-wrap gap-2">
//                   {address.streetAddress && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
//                       {address.streetAddress}
//                       {address.houseNumber && `, ${address.houseNumber}`}
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Postal Code Section */}
//               {address.postalCode && (
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium text-gray-600">Postal Code</p>
//                   <div className="flex flex-wrap gap-2">
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
//                       {address.postalCode}
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="bg-gray-50 rounded-lg p-4">
//               <p className="text-sm text-gray-600">No address information available</p>
//             </div>
//           )}
//         </div>

//         <hr className="border-gray-200" />

//         {/* Status Information */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-2">
//             <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
//             <div className="flex items-center">
//               <div className={`w-3 h-3 rounded-full mr-2 ${
//                 getStatus() ? 'bg-green-500' : 'bg-red-500'
//               }`}></div>
//               <span className="text-sm font-medium">
//                 {getStatus() ? 'Active' : 'Inactive'}
//               </span>
//             </div>
//           </div>
//           <div className="space-y-2">
//             <h3 className="text-lg font-semibold text-gray-900">Email Verification</h3>
//             <div className="flex items-center">
//               <div className={`w-3 h-3 rounded-full mr-2 ${
//                 userData?.isEmailVerified ? 'bg-green-500' : 'bg-red-500'
//               }`}></div>
//               <span className="text-sm font-medium">
//                 {userData?.isEmailVerified ? 'Verified' : 'Not Verified'}
//               </span>
//             </div>
//           </div>
//         </div>

//         <hr className="border-gray-200" />

//         {/* Timestamps */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <p className="text-sm font-medium text-gray-600">Created At</p>
//             <p className="text-sm text-gray-900">
//               {formatDate(userData?.createdAt || data?.createdAt || '')}
//             </p>
//           </div>
//           {(userData?.updatedAt || data?.updatedAt) && (
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-600">Last Updated</p>
//               <p className="text-sm text-gray-900">
//                 {formatDate(userData?.updatedAt || data?.updatedAt)}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // Render supplier details - UNCHANGED (keeps original logic)
//   const renderSupplierDetails = () => {
//     const address = getAddress();
//     const hasAddress = address && (
//       address.country || 
//       address.state || 
//       address.city || 
//       address.streetAddress || 
//       address.houseNumber || 
//       address.postalCode
//     );

//     return (
//       <div className="space-y-6">
//         {/* Personal Information */}
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-600">Full Name</p>
//               <p className="text-sm text-gray-900 font-semibold">{getFullName()}</p>
//             </div>
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-600">Email Address</p>
//               <p className="text-sm text-gray-900 font-semibold break-all">{getEmail()}</p>
//             </div>
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-600">Phone Number</p>
//               <p className="text-sm text-gray-900 font-semibold">{getPhoneNumber()}</p>
//             </div>
//           </div>
//         </div>

//         <hr className="border-gray-200" />

//         {/* User Role and Supplier Category - Side by Side */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* User Role - Left Side */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">User Role</h3>
//             <div className="bg-gray-50 rounded-lg p-4">
//               <p className="text-sm font-medium text-gray-900">
//                 {getCategoryName(userData?.userType || data?.originalCategory || data?.userType)}
//               </p>
//               <p className="text-sm text-gray-600 mt-1">
//                 Type: {getCategoryType(userData?.userType || data?.originalCategory || data?.userType) || 'N/A'}
//               </p>
//             </div>
//           </div>

//           {/* Supplier Category - Right Side */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Category</h3>
//             <div className="bg-gray-50 rounded-lg p-4">
//               <p className="text-sm font-medium text-gray-900">
//                 {getCategoryName(userData?.supplierCategory || data?.supplierCategory)}
//               </p>
//               {userData?.supplierCategory?.productType && (
//                 <p className="text-sm text-gray-600 mt-1">
//                   Product Type: {userData.supplierCategory.productType === 'new' ? 'New Products' : 'Scrap Products'}
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>

//         <hr className="border-gray-200" />

//         {/* Product Categories - Before Address */}
//         {userData?.supplierCategory?.productCategories && (
//           <>
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
//               <div className="flex flex-wrap gap-2">
//                 {userData.supplierCategory.productCategories.map((category: string, index: number) => (
//                   <span
//                     key={index}
//                     className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
//                   >
//                     {category}
//                   </span>
//                 ))}
//               </div>
//             </div>
//             <hr className="border-gray-200" />
//           </>
//         )}

//         {/* Address Details */}
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Details</h3>
//           {loading ? (
//             <div className="bg-gray-50 rounded-lg p-4">
//               <p className="text-sm text-gray-600">Loading address information...</p>
//             </div>
//           ) : hasAddress ? (
//             <div className="bg-gray-50 rounded-lg p-4 space-y-4">
//               {/* Location Section */}
//               <div className="space-y-2">
//                 <p className="text-sm font-medium text-gray-600">Location</p>
//                 <div className="flex flex-wrap gap-2">
//                   {address.country && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                       Country: {address.country}
//                     </span>
//                   )}
//                   {address.state && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
//                       State: {address.state}
//                     </span>
//                   )}
//                   {address.city && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                       City: {address.city}
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Street Address Section */}
//               <div className="space-y-2">
//                 <p className="text-sm font-medium text-gray-600">Street Address</p>
//                 <div className="flex flex-wrap gap-2">
//                   {address.streetAddress && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
//                       {address.streetAddress}
//                       {address.houseNumber && `, ${address.houseNumber}`}
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Postal Code Section */}
//               {address.postalCode && (
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium text-gray-600">Postal Code</p>
//                   <div className="flex flex-wrap gap-2">
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
//                       {address.postalCode}
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="bg-gray-50 rounded-lg p-4">
//               <p className="text-sm text-gray-600">No address information available</p>
//             </div>
//           )}
//         </div>

//         <hr className="border-gray-200" />

//         {/* Status Information */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-2">
//             <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
//             <div className="flex items-center">
//               <div className={`w-3 h-3 rounded-full mr-2 ${
//                 getStatus() ? 'bg-green-500' : 'bg-red-500'
//               }`}></div>
//               <span className="text-sm font-medium">
//                 {getStatus() ? 'Active' : 'Inactive'}
//               </span>
//             </div>
//           </div>
//           <div className="space-y-2">
//             <h3 className="text-lg font-semibold text-gray-900">Email Verification</h3>
//             <div className="flex items-center">
//               <div className={`w-3 h-3 rounded-full mr-2 ${
//                 userData?.isEmailVerified ? 'bg-green-500' : 'bg-red-500'
//               }`}></div>
//               <span className="text-sm font-medium">
//                 {userData?.isEmailVerified ? 'Verified' : 'Not Verified'}
//               </span>
//             </div>
//           </div>
//         </div>

//         <hr className="border-gray-200" />

//         {/* Timestamps */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <p className="text-sm font-medium text-gray-600">Created At</p>
//             <p className="text-sm text-gray-900">
//               {formatDate(userData?.createdAt || data?.createdAt || '')}
//             </p>
//           </div>
//           {(userData?.updatedAt || data?.updatedAt) && (
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-600">Last Updated</p>
//               <p className="text-sm text-gray-900">
//                 {formatDate(userData?.updatedAt || data?.updatedAt)}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-[3px]">
//       <div 
//         className="fixed inset-0 transition-opacity"
//         onClick={onClose}
//       />
      
//       <div className="flex min-h-full items-center justify-center p-4">
//         <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
//           {/* Header */}
//           <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg z-10">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-900">
//                   {type === 'user' ? 'User' : 'Supplier'} Details
//                 </h2>
//                 <p className="text-sm text-gray-600 mt-1">
//                   Complete information about this {type}
//                 </p>
//               </div>
//               <button
//                 onClick={onClose}
//                 className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
//           </div>

//           {/* Content */}
//           <div className="px-6 py-4">
//             {type === 'user' ? renderUserDetails() : renderSupplierDetails()}
//           </div>

//           {/* Footer */}
//           <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg">
//             <div className="flex justify-center">
//               <button
//                 onClick={onClose}
//                 className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ViewDetailsModal;


















'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Mail, User, Calendar, Shield, Building, Package, CheckCircle, XCircle } from 'lucide-react';
import { clientService } from '../../app/utils/api-client';

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
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userType: any;
  categoryType: string;
  supplierCategory?: any;
  address?: UserAddress;
  isBlocked: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response interface
interface UserResponse {
  success: boolean;
  message: string;
  data: UserData;
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
      console.log(`🔄 Fetching ${type} data for ID: ${userId}`);
      
      const response = await clientService.get<UserResponse>(`/users/${userId}`);
      const result = response.data;
      
      if (result.success && result.data) {
        setUserData(result.data);
        
        console.log(`✅ ${type} data loaded successfully`);
        console.log('🔍 User data debug:', {
          email: result.data.email,
          categoryType: result.data.categoryType,
          userType: result.data.userType,
          type: type
        });
        
      } else {
        console.error(`❌ Failed to fetch ${type}:`, result.message);
        setUserData(null);
      }
    } catch (error) {
      console.error(`❌ Error fetching ${type} data:`, error);
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

  // UPDATED: Get User Category Name (matches your user file logic EXACTLY)
  const getUserCategoryName = (): string => {
    const userType = userData?.userType || data?.originalCategory || data?.userType;
    const directCategoryType = userData?.categoryType || data?.categoryType;
    
    // Priority 1: Check populated userType object FIRST (for older users)
    if (userType && typeof userType === 'object') {
      // User has a populated UserCategory document
      // Check categoryType first, then role
      if (userType.categoryType) {
        return userType.categoryType;
      } else if (userType.role) {
        return userType.role;
      }
    }
    // Priority 2: Check direct categoryType field (for new users without userType)
    else if (directCategoryType) {
      return directCategoryType;
    }
    
    // Default: Customer
    return 'Customer';
  };

  // UPDATED: Get User Category Type - should show something different when available
  const getUserCategoryType = (): string => {
    const userType = userData?.userType || data?.originalCategory || data?.userType;
    
    // If userType is an object, check for specific properties
    if (userType && typeof userType === 'object') {
      // If there's a role field, that might be the "type" we want to show
      if (userType.role) {
        return userType.role;
      }
      // Otherwise return categoryType or empty
      return userType.categoryType || '';
    }
    
    // For new users, if there's a direct categoryType, use it
    const directCategoryType = userData?.categoryType || data?.categoryType;
    if (directCategoryType) {
      return directCategoryType;
    }
    
    return '';
  };

  // ORIGINAL: Safe category name getter for suppliers
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

  // ORIGINAL: Get category type for suppliers
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
      return userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    }
    if (data?.name) return data.name;
    if (data?.firstName && data?.lastName) return `${data.firstName} ${data.lastName}`;
    return 'N/A';
  };

  // Get phone number
  const getPhoneNumber = () => {
    if (userData?.phoneNumber) return userData.phoneNumber;
    if (data?.phoneNumber) return data.phoneNumber;
    if (data?.phone) return data.phone;
    return 'N/A';
  };

  // Get email
  const getEmail = () => {
    if (userData?.email) return userData.email;
    if (data?.email) return data.email;
    return 'N/A';
  };

  // Get status
  const getStatus = () => {
    if (userData) return !userData.isBlocked;
    return data?.isActive !== false; // Default to active if not specified
  };

  // Get address data
  const getAddress = () => {
    if (userData?.address) return userData.address;
    if (data?.address) return data.address;
    if (data?.originalAddress) return data.originalAddress;
    return null;
  };

  // Get complete address string
  const getFullAddress = () => {
    const address = getAddress();
    if (!address) return 'No address provided';

    const parts = [];
    if (address.streetAddress) parts.push(address.streetAddress);
    if (address.houseNumber) parts.push(address.houseNumber);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.postalCode) parts.push(address.postalCode);
    if (address.country) parts.push(address.country);

    return parts.join(', ');
  };

  // Render user details - IMPROVED DESIGN with the same logic
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

    // Get user category using separate functions
    const categoryName = getUserCategoryName();
    const categoryType = getUserCategoryType();

    return (
      <div className="space-y-6">
        {/* Header with basic info */}
        <div className="flex items-start gap-4 p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full">
            <User className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{getFullName()}</h3>
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{getEmail()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{getPhoneNumber()}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
              getStatus() 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {getStatus() ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {getStatus() ? 'Active' : 'Inactive'}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
              userData?.isEmailVerified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {userData?.isEmailVerified ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {userData?.isEmailVerified ? 'Email Verified' : 'Email Not Verified'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Personal Information
              </h3>
              <div className="space-y-4">
                {/* <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">First Name</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {userData?.firstName || data?.firstName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Last Name</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {userData?.lastName || data?.lastName || 'N/A'}
                    </p>
                  </div>
                </div> */}
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Display Name</p>
                  <p className="text-sm font-semibold text-gray-900">{getFullName()}</p>
                </div>
              </div>
            </div>

            {/* User Role Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                User Role & Permissions
              </h3>
              <div className="space-y-3">
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-purple-900 mb-1">Primary Role</p>
                  <p className="text-lg font-bold text-purple-700">
                    {categoryName}
                  </p>
                  {categoryType && (
                    <p className="text-sm text-purple-600 mt-1">
                      Type: {categoryType}
                    </p>
                  )}
                </div>
                {userData?.categoryType && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Category Type</p>
                    <p className="text-sm font-semibold text-gray-900">{userData.categoryType}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Address Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Address Information
              </h3>
              {loading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : hasAddress ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Complete Address</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{getFullAddress()}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {address.country && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Country</p>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span className="text-sm font-semibold text-gray-900">{address.country}</span>
                        </div>
                      </div>
                    )}
                    {address.state && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">State/Province</p>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span className="text-sm font-semibold text-gray-900">{address.state}</span>
                        </div>
                      </div>
                    )}
                    {address.city && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">City</p>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-sm font-semibold text-gray-900">{address.city}</span>
                        </div>
                      </div>
                    )}
                    {address.postalCode && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Postal Code</p>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          <span className="text-sm font-semibold text-gray-900">{address.postalCode}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {(address.streetAddress || address.houseNumber) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-2">Street Details</p>
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        {address.streetAddress && (
                          <span className="font-semibold">{address.streetAddress}</span>
                        )}
                        {address.houseNumber && (
                          <span className="text-gray-600">House No. {address.houseNumber}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No address information available</p>
                </div>
              )}
            </div>

            {/* Account Information Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="h-5 w-5 text-indigo-600" />
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">User ID</p>
                    <p className="text-xs font-mono font-semibold text-gray-900 truncate">
                      {userData?._id || data?._id || data?.id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        getStatus() ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-semibold">
                        {getStatus() ? 'Active Account' : 'Account Blocked'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    Timeline
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Account Created</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(userData?.createdAt || data?.createdAt || '')}
                      </p>
                    </div>
                    {userData?.updatedAt && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Last Updated</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(userData.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render supplier details - IMPROVED DESIGN with same logic
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
        {/* Header with basic info for Supplier */}
        <div className="flex items-start gap-4 p-4 bg-linear-to-r from-teal-50 to-emerald-50 rounded-lg">
          <div className="flex items-center justify-center w-16 h-16 bg-teal-100 text-teal-600 rounded-full">
            <Package className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{getFullName()}</h3>
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{getEmail()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{getPhoneNumber()}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
              getStatus() 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {getStatus() ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {getStatus() ? 'Active' : 'Inactive'}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
              userData?.isEmailVerified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {userData?.isEmailVerified ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {userData?.isEmailVerified ? 'Email Verified' : 'Email Not Verified'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column for Supplier */}
          <div className="space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Personal Information
              </h3>
              <div className="space-y-4">
                {/* <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">First Name</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {userData?.firstName || data?.firstName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Last Name</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {userData?.lastName || data?.lastName || 'N/A'}
                    </p>
                  </div>
                </div> */}
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Display Name</p>
                  <p className="text-sm font-semibold text-gray-900">{getFullName()}</p>
                </div>
              </div>
            </div>

            {/* User Role and Supplier Category Cards */}
            <div className="space-y-6">
              {/* User Role Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  User Role
                </h3>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-purple-900 mb-1">Primary Role</p>
                  <p className="text-lg font-bold text-purple-700">
                    {getCategoryName(userData?.userType || data?.originalCategory || data?.userType)}
                  </p>
                  <p className="text-sm text-purple-600 mt-1">
                    Type: {getCategoryType(userData?.userType || data?.originalCategory || data?.userType) || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Supplier Category Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-teal-600" />
                  Supplier Category
                </h3>
                <div className="bg-teal-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-teal-900 mb-1">Category</p>
                  <p className="text-lg font-bold text-teal-700">
                    {getCategoryName(userData?.supplierCategory || data?.supplierCategory)}
                  </p>
                  {userData?.supplierCategory?.productType && (
                    <p className="text-sm text-teal-600 mt-1">
                      Product Type: {userData.supplierCategory.productType === 'new' ? 'New Products' : 'Scrap Products'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Product Categories Card */}
            {userData?.supplierCategory?.productCategories && (
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-600" />
                  Product Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userData.supplierCategory.productCategories.map((category: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column for Supplier */}
          <div className="space-y-6">
            {/* Address Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Address Information
              </h3>
              {loading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : hasAddress ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Complete Address</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{getFullAddress()}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {address.country && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Country</p>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span className="text-sm font-semibold text-gray-900">{address.country}</span>
                        </div>
                      </div>
                    )}
                    {address.state && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">State/Province</p>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span className="text-sm font-semibold text-gray-900">{address.state}</span>
                        </div>
                      </div>
                    )}
                    {address.city && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">City</p>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-sm font-semibold text-gray-900">{address.city}</span>
                        </div>
                      </div>
                    )}
                    {address.postalCode && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Postal Code</p>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          <span className="text-sm font-semibold text-gray-900">{address.postalCode}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {(address.streetAddress || address.houseNumber) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-2">Street Details</p>
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        {address.streetAddress && (
                          <span className="font-semibold">{address.streetAddress}</span>
                        )}
                        {address.houseNumber && (
                          <span className="text-gray-600">House No. {address.houseNumber}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No address information available</p>
                </div>
              )}
            </div>

            {/* Account Information Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="h-5 w-5 text-indigo-600" />
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">User ID</p>
                    <p className="text-xs font-mono font-semibold text-gray-900 truncate">
                      {userData?._id || data?._id || data?.id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        getStatus() ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-semibold">
                        {getStatus() ? 'Active Account' : 'Account Blocked'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    Timeline
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Account Created</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(userData?.createdAt || data?.createdAt || '')}
                      </p>
                    </div>
                    {userData?.updatedAt && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Last Updated</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(userData.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-[3px]">
      <div 
        className="fixed inset-0 bg-black/30 transition-opacity"
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
          {/* Header */}
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg z-10 shadow-sm">
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
          <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg shadow-sm">
            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
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