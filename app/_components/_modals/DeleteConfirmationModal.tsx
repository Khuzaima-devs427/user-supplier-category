// 'use client';

// import React from 'react';

// interface DeleteConfirmationModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onConfirm: () => Promise<void>;
//   title: string;
//   message: string;
//   itemName?: string;
//   isLoading?: boolean;
//   type?: 'user' | 'supplier'; // Add type to customize the modal
// }

// const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
//   isOpen,
//   onClose,
//   onConfirm,
//   title,
//   message,
//   itemName,
//   isLoading = false,
//   type = 'user' // Default to user
// }) => {
//   const handleConfirm = async () => {
//     try {
//       await onConfirm();
//     } catch (error) {
//       console.error('Error in delete confirmation:', error);
//     }
//   };

//   const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (e.target === e.currentTarget && !isLoading) {
//       onClose();
//     }
//   };

//   // Dynamic content based on type
//   const getItemTypeText = () => {
//     return type === 'supplier' ? 'Supplier' : 'User';
//   };

//   const getDeleteButtonText = () => {
//     return type === 'supplier' ? 'Delete Supplier' : 'Delete User';
//   };

//   if (!isOpen) return null;

//   return (
//     <div 
//       className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
//       onClick={handleBackdropClick}
//     >
//       <div className="bg-white rounded-2xl w-full max-w-md">
//         <div className="p-6">
//           {/* Header with Icon */}
//           <div className="text-center mb-6">
//             <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-50 rounded-full mb-4 border-4 border-red-100">
//               <svg 
//                 className="w-8 h-8 text-red-600" 
//                 fill="none" 
//                 stroke="currentColor" 
//                 viewBox="0 0 24 24"
//               >
//                 <path 
//                   strokeLinecap="round" 
//                   strokeLinejoin="round" 
//                   strokeWidth={2}
//                   d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
//                 />
//               </svg>
//             </div>
            
//             <h3 className="text-xl font-bold text-gray-900 mb-2">
//               {title}
//             </h3>
            
//             <div className="space-y-3">
//               <p className="text-gray-600 leading-relaxed">
//                 {message}
//               </p>
              
//               {itemName && (
//                 <div className="bg-red-50 rounded-lg p-3 border border-red-200">
//                   <p className="text-sm font-semibold text-gray-700 mb-1">
//                     {getItemTypeText()} to be deleted:
//                   </p>
//                   <p className="font-bold text-red-700">
//                     "{itemName}"
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Warning Note */}
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
//             <div className="flex items-start">
//               <svg className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//               </svg>
//               <p className="text-sm text-yellow-800">
//                 This action cannot be undone. All {getItemTypeText().toLowerCase()} data will be permanently removed.
//               </p>
//             </div>
//           </div>

//           {/* Actions - Simplified */}
//           <div className="flex gap-3 justify-end">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={isLoading}
//               className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               onClick={handleConfirm}
//               disabled={isLoading}
//               className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-colors duration-200"
//             >
//               {isLoading ? (
//                 <>
//                   <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Deleting...
//                 </>
//               ) : (
//                 <>
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                   </svg>
//                   {getDeleteButtonText()}
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DeleteConfirmationModal;









'use client';

import React from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
  type?: 'user' | 'supplier' | 'category' | 'supplier-category'; // Added supplier-category type
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
  type = 'user' // Default to user
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error in delete confirmation:', error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  // Dynamic content based on type
  const getItemTypeText = () => {
    switch (type) {
      case 'supplier':
        return 'Supplier';
      case 'category':
        return 'User Category';
      case 'supplier-category':
        return 'Supplier Category';
      default:
        return 'User';
    }
  };

  const getDeleteButtonText = () => {
    if (isLoading) {
      switch (type) {
        case 'supplier':
          return 'Deleting Supplier...';
        case 'category':
          return 'Deleting Category...';
        case 'supplier-category':
          return 'Deleting Supplier Category...';
        default:
          return 'Deleting User...';
      }
    }
    
    switch (type) {
      case 'supplier':
        return 'Delete Supplier';
      case 'category':
        return 'Delete Category';
      case 'supplier-category':
        return 'Delete Supplier Category';
      default:
        return 'Delete User';
    }
  };

  const getWarningMessage = () => {
    switch (type) {
      case 'category':
        return `This action cannot be undone. This user category and all associated data will be permanently removed. Users assigned to this category may be affected.`;
      case 'supplier-category':
        return `This action cannot be undone. This supplier category and all associated data will be permanently removed. Suppliers assigned to this category may be affected.`;
      case 'supplier':
        return `This action cannot be undone. All supplier data, including their products and transactions, will be permanently removed.`;
      default:
        return `This action cannot be undone. All ${getItemTypeText().toLowerCase()} data will be permanently removed.`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'category':
        return (
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case 'supplier-category':
        return (
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case 'supplier':
        return (
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
    }
  };

  const getSeverityColor = () => {
    switch (type) {
      case 'supplier-category':
      case 'category':
        return 'bg-red-50 border-red-200';
      case 'supplier':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  const getSeverityText = () => {
    switch (type) {
      case 'supplier-category':
      case 'category':
        return 'High Impact: This will affect associated suppliers';
      case 'supplier':
        return 'High Impact: All supplier data will be lost';
      default:
        return 'This action cannot be undone';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0  bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-[3px]"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-md transform transition-all">
        <div className="p-6">
          {/* Header with Icon */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-50 rounded-full mb-4 border-4 border-red-100">
              {getIcon()}
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {title}
            </h3>
            
            <div className="space-y-3">
              <p className="text-gray-600 leading-relaxed">
                {message}
              </p>
              
              {itemName && (
                <div className={`rounded-lg p-3 border ${getSeverityColor()}`}>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    {getItemTypeText()} to be deleted:
                  </p>
                  <p className="font-bold text-red-700 text-lg">
                    "{itemName}"
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {getSeverityText()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Warning Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <div className="flex items-start">
              <svg className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-yellow-800">
                {getWarningMessage()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {getDeleteButtonText()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;