import { useMemo } from 'react';

interface Category {
  id: string;
  serialNo: number;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
  itemsCount: number;
}

export const useCategoryColumns = (onEdit?: (category: Category) => void, onDelete?: (category: Category) => void) => {
  const columns = useMemo(() => [
    {
      name: 'S.No',
      selector: (row: Category) => row.serialNo,
      sortable: true,
      width: '80px',
    },
    {
      name: 'Category Name',
      selector: (row: Category) => row.name,
      sortable: true,
    },
    {
      name: 'Description',
      selector: (row: Category) => row.description,
      sortable: true,
      cell: (row: Category) => (
        <div className="max-w-xs truncate" title={row.description}>
          {row.description}
        </div>
      ),
    },
    {
      name: 'Items Count',
      selector: (row: Category) => row.itemsCount,
      sortable: true,
      width: '120px',
      cell: (row: Category) => (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {row.itemsCount} items
        </span>
      ),
    },
    {
      name: 'Status',
      selector: (row: Category) => row.status,
      sortable: true,
      width: '120px',
      cell: (row: Category) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.status === 'active'
              ? 'bg-green-100 text-green-800'
              : row.status === 'archived'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      name: 'Created Date',
      selector: (row: Category) => row.createdAt,
      sortable: true,
      width: '140px',
      cell: (row: Category) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      name: 'Actions',
      cell: (row: Category) => (
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit?.(row)}
            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete?.(row)}
            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          >
            Delete
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '150px',
    },
  ], [onEdit, onDelete]);

  return columns;
};