import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Edit, Trash2, ChevronDown, Check, Image as ImageIcon, ExternalLink } from 'lucide-react';

// Unified interface for HeroSlider items
interface HeroSliderItem {
  id: string;
  _id: string;
  serialNo: number;
  image: string;
  title: string;
  buttonText: string;
  buttonLink: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tag?: string;
  description?: string;
}

interface UseHeroSliderColumnsProps {
  onEdit?: (item: HeroSliderItem) => void;
  onDelete?: (item: HeroSliderItem) => void;
  onStatusChange?: (item: HeroSliderItem, status: 'active' | 'inactive') => void;
  onView?: (item: HeroSliderItem) => void;
  permissions?: { [key: string]: boolean };
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
   Main Hook for Hero Slider Columns
-------------------------- */
export const useHeroSliderColumns = ({
  onEdit,
  onDelete,
  onStatusChange,
  onView,
  permissions = {}
}: UseHeroSliderColumnsProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const statusOptions = [
    { value: 'active' as const, label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'inactive' as const, label: 'Inactive', color: 'bg-red-100 text-red-800' }
  ];

  // Helper function to check permissions - SAME PATTERN AS OTHER HOOKS
  const hasPermission = (permissionKey: string): boolean => {
    // If user is static admin, they have ALL permissions
    if (permissions.isStaticAdmin === true) {
      console.log(`✅ Static admin override for permission: ${permissionKey}`);
      return true;
    }
    
    // Check specific permission
    const hasPerm = permissions[permissionKey] === true;
    console.log(`🔍 useHeroSliderColumns checking "${permissionKey}": ${hasPerm}`);
    return hasPerm;
  };

  const columns = useMemo(
    () => [
      {
        name: 'S.No',
        selector: (row: HeroSliderItem) => row.serialNo,
        sortable: true,
        width: '80px',
        cell: (row: HeroSliderItem) => (
          <div className="text-center text-gray-600 font-medium">
            {row.serialNo}
          </div>
        ),
      },
      {
        name: 'Image',
        selector: (row: HeroSliderItem) => row.image,
        sortable: false,
        width: '120px',
        cell: (row: HeroSliderItem) => {
          const imageUrl = row.image;
          return (
            <div className="flex items-center justify-center p-2">
              <div className="w-16 h-12 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                <img
                  src={imageUrl || '/placeholder-image.jpg'}
                  alt={row.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                  }}
                />
              </div>
            </div>
          );
        },
      },
      {
        name: 'Title',
        selector: (row: HeroSliderItem) => row.title,
        sortable: true,
        width: '250px',
        cell: (row: HeroSliderItem) => (
          <div className="max-w-xs">
            <div className="font-medium text-gray-900 truncate" title={row.title}>
              {row.title}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Order: {row.displayOrder}
            </div>
          </div>
        ),
      },
      {
        name: 'Button',
        selector: (row: HeroSliderItem) => row.buttonText,
        sortable: true,
        width: '180px',
        cell: (row: HeroSliderItem) => (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100">
              {row.buttonText}
            </span>
            <a
              href={row.buttonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
              title="Open Link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ),
      },
      {
        name: 'Status',
        selector: (row: HeroSliderItem) => row.status,
        sortable: true,
        width: '130px',
        cell: (row: HeroSliderItem) => {
          const id = `status-${row.id}`;
          const isOpen = activeDropdown === id;
          const current = statusOptions.find((s) => s.value === row.status);
          
          // Check if user has permission to change status
          const canChangeStatus = hasPermission('hero_slider.edit');

          console.log('🔍 Status dropdown permissions for hero slider:', {
            rowId: row.id,
            canChangeStatus,
            isStaticAdmin: permissions.isStaticAdmin,
            hero_slider_edit: permissions['hero_slider.edit']
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
                className={`px-3 py-1.5 inline-flex items-center text-xs font-semibold rounded-lg transition-all duration-200 ${current?.color} ${
                  !canChangeStatus ? 'cursor-not-allowed opacity-75' : 'hover:opacity-90'
                }`}
                disabled={!canChangeStatus}
                title={!canChangeStatus ? "No permission to change status" : current?.label}
              >
                {current?.label}
                {canChangeStatus && (
                  <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                )}
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
        name: 'Actions',
        width: '150px',
        cell: (row: HeroSliderItem) => {
          // Check permissions for each action
          const canView = hasPermission('hero_slider.view') || permissions.view === true;
          const canEdit = hasPermission('hero_slider.edit');
          const canDelete = hasPermission('hero_slider.delete');

          console.log('🔍 Row action permissions for hero slider:', {
            rowId: row.id,
            canView,
            canEdit,
            canDelete,
            isStaticAdmin: permissions.isStaticAdmin,
            hero_slider_edit: permissions['hero_slider.edit'],
            hero_slider_delete: permissions['hero_slider.delete']
          });

          return (
            <div className="flex items-center gap-2">
              {canView ? (
                <button
                  onClick={() => onView?.(row)}
                  className="flex items-center justify-center w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition duration-200"
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
                    console.log('✏️ Edit clicked for item:', row);
                    onEdit?.(row);
                  }}
                  className="flex items-center justify-center w-8 h-8 bg-green-50 hover:bg-green-100 text-green-600 rounded-md transition duration-200"
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
                    console.log('🗑️ Delete clicked for item:', row);
                    onDelete?.(row);
                  }}
                  className="flex items-center justify-center w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition duration-200"
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
    [onEdit, onDelete, onStatusChange, onView, activeDropdown, permissions]
  );

  return columns;
};