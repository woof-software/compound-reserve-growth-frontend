import React, { memo, useCallback, useMemo, useReducer, useState } from 'react';

import {
  CompoundFeeReceivedChart,
  CompoundFeeRevenueReceivedFilters,
  CompoundFeeRevenueReceivedProps,
  groupByPathMapping,
  SelectedOptionsState
} from '@/entities/Revenue';
import {
  StackedChartData,
  useChartControls,
  useCompoundReceivedBars,
  useCSVExport,
  useModal
} from '@/shared/hooks';
import {
  capitalizeFirstLetter,
  getValueByPath
} from '@/shared/lib/utils/utils';
import { OptionType } from '@/shared/types/types';
import { Card, NoDataPlaceholder } from '@/shared/ui/molecules';

const CompoundFeeRevenueReceived = memo(
  ({
    revenueData: rawData,
    isLoading,
    isError
  }: CompoundFeeRevenueReceivedProps) => {
    const [groupBy, setGroupBy] = useState<string>('Chain');

    const { barSize, onBarSizeChange } = useChartControls({
      initialBarSize: 'D'
    });

    const initialState: SelectedOptionsState = useMemo(
      () => ({
        chain: [],
        market: [],
        symbol: [],
        assetType: []
      }),
      []
    );

    const [selectedOptions, setSelectedOptions] = useReducer(
      (
        prev: SelectedOptionsState,
        next: Partial<SelectedOptionsState>
      ): SelectedOptionsState => ({
        ...prev,
        ...next
      }),
      initialState
    );

    const {
      isOpen: isGroupByOpen,
      onOpenModal: onGroupByOpen,
      onCloseModal: onGroupByClose
    } = useModal();

    const onSelectGroupBy = useCallback(
      (value: string) => {
        setGroupBy(value);
        onGroupByClose();
      },
      [onGroupByClose]
    );

    const {
      chainOptions,
      marketOptions,
      symbolOptions,
      assetTypeOptions,
      chartData
    } = useMemo(() => {
      if (!rawData || rawData.length === 0) {
        return {
          chainOptions: [],
          marketOptions: [],
          symbolOptions: [],
          assetTypeOptions: [],
          chartData: []
        };
      }

      const selectedChainSet = new Set(selectedOptions.chain.map((c) => c.id));
      const selectedMarketSet = new Set(
        selectedOptions.market.map((m) => m.id)
      );
      const selectedSymbolSet = new Set(
        selectedOptions.symbol.map((s) => s.id)
      );
      const selectedAssetTypeSet = new Set(
        selectedOptions.assetType.map((a) => a.id)
      );

      const isChainFilterActive = selectedChainSet.size > 0;
      const isMarketFilterActive = selectedMarketSet.size > 0;
      const isSymbolFilterActive = selectedSymbolSet.size > 0;
      const isAssetTypeFilterActive = selectedAssetTypeSet.size > 0;

      const uniqueChains = new Set<string>();
      const uniqueMarkets = new Set<string>();
      const uniqueSymbols = new Set<string>();
      const uniqueAssetTypes = new Set<string>();
      const groupedByDate: { [date: string]: StackedChartData } = {};
      const groupByKeyPath = groupByPathMapping[groupBy];

      for (const item of rawData) {
        const network = item.source.network;
        const marketName = item.source.market ?? 'no name';
        const symbolName = item.source.asset.symbol;
        const assetTypeName = item.source.asset.type;

        uniqueChains.add(network);
        uniqueMarkets.add(marketName);
        uniqueSymbols.add(symbolName);
        uniqueAssetTypes.add(assetTypeName);

        const chainMatch =
          !isChainFilterActive || selectedChainSet.has(network);
        if (!chainMatch) continue;

        const marketMatch =
          !isMarketFilterActive || selectedMarketSet.has(marketName);
        if (!marketMatch) continue;

        const symbolMatch =
          !isSymbolFilterActive || selectedSymbolSet.has(symbolName);
        if (!symbolMatch) continue;

        const assetTypeMatch =
          !isAssetTypeFilterActive || selectedAssetTypeSet.has(assetTypeName);
        if (!assetTypeMatch) continue;

        const date = new Date(item.date * 1000).toISOString().split('T')[0];

        let seriesKey: string;
        if (groupBy === 'None') {
          seriesKey = 'Total';
        } else {
          seriesKey = getValueByPath(item, groupByKeyPath) || 'Unknown';
        }

        if (!groupedByDate[date]) {
          groupedByDate[date] = { date };
        }

        groupedByDate[date][seriesKey] =
          ((groupedByDate[date][seriesKey] as number) || 0) + item.value;
      }

      const createOptions = (
        uniqueValues: Set<string>,
        key?: string
      ): OptionType[] => {
        return Array.from(uniqueValues)
          .sort((a, b) => a.localeCompare(b))
          .map((value) => {
            const option: OptionType = {
              id: value,
              label: capitalizeFirstLetter(value)
            };

            if (key === 'market') {
              const matches =
                value === 'no name'
                  ? rawData.filter((item) => item.source?.market == null)
                  : rawData.filter((item) => item.source?.market === value);

              option.marketType = matches[0]?.source.type.split(' ')[1] ?? '';
              option.chain = Array.from(
                new Set(matches.map((item) => item.source.network))
              );
            }

            return option;
          });
      };

      const finalChartData = Object.values(groupedByDate).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      return {
        chainOptions: createOptions(uniqueChains),
        symbolOptions: createOptions(uniqueSymbols),
        assetTypeOptions: createOptions(uniqueAssetTypes),
        marketOptions: createOptions(uniqueMarkets, 'market'),
        chartData: finalChartData
      };
    }, [rawData, selectedOptions, groupBy]);

    const { csvData, csvFilename } = useCSVExport({
      stackedData: chartData,
      barSize,
      groupBy,
      filePrefix: 'Compound_Fee_Revenue',
      aggregationType: 'sum',
      rawData,
      selectedChains: selectedOptions.chain,
      selectedMarkets: selectedOptions.market,
      groupByPathMapping,
      getValueByPath
    });

    const {
      chartRef,
      seriesData,
      aggregatedData,
      areAllSeriesHidden,
      hiddenItems,
      toggleSeriesByName,
      onSelectAll,
      onDeselectAll
    } = useCompoundReceivedBars({
      barSize,
      data: chartData
    });

    const deploymentOptionsFilter = useMemo(() => {
      const marketV2 =
        marketOptions
          ?.filter((el) => el.marketType?.toLowerCase() === 'v2')
          .sort((a, b) => a.label.localeCompare(b.label)) || [];

      const marketV3 =
        marketOptions
          ?.filter((el) => el.marketType?.toLowerCase() === 'v3')
          .sort((a, b) => a.label.localeCompare(b.label)) || [];

      const noMarkets = marketOptions?.find(
        (el) => el.id.toLowerCase() === 'no name'
      );

      const selectedChainIds = selectedOptions.chain.map((o) => o.id);

      let allMarkets = [...marketV3, ...marketV2];

      if (noMarkets) {
        allMarkets = [...allMarkets, noMarkets];
      }

      if (selectedChainIds.length) {
        return allMarkets.filter(
          (el) => el.chain?.some((c) => selectedChainIds.includes(c)) ?? false
        );
      }

      return allMarkets;
    }, [marketOptions, selectedOptions]);

    const hasData = chartData.length > 0;
    const noDataMessage =
      selectedOptions.chain.length > 0 ||
      selectedOptions.market.length > 0 ||
      selectedOptions.symbol.length > 0 ||
      selectedOptions.assetType.length > 0
        ? 'No data for selected filters'
        : 'No data available';

    const onSelectChain = useCallback(
      (chain: OptionType[]) => {
        const selectedChainIds = chain.map((o) => o.id);

        const filteredDeployment = selectedOptions.market.filter((el) =>
          selectedChainIds.length === 0
            ? true
            : (el.chain?.some((c) => selectedChainIds.includes(c)) ?? false)
        );
        setSelectedOptions({ chain, market: filteredDeployment });
      },
      [selectedOptions.market]
    );

    const onSelectMarket = useCallback((options: OptionType[]) => {
      setSelectedOptions({ market: options });
    }, []);

    const onSelectSymbol = useCallback((options: OptionType[]) => {
      setSelectedOptions({ symbol: options });
    }, []);

    const onSelectAssetType = useCallback((options: OptionType[]) => {
      setSelectedOptions({ assetType: options });
    }, []);

    const onResetFilters = useCallback(() => {
      setSelectedOptions(initialState);

      setGroupBy('Chain');
    }, [initialState]);

    return (
      <Card
        title='Compound Fee Revenue Received'
        id='Compound Fee Revenue Received'
        isLoading={isLoading}
        isError={isError}
        className={{
          loading: 'min-h-[inherit]',
          container: 'border-background min-h-[571px] border',
          content: 'flex flex-col gap-3 p-0 pb-5 md:px-5 lg:px-10 lg:pb-10'
        }}
      >
        <CompoundFeeRevenueReceivedFilters
          groupBy={groupBy}
          areAllSeriesHidden={areAllSeriesHidden}
          isShowEyeIcon={Boolean(seriesData.length > 1)}
          assetTypeOptions={assetTypeOptions}
          selectedOptions={selectedOptions}
          chainOptions={chainOptions}
          symbolOptions={symbolOptions}
          deploymentOptionsFilter={deploymentOptionsFilter}
          isLoading={isLoading || false}
          barSize={barSize}
          csvData={csvData}
          csvFilename={csvFilename}
          openSingle={isGroupByOpen}
          onSelectChain={onSelectChain}
          onSelectAssetType={onSelectAssetType}
          onSelectMarket={onSelectMarket}
          onSelectSymbol={onSelectSymbol}
          onBarSizeChange={onBarSizeChange}
          toggleSingle={onGroupByOpen}
          closeSingle={onGroupByClose}
          selectSingle={onSelectGroupBy}
          onClearAll={onResetFilters}
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
        />
        {!isLoading && !isError && !hasData ? (
          <NoDataPlaceholder
            onButtonClick={onResetFilters}
            text={noDataMessage}
          />
        ) : (
          <CompoundFeeReceivedChart
            chartRef={chartRef}
            hiddenItems={hiddenItems}
            areAllSeriesHidden={areAllSeriesHidden}
            groupBy={groupBy}
            barSize={barSize}
            seriesData={seriesData}
            aggregatedData={aggregatedData}
            toggleSeriesByName={toggleSeriesByName}
            onSelectAll={onSelectAll}
            onDeselectAll={onDeselectAll}
          />
        )}
      </Card>
    );
  }
);

export { CompoundFeeRevenueReceived };
