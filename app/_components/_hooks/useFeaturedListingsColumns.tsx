import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Edit, Trash2, ChevronDown, Check } from 'lucide-react';

export interface FeatureListing {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  formattedPrice: string;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  displayOrder: number;
  featureCategory: string;
  createdAt: string;
  updatedAt: string;
}

export type DataGridRow = FeatureListing & {
  serialNo: number;
  categoryId?: string;
  id: string;
  rowType: 'listing';
};

export interface UseFeatureListingColumnsProps {
  onEdit?: (item: DataGridRow) => void;
  onDelete?: (item: DataGridRow) => void;
  onStatusChange?: (item: DataGridRow, status: 'active' | 'inactive') => void;
  onFeaturedToggle?: (item: DataGridRow) => void;
  onView?: (item: DataGridRow) => void;
  permissions?: { [key: string]: boolean };
  featuredCount?: number;
  // NEW: Add data prop for local state management
  data?: DataGridRow[];
  // NEW: Add refresh callback
  onRefresh?: () => void;
}

/* -------------------------
   Portal Dropdown for Status
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
          transformOrigin: pos?.transformOrigin ?? 'top left',
          zIndex: 9999
        }}
        className="bg-white rounded-md shadow-lg border border-gray-200"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="py-1">
          {options.map((option) => (
            <button
              key={String(option.value)}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('🎯 DROPDOWN OPTION CLICKED:', option);
                onSelect(option);
                onClose();
              }}
              className={`flex items-center justify-between w-full px-3 py-2 text-xs hover:bg-gray-50 active:bg-gray-100 ${
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
   Main Hook for Feature Listings Columns
-------------------------- */
export const useFeatureListingsColumns = ({
  onEdit,
  onDelete,
  onStatusChange,
  onFeaturedToggle,
  onView,
  permissions = {},
  featuredCount = 0,
  // NEW: Add data and onRefresh
  data = [],
  onRefresh,
}: UseFeatureListingColumnsProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  
  // FIXED: Track pending status updates for immediate UI feedback
  const pendingUpdatesRef = useRef<Record<string, 'active' | 'inactive'>>({});

  const statusOptions = [
    { value: 'active' as const, label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'inactive' as const, label: 'Inactive', color: 'bg-red-100 text-red-800' }
  ];

  // Helper function to check permissions - SAME PATTERN AS HERO SLIDER
  const hasPermission = (permissionKey: string): boolean => {
    // If user is static admin, they have ALL permissions
    if (permissions.isStaticAdmin === true) {
      console.log(`✅ Static admin override for permission: ${permissionKey}`);
      return true;
    }
    
    // Check specific permission
    const hasPerm = permissions[permissionKey] === true;
    console.log(`🔍 useFeatureListingsColumns checking "${permissionKey}": ${hasPerm}`);
    return hasPerm;
  };

  // FIXED: Get the current status for a row (with pending updates)
  const getCurrentStatus = (row: DataGridRow): 'active' | 'inactive' => {
    // First check if we have a pending update for this row
    if (pendingUpdatesRef.current[row._id]) {
      return pendingUpdatesRef.current[row._id];
    }
    
    // Otherwise return the row status from data
    return row.status;
  };

  const columns = useMemo(
    () => [
      {
        name: 'S.No',
        selector: (row: DataGridRow) => row.serialNo,
        sortable: true,
        width: '80px',
        cell: (row: DataGridRow) => (
          <div className="text-center text-gray-600 font-medium">
            {row.serialNo}
          </div>
        ),
      },
      {
        name: 'Name',
        selector: (row: DataGridRow) => row.name,
        sortable: true,
        width: '180px',
        cell: (row: DataGridRow) => (
          <div>
            <div className="font-medium text-gray-600 truncate" title={row.name}>
              {row.name}
            </div>
            {/* Removed ID display for cleaner UI like hero slider */}
          </div>
        ),
      },
      {
        name: 'Description',
        selector: (row: DataGridRow) => row.description,
        sortable: true,
        width: '290px',
        cell: (row: DataGridRow) => (
          <div className="text-sm text-gray-600 line-clamp-2" title={row.description}>
            {row.description}
          </div>
        ),
      },
      {
        name: 'Status',
        selector: (row: DataGridRow) => row.status,
        sortable: true,
        width: '140px',
        cell: (row: DataGridRow) => {
          const id = `status-${row._id}`;
          const isOpen = activeDropdown === id;
          
          // Get current status with pending updates
          const currentStatus = getCurrentStatus(row);
          const current = statusOptions.find((s) => s.value === currentStatus);
          
          // Check if user has permission to change status
          const canChangeStatus = hasPermission('featured_listings.edit');

          return (
            <div className="relative overflow-visible">
              <button
                ref={(el) => {
                  refs.current[id] = el;
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  
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

              {isOpen && canChangeStatus && (
                <PortalDropdown
                  anchorEl={refs.current[id]}
                  isOpen={isOpen}
                  selectedValue={currentStatus}
                  options={statusOptions}
                  onClose={() => setActiveDropdown(null)}
                  onSelect={(option) => {
                    if (canChangeStatus && onStatusChange) {
                      // Update pending updates immediately for instant UI feedback
                      pendingUpdatesRef.current = {
                        ...pendingUpdatesRef.current,
                        [row._id]: option.value
                      };
                      
                      // Force re-render by closing dropdown
                      setActiveDropdown(null);
                      
                      // Call the status change function
                      onStatusChange(row, option.value);
                      
                      // OPTIONAL: Call refresh if provided (this will clear pending updates)
                      // Only call refresh if you want to sync data from server
                      // if (onRefresh) {
                      //   setTimeout(() => {
                      //     onRefresh();
                      //   }, 300);
                      // }
                    }
                  }}
                />
              )}
            </div>
          );
        }
      },
      // {
      //   name: 'Featured',
      //   selector: (row: DataGridRow) => row.isFeatured,
      //   sortable: true,
      //   width: '140px',
      //   cell: (row: DataGridRow) => {
      //     // Check permission for featured toggle
      //     const canToggle = hasPermission('featured_listings.edit');
      //     const isMaxFeatured = featuredCount >= 6;
      //     const isDisabled = !canToggle || (!row.isFeatured && isMaxFeatured);

      //     return (
      //       <button
      //         onClick={() => {
      //           if (onFeaturedToggle && canToggle) {
      //             onFeaturedToggle(row);
      //           }
      //         }}
      //         disabled={isDisabled}
      //         className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
      //           row.isFeatured
      //             ? 'bg-purple-100 text-purple-700 border border-purple-200'
      //             : 'bg-gray-100 text-gray-600 border border-gray-200'
      //         } ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:opacity-90 cursor-pointer hover:shadow-sm'}`}
      //         title={isDisabled && !row.isFeatured ? 'Maximum 6 featured items reached' : !canToggle ? 'No permission to toggle featured' : row.isFeatured ? 'Featured' : 'Not Featured'}
      //       >
      //         {row.isFeatured ? 'Featured' : 'Not Featured'}
      //       </button>
      //     );
      //   },
      // },
{
  name: 'Featured',
  selector: (row: DataGridRow) => row.isFeatured,
  sortable: true,
  width: '140px',
  cell: (row: DataGridRow) => {
    // Check permission for featured toggle
    const canToggle = hasPermission('featured_listings.edit');
    const isMaxFeatured = featuredCount >= 6;
    
    // 🚨 NEW: Disable featuring if listing is inactive
    const isInactive = row.status === 'inactive';
    const isDisabled = !canToggle || (!row.isFeatured && isMaxFeatured) || (!row.isFeatured && isInactive);
    
    let disabledReason = '';
    if (!canToggle) {
      disabledReason = 'No permission to toggle featured';
    } else if (!row.isFeatured && isMaxFeatured) {
      disabledReason = 'Maximum 6 featured items reached';
    } else if (!row.isFeatured && isInactive) {
      disabledReason = 'Cannot feature an inactive listing';
    }
    
    return (
      <button
        onClick={() => {
          if (onFeaturedToggle && canToggle && !isDisabled) {
            onFeaturedToggle(row);
          }
        }}
        disabled={isDisabled}
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
          row.isFeatured
            ? 'bg-purple-100 text-purple-700 border border-purple-200'
            : isInactive
              ? 'bg-gray-50 text-gray-400 border border-gray-200'
              : 'bg-gray-100 text-gray-600 border border-gray-200'
        } ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:opacity-90 cursor-pointer hover:shadow-sm'}`}
        title={disabledReason || (row.isFeatured ? 'Featured' : 'Not Featured')}
      >
        {row.isFeatured ? 'Featured' : 'Not Featured'}
        {isInactive && !row.isFeatured && ' (Inactive)'}
      </button>
    );
  },
},

      {
        name: 'Actions',
        width: '140px',
        cell: (row: DataGridRow) => {
          // Check permissions for each action
          const canView = hasPermission('featured_listings.view') || permissions.view === true;
          const canEdit = hasPermission('featured_listings.edit');
          const canDelete = hasPermission('featured_listings.delete');

          return (
            <div className="flex items-center gap-2">
              {canView ? (
                <button
                  onClick={() => {
                    if (onView) onView(row);
                  }}
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
                  onClick={() => {
                    if (onEdit) onEdit(row);
                  }}
                  className="flex items-center justify-center w-8 h-8 bg-green-50 hover:bg-green-100 text-green-600 rounded-md transition duration-200 cursor-pointer"
                  title="Edit Item"
                >
                  <Edit className="w-4 h-4" />
                </button>
              ) : (
                <div 
                  className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-400 rounded-md cursor-not-allowed"
                  title="No edit permission"
                >
                  <Edit className="w-4 h-4" />
                </div>
              )}
              
              {canDelete ? (
                <button
                  onClick={() => {
                    if (onDelete) onDelete(row);
                  }}
                  className="flex items-center justify-center w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition duration-200 cursor-pointer"
                  title="Delete Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <div 
                  className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-400 rounded-md cursor-not-allowed"
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
    [onEdit, onDelete, onStatusChange, onFeaturedToggle, onView, activeDropdown, permissions, featuredCount, onRefresh, data]
  );

  // Clear pending updates when data refreshes
  useEffect(() => {
    pendingUpdatesRef.current = {};
  }, [data]);

  return columns;
};