import React, { FC, useMemo } from 'react';

import {
  AnnualisedExpensesComponentProps,
  AnnualisedExpensesRow
} from '@/entities/Runway';
import { cn } from '@/shared/lib/classNames';
import { formatLargeNumber } from '@/shared/lib/utils';
import { Text } from '@/shared/ui/atoms';
import {
  DataTable,
  ExtendedColumnDef,
  MobileDataTable
} from '@/shared/ui/molecules';

const columns: ExtendedColumnDef<AnnualisedExpensesRow>[] = [
  {
    accessorKey: 'discipline',
    header: 'Discipline'
  },
  {
    accessorKey: 'token',
    header: 'Token'
  },
  {
    accessorKey: 'amount',
    header: 'Amount (Qty)',
    align: 'center',
    cell: ({ getValue }) => formatLargeNumber(getValue() as number, 2)
  },
  {
    accessorKey: 'value',
    header: 'Value ($)',
    align: 'right',
    cell: ({ getValue }) => `$${formatLargeNumber(getValue() as number, 2)}`
  }
];

const AnnualisedExpenses: FC<AnnualisedExpensesComponentProps> = ({
  data,
  footerData,
  sortType
}) => {
  const footerRow = useMemo(
    () => (
      <tr>
        <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px] font-medium'>
          Total
        </td>
        <td className='text-primary-14 px-[5px] py-[13px] text-right text-[13px]'></td>
        <td className='text-primary-14 px-[5px] py-[13px] text-center text-[13px] font-medium'>
          {formatLargeNumber(footerData.amount, 2)}
        </td>
        <td className='text-primary-14 px-[5px] py-[13px] text-right text-[13px] font-medium'>
          {`$${formatLargeNumber(footerData.value, 2)}`}
        </td>
      </tr>
    ),
    [footerData]
  );

  const mobileTableData = useMemo(() => {
    if (!sortType?.key) {
      return data;
    }

    const key = sortType.key as keyof AnnualisedExpensesRow;
    return [...data].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortType.type === 'asc' ? aVal - bVal : bVal - aVal;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortType.type === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });
  }, [data, sortType]);

  return (
    <>
      <MobileDataTable tableData={mobileTableData}>
        {(dataRows) => (
          <>
            {dataRows.map((row, index) => (
              <div
                key={row.token + index}
                className={cn(
                  'border-secondary-23 grid grid-cols-3 gap-x-10 gap-y-3 border-b p-5 md:gap-x-[63px] md:px-10',
                  {
                    'border-b-0': dataRows.length - 1 === index,
                    'pt-0': index === 0
                  }
                )}
              >
                <div className='grid w-full max-w-[100px]'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Discipline
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {row.discipline}
                  </Text>
                </div>
                <div className='grid w-full max-w-[100px]'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Token
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {row.token}
                  </Text>
                </div>
                <div className='grid w-full max-w-[100px]'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Amount (Qty)
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {formatLargeNumber(row.amount, 2)}
                  </Text>
                </div>
                <div className='grid w-full max-w-[100px]'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Value
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    ${formatLargeNumber(row.value, 2)}
                  </Text>
                </div>
              </div>
            ))}
            <div className='border-secondary-23 grid grid-cols-3 gap-x-10 gap-y-3 border-t p-5 md:gap-x-[63px] md:px-10'>
              <div className='grid min-h-[39px] w-full max-w-[100px]'>
                <Text
                  size='13'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Total
                </Text>
              </div>
              <div className='grid w-full max-w-[100px]'>
                <Text
                  size='13'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Amount (Qty)
                </Text>
                <Text
                  size='13'
                  lineHeight='21'
                  weight='500'
                  className='truncate'
                >
                  {formatLargeNumber(footerData.amount, 2)}
                </Text>
              </div>
              <div className='grid w-full max-w-[100px]'>
                <Text
                  size='13'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Value
                </Text>
                <Text
                  size='13'
                  lineHeight='21'
                  weight='500'
                  className='truncate'
                >{`$${formatLargeNumber(footerData.value, 2)}`}</Text>
              </div>
            </div>
          </>
        )}
      </MobileDataTable>
      <div className='hidden w-full max-w-full lg:block'>
        <DataTable
          data={data}
          columns={columns}
          pageSize={10}
          footerContent={footerRow}
          containerTableClassName='min-h-[345px]'
          headerCellClassName='py-[13px] px-[5px]'
          cellClassName='py-3 px-[5px]'
          headerTextClassName='text-primary-14 font-medium'
          enableSorting
          enablePagination={data.length > 10}
          paginationClassName='py-0 px-[5px]'
          className='flex min-h-[400px] flex-col justify-between'
        />
      </div>
    </>
  );
};

export { AnnualisedExpenses };
