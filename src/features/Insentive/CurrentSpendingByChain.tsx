import React, { useState } from 'react';

import CryptoChart from '@/components/Charts/Bar/Bar';
import CurrentSpendingByChainTable from '@/entities/Insentive/CurrentSpendingByChainTable/CurrentSpendingByChainTable';
import { CurrendSpendingByChainMobileFilters } from '@/features/Insentive/CurrendSpendingByChainMobileFilters';
import { getChartData } from '@/features/Insentive/lib/getChartData';
import { getCsvData } from '@/features/Insentive/lib/getCsvData';
import { tableDataNormalizer } from '@/features/Insentive/lib/tableDataNormalizer';
import { useChainMarketFilters } from '@/shared/hooks/useChainMarketFilters';
import {
  useFiltersSync,
  useFilterSyncSingle
} from '@/shared/hooks/useFiltersSync';
import { useSorting } from '@/shared/hooks/useSorting';
import { MultiSelect } from '@/shared/ui/AnimationProvider/MultiSelect/MultiSelect';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import View from '@/shared/ui/View/View';

const CurrentSpendingByChainBlock = ({ isLoading, isError, data }: any) => {
  const [activeTab, setActiveTab] = useState<string>('Total');

  const {
    chainOptions,
    deploymentOptionsFilter,
    selectedOptions,
    setSelectedOptions,
    onSelectChain,
    onSelectMarket,
    filteredData,
    clearAllFilters,
    mobileFilterOptions
  } = useChainMarketFilters(data, { filterByLatestDate: true });

  const chartData = getChartData(filteredData, activeTab);
  const tableData = tableDataNormalizer(filteredData, activeTab);
  const csvData = getCsvData(tableData);
  const { sortType, onKeySelect, onTypeSelect } = useSorting();

  useFilterSyncSingle('icscb', activeTab, setActiveTab);
  useFiltersSync(selectedOptions, setSelectedOptions, 'icscb', [
    'chain',
    'deployment'
  ]);

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
      <div className='hidden items-center justify-end gap-2 px-10 py-3 lg:flex lg:px-0'>
        <TabsGroup
          tabs={['Lend', 'Borrow', 'Total']}
          value={activeTab}
          onTabChange={setActiveTab}
        />
        <MultiSelect
          options={chainOptions || []}
          value={selectedOptions.chain}
          onChange={onSelectChain}
          placeholder='Chain'
          disabled={isLoading}
        />
        <MultiSelect
          options={deploymentOptionsFilter}
          value={selectedOptions.deployment}
          onChange={onSelectMarket}
          placeholder='Market'
          disabled={isLoading || !Boolean(deploymentOptionsFilter.length)}
        />
        <CSVDownloadButton
          data={csvData}
          filename={'Incentive_Current_Spending_By_Chain'}
        />
      </div>
      <CurrendSpendingByChainMobileFilters
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sortType={sortType}
        //@ts-expect-error TODO: fix csv data error
        csvData={csvData}
        onKeySelect={onKeySelect}
        onTypeSelect={onTypeSelect}
        filterOptions={mobileFilterOptions}
        onClearFilters={clearAllFilters}
      />
      <View.Condition if={Boolean(!isLoading && !isError)}>
        <div className='flex flex-col justify-between gap-0 md:gap-10 lg:flex-row'>
          <CryptoChart
            //@ts-expect-error TODO: fix chart data error
            data={chartData}
            onClear={clearAllFilters}
          />
          <CurrentSpendingByChainTable
            sortType={sortType}
            tableData={tableData}
          />
        </div>
      </View.Condition>
    </Card>
  );
};

export default CurrentSpendingByChainBlock;
