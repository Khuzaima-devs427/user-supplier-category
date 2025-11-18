import React, { useMemo } from 'react';
import DataTable, { TableStyles } from 'react-data-table-component';

interface DataGridProps<T> {
  columns: any[];
  data: T[];
  isLoading?: boolean;
  totalRows?: number;
  rowsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSelectedRowsChange?: (selected: { allSelected: boolean; selectedCount: number; selectedRows: T[] }) => void;
}

const DataGrid = <T,>({
  columns,
  data,
  isLoading = false,
  totalRows = 0,
  rowsPerPage = 10,
  currentPage = 1,
  onPageChange,
  onSelectedRowsChange
}: DataGridProps<T>) => {
  const paginationComponentOptions = useMemo(() => ({
    rowsPerPageText: 'Rows per page:',
    rangeSeparatorText: 'of',
    selectAllRowsItem: true,
    selectAllRowsItemText: 'All',
  }), []);

  const customStyles: TableStyles = {
    head: {
      style: {
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#374151',
        backgroundColor: '#f9fafb',
      },
    },
    headRow: {
      style: {
        borderTopWidth: '1px',
        borderTopColor: '#e5e7eb',
        borderTopStyle: 'solid',
        minHeight: '48px',
      },
    },
    headCells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
        fontWeight: 600,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      },
    },
    cells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
        fontSize: '0.875rem',
        fontWeight: 400,
      },
    },
    rows: {
      style: {
        minHeight: '48px',
        fontSize: '0.875rem',
        fontWeight: 400,
        color: '#374151',
      },
      highlightOnHoverStyle: {
        backgroundColor: '#f8fafc',
        transitionDuration: '0.15s',
        transitionProperty: 'background-color',
        outlineWidth: '0px',
      },
    },
    pagination: {
      style: {
        fontSize: '0.875rem',
        borderTopStyle: 'solid',
        borderTopWidth: '1px',
        borderTopColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
      },
      pageButtonsStyle: {
        borderRadius: '6px',
        height: '32px',
        width: '32px',
        padding: '8px',
        margin: '2px',
        cursor: 'pointer',
        transition: '0.15s',
        fill: '#374151',
        backgroundColor: 'transparent',
        '&:disabled': {
          cursor: 'not-allowed',
          opacity: 0.5,
        },
        '&:hover:not(:disabled)': {
          backgroundColor: '#e5e7eb',
        },
        '&:focus': {
          outline: 'none',
          backgroundColor: '#e5e7eb',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <DataTable
        columns={columns}
        data={data}
        progressPending={isLoading}
        progressComponent={
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        }
        noDataComponent={
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new record.</p>
          </div>
        }
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        paginationPerPage={rowsPerPage}
        paginationDefaultPage={currentPage}
        onChangePage={onPageChange}
        paginationComponentOptions={paginationComponentOptions}
        customStyles={customStyles}
        selectableRows={!!onSelectedRowsChange}
        onSelectedRowsChange={onSelectedRowsChange}
        persistTableHead
        responsive
        striped
        highlightOnHover
      />
    </div>
  );
};

export default DataGrid;