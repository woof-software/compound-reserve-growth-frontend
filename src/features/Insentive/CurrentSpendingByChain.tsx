import React, { useMemo } from 'react';
import { useQueryState } from 'nuqs';

import BarChart from '@/components/Charts/Bar/Bar';
import { ChartActions } from '@/components/Charts/ChartActions';
import { DropdownFilter } from '@/components/Filter/DropdownFilter/DropdownFilter';
import { Filters } from '@/components/Filter/Filters';
import CurrentSpendingByChainTable, {
  SpendingByChainTableColumns
} from '@/entities/Insentive/CurrentSpendingByChainTable/CurrentSpendingByChainTable';
import { customChartOptions } from '@/features/Insentive/lib/customChartOptions';
import { getChartData } from '@/features/Insentive/lib/getChartData';
import { getCsvData } from '@/features/Insentive/lib/getCsvData';
import { tableDataNormalizer } from '@/features/Insentive/lib/tableDataNormalizer';
import { useOptions } from '@/shared/hooks/filters/useOptions';
import { useModal } from '@/shared/hooks/useModal';
import { SortAccessor, SortAdapter, useSorting } from '@/shared/hooks/useSorting';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
import {
  capitalizeFirstLetter,
  parseStingsArray
} from '@/shared/lib/utils/utils';
import { CombinedIncentivesData } from '@/shared/types/Incentive/types';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import Icon from '@/shared/ui/Icon/Icon';
import SortDrawer from '@/shared/ui/SortDrawer/SortDrawer';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

export interface CurrentSpendingByChainProps {
  data: CombinedIncentivesData[];
  isLoading?: boolean;
  isError?: boolean;
}

const sortColumns: SortAccessor<SpendingByChainTableColumns>[] = [
  { accessorKey: 'network', header: 'Network' },
  { accessorKey: 'valueComp', header: 'Value COMP' },
  { accessorKey: 'valueUsd', header: 'Value USD' }
];

const CurrentSpendingByChainBlock = (props: CurrentSpendingByChainProps) => {
  const {data, isLoading, isError } = props;

  const [activeTab, setActiveTab] = useQueryState('icscb-tab', { defaultValue: 'Total' });
  const [selectedChainKeys, setSelectedChainKeys] = useQueryState('icscb-chain', parseStingsArray([]));

  const clearAllFilters = () => {
    setSelectedChainKeys([]);
  };

  const {
    isOpen: isSortOpen,
    onOpenModal: onSortOpen,
    onCloseModal: onSortClose
  } = useModal();

  const chainOptions = useMemo(() => {
    if (!data?.length) return [];

    const uniqueNetworks = [...new Set(data.map((item) => item.source.network))];

    return uniqueNetworks.map((network) => ({
      value: network,
      label: capitalizeFirstLetter(network)
    }));
  }, [data]);

  const {
    selectedOptions: selectedChainOptions,
    setSelectedOptions: setSelectedChainOptions
  } = useOptions(chainOptions, selectedChainKeys, setSelectedChainKeys);

  const filteredData = useMemo(() => {
    if (!data?.length) return [];
    let result = data;

    const latestDate = result.reduce(
      (max, item) => (item.date > max ? item.date : max),
      result[0].date
    );
    result = result.filter((item) => item.date === latestDate);

    if (selectedChainKeys.length > 0) {
      result = result.filter((item) =>
        selectedChainKeys.includes(item.source.network)
      );
    }

    return result;
  }, [data, selectedChainKeys]);

  const chartData = getChartData(filteredData, activeTab);
  const tableData = tableDataNormalizer(filteredData, activeTab);
  const csvData = getCsvData(tableData);

  const { sortDirection, sortKey, onKeySelect, onTypeSelect } =
    useSorting<SpendingByChainTableColumns>('desc', 'valueUsd');

  const sortType: SortAdapter<SpendingByChainTableColumns> = {
    type: sortDirection,
    key: sortKey
  };

  return (
    <Card
      isLoading={isLoading}
      isError={isError}
      title='Current spending by chain'
      id='current-spending-by-chain'
      className={{
        loading: 'min-h-[inherit]',
        container:
          'min-h-[427px] overflow-visible rounded-lg lg:min-h-[458.5px]',
        header: 'rounded-t-lg',
        content:
          'flex flex-col gap-3 rounded-b-lg px-0 pt-0 pb-0 lg:px-10 lg:pb-10'
      }}
    >
      <div className={'flex sm:flex-row sm:items-center flex-col-reverse gap-2 py-3 px-5 lg:px-0 justify-end'}>
        <div className={'w-full sm:w-auto'}>
          <TabsGroup
            className={{
              container: 'w-full sm:w-auto',
              list: 'w-full sm:w-auto'
            }}
            tabs={['Lend', 'Borrow', 'Total']}
            value={activeTab!}
            onTabChange={setActiveTab}
          />
        </div>
        <div className={'flex w-full sm:w-auto justify-end gap-2'}>
          <Filters
            onClearAll={clearAllFilters}
            isShowClear={!!selectedChainOptions.length}
          >
            <DropdownFilter
              triggerLabel={'Chain'}
              options={chainOptions}
              selectedOptions={selectedChainOptions}
              getKey={(v) => v.value}
              getLabel={(v) => v.label}
              setValue={setSelectedChainOptions}
            />
          </Filters>
          <Button
            onClick={onSortOpen}
            className='bg-secondary-27 text-gray-11 shadow-13 grow sm:max-w-[130px] flex h-9 min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold md:h-8 lg:hidden'
          >
            <Icon
              name='sort-icon'
              className='h-[14px] w-[14px]'
            />
            Sort
          </Button>
          <SortDrawer
            isOpen={isSortOpen}
            sortType={sortType}
            columns={sortColumns}
            onClose={onSortClose}
            onKeySelect={onKeySelect}
            onTypeSelect={onTypeSelect}
          />
          <ChartActions
            mobileChildren={
              <CSVDownloadButton
                data={csvData}
                filename={getCsvFileName('Incentive_Current_Spending_By_Chain')}
              />
            }
          >
            <CSVDownloadButton
              data={csvData}
              filename={getCsvFileName('Incentive_Current_Spending_By_Chain')}
            />
          </ChartActions>
        </div>
      </div>
      {!isLoading && !isError && (
        <div className="flex flex-col justify-between gap-0 md:gap-10 lg:flex-row">
          <BarChart
            customOptions={customChartOptions}
            data={chartData}
            onClear={clearAllFilters}
          />
          <CurrentSpendingByChainTable
            sortType={sortType}
            tableData={tableData}
          />
        </div>
      )}
    </Card>
  );
};

export default CurrentSpendingByChainBlock;
