import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react';

import {
  CompoundFeeRevenueByChainGroupDrawer,
  CompoundFeeRevenueByChainProps,
  CompoundFeeRevenueByChainTable,
  generateOptions,
  Interval,
  intervalOptions,
  PrecomputedViews,
  PrecomputedViewType,
  precomputeViews,
  ProcessedRevenueData
} from '@/entities/Revenue';
import { NO_DATA_AVAILABLE } from '@/shared/consts';
import { useDropdown, useModal } from '@/shared/hooks';
import { capitalizeFirstLetter } from '@/shared/lib/utils';
import { Button, Icon, Text } from '@/shared/ui/atoms';
import { Card, ExtendedColumnDef } from '@/shared/ui/molecules';
import {
  SingleDrawer,
  SingleDropdown,
  SortDrawer
} from '@/shared/ui/organisms';

const CompoundFeeRevenueByChain = ({
  revenueData,
  isLoading,
  isError
}: CompoundFeeRevenueByChainProps) => {
  const [selectedInterval, setSelectedInterval] = useState<Interval>(
    intervalOptions[0]
  );

  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>();

  const [sortType, setSortType] = useReducer(
    (prev, next) => ({
      ...prev,
      ...next
    }),
    { key: '', type: 'asc' }
  );

  const intervalDropdown = useDropdown('single');

  const periodDropdown = useDropdown('single');

  const {
    isOpen: isSortOpen,
    onOpenModal: onSortOpen,
    onCloseModal: onSortClose
  } = useModal();

  const {
    isOpen: isGroupByOpen,
    onOpenModal: onGroupByOpen,
    onCloseModal: onGroupByClose
  } = useModal();

  const groupInterval = useMemo(() => {
    return {
      label: 'Interval',
      options: intervalOptions,
      selectedValue: selectedInterval
    };
  }, [selectedInterval]);

  const precomputedViews = useMemo(
    () => precomputeViews(revenueData || []),
    [revenueData]
  );

  const dynamicOptions = useMemo(
    () => generateOptions(precomputedViews, selectedInterval),
    [precomputedViews, selectedInterval]
  );

  const groupDynamic = useMemo(() => {
    return {
      label: dynamicOptions.label,
      options: dynamicOptions.options,
      selectedValue: selectedPeriod || ''
    };
  }, [dynamicOptions, selectedPeriod]);

  const currentView = useMemo(() => {
    if (!precomputedViews || !selectedPeriod) {
      return { tableData: [], columns: [], totals: {} };
    }

    const viewData: PrecomputedViewType | undefined =
      precomputedViews[
        selectedInterval.toLowerCase() as keyof PrecomputedViews
      ]?.[selectedPeriod];

    if (!viewData) {
      return { tableData: [], columns: [], totals: {} };
    }

    const finalColumns: ExtendedColumnDef<ProcessedRevenueData>[] = [
      {
        accessorKey: 'chain',
        header: 'Chain',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Icon
              name={(row.original.chain || 'not-found-icon').toLowerCase()}
              className='h-6 w-6'
              folder='network'
            />
            <Text
              size='13'
              weight='500'
            >
              {capitalizeFirstLetter(row.original.chain)}
            </Text>
          </div>
        )
      },
      ...viewData.columns
    ];

    return { ...viewData, columns: finalColumns };
  }, [precomputedViews, selectedInterval, selectedPeriod]);

  const compoundFeeRevenueByCainColumns = useMemo(() => {
    if (!precomputedViews || !selectedPeriod) {
      return [
        {
          accessorKey: 'chain',
          header: 'Chain'
        }
      ];
    }

    const viewData: PrecomputedViewType | undefined =
      precomputedViews[
        selectedInterval.toLowerCase() as keyof PrecomputedViews
      ]?.[selectedPeriod];

    const columns =
      viewData?.columns?.map((el) => ({
        accessorKey: el.accessorKey,
        header: el.header
      })) || [];

    return [
      {
        accessorKey: 'chain',
        header: 'Chain'
      },
      ...columns
    ];
  }, [precomputedViews, selectedPeriod, selectedInterval]);

  const hasData = currentView.tableData.length > 0;

  const sortColumns = useMemo(() => {
    return compoundFeeRevenueByCainColumns.map((col) => ({
      accessorKey: String(col.accessorKey),
      header: typeof col.header === 'string' ? col.header : ''
    }));
  }, [compoundFeeRevenueByCainColumns]);

  const onIntervalSelect = (newInterval: string) => {
    const newOptions = generateOptions(precomputedViews, newInterval);
    const newDefaultPeriod =
      newOptions.options.length > 0 ? newOptions.options[0] : undefined;

    setSelectedInterval(newInterval as Interval);
    setSelectedPeriod(newDefaultPeriod);
    intervalDropdown.close();
  };

  const onPeriodSelect = (period: string) => {
    setSelectedPeriod(period);
    periodDropdown.close();
  };

  const onKeySelect = useCallback((value: string) => {
    setSortType({
      key: value
    });
  }, []);

  const onTypeSelect = useCallback((value: string) => {
    setSortType({
      type: value
    });
  }, []);

  useEffect(() => {
    if (precomputedViews && !selectedPeriod) {
      const initialOptions = generateOptions(
        precomputedViews,
        selectedInterval
      );
      if (initialOptions.options.length > 0) {
        setSelectedPeriod(initialOptions.options[0]);
      }
    }
  }, [precomputedViews, selectedPeriod, selectedInterval]);

  return (
    <Card
      title='Compound Fee Revenue by Chain'
      id='Compound Fee Revenue by Chain'
      isLoading={isLoading}
      isError={isError}
      className={{
        container: 'border-background border',
        loading: 'min-h-[571px]',
        content: 'flex flex-col px-0 pt-0 pb-0 md:gap-3 lg:px-10 lg:pb-10'
      }}
    >
      <div className='flex flex-wrap justify-end gap-2 px-5 py-3 md:px-10 lg:px-0'>
        <div className='hidden items-center gap-1 lg:flex'>
          <Text
            tag='span'
            size='11'
            weight='600'
            lineHeight='16'
            className='text-primary-14'
          >
            Interval
          </Text>
          <div className='hidden lg:block'>
            <SingleDropdown
              options={intervalOptions}
              isOpen={intervalDropdown.isOpen}
              onOpen={intervalDropdown.open}
              onClose={intervalDropdown.close}
              onSelect={onIntervalSelect}
              selectedValue={selectedInterval}
              triggerContentClassName='p-[5px]'
            />
          </div>
          <div className='block lg:hidden'>
            <SingleDrawer
              placeholder='Interval'
              options={intervalOptions}
              isOpen={intervalDropdown.isOpen}
              onOpen={intervalDropdown.open}
              onClose={intervalDropdown.close}
              onSelect={onIntervalSelect}
              selectedValue={selectedInterval}
              triggerContentClassName='p-[5px]'
            />
          </div>
        </div>
        <div className='hidden items-center gap-1 lg:flex'>
          <Text
            tag='span'
            size='11'
            weight='600'
            lineHeight='16'
            className='text-primary-14'
          >
            {dynamicOptions.label}
          </Text>
          <div className='hidden lg:block'>
            <SingleDropdown
              options={dynamicOptions.options}
              isOpen={periodDropdown.isOpen}
              onOpen={periodDropdown.open}
              onClose={periodDropdown.close}
              onSelect={onPeriodSelect}
              selectedValue={selectedPeriod}
              triggerContentClassName='p-[5px]'
            />
          </div>
          <div className='block lg:hidden'>
            <SingleDrawer
              placeholder={dynamicOptions.label}
              options={dynamicOptions.options}
              isOpen={periodDropdown.isOpen}
              onOpen={periodDropdown.open}
              onClose={periodDropdown.close}
              onSelect={onPeriodSelect}
              selectedValue={selectedPeriod}
              triggerContentClassName='p-[5px]'
            />
          </div>
        </div>
        <div className='flex w-full items-center justify-end gap-2 lg:hidden'>
          <Button
            onClick={onGroupByOpen}
            className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-full min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:h-8 lg:hidden'
          >
            <Icon
              name='group-grid'
              className='h-[14px] w-[14px] fill-none'
            />
            Group
          </Button>
          <Button
            onClick={onSortOpen}
            className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-full min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:h-8 lg:hidden'
          >
            <Icon
              name='sort-icon'
              className='h-[14px] w-[14px]'
            />
            Sort
          </Button>
        </div>
      </div>
      {!isLoading && !isError && !hasData ? (
        <div className='flex h-[400px] items-center justify-center'>
          <Text
            size='12'
            className='text-primary-14'
          >
            {NO_DATA_AVAILABLE}
          </Text>
        </div>
      ) : (
        <CompoundFeeRevenueByChainTable
          sortType={sortType}
          data={currentView.tableData}
          columns={currentView.columns}
          totals={currentView.totals}
          selectedInterval={selectedInterval}
        />
      )}
      <SortDrawer
        isOpen={isSortOpen}
        sortType={sortType}
        columns={sortColumns}
        onClose={onSortClose}
        onKeySelect={onKeySelect}
        onTypeSelect={onTypeSelect}
      />
      <CompoundFeeRevenueByChainGroupDrawer
        isOpen={isGroupByOpen}
        onClose={onGroupByClose}
        interval={groupInterval}
        groupDynamic={groupDynamic}
        onIntervalSelect={onIntervalSelect}
        onDynamicSelect={onPeriodSelect}
      />
    </Card>
  );
};

export { CompoundFeeRevenueByChain };
