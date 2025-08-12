import React, { useMemo } from 'react';

import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { capitalizeFirstLetter, formatNumber } from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Text from '@/shared/ui/Text/Text';

export interface FormattedRevenueData {
  chain: string;
  market: string;
  source: string;
  reserveAsset: string;
  [key: string]: string | number;
}

interface RevenueBreakdownProps {
  data: FormattedRevenueData[];
  columns: ExtendedColumnDef<FormattedRevenueData>[];
}

type ColKey = { accessorKey: string; header: string };

const formatCurrencyValue = (value: unknown): string => {
  const num = Number(value);

  if (value === null || typeof value === 'undefined' || isNaN(num)) {
    return '-';
  }

  if (num === 0) {
    return '-';
  }

  const isNegative = num < 0;
  const absValue = Math.abs(num);

  const formattedNumber = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(absValue);

  return isNegative ? `-$${formattedNumber}` : `$${formattedNumber}`;
};

const RevenueBreakdown = ({ data, columns }: RevenueBreakdownProps) => {
  const totals = useMemo(() => {
    const columnTotals: Record<string, number> = {};

    columns.forEach((col) => {
      const key = 'accessorKey' in col ? String(col.accessorKey) : col.id;
      if (key && key.startsWith('q')) {
        columnTotals[key] = 0;
      }
    });

    data.forEach((row) => {
      for (const key in columnTotals) {
        const value = Number(row[key]);
        if (!isNaN(value)) {
          columnTotals[key] += value;
        }
      }
    });

    return columnTotals;
  }, [data, columns]);

  const displayColumns = useMemo(() => {
    return columns.map((col) => {
      const key = 'accessorKey' in col ? String(col.accessorKey) : col.id;

      if (key && key.startsWith('q')) {
        return {
          ...col,
          cell: ({ getValue }: { getValue: () => unknown }) =>
            formatCurrencyValue(getValue())
        };
      }
      return col;
    });
  }, [columns]);

  const footerRow = (
    <tr key='footer-total-row'>
      {columns.map((col, index) => {
        const columnKey =
          'accessorKey' in col ? String(col.accessorKey) : col.id;

        if (index === 0) {
          return (
            <td
              key='footer-total-label'
              className='text-primary-14 px-[5px] py-[13px] text-left text-[13px] font-medium'
            >
              Total
            </td>
          );
        }

        if (!columnKey || !columnKey.startsWith('q')) {
          return <td key={columnKey || index}></td>;
        }

        const totalValue = totals[columnKey];
        return (
          <td
            key={columnKey}
            className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'
          >
            {formatCurrencyValue(totalValue)}
          </td>
        );
      })}
    </tr>
  );

  const filteredMobileData = useMemo(() => {
    const columnsKeys: ColKey[] = columns.map((col) => {
      const accessorKey =
        'accessorKey' in col && col.accessorKey
          ? String(col.accessorKey)
          : col.id;
      const header = String(col.header ?? col.id);
      return { accessorKey: accessorKey || '', header };
    });

    return data.map((row) => {
      const rowData: Record<string, unknown> = {};
      columnsKeys.forEach(({ accessorKey, header }) => {
        rowData[header] = row[accessorKey];
      });
      return rowData;
    });
  }, [data, columns]);

  console.log('data=>', data);
  console.log('columns=>', columns);

  console.log('filteredMobileData=>', filteredMobileData);

  return (
    <>
      <MobileDataTable tableData={filteredMobileData}>
        {(dataRows) => (
          <>
            {dataRows.map((rowObj, rowIndex) => (
              <div
                key={rowIndex}
                className='border-secondary-23 flex flex-wrap items-center justify-start gap-x-[63px] gap-y-3 border-b px-10 py-5'
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
                      {key === 'Chain'
                        ? (value as string)
                        : formatCurrencyValue(value || 0)}
                    </Text>
                  </div>
                ))}
              </div>
            ))}
            <div className='flex flex-wrap items-center justify-start gap-x-[63px] gap-y-3 px-10 py-5'>
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

                const columnHeader =
                  'header' in col ? String(col.header) : col.id;

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
                        {columnHeader}
                      </Text>
                      <Text
                        size='8'
                        lineHeight='18'
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
                      {columnHeader}
                    </Text>
                    <Text
                      size='11'
                      lineHeight='21'
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
          columns={displayColumns}
          pageSize={10}
          className='flex min-h-[565px] flex-col justify-between'
          headerCellClassName='py-[13px] px-[5px]'
          cellClassName='py-3 px-[5px]'
          headerTextClassName='text-primary-14 font-medium'
          footerContent={
            columns.length > 0 && data.length > 0 ? footerRow : null
          }
        />
      </div>
    </>
  );
};

export default RevenueBreakdown;
