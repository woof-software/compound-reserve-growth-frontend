import { useCallback, useMemo, useState } from 'react';

import CompoundRevenue from '@/components/Charts/CompoundRevenue/CompoundRevenue';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { type RevenuePageProps } from '@/shared/hooks/useRevenue';
import { extractFilterOptions } from '@/shared/lib/utils/utils';
import { OptionType } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import View from '@/shared/ui/View/View';

const CompoundRevenueBlock = ({
  revenueData: data,
  isLoading,
  isError
}: RevenuePageProps) => {
  const [selectedChains, setSelectedChains] = useState<OptionType[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<OptionType[]>([]);
  const [selectedSources, setSelectedSources] = useState<OptionType[]>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<OptionType[]>([]);

  const {
    activeTab,
    barSize,
    barCount,
    handleTabChange,
    handleBarSizeChange,
    handleVisibleBarsChange
  } = useChartControls({
    initialTimeRange: '7B',
    initialBarSize: 'D'
  });

  const handleResetFilters = useCallback(() => {
    setSelectedChains([]);
    setSelectedMarkets([]);
    setSelectedSources([]);
    setSelectedSymbols([]);
  }, []);

  const filterOptionsConfig = useMemo(
    () => ({
      chain: { path: 'source.network' },
      market: { path: 'source.market' },
      source: { path: 'source.type' },
      symbol: { path: 'source.asset.symbol' }
    }),
    []
  );

  const { chainOptions, marketOptions, sourceOptions, symbolOptions } = useMemo(
    () => extractFilterOptions(data, filterOptionsConfig),
    [data, filterOptionsConfig]
  );

  const processedChartData = useMemo(() => {
    const selectedChainIds = selectedChains.map((opt) => opt.id);
    const selectedMarketIds = selectedMarkets.map((opt) => opt.id);
    const selectedSourceIds = selectedSources.map((opt) => opt.id);
    const selectedSymbolIds = selectedSymbols.map((opt) => opt.id);

    return data
      .filter((item) => {
        const chainMatch =
          selectedChainIds.length === 0 ||
          selectedChainIds.includes(item.source?.network);

        const marketMatch =
          selectedMarketIds.length === 0 ||
          (() => {
            let marketValue = item.source?.market;
            if (marketValue === null) {
              marketValue = 'no name';
            }
            return selectedMarketIds.includes(marketValue);
          })();

        const sourceMatch =
          selectedSourceIds.length === 0 ||
          selectedSourceIds.includes(item.source?.type);

        const symbolMatch =
          selectedSymbolIds.length === 0 ||
          selectedSymbolIds.includes(item.source?.asset?.symbol);

        return chainMatch && marketMatch && sourceMatch && symbolMatch;
      })
      .map((item) => ({
        date: new Date(item.date * 1000).toISOString().split('T')[0],
        value: item.value
      }));
  }, [data, selectedChains, selectedMarkets, selectedSources, selectedSymbols]);

  const hasData = processedChartData.length > 0;
  const noDataMessage =
    selectedChains.length > 0 ||
    selectedMarkets.length > 0 ||
    selectedSources.length > 0 ||
    selectedSymbols.length > 0
      ? 'No data for selected filters'
      : 'No data available';

  return (
    <Card
      title='Compound Revenue'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px]',
        content: 'flex flex-col gap-3 px-10 pt-0 pb-10'
      }}
    >
      <div className='flex justify-end gap-3 px-0 py-3'>
        <div className='flex gap-2'>
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
          <MultiSelect
            options={symbolOptions || []}
            value={selectedSymbols}
            onChange={setSelectedSymbols}
            placeholder='Reserve Symbols'
            disabled={isLoading}
          />
        </div>
        <TabsGroup
          tabs={['D', 'W', 'M']}
          value={barSize}
          onTabChange={handleBarSizeChange}
          disabled={isLoading}
        />
        <TabsGroup
          tabs={['7B', '30B', '90B', '180B']}
          value={activeTab}
          onTabChange={handleTabChange}
          disabled={isLoading}
        />
      </div>
      <View.Condition if={!isLoading && !isError && hasData}>
        <div className='h-[400px]'>
          <CompoundRevenue
            data={processedChartData}
            barSize={barSize}
            barCountToSet={barCount}
            onVisibleBarsChange={handleVisibleBarsChange}
          />
        </div>
      </View.Condition>
      <View.Condition if={!isLoading && !isError && !hasData}>
        <NoDataPlaceholder
          onButtonClick={handleResetFilters}
          text={noDataMessage}
        />
      </View.Condition>
    </Card>
  );
};

export default CompoundRevenueBlock;
