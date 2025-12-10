// // app/_components/_hooks/useSupplierCategoryColumns.tsx
// import React, { useMemo, useState, useRef, useEffect } from 'react';
// import { createPortal } from 'react-dom';
// import { Eye, Edit, Trash2, ChevronDown, Check } from 'lucide-react';

// interface SupplierCategory {
//   id: string;
//   serialNo: number;
//   name: string;
//   description: string;
//   productCategories: string[];
//   productType: 'new' | 'scrap';
//   status: 'active' | 'inactive';
//   createdAt: string;
//   updatedAt: string;
// }

// interface UseSupplierCategoryColumnsProps {
//   onEdit?: (category: SupplierCategory) => void;
//   onDelete?: (category: SupplierCategory) => void;
//   onStatusChange?: (category: SupplierCategory, status: 'active' | 'inactive') => void;
//   onView?: (category: SupplierCategory) => void;
// }

// /* -------------------------
//    Portal Dropdown
// -------------------------- */
// type Option<T = any> = { value: T; label: string };

// function PortalDropdown<T>({
//   anchorEl,
//   isOpen,
//   options,
//   onSelect,
//   selectedValue,
//   onClose,
//   width = 128
// }: {
//   anchorEl: HTMLElement | null;
//   isOpen: boolean;
//   options: Option<T>[];
//   onSelect: (option: Option<T>) => void;
//   selectedValue?: T;
//   onClose: () => void;
//   width?: number | string;
// }) {
//   const menuRef = useRef<HTMLDivElement | null>(null);
//   const [pos, setPos] = useState<{ top: number; left: number; transformOrigin?: string } | null>(null);

//   useEffect(() => {
//     if (!isOpen || !anchorEl) {
//       setPos(null);
//       return;
//     }

//     function updatePosition() {
//       if (!anchorEl) return;

//       const rect = anchorEl.getBoundingClientRect();
//       const scrollY = window.scrollY || window.pageYOffset;
//       const scrollX = window.scrollX || window.pageXOffset;
//       const left = rect.left + scrollX;
//       let top = rect.bottom + scrollY + 6;
//       let transformOrigin = 'top left';

//       const viewportHeight = window.innerHeight;
//       const estimatedMenuHeight = menuRef.current ? menuRef.current.offsetHeight : 160;
//       const spaceBelow = viewportHeight - rect.bottom;
//       const spaceAbove = rect.top;

//       if (spaceBelow < estimatedMenuHeight && spaceAbove >= estimatedMenuHeight) {
//         top = rect.top + scrollY - estimatedMenuHeight - 6;
//         transformOrigin = 'bottom left';
//       }

//       const viewportWidth = window.innerWidth;
//       const menuWidth = typeof width === 'number' ? width : Number(width) || 200;

//       let finalLeft = left;
//       if (left + menuWidth > viewportWidth + scrollX - 8) {
//         finalLeft = Math.max(8 + scrollX, viewportWidth + scrollX - menuWidth - 8);
//       }

//       setPos({ top, left: finalLeft, transformOrigin });
//     }

//     updatePosition();
//     const ro = new ResizeObserver(updatePosition);
//     ro.observe(document.documentElement);
//     window.addEventListener('scroll', updatePosition, true);
//     window.addEventListener('resize', updatePosition);

//     return () => {
//       ro.disconnect();
//       window.removeEventListener('scroll', updatePosition, true);
//       window.removeEventListener('resize', updatePosition);
//     };
//   }, [isOpen, anchorEl, width]);

//   if (!isOpen || !anchorEl) return null;

//   return createPortal(
//     <>
//       <div className="fixed inset-0 z-40" onClick={onClose} />

//       <div
//         ref={menuRef}
//         style={{
//           position: 'absolute',
//           top: pos?.top ?? 0,
//           left: pos?.left ?? 0,
//           width: typeof width === 'number' ? `${width}px` : width,
//           transformOrigin: pos?.transformOrigin ?? 'top left'
//         }}
//         className="z-50 bg-white rounded-md shadow-lg border border-gray-200"
//       >
//         <div className="py-1">
//           {options.map((option) => (
//             <button
//               key={String(option.value)}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onSelect(option);
//               }}
//               className={`flex items-center justify-between w-full px-3 py-2 text-xs hover:bg-gray-50 ${
//                 selectedValue === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
//               }`}
//             >
//               {option.label}
//               {selectedValue === option.value && <Check className="w-3 h-3" />}
//             </button>
//           ))}
//         </div>
//       </div>
//     </>,
//     document.body
//   );
// }

// /* -------------------------
//    Main Hook
// -------------------------- */
// export const useSupplierCategoryColumns = ({
//   onEdit,
//   onDelete,
//   onStatusChange,
//   onView
// }: UseSupplierCategoryColumnsProps) => {
//   const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
//   const refs = useRef<Record<string, HTMLButtonElement | null>>({});

//   const statusOptions = [
//     { value: 'active' as const, label: 'Active', color: 'bg-green-100 text-green-800' },
//     { value: 'inactive' as const, label: 'Inactive', color: 'bg-red-100 text-red-800' }
//   ];

//   const productTypeOptions = [
//     { value: 'new' as const, label: 'New Products', color: 'bg-blue-100 text-blue-800' },
//     { value: 'scrap' as const, label: 'Scrap Products', color: 'bg-orange-100 text-orange-800' }
//   ];

//   const columns = useMemo(
//     () => [
//       {
//         name: 'S.No',
//         selector: (row: SupplierCategory) => row.serialNo,
//         sortable: true,
//         width: '80px',
//       },
//       {
//         name: 'Name',
//         selector: (row: SupplierCategory) => row.name,
//         sortable: true,
//       },
//       {
//         name: 'Description',
//         selector: (row: SupplierCategory) => row.description,
//         sortable: true,
//         cell: (row: SupplierCategory) => (
//           <div className="max-w-xs truncate" title={row.description || 'No description'}>
//             {row.description || 'No description'}
//           </div>
//         ),
//       },
//       {
//         name: 'Product Categories',
//         selector: (row: SupplierCategory) => row.productCategories.join(', '),
//         sortable: true,
//         cell: (row: SupplierCategory) => (
//           <div className="max-w-xs">
//             <div className="flex flex-wrap gap-1">
//               {row.productCategories.slice(0, 2).map((category, index) => (
//                 <span
//                   key={index}
//                   className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full"
//                 >
//                   {category}
//                 </span>
//               ))}
//               {row.productCategories.length > 2 && (
//                 <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
//                   +{row.productCategories.length - 2} more
//                 </span>
//               )}
//             </div>
//           </div>
//         ),
//       },
//       {
//         name: 'Product Type',
//         selector: (row: SupplierCategory) => row.productType,
//         sortable: true,
//         cell: (row: SupplierCategory) => {
//           const current = productTypeOptions.find((p) => p.value === row.productType);
//           return (
//             <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${current?.color}`}>
//               {current?.label}
//             </span>
//           );
//         }
//       },
//       {
//         name: 'Status',
//         selector: (row: SupplierCategory) => row.status,
//         sortable: true,
//         cell: (row: SupplierCategory) => {
//           const id = `status-${row.id}`;
//           const isOpen = activeDropdown === id;
//           const current = statusOptions.find((s) => s.value === row.status);

//           return (
//             <div className="relative overflow-visible">
//               <button
//                 ref={(el) => {
//                   refs.current[id] = el;
//                 }}
//                 onClick={() => setActiveDropdown(isOpen ? null : id)}
//                 className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full transition-all duration-200 ${current?.color}`}
//               >
//                 {current?.label}
//                 <ChevronDown className={`w-3 h-3 ml-1 ${isOpen ? 'rotate-180' : ''}`} />
//               </button>

//               <PortalDropdown
//                 anchorEl={refs.current[id]}
//                 isOpen={isOpen}
//                 selectedValue={row.status}
//                 options={statusOptions}
//                 onClose={() => setActiveDropdown(null)}
//                 onSelect={(o) => {
//                   onStatusChange?.(row, o.value);
//                   setActiveDropdown(null);
//                 }}
//               />
//             </div>
//           );
//         }
//       },
//       {
//         name: 'Created Date',
//         selector: (row: SupplierCategory) => row.createdAt,
//         sortable: true,
//         width: '140px',
//         cell: (row: SupplierCategory) => new Date(row.createdAt).toLocaleDateString(),
//       },
//       {
//         name: 'Actions',
//         cell: (row: SupplierCategory) => (
//           <div className="flex space-x-2">
//             <button
//               onClick={() => onView?.(row)}
//               className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition duration-200"
//               title="View Supplier Category"
//             >
//               <Eye className="w-3 h-3" />
//             </button>
//             <button
//               onClick={() => onEdit?.(row)}
//               className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition duration-200"
//               title="Edit Supplier Category"
//             >
//               <Edit className="w-3 h-3" />
//             </button>
//             <button
//               onClick={() => onDelete?.(row)}
//               className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition duration-200"
//               title="Delete Supplier Category"
//             >
//               <Trash2 className="w-3 h-3" />
//             </button>
//           </div>
//         ),
//       },
//     ],
//     [onEdit, onDelete, onStatusChange, onView, activeDropdown]
//   );

//   return columns;
// };




















import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Edit, Trash2, ChevronDown, Check } from 'lucide-react';

interface SupplierCategory {
  id: string;
  serialNo: number;
  name: string;
  description: string;
  productCategories: string[];
  productType: 'new' | 'scrap';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface UseSupplierCategoryColumnsProps {
  onEdit?: (category: SupplierCategory) => void;
  onDelete?: (category: SupplierCategory) => void;
  onStatusChange?: (category: SupplierCategory, status: 'active' | 'inactive') => void;
  onView?: (category: SupplierCategory) => void;
  permissions?: { [key: string]: boolean };
}

/* -------------------------
   Portal Dropdown
-------------------------- */
type Option<T = any> = { value: T; label: string };

function PortalDropdown<T>({
  anchorEl,
  isOpen,
  options,
  onSelect,
  selectedValue,
  onClose,
  width = 128
}: {
  anchorEl: HTMLElement | null;
  isOpen: boolean;
  options: Option<T>[];
  onSelect: (option: Option<T>) => void;
  selectedValue?: T;
  onClose: () => void;
  width?: number | string;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number; transformOrigin?: string } | null>(null);

  useEffect(() => {
    if (!isOpen || !anchorEl) {
      setPos(null);
      return;
    }

    function updatePosition() {
      if (!anchorEl) return;

      const rect = anchorEl.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;
      const left = rect.left + scrollX;
      let top = rect.bottom + scrollY + 6;
      let transformOrigin = 'top left';

      const viewportHeight = window.innerHeight;
      const estimatedMenuHeight = menuRef.current ? menuRef.current.offsetHeight : 160;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < estimatedMenuHeight && spaceAbove >= estimatedMenuHeight) {
        top = rect.top + scrollY - estimatedMenuHeight - 6;
        transformOrigin = 'bottom left';
      }

      const viewportWidth = window.innerWidth;
      const menuWidth = typeof width === 'number' ? width : Number(width) || 200;

      let finalLeft = left;
      if (left + menuWidth > viewportWidth + scrollX - 8) {
        finalLeft = Math.max(8 + scrollX, viewportWidth + scrollX - menuWidth - 8);
      }

      setPos({ top, left: finalLeft, transformOrigin });
    }

    updatePosition();
    const ro = new ResizeObserver(updatePosition);
    ro.observe(document.documentElement);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, anchorEl, width]);

  if (!isOpen || !anchorEl) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        ref={menuRef}
        style={{
          position: 'absolute',
          top: pos?.top ?? 0,
          left: pos?.left ?? 0,
          width: typeof width === 'number' ? `${width}px` : width,
          transformOrigin: pos?.transformOrigin ?? 'top left'
        }}
        className="z-50 bg-white rounded-md shadow-lg border border-gray-200"
      >
        <div className="py-1">
          {options.map((option) => (
            <button
              key={String(option.value)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(option);
              }}
              className={`flex items-center justify-between w-full px-3 py-2 text-xs hover:bg-gray-50 ${
                selectedValue === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              {option.label}
              {selectedValue === option.value && <Check className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </div>
    </>,
    document.body
  );
}

/* -------------------------
   Main Hook
-------------------------- */
export const useSupplierCategoryColumns = ({
  onEdit,
  onDelete,
  onStatusChange,
  onView,
  permissions = {}
}: UseSupplierCategoryColumnsProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const statusOptions = [
    { value: 'active' as const, label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'inactive' as const, label: 'Inactive', color: 'bg-red-100 text-red-800' }
  ];

  const productTypeOptions = [
    { value: 'new' as const, label: 'New Products', color: 'bg-blue-100 text-blue-800' },
    { value: 'scrap' as const, label: 'Scrap Products', color: 'bg-orange-100 text-orange-800' }
  ];

  // Helper function to check permissions
  const hasPermission = (permissionKey: string): boolean => {
    // If user is static admin, they have ALL permissions
    if (permissions.isStaticAdmin === true) {
      console.log(`✅ Static admin override for permission: ${permissionKey}`);
      return true;
    }
    
    // Check specific permission
    const hasPerm = permissions[permissionKey] === true;
    console.log(`🔍 useSupplierCategoryColumns checking "${permissionKey}": ${hasPerm}`);
    return hasPerm;
  };

  const columns = useMemo(
    () => [
      {
        name: 'S.No',
        selector: (row: SupplierCategory) => row.serialNo,
        sortable: true,
        width: '80px',
      },
      {
        name: 'Name',
        selector: (row: SupplierCategory) => row.name,
        sortable: true,
      },
      {
        name: 'Description',
        selector: (row: SupplierCategory) => row.description,
        sortable: true,
        cell: (row: SupplierCategory) => (
          <div className="max-w-xs truncate" title={row.description || 'No description'}>
            {row.description || 'No description'}
          </div>
        ),
      },
      {
        name: 'Product Categories',
        selector: (row: SupplierCategory) => row.productCategories.join(', '),
        sortable: true,
        cell: (row: SupplierCategory) => (
          <div className="max-w-xs">
            <div className="flex flex-wrap gap-1">
              {row.productCategories.slice(0, 2).map((category, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full"
                >
                  {category}
                </span>
              ))}
              {row.productCategories.length > 2 && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  +{row.productCategories.length - 2} more
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        name: 'Product Type',
        selector: (row: SupplierCategory) => row.productType,
        sortable: true,
        cell: (row: SupplierCategory) => {
          const current = productTypeOptions.find((p) => p.value === row.productType);
          return (
            <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${current?.color}`}>
              {current?.label}
            </span>
          );
        }
      },
      {
        name: 'Status',
        selector: (row: SupplierCategory) => row.status,
        sortable: true,
        cell: (row: SupplierCategory) => {
          const id = `status-${row.id}`;
          const isOpen = activeDropdown === id;
          const current = statusOptions.find((s) => s.value === row.status);
          
          // Check if user has permission to change status
          const canChangeStatus = hasPermission('supplier_categories.edit');

          console.log('🔍 Status dropdown permissions for supplier categories:', {
            rowId: row.id,
            canChangeStatus,
            isStaticAdmin: permissions.isStaticAdmin,
            supplier_categories_edit: permissions['supplier_categories.edit']
          });

          return (
            <div className="relative overflow-visible">
              <button
                ref={(el) => {
                  refs.current[id] = el;
                }}
                onClick={() => {
                  if (canChangeStatus) {
                    setActiveDropdown(isOpen ? null : id);
                  }
                }}
                className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full transition-all duration-200 ${current?.color} ${
                  !canChangeStatus ? 'cursor-not-allowed opacity-75' : ''
                }`}
                disabled={!canChangeStatus}
                title={!canChangeStatus ? "No permission to change status" : ""}
              >
                {current?.label}
                <ChevronDown className={`w-3 h-3 ml-1 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              <PortalDropdown
                anchorEl={refs.current[id]}
                isOpen={isOpen && canChangeStatus}
                selectedValue={row.status}
                options={statusOptions}
                onClose={() => setActiveDropdown(null)}
                onSelect={(o) => {
                  onStatusChange?.(row, o.value);
                  setActiveDropdown(null);
                }}
              />
            </div>
          );
        }
      },
      {
        name: 'Created Date',
        selector: (row: SupplierCategory) => row.createdAt,
        sortable: true,
        width: '140px',
        cell: (row: SupplierCategory) => new Date(row.createdAt).toLocaleDateString(),
      },
      {
        name: 'Actions',
        cell: (row: SupplierCategory) => {
          // Check permissions for each action
          const canView = hasPermission('supplier_categories.view') || permissions.view === true;
          const canEdit = hasPermission('supplier_categories.edit');
          const canDelete = hasPermission('supplier_categories.delete');

          console.log('🔍 Row action permissions for supplier categories:', {
            rowId: row.id,
            canView,
            canEdit,
            canDelete,
            isStaticAdmin: permissions.isStaticAdmin,
            supplier_categories_edit: permissions['supplier_categories.edit'],
            supplier_categories_delete: permissions['supplier_categories.delete']
          });

          return (
            <div className="flex space-x-2">
              {canView ? (
                <button
                  onClick={() => onView?.(row)}
                  className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition duration-200"
                  title="View Supplier Category"
                >
                  <Eye className="w-3 h-3" />
                </button>
              ) : (
                <div className="flex items-center space-x-1 bg-gray-300 text-white px-2 py-1 rounded cursor-not-allowed opacity-50">
                  <Eye className="w-3 h-3" />
                </div>
              )}
              
              {canEdit ? (
                <button
                  onClick={() => onEdit?.(row)}
                  className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition duration-200"
                  title="Edit Supplier Category"
                >
                  <Edit className="w-3 h-3" />
                </button>
              ) : (
                <div 
                  className="flex items-center space-x-1 bg-gray-300 text-white px-2 py-1 rounded cursor-not-allowed opacity-50"
                  title="No edit permission"
                >
                  <Edit className="w-3 h-3" />
                </div>
              )}
              
              {canDelete ? (
                <button
                  onClick={() => onDelete?.(row)}
                  className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition duration-200"
                  title="Delete Supplier Category"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              ) : (
                <div 
                  className="flex items-center space-x-1 bg-gray-300 text-white px-2 py-1 rounded cursor-not-allowed opacity-50"
                  title="No delete permission"
                >
                  <Trash2 className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        },
      },
    ],
    [onEdit, onDelete, onStatusChange, onView, activeDropdown, permissions]
  );

  return columns;
};