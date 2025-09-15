import React, { FC, useMemo } from 'react';

import {
  PeriodMap,
  RevenueOverviewTableProps,
  TableRowData,
  toDateHeaderMap,
  ToDateTab
} from '@/entities/Revenue';
import { cn } from '@/shared/lib/classNames';
import { capitalizeFirstLetter, formatUSD } from '@/shared/lib/utils/utils';
import { Icon, Text, View } from '@/shared/ui/atoms';
import { DataTable, MobileDataTable } from '@/shared/ui/molecules';

const RevenueOverviewTable: FC<RevenueOverviewTableProps> = ({
  data,
  columns,
  dateType,
  footerContent,
  totalFooterData,
  sortType
}) => {
  const mobileTableData = useMemo(() => {
    if (!sortType?.key) {
      return data;
    }

    const key = sortType.key as keyof TableRowData;
    return [...data].sort((a, b) => {
      const firstValue = a[key];
      const secondValue = b[key];

      if (typeof firstValue === 'number' && typeof secondValue === 'number') {
        return sortType.type === 'asc'
          ? firstValue - secondValue
          : secondValue - firstValue;
      }

      if (typeof firstValue === 'string' && typeof secondValue === 'string') {
        return sortType.type === 'asc'
          ? firstValue.localeCompare(secondValue)
          : secondValue.localeCompare(firstValue);
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
                key={row.chain + index}
                className={cn(
                  'border-secondary-23 grid grid-cols-3 gap-x-10 gap-y-3 border-b p-5 md:gap-x-[63px] md:px-10',
                  {
                    'border-b': index === dataRows.length - 1,
                    'justify-between': dateType !== 'Rolling',
                    'pt-0': index === 0
                  }
                )}
              >
                {columns.map((column, index) => {
                  const key = column.accessorKey as keyof TableRowData;
                  const cellValue = row[key];

                  return (
                    <div
                      key={index}
                      className='grid w-full max-w-[100px]'
                    >
                      <Text
                        size='13'
                        lineHeight='18'
                        weight='500'
                        className='text-primary-14'
                      >
                        {column.header as string}
                      </Text>
                      <div className='flex items-center gap-2'>
                        <View.Condition if={Boolean(key === 'chain')}>
                          <Icon
                            name={(cellValue as string) || 'not-found-icon'}
                            className='h-4 w-4'
                            folder='network'
                          />
                        </View.Condition>
                        <Text
                          size='13'
                          lineHeight='21'
                          className='truncate'
                        >
                          {key === 'chain'
                            ? capitalizeFirstLetter(cellValue as string)
                            : formatUSD(cellValue as number)}
                        </Text>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <View.Condition if={Boolean(totalFooterData)}>
              <div
                className={cn(
                  'grid grid-cols-3 gap-x-10 gap-y-3 p-5 md:gap-x-[63px] md:px-10',
                  {
                    'justify-between': dateType !== 'Rolling'
                  }
                )}
              >
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
                {Object.entries(totalFooterData as PeriodMap).map(
                  (el, index) => (
                    <div
                      key={index}
                      className='grid w-full max-w-[100px]'
                    >
                      <Text
                        size='13'
                        lineHeight='18'
                        weight='500'
                        className='text-primary-14'
                      >
                        {dateType === 'Rolling'
                          ? `Rolling ${el[0].toLowerCase()}`
                          : toDateHeaderMap[el[0] as ToDateTab] || el[0]}
                      </Text>
                      <Text
                        size='13'
                        lineHeight='21'
                        weight='500'
                        className='truncate'
                      >
                        {formatUSD(el[1] || 0)}
                      </Text>
                    </div>
                  )
                )}
              </div>
            </View.Condition>
          </>
        )}
      </MobileDataTable>
      <div className='hidden w-full max-w-full lg:block'>
        <DataTable
          className='flex min-h-[565px] max-w-[800px] flex-col justify-between'
          enableSorting={true}
          data={data}
          columns={columns}
          pageSize={10}
          footerContent={footerContent}
          headerCellClassName='py-[13px] px-[5px]'
          cellClassName='py-3 px-[5px]'
          headerTextClassName='text-primary-14 font-medium'
        />
      </div>
    </>
  );
};

export { RevenueOverviewTable };
