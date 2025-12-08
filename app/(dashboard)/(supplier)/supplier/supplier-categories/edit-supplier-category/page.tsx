// 'use client';

// import React, { useState, useEffect, useRef } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useQueryClient } from '@tanstack/react-query';
// import Link from 'next/link';
// import { clientService } from '../../../app/utils/api-client';
// import { Suspense } from 'react';
// interface SupplierCategoryFormData {
//   name: string;
//   description: string;
//   productCategories: string[];
//   productType: 'new' | 'scrap';
//   image?: File | string | null;
// }

// interface SupplierCategory {
//   _id: string;
//   name: string;
//   description: string;
//   productCategories: string[];
//   productType: 'new' | 'scrap';
//   image?: string;
//   status: 'active' | 'inactive';
//   createdAt: string;
//   updatedAt: string;
// }

// // API Response interface
// interface ApiResponse<T = any> {
//   success: boolean;
//   message: string;
//   data: T;
// }

// const EditSupplierCategoryPage = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const queryClient = useQueryClient();
//   const [isLoading, setIsLoading] = useState(false);
//   const [isFetching, setIsFetching] = useState(true);
//   const [formData, setFormData] = useState<SupplierCategoryFormData>({
//     name: '',
//     description: '',
//     productCategories: [],
//     productType: 'new',
//     image: null
//   });
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [existingImage, setExistingImage] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const categoryId = searchParams.get('id');

//   // Predefined product categories matching backend enum
//   const productCategoriesOptions = [
//     'Electronics',
//     'Construction Materials',
//     'Industrial Equipment',
//     'Raw Materials',
//     'Consumer Goods'
//   ];

//   // Fetch category data on component mount
//   useEffect(() => {
//     const fetchCategory = async () => {
//       if (!categoryId) {
//         alert('Category ID is missing');
//         router.push('/supplier/supplier-categories');
//         return;
//       }

//       try {
//         setIsFetching(true);
//         console.log('🔄 Fetching category data for ID:', categoryId);
        
//         // UPDATED: Using clientService instead of fetch
//         const response = await clientService.get<ApiResponse<SupplierCategory>>(`/supplier-categories/${categoryId}`);
        
//         console.log('✅ Category data received:', response.data);
        
//         const result = response.data;
//         if (result.success) {
//           const category: SupplierCategory = result.data;
//           setFormData({
//             name: category.name,
//             description: category.description,
//             productCategories: category.productCategories,
//             productType: category.productType,
//             image: category.image || ''
//           });

//           // Set existing image if available
//           if (category.image) {
//             setExistingImage(category.image);
//           }
//         } else {
//           alert(result.message || 'Failed to fetch category data');
//           router.push('/supplier/supplier-categories');
//         }
//       } catch (error) {
//         console.error('❌ Error fetching supplier category:', error);
//         alert('Error fetching supplier category. Please check your connection.');
//         router.push('/supplier/supplier-categories');
//       } finally {
//         setIsFetching(false);
//       }
//     };

//     fetchCategory();
//   }, [categoryId, router]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
    
//     if (name === 'productCategories') {
//       setFormData(prev => ({
//         ...prev,
//         productCategories: value ? [value] : []
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }
//   };

//   const handleProductTypeChange = (type: 'new' | 'scrap') => {
//     setFormData(prev => ({
//       ...prev,
//       productType: type
//     }));
//   };

//   // Handle file selection
//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       processImageFile(file);
//     }
//   };

//   // Process the image file and create preview
//   const processImageFile = (file: File) => {
//     // Validate file type
//     if (!file.type.startsWith('image/')) {
//       alert('Please select an image file');
//       return;
//     }

//     // Validate file size (10MB)
//     if (file.size > 10 * 1024 * 1024) {
//       alert('File size must be less than 10MB');
//       return;
//     }

//     // Create preview URL
//     const previewUrl = URL.createObjectURL(file);
//     setImagePreview(previewUrl);
    
//     // Update form data with File object
//     setFormData(prev => ({
//       ...prev,
//       image: file
//     }));

//     // Clear existing image when new image is selected
//     setExistingImage(null);
//   };

//   // Handle drag and drop events
//   const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
//     e.preventDefault();
//     setIsDragging(false);
//   };

//   const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
//     e.preventDefault();
//     setIsDragging(false);
    
//     const files = e.dataTransfer.files;
//     if (files.length > 0) {
//       processImageFile(files[0]);
//     }
//   };

//   // Remove image preview
//   const handleRemoveImage = () => {
//     if (imagePreview) {
//       URL.revokeObjectURL(imagePreview); // Clean up memory
//     }
//     setImagePreview(null);
//     setFormData(prev => ({
//       ...prev,
//       image: ''
//     }));
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   // Remove existing image
//   const handleRemoveExistingImage = () => {
//     setExistingImage(null);
//     setFormData(prev => ({
//       ...prev,
//       image: ''
//     }));
//   };

//   // UPDATED: Handle form submission using axios
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!categoryId) {
//       alert('Category ID is missing');
//       return;
//     }

//     setIsLoading(true);

//     try {
//       // Validate that a product category is selected
//       if (formData.productCategories.length === 0) {
//         alert('Please select a product category');
//         setIsLoading(false);
//         return;
//       }

//       console.log('🔄 Updating category with data:', {
//         name: formData.name,
//         description: formData.description,
//         productCategories: formData.productCategories,
//         productType: formData.productType,
//         hasNewImage: formData.image instanceof File
//       });

//       // Create FormData object for file upload
//       const submitFormData = new FormData();
      
//       // Append text fields
//       submitFormData.append('name', formData.name);
//       submitFormData.append('description', formData.description);
//       submitFormData.append('productType', formData.productType);
      
//       // Append product categories as JSON string
//       submitFormData.append('productCategories', JSON.stringify(formData.productCategories));
      
//       // Append image file if it's a new File object
//       if (formData.image instanceof File) {
//         submitFormData.append('image', formData.image);
//       }

//       // UPDATED: Using clientService.put() instead of fetch
//       const response = await clientService.put<ApiResponse>(
//         `/supplier-categories/${categoryId}`,
//         submitFormData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         }
//       );

//       const result = response.data;
//       console.log('✅ Update response:', result);

//       if (result.success) {
//         await queryClient.invalidateQueries({ 
//           queryKey: ['supplier-categories'], 
//           refetchType: 'active' 
//         });
        
//         alert('Supplier category updated successfully!');
//         router.push('/supplier/supplier-categories');
//       } else {
//         alert(result.message || 'Failed to update supplier category');
//       }
//     } catch (error) {
//       console.error('❌ Error updating supplier category:', error);
//       alert('Error updating supplier category. Please check your connection.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     router.push('/supplier/supplier-categories');
//   };

//   if (isFetching) {
//     return (
//       <div className="min-h-screen bg-gray-50 py-8">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="bg-white rounded-lg shadow-md p-8">
//             <div className="flex justify-center items-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             </div>
//             <p className="text-center text-gray-600">Loading category data...</p>
//           </div>
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
//                 <h1 className="text-2xl font-bold text-gray-900">Edit Supplier Category</h1>
//                 <p className="mt-1 text-sm text-gray-600">
//                   Update the supplier category information below.
//                 </p>
//               </div>
//               <Link
//                 href="/supplier/supplier-categories"
//                 className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 ← Back to Supplier
//               </Link>
//             </div>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="p-8 space-y-8">
//             {/* Category Name */}
//             <div className="w-full">
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
//                 Category Name *
//               </label>
//               <input
//                 type="text"
//                 id="name"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                 placeholder="Enter category name"
//               />
//             </div>

//             {/* Product Categories - Simple Select */}
//             <div className="w-full">
//               <label htmlFor="productCategories" className="block text-sm font-medium text-gray-700 mb-2">
//                 Product Categories *
//               </label>
//               <select
//                 id="productCategories"
//                 name="productCategories"
//                 value={formData.productCategories[0] || ''}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//               >
//                 <option value="">Select Product Category</option>
//                 {productCategoriesOptions.map(category => (
//                   <option key={category} value={category}>
//                     {category}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Description */}
//             <div className="w-full">
//               <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
//                 Description *
//               </label>
//               <textarea
//                 id="description"
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 required
//                 rows={4}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                 placeholder="Enter category description"
//               />
//             </div>

//             {/* Product Type */}
//             <div className="w-full">
//               <label className="block text-sm font-medium text-gray-700 mb-4">
//                 Product Type *
//               </label>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {/* New Products Card */}
//                 <div
//                   className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
//                     formData.productType === 'new'
//                       ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
//                       : 'border-gray-300 bg-white hover:border-gray-400'
//                   }`}
//                   onClick={() => handleProductTypeChange('new')}
//                 >
//                   <div className="flex items-start space-x-3">
//                     <div className="shrink-0">
//                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
//                         formData.productType === 'new'
//                           ? 'border-blue-500 bg-blue-500'
//                           : 'border-gray-400'
//                       }`}>
//                         {formData.productType === 'new' && (
//                           <div className="w-2 h-2 rounded-full bg-white"></div>
//                         )}
//                       </div>
//                     </div>
//                     <div className="flex-1">
//                       <h3 className="text-sm font-medium text-gray-900">
//                         New Products
//                       </h3>
//                       <p className="mt-1 text-sm text-gray-500">
//                         Suppliers deal with brand new, unused products
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Scrap Products Card */}
//                 <div
//                   className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
//                     formData.productType === 'scrap'
//                       ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
//                       : 'border-gray-300 bg-white hover:border-gray-400'
//                   }`}
//                   onClick={() => handleProductTypeChange('scrap')}
//                 >
//                   <div className="flex items-start space-x-3">
//                     <div className="shrink-0">
//                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
//                         formData.productType === 'scrap'
//                           ? 'border-green-500 bg-green-500'
//                           : 'border-gray-400'
//                       }`}>
//                         {formData.productType === 'scrap' && (
//                           <div className="w-2 h-2 rounded-full bg-white"></div>
//                         )}
//                       </div>
//                     </div>
//                     <div className="flex-1">
//                       <h3 className="text-sm font-medium text-gray-900">
//                         Scrap Products
//                       </h3>
//                       <p className="mt-1 text-sm text-gray-500">
//                         Suppliers deal with used, recycled, or scrap materials
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Category Image */}
//             <div className="w-full">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Category Image
//               </label>
              
//               {imagePreview ? (
//                 // New Image Preview
//                 <div className="relative">
//                   <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
//                     <div className="flex items-center justify-between mb-4">
//                       <span className="text-sm font-medium text-gray-700">New Image Preview</span>
//                       <button
//                         type="button"
//                         onClick={handleRemoveImage}
//                         className="text-red-600 hover:text-red-800 text-sm font-medium"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                     <div className="flex justify-center">
//                       <div className="relative w-48 h-48 border border-gray-200 rounded-lg overflow-hidden">
//                         <img
//                           src={imagePreview}
//                           alt="New category preview"
//                           className="w-full h-full object-cover"
//                         />
//                       </div>
//                     </div>
//                     <p className="text-center text-sm text-gray-600 mt-2">
//                       {formData.image instanceof File ? formData.image.name : formData.image}
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 // Upload Area
//                 <div className="flex items-center justify-center w-full">
//                   <label
//                     className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
//                       isDragging 
//                         ? 'border-blue-500 bg-blue-50' 
//                         : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
//                     }`}
//                     onDragOver={handleDragOver}
//                     onDragLeave={handleDragLeave}
//                     onDrop={handleDrop}
//                   >
//                     <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                       <svg
//                         className="w-8 h-8 mb-4 text-gray-500"
//                         aria-hidden="true"
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 20 16"
//                       >
//                         <path
//                           stroke="currentColor"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="2"
//                           d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
//                         />
//                       </svg>
//                       <p className="mb-2 text-sm text-gray-500">
//                         <span className="font-semibold">Click to upload</span> or drag and drop
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         PNG, JPG, GIF up to 10MB
//                       </p>
//                     </div>
//                     <input
//                       ref={fileInputRef}
//                       id="image"
//                       name="image"
//                       type="file"
//                       className="hidden"
//                       accept="image/*"
//                       onChange={handleImageChange}
//                     />
//                   </label>
//                 </div>
//               )}

//               {/* Existing Image Display */}
//               {existingImage && !imagePreview && (
//                 <div className="mt-6">
//                   <div className="flex items-center gap-4">
//                     {/* Image with hover X icon */}
//                     <div className="relative group">
//                       <div className="relative w-32 h-32 rounded-lg overflow-hidden">
//                         {existingImage ? (
//                           <>
//                             <img
//                               src={existingImage}
//                               alt="Current category image"
//                               className="w-full h-full object-cover" 
//                               onError={(e) => {
//                                 console.error('Image failed to load:', existingImage);
//                                 e.currentTarget.style.display = 'none';
//                               }}
//                             />
                            
//                             {/* X icon - only shows on hover */}
//                             <button
//                               type="button"
//                               onClick={handleRemoveExistingImage}
//                               className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
//                               title="Remove image"
//                             >
//                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
//                               </svg>
//                             </button>
//                           </>
//                         ) : (
//                           <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
//                             <div className="text-center">
//                               <div className="w-16 h-16 mx-auto mb-2 text-gray-400">
//                                 <svg fill="currentColor" viewBox="0 0 20 20">
//                                   <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
//                                 </svg>
//                               </div>
//                               <p className="text-sm text-gray-600 font-medium">No image</p>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     {/* Delete button on the right side */}
//                     <button
//                       type="button"
//                       onClick={handleRemoveExistingImage}
//                       className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 px-3 py-2 border border-red-200 rounded-md hover:bg-red-50 transition-colors whitespace-nowrap"
//                     >
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                       </svg>
//                       Delete Image
//                     </button>
//                   </div>
//                 </div>
//               )}
              
//               {/* Image Status */}
//               <div className="mt-4 text-sm text-gray-600">
//                 {existingImage && !imagePreview ? (
//                   <p>✅ Current image: <span className="font-medium">{existingImage}</span></p>
//                 ) : imagePreview ? (
//                   <p>🔄 New image selected: <span className="font-medium">{formData.image instanceof File ? formData.image.name : formData.image}</span></p>
//                 ) : (
//                   <p>📷 No image selected</p>
//                 )}
//               </div>
//             </div>

//             {/* Form Actions */}
//             <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 w-full">
//               <button
//                 type="button"
//                 onClick={handleCancel}
//                 className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isLoading ? 'Updating...' : 'Update Category'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditSupplierCategoryPage;















'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { clientService } from '../../../app/utils/api-client';

interface SupplierCategoryFormData {
  name: string;
  description: string;
  productCategories: string[];
  productType: 'new' | 'scrap';
  image?: File | string | null;
}

interface SupplierCategory {
  _id: string;
  name: string;
  description: string;
  productCategories: string[];
  productType: 'new' | 'scrap';
  image?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  );
}

// Main component that uses useSearchParams - wrapped in Suspense
function EditSupplierCategoryContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState<SupplierCategoryFormData>({
    name: '',
    description: '',
    productCategories: [],
    productType: 'new',
    image: null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  // Get categoryId from URL on client-side only - FIXED
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      setCategoryId(id);
    }
  }, []);

  // Predefined product categories matching backend enum
  const productCategoriesOptions = [
    'Electronics',
    'Construction Materials',
    'Industrial Equipment',
    'Raw Materials',
    'Consumer Goods'
  ];

  // Fetch category data when categoryId is available
  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) {
        // Wait for categoryId to be set
        return;
      }

      try {
        setIsFetching(true);
        console.log('🔄 Fetching category data for ID:', categoryId);
        
        const response = await clientService.get<ApiResponse<SupplierCategory>>(`/supplier-categories/${categoryId}`);
        
        console.log('✅ Category data received:', response.data);
        
        const result = response.data;
        if (result.success) {
          const category: SupplierCategory = result.data;
          setFormData({
            name: category.name,
            description: category.description,
            productCategories: category.productCategories,
            productType: category.productType,
            image: category.image || ''
          });

          // Set existing image if available
          if (category.image) {
            setExistingImage(category.image);
          }
        } else {
          alert(result.message || 'Failed to fetch category data');
          router.push('/supplier/supplier-categories');
        }
      } catch (error) {
        console.error('❌ Error fetching supplier category:', error);
        alert('Error fetching supplier category. Please check your connection.');
        router.push('/supplier/supplier-categories');
      } finally {
        setIsFetching(false);
      }
    };

    fetchCategory();
  }, [categoryId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'productCategories') {
      setFormData(prev => ({
        ...prev,
        productCategories: value ? [value] : []
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProductTypeChange = (type: 'new' | 'scrap') => {
    setFormData(prev => ({
      ...prev,
      productType: type
    }));
  };

  // Handle file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Process the image file and create preview
  const processImageFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    // Update form data with File object
    setFormData(prev => ({
      ...prev,
      image: file
    }));

    // Clear existing image when new image is selected
    setExistingImage(null);
  };

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processImageFile(files[0]);
    }
  };

  // Remove image preview
  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview); // Clean up memory
    }
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove existing image
  const handleRemoveExistingImage = () => {
    setExistingImage(null);
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
  };

  // Handle form submission using axios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryId) {
      alert('Category ID is missing');
      return;
    }

    setIsLoading(true);

    try {
      // Validate that a product category is selected
      if (formData.productCategories.length === 0) {
        alert('Please select a product category');
        setIsLoading(false);
        return;
      }

      console.log('🔄 Updating category with data:', {
        name: formData.name,
        description: formData.description,
        productCategories: formData.productCategories,
        productType: formData.productType,
        hasNewImage: formData.image instanceof File
      });

      // Create FormData object for file upload
      const submitFormData = new FormData();
      
      // Append text fields
      submitFormData.append('name', formData.name);
      submitFormData.append('description', formData.description);
      submitFormData.append('productType', formData.productType);
      
      // Append product categories as JSON string
      submitFormData.append('productCategories', JSON.stringify(formData.productCategories));
      
      // Append image file if it's a new File object
      if (formData.image instanceof File) {
        submitFormData.append('image', formData.image);
      }

      const response = await clientService.put<ApiResponse>(
        `/supplier-categories/${categoryId}`,
        submitFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const result = response.data;
      console.log('✅ Update response:', result);

      if (result.success) {
        await queryClient.invalidateQueries({ 
          queryKey: ['supplier-categories'], 
          refetchType: 'active' 
        });
        
        alert('Supplier category updated successfully!');
        router.push('/supplier/supplier-categories');
      } else {
        alert(result.message || 'Failed to update supplier category');
      }
    } catch (error) {
      console.error('❌ Error updating supplier category:', error);
      alert('Error updating supplier category. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/supplier/supplier-categories');
  };

  // Show loading while fetching categoryId or category data
  if (!categoryId || isFetching) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Supplier Category</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Update the supplier category information below.
                </p>
                {categoryId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Category ID: {categoryId}
                  </p>
                )}
              </div>
              <Link
                href="/supplier/supplier-categories"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                ← Back to Supplier
              </Link>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Category Name */}
            <div className="w-full">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter category name"
              />
            </div>

            {/* Product Categories - Simple Select */}
            <div className="w-full">
              <label htmlFor="productCategories" className="block text-sm font-medium text-gray-700 mb-2">
                Product Categories *
              </label>
              <select
                id="productCategories"
                name="productCategories"
                value={formData.productCategories[0] || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select Product Category</option>
                {productCategoriesOptions.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="w-full">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter category description"
              />
            </div>

            {/* Product Type */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Product Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* New Products Card */}
                <div
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    formData.productType === 'new'
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  onClick={() => handleProductTypeChange('new')}
                >
                  <div className="flex items-start space-x-3">
                    <div className="shrink-0">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.productType === 'new'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-400'
                      }`}>
                        {formData.productType === 'new' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        New Products
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Suppliers deal with brand new, unused products
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scrap Products Card */}
                <div
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    formData.productType === 'scrap'
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  onClick={() => handleProductTypeChange('scrap')}
                >
                  <div className="flex items-start space-x-3">
                    <div className="shrink-0">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.productType === 'scrap'
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-400'
                      }`}>
                        {formData.productType === 'scrap' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        Scrap Products
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Suppliers deal with used, recycled, or scrap materials
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Image */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Image
              </label>
              
              {imagePreview ? (
                // New Image Preview
                <div className="relative">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-700">New Image Preview</span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex justify-center">
                      <div className="relative w-48 h-48 border border-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="New category preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">
                      {formData.image instanceof File ? formData.image.name : formData.image}
                    </p>
                  </div>
                </div>
              ) : (
                // Upload Area
                <div className="flex items-center justify-center w-full">
                  <label
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      id="image"
                      name="image"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              )}

              {/* Existing Image Display */}
              {existingImage && !imagePreview && (
                <div className="mt-6">
                  <div className="flex items-center gap-4">
                    {/* Image with hover X icon */}
                    <div className="relative group">
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                        {existingImage ? (
                          <>
                            <img
                              src={existingImage}
                              alt="Current category image"
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                console.error('Image failed to load:', existingImage);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            
                            {/* X icon - only shows on hover */}
                            <button
                              type="button"
                              onClick={handleRemoveExistingImage}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                              title="Remove image"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
                            <div className="text-center">
                              <div className="w-16 h-16 mx-auto mb-2 text-gray-400">
                                <svg fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <p className="text-sm text-gray-600 font-medium">No image</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delete button on the right side */}
                    <button
                      type="button"
                      onClick={handleRemoveExistingImage}
                      className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 px-3 py-2 border border-red-200 rounded-md hover:bg-red-50 transition-colors whitespace-nowrap"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Image
                    </button>
                  </div>
                </div>
              )}
              
              {/* Image Status */}
              <div className="mt-4 text-sm text-gray-600">
                {existingImage && !imagePreview ? (
                  <p>✅ Current image: <span className="font-medium">{existingImage}</span></p>
                ) : imagePreview ? (
                  <p>🔄 New image selected: <span className="font-medium">{formData.image instanceof File ? formData.image.name : formData.image}</span></p>
                ) : (
                  <p>📷 No image selected</p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 w-full">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Main page export with Suspense boundary
export default function EditSupplierCategoryPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EditSupplierCategoryContent />
    </Suspense>
  );
}