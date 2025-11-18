import { useMemo } from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface User {
  id: string;
  serialNo: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
  lastLogin: string;
  category: string;
}

export const useUserColumns = (onEdit?: (user: User) => void, onDelete?: (user: User) => void) => {
  const columns = useMemo(() => [
    {
      name: 'S.No',
      selector: (row: User) => row.serialNo,
      sortable: true,
      width: '80px',
    },
    {
      name: 'Name',
      selector: (row: User) => row.name,
      sortable: true,
    },
    {
      name: 'Email',
      selector: (row: User) => row.email,
      sortable: true,
    },
    {
      name: 'Phone',
      selector: (row: User) => row.phone,
      sortable: true,
    },
    {
      name: 'Category',
      selector: (row: User) => row.category,
      sortable: true,
      cell: (row: User) => (
        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
          {row.category || 'Unknown'}
        </span>
      ),
    },
    {
      name: 'Status',
      selector: (row: User) => row.status,
      sortable: true,
      cell: (row: User) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.status === 'active'
              ? 'bg-green-100 text-green-800'
              : row.status === 'blocked'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      name: 'Last Login',
      selector: (row: User) => row.lastLogin,
      sortable: true,
      cell: (row: User) => row.lastLogin === 'Never' ? 'Never' : new Date(row.lastLogin).toLocaleDateString(),
    },
    {
      name: 'Actions',
      cell: (row: User) => (
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit && onEdit(row)}
            className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition duration-200"
            title="Edit User"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete && onDelete(row)}
            className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition duration-200"
            title="Delete User"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ),
    },
  ], [onEdit, onDelete]);

  return columns;
};