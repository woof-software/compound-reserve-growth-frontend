import React, { FC } from 'react';

import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { cn } from '@/shared/lib/classNames/classNames';
import { capitalizeFirstLetter, formatUSD } from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

export interface TableRowData {
  chain: string;
  [key: string]: string | number;
}

export type PeriodMap = { [key: string]: number };

export const ROLLING_TABS = ['7D', '30D', '90D', '180D', '365D'] as const;
export const TO_DATE_TABS = ['WTD', 'MTD', 'YTD'] as const;
export const DATE_TYPE_TABS = ['Rolling', 'To Date'] as const;

export type RollingTab = (typeof ROLLING_TABS)[number];
export type ToDateTab = (typeof TO_DATE_TABS)[number];
export type DateType = (typeof DATE_TYPE_TABS)[number];
export type Period = RollingTab | ToDateTab;

export const toDateHeaderMap: Record<ToDateTab, string> = {
  WTD: 'Week to Date',
  MTD: 'Month to Date',
  YTD: 'Year to Date'
};

interface RevenueOverviewUSDProps {
  data: TableRowData[];
  columns: ExtendedColumnDef<TableRowData>[];
  footerContent: React.ReactNode;
  totalFooterData: PeriodMap | null;
  dateType: DateType;
}

const RevenueOverviewUSD: FC<RevenueOverviewUSDProps> = ({
  data,
  columns,
  dateType,
  footerContent,
  totalFooterData
}) => {
  return (
    <>
      <MobileDataTable tableData={data}>
        {(dataRows) => (
          <>
            {dataRows.map((row, index) => (
              <div
                key={index}
                className={cn(
                  'border-secondary-23 flex flex-wrap items-center justify-start gap-x-[63px] gap-y-3 border-b px-10 py-5',
                  {
                    'border-b': index !== dataRows.length - 1,
                    'justify-between': dateType !== 'Rolling'
                  }
                )}
              >
                {columns.map((column, index) => {
                  const key = column.accessorKey as keyof TableRowData;
                  const cellValue = row[key];

                  return (
                    <div
                      key={index}
                      className='grid w-full max-w-[73px]'
                    >
                      <Text
                        size='8'
                        lineHeight='18'
                        weight='500'
                        className='text-primary-14'
                      >
                        {column.header as string}
                      </Text>
                      <Text
                        size='11'
                        lineHeight='21'
                        className='truncate'
                      >
                        {key === 'chain'
                          ? capitalizeFirstLetter(cellValue as string)
                          : formatUSD(cellValue as number)}
                      </Text>
                    </div>
                  );
                })}
              </div>
            ))}
            <View.Condition if={Boolean(totalFooterData)}>
              <div
                className={cn(
                  'flex flex-wrap items-center justify-start gap-x-[63px] gap-y-3 px-10 py-5',
                  {
                    'justify-between': dateType !== 'Rolling'
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
                {Object.entries(totalFooterData as PeriodMap).map(
                  (el, index) => (
                    <div
                      key={index}
                      className='grid w-full max-w-[73px]'
                    >
                      <Text
                        size='8'
                        lineHeight='18'
                        weight='500'
                        className='text-primary-14'
                      >
                        {dateType === 'Rolling'
                          ? `Rolling ${el[0].toLowerCase()}`
                          : toDateHeaderMap[el[0] as ToDateTab] || el[0]}
                      </Text>
                      <Text
                        size='11'
                        lineHeight='21'
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

export default RevenueOverviewUSD;
