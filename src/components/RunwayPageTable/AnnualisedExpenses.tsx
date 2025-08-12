import React from 'react';

import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { cn } from '@/shared/lib/classNames/classNames';
import { formatLargeNumber } from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Text from '@/shared/ui/Text/Text';

export interface AnnualisedExpensesRow {
  discipline: string;
  token: string;
  amount: number;
  value: number;
}

interface AnnualisedExpensesFooter {
  amount: number;
  value: number;
}

interface AnnualisedExpensesComponentProps {
  data: AnnualisedExpensesRow[];
  footerData: AnnualisedExpensesFooter;
}

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

const AnnualisedExpenses: React.FC<AnnualisedExpensesComponentProps> = ({
  data,
  footerData
}) => {
  const footerRow = (
    <tr>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
        Total
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-right text-[13px]'></td>
      <td className='text-primary-14 px-[5px] py-[13px] text-center text-[13px]'>
        {formatLargeNumber(footerData.amount, 2)}
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-right text-[13px]'>
        {`$${formatLargeNumber(footerData.value, 2)}`}
      </td>
    </tr>
  );

  return (
    <>
      <MobileDataTable tableData={data}>
        {(dataRows) =>
          dataRows.map((row, index) => (
            <div
              key={index}
              className={cn(
                'border-secondary-23 flex flex-wrap items-center justify-between gap-x-3 gap-y-3 border-b px-6 py-5 md:gap-x-[63px] md:px-10',
                {
                  'border-b-0': dataRows.length - 1 === index
                }
              )}
            >
              <div className='grid w-full max-w-[73px]'>
                <Text
                  size='8'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Discipline
                </Text>
                <Text
                  size='11'
                  lineHeight='21'
                  className='truncate'
                >
                  {row.discipline}
                </Text>
              </div>
              <div className='grid w-full max-w-[73px]'>
                <Text
                  size='8'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Token
                </Text>
                <Text
                  size='11'
                  lineHeight='21'
                  className='truncate'
                >
                  {row.token}
                </Text>
              </div>
              <div className='grid w-full max-w-[73px]'>
                <Text
                  size='8'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Amount (Qty)
                </Text>
                <Text
                  size='11'
                  lineHeight='21'
                  className='truncate'
                >
                  {formatLargeNumber(row.amount, 2)}
                </Text>
              </div>
              <div className='grid w-full max-w-[73px]'>
                <Text
                  size='8'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Value
                </Text>
                <Text
                  size='11'
                  lineHeight='21'
                  className='truncate'
                >
                  ${formatLargeNumber(row.value, 2)}
                </Text>
              </div>
            </div>
          ))
        }
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
          enablePagination
          paginationClassName='py-[13px] px-[5px]'
          className='flex min-h-[400px] flex-col justify-between'
        />
      </div>
    </>
  );
};

export default AnnualisedExpenses;
