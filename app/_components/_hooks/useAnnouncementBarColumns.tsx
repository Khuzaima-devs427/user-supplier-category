// import React, { useMemo, useState, useRef, useEffect } from 'react';
// import { createPortal } from 'react-dom';
// import { Eye, Edit, Trash2, ChevronDown, Check, Bell, BellOff, Copy } from 'lucide-react';

// // Interface for Announcement items
// interface AnnouncementItem {
//   id: string;
//   _id: string;
//   serialNo: number;
//   announcement: string;
//   status: 'active' | 'inactive';
//   createdAt: string;
//   updatedAt: string;
//   createdBy?: string;
//   statusBadgeColor?: string;
// }

// interface UseAnnouncementColumnsProps {
//   onEdit?: (item: AnnouncementItem) => void;
//   onDelete?: (item: AnnouncementItem) => void;
//   onStatusChange?: (item: AnnouncementItem, status: 'active' | 'inactive') => void;
//   onView?: (item: AnnouncementItem) => void;
//   permissions?: { [key: string]: boolean };
// }

// /* -------------------------
//    Portal Dropdown for Status
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
//    Format Date Utility
// -------------------------- */
// const formatDate = (dateString: string) => {
//   try {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   } catch {
//     return dateString;
//   }
// };

// /* -------------------------
//    Main Hook for Announcement Columns
// -------------------------- */
// export const useAnnouncementColumns = ({
//   onEdit,
//   onDelete,
//   onStatusChange,
//   onView,
//   permissions = {}
// }: UseAnnouncementColumnsProps) => {
//   const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
//   const refs = useRef<Record<string, HTMLButtonElement | null>>({});

//   const statusOptions = [
//     { value: 'active' as const, label: 'Active', icon: Bell },
//     { value: 'inactive' as const, label: 'Inactive', icon: BellOff }
//   ];

//   // Helper function to check permissions
//   const hasPermission = (permissionKey: string): boolean => {
//     // If user is static admin, they have ALL permissions
//     if (permissions.isStaticAdmin === true) {
//       return true;
//     }
    
//     // Check specific permission
//     const hasPerm = permissions[permissionKey] === true;
//     return hasPerm;
//   };

//   const columns = useMemo(
//     () => [
//       {
//         name: 'S.No',
//         selector: (row: AnnouncementItem) => row.serialNo,
//         sortable: true,
//         width: '80px',
//         cell: (row: AnnouncementItem) => (
//           <div className="py-4 text-center text-gray-600 font-medium">
//             {row.serialNo}
//           </div>
//         ),
//       },
//       {
//         name: 'Announcement',
//         selector: (row: AnnouncementItem) => row.announcement,
//         sortable: true,
//         width: '285px',
//         cell: (row: AnnouncementItem) => {
//           const announcementText = row.announcement;
//           const truncatedText = announcementText.length > 100 
//             ? `${announcementText.substring(0, 100)}...` 
//             : announcementText;
          
//           return (
//             <div className="py-4 max-w-xs">
//               <div 
//                 className="text-sm text-gray-900 line-clamp-2" 
//                 title={announcementText}
//               >
//                 {truncatedText}
//               </div>
//             </div>
//           );
//         },
//       },
//       {
//         name: 'Status',
//         selector: (row: AnnouncementItem) => row.status,
//         sortable: true,
//         width: '147px',
//         cell: (row: AnnouncementItem) => {
//           const id = `status-${row.id}`;
//           const isOpen = activeDropdown === id;
//           const current = statusOptions.find((s) => s.value === row.status);
//           const Icon = current?.icon || BellOff;
          
//           // Check if user has permission to change status
//           const canChangeStatus = hasPermission('announcement_bar.edit'); // Changed from 'announcements.edit'

//           return (
//             <div className="py-4 relative overflow-visible">
//               <button
//                 ref={(el) => {
//                   refs.current[id] = el;
//                 }}
//                 onClick={() => {
//                   if (canChangeStatus) {
//                     setActiveDropdown(isOpen ? null : id);
//                   }
//                 }}
//                 className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
//                   row.status === 'active' 
//                     ? 'bg-green-100 text-green-800 border border-green-200' 
//                     : 'bg-gray-100 text-gray-800 border border-gray-200'
//                 } ${
//                   !canChangeStatus ? 'cursor-not-allowed opacity-75' : 'hover:opacity-90'
//                 }`}
//                 disabled={!canChangeStatus}
//                 title={!canChangeStatus ? "No permission to change status" : current?.label}
//               >
//                 <Icon className="w-3.5 h-3.5" />
//                 {current?.label}
//                 {canChangeStatus && (
//                   <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//                 )}
//               </button>

//               <PortalDropdown
//                 anchorEl={refs.current[id]}
//                 isOpen={isOpen && canChangeStatus}
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
//         name: 'Created At',
//         selector: (row: AnnouncementItem) => row.createdAt,
//         sortable: true,
//         width: '182px',
//         cell: (row: AnnouncementItem) => {
//           const timeAgo = getTimeAgo(row.createdAt);
          
//           return (
//             <div className="py-4 text-sm">
//               <div className="text-gray-900 font-medium">
//                 {formatDate(row.createdAt)}
//               </div>
//               <div className="text-xs text-gray-500 mt-0.5">
//                 {timeAgo}
//               </div>
//             </div>
//           );
//         },
//       },
//       {
//         name: 'Updated At',
//         selector: (row: AnnouncementItem) => row.updatedAt,
//         sortable: true,
//         width: '182px',
//         cell: (row: AnnouncementItem) => {
//           const timeAgo = getTimeAgo(row.updatedAt);
//           const isRecent = isRecentUpdate(row.updatedAt);
          
//           return (
//             <div className="py-4 text-sm">
//               <div className={`flex items-center gap-1 ${isRecent ? 'text-blue-900' : 'text-gray-900'}`}>
//                 {formatDate(row.updatedAt)}
//                 {isRecent && (
//                   <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
//                 )}
//               </div>
//               <div className="text-xs text-gray-500 mt-0.5">
//                 {timeAgo}
//                 {row.updatedAt !== row.createdAt && ' (updated)'}
//               </div>
//             </div>
//           );
//         },
//       },
//       {
//         name: 'Actions',
//         width: '150px',
//         cell: (row: AnnouncementItem) => {
//           // Check permissions for each action - USING CORRECT PERMISSION KEYS
//           const canView = hasPermission('announcement_bar.view');
//           const canEdit = hasPermission('announcement_bar.edit');
//           const canDelete = hasPermission('announcement_bar.delete');

//           console.log('🔍 Announcement action permissions:', {
//             rowId: row.id,
//             canView,
//             canEdit,
//             canDelete,
//             isStaticAdmin: permissions.isStaticAdmin,
//             announcement_bar_view: permissions['announcement_bar.view'],
//             announcement_bar_edit: permissions['announcement_bar.edit'],
//             announcement_bar_delete: permissions['announcement_bar.delete']
//           });

//           return (
//             <div className="py-4 flex items-center gap-2">
//               {/* View Button */}
//               {canView ? (
//                 <button
//                   onClick={() => onView?.(row)}
//                   className="flex items-center justify-center w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition duration-200"
//                   title="View Details"
//                 >
//                   <Eye className="w-4 h-4" />
//                 </button>
//               ) : (
//                 <div 
//                   className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-400 rounded-md cursor-not-allowed"
//                   title="No view permission"
//                 >
//                   <Eye className="w-4 h-4" />
//                 </div>
//               )}
              
//               {/* Edit Button */}
//               {canEdit ? (
//                 <button
//                   onClick={() => {
//                     console.log('✏️ Edit clicked for announcement:', row);
//                     onEdit?.(row);
//                   }}
//                   className="flex items-center justify-center w-8 h-8 bg-green-50 hover:bg-green-100 text-green-600 rounded-md transition duration-200"
//                   title="Edit Announcement"
//                 >
//                   <Edit className="w-4 h-4" />
//                 </button>
//               ) : (
//                 <div 
//                   className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-400 rounded-md cursor-not-allowed"
//                   title="No edit permission"
//                 >
//                   <Edit className="w-4 h-4" />
//                 </div>
//               )}
              
//               {/* Delete Button */}
//               {canDelete ? (
//                 <button
//                   onClick={() => {
//                     console.log('🗑️ Delete clicked for announcement:', row);
//                     onDelete?.(row);
//                   }}
//                   className="flex items-center justify-center w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition duration-200"
//                   title="Delete Announcement"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               ) : (
//                 <div 
//                   className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-400 rounded-md cursor-not-allowed"
//                   title="No delete permission"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </div>
//               )}
//             </div>
//           );
//         },
//       },
//     ],
//     [onEdit, onDelete, onStatusChange, onView, activeDropdown, permissions]
//   );

//   return columns;
// };

// /* -------------------------
//    Helper Functions
// -------------------------- */

// // Calculate time ago
// const getTimeAgo = (dateString: string): string => {
//   try {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffMs = now.getTime() - date.getTime();
//     const diffMinutes = Math.floor(diffMs / (1000 * 60));
//     const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
//     const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

//     if (diffDays > 0) {
//       return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
//     } else if (diffHours > 0) {
//       return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
//     } else if (diffMinutes > 0) {
//       return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
//     } else {
//       return 'Just now';
//     }
//   } catch {
//     return 'Unknown time';
//   }
// };

// // Check if update is recent (within last hour)
// const isRecentUpdate = (dateString: string): boolean => {
//   try {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
//     return diffHours < 1;
//   } catch {
//     return false;
//   }
// };






















import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Edit, Trash2, ChevronDown, Check, Bell, BellOff, Copy } from 'lucide-react';

// Interface for Announcement items
interface AnnouncementItem {
  id: string;
  _id: string;
  serialNo: number;
  announcement: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  statusBadgeColor?: string;
}

interface UseAnnouncementColumnsProps {
  onEdit?: (item: AnnouncementItem) => void;
  onDelete?: (item: AnnouncementItem) => void;
  onStatusChange?: (item: AnnouncementItem, status: 'active' | 'inactive') => void;
  onView?: (item: AnnouncementItem) => void;
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
   Format Date Utility
-------------------------- */
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

/* -------------------------
   Main Hook for Announcement Columns
-------------------------- */
export const useAnnouncementColumns = ({
  onEdit,
  onDelete,
  onStatusChange,
  onView,
  permissions = {}
}: UseAnnouncementColumnsProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const statusOptions = [
    { value: 'active' as const, label: 'Active', icon: Bell },
    { value: 'inactive' as const, label: 'Inactive', icon: BellOff }
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
        selector: (row: AnnouncementItem) => row.serialNo,
        sortable: true,
        width: '80px',
        cell: (row: AnnouncementItem) => (
          <div className="py-4 text-center text-gray-600 font-medium">
            {row.serialNo}
          </div>
        ),
      },
      {
        name: 'Announcement',
        selector: (row: AnnouncementItem) => row.announcement,
        sortable: true,
        width: '285px',
        cell: (row: AnnouncementItem) => {
          const announcementText = row.announcement;
          const truncatedText = announcementText.length > 100 
            ? `${announcementText.substring(0, 100)}...` 
            : announcementText;
          
          return (
            <div className="py-4 max-w-xs">
              <div 
                className="text-sm text-gray-900 line-clamp-2" 
                title={announcementText}
              >
                {truncatedText}
              </div>
            </div>
          );
        },
      },
      {
        name: 'Status',
        selector: (row: AnnouncementItem) => row.status,
        sortable: true,
        width: '147px',
        cell: (row: AnnouncementItem) => {
          const id = `status-${row.id}`;
          const isOpen = activeDropdown === id;
          const current = statusOptions.find((s) => s.value === row.status);
          const Icon = current?.icon || BellOff;
          
          // Check if user has permission to change status
          const canChangeStatus = hasPermission('announcement_bar.edit'); // Changed from 'announcements.edit'

          return (
            <div className="py-4 relative overflow-visible">
              <button
                ref={(el) => {
                  refs.current[id] = el;
                }}
                onClick={() => {
                  if (canChangeStatus) {
                    setActiveDropdown(isOpen ? null : id);
                  }
                }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                  row.status === 'active' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                } ${
                  !canChangeStatus ? 'cursor-not-allowed opacity-75' : 'hover:opacity-90 cursor-pointer'
                }`}
                disabled={!canChangeStatus}
                title={!canChangeStatus ? "No permission to change status" : current?.label}
              >
                <Icon className="w-3.5 h-3.5" />
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
      {
        name: 'Created At',
        selector: (row: AnnouncementItem) => row.createdAt,
        sortable: true,
        width: '182px',
        cell: (row: AnnouncementItem) => {
          const timeAgo = getTimeAgo(row.createdAt);
          
          return (
            <div className="py-4 text-sm">
              <div className="text-gray-900 font-medium">
                {formatDate(row.createdAt)}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {timeAgo}
              </div>
            </div>
          );
        },
      },
      {
        name: 'Updated At',
        selector: (row: AnnouncementItem) => row.updatedAt,
        sortable: true,
        width: '182px',
        cell: (row: AnnouncementItem) => {
          const timeAgo = getTimeAgo(row.updatedAt);
          const isRecent = isRecentUpdate(row.updatedAt);
          
          return (
            <div className="py-4 text-sm">
              <div className={`flex items-center gap-1 ${isRecent ? 'text-blue-900' : 'text-gray-900'}`}>
                {formatDate(row.updatedAt)}
                {isRecent && (
                  <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {timeAgo}
                {row.updatedAt !== row.createdAt && ' (updated)'}
              </div>
            </div>
          );
        },
      },
      {
        name: 'Actions',
        width: '150px',
        cell: (row: AnnouncementItem) => {
          // Check permissions for each action - USING CORRECT PERMISSION KEYS
          const canView = hasPermission('announcement_bar.view');
          const canEdit = hasPermission('announcement_bar.edit');
          const canDelete = hasPermission('announcement_bar.delete');

          console.log('🔍 Announcement action permissions:', {
            rowId: row.id,
            canView,
            canEdit,
            canDelete,
            isStaticAdmin: permissions.isStaticAdmin,
            announcement_bar_view: permissions['announcement_bar.view'],
            announcement_bar_edit: permissions['announcement_bar.edit'],
            announcement_bar_delete: permissions['announcement_bar.delete']
          });

          return (
            <div className="py-4 flex items-center gap-2">
              {/* View Button */}
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
              
              {/* Edit Button */}
              {canEdit ? (
                <button
                  onClick={() => {
                    console.log('✏️ Edit clicked for announcement:', row);
                    onEdit?.(row);
                  }}
                  className="flex items-center justify-center w-8 h-8 bg-green-50 hover:bg-green-100 text-green-600 rounded-md transition duration-200 cursor-pointer"
                  title="Edit Announcement"
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
              
              {/* Delete Button */}
              {canDelete ? (
                <button
                  onClick={() => {
                    console.log('🗑️ Delete clicked for announcement:', row);
                    onDelete?.(row);
                  }}
                  className="flex items-center justify-center w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition duration-200 cursor-pointer"
                  title="Delete Announcement"
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
    [onEdit, onDelete, onStatusChange, onView, activeDropdown, permissions]
  );

  return columns;
};

/* -------------------------
   Helper Functions
-------------------------- */

// Calculate time ago
const getTimeAgo = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  } catch {
    return 'Unknown time';
  }
};

// Check if update is recent (within last hour)
const isRecentUpdate = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    return diffHours < 1;
  } catch {
    return false;
  }
};