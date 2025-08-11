import { ReactNode, useState } from 'react';
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

import { cn } from '@/shared/lib/classNames/classNames';

import Button from '../Button/Button';
import Icon from '../Icon/Icon';
import Text from '../Text/Text';

export type ExtendedColumnDef<T> = ColumnDef<T> & {
  align?: 'left' | 'center' | 'right';
  accessorKey?: keyof T;
};

interface DataTableProps<T> {
  data: T[];
  columns: ExtendedColumnDef<T>[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  className?: string;
  containerTableClassName?: string;
  tableClassName?: string;
  headerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
  headerCellClassName?: string;
  headerRowClassName?: string;
  headerTextClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  footerCellClassName?: string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  paginationClassName?: string;
  paginationTextClassName?: string;
  paginationButtonsClassName?: string;
  paginationButtonClassName?: string;
  footerContent?: ReactNode;
  initialSort?: { id: string; desc: boolean };
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
  containerTableClassName,
  headerCellClassName,
  headerRowClassName,
  headerTextClassName,
  bodyClassName,
  footerClassName,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No data available',
  paginationClassName,
  paginationTextClassName,
  paginationButtonsClassName,
  paginationButtonClassName,
  footerContent,
  initialSort
}: DataTableProps<T>) => {
  const [sorting, setSorting] = useState<SortingState>(
    initialSort ? [{ id: initialSort.id, desc: initialSort.desc }] : []
  );
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
      <div className={cn('overflow-x-auto', containerTableClassName)}>
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
                          'cursor-pointer select-none',
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
                            <Icon
                              name='sort-up-arrow'
                              className={`h-1.5 w-1.5 ${
                                header.column.getIsSorted() === 'asc'
                                  ? 'text-primary-11'
                                  : 'text-primary-13'
                              }`}
                            />
                            <Icon
                              name='sort-down-arrow'
                              className={`h-1.5 w-1.5 ${
                                header.column.getIsSorted() === 'desc'
                                  ? 'text-primary-11'
                                  : 'text-primary-13'
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
            {table?.getRowModel().rows.length === 0 ? (
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
          {footerContent && (
            <tfoot className={cn('', footerClassName)}>{footerContent}</tfoot>
          )}
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
            className={cn(
              'text-primary-14 !text-[12.6px]',
              paginationTextClassName
            )}
          >
            Showing
            <span className='mx-1 text-[11.5px] leading-[21px] font-bold'>
              {table.getState().pagination.pageIndex * pageSize + 1}
            </span>
            to
            <span className='mx-1 text-[11.5px] leading-[21px] font-bold'>
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * pageSize,
                data.length
              )}
            </span>
            of
            <span className='mx-1 text-[11.5px] leading-[21px] font-bold'>
              {data.length}
            </span>
            results
          </Text>
          <div
            className={cn(
              'flex items-center gap-1',
              paginationButtonsClassName
            )}
          >
            <Button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className={cn(
                'text-primary-14 hover:bg-secondary-22 size-8 cursor-pointer rounded-lg disabled:cursor-not-allowed disabled:opacity-50',
                paginationButtonClassName
              )}
            >
              <Icon
                name='double-arrow'
                className='h-4 w-4'
              />
            </Button>
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={cn(
                'text-primary-14 hover:bg-secondary-22 flex h-8 cursor-pointer items-center gap-2 rounded-lg pt-2 pr-2.5 pb-2 pl-2 text-[11px] font-medium disabled:cursor-not-allowed disabled:opacity-50',
                paginationButtonClassName
              )}
            >
              <Icon
                name='arrow-left'
                className='h-4 w-4'
              />
              <span className='text-[11px] leading-none font-medium'>
                Previous
              </span>
            </Button>
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={cn(
                'text-primary-14 hover:bg-secondary-22 flex h-8 cursor-pointer items-center gap-2 rounded-lg pt-2 pr-2 pb-2 pl-2.5 text-[11px] font-medium disabled:cursor-not-allowed disabled:opacity-50',
                paginationButtonClassName
              )}
            >
              <span className='text-[11px] leading-none font-medium'>Next</span>
              <Icon
                name='arrow-right'
                className='h-4 w-4'
              />
            </Button>
            <Button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className={cn(
                'text-primary-14 hover:bg-secondary-22 size-8 rotate-180 cursor-pointer rounded-lg disabled:cursor-not-allowed disabled:opacity-50',
                paginationButtonClassName
              )}
            >
              <Icon
                name='double-arrow'
                className='h-4 w-4'
              />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
