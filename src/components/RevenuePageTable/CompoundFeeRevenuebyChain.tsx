import React from 'react';

import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { cn } from '@/shared/lib/classNames/classNames';
import {
  capitalizeFirstLetter,
  formatCurrencyValue,
  formatNumber
} from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Text from '@/shared/ui/Text/Text';

export interface ProcessedRevenueData {
  chain: string;
  [key: string]: string | number;
}

export type Interval = 'Quarterly' | 'Monthly' | 'Weekly';

interface CompoundFeeRevenuebyChainProps {
  data: ProcessedRevenueData[];
  columns: ExtendedColumnDef<ProcessedRevenueData>[];
  selectedInterval: Interval;
  totals: { [key: string]: number };
}

const CompoundFeeRevenuebyChain = ({
  data,
  columns,
  totals,
  selectedInterval
}: CompoundFeeRevenuebyChainProps) => {
  const footerRow = (
    <tr key='footer-total-row'>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px] font-medium'>
        Total
      </td>
      {columns.slice(1).map((col) => {
        const columnKey =
          'accessorKey' in col ? String(col.accessorKey) : col.id;
        if (!columnKey) {
          return null;
        }

        const totalValue = totals[columnKey];

        if (typeof totalValue !== 'number' || isNaN(totalValue)) {
          return (
            <td
              key={columnKey}
              className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'
            >
              -
            </td>
          );
        }

        const formattedValue =
          totalValue < 0
            ? `-${formatNumber(Math.abs(totalValue))}`
            : formatNumber(totalValue);

        return (
          <td
            key={columnKey}
            className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'
          >
            {formattedValue}
          </td>
        );
      })}
    </tr>
  );

  return (
    <>
      <MobileDataTable tableData={data}>
        {(dataRows) => (
          <>
            {dataRows.map((rowObj, rowIndex) => (
              <div
                key={rowIndex}
                className={cn(
                  'border-secondary-23 flex flex-wrap items-center justify-start gap-x-3 gap-y-3 border-b px-6 py-5 md:gap-x-[63px] md:px-10',
                  {
                    'justify-between': selectedInterval === 'Weekly'
                  }
                )}
              >
                {Object.entries(rowObj).map(([key, value], colIndex) => (
                  <div
                    key={colIndex}
                    className='grid w-full max-w-[73px]'
                  >
                    <Text
                      size='8'
                      lineHeight='18'
                      weight='500'
                      className='text-primary-14'
                    >
                      {capitalizeFirstLetter(key)}
                    </Text>
                    <Text
                      size='11'
                      lineHeight='21'
                      className='truncate'
                    >
                      {key === 'chain'
                        ? value
                        : formatCurrencyValue(value || 0)}
                    </Text>
                  </div>
                ))}
              </div>
            ))}
            <div
              className={cn(
                'flex flex-wrap items-center justify-start gap-x-3 gap-y-3 px-6 py-5 md:gap-x-[63px] md:px-10',
                {
                  'justify-between': selectedInterval === 'Weekly'
                }
              )}
            >
              <div className='grid min-h-[39px] w-full max-w-[73px]'>
                <Text
                  size='8'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Total
                </Text>
              </div>
              {columns.slice(1).map((col) => {
                const columnKey =
                  'accessorKey' in col ? String(col.accessorKey) : col.id;

                if (!columnKey) {
                  return null;
                }

                const totalValue = totals[columnKey];

                if (typeof totalValue !== 'number' || isNaN(totalValue)) {
                  return (
                    <div
                      key={columnKey}
                      className='grid min-h-[39px] w-full max-w-[73px]'
                    >
                      <Text
                        size='8'
                        lineHeight='18'
                        weight='500'
                        className='text-primary-14'
                      >
                        {columnKey}
                      </Text>
                      <Text
                        size='11'
                        lineHeight='21'
                        weight='500'
                      >
                        -
                      </Text>
                    </div>
                  );
                }

                const formattedValue =
                  totalValue < 0
                    ? `-${formatNumber(Math.abs(totalValue))}`
                    : formatNumber(totalValue);

                return (
                  <div
                    key={columnKey}
                    className='grid min-h-[39px] w-full max-w-[73px]'
                  >
                    <Text
                      size='8'
                      lineHeight='18'
                      weight='500'
                      className='text-primary-14'
                    >
                      {columnKey}
                    </Text>
                    <Text
                      size='8'
                      lineHeight='18'
                      weight='500'
                    >
                      {formattedValue}
                    </Text>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </MobileDataTable>
      <div className='hidden w-full max-w-full lg:block'>
        <DataTable
          data={data}
          columns={columns}
          pageSize={10}
          footerContent={columns.length > 0 ? footerRow : null}
          className='flex min-h-[565px] flex-col justify-between'
          headerCellClassName='py-[13px] px-[5px]'
          cellClassName='py-3 px-[5px]'
          headerTextClassName='text-primary-14 font-medium'
        />
      </div>
    </>
  );
};

export default CompoundFeeRevenuebyChain;
