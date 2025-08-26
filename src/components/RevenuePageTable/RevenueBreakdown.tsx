import React, { useMemo } from 'react';

import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { formatNumber } from '@/shared/lib/utils/utils';
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
  sortType:
    | { key: string; type: 'asc' | 'desc' }
    | { key: string; type: string };
}

type ColKey = { accessorKey: string; header: string };

const formatCurrencyValue = (value: unknown): string => {
  const num = Number(value);

  if (value === null || typeof value === 'undefined' || isNaN(num)) return '-';

  if (num === 0) return '-';

  const isNegative = num < 0;

  const absValue = Math.abs(num);

  const formattedNumber = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(absValue);

  return isNegative ? `-$${formattedNumber}` : `$${formattedNumber}`;
};

const RevenueBreakdown = ({
  data,
  columns,
  sortType
}: RevenueBreakdownProps) => {
  const totals = useMemo(() => {
    const columnTotals: Record<string, number> = {};

    columns.forEach((col) => {
      const key = 'accessorKey' in col ? String(col.accessorKey) : col.id;

      if (key && key.startsWith('q')) columnTotals[key] = 0;
    });

    data.forEach((row) => {
      for (const key in columnTotals) {
        const value = Number(row[key]);

        if (!isNaN(value)) columnTotals[key] += value;
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
          return <td key={columnKey || index} />;
        }

        const totalValue = totals[columnKey];

        return (
          <td
            key={columnKey}
            className='text-primary-14 px-[5px] py-[13px] text-left text-[13px] font-medium'
          >
            {formatCurrencyValue(totalValue)}
          </td>
        );
      })}
    </tr>
  );

  const colKeys: ColKey[] = useMemo(() => {
    return columns
      .map((col) => {
        const accessorKey =
          'accessorKey' in col && col.accessorKey
            ? String(col.accessorKey)
            : col.id;

        const header = String(('header' in col ? col.header : col.id) ?? '');

        return { accessorKey, header };
      })
      .filter((c): c is ColKey => Boolean(c.accessorKey));
  }, [columns]);

  const filteredMobileData = useMemo(() => {
    const base = [...data];

    if (sortType && 'key' in sortType && sortType.key) {
      const k = sortType.key as keyof FormattedRevenueData;

      base.sort((a, b) => {
        const av = a[k];
        const bv = b[k];

        if (typeof av === 'number' && typeof bv === 'number') {
          return sortType.type === 'asc' ? av - bv : bv - av;
        }

        if (typeof av === 'string' && typeof bv === 'string') {
          return sortType.type === 'asc'
            ? av.localeCompare(bv)
            : bv.localeCompare(av);
        }

        return 0;
      });
    }

    return base.map((row) =>
      colKeys.reduce<Record<string, unknown>>((acc, { accessorKey }) => {
        acc[accessorKey] = row[accessorKey];
        return acc;
      }, {})
    );
  }, [data, sortType, colKeys]);

  return (
    <>
      <MobileDataTable tableData={filteredMobileData}>
        {(dataRows) => (
          <>
            {dataRows.map((rowObj, rowIndex) => (
              <div
                key={rowIndex}
                className='border-secondary-23 grid grid-cols-3 gap-x-10 gap-y-3 border-b p-5 md:gap-x-[63px] md:px-10'
              >
                {colKeys.map(({ accessorKey, header }, colIndex) => {
                  const raw = (rowObj as Record<string, unknown>)[accessorKey];
                  const display =
                    accessorKey === 'chain'
                      ? Boolean(raw)
                        ? (raw as string)
                        : '-'
                      : formatCurrencyValue(raw);

                  return (
                    <div
                      key={`${rowIndex}-${accessorKey}-${colIndex}`}
                      className='grid w-full max-w-[100px]'
                    >
                      <Text
                        size='11'
                        lineHeight='18'
                        weight='500'
                        className='text-primary-14'
                      >
                        {header}
                      </Text>
                      <Text
                        size='13'
                        lineHeight='21'
                        className='truncate'
                      >
                        {display}
                      </Text>
                    </div>
                  );
                })}
              </div>
            ))}
            <div className='grid grid-cols-3 gap-x-10 gap-y-3 p-5 md:gap-x-[63px] md:px-10'>
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
              {columns.slice(1).map((col) => {
                const columnKey =
                  'accessorKey' in col ? String(col.accessorKey) : col.id;
                const columnHeader =
                  'header' in col ? String(col.header) : col.id;

                if (!columnKey) return null;

                const totalValue = totals[columnKey];

                if (typeof totalValue !== 'number' || isNaN(totalValue)) {
                  return (
                    <div
                      key={columnKey}
                      className='grid min-h-[39px] w-full max-w-[100px]'
                    >
                      <Text
                        size='13'
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
                    className='grid min-h-[39px] w-full max-w-[100px]'
                  >
                    <Text
                      size='11'
                      lineHeight='18'
                      weight='500'
                      className='text-primary-14'
                    >
                      {columnHeader}
                    </Text>
                    <Text
                      size='13'
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
