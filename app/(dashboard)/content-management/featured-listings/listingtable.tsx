// components/SimpleTable.tsx
import React from 'react';

export interface Column<T> {
  name: string;
  selector?: (row: T) => any;
  cell?: (row: T, index: number) => React.ReactNode;
  width?: string;
  sortable?: boolean;
  center?: boolean;
}

interface SimpleTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

const SimpleTable = <T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data found',
  onRowClick,
  className = '',
}: SimpleTableProps<T>) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto bg-white rounded-lg border border-gray-200 ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.width ? `w-${column.width}` : ''
                } ${column.center ? 'text-center' : ''}`}
              >
                {column.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`hover:bg-gray-50 transition-colors duration-150 ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    column.center ? 'text-center' : ''
                  }`}
                >
                  {column.cell
                    ? column.cell(row, rowIndex)
                    : column.selector
                    ? column.selector(row)
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SimpleTable;