import { useState } from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable
} from '@tanstack/react-table';

import { SortDownArrow, SortUpArrow } from '@/assets/svg/icon';
import { cn } from '@/shared/lib/classNames/classNames';

import Button from '../Button/Button';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
  headerRowClassName?: string;
  bodyClassName?: string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

const DataTable = <T,>({
  data,
  columns,
  enableSorting = false,
  enableFiltering = false,
  enablePagination = false,
  pageSize = 10,
  className,
  tableClassName,
  headerClassName,
  rowClassName,
  cellClassName,
  headerRowClassName,
  bodyClassName,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No data available'
}: DataTableProps<T>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: false,
    defaultColumn: {
      size: undefined
    },
    ...(enableSorting && {
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: setSorting
    }),
    ...(enableFiltering && {
      getFilteredRowModel: getFilteredRowModel(),
      onColumnFiltersChange: setColumnFilters
    }),
    ...(enablePagination && {
      getPaginationRowModel: getPaginationRowModel(),
      initialState: { pagination: { pageSize } }
    }),
    state: {
      ...(enableSorting && { sorting }),
      ...(enableFiltering && { columnFilters })
    }
  });

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-2', className)}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className='overflow-x-auto'>
        <table className={cn('min-w-full', tableClassName)}>
          <thead className={cn('bg-transparent', headerClassName)}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className={headerRowClassName}
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      'text-left',
                      enableSorting &&
                        header.column.getCanSort() &&
                        'cursor-pointer',
                      cellClassName
                    )}
                    style={{ width: header.column.columnDef.size }}
                    onClick={
                      enableSorting
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div className='flex items-center gap-2 text-[11px]'>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {enableSorting && header.column.getCanSort() && (
                        <div className='flex flex-col'>
                          <SortUpArrow
                            className={`h-1.5 w-1.5 ${
                              header.column.getIsSorted() === 'asc'
                                ? 'text-gray-600'
                                : 'text-gray-300'
                            }`}
                          />
                          <SortDownArrow
                            className={`h-1.5 w-1.5 ${
                              header.column.getIsSorted() === 'desc'
                                ? 'text-gray-600'
                                : 'text-gray-300'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className={cn('', bodyClassName)}>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className='text-center'
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(onRowClick && 'cursor-pointer', rowClassName)}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        'text-[13px] whitespace-nowrap',
                        cellClassName
                      )}
                      style={{ width: cell.column.columnDef.size }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {enablePagination && (
        <div className='flex items-center justify-between'>
          <span className='text-[13px]'>
            Showing {table.getState().pagination.pageIndex * pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * pageSize,
              data.length
            )}
            of {data.length} results
          </span>
          <div className='flex items-center gap-4'>
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className='text-[13px] hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              Previous
            </Button>
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className='text-[13px] hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
