import { useMemo, useState } from 'react';

import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import RevenueBreakdown, {
  FormattedRevenueData
} from '@/components/RevenuePageTable/RevenueBreakdown';
import SingleDropdown from '@/components/SingleDropdown/SingleDropdown';
import { useCompCumulativeRevenue } from '@/shared/hooks/useCompCumulativeRevenue';
import {
  capitalizeFirstLetter,
  ChartDataItem,
  extractFilterOptions,
  formatNumber
} from '@/shared/lib/utils/utils';
import { OptionType } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import { useDropdown } from '@/shared/ui/Dropdown/Dropdown';
import Text from '@/shared/ui/Text/Text';

const RevenueBreakDownBlock = () => {
  const [selectedChains, setSelectedChains] = useState<OptionType[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<OptionType[]>([]);
  const [selectedSources, setSelectedSources] = useState<OptionType[]>([]);

  const {
    open: yearOpen,
    selectedValue: selectedYear,
    toggle: toggleYear,
    close: closeYear,
    select: selectYear
  } = useDropdown('single');

  const { data: apiResponse, isLoading, isError } = useCompCumulativeRevenue();

  const rawData: ChartDataItem[] = useMemo(
    () => apiResponse || [],
    [apiResponse]
  );

  const yearOptions = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return [];
    }
    const years = new Set(
      rawData.map((item) => new Date(item.date * 1000).getFullYear().toString())
    );
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [rawData]);

  const filterOptionsConfig = useMemo(
    () => ({
      chain: { path: 'source.network' },
      market: { path: 'source.market' },
      source: { path: 'source.type' }
    }),
    []
  );

  const { chainOptions, marketOptions, sourceOptions } = useMemo(
    () => extractFilterOptions(rawData, filterOptionsConfig),
    [rawData, filterOptionsConfig]
  );

  const filteredData = useMemo(() => {
    let data = rawData;

    if (selectedChains.length > 0) {
      const selectedValues = selectedChains.map((option) => option.id);
      data = data.filter((item) =>
        item.source.network
          ? selectedValues.includes(item.source.network)
          : false
      );
    }

    if (selectedMarkets.length > 0) {
      const selectedValues = selectedMarkets.map((option) => option.id);
      data = data.filter((item) => {
        const marketValue = item.source.market || 'no name';
        return selectedValues.includes(marketValue);
      });
    }

    if (selectedSources.length > 0) {
      const selectedValues = selectedSources.map((option) => option.id);
      data = data.filter((item) =>
        item.source.type ? selectedValues.includes(item.source.type) : false
      );
    }

    return data;
  }, [rawData, selectedChains, selectedMarkets, selectedSources]);

  const { tableData, dynamicColumns } = useMemo(() => {
    const yearToDisplay = selectedYear?.[0] || yearOptions[0];
    if (!yearToDisplay) {
      return { tableData: [], dynamicColumns: [] };
    }

    const dataForYear = filteredData.filter(
      (item) =>
        new Date(item.date * 1000).getFullYear().toString() === yearToDisplay
    );

    const columns: ExtendedColumnDef<FormattedRevenueData>[] = [
      { accessorKey: 'chain', header: 'Chain' }
    ];
    if (selectedMarkets.length > 0 || selectedSources.length > 0) {
      columns.push({ accessorKey: 'market', header: 'Market' });
    }
    if (selectedSources.length > 0) {
      columns.push({ accessorKey: 'source', header: 'Source' });
      columns.push({ accessorKey: 'reserveAsset', header: 'Reserve Asset' });
    }

    columns.push(
      {
        accessorKey: `q1_${yearToDisplay}`,
        header: `Q1 ${yearToDisplay}`,
        cell: ({ getValue }) => formatNumber(getValue() as number)
      },
      {
        accessorKey: `q2_${yearToDisplay}`,
        header: `Q2 ${yearToDisplay}`,
        cell: ({ getValue }) => formatNumber(getValue() as number)
      },
      {
        accessorKey: `q3_${yearToDisplay}`,
        header: `Q3 ${yearToDisplay}`,
        cell: ({ getValue }) => formatNumber(getValue() as number)
      },
      {
        accessorKey: `q4_${yearToDisplay}`,
        header: `Q4 ${yearToDisplay}`,
        cell: ({ getValue }) => {
          const val = getValue<number>();
          return val === 0 ? '-' : formatNumber(val);
        }
      }
    );

    if (dataForYear.length === 0) {
      return { tableData: [], dynamicColumns: columns };
    }

    const groupedData: Record<string, FormattedRevenueData> = {};

    dataForYear.forEach((item) => {
      const marketValue = item.source.market || 'no name';

      const keyParts = [item.source.network];
      if (selectedMarkets.length > 0 || selectedSources.length > 0) {
        keyParts.push(marketValue);
      }
      if (selectedSources.length > 0) {
        keyParts.push(item.source.type);
        keyParts.push(item.source.asset.symbol);
      }
      const groupKey = keyParts.join('-');

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          chain: capitalizeFirstLetter(item.source.network),
          market: marketValue,
          source: item.source.type,
          reserveAsset: item.source.asset.symbol,
          [`q1_${yearToDisplay}`]: 0,
          [`q2_${yearToDisplay}`]: 0,
          [`q3_${yearToDisplay}`]: 0,
          [`q4_${yearToDisplay}`]: 0
        };
      }

      const date = new Date(item.date * 1000);
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const quarterKey = `q${quarter}_${yearToDisplay}`;
      (groupedData[groupKey][quarterKey] as number) += item.value;
    });

    const finalData = Object.values(groupedData);

    return { tableData: finalData, dynamicColumns: columns };
  }, [
    filteredData,
    selectedYear,
    yearOptions,
    selectedMarkets,
    selectedSources
  ]);

  const hasData = tableData.length > 0;

  return (
    <Card
      title='Revenue Breakdown'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px]',
        content: 'flex flex-col gap-3 px-10 pt-0 pb-10'
      }}
    >
      <div className='flex justify-end gap-3 px-0 py-3'>
        <div className='flex items-center gap-5'>
          <div className='flex items-center gap-1'>
            <MultiSelect
              options={chainOptions || []}
              value={selectedChains}
              onChange={setSelectedChains}
              placeholder='Chain'
              disabled={isLoading}
            />
            <MultiSelect
              options={marketOptions || []}
              value={selectedMarkets}
              onChange={setSelectedMarkets}
              placeholder='Market'
              disabled={isLoading}
            />
            <MultiSelect
              options={sourceOptions || []}
              value={selectedSources}
              onChange={setSelectedSources}
              placeholder='Source'
              disabled={isLoading}
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
              Year
            </Text>
            <SingleDropdown
              options={yearOptions}
              isOpen={yearOpen}
              selectedValue={selectedYear?.[0] || yearOptions[0] || ''}
              onToggle={toggleYear}
              onClose={closeYear}
              onSelect={selectYear}
              contentClassName='p-[5px]'
              triggerContentClassName='p-[5px]'
              disabled={isLoading}
            />
          </div>
        </div>
        <CSVDownloadButton
          data={tableData}
          filename={`Revenue Breakdown ${selectedYear?.[0] || yearOptions[0]}.csv`}
        />
      </div>
      {hasData ? (
        <RevenueBreakdown
          data={tableData}
          columns={dynamicColumns}
        />
      ) : (
        <div className='flex h-full min-h-[300px] items-center justify-center'>
          <Text
            size='12'
            className='text-primary-14'
          >
            No data for selected filters
          </Text>
        </div>
      )}
    </Card>
  );
};

export default RevenueBreakDownBlock;
