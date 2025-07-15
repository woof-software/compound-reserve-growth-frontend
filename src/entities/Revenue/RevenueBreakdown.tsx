import React, { useEffect, useMemo } from 'react';
import type { CellContext } from '@tanstack/react-table';

import CompoundFeeRevenuebyChain, {
  ProcessedRevenueData
} from '@/components/RevenuePageTable/CompoundFeeRevenuebyChain';
import SingleDropdown from '@/components/SingleDropdown/SingleDropdown';
import { RevenuePageProps } from '@/shared/hooks/useRevenue';
import { precomputeViews } from '@/shared/lib/utils/utils';
import Card from '@/shared/ui/Card/Card';
import { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import { useDropdown } from '@/shared/ui/Dropdown/Dropdown';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

export interface View {
  tableData: ProcessedRevenueData[];
  totals: { [key: string]: number };
  columns: ExtendedColumnDef<ProcessedRevenueData>[];
}

export interface PrecomputedViews {
  quarterly: Record<string, View>;
  monthly: Record<string, View>;
  weekly: Record<string, View>;
}

const intervalOptions = ['Quarterly', 'Monthly', 'Weekly'];

const generateOptions = (views: PrecomputedViews | null, interval: string) => {
  if (!views) return { label: 'Year', options: [] };
  switch (interval) {
    case 'Quarterly':
      return {
        label: 'Year',
        options: Object.keys(views.quarterly).sort(
          (a, b) => parseInt(b) - parseInt(a)
        )
      };
    case 'Monthly':
      return {
        label: 'Period',
        options: Object.keys(views.monthly).sort(
          (a, b) =>
            new Date(b.split(' ')[1]).getTime() -
              new Date(a.split(' ')[1]).getTime() ||
            (b.startsWith('Jul') ? 1 : -1)
        )
      };
    case 'Weekly':
      return {
        label: 'Month',
        options: Object.keys(views.weekly).sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime()
        )
      };
    default:
      return { label: 'Period', options: [] };
  }
};

const CompoundFeeRevenueByChain = ({
  revenueData,
  isLoading,
  isError
}: RevenuePageProps) => {
  const intervalDropdown = useDropdown('single');
  const periodDropdown = useDropdown('single');

  const selectedInterval = intervalDropdown.selectedValue?.[0] || 'Quarterly';
  const selectedPeriod = periodDropdown.selectedValue?.[0];

  const precomputedViews = useMemo(
    () => precomputeViews(revenueData || []),
    [revenueData]
  );

  const dynamicOptions = useMemo(
    () => generateOptions(precomputedViews, selectedInterval),
    [precomputedViews, selectedInterval]
  );

  useEffect(() => {
    if (dynamicOptions.options.length > 0) {
      if (
        !periodDropdown.selectedValue ||
        !dynamicOptions.options.includes(periodDropdown.selectedValue[0])
      ) {
        periodDropdown.select(dynamicOptions.options[0]);
      }
    }
  }, [dynamicOptions, periodDropdown]);

  const { tableData, columns, totals } = useMemo(() => {
    if (!precomputedViews || !selectedPeriod) {
      return { tableData: [], columns: [], totals: {} };
    }

    const viewData: View | undefined =
      precomputedViews[
        selectedInterval.toLowerCase() as keyof PrecomputedViews
      ]?.[selectedPeriod];

    if (!viewData) return { tableData: [], columns: [], totals: {} };

    const remappedDataColumns = viewData.columns.map((col) => {
      const originalCell = col.cell;
      if (!originalCell) {
        return col;
      }

      return {
        ...col,
        cell: (props: CellContext<ProcessedRevenueData, unknown>) => {
          const renderedValue =
            typeof originalCell === 'function'
              ? originalCell(props)
              : originalCell;

          if (
            typeof renderedValue === 'string' &&
            renderedValue.startsWith('$-')
          ) {
            return `-${renderedValue.replace('-', '')}`;
          }
          return renderedValue;
        }
      };
    });

    const finalColumns: ExtendedColumnDef<ProcessedRevenueData>[] = [
      {
        accessorKey: 'chain',
        header: 'Chain',
        cell: ({ getValue }: { getValue: () => unknown }) => (
          <div className='flex items-center gap-2'>
            <Icon
              name={getValue() as string}
              className='h-5 w-5'
            />
            <span>{getValue() as string}</span>
          </div>
        )
      },
      ...remappedDataColumns
    ];

    return { ...viewData, columns: finalColumns };
  }, [precomputedViews, selectedInterval, selectedPeriod]);

  const hasData = tableData.length > 0;
  const noDataMessage = 'No data available';

  return (
    <Card
      title='Compound Fee Revenue by Chain'
      id='revenue-breakdown'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[571px]',
        content: 'flex flex-col gap-3 px-10 pt-0 pb-10'
      }}
    >
      <div className='flex justify-end gap-3 px-0 py-3'>
        <div className='flex items-center gap-1'>
          <Text
            tag='span'
            size='11'
            weight='600'
            lineHeight='16'
            className='text-primary-14'
          >
            Interval
          </Text>
          <SingleDropdown
            options={intervalOptions}
            isOpen={intervalDropdown.open}
            onToggle={intervalDropdown.toggle}
            onClose={intervalDropdown.close}
            onSelect={intervalDropdown.select}
            selectedValue={selectedInterval}
            contentClassName='p-[5px]'
            triggerContentClassName='p-[5px]'
          />
        </div>
        <div className='flex items-center gap-1'>
          <Text
            tag='span'
            size='11'
            weight='600'
            lineHeight='16'
            className='text-primary-14'
          >
            {dynamicOptions.label}
          </Text>
          <SingleDropdown
            options={dynamicOptions.options}
            isOpen={periodDropdown.open}
            onToggle={periodDropdown.toggle}
            onClose={periodDropdown.close}
            onSelect={periodDropdown.select}
            selectedValue={periodDropdown.selectedValue?.[0]}
            contentClassName='p-[5px]'
            triggerContentClassName='p-[5px]'
          />
        </div>
      </div>
      {!isLoading && !isError && !hasData ? (
        <div className='flex h-[400px] items-center justify-center'>
          <Text
            size='12'
            className='text-primary-14'
          >
            {noDataMessage}
          </Text>
        </div>
      ) : (
        <CompoundFeeRevenuebyChain
          data={tableData}
          columns={columns}
          totals={totals}
        />
      )}
    </Card>
  );
};

export default CompoundFeeRevenueByChain;
