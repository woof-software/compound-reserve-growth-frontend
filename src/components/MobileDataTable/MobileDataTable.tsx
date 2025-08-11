import React, { ReactNode } from 'react';

import { usePagination } from '@/shared/hooks/usePagination';
import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

interface MobileDataTableProps<T> {
  tableData: T[];

  pageSize?: number;

  children: (dataRows: T[]) => ReactNode;
}

const MobileDataTable = <T,>({
  tableData,
  pageSize = 10,
  children
}: MobileDataTableProps<T>) => {
  const { dataRows, pageIndex, maxPages, goNext, goPrev, goLast, goFirst } =
    usePagination({
      tableData,
      pageSize
    });

  return (
    <div className='block w-full lg:hidden'>
      {children(dataRows)}
      <div
        className={cn('hidden items-center justify-between px-10 py-5', {
          flex: tableData.length > pageSize
        })}
      >
        <Text className='text-primary-14 !text-[12.6px]'>
          Showing{' '}
          <span className='mx-1 text-[11.5px] leading-[21px] font-bold'>
            {pageIndex * pageSize + 1}
          </span>
          to{' '}
          <span className='mx-1 text-[11.5px] leading-[21px] font-bold'>
            {Math.min((pageIndex + 1) * pageSize, tableData.length)}
          </span>
          of{' '}
          <span className='mx-1 text-[11.5px] leading-[21px] font-bold'>
            {tableData.length}
          </span>{' '}
          results
        </Text>
        <div className='flex items-center gap-1'>
          <Button
            onClick={goFirst}
            disabled={pageIndex === 0}
            className='text-primary-14 hover:bg-secondary-22 size-8 cursor-pointer rounded-lg disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Icon
              name='double-arrow'
              className='h-4 w-4'
            />
          </Button>
          <Button
            onClick={goPrev}
            disabled={pageIndex === 0}
            className='text-primary-14 hover:bg-secondary-22 flex h-8 cursor-pointer items-center gap-2 rounded-lg pt-2 pr-2.5 pb-2 pl-2 text-[11px] font-medium disabled:cursor-not-allowed disabled:opacity-50'
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
            onClick={goNext}
            disabled={pageIndex === maxPages - 1}
            className='text-primary-14 hover:bg-secondary-22 flex h-8 cursor-pointer items-center gap-2 rounded-lg pt-2 pr-2 pb-2 pl-2.5 text-[11px] font-medium disabled:cursor-not-allowed disabled:opacity-50'
          >
            <span className='text-[11px] leading-none font-medium'>Next</span>
            <Icon
              name='arrow-right'
              className='h-4 w-4'
            />
          </Button>
          <Button
            onClick={goLast}
            disabled={pageIndex === maxPages - 1}
            className='text-primary-14 hover:bg-secondary-22 size-8 rotate-180 cursor-pointer rounded-lg disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Icon
              name='double-arrow'
              className='h-4 w-4'
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

export { MobileDataTable };
