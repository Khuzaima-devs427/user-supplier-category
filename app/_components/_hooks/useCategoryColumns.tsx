import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Edit, Trash2, ChevronDown, Check } from 'lucide-react';

interface Category {
  id: string;
  serialNo: number;
  role: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}

interface UseCategoryColumnsProps {
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  onStatusChange?: (category: Category, status: 'active' | 'inactive') => void;
  onView?: (category: Category) => void;
}

/* -------------------------
   Portal Dropdown (Copied from supplier file)
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
export const useCategoryColumns = ({
  onEdit,
  onDelete,
  onStatusChange,
  onView
}: UseCategoryColumnsProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const statusOptions = [
    { value: 'active' as const, label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'inactive' as const, label: 'Inactive', color: 'bg-red-100 text-red-800' }
  ];

  const columns = useMemo(
    () => [
      {
        name: 'S.No',
        selector: (row: Category) => row.serialNo,
        sortable: true,
        width: '80px',
      },
      {
        name: 'Role',
        selector: (row: Category) => row.role,
        sortable: true,
      },
      {
        name: 'Description',
        selector: (row: Category) => row.description,
        sortable: true,
        cell: (row: Category) => (
          <div className="max-w-xs truncate" title={row.description || 'No description'}>
            {row.description || 'No description'}
          </div>
        ),
      },
      {
        name: 'Status',
        selector: (row: Category) => row.status,
        sortable: true,
        cell: (row: Category) => {
          const id = `status-${row.id}`;
          const isOpen = activeDropdown === id;
          const current = statusOptions.find((s) => s.value === row.status);

          return (
            <div className="relative overflow-visible">
              <button
                ref={(el) => {
                  refs.current[id] = el;
                }}
                onClick={() => setActiveDropdown(isOpen ? null : id)}
                className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full transition-all duration-200 ${current?.color}`}
              >
                {current?.label}
                <ChevronDown className={`w-3 h-3 ml-1 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              <PortalDropdown
                anchorEl={refs.current[id]}
                isOpen={isOpen}
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
        cell: (row: Category) => (
          <div className="flex space-x-2">
            <button
              onClick={() => onView?.(row)}
              className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition duration-200"
              title="View Category"
            >
              <Eye className="w-3 h-3" />
            </button>
            <button
              onClick={() => onEdit?.(row)}
              className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition duration-200"
              title="Edit Category"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete?.(row)}
              className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition duration-200"
              title="Delete Category"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete, onStatusChange, onView, activeDropdown]
  );

  return columns;
};