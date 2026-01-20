import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Edit, Trash2, ChevronDown, Check, Star, Tag, FileText } from 'lucide-react';

// Interface for FeatureCategory items
interface FeatureCategoryItem {
  _id: string;
  name: string;
  description: string;
  type: string;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  featuredOrder: number | null;
  createdAt: string;
  updatedAt: string;
  serialNo?: number;
}

// Featured limit info interface
interface FeaturedLimitInfo {
  currentFeatured: number;
  maxFeatured: number;
  canAddMore: boolean;
  availableSlots: number;
  featuredList: Array<{
    id: string;
    name: string;
    order: number | null;
  }>;
}

interface UseFeatureCategoryColumnsProps {
  onEdit?: (item: FeatureCategoryItem) => void;
  onDelete?: (item: FeatureCategoryItem) => void;
  onStatusChange?: (item: FeatureCategoryItem, status: 'active' | 'inactive') => void;
  onFeaturedToggle?: (item: FeatureCategoryItem) => void;
  onView?: (item: FeatureCategoryItem) => void;
  permissions?: { [key: string]: boolean };
  featuredLimitInfo?: FeaturedLimitInfo | null;
}

/* -------------------------
   Portal Dropdown for Status
-------------------------- */
type Option<T = any> = { value: T; label: string; color?: string };

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
   Main Hook for Feature Category Columns
-------------------------- */
export const useFeatureCategoryColumns = ({
  onEdit,
  onDelete,
  onStatusChange,
  onFeaturedToggle,
  onView,
  permissions = {},
  featuredLimitInfo = null
}: UseFeatureCategoryColumnsProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const statusOptions = [
    { value: 'active' as const, label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'inactive' as const, label: 'Inactive', color: 'bg-red-100 text-red-800' }
  ];

  // Helper function to check permissions
  const hasPermission = (permissionKey: string): boolean => {
    // If user is static admin, they have ALL permissions
    if (permissions.isStaticAdmin === true) {
      return true;
    }
    
    // Check specific permission
    const hasPerm = permissions[permissionKey] === true;
    return hasPerm;
  };

  const columns = useMemo(
    () => [
      {
        name: 'S.No',
        selector: (row: FeatureCategoryItem) => row.serialNo || 0,
        sortable: true,
        width: '80px',
        cell: (row: FeatureCategoryItem) => (
          <div className="text-center text-gray-600 font-medium">
            {row.serialNo}
          </div>
        ),
      },
      {
        name: 'Name',
        selector: (row: FeatureCategoryItem) => row.name,
        sortable: true,
        width: '140px',
        cell: (row: FeatureCategoryItem) => (
          <div className="max-w-xs">
            <div className="font-medium text-gray-900 truncate" title={row.name}>
              {row.name}
            </div>
            {/* REMOVED description preview from here */}
          </div>
        ),
      },
      {
        name: 'Description',
        selector: (row: FeatureCategoryItem) => row.description,
        sortable: true,
        width: '210px',
        cell: (row: FeatureCategoryItem) => (

            <div className="max-w-[150px]">
              <div className="text-sm text-gray-700 truncate" title={row.description}>
                {row.description ? (
                  row.description.length > 70 ? `${row.description.substring(0, 70)}...` : row.description
                ) : (
                  <span className="text-gray-400 italic">No description</span>
                )}
              </div>
            </div>
        
        ),
      },
      {
        name: 'Type',
        selector: (row: FeatureCategoryItem) => row.type,
        sortable: true,
        width: '142px',
        cell: (row: FeatureCategoryItem) => (
            <div className="max-w-[100px]">
              <div className="text-sm font-medium text-gray-900 truncate" title={row.type}>
                {row.type}
              </div>
            </div>
      
        ),
      },
      {
        name: 'Status',
        selector: (row: FeatureCategoryItem) => row.status,
        sortable: true,
        width: '130px',
        cell: (row: FeatureCategoryItem) => {
          const id = `status-${row._id}`;
          const isOpen = activeDropdown === id;
          const current = statusOptions.find((s) => s.value === row.status);
          
          // Check if user has permission to change status
          const canChangeStatus = hasPermission('feature_categories.edit');

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
                className={`px-3 py-1.5 inline-flex items-center text-xs font-semibold rounded-lg transition-all duration-200 ${current?.color} ${
                  !canChangeStatus ? 'cursor-not-allowed opacity-75' : 'hover:opacity-90 cursor-pointer'
                }`}
                disabled={!canChangeStatus}
                title={!canChangeStatus ? "No permission to change status" : current?.label}
              >
                {current?.label}
                <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''} ${
                  !canChangeStatus ? 'text-gray-500' : ''
                }`} />
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
      // {
      //   name: 'Featured',
      //   selector: (row: FeatureCategoryItem) => row.isFeatured,
      //   sortable: true,
      //   width: '165px',
      //   cell: (row: FeatureCategoryItem) => {
      //     const isFeatured = row.isFeatured;
      //     const featuredOrder = row.featuredOrder;
      //     const canToggle = hasPermission('feature_categories.edit');
          
      //     // Check if we can feature this item
      //     const isLimitReached = featuredLimitInfo && !featuredLimitInfo.canAddMore;
          
      //     // FIXED: TypeScript issue - convert to boolean for disabled prop
      //     const isDisabled = !canToggle || (!isFeatured && isLimitReached) || false;

      //     return (
      //       <button
      //         onClick={() => {
      //           if (!canToggle) {
      //             return;
      //           }
                
      //           if (!isFeatured && isLimitReached) {
      //             // Limit reached - show error via toast (handled in parent)
      //             return;
      //           }
                
      //           onFeaturedToggle?.(row);
      //         }}
      //         disabled={isDisabled}
      //         className={`px-3 py-1.5 inline-flex items-center text-xs font-semibold rounded-lg transition-all duration-200 ${
      //           isFeatured 
      //             ? 'bg-blue-100 text-blue-700 border border-blue-200' 
      //             : 'bg-gray-100 text-gray-600 border border-gray-200'
      //         } ${
      //           isDisabled 
      //             ? 'cursor-not-allowed opacity-50' 
      //             : 'hover:opacity-90 cursor-pointer'
      //         }`}
      //         title={
      //           !canToggle ? "No permission to change featured status" :
      //           !isFeatured && isLimitReached ? `Maximum ${featuredLimitInfo?.maxFeatured} featured items reached` :
      //           isFeatured ? `Featured (Order: ${featuredOrder || 'N/A'})` :
      //           'Mark as Featured'
      //         }
      //       >
      //         <Star className={`w-3.5 h-3.5 mr-1.5 ${isFeatured ? 'fill-blue-500' : 'fill-gray-300'}`} />
      //         {isFeatured ? 'Featured' : 'Not Featured'}
      //         {isFeatured && featuredOrder && (
      //           <span className="ml-1.5 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
      //             #{featuredOrder}
      //           </span>
      //         )}
      //       </button>
      //     );
      //   }
      // },

      {
  name: 'Featured',
  selector: (row: FeatureCategoryItem) => row.isFeatured,
  sortable: true,
  width: '165px',
  cell: (row: FeatureCategoryItem) => {
    const isFeatured = row.isFeatured;
    const featuredOrder = row.featuredOrder;
    const isActive = row.status === 'active';
    const canToggle = hasPermission('feature_categories.edit');
    
    // Check if we can feature this item
    const isLimitReached = featuredLimitInfo && !featuredLimitInfo.canAddMore;
    
    // 🚨 NEW: Disable featuring if category is inactive
    const cannotFeatureDueToInactive = !isFeatured && !isActive;
    
    // FIXED: TypeScript issue - convert to boolean for disabled prop
    const isDisabled = !canToggle || (!isFeatured && isLimitReached) || cannotFeatureDueToInactive || false;

    let disabledReason = '';
    if (!canToggle) {
      disabledReason = "No permission to change featured status";
    } else if (cannotFeatureDueToInactive) {
      disabledReason = "Cannot feature an inactive category";
    } else if (!isFeatured && isLimitReached) {
      disabledReason = `Maximum ${featuredLimitInfo?.maxFeatured} featured items reached`;
    }

    return (
      <button
        onClick={() => {
          if (!canToggle) {
            return;
          }
          
          if (cannotFeatureDueToInactive) {
            // This will be handled by the parent handler
            return;
          }
          
          if (!isFeatured && isLimitReached) {
            // Limit reached - show error via toast (handled in parent)
            return;
          }
          
          onFeaturedToggle?.(row);
        }}
        disabled={isDisabled}
        className={`px-3 py-1.5 inline-flex items-center text-xs font-semibold rounded-lg transition-all duration-200 ${
          isFeatured 
            ? 'bg-blue-100 text-blue-700 border border-blue-200' 
            : isActive
              ? 'bg-gray-100 text-gray-600 border border-gray-200'
              : 'bg-gray-50 text-gray-400 border border-gray-200'
        } ${
          isDisabled 
            ? 'cursor-not-allowed opacity-50' 
            : 'hover:opacity-90 cursor-pointer'
        }`}
        title={
          disabledReason ||
          (isFeatured ? `Featured (Order: ${featuredOrder || 'N/A'})` : 'Mark as Featured')
        }
      >
        <Star className={`w-3.5 h-3.5 mr-1.5 ${
          isFeatured ? 'fill-blue-500' : 
          isActive ? 'fill-gray-300' : 'fill-gray-200'
        }`} />
        {isFeatured ? 'Featured' : 'Not Featured'}
        {!isActive && !isFeatured && ' (Inactive)'}
        {isFeatured && featuredOrder && (
          <span className="ml-1.5 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            #{featuredOrder}
          </span>
        )}
      </button>
    );
  }
},
      {
        name: 'Actions',
        width: '150px',
        cell: (row: FeatureCategoryItem) => {
          // Check permissions for each action
          const canView = hasPermission('feature_categories.view');
          const canEdit = hasPermission('feature_categories.edit');
          const canDelete = hasPermission('feature_categories.delete');

          return (
            <div className="flex items-center gap-2">
              {canView ? (
                <button
                  onClick={() => onView?.(row)}
                  className="flex items-center justify-center w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition duration-200 cursor-pointer"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              ) : (
                <div 
                  className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-400 rounded-md cursor-not-allowed"
                  title="No view permission"
                >
                  <Eye className="w-4 h-4" />
                </div>
              )}
              
              {canEdit ? (
                <button
                  onClick={() => onEdit?.(row)}
                  className="flex items-center justify-center w-8 h-8 bg-green-50 hover:bg-green-100 text-green-600 rounded-md transition duration-200 cursor-pointer"
                  title="Edit Item"
                >
                  <Edit className="w-4 h-4" />
                </button>
              ) : (
                <div 
                  className="flex items-center justify-center w-8 h-8 bg-gray-50 text-gray-300 rounded-md cursor-not-allowed"
                  title="No edit permission"
                >
                  <Edit className="w-4 h-4" />
                </div>
              )}
              
              {canDelete ? (
                <button
                  onClick={() => onDelete?.(row)}
                  className="flex items-center justify-center w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition duration-200 cursor-pointer"
                  title="Delete Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <div 
                  className="flex items-center justify-center w-8 h-8 bg-gray-50 text-gray-300 rounded-md cursor-not-allowed"
                  title="No delete permission"
                >
                  <Trash2 className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        },
      },
    ],
    [onEdit, onDelete, onStatusChange, onFeaturedToggle, onView, activeDropdown, permissions, featuredLimitInfo]
  );

  return columns;
};