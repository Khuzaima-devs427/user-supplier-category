import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Star, Image as ImageIcon } from 'lucide-react';

// Updated interface - ADD image property
interface ReviewItem {
  id: string;
  _id: string;
  serialNo: number;
  userEmail: string;
  image?: string; // ADD THIS - product image or first review image
  images?: Array<{ // These are review images uploaded by users
    url: string;
    publicId?: string;
    uploadedAt: string;
  }>;
  title: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
}

interface UseReviewsColumnsProps {
  onEdit?: (item: ReviewItem) => void;
  onDelete?: (item: ReviewItem) => void;
  onStatusChange?: (item: ReviewItem, status: 'pending' | 'approved' | 'rejected') => void;
  onView?: (item: ReviewItem) => void;
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

// Star Rating Component
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-gray-700">{rating}.0</span>
    </div>
  );
};

/* -------------------------
   Main Hook for Reviews Columns
-------------------------- */
export const useReviewsColumns = ({
  onStatusChange,
  permissions = {}
}: UseReviewsColumnsProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  // FIXED: Add ALL status options including pending
  const statusOptions = [
    { value: 'pending' as const, label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'approved' as const, label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected' as const, label: 'Rejected', color: 'bg-red-100 text-red-800' }
  ];

  // Helper function to check permissions
  const hasPermission = (permissionKey: string): boolean => {
    // If user is static admin, they have ALL permissions
    if (permissions.isStaticAdmin === true) {
      return true;
    }
    
    // Check specific permission
    return permissions[permissionKey] === true;
  };

  const columns = useMemo(
    () => [
      {
        name: 'S.No',
        selector: (row: ReviewItem) => row.serialNo,
        sortable: true,
        width: '70px',
        cell: (row: ReviewItem) => (
          <div className="text-center text-gray-600 font-medium">
            {row.serialNo}
          </div>
        ),
      },
      {
        name: 'Images',
        selector: (row: ReviewItem) => row.image, // Use image property (product image)
        sortable: false,
        width: '90px',
        cell: (row: ReviewItem) => {
          // Use the image property (product image or first review image)
          const hasImage = row.image && row.image.trim() !== '';
          
          return (
            <div className="flex items-center justify-center">
              {hasImage ? (
                <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-200">
                  <img
                    src={row.image!}
                    alt="Product"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
              {/* Show badge if there are additional review images */}
              {row.images && row.images.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {row.images.length}
                </div>
              )}
            </div>
          );
        },
      },
      {
        name: 'Email',
        selector: (row: ReviewItem) => row.userEmail,
        sortable: true,
        width: '260px',
        cell: (row: ReviewItem) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(row.userEmail)}&background=random`}
                alt={row.userEmail}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.userEmail)}&background=random`;
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate" title={row.userEmail}>
                {row.userEmail}
              </div>
              {row.isVerifiedPurchase && (
                <span className="inline-block px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full mt-1">
                  Verified
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        name: 'Title',
        selector: (row: ReviewItem) => row.title,
        sortable: true,
        width: '140px',
        cell: (row: ReviewItem) => (
          <div className="max-w-xs">
            <div className="font-medium text-gray-900 truncate" title={row.title}>
              {row.title}
            </div>
          </div>
        ),
      },
      {
        name: 'Content',
        selector: (row: ReviewItem) => row.content,
        sortable: false,
        width: '200px',
        cell: (row: ReviewItem) => (
          <div className="max-w-xs">
            <div className="text-sm text-gray-700 line-clamp-2" title={row.content}>
              {row.content}
            </div>
          </div>
        ),
      },
      {
        name: 'Rating',
        selector: (row: ReviewItem) => row.rating,
        sortable: true,
        width: '150px',
        cell: (row: ReviewItem) => <StarRating rating={row.rating} />,
      },
      {
        name: 'Status',
        selector: (row: ReviewItem) => row.status,
        sortable: true,
        width: '130px',
        cell: (row: ReviewItem) => {
          const id = `status-${row.id}`;
          const isOpen = activeDropdown === id;
          
          // FIXED: Show ALL status options for any review
          const currentOptions = statusOptions;
          
          const currentStatus = statusOptions.find((s) => s.value === row.status);
          
          // FIXED: Allow status change if user has edit permission (not just for pending)
          const canChangeStatus = hasPermission('reviews.edit');

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
                className={`px-3 py-1.5 inline-flex items-center text-xs font-semibold rounded-lg transition-all duration-200 ${
                  row.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : row.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                } ${
                  !canChangeStatus ? 'cursor-not-allowed opacity-75' : 'hover:opacity-90 cursor-pointer'
                }`}
                disabled={!canChangeStatus}
                title={!canChangeStatus ? "No permission to change status" : currentStatus?.label}
              >
                {row.status === 'pending' ? 'Pending' : row.status === 'approved' ? 'Approved' : 'Rejected'}
                {canChangeStatus && (
                  <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {canChangeStatus && (
                <PortalDropdown
                  anchorEl={refs.current[id]}
                  isOpen={isOpen}
                  selectedValue={row.status}
                  options={currentOptions}
                  onClose={() => setActiveDropdown(null)}
                  onSelect={(o) => {
                    console.log('🔄 Status change selected:', o.value, 'for review:', row.id);
                    onStatusChange?.(row, o.value);
                    setActiveDropdown(null);
                  }}
                />
              )}
            </div>
          );
        }
      },
    ],
    [onStatusChange, activeDropdown, permissions]
  );

  return columns;
};