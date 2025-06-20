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
import Text from '../Text/Text';

export type ExtendedColumnDef<T> = ColumnDef<T> & {
  align?: 'left' | 'center' | 'right';
};

interface DataTableProps<T> {
  data: T[];
  columns: ExtendedColumnDef<T>[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
  headerCellClassName?: string;
  headerRowClassName?: string;
  headerTextClassName?: string;
  bodyClassName?: string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  // Стилі для пагінації
  paginationClassName?: string;
  paginationTextClassName?: string;
  paginationButtonsClassName?: string;
  paginationButtonClassName?: string;
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
  headerCellClassName,
  headerRowClassName,
  headerTextClassName,
  bodyClassName,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No data available',
  paginationClassName,
  paginationTextClassName,
  paginationButtonsClassName,
  paginationButtonClassName
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

  const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

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
                {headerGroup.headers.map((header) => {
                  const columnAlign = (
                    header.column.columnDef as ExtendedColumnDef<T>
                  ).align;

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        getAlignmentClass(columnAlign),
                        enableSorting &&
                          header.column.getCanSort() &&
                          'cursor-pointer',
                        headerCellClassName
                      )}
                      style={{ width: header.column.columnDef.size }}
                      onClick={
                        enableSorting
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      <div
                        className={cn(
                          'flex items-center gap-2',
                          columnAlign === 'right' && 'justify-end',
                          columnAlign === 'center' && 'justify-center'
                        )}
                      >
                        {header.isPlaceholder ? null : (
                          <Text
                            size='11'
                            className={headerTextClassName}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </Text>
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
                  );
                })}
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
                  {row.getVisibleCells().map((cell) => {
                    const columnAlign = (
                      cell.column.columnDef as ExtendedColumnDef<T>
                    ).align;

                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          'text-[13px] whitespace-nowrap',
                          getAlignmentClass(columnAlign),
                          cellClassName
                        )}
                        style={{ width: cell.column.columnDef.size }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {enablePagination && (
        <div
          className={cn(
            'flex items-center justify-between',
            paginationClassName
          )}
        >
          <Text
            size='13'
            className={cn('text-primary-14', paginationTextClassName)}
          >
            Showing {table.getState().pagination.pageIndex * pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * pageSize,
              data.length
            )}{' '}
            of {data.length} results
          </Text>
          <div
            className={cn(
              'flex items-center gap-4',
              paginationButtonsClassName
            )}
          >
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={cn(
                'text-primary-14 text-[13px] hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50',
                paginationButtonClassName
              )}
            >
              Previous
            </Button>
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={cn(
                'text-primary-14 text-[13px] hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50',
                paginationButtonClassName
              )}
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
