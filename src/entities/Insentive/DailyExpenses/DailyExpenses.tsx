import { useState } from 'react';

import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import { DailyExpensesMobileFilters } from '@/entities/Insentive/DailyExpenses/DailyExpensesMobileFilters';
import DailyExpensesTable from '@/entities/Insentive/DailyExpenses/DailyExpensesTable';
import { getCsvData } from '@/entities/Insentive/DailyExpenses/lib/getCsvData';
import { normalizeTableData } from '@/entities/Insentive/DailyExpenses/lib/normalizeTableData';
import { NormalizedTableData } from '@/entities/Insentive/DailyExpenses/lib/types';
import { useChainMarketFilters } from '@/entities/Insentive/useChainMarketFilters';
import {
  useFiltersSync,
  useFilterSyncSingle
} from '@/shared/hooks/useFiltersSync';
import { SortAdapter, useSorting } from '@/shared/hooks/useSorting';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
import { CombinedIncentivesData } from '@/shared/types/Incentive/types';
import { MultiSelect } from '@/shared/ui/AnimationProvider/MultiSelect/MultiSelect';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import View from '@/shared/ui/View/View';

interface DailyExpensesProps {
  isLoading?: boolean;
  isError?: boolean;
  data: CombinedIncentivesData[];
}

const DailyExpenses = ({ isLoading, isError, data }: DailyExpensesProps) => {
  const [activeViewTab, setActiveViewTab] = useState<'COMP' | 'USD'>('COMP');

  const {
    chainOptions,
    deploymentOptionsFilter,
    selectedOptions,
    onSelectChain,
    onSelectMarket,
    setSelectedOptions,
    filteredData,
    clearAllFilters,
    mobileFilterOptions
  } = useChainMarketFilters(data, { filterByLatestDate: true });

  const normalizedTableData = normalizeTableData(filteredData, activeViewTab);
  const { sortDirection, sortKey, onKeySelect, onTypeSelect } =
    useSorting<NormalizedTableData>('asc', null);
  const csvData = getCsvData(normalizedTableData);

  const sortType: SortAdapter<NormalizedTableData> = {
    type: sortDirection,
    key: sortKey
  };

  useFiltersSync(selectedOptions, setSelectedOptions, 'icscb', [
    'chain',
    'deployment'
  ]);
  useFilterSyncSingle(
    'incentivesDailyExpenses',
    activeViewTab,
    setActiveViewTab
  );

  return (
    <Card
      isError={isError}
      isLoading={isLoading}
      title='Daily expenses'
      id='daily-expenses'
      className={{
        loading: 'min-h-[inherit]',
        container:
          'min-h-[427px] overflow-visible rounded-lg lg:min-h-[458.5px]',
        content: 'rounded-b-lg px-0 pt-0 pb-0 lg:px-10 lg:pb-10',
        header: 'rounded-t-lg'
      }}
    >
      <div className='hidden items-center justify-end gap-2 px-10 py-3 lg:flex lg:px-0'>
        <TabsGroup
          tabs={['COMP', 'USD']}
          value={activeViewTab}
          onTabChange={setActiveViewTab}
        />
        <MultiSelect
          options={chainOptions}
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
          filename={getCsvFileName('incentives_daily_expenses', {
            view: activeViewTab
          })}
        />
      </div>
      <DailyExpensesMobileFilters
        filterOptions={mobileFilterOptions}
        sortType={sortType}
        onKeySelect={onKeySelect}
        onTypeSelect={onTypeSelect}
        onClearAll={clearAllFilters}
        csvData={csvData}
        activeViewTab={activeViewTab}
        setActiveViewTab={setActiveViewTab}
      />
      <View.Condition
        if={Boolean(!isLoading && !isError && normalizedTableData.length)}
      >
        <DailyExpensesTable
          activeViewTab={activeViewTab}
          sortType={sortType}
          tableData={normalizedTableData}
        />
      </View.Condition>
      <View.Condition
        if={Boolean(!isLoading && !isError && !normalizedTableData.length)}
      >
        <NoDataPlaceholder onButtonClick={clearAllFilters} />
      </View.Condition>
    </Card>
  );
};

export default DailyExpenses;
